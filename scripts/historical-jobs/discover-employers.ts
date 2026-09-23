import { access, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import path from 'node:path'

const DEFAULT_PARQUET_DIR = 'data/common-crawl-historical-jobs/parquet'
const DEFAULT_DUCKDB = path.join('.tools', 'duckdb', 'duckdb.exe')

interface CliOptions {
  year: number
  crawlId: string
  parquetDir: string
  outputDir: string
  duckdb: string
  threads: number
  memoryLimit: string
  filesPerBatch: number
  maxSamplesPerSource: number
  sqlOnly: boolean
}

interface CandidateCaptureRow {
  provider: string
  source_key: string
  source_pattern: string
  host: string
  solar_url_signal: boolean
  urlkey: string
  timestamp: string
  url: string
  mime: string | null
  mime_detected: string | null
  status: string
  digest: string
  length: string
  offset: string
  filename: string
  languages: string | null
  encoding: string | null
  crawl: string
}

interface SourceAggregate {
  provider: string
  sourceKey: string
  sourcePattern: string
  host: string
  captures: CandidateCaptureRow[]
}

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function intArg(args: string[], flag: string, fallback: number) {
  const value = Number(arg(args, flag, String(fallback)))
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid ${flag}`)
  return value
}

function parseOptions(args: string[]): CliOptions {
  const year = intArg(args, '--year', 2020)
  const crawlId = arg(args, '--crawl', '')
  if (crawlId && !new RegExp(`^CC-MAIN-${year}-\\d{2}$`).test(crawlId)) {
    throw new Error('--crawl must match the requested year')
  }
  return {
    year,
    crawlId,
    parquetDir: arg(args, '--parquet-dir', DEFAULT_PARQUET_DIR),
    outputDir: arg(args, '--output', `data/common-crawl-historical-jobs/employer-discovery-${year}`),
    duckdb: arg(args, '--duckdb', DEFAULT_DUCKDB),
    threads: intArg(args, '--threads', 2),
    memoryLimit: arg(args, '--memory-limit', '3GB'),
    filesPerBatch: intArg(args, '--files-per-batch', 1),
    maxSamplesPerSource: intArg(args, '--max-samples-per-source', 12),
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

function chunks<T>(values: T[], size: number) {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size))
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`
}

function sqlPath(value: string) {
  return sqlString(path.resolve(value).replaceAll('\\', '/'))
}

function stableId(sourceKey: string) {
  const readable = sourceKey.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 54) || 'source'
  const digest = createHash('sha1').update(sourceKey).digest('hex').slice(0, 8)
  return `discovery-${readable}-${digest}`
}

