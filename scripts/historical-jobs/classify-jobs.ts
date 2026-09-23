import { createReadStream, createWriteStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { once } from 'node:events'
import readline from 'node:readline'
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

  const classificationStream = createWriteStream(path.join(output, 'job-classifications.jsonl'), { encoding: 'utf8' })
  const solarUsStream = createWriteStream(path.join(output, 'solar-us-jobs.jsonl'), { encoding: 'utf8' })

  let parsedJobs = 0
  let solarUsJobs = 0
  let notSolarRelated = 0
  let notUsOrUnknown = 0

  const input = createReadStream(path.join(root, 'parsed-jobs.jsonl'), { encoding: 'utf8' })
  const lines = readline.createInterface({ input, crlfDelay: Infinity })

  for await (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    const job = JSON.parse(line) as ParsedHistoricalJob
    parsedJobs += 1

    const classification = classifyParsedHistoricalJob(job)
    await writeJsonLine(classificationStream, classification)

    if (classification.rejectionReason === 'not_solar_related') notSolarRelated += 1
    if (classification.rejectionReason === 'not_us_or_unknown') notUsOrUnknown += 1

    if (classification.isUsJob && classification.isSolarRelated) {
      solarUsJobs += 1
      await writeJsonLine(solarUsStream, job)
    }

    if (parsedJobs % 5000 === 0) {
      console.log(`[classify] ${parsedJobs} jobs | ${solarUsJobs} solar+US`)
    }
  }

  await Promise.all([
    finishStream(classificationStream),
    finishStream(solarUsStream),
  ])

  const report = {
    classifierVersion: HISTORICAL_CLASSIFIER_VERSION,
    parsedJobs,
    solarUsJobs,
    notSolarRelated,
    notUsOrUnknown,
  }
  await writeFile(path.join(output, 'classification-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
