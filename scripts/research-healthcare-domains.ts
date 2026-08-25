import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { LinkupClient } from 'linkup-sdk'
import path from 'node:path'

type CsvRow = Record<string, string>

type LinkupResult = {
  name?: string
  url?: string
  content?: string
}

type LinkupResponse = {
  results?: LinkupResult[]
}

const DEFAULT_LIMIT = 4_000
const DEFAULT_CONCURRENCY = 5
const BATCH_PAUSE_MS = 250

// Search results from these domains never establish an employer's official site.
const EXCLUDED_DOMAINS = new Set([
  'aol.com', 'assistedliving.org', 'bing.com', 'care.com', 'carelistings.com',
  'caring.com', 'careerbuilder.com', 'cms.gov', 'elderlifefinancial.com',
  'facebook.com', 'google.com', 'health.usnews.com', 'healthgrades.com', 'indeed.com',
  'linkedin.com', 'mapquest.com', 'medicare.gov', 'mycaringplan.com', 'nursa.com',
  'nursinghomecompare.com', 'nursinghomes.com', 'propublica.org', 'senioradvice.com',
  'seniorhousingnet.com', 'seniorly.com', 'yelp.com', 'ziprecruiter.com',
])

function parseArgs() {
  const args = process.argv.slice(2)
  const valueAfter = (flag: string) => {
    const index = args.indexOf(flag)
    if (index >= 0) return args[index + 1]
    return args.find((argument) => argument.startsWith(`${flag}=`))?.slice(flag.length + 1)
  }

  return {
    nursingHomesPath: valueAfter('--nursing-homes') ?? path.join(process.cwd(), 'data', 'healthcare-provider-targets', 'nursing-home-targets.csv'),
    homeHealthPath: valueAfter('--home-health') ?? path.join(process.cwd(), 'data', 'healthcare-provider-targets', 'home-health-research-targets.csv'),
    outputDirectory: valueAfter('--out') ?? path.join(process.cwd(), 'data', 'healthcare-provider-targets'),
    limit: toPositiveInteger(valueAfter('--limit'), DEFAULT_LIMIT),
    nursingHomeLimit: valueAfter('--nursing-home-limit'),
    concurrency: toPositiveInteger(valueAfter('--concurrency'), DEFAULT_CONCURRENCY),
  }
}

function toPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function parseCsv(source: string): CsvRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    const next = source[index + 1]
    if (character === '"') {
      if (quoted && next === '"') {
        value += '"'
        index += 1
      } else quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(value)
      value = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(value)
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
      value = ''
    } else value += character
  }

  if (value.length > 0 || row.length > 0) rows.push([...row, value])
  const [headers = [], ...records] = rows
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])))
}

function csvEscape(value: unknown) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

async function writeCsv(filePath: string, rows: CsvRow[]) {
  const headers = rows.length === 0 ? [] : Object.keys(rows[0])
  const output = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\n')
  await writeFile(filePath, `${output}\n`, 'utf8')
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

function isExcludedDomain(domain: string) {
  return [...EXCLUDED_DOMAINS].some((excluded) => domain === excluded || domain.endsWith(`.${excluded}`))
}

function nameTokens(name: string) {
  const ignored = new Set(['and', 'care', 'center', 'health', 'home', 'inc', 'llc', 'of', 'the'])
  return name.toLowerCase().match(/[a-z]{4,}/g)?.filter((token) => !ignored.has(token)).slice(0, 3) ?? []
}

function chooseOfficialResult(providerName: string, results: LinkupResult[]) {
  const tokens = nameTokens(providerName)
  const candidates = results
    .filter((result): result is Required<Pick<LinkupResult, 'url'>> & LinkupResult => Boolean(result.url))
    .map((result) => {
      const domain = hostname(result.url)
      const searchableText = `${result.name ?? ''} ${result.content ?? ''} ${domain}`.toLowerCase()
      const nameMatches = tokens.filter((token) => searchableText.includes(token)).length
      return { ...result, domain, nameMatches, excluded: isExcludedDomain(domain) }
    })
    .filter((result) => result.domain && !result.excluded)
    .sort((left, right) => right.nameMatches - left.nameMatches)

  return candidates[0]
}

function interleaveByState(rows: CsvRow[]) {
  const byState = new Map<string, CsvRow[]>()
  for (const row of rows.sort((left, right) => Number(right.targetScore) - Number(left.targetScore))) {
    const state = row.state || 'unknown'
    const entries = byState.get(state) ?? []
    entries.push(row)
    byState.set(state, entries)
  }

  const states = [...byState.keys()].sort()
  const ordered: CsvRow[] = []
  let hasEntries = true
  while (hasEntries) {
    hasEntries = false
    for (const state of states) {
      const entry = byState.get(state)?.shift()
      if (entry) {
        ordered.push(entry)
        hasEntries = true
      }
    }
  }
  return ordered
}

async function linkupSearch(client: LinkupClient, query: string) {
  return (await client.search({
    query,
    depth: 'standard',
    outputType: 'searchResults',
    includeImages: false,
    maxResults: 10,
    excludeDomains: [...EXCLUDED_DOMAINS],
  })) as LinkupResponse
}

function describeLinkupError(caught: unknown) {
  if (!(caught instanceof Error)) return String(caught)

  const error = caught as Error & {
    status?: number
    statusCode?: number
    code?: string
    details?: unknown
  }
  const metadata = {
    name: error.name,
    status: error.status ?? error.statusCode,
    code: error.code,
    details: error.details,
  }
  const populatedMetadata = Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined),
  )

  return Object.keys(populatedMetadata).length
    ? `${error.message} ${JSON.stringify(populatedMetadata)}`
    : error.message
}

