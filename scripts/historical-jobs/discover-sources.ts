import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import type { HistoricalEmployer } from '../../lib/historical-jobs/commonCrawl'
import { targetFromPattern } from '../../lib/historical-jobs/urlIndex'

const DEFAULT_PARQUET_DIR = 'data/common-crawl-historical-jobs/parquet'
const DEFAULT_REGISTRY = 'data/common-crawl-historical-jobs/employers.json'
const DEFAULT_DUCKDB = path.join('.tools', 'duckdb', 'duckdb.exe')

const ATS_HOST_SUFFIXES = [
  'myworkdayjobs.com', 'greenhouse.io', 'lever.co', 'jobvite.com', 'icims.com',
  'taleo.net', 'successfactors.com', 'successfactors.eu', 'brassring.com',
  'smartrecruiters.com', 'ashbyhq.com', 'bamboohr.com', 'dayforcehcm.com',
  'ultipro.com', 'ukg.com', 'paylocity.com', 'paycomonline.net',
  'workforcenow.adp.com', 'oraclecloud.com', 'jobs2web.com',
]

const SHARED_RECRUITING_ROOTS = new Set(['kochcareers.com'])

const GENERIC_ALIAS_WORDS = new Set([
  'solar', 'energy', 'power', 'renewable', 'renewables', 'america', 'americas',
  'north', 'company', 'companies', 'group', 'clean', 'resources', 'building',
  'technologies', 'technology', 'careers', 'career', 'jobs', 'job',
])

interface CliOptions {
  year: number
  crawlId: string
  parquetDir: string
  registry: string
  outputDir: string
  duckdb: string
  sqlOnly: boolean
}

interface RawDiscoveryRow {
  crawl: string
  url: string
  url_host_name: string
  url_path: string
  fetch_time: string
  content_digest: string
  warc_filename: string
  warc_record_offset: number
  warc_record_length: number
}

interface EmployerDiscoverySpec {
  employer: HistoricalEmployer
  aliases: string[]
  firstPartyRoots: string[]
  knownTargets: ReturnType<typeof targetFromPattern>[]
}

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function parseOptions(args: string[]): CliOptions {
  const year = Number(arg(args, '--year', '2020'))
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error('Invalid --year')
  const crawlId = arg(args, '--crawl', '')
  if (crawlId && !new RegExp(`^CC-MAIN-${year}-\\d{2}$`).test(crawlId)) {
    throw new Error('--crawl must match the requested year')
  }
  return {
    year,
    crawlId,
    parquetDir: arg(args, '--parquet-dir', DEFAULT_PARQUET_DIR),
    registry: arg(args, '--registry', DEFAULT_REGISTRY),
    outputDir: arg(args, '--output', `data/common-crawl-historical-jobs/discovery-${year}`),
    duckdb: arg(args, '--duckdb', DEFAULT_DUCKDB),
    sqlOnly: args.includes('--sql-only'),
  }
}

async function listParquetFiles(root: string) {
  const files: string[] = []
  async function visit(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const filename = path.join(directory, entry.name)
      if (entry.isDirectory()) await visit(filename)
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.parquet')) files.push(path.resolve(filename))
    }
  }
  await visit(path.resolve(root))
  return files.sort()
}