function displayName(sourceKey: string) {
  const raw = sourceKey.split(':').slice(1).join(':') || sourceKey
  return raw
    .replace(/^www\./i, '')
    .replace(/\.(?:com|net|org)$/i, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildBatchSql(
  parquetFiles: string[],
  batchOutput: string,
  tempDir: string,
  threads: number,
  memoryLimit: string,
) {
  const atsPredicate = [
    "ends_with(host, '.myworkdayjobs.com')",
    "host IN ('boards.greenhouse.io', 'job-boards.greenhouse.io', 'boards.eu.greenhouse.io')",
    "host = 'jobs.lever.co'",
    "host = 'jobs.jobvite.com'",
    "host = 'jobs.smartrecruiters.com'",
    "host = 'jobs.ashbyhq.com'",
    "host = 'jobs.bamboohr.com' OR ends_with(host, '.bamboohr.com')",
    "host = 'jobs.dayforcehcm.com' OR ends_with(host, '.dayforcehcm.com')",
    "ends_with(host, '.icims.com')",
    "ends_with(host, '.taleo.net')",
    "ends_with(host, '.successfactors.com') OR ends_with(host, '.successfactors.eu')",
    "ends_with(host, '.oraclecloud.com')",
    "host = 'recruiting.ultipro.com' OR ends_with(host, '.ultipro.com')",
    "ends_with(host, '.ukg.com')",
    "host = 'recruiting.paylocity.com' OR ends_with(host, '.paylocity.com')",
    "host = 'workforcenow.adp.com'",
    "ends_with(host, '.paycomonline.net')",
    "ends_with(host, '.jobs2web.com')",
  ].join('\n      OR ')

  const providerExpr = `CASE
    WHEN ends_with(host, '.myworkdayjobs.com') THEN 'workday'
    WHEN host IN ('boards.greenhouse.io', 'job-boards.greenhouse.io', 'boards.eu.greenhouse.io') THEN 'greenhouse'
    WHEN host = 'jobs.lever.co' THEN 'lever'
    WHEN host = 'jobs.jobvite.com' THEN 'jobvite'
    WHEN host = 'jobs.smartrecruiters.com' THEN 'smartrecruiters'
    WHEN host = 'jobs.ashbyhq.com' THEN 'ashby'
    WHEN host = 'jobs.bamboohr.com' OR ends_with(host, '.bamboohr.com') THEN 'bamboohr'
    WHEN host = 'jobs.dayforcehcm.com' OR ends_with(host, '.dayforcehcm.com') THEN 'dayforce'
    WHEN ends_with(host, '.icims.com') THEN 'icims'
    WHEN ends_with(host, '.taleo.net') THEN 'taleo'
    WHEN ends_with(host, '.successfactors.com') OR ends_with(host, '.successfactors.eu') THEN 'successfactors'
    WHEN ends_with(host, '.oraclecloud.com') THEN 'oraclecloud'
    WHEN host = 'recruiting.ultipro.com' OR ends_with(host, '.ultipro.com') THEN 'ultipro'
    WHEN ends_with(host, '.ukg.com') THEN 'ukg'
    WHEN host = 'recruiting.paylocity.com' OR ends_with(host, '.paylocity.com') THEN 'paylocity'
    WHEN host = 'workforcenow.adp.com' THEN 'adp'
    WHEN ends_with(host, '.paycomonline.net') THEN 'paycom'
    WHEN ends_with(host, '.jobs2web.com') THEN 'jobs2web'
    ELSE 'first_party_solar_signal'
  END`

  const tenantExpr = `CASE
    WHEN host IN ('boards.greenhouse.io', 'job-boards.greenhouse.io', 'boards.eu.greenhouse.io', 'jobs.lever.co', 'jobs.jobvite.com', 'jobs.smartrecruiters.com', 'jobs.ashbyhq.com')
      THEN regexp_extract(url_path, '^/([^/]+)', 1)
    WHEN host = 'jobs.dayforcehcm.com'
      THEN coalesce(nullif(regexp_extract(url_path, '^/(?:[a-z]{2}-[A-Z]{2}/)?([^/]+)', 1), ''), host)
    WHEN host = 'recruiting.ultipro.com'
      THEN coalesce(nullif(regexp_extract(url_path, '^/([^/]+)', 1), ''), host)
    WHEN host = 'workforcenow.adp.com'
      THEN coalesce(nullif(regexp_extract(url, '(?i)[?&](?:client|clientid|cid)=([^&#]+)', 1), ''), host)
    WHEN host = 'recruiting.paylocity.com'
      THEN coalesce(nullif(regexp_extract(url, '(?i)[?&](?:clientid|companyid|company)=([^&#]+)', 1), ''), host)
    ELSE host
  END`

  const patternExpr = `CASE
    WHEN host IN ('boards.greenhouse.io', 'job-boards.greenhouse.io', 'boards.eu.greenhouse.io', 'jobs.lever.co', 'jobs.jobvite.com', 'jobs.smartrecruiters.com', 'jobs.ashbyhq.com')
      THEN host || '/' || regexp_extract(url_path, '^/([^/]+)', 1) || '/*'
    ELSE host || '/*'
  END`

  const solarUrlSignal = `regexp_matches(
    lower(url),
    '(?:^|[^a-z])(?:solar|photovoltaic|renewable|bess|battery[-_ ]?storage|energy[-_ ]?storage|clean[-_ ]?energy)(?:[^a-z]|$)'
  )`

  const jobDetailPredicate = `(
    (ends_with(host, '.myworkdayjobs.com') AND regexp_matches(lower(url_path), '/job/'))
    OR (host IN ('boards.greenhouse.io', 'job-boards.greenhouse.io', 'boards.eu.greenhouse.io') AND regexp_matches(lower(url_path), '^/[^/]+/jobs?/[^/]+'))
    OR (host = 'jobs.lever.co' AND regexp_matches(lower(url_path), '^/[^/]+/[0-9a-f-]{16,}'))
    OR (host = 'jobs.jobvite.com' AND regexp_matches(lower(url_path), '^/[^/]+/(?:job|jobs)/'))
    OR (host = 'jobs.smartrecruiters.com' AND regexp_matches(lower(url_path), '^/[^/]+/[^/]+'))
    OR (host = 'jobs.ashbyhq.com' AND regexp_matches(lower(url_path), '^/[^/]+/[^/]+'))
    OR (ends_with(host, '.icims.com') AND regexp_matches(lower(url_path), '/jobs?/[^/]+'))
    OR (ends_with(host, '.taleo.net') AND regexp_matches(lower(url_path), 'jobdetail|careersection'))
    OR ((ends_with(host, '.successfactors.com') OR ends_with(host, '.successfactors.eu')) AND regexp_matches(lower(url_path), '/job/'))
    OR ((host = 'jobs.bamboohr.com' OR ends_with(host, '.bamboohr.com')) AND regexp_matches(lower(url_path), '/careers?/[^/]+'))
    OR ((host = 'jobs.dayforcehcm.com' OR ends_with(host, '.dayforcehcm.com')) AND regexp_matches(lower(url_path), '/jobs?/'))
    OR (ends_with(host, '.oraclecloud.com') AND regexp_matches(lower(url_path), '/job/'))
    OR ((host = 'recruiting.ultipro.com' OR ends_with(host, '.ultipro.com')) AND regexp_matches(lower(url_path), '/job|opportunity|requisition'))
    OR (ends_with(host, '.ukg.com') AND regexp_matches(lower(url_path), '/job|opportunity|requisition'))
    OR ((host = 'recruiting.paylocity.com' OR ends_with(host, '.paylocity.com')) AND regexp_matches(lower(url_path), '/jobs?/'))
    OR (host = 'workforcenow.adp.com' AND regexp_matches(lower(url), 'recruit|job|position'))
    OR (ends_with(host, '.paycomonline.net') AND regexp_matches(lower(url), 'job|career|position'))
    OR (ends_with(host, '.jobs2web.com') AND regexp_matches(lower(url_path), '/job/'))
    OR (
      ${solarUrlSignal}
      AND regexp_matches(lower(url_path), '/(?:job|jobs|career|careers|requisition|requisitions|position|positions|vacancy|vacancies|employment|opportunit)(?:/|[-_?=&]|$)')
    )
  )`

  return `SET preserve_insertion_order = false;
SET enable_progress_bar = false;
SET threads = ${threads};
SET memory_limit = ${sqlString(memoryLimit)};
SET temp_directory = ${sqlPath(tempDir)};

COPY (
  WITH base AS (
    SELECT
      crawl,
      url_surtkey,
      url,
      lower(url_host_name) AS host,
      coalesce(url_path, '/') AS url_path,
      fetch_time,
      fetch_status,
      content_digest,
      content_mime_type,
      content_mime_detected,
      content_charset,
      content_languages,
      warc_filename,
      warc_record_offset,
      warc_record_length
    FROM read_parquet([
      ${parquetFiles.map((filename) => sqlPath(filename)).join(',\n      ')}
    ], hive_partitioning = true, union_by_name = true)
    WHERE fetch_status = 200
      AND (
        lower(coalesce(content_mime_type, '')) LIKE '%html%'
        OR lower(coalesce(content_mime_detected, '')) LIKE '%html%'
      )
  ),
  candidates AS (
    SELECT *
    FROM base
    WHERE (
      ${atsPredicate}
      OR (
        ${solarUrlSignal}
        AND regexp_matches(lower(url_path), '/(?:job|jobs|career|careers|requisition|requisitions|position|positions|vacancy|vacancies|employment|opportunit)(?:/|[-_?=&]|$)')
      )
    )
  ),
  classified AS (
    SELECT
      *,
      ${providerExpr} AS provider,
      ${tenantExpr} AS tenant,
      ${patternExpr} AS source_pattern,
      ${solarUrlSignal} AS solar_url_signal
    FROM candidates
    WHERE ${jobDetailPredicate}
  )
  SELECT
    provider,
    provider || ':' || tenant AS source_key,
    source_pattern,
    host,
    solar_url_signal,
    url_surtkey AS urlkey,
    strftime(fetch_time, '%Y%m%d%H%M%S') AS timestamp,
    url,
    content_mime_type AS mime,
    content_mime_detected AS mime_detected,
    cast(fetch_status AS VARCHAR) AS status,
    content_digest AS digest,
    cast(warc_record_length AS VARCHAR) AS length,
    cast(warc_record_offset AS VARCHAR) AS "offset",
    warc_filename AS filename,
    content_languages AS languages,
    content_charset AS encoding,
    crawl
  FROM classified
  WHERE tenant IS NOT NULL AND tenant <> ''
) TO ${sqlPath(batchOutput)} (FORMAT JSON, ARRAY false);
`
}

async function runDuckDb(executable: string, sqlFile: string) {
  await access(executable)
  const sql = await readFile(sqlFile, 'utf8')
  await new Promise<void>((resolve, reject) => {
    const child = spawn(path.resolve(executable), [':memory:'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'inherit', 'inherit'],
      windowsHide: true,
    })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`DuckDB exited with code ${code}`)))
    child.stdin.on('error', reject)
    child.stdin.end(sql)
  })
}

