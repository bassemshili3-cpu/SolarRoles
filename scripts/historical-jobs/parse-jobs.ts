import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  HISTORICAL_PARSER_VERSION,
  parseHistoricalJobHtmlDetailed,
  sha256,
  type CommonCrawlRecord,
  type HistoricalEmployer,
  type ParsedHistoricalJob,
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

async function readJsonLines<T>(filename: string) {
  const body = await readFile(filename, 'utf8')
  return body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T)
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/benchmark-2020-29'))
  const output = path.resolve(arg(args, '--output', root))
  const registryPath = arg(args, '--registry', 'data/common-crawl-historical-jobs/employers.json')
  await mkdir(output, { recursive: true })

  const registry = JSON.parse(await readFile(registryPath, 'utf8')) as HistoricalEmployer[]
  const employers = new Map(registry.map((employer) => [employer.employerId, employer]))
  const indexed = await readJsonLines<IndexedCapture>(path.join(root, 'index-records.jsonl'))

  const observations: Array<Record<string, unknown>> = []
  const parseResults: Array<Record<string, unknown>> = []
  const jobs = new Map<string, ParsedHistoricalJob>()

  for (const capture of indexed) {
    const employer = employers.get(capture.employerId)
    if (!employer) continue
    const captureId = sha256(`${capture.crawlId}|${capture.timestamp}|${capture.url}|${capture.digest}`)
    const htmlPath = path.join(root, 'html', `${captureId}.html`)
    try {
      const html = await readFile(htmlPath, 'utf8')
      const parsed = parseHistoricalJobHtmlDetailed(html, capture.url, employer)
      const job = parsed.job
      if (job) {
        jobs.set(job.historicalJobId, job)
        observations.push({
          captureId,
          crawlId: capture.crawlId,
          captureTimestamp: capture.timestamp,
          digest: capture.digest,
          warcFilename: capture.filename,
          warcOffset: Number(capture.offset),
          warcLength: Number(capture.length),
          ...job,
        })
      }
      parseResults.push({
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
      parseResults.push({
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

  const distinctJobs = [...jobs.values()]
  await writeFile(path.join(output, 'parsed-job-observations.jsonl'), observations.map((row) => `${JSON.stringify(row)}\n`).join(''))
  await writeFile(path.join(output, 'parsed-jobs.jsonl'), distinctJobs.map((row) => `${JSON.stringify(row)}\n`).join(''))
  await writeFile(path.join(output, 'parse-results.jsonl'), parseResults.map((row) => `${JSON.stringify(row)}\n`).join(''))
  await writeFile(path.join(output, 'parse-report.json'), `${JSON.stringify({
    parserVersion: HISTORICAL_PARSER_VERSION,
    indexedCaptures: indexed.length,
    parsedJobObservations: observations.length,
    distinctParsedJobs: distinctJobs.length,
    parseFailuresOrMissingHtml: parseResults.filter((row) => row.parseStatus === 'html_missing_or_parse_failed').length,
  }, null, 2)}\n`)
  console.log(JSON.stringify({ parsedJobObservations: observations.length, distinctParsedJobs: distinctJobs.length }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
