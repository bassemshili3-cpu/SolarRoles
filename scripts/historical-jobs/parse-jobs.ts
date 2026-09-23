import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { once } from 'node:events'
import { spawn } from 'node:child_process'
import readline from 'node:readline'
import path from 'node:path'
import {
  HISTORICAL_PARSER_VERSION,
  parseHistoricalJobHtmlDetailed,
  sha256,
  type CommonCrawlRecord,
  type HistoricalEmployer,
} from '../../lib/historical-jobs/commonCrawl'

interface IndexedCapture extends CommonCrawlRecord {
  crawlId: string
  year: number
  employerId: string
}

interface WorkerReport {
  start: number
  limit: number
  indexedCaptures: number
  parsedJobObservations: number
  distinctParsedJobs: number
  parseFailuresOrMissingHtml: number
}

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function intArg(args: string[], flag: string, fallback: number) {
  const value = Number(arg(args, flag, String(fallback)))
  if (!Number.isInteger(value) || value < 0) throw new Error(`Invalid ${flag}`)
  return value
}

async function writeJsonLine(stream: ReturnType<typeof createWriteStream>, value: unknown) {
  if (!stream.write(`${JSON.stringify(value)}\n`)) await once(stream, 'drain')
}

async function finishStream(stream: ReturnType<typeof createWriteStream>) {
  stream.end()
  await once(stream, 'finish')
}

async function countJsonLines(filename: string) {
  let count = 0
  const input = createReadStream(filename, { encoding: 'utf8' })
  const lines = readline.createInterface({ input, crlfDelay: Infinity })
  for await (const rawLine of lines) {
    if (rawLine.trim()) count += 1
  }
  return count
}

async function streamCopy(source: string, destination: ReturnType<typeof createWriteStream>) {
  const input = createReadStream(source, { encoding: 'utf8' })
  const lines = readline.createInterface({ input, crlfDelay: Infinity })
  for await (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (!destination.write(`${line}\n`)) await once(destination, 'drain')
  }
}

