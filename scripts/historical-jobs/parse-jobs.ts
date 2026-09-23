import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { once } from 'node:events'
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

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

async function writeJsonLine(stream: ReturnType<typeof createWriteStream>, value: unknown) {
  if (!stream.write(`${JSON.stringify(value)}\n`)) await once(stream, 'drain')
}

async function finishStream(stream: ReturnType<typeof createWriteStream>) {
  stream.end()
  await once(stream, 'finish')
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/benchmark-2020-29'))
  const output = path.resolve(arg(args, '--output', root))
  const registryPath = arg(args, '--registry', 'data/common-crawl-historical-jobs/employers.json')
  const manifestName = arg(args, '--manifest', 'index-records.jsonl')
  await mkdir(output, { recursive: true })

  const registry = JSON.parse(await readFile(registryPath, 'utf8')) as HistoricalEmployer[]
  const employers = new Map(registry.map((employer) => [employer.employerId, employer]))

  const observationsStream = createWriteStream(path.join(output, 'parsed-job-observations.jsonl'), { encoding: 'utf8' })
  const jobsStream = createWriteStream(path.join(output, 'parsed-jobs.jsonl'), { encoding: 'utf8' })
  const resultsStream = createWriteStream(path.join(output, 'parse-results.jsonl'), { encoding: 'utf8' })

  const seenJobs = new Set<string>()
  let indexedCaptures = 0
  let parsedJobObservations = 0
  let distinctParsedJobs = 0
  let parseFailuresOrMissingHtml = 0

  const input = createReadStream(path.join(root, manifestName), { encoding: 'utf8' })
  const lines = readline.createInterface({ input, crlfDelay: Infinity })

  for await (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    indexedCaptures += 1
    const capture = JSON.parse(line) as IndexedCapture
    const employer = employers.get(capture.employerId)
    if (!employer) continue

    const captureId = sha256(`${capture.crawlId}|${capture.timestamp}|${capture.url}|${capture.digest}`)
    const htmlPath = path.join(root, 'html', `${captureId}.html`)

    try {
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

    if (indexedCaptures % 1000 === 0) {
      console.log(`[parse] ${indexedCaptures} captures | ${parsedJobObservations} parsed observations | ${distinctParsedJobs} distinct jobs`)
    }
  }

  await Promise.all([
    finishStream(observationsStream),
    finishStream(jobsStream),
    finishStream(resultsStream),
  ])

  const report = {
    parserVersion: HISTORICAL_PARSER_VERSION,
    manifest: manifestName,
    indexedCaptures,
    parsedJobObservations,
    distinctParsedJobs,
    parseFailuresOrMissingHtml,
  }
  await import('node:fs/promises').then(({ writeFile }) =>
    writeFile(path.join(output, 'parse-report.json'), `${JSON.stringify(report, null, 2)}\n`),
  )
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
