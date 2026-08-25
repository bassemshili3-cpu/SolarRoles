import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const INPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-electrical-contractors.csv')
const OUTPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-domain-discovery-dataforseo.csv')
const ENDPOINT = 'https://api.dataforseo.com/v3/business_data/business_listings/search/live'
const EXCLUDED_DOMAINS = new Set(['facebook.com', 'instagram.com', 'linkedin.com', 'yelp.com', 'yellowpages.com', 'bbb.org', 'mapquest.com', 'angi.com', 'thumbtack.com'])

type Row = Record<string, string>
type Listing = { title?: string; address?: string; address_info?: { city?: string; zip?: string }; phone?: string; domain?: string; url?: string }

function parseCsv(source: string): Row[] {
  const records: string[][] = []; let record: string[] = [], field = '', quoted = false
  for (let index = 0; index < source.length; index += 1) { const char = source[index]
    if (quoted) { if (char === '"' && source[index + 1] === '"') { field += char; index += 1 } else if (char === '"') quoted = false; else field += char }
    else if (char === '"') quoted = true
    else if (char === ',') { record.push(field); field = '' }
    else if (char === '\n') { record.push(field.replace(/\r$/, '')); records.push(record); record = []; field = '' }
    else field += char
  }
  if (field || record.length) { record.push(field); records.push(record) }
  const [headers = [], ...lines] = records
  return lines.filter((line) => line.some(Boolean)).map((line) => Object.fromEntries(headers.map((header, index) => [header, line[index] ?? ''])))
}
function escapeCsv(value: unknown) { const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text }
function norm(value: string) { return value.toLowerCase().replace(/\bdba\b.*$/i, '').replace(/\b(llc|inc|incorporated|corp|corporation|ltd|l\.l\.c)\b\.?/gi, '').replace(/[^a-z0-9]/g, '') }
function words(value: string) { return value.toLowerCase().replace(/\b(llc|inc|incorporated|corp|corporation|ltd|dba)\b\.?/g, '').match(/[a-z0-9]{3,}/g) ?? [] }
function digits(value: string) { return value.replace(/\D/g, '').slice(-10) }
function city(value: string) { return value.match(/^(.+?)\s+[A-Z]{2}\s+\d{5}/)?.[1]?.toLowerCase() ?? '' }
function badDomain(domain: string) { return [...EXCLUDED_DOMAINS].some((entry) => domain === entry || domain.endsWith(`.${entry}`)) }

function select(row: Row, listings: Listing[]) {
  const expected = norm(row.businessName), expectedWords = words(row.businessName), expectedPhone = digits(row.phone), expectedCity = city(row.cityStateZip)
  const ranked = listings.map((listing) => {
    const listingTitle = listing.title ?? '', listingAddress = `${listing.address ?? ''} ${listing.address_info?.city ?? ''}`, listingPhone = digits(listing.phone ?? '')
    const exactName = norm(listingTitle) === expected
    const nameOverlap = expectedWords.filter((word) => words(listingTitle).includes(word)).length
    const phoneMatch = Boolean(expectedPhone && listingPhone && expectedPhone === listingPhone)
    const zipMatch = Boolean(row.zip && (listing.address_info?.zip ?? listingAddress).includes(row.zip))
    const cityMatch = Boolean(expectedCity && listingAddress.toLowerCase().includes(expectedCity))
    const domain = (listing.domain ?? '').replace(/^www\./, '').toLowerCase()
    const score = (exactName ? 60 : nameOverlap * 12) + (phoneMatch ? 70 : 0) + (zipMatch ? 20 : 0) + (cityMatch ? 10 : 0)
    return { listing, domain, score, exactName, phoneMatch, zipMatch, cityMatch }
  }).sort((left, right) => right.score - left.score)[0]
  if (!ranked || !ranked.domain || badDomain(ranked.domain)) return { domain: '', url: '', title: ranked?.listing.title ?? '', score: String(ranked?.score ?? 0), status: 'no_trusted_official_domain' }
  // A perfect business-name match is sufficient; otherwise require the registry phone
  // plus at least one geographic signal to avoid accepting another contractor.
  const trusted = ranked.exactName || (ranked.phoneMatch && (ranked.zipMatch || ranked.cityMatch))
  return { domain: trusted ? ranked.domain : '', url: trusted ? (ranked.listing.url ?? '') : '', title: ranked.listing.title ?? '', score: String(ranked.score), status: trusted ? 'candidate_found' : 'ambiguous_match' }
}

