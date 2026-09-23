import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  HistoricalEmployer,
  HistoricalJobClassification,
  ParsedHistoricalJob,
} from '../../lib/historical-jobs/commonCrawl'

interface SourceCandidate {
  provider: string
  sourceKey: string
  sourcePattern: string
  host: string
  captures: number
  solarUrlHits: number
  firstSeen: string
  lastSeen: string
  samples: unknown[]
}

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

async function readJsonLines<T>(filename: string) {
  const body = await readFile(filename, 'utf8')
  return body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T)
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function normalizeName(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\b(?:inc\.?|llc|ltd\.?|corp\.?|corporation|company|co\.?)$/i, '')
    .trim()
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/employer-discovery-2020'))
  const minDeepSampleCaptures = Number(arg(args, '--deep-sample-threshold', '25'))

  const sources = await readJsonLines<SourceCandidate>(path.join(root, 'source-candidates.jsonl'))
  const provisional = JSON.parse(await readFile(path.join(root, 'provisional-employers.json'), 'utf8')) as HistoricalEmployer[]
  const jobs = await readJsonLines<ParsedHistoricalJob>(path.join(root, 'parsed-jobs.jsonl'))
  const classifications = await readJsonLines<HistoricalJobClassification>(path.join(root, 'job-classifications.jsonl'))

  const classificationByJob = new Map(classifications.map((row) => [row.historicalJobId, row]))
  const jobsByEmployer = new Map<string, ParsedHistoricalJob[]>()
  for (const job of jobs) {
    const list = jobsByEmployer.get(job.employerId) ?? []
    list.push(job)
    jobsByEmployer.set(job.employerId, list)
  }

  const sourceByPattern = new Map(sources.map((source) => [source.sourcePattern, source]))
  const rows = provisional.map((employer) => {
    const source = sourceByPattern.get(employer.patterns[0])
    const employerJobs = jobsByEmployer.get(employer.employerId) ?? []
    const classified = employerJobs.map((job) => ({
      job,
      classification: classificationByJob.get(job.historicalJobId),
    }))
    const solarJobs = classified.filter((row) => row.classification?.isSolarRelated)
    const usJobs = classified.filter((row) => row.classification?.isUsJob)
    const solarUsJobs = classified.filter((row) => row.classification?.isSolarRelated && row.classification?.isUsJob)

    const inferredNames = solarUsJobs
      .map(({ job }) => job.hiringOrganizationName)
      .filter((value): value is string => Boolean(value && value.trim()))
      .map(normalizeName)
    const inferredEmployerName = inferredNames[0] || employer.employerName

    let status = 'sample_parse_failed_or_not_job'
    if (solarUsJobs.length) status = 'validated_solar_us_source'
    else if (solarJobs.length) status = 'solar_non_us_or_unknown'
    else if (employerJobs.length) status = 'parsed_no_solar_hit'

    const captures = Number(source?.captures) || 0
    const solarUrlHits = Number(source?.solarUrlHits) || 0
    const needsDeepSample =
      status !== 'validated_solar_us_source'
      && (
        solarUrlHits > 0
        || captures >= minDeepSampleCaptures
      )

    return {
      employerId: employer.employerId,
      provisionalEmployerName: employer.employerName,
      inferredEmployerName,
      provider: source?.provider ?? employer.atsProvider,
      sourceKey: source?.sourceKey ?? '',
      pattern: employer.patterns[0],
      captures,
      solarUrlHits,
      parsedJobs: employerJobs.length,
      solarJobs: solarJobs.length,
      usJobs: usJobs.length,
      solarUsJobs: solarUsJobs.length,
      status,
      needsDeepSample,
      sampleTitles: employerJobs.slice(0, 8).map((job) => job.title),
      solarUsTitles: solarUsJobs.slice(0, 8).map(({ job }) => job.title),
    }
  })

  const validated = rows.filter((row) => row.status === 'validated_solar_us_source')
  const deepSample = rows.filter((row) => row.needsDeepSample)

  const discoveredEmployers = validated.map((row) => ({
    employerId: row.employerId,
    employerName: row.inferredEmployerName,
    atsProvider: row.provider,
    patterns: [row.pattern],
    notes: `Discovered from Common Crawl employer discovery. Evidence: ${row.solarUsJobs} sampled US solar job(s), ${row.captures} indexed job-like capture(s). sourceKey=${row.sourceKey}`,
  }))

  const header = [
    'employer_id', 'provisional_name', 'inferred_name', 'provider', 'source_key', 'pattern',
    'captures', 'solar_url_hits', 'parsed_jobs', 'solar_jobs', 'us_jobs', 'solar_us_jobs',
    'status', 'needs_deep_sample', 'sample_titles', 'solar_us_titles', 'manual_decision', 'notes',
  ]
  const csvRows = rows.map((row) => [
    row.employerId,
    row.provisionalEmployerName,
    row.inferredEmployerName,
    row.provider,
    row.sourceKey,
    row.pattern,
    row.captures,
    row.solarUrlHits,
    row.parsedJobs,
    row.solarJobs,
    row.usJobs,
    row.solarUsJobs,
    row.status,
    row.needsDeepSample,
    row.sampleTitles.join(' | '),
    row.solarUsTitles.join(' | '),
    '',
    '',
  ])

  await writeFile(path.join(root, 'discovered-employers.json'), `${JSON.stringify(discoveredEmployers, null, 2)}\n`, 'utf8')
  await writeFile(path.join(root, 'employer-discovery-validation.csv'), [
    header.map(csvCell).join(','),
    ...csvRows.map((row) => row.map(csvCell).join(',')),
  ].join('\n') + '\n', 'utf8')
  await writeFile(path.join(root, 'deep-sample-candidates.json'), `${JSON.stringify(deepSample, null, 2)}\n`, 'utf8')

  const report = {
    generatedAt: new Date().toISOString(),
    sourceCandidates: rows.length,
    parsedSources: rows.filter((row) => row.parsedJobs > 0).length,
    validatedSolarUsSources: validated.length,
    solarButNotUsOrUnknownSources: rows.filter((row) => row.status === 'solar_non_us_or_unknown').length,
    parsedNoSolarHitSources: rows.filter((row) => row.status === 'parsed_no_solar_hit').length,
    parseFailedOrNotJobSources: rows.filter((row) => row.status === 'sample_parse_failed_or_not_job').length,
    deepSampleCandidates: deepSample.length,
    deepSampleThresholdCaptures: minDeepSampleCaptures,
    note: 'A negative sample is not proof that a diversified employer had no solar jobs. High-volume negatives and sources with solar URL signals are queued for deeper sampling.',
  }
  await writeFile(path.join(root, 'employer-discovery-validation-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
