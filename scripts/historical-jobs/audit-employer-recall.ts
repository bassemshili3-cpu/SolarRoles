import { createReadStream } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import readline from 'node:readline'
import path from 'node:path'
import type {
  HistoricalEmployer,
  HistoricalJobClassification,
  ParsedHistoricalJob,
} from '../../lib/historical-jobs/commonCrawl'
import {
  ADP_COMPANIES,
  ASHBY_COMPANIES,
  BREEZY_COMPANIES,
  GREENHOUSE_COMPANIES,
  HRMDIRECT_COMPANIES,
  ICIMS_COMPANIES,
  JAZZHR_COMPANIES,
  JOBVITE_COMPANIES,
  LEVER_COMPANIES,
  ORACLE_CLOUD_COMPANIES,
  PAYCOM_COMPANIES,
  PAYLOCITY_COMPANIES,
  PINPOINT_COMPANIES,
  RIPPLING_COMPANIES,
  SAASHR_COMPANIES,
  SMARTRECRUITERS_COMPANIES,
  SUCCESSFACTORS_COMPANIES,
  UKG_COMPANIES,
  WORKABLE_COMPANIES,
  WORKDAY_COMPANIES,
} from '../../lib/ats/company-seed'

interface SourceCandidate {
  provider: string
  sourceKey: string
  sourceScope?: string
  sourcePattern?: string
  sourcePatterns?: string[]
  host?: string
  hosts?: string[]
  captures: number
  solarUrlHits: number
  initialSampleCount?: number
  reservoirSampleCount?: number
}

type CurrentEmployerHint = {
  provider: string
  name: string
  aliases: string[]
}

const CURRENT_SEED_GROUPS = [
  ['jazzhr', JAZZHR_COMPANIES],
  ['breezy', BREEZY_COMPANIES],
  ['rippling', RIPPLING_COMPANIES],
  ['successfactors', SUCCESSFACTORS_COMPANIES],
  ['ashby', ASHBY_COMPANIES],
  ['smartrecruiters', SMARTRECRUITERS_COMPANIES],
  ['lever', LEVER_COMPANIES],
  ['workable', WORKABLE_COMPANIES],
  ['pinpoint', PINPOINT_COMPANIES],
  ['jobvite', JOBVITE_COMPANIES],
  ['oraclecloud', ORACLE_CLOUD_COMPANIES],
  ['adp', ADP_COMPANIES],
  ['paylocity', PAYLOCITY_COMPANIES],
  ['paycom', PAYCOM_COMPANIES],
  ['ukg', UKG_COMPANIES],
  ['icims', ICIMS_COMPANIES],
  ['workday', WORKDAY_COMPANIES],
  ['greenhouse', GREENHOUSE_COMPANIES],
  ['hrmdirect', HRMDIRECT_COMPANIES],
  ['saashr', SAASHR_COMPANIES],
] as const

const GENERIC_HINTS = new Set([
  'solar', 'energy', 'power', 'jobs', 'careers', 'career', 'company', 'group',
  'unitedstates', 'usa', 'external', 'jobboard', 'careersurl', 'verified',
  'search', 'job', 'apply', 'employment', 'opportunity', 'opportunities',
])

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function normalizeName(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\b(?:inc\.?|llc|ltd\.?|corp\.?|corporation|company|co\.?)$/i, '')
    .trim()
}

