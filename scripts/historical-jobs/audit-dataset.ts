import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { HistoricalJobClassification, ParsedHistoricalJob } from '../../lib/historical-jobs/commonCrawl'

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function numberArg(args: string[], flag: string, fallback: number) {
  const value = Number(arg(args, flag, String(fallback)))
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function spreadSample<T>(rows: T[], limit: number) {
  if (!limit || rows.length <= limit) return rows
  if (limit === 1) return [rows[Math.floor(rows.length / 2)]]
  const indexes = new Set(Array.from({ length: limit }, (_, index) => Math.round(index * (rows.length - 1) / (limit - 1))))
  return [...indexes].map((index) => rows[index])
}

async function readJsonLines<T>(filename: string) {
  const body = await readFile(filename, 'utf8')
  return body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T)
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/benchmark-2020-29'))
  const positiveSampleSize = numberArg(args, '--positive-sample', 50)
  const negativeSampleSize = numberArg(args, '--negative-sample', 100)

  const jobs = await readJsonLines<ParsedHistoricalJob>(path.join(root, 'parsed-jobs.jsonl'))
  const classifications = await readJsonLines<HistoricalJobClassification>(path.join(root, 'job-classifications.jsonl'))
  const byId = new Map(classifications.map((row) => [row.historicalJobId, row]))
  const positives = jobs.filter((job) => {
    const row = byId.get(job.historicalJobId)
    return row?.isUsJob && row.isSolarRelated
  })
  const negatives = jobs.filter((job) => !byId.get(job.historicalJobId)?.isSolarRelated)

  const employerCounts = Object.fromEntries(
    [...new Set(positives.map((job) => job.employerName))].sort().map((employer) => [
      employer,
      positives.filter((job) => job.employerName === employer).length,
    ]),
  )

  const report = {
    generatedAt: new Date().toISOString(),
    parsedJobs: jobs.length,
    classifiedRows: classifications.length,
    solarUsJobs: positives.length,
    employersRepresented: Object.keys(employerCounts).length,
    employerCounts,
    rejectionReasons: Object.fromEntries(
      [...new Set(classifications.map((row) => row.rejectionReason).filter(Boolean))].map((reason) => [
        reason,
        classifications.filter((row) => row.rejectionReason === reason).length,
      ]),
    ),
    positiveManualReviewRows: Math.min(positiveSampleSize, positives.length),
    negativeManualReviewRows: Math.min(negativeSampleSize, negatives.length),
  }
  await writeFile(path.join(root, 'audit-report.json'), `${JSON.stringify(report, null, 2)}\n`)

  const header = ['sample_type', 'historical_job_id', 'employer', 'title', 'location', 'source_url', 'description_excerpt', 'review_outcome', 'review_reason']
  const positiveSample = spreadSample(positives, positiveSampleSize).map((job) => ['positive', job] as const)
  const negativeSample = spreadSample(negatives, negativeSampleSize).map((job) => ['negative', job] as const)
  const rows = [...positiveSample, ...negativeSample].map(([sampleType, item]) => [
    sampleType,
    item.historicalJobId,
    item.employerName,
    item.title,
    item.locationRaw,
    item.sourceUrl,
    item.descriptionText.slice(0, 800),
    '',
    '',
  ].map(csvCell).join(','))
  await writeFile(path.join(root, 'dataset-manual-review.csv'), `${[header.map(csvCell).join(','), ...rows].join('\n')}\n`)
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
