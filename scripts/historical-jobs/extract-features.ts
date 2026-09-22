import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  buildHistoricalJobFeatures,
  HISTORICAL_TAXONOMY_VERSION,
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
  const body = await readFile(path.join(root, 'solar-us-jobs.jsonl'), 'utf8')
  const jobs = body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as ParsedHistoricalJob)
  const features = jobs.map(buildHistoricalJobFeatures)
  await writeFile(path.join(output, 'solar-us-job-features.jsonl'), features.map((row) => `${JSON.stringify(row)}\n`).join(''))
  await writeFile(path.join(output, 'features-report.json'), `${JSON.stringify({
    taxonomyVersion: HISTORICAL_TAXONOMY_VERSION,
    jobs: jobs.length,
    features: features.length,
  }, null, 2)}\n`)
  console.log(JSON.stringify({ jobs: jobs.length, taxonomyVersion: HISTORICAL_TAXONOMY_VERSION }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