function desiredSampleCount(captures: number, maxSamples: number) {
  let desired = 1
  if (captures <= 3) desired = captures
  else if (captures <= 9) desired = 3
  else if (captures <= 24) desired = 4
  else if (captures <= 49) desired = 5
  else if (captures <= 99) desired = 6
  else if (captures <= 249) desired = 8
  else if (captures <= 499) desired = 10
  else desired = 12
  return Math.min(captures, desired, maxSamples)
}

function uniqueCaptures(rows: CandidateCaptureRow[]) {
  const byKey = new Map<string, CandidateCaptureRow>()
  for (const row of rows) {
    const key = `${row.url}|${row.digest}`
    if (!byKey.has(key)) byKey.set(key, row)
  }
  return [...byKey.values()].sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a.url.localeCompare(b.url))
}

function spreadPick<T>(values: T[], count: number) {
  if (count <= 0) return []
  if (values.length <= count) return values
  if (count === 1) return [values[Math.floor(values.length / 2)]]
  const indexes = new Set(
    Array.from({ length: count }, (_, index) => Math.round(index * (values.length - 1) / (count - 1))),
  )
  return [...indexes].map((index) => values[index])
}

function chooseSamples(rows: CandidateCaptureRow[], maxSamples: number) {
  const unique = uniqueCaptures(rows)
  const desired = desiredSampleCount(unique.length, maxSamples)
  const solar = unique.filter((row) => row.solar_url_signal)
  const ordinary = unique.filter((row) => !row.solar_url_signal)
  const picked: CandidateCaptureRow[] = []

  for (const row of spreadPick(solar, Math.min(solar.length, desired))) picked.push(row)
  const remaining = desired - picked.length
  if (remaining > 0) {
    for (const row of spreadPick(ordinary, remaining)) picked.push(row)
  }
  return picked.sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a.url.localeCompare(b.url))
}

