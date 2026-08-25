import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const INPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-electrical-contractors.csv')
const OUTPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-domain-discovery-wikidata.csv')
const API = 'https://www.wikidata.org/w/api.php'
// Wikidata is shared infrastructure. A conservative single-worker rate avoids
// spending requests on HTTP 429 responses.
const DELAY_MS = 3_500

type Row = Record<string, string>
type SearchHit = { id: string; label?: string; description?: string; aliases?: string[] }
type Entity = { labels?: Record<string, { value?: string }>; aliases?: Record<string, Array<{ value?: string }>>; claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: string } } }>> }

function csv(source: string): Row[] {
  const values: string[][] = []; let row: string[] = [], field = '', quoted = false
  for (let i = 0; i < source.length; i += 1) { const char = source[i]
    if (quoted) { if (char === '"' && source[i + 1] === '"') { field += char; i += 1 } else if (char === '"') quoted = false; else field += char }
    else if (char === '"') quoted = true
    else if (char === ',') { row.push(field); field = '' }
    else if (char === '\n') { row.push(field.replace(/\r$/, '')); values.push(row); row = []; field = '' }
    else field += char
  }
  if (field || row.length) { row.push(field); values.push(row) }
  const [headers = [], ...records] = values
  return records.filter((record) => record.some(Boolean)).map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])))
}

function esc(value: unknown) { const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text }
function normalize(value: string) { return value.toLowerCase().replace(/\bdba\b.*$/i, '').replace(/\b(llc|inc|incorporated|corp|corporation|ltd|l\.l\.c)\b\.?/gi, '').replace(/[^a-z0-9]/g, '') }
function hostname(value: string) { try { return new URL(value).hostname.replace(/^www\./, '') } catch { return '' } }
function wait() { return new Promise((resolve) => setTimeout(resolve, DELAY_MS)) }

async function api(params: Record<string, string>) {
  const url = new URL(API); Object.entries({ format: 'json', origin: '*', ...params }).forEach(([key, value]) => url.searchParams.set(key, value))
  const response = await fetch(url, { headers: { 'user-agent': 'SolarRoles domain research/1.0 (local research; contact via repository)' } })
  if (!response.ok) throw new Error(`Wikidata HTTP ${response.status}`)
  return response.json() as Promise<Record<string, unknown>>
}

async function lookup(row: Row) {
  const name = row.businessName
  const search = await api({ action: 'wbsearchentities', search: name, language: 'en', uselang: 'en', type: 'item', limit: '5' }) as { search?: SearchHit[] }
  const hits = search.search ?? []
  if (!hits.length) return { wikidataId: '', wikidataLabel: '', officialWebsite: '', candidateDomain: '', status: 'no_wikidata_entity' }
  await wait()
  const entities = await api({ action: 'wbgetentities', ids: hits.map((hit) => hit.id).join('|'), props: 'labels|aliases|claims', languages: 'en' }) as { entities?: Record<string, Entity> }
  const expected = normalize(name)
  const candidates = hits.map((hit) => {
    const entity = entities.entities?.[hit.id] ?? {}
    const labels = [hit.label ?? '', entity.labels?.en?.value ?? '', ...(hit.aliases ?? []), ...(entity.aliases?.en?.map((alias) => alias.value ?? '') ?? [])]
    const exact = labels.some((label) => normalize(label) === expected)
    const website = entity.claims?.P856?.[0]?.mainsnak?.datavalue?.value ?? ''
    return { hit, exact, website }
  })
  const selected = candidates.find((candidate) => candidate.exact && candidate.website)
  if (!selected) return { wikidataId: '', wikidataLabel: '', officialWebsite: '', candidateDomain: '', status: candidates.some((candidate) => candidate.exact) ? 'matched_no_official_website' : 'ambiguous_or_no_exact_match' }
  return { wikidataId: selected.hit.id, wikidataLabel: selected.hit.label ?? '', officialWebsite: selected.website, candidateDomain: hostname(selected.website), status: 'candidate_found' }
}

async function main() {
  const source = csv(await readFile(INPUT, 'utf8'))
  let output: Row[] = []; try { output = csv(await readFile(OUTPUT, 'utf8')) } catch { /* first run */ }
  const saved = new Map(output.map((row) => [row.licenseNumber, row]))
  // Retrying failures is safe; only a terminal positive/negative lookup is cached.
  const pending = source.filter((row) => !saved.has(row.licenseNumber) || saved.get(row.licenseNumber)?.status === 'lookup_error')
  await mkdir(path.dirname(OUTPUT), { recursive: true })
  console.log(`Wikidata: selected ${source.length}; already completed ${source.length - pending.length}; remaining ${pending.length}; delay ${DELAY_MS}ms`)
  for (const row of pending) {
    let result: Record<string, string>
    try { result = await lookup(row) } catch (error) { result = { wikidataId: '', wikidataLabel: '', officialWebsite: '', candidateDomain: '', status: 'lookup_error', error: error instanceof Error ? error.message : String(error) } }
    saved.set(row.licenseNumber, { licenseNumber: row.licenseNumber, businessName: row.businessName, cityStateZip: row.cityStateZip, ...result })
    output = source.flatMap((sourceRow) => saved.get(sourceRow.licenseNumber) ?? [])
    const headers = ['licenseNumber', 'businessName', 'cityStateZip', 'wikidataId', 'wikidataLabel', 'officialWebsite', 'candidateDomain', 'status', 'error']
    await writeFile(OUTPUT, `${headers.join(',')}\n${output.map((entry) => headers.map((header) => esc(entry[header])).join(',')).join('\n')}\n`, 'utf8')
    console.log(`[${source.length - pending.length + pending.indexOf(row) + 1}/${source.length}] ${row.businessName} — ${result.status}${result.candidateDomain ? ` (${result.candidateDomain})` : ''}`)
    if (result.status === 'lookup_error' && result.error?.includes('HTTP 429')) {
      console.log('Wikidata rate limit reached. Progress was saved; wait a few minutes, then rerun this command.')
      break
    }
    await wait()
  }
  console.log(`Finished. Domains found: ${output.filter((row) => row.status === 'candidate_found').length}/${output.length}`)
}

main()