async function search(row: Row, authorization: string) {
  const response = await fetch(ENDPOINT, { method: 'POST', headers: { authorization, 'content-type': 'application/json' }, body: JSON.stringify([{ title: row.businessName, limit: 10 }]) })
  const json = await response.json() as { status_code?: number; status_message?: string; tasks?: Array<{ status_code?: number; status_message?: string; result?: Array<{ items?: Listing[] }> }> }
  if (!response.ok || json.status_code !== 20000) throw new Error(json.status_message ?? `DataForSEO HTTP ${response.status}`)
  const task = json.tasks?.[0]
  if (!task) throw new Error('DataForSEO returned no task')
  // Some live searches return an OK task without a result set. That means no
  // listing, not an API failure that should be retried and billed again.
  if (task.status_code !== 20000 && task.status_message !== 'Ok.') throw new Error(task.status_message ?? 'DataForSEO task failed')
  return task.result?.flatMap((result) => result.items ?? []) ?? []
}

async function main() {
  const login = process.env.DATAFORSEO_LOGIN, password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) throw new Error('Missing DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD in .env')
  const limitArgument = process.argv.indexOf('--limit'), limit = limitArgument >= 0 ? Number(process.argv[limitArgument + 1]) : Number.MAX_SAFE_INTEGER
  const source = parseCsv(await readFile(INPUT, 'utf8')).slice(0, limit)
  let output: Row[] = []; try { output = parseCsv(await readFile(OUTPUT, 'utf8')) } catch { /* first run */ }
  const completed = new Set(output.filter((row) => row.status !== 'api_error').map((row) => row.licenseNumber)); const pending = source.filter((row) => !completed.has(row.licenseNumber))
  const authorization = `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`
  const headers = ['licenseNumber', 'businessName', 'cityStateZip', 'candidateDomain', 'candidateUrl', 'matchedListingTitle', 'matchScore', 'status', 'error']
  await mkdir(path.dirname(OUTPUT), { recursive: true })
  console.log(`DataForSEO: selected ${source.length}; already completed ${source.length - pending.length}; remaining ${pending.length}`)
  for (const row of pending) {
    let result: Record<string, string>
    try { const selected = select(row, await search(row, authorization)); result = { candidateDomain: selected.domain, candidateUrl: selected.url, matchedListingTitle: selected.title, matchScore: selected.score, status: selected.status, error: '' } }
    catch (error) { result = { candidateDomain: '', candidateUrl: '', matchedListingTitle: '', matchScore: '', status: 'api_error', error: error instanceof Error ? error.message : String(error) } }
    output = output.filter((entry) => entry.licenseNumber !== row.licenseNumber)
    output.push({ licenseNumber: row.licenseNumber, businessName: row.businessName, cityStateZip: row.cityStateZip, ...result })
    await writeFile(OUTPUT, `${headers.join(',')}\n${output.map((entry) => headers.map((header) => escapeCsv(entry[header])).join(',')).join('\n')}\n`, 'utf8')
    console.log(`[${source.length - pending.length + pending.indexOf(row) + 1}/${source.length}] ${row.businessName} — ${result.status}${result.candidateDomain ? ` (${result.candidateDomain})` : ''}`)
    if (result.status === 'api_error' && /authoriz|credential|balance|billing|payment required|verify your account/i.test(result.error)) throw new Error(`Stopping: ${result.error}`)
  }
  console.log(`Finished. Trusted candidate domains: ${output.filter((row) => row.status === 'candidate_found').length}/${output.length}`)
}

main()