async function runWorker() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/benchmark-2020-29'))
  const registryPath = arg(args, '--registry', 'data/common-crawl-historical-jobs/employers.json')
  const manifestName = arg(args, '--manifest', 'index-records.jsonl')
  const chunkDir = path.resolve(arg(args, '--chunk-dir'))
  const start = intArg(args, '--start', 0)
  const limit = intArg(args, '--limit', 100)
  const chunkId = arg(args, '--chunk-id', String(start).padStart(8, '0'))

  await mkdir(chunkDir, { recursive: true })

  const registry = JSON.parse(await readFile(registryPath, 'utf8')) as HistoricalEmployer[]
  const employers = new Map(registry.map((employer) => [employer.employerId, employer]))

  const observationsPath = path.join(chunkDir, `chunk-${chunkId}-observations.jsonl`)
  const jobsPath = path.join(chunkDir, `chunk-${chunkId}-jobs.jsonl`)
  const resultsPath = path.join(chunkDir, `chunk-${chunkId}-results.jsonl`)
  const reportPath = path.join(chunkDir, `chunk-${chunkId}-report.json`)

  const observationsTemp = `${observationsPath}.tmp`
  const jobsTemp = `${jobsPath}.tmp`
  const resultsTemp = `${resultsPath}.tmp`
  await Promise.all([observationsTemp, jobsTemp, resultsTemp].map((filename) => rm(filename, { force: true })))

  const observationsStream = createWriteStream(observationsTemp, { encoding: 'utf8' })
  const jobsStream = createWriteStream(jobsTemp, { encoding: 'utf8' })
  const resultsStream = createWriteStream(resultsTemp, { encoding: 'utf8' })

  const seenJobs = new Set<string>()
  let absoluteIndex = 0
  let indexedCaptures = 0
  let parsedJobObservations = 0
  let distinctParsedJobs = 0
  let parseFailuresOrMissingHtml = 0

  const input = createReadStream(path.join(root, manifestName), { encoding: 'utf8' })
  const lines = readline.createInterface({ input, crlfDelay: Infinity })

  for await (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (absoluteIndex < start) {
      absoluteIndex += 1
      continue
    }
    if (indexedCaptures >= limit) break

    absoluteIndex += 1
    indexedCaptures += 1
    const capture = JSON.parse(line) as IndexedCapture
    const employer = employers.get(capture.employerId)
    if (!employer) continue

    const captureId = sha256(`${capture.crawlId}|${capture.timestamp}|${capture.url}|${capture.digest}`)
    const htmlPath = path.join(root, 'html', `${captureId}.html`)

    if (indexedCaptures === 1 || indexedCaptures % 25 === 0 || indexedCaptures === limit) {
      const memory = process.memoryUsage()
      const mb = (bytes: number) => Math.round(bytes / 1024 / 1024)
      console.log(
        `[parse-worker] progress=${indexedCaptures}/${limit} rss=${mb(memory.rss)}MB heap=${mb(memory.heapUsed)}MB external=${mb(memory.external)}MB`,
      )
    }

    try {
      const htmlStat = await stat(htmlPath)
      if (htmlStat.size >= 8 * 1024 * 1024) {
        console.warn(`[parse-worker] large HTML ${Math.round(htmlStat.size / 1024 / 1024)}MB: ${capture.url}`)
      }
      const html = await readFile(htmlPath, 'utf8')
      const parsed = parseHistoricalJobHtmlDetailed(html, capture.url, employer)
      const job = parsed.job

      if (job) {
        parsedJobObservations += 1
        await writeJsonLine(observationsStream, {
          captureId,
          crawlId: capture.crawlId,
          captureTimestamp: capture.timestamp,
          digest: capture.digest,
          warcFilename: capture.filename,
          warcOffset: Number(capture.offset),
          warcLength: Number(capture.length),
          ...job,
        })

        if (!seenJobs.has(job.historicalJobId)) {
          seenJobs.add(job.historicalJobId)
          distinctParsedJobs += 1
          await writeJsonLine(jobsStream, job)
        }
      }

      await writeJsonLine(resultsStream, {
        captureId,
        crawlId: capture.crawlId,
        employerId: capture.employerId,
        sourceUrl: capture.url,
        parsedHistoricalJobId: job?.historicalJobId ?? null,
        isJobPage: parsed.isJobPage,
        parserVersion: HISTORICAL_PARSER_VERSION,
        parseStatus: job ? 'parsed_job' : 'not_job_page',
      })
    } catch (error) {
      parseFailuresOrMissingHtml += 1
      await writeJsonLine(resultsStream, {
        captureId,
        crawlId: capture.crawlId,
        employerId: capture.employerId,
        sourceUrl: capture.url,
        parsedHistoricalJobId: null,
        isJobPage: false,
        parserVersion: HISTORICAL_PARSER_VERSION,
        parseStatus: 'html_missing_or_parse_failed',
        error: String(error),
      })
    }
  }

  await Promise.all([
    finishStream(observationsStream),
    finishStream(jobsStream),
    finishStream(resultsStream),
  ])
  await Promise.all([
    rename(observationsTemp, observationsPath),
    rename(jobsTemp, jobsPath),
    rename(resultsTemp, resultsPath),
  ])

  const report: WorkerReport = {
    start,
    limit,
    indexedCaptures,
    parsedJobObservations,
    distinctParsedJobs,
    parseFailuresOrMissingHtml,
  }
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(`[parse-worker] start=${start} processed=${indexedCaptures} parsed=${parsedJobObservations} distinct=${distinctParsedJobs}`)
}

