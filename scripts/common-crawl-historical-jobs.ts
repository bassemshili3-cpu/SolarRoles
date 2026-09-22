import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  buildHistoricalJobFeatures,
  extractHttpPayloadFromWarc,
  HISTORICAL_CLASSIFIER_VERSION,
  HISTORICAL_PARSER_VERSION,
  HISTORICAL_TAXONOMY_VERSION,
  parseHistoricalJobHtmlDetailed,
  sha256,
  spreadSample,
  type CommonCrawlRecord,
  type HistoricalEmployer,
  type ParsedHistoricalJob,
} from '../lib/historical-jobs/commonCrawl'

const USER_AGENT = 'SolarRoles historical jobs research/0.1 (contact: hello@solarroles.com)'
const INDEX_ROOT = 'https://index.commoncrawl.org'
const DATA_ROOT = 'https://data.commoncrawl.org'
const DEFAULT_YEARS = [2016, 2020, 2024]

interface IndexedCapture extends CommonCrawlRecord {
  crawlId: string
  year: number
  employerId: string
  employerName: string
  atsProvider: string
  pattern: string
}

interface CliOptions {
  phase: 'all' | 'index' | 'extract'
  employerIds: string[]
  years: number[]
  maxEmployers: number
  maxCrawlsPerYear: number
  maxCapturesPerEmployerYear: number
  indexDelayMs: number
  warcDelayMs: number
  outputDir: string
  reuseHtml: boolean
  localOnly: boolean
}

