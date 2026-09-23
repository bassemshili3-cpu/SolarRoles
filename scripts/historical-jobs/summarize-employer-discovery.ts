import { readFile, writeFile } from 'node:fs/promises'
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
  sourceScope: 'host_or_path' | 'query_scoped' | 'first_party_lead'
  sourcePattern: string
  sourcePatterns: string[]
  hosts: string[]
  captures: number
  solarUrlHits: number
  firstSeen: string
  lastSeen: string
  initialSampleCount: number
  reservoirSampleCount: number
}

const KNOWN_THIRD_PARTY_JOB_HOSTS = new Set([
  'careerbuilder.com',
  'careercast.com',
  'environmentalcareer.com',
  'getsolarjobs.com',
  'glassdoor.com',
  'greenjobs.com',
  'indeed.com',
  'jobs.ieee.org',
  'jobsearch.asme.org',
  'linkedin.com',
  'monster.com',
  'workhands.us',
  'ziprecruiter.com',
  'engineering.com',
])

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
])

type CurrentEmployerHint = {
  provider: string
  name: string
  aliases: string[]
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
      values.push(...url.pathname.split('/').filter(Boolean))
    } catch {
      // Non-URL identifiers such as slug, tenant, CID or client key are useful aliases.
    }
  }
  return values
}

function buildCurrentEmployerHints(): CurrentEmployerHint[] {
  return CURRENT_SEED_GROUPS.flatMap(([provider, companies]) =>
    (companies as readonly Record<string, unknown>[])
      .filter((seed) => seed.verified !== false)
      .map((seed) => {
        const name = typeof seed.name === 'string' ? seed.name : ''
        const aliases = dedupeStrings([name, ...hintValues(seed)])
          .map(compact)
          .filter((value) => value.length >= 4 && !GENERIC_HINTS.has(value))
        return { provider, name, aliases }
      })
      .filter((hint) => hint.name && hint.aliases.length),
  )
}

