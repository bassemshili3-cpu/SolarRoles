import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type Row = Record<string, string>
type SerperResult = { title?: string; link?: string; snippet?: string }
type SerperResponse = { organic?: SerperResult[] }

const DEFAULT_INPUT = path.join(process.cwd(), 'data', 'california-solar-contractors', 'solar-contractor-targets.csv')
const DEFAULT_OUTPUT = path.join(process.cwd(), 'data', 'california-solar-contractors', 'solar-contractor-domain-discovery-serper.csv')
const EXCLUDED_DOMAINS = new Set([
  'angi.com', 'bbb.org', 'california.gov', 'cslb.ca.gov', 'energysage.com', 'facebook.com', 'google.com',
  'homeadvisor.com', 'indeed.com', 'instagram.com', 'linkedin.com', 'mapquest.com', 'solarreviews.com',
  'thumbtack.com', 'yelp.com', 'youtube.com', 'yellowpages.com', 'zoominfo.com',
])

function parseArgs() {
  const args = process.argv.slice(2)
  const valueAfter = (flag: string) => {
    const index = args.indexOf(flag)
    return index >= 0 ? args[index + 1] : args.find((argument) => argument.startsWith(`${flag}=`))?.slice(flag.length + 1)
  }
  const positive = (flag: string, fallback: number) => {
    const number = Number(valueAfter(flag))
    return Number.isInteger(number) && number > 0 ? number : fallback
  }
  return { input: valueAfter('--input') ?? DEFAULT_INPUT, output: valueAfter('--out') ?? DEFAULT_OUTPUT, limit: positive('--limit', Number.MAX_SAFE_INTEGER), concurrency: positive('--concurrency', 4) }
}

function parseCsv(source: string): Row[] {
  const rows: string[][] = []; let row: string[] = []; let value = ''; let quoted = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]; const next = source[index + 1]
    if (character === '"') { if (quoted && next === '"') { value += '"'; index += 1 } else quoted = !quoted }
    else if (character === ',' && !quoted) { row.push(value); value = '' }
    else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && next === '\n') index += 1; row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = '' }
    else value += character
  }
  if (value || row.length) rows.push([...row, value])
  const [headers = [], ...records] = rows
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])))
}

function escapeCsv(value: unknown) { const text = String(value ?? ''); return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text }
async function writeCsv(filePath: string, rows: Row[]) { const headers = rows.length ? Object.keys(rows[0]) : []; await writeFile(filePath, `${[headers.join(','), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))].join('\n')}\n`, 'utf8') }
function hostname(url: string) { try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase() } catch { return '' } }
function excluded(domain: string) { return [...EXCLUDED_DOMAINS].some((value) => domain === value || domain.endsWith(`.${value}`)) }
function tokens(name: string) { return name.toLowerCase().match(/[a-z0-9]{4,}/g)?.filter((token) => !['solar', 'inc', 'llc', 'corp', 'corporation', 'company', 'the'].includes(token)).slice(0, 4) ?? [] }

function chooseOfficial(provider: Row, results: SerperResult[]) {
  const nameTokens = tokens(provider.businessName)
  const candidates = results.map((result) => {
    const domain = hostname(result.link ?? '')
    const text = `${result.title ?? ''} ${result.snippet ?? ''} ${domain}`.toLowerCase()
    const matches = nameTokens.filter((token) => text.includes(token)).length
    const domainMatches = nameTokens.filter((token) => domain.includes(token)).length
    return { result, domain, score: matches + domainMatches * 2 }
  }).filter((candidate) => candidate.domain && !excluded(candidate.domain)).sort((left, right) => right.score - left.score)
  return candidates[0]
}

async function search(provider: Row, apiKey: string) {
  const query = `"${provider.businessName}" "${provider.city}" California solar contractor official website`
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST', headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, gl: 'us', hl: 'en', num: 10 }),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`Serper ${response.status}: ${text.slice(0, 500)}`)
  return { query, body: JSON.parse(text) as SerperResponse }
}

async function main() {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) throw new Error('Missing SERPER_API_KEY in .env')
  const options = parseArgs()
  const input = (parseCsv(await readFile(options.input, 'utf8'))).slice(0, options.limit)
  let output: Row[] = []
  try { output = parseCsv(await readFile(options.output, 'utf8')) } catch { /* first run */ }
  const done = new Set(output.map((row) => row.licenseNumber))
  const pending = input.filter((row) => !done.has(row.licenseNumber))
  await mkdir(path.dirname(options.output), { recursive: true })
  console.log(`Selected: ${input.length}; already saved: ${output.length}; remaining: ${pending.length}`)

  for (let start = 0; start < pending.length; start += options.concurrency) {
    const batch = pending.slice(start, start + options.concurrency)
    const results = await Promise.all(batch.map(async (provider) => {
      try {
        const { query, body } = await search(provider, apiKey)
        const selected = chooseOfficial(provider, body.organic ?? [])
        return { ...provider, serperQuery: query, candidateDomain: selected?.domain ?? '', candidateUrl: selected?.result.link ?? '', candidateTitle: selected?.result.title ?? '', candidateSnippet: selected?.result.snippet ?? '', discoveryStatus: selected ? 'candidate_found' : 'no_official_domain_candidate', discoveryError: '' }
      } catch (caught) {
        return { ...provider, serperQuery: '', candidateDomain: '', candidateUrl: '', candidateTitle: '', candidateSnippet: '', discoveryStatus: 'search_error', discoveryError: caught instanceof Error ? caught.message : String(caught) }
      }
    }))
    output.push(...results)
    await writeCsv(options.output, output)
    for (const result of results) console.log(`[${output.indexOf(result) + 1}/${input.length}] ${result.businessName} — ${result.discoveryStatus}${result.candidateDomain ? ` (${result.candidateDomain})` : ''}`)
  }
  console.log(`Finished. Candidate domains: ${output.filter((row) => row.discoveryStatus === 'candidate_found').length}/${output.length}`)
  console.log(`Output: ${options.output}`)
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