function compact(value: string) {
  return normalizeName(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

function hintValues(seed: Record<string, unknown>) {
  const values: string[] = []
  for (const [key, value] of Object.entries(seed)) {
    if (typeof value !== 'string') continue
    if (['roleFilter', 'locale', 'categoryName'].includes(key)) continue
    values.push(value)
    try {
      const url = new URL(value)
      values.push(url.hostname)
      values.push(url.hostname.replace(/^www\./, ''))
      values.push(...url.pathname.split('/').filter(Boolean))
    } catch {
      // Provider-specific identifiers such as slug, tenant, CID or client key.
    }
  }
  return values
}

function buildCurrentEmployerHints(): CurrentEmployerHint[] {
  return CURRENT_SEED_GROUPS.flatMap(([provider, companies]) =>
    (companies as unknown as readonly Record<string, unknown>[])
      .filter((seed) => seed.verified !== false)
      .map((seed) => {
        const name = typeof seed.name === 'string' ? seed.name : ''
        const aliases = dedupe([name, ...hintValues(seed)])
          .map(compact)
          .filter((value) => value.length >= 4 && !GENERIC_HINTS.has(value))
        return { provider, name, aliases }
      })
      .filter((hint) => hint.name && hint.aliases.length),
  )
}

function sourceHaystacks(source: SourceCandidate) {
  return dedupe([
    source.sourceKey,
    source.sourcePattern ?? '',
    ...(source.sourcePatterns ?? []),
    source.host ?? '',
    ...(source.hosts ?? []),
  ]).map(compact)
}

function matchStrength(source: SourceCandidate, hint: CurrentEmployerHint): 'strict' | 'loose' | null {
  if (source.provider !== hint.provider) return null
  const haystacks = sourceHaystacks(source)
  if (hint.aliases.some((alias) => haystacks.some((value) => value === alias))) return 'strict'
  if (hint.aliases.some((alias) => haystacks.some((value) =>
    alias.length >= 6 && (value.includes(alias) || alias.includes(value)),
  ))) return 'loose'
  return null
}

async function readJsonLines<T>(filename: string) {
  const body = await readFile(filename, 'utf8')
  return body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T)
}

async function* streamJsonLines<T>(filename: string): AsyncGenerator<T> {
  const input = createReadStream(filename, { encoding: 'utf8' })
  const lines = readline.createInterface({ input, crlfDelay: Infinity })
  for await (const rawLine of lines) {
    const line = rawLine.trim()
    if (line) yield JSON.parse(line) as T
  }
}

function csv(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/employer-discovery-2020'))

  const sources = await readJsonLines<SourceCandidate>(path.join(root, 'source-candidates.jsonl'))
  const provisional = JSON.parse(await readFile(path.join(root, 'provisional-employers.json'), 'utf8')) as HistoricalEmployer[]
  const hints = buildCurrentEmployerHints()

  const employerIdBySourceKey = new Map(
    provisional.map((employer) => [employer.discoverySourceKey ?? '', employer.employerId]),
  )

  const parseStats = new Map<string, { sampledCaptures: number; parsedCaptures: number }>()
  for await (const row of streamJsonLines<Record<string, unknown>>(path.join(root, 'parse-results.jsonl'))) {
    const employerId = String(row.employerId ?? '')
    if (!employerId) continue
    const stat = parseStats.get(employerId) ?? { sampledCaptures: 0, parsedCaptures: 0 }
    stat.sampledCaptures += 1
    if (row.parseStatus === 'parsed_job') stat.parsedCaptures += 1
    parseStats.set(employerId, stat)
  }

  const classificationByJob = new Map<string, Pick<HistoricalJobClassification, 'isSolarRelated' | 'isUsJob' | 'solarCandidate' | 'usStatus'>>()
  for await (const row of streamJsonLines<HistoricalJobClassification>(path.join(root, 'job-classifications.jsonl'))) {
    classificationByJob.set(row.historicalJobId, {
      isSolarRelated: row.isSolarRelated,
      isUsJob: row.isUsJob,
      solarCandidate: row.solarCandidate,
      usStatus: row.usStatus,
    })
  }

  const jobStats = new Map<string, {
    parsedJobs: number
    solarJobs: number
    solarCandidates: number
    solarUsOrUnknownCandidates: number
    solarUnknownLocationCandidates: number
    usJobs: number
    solarUsJobs: number
    solarUsTitles: string[]
  }>()
  for await (const job of streamJsonLines<ParsedHistoricalJob>(path.join(root, 'parsed-jobs.jsonl'))) {
    const stat = jobStats.get(job.employerId) ?? {
      parsedJobs: 0,
      solarJobs: 0,
      solarCandidates: 0,
      solarUsOrUnknownCandidates: 0,
      solarUnknownLocationCandidates: 0,
      usJobs: 0,
      solarUsJobs: 0,
      solarUsTitles: [],
    }
    stat.parsedJobs += 1
    const classification = classificationByJob.get(job.historicalJobId)
    if (classification?.isSolarRelated) stat.solarJobs += 1
    if (classification?.solarCandidate) stat.solarCandidates += 1
    if (classification?.solarCandidate && classification.usStatus !== 'foreign') stat.solarUsOrUnknownCandidates += 1
    if (classification?.solarCandidate && classification.usStatus === 'unknown') stat.solarUnknownLocationCandidates += 1
    if (classification?.isUsJob) stat.usJobs += 1
    if (classification?.isSolarRelated && classification?.isUsJob) {
      stat.solarUsJobs += 1
      if (stat.solarUsTitles.length < 8) stat.solarUsTitles.push(job.title)
    }
    jobStats.set(job.employerId, stat)
  }

  const rows = hints.map((hint) => {
    const strictSources: SourceCandidate[] = []
    const looseSources: SourceCandidate[] = []
    for (const source of sources) {
      const strength = matchStrength(source, hint)
      if (strength === 'strict') strictSources.push(source)
      else if (strength === 'loose') looseSources.push(source)
    }

    const matchedSources = strictSources.length ? strictSources : looseSources
    const matchType = strictSources.length ? 'strict' : looseSources.length ? 'loose_only' : 'none'
    const sourceKeys = dedupe(matchedSources.map((source) => source.sourceKey))
    const employerIds = dedupe(sourceKeys.map((sourceKey) => employerIdBySourceKey.get(sourceKey) ?? '').filter(Boolean))

    const sampledCaptures = employerIds.reduce((sum, employerId) => sum + (parseStats.get(employerId)?.sampledCaptures ?? 0), 0)
    const parsedCaptures = employerIds.reduce((sum, employerId) => sum + (parseStats.get(employerId)?.parsedCaptures ?? 0), 0)
    const parsedJobs = employerIds.reduce((sum, employerId) => sum + (jobStats.get(employerId)?.parsedJobs ?? 0), 0)
    const solarJobs = employerIds.reduce((sum, employerId) => sum + (jobStats.get(employerId)?.solarJobs ?? 0), 0)
    const solarCandidates = employerIds.reduce((sum, employerId) => sum + (jobStats.get(employerId)?.solarCandidates ?? 0), 0)
    const solarUsOrUnknownCandidates = employerIds.reduce((sum, employerId) => sum + (jobStats.get(employerId)?.solarUsOrUnknownCandidates ?? 0), 0)
    const solarUnknownLocationCandidates = employerIds.reduce((sum, employerId) => sum + (jobStats.get(employerId)?.solarUnknownLocationCandidates ?? 0), 0)
    const usJobs = employerIds.reduce((sum, employerId) => sum + (jobStats.get(employerId)?.usJobs ?? 0), 0)
    const solarUsJobs = employerIds.reduce((sum, employerId) => sum + (jobStats.get(employerId)?.solarUsJobs ?? 0), 0)
    const solarUsTitles = dedupe(employerIds.flatMap((employerId) => jobStats.get(employerId)?.solarUsTitles ?? [])).slice(0, 12)

    let failureStage = 'solar_us_found'
    if (!matchedSources.length) failureStage = 'no_source_match'
    else if (matchType === 'loose_only') failureStage = 'source_match_loose_only'
    else if (!sampledCaptures) failureStage = 'source_found_not_sampled'
    else if (!parsedJobs) failureStage = 'sampled_no_parsed_job'
    else if (!solarCandidates) failureStage = 'parsed_no_solar_candidate'
    else if (!solarUsOrUnknownCandidates) failureStage = 'solar_candidate_explicitly_foreign'
    else if (!solarUsJobs && solarUnknownLocationCandidates > 0) failureStage = 'solar_candidate_us_unknown'
    else if (!solarUsJobs) failureStage = 'solar_candidate_needs_review'

    return {
      employerName: hint.name,
      provider: hint.provider,
      matchType,
      matchedSourceCount: matchedSources.length,
      indexedCaptures: matchedSources.reduce((sum, source) => sum + (Number(source.captures) || 0), 0),
      solarUrlHits: matchedSources.reduce((sum, source) => sum + (Number(source.solarUrlHits) || 0), 0),
      sampledCaptures,
      parsedCaptures,
      parsedJobs,
      usJobs,
      solarJobs,
      solarCandidates,
      solarUsOrUnknownCandidates,
      solarUnknownLocationCandidates,
      solarUsJobs,
      failureStage,
      sourceKeys,
      solarUsTitles,
    }
  })

  const failureStageCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.failureStage] = (acc[row.failureStage] ?? 0) + 1
    return acc
  }, {})

  const report = {
    generatedAt: new Date().toISOString(),
    benchmark: 'Current SolarRoles verified ATS employers checked against the selected historical Common Crawl discovery. This is a recall diagnostic, not evidence that every current employer existed or hired in solar in 2020.',
    currentSeedEmployers: rows.length,
    strictMatchedEmployers: rows.filter((row) => row.matchType === 'strict').length,
    looseOnlyMatchedEmployers: rows.filter((row) => row.matchType === 'loose_only').length,
    unmatchedEmployers: rows.filter((row) => row.matchType === 'none').length,
    employersWithParsedJobs: rows.filter((row) => row.parsedJobs > 0).length,
    employersWithSolarJobs: rows.filter((row) => row.solarJobs > 0).length,
    employersWithSolarCandidates: rows.filter((row) => row.solarCandidates > 0).length,
    employersWithSolarUsOrUnknownCandidates: rows.filter((row) => row.solarUsOrUnknownCandidates > 0).length,
    employersWithSolarUsJobs: rows.filter((row) => row.solarUsJobs > 0).length,
    matchedSourceRows: new Set(rows.flatMap((row) => row.sourceKeys)).size,
    failureStageCounts,
  }

  const header = [
    'employer_name', 'provider', 'match_type', 'matched_source_count', 'indexed_captures',
    'solar_url_hits', 'sampled_captures', 'parsed_captures', 'parsed_jobs', 'us_jobs',
    'solar_jobs', 'solar_candidates', 'solar_us_or_unknown_candidates', 'solar_unknown_location_candidates',
    'solar_us_jobs', 'failure_stage', 'source_keys', 'solar_us_titles',
  ]
  const csvRows = rows.map((row) => [
    row.employerName,
    row.provider,
    row.matchType,
    row.matchedSourceCount,
    row.indexedCaptures,
    row.solarUrlHits,
    row.sampledCaptures,
    row.parsedCaptures,
    row.parsedJobs,
    row.usJobs,
    row.solarJobs,
    row.solarCandidates,
    row.solarUsOrUnknownCandidates,
    row.solarUnknownLocationCandidates,
    row.solarUsJobs,
    row.failureStage,
    row.sourceKeys.join(' | '),
    row.solarUsTitles.join(' | '),
  ])

  await writeFile(path.join(root, 'employer-recall-audit.csv'), [
    header.map(csv).join(','),
    ...csvRows.map((row) => row.map(csv).join(',')),
  ].join('\n') + '\n', 'utf8')
  await writeFile(path.join(root, 'employer-recall-audit.json'), `${JSON.stringify(rows, null, 2)}\n`, 'utf8')
  await writeFile(path.join(root, 'employer-recall-audit-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
