import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { gunzipSync } from 'node:zlib'
import path from 'node:path'
import type { HistoricalEmployer } from '../lib/historical-jobs/commonCrawl'
import { buildUrlIndexSql, targetsFromEmployers } from '../lib/historical-jobs/urlIndex'

const INDEX_ROOT = 'https://index.commoncrawl.org'
const DATA_ROOT = 'https://data.commoncrawl.org'
const DEFAULT_YEARS = [2016, 2020, 2024]
const DEFAULT_DUCKDB = path.join('.tools', 'duckdb', 'duckdb.exe')

interface CliOptions {
  years: number[]
  crawlIds: string[]
  employerIds: string[]
  maxCrawlsPerYear: number
  outputDir: string
  duckdbPath: string
  parquetDir: string
  registry: string
  sqlOnly: boolean
}

function stringArg(args: string[], flag: string, fallback: string) {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function numberArg(args: string[], flag: string, fallback: number) {
  const value = Number(stringArg(args, flag, String(fallback)))
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid ${flag}`)
  return value
}

function listArg(args: string[], flag: string) {
  return stringArg(args, flag, '').split(',').map((value) => value.trim()).filter(Boolean)
}

function parseOptions(args: string[]): CliOptions {
  const years = listArg(args, '--years').map(Number).filter(Number.isFinite)
  return {
    years: years.length ? years : DEFAULT_YEARS,
    crawlIds: listArg(args, '--crawls'),
    employerIds: listArg(args, '--employer-ids'),
    maxCrawlsPerYear: numberArg(args, '--max-crawls-per-year', 1),
    outputDir: stringArg(args, '--output', 'data/common-crawl-historical-jobs/url-index-poc'),
    duckdbPath: stringArg(args, '--duckdb', DEFAULT_DUCKDB),
    parquetDir: stringArg(args, '--parquet-dir', ''),
    registry: stringArg(args, '--registry', 'data/common-crawl-historical-jobs/employers.json'),
    sqlOnly: args.includes('--sql-only'),
  }
}

function spreadSample<T>(values: T[], limit: number) {
  if (values.length <= limit) return values
  if (limit === 1) return [values[Math.floor(values.length / 2)]]
  return Array.from(new Set(Array.from(
    { length: limit },
    (_, index) => Math.round(index * (values.length - 1) / (limit - 1)),
  ))).map((index) => values[index])
}

async function resolveCrawls(options: CliOptions) {
  if (options.crawlIds.length) return options.crawlIds
  const response = await fetch(`${INDEX_ROOT}/collinfo.json`)
  if (!response.ok) throw new Error(`Unable to list Common Crawl collections: ${response.status}`)
  const collections = await response.json() as Array<{ id: string }>
  return options.years.flatMap((year) => spreadSample(
    collections.map((collection) => collection.id)
      .filter((id) => id.startsWith(`CC-MAIN-${year}-`))
      .sort(),
    options.maxCrawlsPerYear,
  ))
}

async function parquetUrlsForCrawl(crawlId: string) {
  const manifestUrl = `${DATA_ROOT}/crawl-data/${crawlId}/cc-index-table.paths.gz`
  const response = await fetch(manifestUrl)
  if (!response.ok) throw new Error(`Unable to download ${manifestUrl}: ${response.status}`)
  const body = gunzipSync(Buffer.from(await response.arrayBuffer())).toString('utf8')
  const paths = body.split(/\r?\n/)
    .filter((value) => value.includes(`/crawl=${crawlId}/subset=warc/`) && value.endsWith('.parquet'))
  if (!paths.length) throw new Error(`No WARC URL Index Parquet files listed for ${crawlId}`)
  return paths.map((value) => `${DATA_ROOT}/${value}`)
}

async function localParquetUrls(root: string, crawlIds: string[]) {
  const found: string[] = []
  async function visit(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const filename = path.join(directory, entry.name)
      if (entry.isDirectory()) await visit(filename)
      else if (entry.isFile() && entry.name.endsWith('.parquet')) found.push(path.resolve(filename).replaceAll('\\', '/'))
    }
  }
  await visit(path.resolve(root))
  const selected = found.filter((filename) =>
    filename.includes('/subset=warc/') && crawlIds.some((crawlId) => filename.includes(`/crawl=${crawlId}/`)),
  )
  if (!selected.length) throw new Error(`No local subset=warc Parquet files found under ${root}`)
  return selected.sort()
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

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const outputDir = path.resolve(options.outputDir)
  await mkdir(outputDir, { recursive: true })

  const registry = JSON.parse(await readFile(options.registry, 'utf8')) as HistoricalEmployer[]
  const employers = options.employerIds.length
    ? registry.filter((employer) => options.employerIds.includes(employer.employerId))
    : registry
  const foundIds = new Set(employers.map((employer) => employer.employerId))
  const missingIds = options.employerIds.filter((id) => !foundIds.has(id))
  if (missingIds.length) throw new Error(`Unknown employer IDs: ${missingIds.join(', ')}`)

  const crawlIds = await resolveCrawls(options)
  if (!crawlIds.length) throw new Error('No Common Crawl collections found')
  const parquetUrls = options.parquetDir
    ? await localParquetUrls(options.parquetDir, crawlIds)
    : (await Promise.all(crawlIds.map(parquetUrlsForCrawl))).flat()
  const targets = targetsFromEmployers(employers)
  const sqlFile = path.join(outputDir, 'url-index-query.sql')
  const planFile = path.join(outputDir, 'url-index-plan.json')
  const pathsFile = path.join(outputDir, 'url-index-parquet-paths.txt')
  await writeFile(pathsFile, `${parquetUrls.join('\n')}\n`, 'utf8')
  await writeFile(sqlFile, buildUrlIndexSql({ crawlIds, parquetUrls, targets, outputDir }), 'utf8')
  await writeFile(planFile, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    crawlIds,
    employers: employers.map((employer) => employer.employerId),
    targetCount: targets.length,
    parquetFileCount: parquetUrls.length,
    parquetRoot: 's3://commoncrawl/cc-index/table/cc-main/warc/',
    parquetTransport: options.parquetDir ? 'local' : DATA_ROOT,
    parquetDirectory: options.parquetDir || null,
    sqlFile: path.relative(process.cwd(), sqlFile),
  }, null, 2)}\n`, 'utf8')

  console.log(`[url-index] ${crawlIds.length} crawl(s), ${parquetUrls.length} Parquet files, ${employers.length} employers, ${targets.length} URL targets`)
  console.log(`[url-index] SQL: ${path.relative(process.cwd(), sqlFile)}`)
  if (options.sqlOnly) return
  try {
    await runDuckDb(options.duckdbPath, sqlFile)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`DuckDB CLI not found at ${options.duckdbPath}. Install it there or pass --duckdb <path>. The SQL plan was still generated.`)
    }
    throw error
  }
  console.log(`[url-index] manifest: ${path.relative(process.cwd(), path.join(outputDir, 'index-records.jsonl'))}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