async function main() {
  const apiKey = process.env.LINKUP_API_KEY ?? process.env.linkup_api
  if (!apiKey) throw new Error('Missing LINKUP_API_KEY (or linkup_api) in the environment.')
  const client = new LinkupClient({ apiKey })

  const options = parseArgs()
  const outputPath = path.join(options.outputDirectory, 'healthcare-domain-discovery-linkup.csv')
  const [nursingHomesCsv, homeHealthCsv] = await Promise.all([
    readFile(options.nursingHomesPath, 'utf8'),
    readFile(options.homeHealthPath, 'utf8'),
  ])
  const nursingHomes = interleaveByState(parseCsv(nursingHomesCsv)).map((row) => ({ ...row, providerType: 'nursing_home' }))
  const homeHealth = interleaveByState(parseCsv(homeHealthCsv)).map((row) => ({ ...row, providerType: 'home_health' }))
  // Keep the sample representative of both datasets. With the current CMS
  // exports, nursing homes make up roughly 35% of the filtered shortlist.
  const requestedNursingHomeLimit = toPositiveInteger(options.nursingHomeLimit, Math.round(options.limit * 0.35))
  const nursingHomeLimit = Math.min(requestedNursingHomeLimit, options.limit)
  const homeHealthLimit = options.limit - nursingHomeLimit
  const queue = [...nursingHomes.slice(0, nursingHomeLimit), ...homeHealth.slice(0, homeHealthLimit)]

  let completed: CsvRow[] = []
  try {
    completed = parseCsv(await readFile(outputPath, 'utf8'))
  } catch {
    // First run: no output exists yet.
  }
  const terminalStatuses = new Set(['candidate_found', 'no_official_domain_candidate'])
  const alreadyProcessed = new Set(
    completed
      .filter((row) => terminalStatuses.has(row.discoveryStatus))
      .map((row) => `${row.providerType}:${row.ccn}`)
  )
  const pending = queue.filter((row) => !alreadyProcessed.has(`${row.providerType}:${row.ccn}`))

  await mkdir(options.outputDirectory, { recursive: true })
  console.log(`Linkup budget: ${options.limit}; selected: ${queue.length}; already completed: ${completed.length}; remaining: ${pending.length}`)

  for (let batchStart = 0; batchStart < pending.length; batchStart += options.concurrency) {
    const batch = pending.slice(batchStart, batchStart + options.concurrency)
    const batchResults = await Promise.all(batch.map(async (provider) => {
      const query = `Find the official website of ${provider.providerName}, a healthcare provider in ${provider.city}, ${provider.state}. Exclude directories, reviews, government listings, job boards, and social media.`
    let status = 'candidate_found'
    let result: ReturnType<typeof chooseOfficialResult> | undefined
    let error = ''

    try {
        const response = await linkupSearch(client, query)
        result = chooseOfficialResult(provider.providerName, response.results ?? [])
      if (!result) status = 'no_official_domain_candidate'
    } catch (caught) {
      status = 'search_error'
      error = describeLinkupError(caught)
    }

    return {
      providerType: provider.providerType,
      ccn: provider.ccn,
      providerName: provider.providerName,
      city: provider.city,
      state: provider.state,
      telephone: provider.telephone,
      targetScore: provider.targetScore,
      braveQuery: query,
      candidateDomain: result?.domain ?? '',
      candidateUrl: result?.url ?? '',
        candidateTitle: result?.name ?? '',
        candidateDescription: result?.content ?? '',
      discoveryStatus: status,
      discoveryError: error,
      nextStep: status === 'candidate_found' ? 'Audit careers pages: require >=5 detailed job URLs with IDs, no ATS, and no JobPosting.' : 'Manual domain review',
    }
    }))

    const batchKeys = new Set(batchResults.map((row) => `${row.providerType}:${row.ccn}`))
    completed = completed.filter((row) => !batchKeys.has(`${row.providerType}:${row.ccn}`))
    completed.push(...batchResults)

    // The detailed CSV is the durable progress record; this compact line keeps
    // terminal output readable while requests run concurrently.
    const firstResult = batchResults[0]
    const index = batchStart
    const provider = { providerName: firstResult.providerName }
    const status = firstResult.discoveryStatus
    const result = firstResult.candidateDomain ? { domain: firstResult.candidateDomain } : undefined

    await writeCsv(outputPath, completed)
    console.log(`[${index + 1}/${pending.length}] ${provider.providerName} — ${status}${result ? ` (${result.domain})` : ''}`)

    // Keeps requests conservative and makes 429 retries unlikely. The Brave API
    // budget counts requests, so errors are saved and are not retried automatically.
    if (index + options.concurrency < pending.length) await new Promise((resolve) => setTimeout(resolve, BATCH_PAUSE_MS))

    const billingError = batchResults.find((row) => /credit|payment|required|unauthori[sz]ed|forbidden/i.test(row.discoveryError))
    if (billingError) {
      throw new Error(`Linkup authentication or billing failed (${billingError.discoveryError}). Resolve it in the Linkup dashboard before resuming.`)
    }
  }

  console.log(`Finished. Domain candidates: ${completed.filter((row) => row.discoveryStatus === 'candidate_found').length}/${completed.length}`)
  console.log(`Output: ${outputPath}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
