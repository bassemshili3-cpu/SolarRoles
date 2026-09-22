import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  classifyParsedHistoricalJob,
  HISTORICAL_CLASSIFIER_VERSION,
  type ParsedHistoricalJob,
} from '../../lib/historical-jobs/commonCrawl'

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/benchmark-2020-29'))
  const output = path.resolve(arg(args, '--output', root))
  const body = await readFile(path.join(root, 'parsed-jobs.jsonl'), 'utf8')
  const jobs = body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as ParsedHistoricalJob)

  const classifications = jobs.map(classifyParsedHistoricalJob)
  const classificationById = new Map(classifications.map((classification) => [classification.historicalJobId, classification]))
  const solarUsJobs = jobs.filter((job) => {
    const classification = classificationById.get(job.historicalJobId)
    return classification?.isUsJob && classification.isSolarRelated
  })

  await writeFile(path.join(output, 'job-classifications.jsonl'), classifications.map((row) => `${JSON.stringify(row)}\n`).join(''))
  await writeFile(path.join(output, 'solar-us-jobs.jsonl'), solarUsJobs.map((row) => `${JSON.stringify(row)}\n`).join(''))
  await writeFile(path.join(output, 'classification-report.json'), `${JSON.stringify({
    classifierVersion: HISTORICAL_CLASSIFIER_VERSION,
    parsedJobs: jobs.length,
    solarUsJobs: solarUsJobs.length,
    notSolarRelated: classifications.filter((row) => row.rejectionReason === 'not_solar_related').length,
    notUsOrUnknown: classifications.filter((row) => row.rejectionReason === 'not_us_or_unknown').length,
  }, null, 2)}\n`)
  console.log(JSON.stringify({ parsedJobs: jobs.length, solarUsJobs: solarUsJobs.length, classifierVersion: HISTORICAL_CLASSIFIER_VERSION }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