function toManifestRow(row: CandidateCaptureRow, year: number) {
  return {
    urlkey: row.urlkey,
    timestamp: row.timestamp,
    url: row.url,
    mime: row.mime,
    'mime-detected': row.mime_detected,
    status: row.status,
    digest: row.digest,
    length: row.length,
    offset: row.offset,
    filename: row.filename,
    languages: row.languages,
    encoding: row.encoding,
    crawlId: row.crawl,
    year,
    employerId: stableId(row.source_key),
    employerName: displayName(row.source_key),
    atsProvider: row.provider,
    pattern: row.source_pattern,
    discoverySourceKey: row.source_key,
    discoverySolarUrlSignal: row.solar_url_signal,
  }
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const outputDir = path.resolve(options.outputDir)
  const batchDir = path.join(outputDir, 'employer-discovery-batches-v2')
  const tempDir = path.join(outputDir, 'duckdb-tmp')
  await mkdir(batchDir, { recursive: true })
  await mkdir(tempDir, { recursive: true })

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
  const batches = chunks(parquetFiles, options.filesPerBatch)

  await writeFile(path.join(outputDir, 'employer-discovery-plan.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    pipelineVersion: 2,
    year: options.year,
    crawlIds: selectedCrawls,
    parquetFiles: parquetFiles.length,
    batches: batches.length,
    filesPerBatch: options.filesPerBatch,
    maxSamplesPerSource: options.maxSamplesPerSource,
    scope: 'open ATS tenant discovery plus solar-signaled first-party job URLs; no employer registry filter',
    retention: 'all candidate capture pointers are retained locally so later sampling does not require another Parquet scan',
    duckdb: { threads: options.threads, memoryLimit: options.memoryLimit },
  }, null, 2)}\n`, 'utf8')

  console.log(`[employer-discovery] v2 | ${selectedCrawls.join(', ')} | ${parquetFiles.length} Parquet files | ${batches.length} batch(es) | OPEN employer discovery | ${options.threads} threads | ${options.memoryLimit}`)

  const failures: Array<{ batch: number; parquetFiles: string[]; error: string }> = []

  for (let index = 0; index < batches.length; index += 1) {
    const label = String(index + 1).padStart(4, '0')
    const batchOutput = path.join(batchDir, `batch-${label}.jsonl`)
    const tempOutput = `${batchOutput}.tmp`
    const batchSql = path.join(batchDir, `batch-${label}.sql`)

    try {
      await access(batchOutput)
      console.log(`[employer-discovery] batch ${index + 1}/${batches.length}: cached`)
      continue
    } catch {
      // Missing complete output: scan this batch.
    }

    await rm(tempOutput, { force: true })
    await writeFile(
      batchSql,
      buildBatchSql(batches[index], tempOutput, tempDir, options.threads, options.memoryLimit),
      'utf8',
    )
    if (options.sqlOnly) {
      console.log(`[employer-discovery] batch ${index + 1}/${batches.length}: SQL generated`)
      continue
    }

    console.log(`[employer-discovery] batch ${index + 1}/${batches.length}: scanning ${batches[index].length} Parquet file(s)`)
    try {
      await runDuckDb(options.duckdb, batchSql)
      await rename(tempOutput, batchOutput)
    } catch (error) {
      await rm(tempOutput, { force: true })
      failures.push({ batch: index + 1, parquetFiles: batches[index], error: String(error) })
      console.warn(`[employer-discovery] batch ${index + 1}/${batches.length}: FAILED; continuing`)
    }
  }

  if (options.sqlOnly) return

  const allCaptures: CandidateCaptureRow[] = []
  const sources = new Map<string, SourceAggregate>()

  for (let index = 0; index < batches.length; index += 1) {
    const batchFile = path.join(batchDir, `batch-${String(index + 1).padStart(4, '0')}.jsonl`)
    let body: string
    try {
      body = await readFile(batchFile, 'utf8')
    } catch {
      continue
    }

    for (const line of body.split(/\r?\n/).filter(Boolean)) {
      const row = JSON.parse(line) as CandidateCaptureRow
      allCaptures.push(row)
      const current = sources.get(row.source_key) ?? {
        provider: row.provider,
        sourceKey: row.source_key,
        sourcePattern: row.source_pattern,
        host: row.host,
        captures: [],
      }
      current.captures.push(row)
      sources.set(row.source_key, current)
    }
  }

  const sourceRows = [...sources.values()].map((source) => {
    const unique = uniqueCaptures(source.captures)
    const selected = chooseSamples(source.captures, options.maxSamplesPerSource)
    return {
      provider: source.provider,
      sourceKey: source.sourceKey,
      sourcePattern: source.sourcePattern,
      host: source.host,
      captures: unique.length,
      rawCaptureRows: source.captures.length,
      solarUrlHits: unique.filter((row) => row.solar_url_signal).length,
      firstSeen: unique[0]?.timestamp ?? '',
      lastSeen: unique.at(-1)?.timestamp ?? '',
      sampleCount: selected.length,
      sampleStrategy: 'solar-url-priority-then-time-spread',
      samples: selected.map((row) => toManifestRow(row, options.year)),
    }
  }).sort((a, b) =>
    Number(b.solarUrlHits > 0) - Number(a.solarUrlHits > 0)
    || b.solarUrlHits - a.solarUrlHits
    || b.captures - a.captures
    || a.sourceKey.localeCompare(b.sourceKey),
  )

  const provisionalEmployers = sourceRows.map((source) => ({
    employerId: stableId(source.sourceKey),
    employerName: displayName(source.sourceKey),
    atsProvider: source.provider,
    patterns: [source.sourcePattern],
    notes: `Provisional employer/source discovered from Common Crawl URL Index. sourceKey=${source.sourceKey}; not validated as solar until content sampling.`,
  }))

  const manifest = sourceRows.flatMap((source) => source.samples)

  const reviewHeader = [
    'source_key', 'provider', 'pattern', 'host', 'captures', 'solar_url_hits',
    'first_seen', 'last_seen', 'sample_count', 'sample_strategy', 'validation_status', 'notes',
  ]
  const reviewRows = sourceRows.map((source) => [
    source.sourceKey,
    source.provider,
    source.sourcePattern,
    source.host,
    source.captures,
    source.solarUrlHits,
    source.firstSeen,
    source.lastSeen,
    source.sampleCount,
    source.sampleStrategy,
    '',
    '',
  ])

  await writeFile(
    path.join(outputDir, 'candidate-captures.jsonl'),
    allCaptures.map((row) => `${JSON.stringify(row)}\n`).join(''),
    'utf8',
  )
  await writeFile(path.join(outputDir, 'source-candidates.jsonl'), sourceRows.map((row) => `${JSON.stringify(row)}\n`).join(''), 'utf8')
  await writeFile(path.join(outputDir, 'provisional-employers.json'), `${JSON.stringify(provisionalEmployers, null, 2)}\n`, 'utf8')
  await writeFile(path.join(outputDir, 'index-records.jsonl'), manifest.map((row) => `${JSON.stringify(row)}\n`).join(''), 'utf8')
  await writeFile(path.join(outputDir, 'employer-discovery-review.csv'), [
    reviewHeader.map(csvCell).join(','),
    ...reviewRows.map((row) => row.map(csvCell).join(',')),
  ].join('\n') + '\n', 'utf8')
  await writeFile(path.join(outputDir, 'employer-discovery-failures.json'), `${JSON.stringify(failures, null, 2)}\n`, 'utf8')

  const sampleCountDistribution = Object.fromEntries(
    [...new Set(sourceRows.map((source) => source.sampleCount))]
      .sort((a, b) => a - b)
      .map((count) => [String(count), sourceRows.filter((source) => source.sampleCount === count).length]),
  )

  const report = {
    generatedAt: new Date().toISOString(),
    pipelineVersion: 2,
    year: options.year,
    crawlIds: selectedCrawls,
    parquetFiles: parquetFiles.length,
    failedBatches: failures.length,
    candidateCaptureRows: allCaptures.length,
    sourceCandidates: sourceRows.length,
    providers: Object.fromEntries([...new Set(sourceRows.map((source) => source.provider))].sort().map((provider) => [
      provider,
      sourceRows.filter((source) => source.provider === provider).length,
    ])),
    sourcesWithSolarUrlSignals: sourceRows.filter((source) => source.solarUrlHits > 0).length,
    sampleCapturesPrepared: manifest.length,
    sampleCountDistribution,
    maxSamplesPerSource: options.maxSamplesPerSource,
    samplingStrategy: 'all captures for <=3; then 3/4/5/6/8/10/12 by source size, prioritizing solar-signaled URLs and spreading the remainder through time',
    registryFilterApplied: false,
    candidateCapturePointersRetained: true,
  }
  await writeFile(path.join(outputDir, 'employer-discovery-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
  console.log(`[employer-discovery] sample manifest: ${path.relative(process.cwd(), path.join(outputDir, 'index-records.jsonl'))}`)
  console.log(`[employer-discovery] all candidate pointers retained: ${path.relative(process.cwd(), path.join(outputDir, 'candidate-captures.jsonl'))}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