async function runChild(args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [...process.execArgv, process.argv[1], ...args, '--worker'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env,
      windowsHide: true,
    })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Parser worker exited with code ${code}`)))
  })
}

async function main() {
  const args = process.argv.slice(2)
  if (args.includes('--worker')) {
    await runWorker()
    return
  }

  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/benchmark-2020-29'))
  const output = path.resolve(arg(args, '--output', root))
  const registryPath = path.resolve(arg(args, '--registry', 'data/common-crawl-historical-jobs/employers.json'))
  const manifestName = arg(args, '--manifest', 'index-records.jsonl')
  const batchSize = Math.max(25, intArg(args, '--batch-size', 100))
  await mkdir(output, { recursive: true })

  const manifestPath = path.join(root, manifestName)
  const [manifestStat, registryStat] = await Promise.all([stat(manifestPath), stat(registryPath)])
  const fingerprint = sha256([
    HISTORICAL_PARSER_VERSION,
    manifestName,
    manifestStat.size,
    manifestStat.mtimeMs,
    registryStat.size,
    registryStat.mtimeMs,
    batchSize,
  ].join('|'))

  const chunkDir = path.join(output, 'parse-chunks')
  const statePath = path.join(chunkDir, 'state.json')
  let reusable = false
  try {
    const previous = JSON.parse(await readFile(statePath, 'utf8')) as { fingerprint?: string }
    reusable = previous.fingerprint === fingerprint
  } catch {
    reusable = false
  }

  if (!reusable) {
    await rm(chunkDir, { recursive: true, force: true })
    await mkdir(chunkDir, { recursive: true })
    await writeFile(statePath, `${JSON.stringify({ fingerprint, manifestName, batchSize }, null, 2)}\n`, 'utf8')
  } else {
    await mkdir(chunkDir, { recursive: true })
  }

  const totalCaptures = await countJsonLines(manifestPath)
  const batchCount = Math.ceil(totalCaptures / batchSize)
  console.log(`[parse] ${totalCaptures} captures | batchSize=${batchSize} | ${batchCount} isolated worker(s)`)

  const workerReports: WorkerReport[] = []

  for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
    const start = batchIndex * batchSize
    const limit = Math.min(batchSize, totalCaptures - start)
    const chunkId = String(batchIndex + 1).padStart(4, '0')
    const reportPath = path.join(chunkDir, `chunk-${chunkId}-report.json`)

    try {
      const cached = JSON.parse(await readFile(reportPath, 'utf8')) as WorkerReport
      if (cached.start === start && cached.limit === limit && cached.indexedCaptures === limit) {
        workerReports.push(cached)
        console.log(`[parse] batch ${batchIndex + 1}/${batchCount}: cached`)
        continue
      }
    } catch {
      // Missing or incomplete chunk: run it.
    }

    console.log(`[parse] batch ${batchIndex + 1}/${batchCount}: processing captures ${start + 1}-${start + limit}`)
    await runChild([
      '--input', root,
      '--registry', registryPath,
      '--manifest', manifestName,
      '--chunk-dir', chunkDir,
      '--chunk-id', chunkId,
      '--start', String(start),
      '--limit', String(limit),
    ])
    workerReports.push(JSON.parse(await readFile(reportPath, 'utf8')) as WorkerReport)
  }

  const observationsPath = path.join(output, 'parsed-job-observations.jsonl')
  const jobsPath = path.join(output, 'parsed-jobs.jsonl')
  const resultsPath = path.join(output, 'parse-results.jsonl')
  const observationsTemp = `${observationsPath}.tmp`
  const jobsTemp = `${jobsPath}.tmp`
  const resultsTemp = `${resultsPath}.tmp`
  await Promise.all([observationsTemp, jobsTemp, resultsTemp].map((filename) => rm(filename, { force: true })))

  const observationsStream = createWriteStream(observationsTemp, { encoding: 'utf8' })
  const jobsStream = createWriteStream(jobsTemp, { encoding: 'utf8' })
  const resultsStream = createWriteStream(resultsTemp, { encoding: 'utf8' })
  const seenJobs = new Set<string>()
  let distinctParsedJobs = 0

  for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
    const chunkId = String(batchIndex + 1).padStart(4, '0')
    await streamCopy(path.join(chunkDir, `chunk-${chunkId}-observations.jsonl`), observationsStream)
    await streamCopy(path.join(chunkDir, `chunk-${chunkId}-results.jsonl`), resultsStream)

    const input = createReadStream(path.join(chunkDir, `chunk-${chunkId}-jobs.jsonl`), { encoding: 'utf8' })
    const lines = readline.createInterface({ input, crlfDelay: Infinity })
    for await (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line) continue
      const job = JSON.parse(line) as { historicalJobId: string }
      if (seenJobs.has(job.historicalJobId)) continue
      seenJobs.add(job.historicalJobId)
      distinctParsedJobs += 1
      if (!jobsStream.write(`${line}\n`)) await once(jobsStream, 'drain')
    }
  }

  await Promise.all([
    finishStream(observationsStream),
    finishStream(jobsStream),
    finishStream(resultsStream),
  ])
  await Promise.all([
    rename(observationsTemp, observationsPath),
    rename(jobsTemp, jobsPath),
    rename(resultsTemp, resultsPath),
  ])

  const report = {
    parserVersion: HISTORICAL_PARSER_VERSION,
    manifest: manifestName,
    indexedCaptures: workerReports.reduce((sum, row) => sum + row.indexedCaptures, 0),
    parsedJobObservations: workerReports.reduce((sum, row) => sum + row.parsedJobObservations, 0),
    distinctParsedJobs,
    parseFailuresOrMissingHtml: workerReports.reduce((sum, row) => sum + row.parseFailuresOrMissingHtml, 0),
    batchSize,
    isolatedWorkers: batchCount,
  }
  await writeFile(path.join(output, 'parse-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))

  await rm(chunkDir, { recursive: true, force: true })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