function numberArg(args: string[], flag: string, fallback: number) {
  const index = args.indexOf(flag)
  if (index < 0) return fallback
  const value = Number(args[index + 1])
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid ${flag}`)
  return value
}

function stringArg(args: string[], flag: string, fallback: string) {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function parseOptions(args: string[]): CliOptions {
  const years = stringArg(args, '--years', DEFAULT_YEARS.join(','))
    .split(',').map(Number).filter(Number.isFinite)
  const phase = stringArg(args, '--phase', 'all')
  if (!['all', 'index', 'extract'].includes(phase)) throw new Error('Invalid --phase; use all, index or extract')
  return {
    phase: phase as CliOptions['phase'],
    employerIds: stringArg(args, '--employer-ids', '').split(',').map((value) => value.trim()).filter(Boolean),
    years,
    maxEmployers: numberArg(args, '--max-employers', 0),
    maxCrawlsPerYear: numberArg(args, '--max-crawls-per-year', 0),
    maxCapturesPerEmployerYear: numberArg(args, '--max-captures-per-employer-year', 12),
    indexDelayMs: numberArg(args, '--index-delay-ms', 1300),
    warcDelayMs: numberArg(args, '--warc-delay-ms', 250),
    outputDir: stringArg(args, '--output', 'data/common-crawl-historical-jobs/poc-2016-2020-2024'),
    reuseHtml: args.includes('--reuse-html'),
    localOnly: args.includes('--local-only'),
  }
}

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function fetchWithRetry(url: string, init: RequestInit, attempts = 4, allowNotFound = false) {
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init)
      if (response.ok) return response
      if (allowNotFound && response.status === 404) return response
      if (![429, 500, 502, 503, 504].includes(response.status)) {
        throw new Error(`${response.status} ${response.statusText}`)
      }
      lastError = new Error(`${response.status} ${response.statusText}`)
      const retryAfter = Number(response.headers.get('retry-after'))
      await sleep(Number.isFinite(retryAfter) ? retryAfter * 1000 : attempt * 3000)
    } catch (error) {
      lastError = error
      if (attempt < attempts) await sleep(attempt * 3000)
    }
  }
  throw lastError
}

async function collectionsByYear(years: number[], maxPerYear: number) {
  const response = await fetchWithRetry(`${INDEX_ROOT}/collinfo.json`, { headers: { 'user-agent': USER_AGENT } })
  const collections = await response.json() as Array<{ id: string }>
  return new Map(years.map((year) => {
    const all = collections.map((collection) => collection.id)
      .filter((id) => id.startsWith(`CC-MAIN-${year}-`))
      .sort((a, b) => a.localeCompare(b))
    return [year, maxPerYear ? spreadSample(all, maxPerYear) : all]
  }))
}

async function queryIndex(crawlId: string, pattern: string) {
  const url = new URL(`${INDEX_ROOT}/${crawlId}-index`)
  url.searchParams.set('url', pattern)
  url.searchParams.set('output', 'json')
  const response = await fetchWithRetry(url.toString(), { headers: { 'user-agent': USER_AGENT } }, 4, true)
  if (response.status === 404) return []
  const body = await response.text()
  if (!body.trim()) return []
  if (body.trim().startsWith('{"message"')) throw new Error(body.trim())
  const records = body.trim().split(/\r?\n/).map((line) => JSON.parse(line) as CommonCrawlRecord)
    .filter((record) => record.status === '200')
    .filter((record) => `${record.mime ?? ''} ${record['mime-detected'] ?? ''}`.includes('html'))
  return [...new Map(records.map((record) => [record.digest, record])).values()]
}

async function downloadCapture(capture: IndexedCapture) {
  const offset = Number(capture.offset)
  const length = Number(capture.length)
  const response = await fetchWithRetry(`${DATA_ROOT}/${capture.filename}`, {
    headers: {
      'user-agent': USER_AGENT,
      range: `bytes=${offset}-${offset + length - 1}`,
    },
  })
  if (response.status !== 206 && response.status !== 200) throw new Error(`Unexpected WARC status ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

function jsonLine(value: unknown) {
  return `${JSON.stringify(value)}\n`
}

async function readJsonLines<T>(filename: string) {
  const body = await readFile(filename, 'utf8')
  return body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T)
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const root = path.resolve(options.outputDir)
  const rawDir = path.join(root, 'raw')
  const htmlDir = path.join(root, 'html')
  await mkdir(rawDir, { recursive: true })
  await mkdir(htmlDir, { recursive: true })

  const registry = JSON.parse(await readFile('data/common-crawl-historical-jobs/employers.json', 'utf8')) as HistoricalEmployer[]
  const selectedRegistry = options.employerIds.length
    ? registry.filter((employer) => options.employerIds.includes(employer.employerId))
    : registry
  let employers = options.maxEmployers ? selectedRegistry.slice(0, options.maxEmployers) : selectedRegistry
  if (options.employerIds.length && employers.length !== options.employerIds.length) {
    const found = new Set(employers.map((employer) => employer.employerId))
    throw new Error(`Unknown employer IDs: ${options.employerIds.filter((id) => !found.has(id)).join(', ')}`)
  }
  let crawlMap = new Map<number, string[]>()
  let indexed: IndexedCapture[] = []
  let queries: Array<Record<string, unknown>> = []

  if (options.phase === 'extract') {
    indexed = await readJsonLines<IndexedCapture>(path.join(root, 'index-records.jsonl'))
    queries = await readJsonLines<Record<string, unknown>>(path.join(root, 'index-queries.jsonl'))
    if (!options.employerIds.length) {
      const indexedEmployerIds = new Set(queries.map((query) => String(query.employerId)))
      employers = registry.filter((employer) => indexedEmployerIds.has(employer.employerId))
    }
    crawlMap = new Map(options.years.map((year) => [year, [...new Set(queries.filter((query) => query.year === year).map((query) => String(query.crawlId)))].sort()]))
    console.log(`[resume] loaded ${indexed.length} indexed captures`)
  } else {
    crawlMap = await collectionsByYear(options.years, options.maxCrawlsPerYear)
    await writeFile(path.join(root, 'index-records.jsonl'), '')
    for (const year of options.years) {
      const crawls = crawlMap.get(year) ?? []
      for (const employer of employers) {
        for (const crawlId of crawls) {
          for (const pattern of employer.patterns) {
            const startedAt = new Date().toISOString()
            try {
              const records = await queryIndex(crawlId, pattern)
              const enriched = records.map((record) => ({ ...record, crawlId, year, employerId: employer.employerId, employerName: employer.employerName, atsProvider: employer.atsProvider, pattern }))
              indexed.push(...enriched)
              for (const record of enriched) await appendFile(path.join(root, 'index-records.jsonl'), jsonLine(record))
              queries.push({ year, crawlId, employerId: employer.employerId, pattern, matches: records.length, status: records.length ? 'matched' : 'searched_no_capture', startedAt })
              console.log(`[index] ${year} ${crawlId} ${employer.employerId}: ${records.length}`)
            } catch (error) {
              queries.push({ year, crawlId, employerId: employer.employerId, pattern, matches: 0, status: 'query_failed', error: String(error), startedAt })
              console.warn(`[index] failed ${crawlId} ${employer.employerId}: ${String(error)}`)
            }
            await sleep(options.indexDelayMs)
          }
        }
      }
    }
    await writeFile(path.join(root, 'index-queries.jsonl'), queries.map(jsonLine).join(''))
  }

  if (options.phase === 'index') {
    console.log(JSON.stringify({ employers: employers.length, indexQueries: queries.length, indexMatches: indexed.length }, null, 2))
    return
  }

  const selected: IndexedCapture[] = []
  for (const year of options.years) {
    for (const employer of employers) {
      const candidates = indexed
        .filter((capture) => capture.year === year && capture.employerId === employer.employerId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      const unique = [...new Map(candidates.map((capture) => [`${capture.timestamp}|${capture.url}|${capture.digest}`, capture])).values()]
      selected.push(...spreadSample(unique, options.maxCapturesPerEmployerYear))
    }
  }

  const captures: Array<Record<string, unknown>> = []
  const parsedJobsById = new Map<string, ParsedHistoricalJob>()
  const parsedJobObservations: Array<Record<string, unknown>> = []
  const solarUsJobsById = new Map<string, ParsedHistoricalJob>()
  const classificationsById = new Map<string, Record<string, unknown>>()
  await writeFile(path.join(root, 'captures.jsonl'), '')
  for (const capture of selected) {
    const employer = employers.find((candidate) => candidate.employerId === capture.employerId)
    if (!employer) continue
    const captureId = sha256(`${capture.crawlId}|${capture.timestamp}|${capture.url}|${capture.digest}`)
    try {
      const warcPath = path.join(rawDir, `${captureId}.warc.gz`)
      const htmlPath = path.join(htmlDir, `${captureId}.html`)
      let html: string
      let statusLine: string
      try {
        if (!options.reuseHtml) throw new Error('Local reuse disabled')
        html = await readFile(htmlPath, 'utf8')
        statusLine = 'REUSED LOCAL HTML'
      } catch {
        if (options.localOnly) throw new Error('LOCAL_HTML_MISSING')
        const compressed = await downloadCapture(capture)
        await writeFile(warcPath, compressed)
        const payload = extractHttpPayloadFromWarc(compressed)
        statusLine = payload.statusLine
        html = payload.body.toString(capture.encoding?.toLowerCase() === 'iso-8859-1' ? 'latin1' : 'utf8')
        await writeFile(htmlPath, html)
      }
      const parsed = parseHistoricalJobHtmlDetailed(html, capture.url, employer)
      const job = parsed.job
      if (job) {
        parsedJobsById.set(job.historicalJobId, job)
        parsedJobObservations.push({
          captureId,
          crawlId: capture.crawlId,
          captureTimestamp: capture.timestamp,
          digest: capture.digest,
          warcFilename: capture.filename,
          warcOffset: Number(capture.offset),
          warcLength: Number(capture.length),
          ...job,
        })
        classificationsById.set(job.historicalJobId, {
          historicalJobId: job.historicalJobId,
          isUsJob: parsed.isUsJob,
          isSolarRelated: parsed.isSolarRelated,
          usEvidence: parsed.usEvidence,
          solarEvidence: parsed.solarEvidence,
          rejectionReason: parsed.rejectionReason,
          classifierVersion: HISTORICAL_CLASSIFIER_VERSION,
        })
        if (parsed.isUsJob && parsed.isSolarRelated) solarUsJobsById.set(job.historicalJobId, job)
      }
      const row = {
        captureId,
        historicalJobId: job?.historicalJobId ?? null,
        employerId: capture.employerId,
        year: capture.year,
        crawlId: capture.crawlId,
        captureTimestamp: capture.timestamp,
        sourceUrl: capture.url,
        digest: capture.digest,
        warcFilename: capture.filename,
        warcOffset: Number(capture.offset),
        warcLength: Number(capture.length),
        localWarcPath: path.relative(process.cwd(), warcPath),
        localHtmlPath: path.relative(process.cwd(), htmlPath),
        httpStatusLine: statusLine,
        parsedHistoricalJobId: job?.historicalJobId ?? null,
        extractionStatus: job
          ? parsed.isUsJob && parsed.isSolarRelated ? 'valid_solar_us_job' : 'parsed_non_target_job'
          : 'not_a_job_page',
        rejectionReason: parsed.rejectionReason,
        isJobPage: parsed.isJobPage,
        isUsJob: parsed.isUsJob,
        isSolarRelated: parsed.isSolarRelated,
        usEvidence: parsed.usEvidence,
        solarEvidence: parsed.solarEvidence,
        parserVersion: HISTORICAL_PARSER_VERSION,
      }
      captures.push(row)
      await appendFile(path.join(root, 'captures.jsonl'), jsonLine(row))
      console.log(`[warc] ${capture.year} ${capture.employerId}: ${job ? `${job.title} [${parsed.isUsJob && parsed.isSolarRelated ? 'solar-us' : 'parsed'}]` : 'not-job'}`)
    } catch (error) {
      const localHtmlMissing = String(error).includes('LOCAL_HTML_MISSING')
      const row = { captureId, historicalJobId: null, employerId: capture.employerId, year: capture.year, crawlId: capture.crawlId, captureTimestamp: capture.timestamp, sourceUrl: capture.url, extractionStatus: localHtmlMissing ? 'local_html_missing' : 'download_or_parse_failed', rejectionReason: localHtmlMissing ? 'local_html_missing' : null, parserVersion: HISTORICAL_PARSER_VERSION, error: String(error) }
      captures.push(row)
      await appendFile(path.join(root, 'captures.jsonl'), jsonLine(row))
      console.warn(`[warc] failed ${capture.url}: ${String(error)}`)
    }
    await sleep(options.warcDelayMs)
  }

  const parsedJobs = [...parsedJobsById.values()]
  const solarUsJobs = [...solarUsJobsById.values()]
  const classifications = [...classificationsById.values()]
  const features = solarUsJobs.map(buildHistoricalJobFeatures)

  await writeFile(path.join(root, 'parsed-job-observations.jsonl'), parsedJobObservations.map(jsonLine).join(''))
  await writeFile(path.join(root, 'parsed-jobs.jsonl'), parsedJobs.map(jsonLine).join(''))
  await writeFile(path.join(root, 'job-classifications.jsonl'), classifications.map(jsonLine).join(''))
  await writeFile(path.join(root, 'solar-us-jobs.jsonl'), solarUsJobs.map(jsonLine).join(''))
  await writeFile(path.join(root, 'solar-us-job-features.jsonl'), features.map(jsonLine).join(''))
  // Backward-compatible alias for older tooling. Prefer solar-us-jobs.jsonl in new work.
  await writeFile(path.join(root, 'historical-jobs.jsonl'), solarUsJobs.map(jsonLine).join(''))

  const yearly = options.years.map((year) => {
    const yearCaptures = captures.filter((capture) => capture.year === year)
    const parsedIds = new Set(yearCaptures.map((capture) => capture.parsedHistoricalJobId).filter(Boolean))
    const solarUsIds = new Set(yearCaptures
      .filter((capture) => capture.extractionStatus === 'valid_solar_us_job')
      .map((capture) => capture.parsedHistoricalJobId)
      .filter(Boolean))
    const yearParsedJobs = parsedJobs.filter((job) => parsedIds.has(job.historicalJobId))
    const yearSolarUsJobs = solarUsJobs.filter((job) => solarUsIds.has(job.historicalJobId))
    return {
      year,
      indexMatches: indexed.filter((capture) => capture.year === year).length,
      capturesAttempted: yearCaptures.length,
      capturesDownloaded: yearCaptures.filter((capture) => !['download_or_parse_failed', 'local_html_missing'].includes(String(capture.extractionStatus))).length,
      parsedJobs: yearParsedJobs.length,
      validSolarUsJobs: yearSolarUsJobs.length,
      employersRepresented: new Set(yearSolarUsJobs.map((job) => job.employerId)).size,
      completeDescriptions: yearSolarUsJobs.filter((job) => job.descriptionText.length >= 300).length,
      descriptionsCompletePct: yearSolarUsJobs.length ? Number((100 * yearSolarUsJobs.filter((job) => job.descriptionText.length >= 300).length / yearSolarUsJobs.length).toFixed(1)) : null,
      parsedJobYieldPct: yearCaptures.length ? Number((100 * yearCaptures.filter((capture) => capture.parsedHistoricalJobId).length / yearCaptures.length).toFixed(1)) : null,
      solarUsYieldPct: yearCaptures.length ? Number((100 * yearCaptures.filter((capture) => capture.extractionStatus === 'valid_solar_us_job').length / yearCaptures.length).toFixed(1)) : null,
    }
  })
  const employerCoverage = options.years.flatMap((year) => employers.map((employer) => {
    const employerQueries = queries.filter((query) => query.year === year && query.employerId === employer.employerId)
    const employerCaptures = captures.filter((capture) => capture.year === year && capture.employerId === employer.employerId)
    return {
      year,
      employerId: employer.employerId,
      employerName: employer.employerName,
      atsProvider: employer.atsProvider,
      domainSearched: true,
      indexMatches: indexed.filter((capture) => capture.year === year && capture.employerId === employer.employerId).length,
      warcDownloads: employerCaptures.filter((capture) => !['download_or_parse_failed', 'local_html_missing'].includes(String(capture.extractionStatus))).length,
      parsedJobs: new Set(employerCaptures.map((capture) => capture.parsedHistoricalJobId).filter(Boolean)).size,
      validJobs: new Set(employerCaptures
        .filter((capture) => capture.extractionStatus === 'valid_solar_us_job')
        .map((capture) => capture.parsedHistoricalJobId)
        .filter(Boolean)).size,
      coverageStatus: employerQueries.some((query) => query.status === 'query_failed') ? 'query_failed'
        : employerCaptures.some((capture) => capture.extractionStatus === 'valid_solar_us_job') ? 'covered'
          : employerQueries.some((query) => Number(query.matches) > 0) ? 'captures_without_valid_jobs'
            : 'searched_no_capture',
    }
  }))
  const rejectionBreakdown = Object.fromEntries(
    [...new Set(captures.map((capture) => String(capture.rejectionReason ?? '')).filter(Boolean))]
      .sort()
      .map((reason) => [reason, captures.filter((capture) => capture.rejectionReason === reason).length]),
  )
  const report = {
    generatedAt: new Date().toISOString(),
    parserVersion: HISTORICAL_PARSER_VERSION,
    classifierVersion: HISTORICAL_CLASSIFIER_VERSION,
    taxonomyVersion: HISTORICAL_TAXONOMY_VERSION,
    options,
    crawls: Object.fromEntries([...crawlMap.entries()]),
    totals: {
      employers: employers.length,
      indexQueries: queries.length,
      indexMatches: indexed.length,
      capturesAttempted: captures.length,
      parsedJobObservations: parsedJobObservations.length,
      distinctParsedJobs: parsedJobs.length,
      distinctValidSolarUsJobs: solarUsJobs.length,
    },
    rejectionBreakdown,
    yearly,
    employerCoverage,
    manualReview: { status: 'pending', falsePositiveRate: null },
  }
  await writeFile(path.join(root, 'quality-report.json'), `${JSON.stringify(report, null, 2)}\n`)

  const reviewRows = spreadSample(solarUsJobs.sort((a, b) => a.datePosted?.localeCompare(b.datePosted ?? '') ?? 0), 30)
  const reviewHeader = ['historical_job_id', 'employer', 'title', 'location', 'source_url', 'description_excerpt', 'review_outcome', 'review_reason']
  const reviewCsv = [reviewHeader.map(csvCell).join(','), ...reviewRows.map((job) => [job.historicalJobId, job.employerName, job.title, job.locationRaw, job.sourceUrl, job.descriptionText.slice(0, 500), '', ''].map(csvCell).join(','))].join('\n')
  await writeFile(path.join(root, 'manual-review.csv'), `${reviewCsv}\n`)
  console.log(JSON.stringify(report.totals, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