function currentEmployerMatches(source: SourceCandidate, hints: CurrentEmployerHint[]) {
  const haystacks = [
    source.sourceKey,
    ...source.sourcePatterns,
    ...source.hosts,
  ].map(compact)
  return hints
    .filter((hint) =>
      hint.provider === source.provider
      && hint.aliases.some((alias) => haystacks.some((value) => value.includes(alias))),
    )
    .map((hint) => hint.name)
    .filter((value, index, values) => values.indexOf(value) === index)
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

function compact(value: string) {
  return normalizeName(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function normalizedHost(host: string) {
  return host.toLowerCase().replace(/^www\./, '')
}

function hostMatchesKnownThirdParty(host: string) {
  const normalized = normalizedHost(host)
  return [...KNOWN_THIRD_PARTY_JOB_HOSTS].some((known) =>
    normalized === known || normalized.endsWith(`.${known}`),
  )
}

function hostLooksLikeOrganization(host: string, organization: string) {
  const hostCompact = normalizedHost(host)
    .replace(/^(?:jobs|careers|career|recruiting)\./, '')
    .replace(/\.(?:com|net|org|io|co|us)$/i, '')
    .replace(/[^a-z0-9]+/g, '')
  const organizationCompact = compact(organization)
  if (hostCompact.length < 4 || organizationCompact.length < 4) return false
  return hostCompact.includes(organizationCompact) || organizationCompact.includes(hostCompact)
}

function dedupeStrings(values: Array<string | null | undefined>) {
  const seen = new Map<string, string>()
  for (const value of values) {
    const clean = value?.trim()
    if (!clean) continue
    const key = compact(clean)
    if (key && !seen.has(key)) seen.set(key, clean)
  }
  return [...seen.values()]
}

function recommendedDeepSample(source: SourceCandidate) {
  if (source.reservoirSampleCount <= source.initialSampleCount) return source.initialSampleCount
  if (source.captures >= 100) return Math.min(source.reservoirSampleCount, 20)
  if (source.solarUrlHits > 0) return Math.min(source.reservoirSampleCount, 15)
  if (source.captures >= 25) return Math.min(source.reservoirSampleCount, 12)
  return Math.min(source.reservoirSampleCount, 8)
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/employer-discovery-2020'))
  const minDeepSampleCaptures = Number(arg(args, '--deep-sample-threshold', '25'))

  const sources = await readJsonLines<SourceCandidate>(path.join(root, 'source-candidates.jsonl'))
  const provisional = JSON.parse(await readFile(path.join(root, 'provisional-employers.json'), 'utf8')) as HistoricalEmployer[]
  const jobs = await readJsonLines<ParsedHistoricalJob>(path.join(root, 'parsed-jobs.jsonl'))
  const classifications = await readJsonLines<HistoricalJobClassification>(path.join(root, 'job-classifications.jsonl'))
  const currentEmployerHints = buildCurrentEmployerHints()

  const sourceByKey = new Map(sources.map((source) => [source.sourceKey, source]))
  const classificationByJob = new Map(classifications.map((row) => [row.historicalJobId, row]))
  const jobsByEmployer = new Map<string, ParsedHistoricalJob[]>()
  for (const job of jobs) {
    const list = jobsByEmployer.get(job.employerId) ?? []
    list.push(job)
    jobsByEmployer.set(job.employerId, list)
  }

  const employerLeadMap = new Map<string, {
    employerName: string
    sourceKeys: Set<string>
    sourceUrls: Set<string>
    solarUsJobs: number
    titles: Set<string>
  }>()

  const rows = provisional.map((employer) => {
    const sourceKey = employer.discoverySourceKey ?? ''
    const source = sourceByKey.get(sourceKey)
    const knownCurrentEmployerMatches = source ? currentEmployerMatches(source, currentEmployerHints) : []
    const employerJobs = jobsByEmployer.get(employer.employerId) ?? []
    const classified = employerJobs.map((job) => ({
      job,
      classification: classificationByJob.get(job.historicalJobId),
    }))
    const solarJobs = classified.filter((row) => row.classification?.isSolarRelated)
    const usJobs = classified.filter((row) => row.classification?.isUsJob)
    const solarUsJobs = classified.filter((row) => row.classification?.isSolarRelated && row.classification?.isUsJob)

    const allOrganizations = dedupeStrings(employerJobs.map((job) => job.hiringOrganizationName).filter(Boolean))
    const solarUsOrganizations = dedupeStrings(solarUsJobs.map(({ job }) => job.hiringOrganizationName).filter(Boolean))
    const inferredEmployerName = solarUsOrganizations[0] ?? allOrganizations[0] ?? employer.employerName

    for (const { job } of solarUsJobs) {
      if (!job.hiringOrganizationName) continue
      const normalized = compact(job.hiringOrganizationName)
      if (!normalized) continue
      const lead = employerLeadMap.get(normalized) ?? {
        employerName: normalizeName(job.hiringOrganizationName),
        sourceKeys: new Set<string>(),
        sourceUrls: new Set<string>(),
        solarUsJobs: 0,
        titles: new Set<string>(),
      }
      lead.sourceKeys.add(sourceKey)
      lead.sourceUrls.add(job.sourceUrl)
      lead.solarUsJobs += 1
      lead.titles.add(job.title)
      employerLeadMap.set(normalized, lead)
    }

    const hosts = source?.hosts ?? []
    const thirdPartyHost = hosts.some(hostMatchesKnownThirdParty)
    const organizationHostMatch = solarUsOrganizations.some((organization) =>
      hosts.some((host) => hostLooksLikeOrganization(host, organization)),
    )
    const ambiguousOrganizations = allOrganizations.length > 1

    let status = 'sample_parse_failed_or_not_job'
    if (solarUsJobs.length) {
      if (source?.sourceScope === 'query_scoped') status = 'validated_solar_us_query_scoped_source'
      else if (source?.sourceScope === 'first_party_lead') {
        status = !thirdPartyHost && organizationHostMatch && !ambiguousOrganizations
          ? 'validated_solar_us_first_party_source'
          : 'solar_employer_lead_only'
      } else {
        status = ambiguousOrganizations
          ? 'solar_us_source_ambiguous_identity'
          : 'validated_solar_us_source'
      }
    } else if (solarJobs.length) status = 'solar_non_us_or_unknown'
    else if (employerJobs.length) status = 'parsed_no_solar_hit'

    const captures = Number(source?.captures) || 0
    const solarUrlHits = Number(source?.solarUrlHits) || 0
    const initialSampleCount = Number(source?.initialSampleCount) || 0
    const reservoirSampleCount = Number(source?.reservoirSampleCount) || 0
    const isValidatedDirectSource =
      status === 'validated_solar_us_source'
      || status === 'validated_solar_us_first_party_source'
    const isValidatedQueryScoped = status === 'validated_solar_us_query_scoped_source'

    const needsDeepSample =
      !isValidatedDirectSource
      && !isValidatedQueryScoped
      && status !== 'solar_employer_lead_only'
      && (
        solarUrlHits > 0
        || captures >= minDeepSampleCaptures
        || knownCurrentEmployerMatches.length > 0
        || status === 'solar_us_source_ambiguous_identity'
      )
      && reservoirSampleCount > initialSampleCount

    return {
      employerId: employer.employerId,
      provisionalEmployerName: employer.employerName,
      inferredEmployerName,
      provider: source?.provider ?? employer.atsProvider,
      sourceKey,
      sourceScope: source?.sourceScope ?? employer.discoverySourceScope ?? 'host_or_path',
      patterns: source?.sourcePatterns ?? employer.patterns,
      hosts,
      captures,
      solarUrlHits,
      initialSampleCount,
      reservoirSampleCount,
      parsedJobs: employerJobs.length,
      solarJobs: solarJobs.length,
      usJobs: usJobs.length,
      solarUsJobs: solarUsJobs.length,
      hiringOrganizations: allOrganizations,
      thirdPartyHost,
      organizationHostMatch,
      ambiguousOrganizations,
      knownCurrentEmployerMatches,
      status,
      needsDeepSample,
      recommendedDeepSampleCount: needsDeepSample ? recommendedDeepSample(source!) : initialSampleCount,
      sampleTitles: employerJobs.slice(0, 12).map((job) => job.title),
      solarUsTitles: solarUsJobs.slice(0, 12).map(({ job }) => job.title),
    }
  })

  const validatedDirect = rows.filter((row) =>
    row.status === 'validated_solar_us_source'
    || row.status === 'validated_solar_us_first_party_source',
  )
  const validatedQueryScoped = rows.filter((row) => row.status === 'validated_solar_us_query_scoped_source')
  const leadOnly = rows.filter((row) => row.status === 'solar_employer_lead_only')
  const deepSample = rows.filter((row) => row.needsDeepSample)

  const discoveredEmployers = validatedDirect.map((row) => ({
    employerId: row.employerId,
    employerName: row.inferredEmployerName,
    atsProvider: row.provider,
    patterns: row.patterns,
    discoverySourceKey: row.sourceKey,
    discoverySourceScope: row.sourceScope,
    notes: `Discovered from Common Crawl employer discovery. Evidence: ${row.solarUsJobs} sampled US solar job(s), ${row.captures} indexed job-like capture(s). sourceKey=${row.sourceKey}`,
  }))

  const queryScopedEmployers = validatedQueryScoped.map((row) => ({
    employerId: row.employerId,
    employerName: row.inferredEmployerName,
    atsProvider: row.provider,
    patterns: row.patterns,
    discoverySourceKey: row.sourceKey,
    discoverySourceScope: row.sourceScope,
    notes: `Validated US solar source, but source identity is query-parameter scoped and must not be expanded with a broad host-only pattern. sourceKey=${row.sourceKey}`,
  }))

  const employerLeads = [...employerLeadMap.values()]
    .map((lead) => ({
      employerName: lead.employerName,
      solarUsJobs: lead.solarUsJobs,
      sourceKeys: [...lead.sourceKeys].sort(),
      sourceUrls: [...lead.sourceUrls].slice(0, 20),
      titles: [...lead.titles].slice(0, 20),
    }))
    .sort((a, b) => b.solarUsJobs - a.solarUsJobs || a.employerName.localeCompare(b.employerName))

  const header = [
    'employer_id', 'provisional_name', 'inferred_name', 'provider', 'source_key', 'scope',
    'patterns', 'hosts', 'captures', 'solar_url_hits', 'initial_samples', 'reservoir_samples',
    'parsed_jobs', 'solar_jobs', 'us_jobs', 'solar_us_jobs', 'hiring_organizations',
    'third_party_host', 'organization_host_match', 'ambiguous_organizations', 'known_current_employer_matches',
    'status', 'needs_deep_sample', 'recommended_deep_sample_count',
    'sample_titles', 'solar_us_titles', 'manual_decision', 'notes',
  ]
  const csvRows = rows.map((row) => [
    row.employerId,
    row.provisionalEmployerName,
    row.inferredEmployerName,
    row.provider,
    row.sourceKey,
    row.sourceScope,
    row.patterns.join(' | '),
    row.hosts.join(' | '),
    row.captures,
    row.solarUrlHits,
    row.initialSampleCount,
    row.reservoirSampleCount,
    row.parsedJobs,
    row.solarJobs,
    row.usJobs,
    row.solarUsJobs,
    row.hiringOrganizations.join(' | '),
    row.thirdPartyHost,
    row.organizationHostMatch,
    row.ambiguousOrganizations,
    row.knownCurrentEmployerMatches.join(' | '),
    row.status,
    row.needsDeepSample,
    row.recommendedDeepSampleCount,
    row.sampleTitles.join(' | '),
    row.solarUsTitles.join(' | '),
    '',
    '',
  ])

  await writeFile(path.join(root, 'discovered-employers.json'), `${JSON.stringify(discoveredEmployers, null, 2)}\n`, 'utf8')
  await writeFile(path.join(root, 'query-scoped-discovered-employers.json'), `${JSON.stringify(queryScopedEmployers, null, 2)}\n`, 'utf8')
  await writeFile(path.join(root, 'employer-leads.json'), `${JSON.stringify(employerLeads, null, 2)}\n`, 'utf8')
  await writeFile(path.join(root, 'employer-discovery-validation.csv'), [
    header.map(csvCell).join(','),
    ...csvRows.map((row) => row.map(csvCell).join(',')),
  ].join('\n') + '\n', 'utf8')
  await writeFile(path.join(root, 'deep-sample-candidates.json'), `${JSON.stringify(deepSample, null, 2)}\n`, 'utf8')

  const statusCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1
    return acc
  }, {})

  const report = {
    generatedAt: new Date().toISOString(),
    sourceCandidates: rows.length,
    parsedSources: rows.filter((row) => row.parsedJobs > 0).length,
    validatedDirectSolarUsSources: validatedDirect.length,
    validatedQueryScopedSolarUsSources: validatedQueryScoped.length,
    solarEmployerLeadOnlySources: leadOnly.length,
    distinctEmployerLeadsFromHiringOrganization: employerLeads.length,
    deepSampleCandidates: deepSample.length,
    currentSolarRolesSeedHints: currentEmployerHints.length,
    sourcesMatchedToCurrentSolarRolesEmployers: rows.filter((row) => row.knownCurrentEmployerMatches.length > 0).length,
    deepSampleThresholdCaptures: minDeepSampleCaptures,
    statusCounts,
    note: 'First-party and third-party pages are not automatically treated as employer-owned sources. hiringOrganization creates employer leads; only validated direct or employer-specific ATS sources enter the direct-source registry. Query-scoped ATS sources remain separate until the full indexer can preserve their query key.',
  }
  await writeFile(path.join(root, 'employer-discovery-validation-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