function inferCrawlId(filename: string) {
  return filename.replaceAll('\\', '/').match(/crawl=(CC-MAIN-\d{4}-\d{2})\//)?.[1] ?? null
}

function normalizeAlias(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function isAtsHost(host: string) {
  const lower = host.toLowerCase()
  return ATS_HOST_SUFFIXES.some((suffix) => lower === suffix || lower.endsWith(`.${suffix}`))
}

function registeredRoot(host: string) {
  const parts = host.toLowerCase().split('.').filter(Boolean)
  return parts.length >= 2 ? parts.slice(-2).join('.') : host.toLowerCase()
}

function employerSpecs(employers: HistoricalEmployer[]): EmployerDiscoverySpec[] {
  return employers.map((employer) => {
    const targets = employer.patterns.map((pattern) => targetFromPattern(employer, pattern))
    const aliases = new Set<string>()
    const idAlias = normalizeAlias(employer.employerId)
    if (idAlias.length >= 5) aliases.add(idAlias)

    const compactName = normalizeAlias(employer.employerName)
    if (compactName.length >= 5) aliases.add(compactName)

    for (const word of employer.employerName.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)) {
      if (word.length >= 5 && !GENERIC_ALIAS_WORDS.has(word)) aliases.add(word)
    }

    for (const target of targets) {
      const hostLabel = normalizeAlias(target.host.split('.')[0] ?? '')
      if (hostLabel.length >= 5 && !GENERIC_ALIAS_WORDS.has(hostLabel)) aliases.add(hostLabel)
      const firstPath = normalizeAlias(target.pathPrefix.split('/').filter(Boolean)[0] ?? '')
      if (firstPath.length >= 5 && !GENERIC_ALIAS_WORDS.has(firstPath)) aliases.add(firstPath)
    }

    const firstPartyRoots = [...new Set(
      targets
        .map((target) => target.host)
        .filter((host) => !isAtsHost(host))
        .map(registeredRoot)
        .filter((root) => !SHARED_RECRUITING_ROOTS.has(root)),
    )]

    return {
      employer,
      aliases: [...aliases].sort((a, b) => b.length - a.length),
      firstPartyRoots,
      knownTargets: targets,
    }
  })
}

function regexEscape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`
}

function sqlPath(value: string) {
  return sqlString(path.resolve(value).replaceAll('\\', '/'))
}

function chunks<T>(values: T[], size: number) {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size))
}

function buildDiscoverySql(parquetFiles: string[], crawlIds: string[], specs: EmployerDiscoverySpec[], outputDir: string) {
  const aliases = [...new Set(specs.flatMap((spec) => spec.aliases))].sort((a, b) => b.length - a.length)
  const roots = [...new Set(specs.flatMap((spec) => spec.firstPartyRoots))].sort()
  if (!aliases.length && !roots.length) throw new Error('No discovery aliases or first-party domains were generated')

  const aliasRegex = aliases.map(regexEscape).join('|')
  const rootPredicate = roots.map((root) =>
    `(lower(url_host_name) = ${sqlString(root)} OR ends_with(lower(url_host_name), ${sqlString(`.${root}`)}))`,
  ).join('\n      OR ')
  const atsPredicate = ATS_HOST_SUFFIXES.map((suffix) =>
    `(lower(url_host_name) = ${sqlString(suffix)} OR ends_with(lower(url_host_name), ${sqlString(`.${suffix}`)}))`,
  ).join('\n      OR ')

  const rawJson = sqlPath(path.join(outputDir, 'discovery-raw.jsonl'))
  const rawParquet = sqlPath(path.join(outputDir, 'discovery-raw.parquet'))
  const tempDir = sqlPath(path.join(outputDir, 'duckdb-tmp'))

  const inserts = chunks(parquetFiles, 10).map((batch) => `INSERT INTO discovery_raw
SELECT
  crawl,
  url,
  lower(url_host_name) AS url_host_name,
  coalesce(url_path, '/') AS url_path,
  fetch_time,
  content_digest,
  warc_filename,
  warc_record_offset,
  warc_record_length
FROM read_parquet([
  ${batch.map((filename) => sqlPath(filename)).join(',\n  ')}
], hive_partitioning = true, union_by_name = true)
WHERE fetch_status = 200
  AND (
    lower(coalesce(content_mime_type, '')) LIKE '%html%'
    OR lower(coalesce(content_mime_detected, '')) LIKE '%html%'
  )
  AND (
    regexp_matches(lower(url), ${sqlString(`(?:${aliasRegex})`)})
    OR ${rootPredicate}
  )
  AND (
    regexp_matches(lower(url), '/(?:job|jobs|career|careers|requisition|requisitions|position|positions|vacancy|vacancies|employment|opportunit|job-search|search-jobs)(?:/|[-_?=&]|$)')
    OR ${atsPredicate}
  );`).join('\n\n')

  return `-- Historical source discovery for ${crawlIds.join(', ')}
SET preserve_insertion_order = false;
SET enable_progress_bar = true;
SET threads = 1;
SET memory_limit = '1GB';
SET temp_directory = ${tempDir};

CREATE OR REPLACE TEMP TABLE discovery_raw (
  crawl VARCHAR,
  url VARCHAR,
  url_host_name VARCHAR,
  url_path VARCHAR,
  fetch_time TIMESTAMP,
  content_digest VARCHAR,
  warc_filename VARCHAR,
  warc_record_offset BIGINT,
  warc_record_length BIGINT
);

${inserts}

COPY (
  SELECT DISTINCT * FROM discovery_raw
  ORDER BY crawl, url_host_name, url, fetch_time
) TO ${rawJson} (FORMAT JSON, ARRAY false);

COPY (
  SELECT DISTINCT * FROM discovery_raw
) TO ${rawParquet} (FORMAT PARQUET, COMPRESSION ZSTD);

SELECT
  crawl,
  count(*) AS candidate_captures,
  count(DISTINCT url) AS candidate_urls,
  count(DISTINCT url_host_name) AS candidate_hosts
FROM discovery_raw
GROUP BY crawl
ORDER BY crawl;
`
}

async function runDuckDb(executable: string, sqlFile: string) {
  await access(executable)
  await new Promise<void>((resolve, reject) => {
    const child = spawn(path.resolve(executable), ['-init', path.resolve(sqlFile), ':memory:'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      windowsHide: true,
    })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`DuckDB exited with code ${code}`)))
  })
}

function knownPatternMatch(spec: EmployerDiscoverySpec, host: string, pathname: string) {
  return spec.knownTargets.some((target) =>
    target.host === host && (target.pathPrefix === '/' || pathname.toLowerCase().startsWith(target.pathPrefix)),
  )
}

function firstPartyMatch(spec: EmployerDiscoverySpec, host: string) {
  return spec.firstPartyRoots.some((root) => host === root || host.endsWith(`.${root}`))
}

function aliasMatches(spec: EmployerDiscoverySpec, url: string) {
  const compact = normalizeAlias(url)
  return spec.aliases.filter((alias) => compact.includes(alias))
}

function inferPathPrefix(host: string, pathname: string) {
  const clean = pathname || '/'
  const parts = clean.split('/').filter(Boolean)
  const sharedAts = ['greenhouse.io', 'lever.co', 'jobvite.com', 'smartrecruiters.com', 'ashbyhq.com']
    .some((suffix) => host === suffix || host.endsWith(`.${suffix}`))
  if (sharedAts && parts[0]) return `/${parts[0]}/`

  const jobRootIndex = parts.findIndex((part) =>
    /^(?:job|jobs|career|careers|requisition|requisitions|position|positions|vacancy|vacancies|employment|opportunities|job-search|search-jobs)$/i.test(part),
  )
  if (jobRootIndex >= 0) return `/${parts.slice(0, jobRootIndex + 1).join('/')}/`
  return '/'
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const outputDir = path.resolve(options.outputDir)
  await mkdir(outputDir, { recursive: true })

  const employers = JSON.parse(await readFile(options.registry, 'utf8')) as HistoricalEmployer[]
  const specs = employerSpecs(employers)
  const allParquet = await listParquetFiles(options.parquetDir)
  if (!allParquet.length) throw new Error(`No Parquet files found under ${options.parquetDir}`)

  const crawlIdsInFiles = [...new Set(allParquet.map(inferCrawlId).filter((value): value is string => Boolean(value)))].sort()
  const selectedCrawls = options.crawlId
    ? [options.crawlId]
    : crawlIdsInFiles.filter((crawlId) => crawlId.startsWith(`CC-MAIN-${options.year}-`))
  if (!selectedCrawls.length) {
    throw new Error(`No local ${options.year} crawl found under ${options.parquetDir}. Available: ${crawlIdsInFiles.join(', ') || 'none'}`)
  }

  const parquetFiles = allParquet.filter((filename) => {
    const crawlId = inferCrawlId(filename)
    return crawlId ? selectedCrawls.includes(crawlId) : selectedCrawls.length === 1
  })
  if (!parquetFiles.length) throw new Error('No Parquet files matched the selected crawl(s)')

  const sqlFile = path.join(outputDir, 'discovery.sql')
  const planFile = path.join(outputDir, 'discovery-plan.json')
  await writeFile(sqlFile, buildDiscoverySql(parquetFiles, selectedCrawls, specs, outputDir), 'utf8')
  await writeFile(planFile, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    year: options.year,
    crawlIds: selectedCrawls,
    parquetDir: path.resolve(options.parquetDir),
    parquetFiles: parquetFiles.length,
    employers: employers.length,
    aliases: Object.fromEntries(specs.map((spec) => [spec.employer.employerId, spec.aliases])),
    firstPartyRoots: Object.fromEntries(specs.map((spec) => [spec.employer.employerId, spec.firstPartyRoots])),
    sqlFile: path.relative(process.cwd(), sqlFile),
  }, null, 2)}\n`, 'utf8')

  console.log(`[discovery] ${selectedCrawls.join(', ')} | ${parquetFiles.length} Parquet files | ${employers.length} employers`)
  console.log(`[discovery] SQL plan: ${path.relative(process.cwd(), sqlFile)}`)
  if (options.sqlOnly) return

  await runDuckDb(options.duckdb, sqlFile)

  const rawPath = path.join(outputDir, 'discovery-raw.jsonl')
  const rawBody = await readFile(rawPath, 'utf8')
  const rawRows = rawBody.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as RawDiscoveryRow)

  const attributed: Array<Record<string, unknown>> = []
  for (const row of rawRows) {
    const host = row.url_host_name.toLowerCase()
    const pathname = row.url_path || '/'
    const matches = specs.flatMap((spec) => {
      const aliases = aliasMatches(spec, row.url)
      const firstParty = firstPartyMatch(spec, host)
      const known = knownPatternMatch(spec, host, pathname)
      if (!aliases.length && !firstParty && !known) return []
      return [{
        employerId: spec.employer.employerId,
        employerName: spec.employer.employerName,
        atsProvider: spec.employer.atsProvider,
        aliasMatches: aliases,
        firstPartyDomainMatch: firstParty,
        knownPatternMatch: known,
      }]
    })
    if (!matches.length) continue
    attributed.push({
      ...row,
      inferredPathPrefix: inferPathPrefix(host, pathname),
      atsHost: isAtsHost(host),
      employerMatches: matches,
      ambiguousEmployerMatch: matches.length > 1,
    })
  }

  await writeFile(path.join(outputDir, 'discovery-attributed.jsonl'), attributed.map((row) => `${JSON.stringify(row)}\n`).join(''), 'utf8')

  type Agg = {
    employerId: string
    employerName: string
    atsProvider: string
    host: string
    pathPrefix: string
    captures: number
    urls: Set<string>
    firstSeen: string
    lastSeen: string
    aliases: Set<string>
    firstParty: boolean
    atsHost: boolean
    known: boolean
    ambiguousCaptures: number
  }

  const aggregates = new Map<string, Agg>()
  for (const row of attributed) {
    const matches = row.employerMatches as Array<{
      employerId: string
      employerName: string
      atsProvider: string
      aliasMatches: string[]
      firstPartyDomainMatch: boolean
      knownPatternMatch: boolean
    }>
    for (const match of matches) {
      const host = String(row.url_host_name)
      const pathPrefix = String(row.inferredPathPrefix)
      const key = `${match.employerId}|${host}|${pathPrefix}`
      const timestamp = String(row.fetch_time)
      const current = aggregates.get(key) ?? {
        employerId: match.employerId,
        employerName: match.employerName,
        atsProvider: match.atsProvider,
        host,
        pathPrefix,
        captures: 0,
        urls: new Set<string>(),
        firstSeen: timestamp,
        lastSeen: timestamp,
        aliases: new Set<string>(),
        firstParty: false,
        atsHost: Boolean(row.atsHost),
        known: false,
        ambiguousCaptures: 0,
      }
      current.captures += 1
      current.urls.add(String(row.url))
      if (timestamp < current.firstSeen) current.firstSeen = timestamp
      if (timestamp > current.lastSeen) current.lastSeen = timestamp
      match.aliasMatches.forEach((alias) => current.aliases.add(alias))
      current.firstParty ||= match.firstPartyDomainMatch
      current.known ||= match.knownPatternMatch
      if (row.ambiguousEmployerMatch) current.ambiguousCaptures += 1
      aggregates.set(key, current)
    }
  }

  const sources = [...aggregates.values()].map((source) => {
    let score = 0
    if (source.known) score += 5
    if (source.firstParty) score += 3
    if (source.atsHost) score += 3
    if (source.aliases.size) score += 3
    if (source.urls.size >= 3) score += 1
    if (source.urls.size >= 10) score += 1
    if (source.ambiguousCaptures) score -= 3
    const pattern = `${source.host}${source.pathPrefix === '/' ? '/*' : `${source.pathPrefix}*`}`
    return {
      employerId: source.employerId,
      employerName: source.employerName,
      currentAtsProvider: source.atsProvider,
      host: source.host,
      pathPrefix: source.pathPrefix,
      pattern,
      captures: source.captures,
      uniqueUrls: source.urls.size,
      firstSeen: source.firstSeen,
      lastSeen: source.lastSeen,
      aliasMatches: [...source.aliases].sort(),
      firstPartyDomainMatch: source.firstParty,
      atsHost: source.atsHost,
      knownPattern: source.known,
      ambiguousCaptures: source.ambiguousCaptures,
      score,
      recommendedForReview: !source.known && score >= 6 && source.ambiguousCaptures === 0,
    }
  }).sort((a, b) =>
    Number(b.recommendedForReview) - Number(a.recommendedForReview)
    || b.score - a.score
    || b.uniqueUrls - a.uniqueUrls
    || a.employerId.localeCompare(b.employerId),
  )

  await writeFile(path.join(outputDir, 'historical-sources.json'), `${JSON.stringify(sources, null, 2)}\n`, 'utf8')

  const recommended = sources.filter((source) => source.recommendedForReview)
  const reviewHeader = ['employer_id', 'employer_name', 'pattern', 'host', 'path_prefix', 'unique_urls', 'captures', 'first_seen', 'last_seen', 'score', 'aliases', 'accept', 'notes']
  const reviewCsv = [
    reviewHeader.map(csvCell).join(','),
    ...recommended.map((source) => [
      source.employerId, source.employerName, source.pattern, source.host, source.pathPrefix,
      source.uniqueUrls, source.captures, source.firstSeen, source.lastSeen, source.score,
      source.aliasMatches.join('|'), '', '',
    ].map(csvCell).join(',')),
  ].join('\n')
  await writeFile(path.join(outputDir, 'discovery-review.csv'), `${reviewCsv}\n`, 'utf8')

  const report = {
    generatedAt: new Date().toISOString(),
    year: options.year,
    crawlIds: selectedCrawls,
    parquetFiles: parquetFiles.length,
    employers: employers.length,
    rawCandidateCaptures: rawRows.length,
    attributedCandidateCaptures: attributed.length,
    sourceCandidates: sources.length,
    newSourceCandidates: sources.filter((source) => !source.knownPattern).length,
    recommendedForReview: recommended.length,
    ambiguousAttributedCaptures: attributed.filter((row) => row.ambiguousEmployerMatch).length,
    employersWithRecommendedCandidates: new Set(recommended.map((source) => source.employerId)).size,
  }
  await writeFile(path.join(outputDir, 'discovery-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
  console.log(`[discovery] review: ${path.relative(process.cwd(), path.join(outputDir, 'discovery-review.csv'))}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
