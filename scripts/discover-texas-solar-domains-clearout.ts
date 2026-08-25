import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_INPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-electrical-contractors.csv')
const DEFAULT_OUTPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-domain-discovery-clearout.csv')
const ENDPOINT = 'https://api.clearout.io/public/companies/autocomplete'
const DELAY_MS = 750

type Row = Record<string, string>
type Candidate = { name?: string; domain?: string; confidence_score?: number; logo_url?: string }

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
function normalize(value: string) { return value.toLowerCase().replace(/\bdba\b.*$/i, '').replace(/\b(llc|inc|incorporated|corp|corporation|ltd|l\.l\.c)\b\.?/gi, '').replace(/[^a-z0-9]/g, '') }
function delay(milliseconds: number) { return new Promise((resolve) => setTimeout(resolve, milliseconds)) }

async function lookup(name: string) {
  const response = await fetch(`${ENDPOINT}?${new URLSearchParams({ query: name })}`, { headers: { accept: 'application/json', 'user-agent': 'SolarRoles domain research/1.0' } })
  if (!response.ok) throw new Error(`Clearout HTTP ${response.status}`)
  const json = await response.json() as { status?: string; data?: Candidate[] }
  return json.data ?? []
}

function withoutLegalSuffix(name: string) {
  return name.replace(/(?:,?\s+)(?:l\.?l\.?c\.?|llc|inc\.?|incorporated|corp\.?|corporation|ltd\.?)$/i, '').trim()
}

function choose(name: string, candidates: Candidate[]) {
  const expected = normalize(name)
  const matching = candidates.map((candidate) => ({ ...candidate, exact: normalize(candidate.name ?? '') === expected })).sort((a, b) => Number(b.exact) - Number(a.exact) || (b.confidence_score ?? 0) - (a.confidence_score ?? 0))[0]
  if (!matching?.domain) return { domain: '', matchedName: '', confidence: '', status: 'no_domain_candidate' }
  // Clearout receives no address or telephone number. Keep only its strongest
  // result: an exact normalized name and a high confidence score.
  const trusted = matching.exact && (matching.confidence_score ?? 0) >= 85
  return { domain: trusted ? matching.domain : '', matchedName: matching.name ?? '', confidence: String(matching.confidence_score ?? ''), status: trusted ? 'candidate_found' : 'ambiguous_match' }
}

async function main() {
  const args = process.argv.slice(2), option = (name: string) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : undefined }
  const limit = Number(option('--limit')) || Number.MAX_SAFE_INTEGER, input = option('--input') ?? DEFAULT_INPUT, outputPath = option('--out') ?? DEFAULT_OUTPUT
  const source = parseCsv(await readFile(input, 'utf8')).slice(0, limit)
  let output: Row[] = []; try { output = parseCsv(await readFile(outputPath, 'utf8')) } catch { /* first run */ }
  const retryNoDomain = process.argv.includes('--retry-no-domain')
  const done = new Set(output.filter((row) => row.status !== 'api_error' && !(retryNoDomain && row.status === 'no_domain_candidate')).map((row) => row.licenseNumber)); const pending = source.filter((row) => !done.has(row.licenseNumber))
  const headers = ['licenseNumber', 'businessName', 'cityStateZip', 'candidateDomain', 'matchedCompanyName', 'confidenceScore', 'status', 'error']
  await mkdir(path.dirname(outputPath), { recursive: true })
  console.log(`Clearout: selected ${source.length}; already completed ${source.length - pending.length}; remaining ${pending.length}`)
  for (const [index, row] of pending.entries()) {
    let result: Record<string, string>
    try {
      let candidates = await lookup(row.businessName)
      // The API often has the company under its display name, without a legal
      // suffix such as L.L.C.; retrying that variant fixes genuine misses.
      if (!candidates.length) { const simplified = withoutLegalSuffix(row.businessName); if (simplified !== row.businessName) candidates = await lookup(simplified) }
      const selected = choose(row.businessName, candidates)
      result = { candidateDomain: selected.domain, matchedCompanyName: selected.matchedName, confidenceScore: selected.confidence, status: selected.status, error: '' }
    }
    catch (error) { result = { candidateDomain: '', matchedCompanyName: '', confidenceScore: '', status: 'api_error', error: error instanceof Error ? error.message : String(error) } }
    output = output.filter((entry) => entry.licenseNumber !== row.licenseNumber)
    output.push({ licenseNumber: row.licenseNumber, businessName: row.businessName, cityStateZip: row.cityStateZip || `${row.city ?? ''} ${row.state ?? ''} ${row.zip ?? ''}`.trim(), ...result })
    await writeFile(outputPath, `${headers.join(',')}\n${output.map((entry) => headers.map((header) => escapeCsv(entry[header])).join(',')).join('\n')}\n`, 'utf8')
    console.log(`[${source.length - pending.length + index + 1}/${source.length}] ${row.businessName} — ${result.status}${result.candidateDomain ? ` (${result.candidateDomain})` : ''}`)
    if (result.status === 'api_error' && /401|402|403|429/.test(result.error)) { console.log(`Stopping: ${result.error}`); break }
    if (index < pending.length - 1) await delay(DELAY_MS)
  }
  console.log(`Finished. Trusted domains: ${output.filter((row) => row.status === 'candidate_found').length}/${output.length}`)
}

main()
