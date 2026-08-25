import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DIRECTORY = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors')
const CLEAROUT = path.join(DIRECTORY, 'texas-solar-domain-discovery-clearout.csv')
const DATAFORSEO = path.join(DIRECTORY, 'texas-solar-domain-discovery-dataforseo.csv')
const OUTPUT = path.join(DIRECTORY, 'texas-solar-domain-candidates.csv')
type Row = Record<string, string>

function parse(source: string): Row[] { const lines = source.trim().split(/\r?\n/); const parseLine = (line: string) => { const out: string[] = []; let value = '', quoted = false; for (let i = 0; i < line.length; i += 1) { const char = line[i]; if (quoted) { if (char === '"' && line[i + 1] === '"') { value += char; i += 1 } else if (char === '"') quoted = false; else value += char } else if (char === '"') quoted = true; else if (char === ',') { out.push(value); value = '' } else value += char } out.push(value); return out }; const headers = parseLine(lines.shift() ?? ''); return lines.map(parseLine).map((line) => Object.fromEntries(headers.map((header, i) => [header, line[i] ?? '']))) }
function esc(value: string) { return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value }

async function main() {
  const [clearout, dataforseo] = await Promise.all([readFile(CLEAROUT, 'utf8').then(parse), readFile(DATAFORSEO, 'utf8').then(parse)])
  const all = new Map<string, Row>()
  for (const [source, rows] of [['clearout', clearout], ['dataforseo', dataforseo]] as const) for (const row of rows.filter((entry) => entry.status === 'candidate_found' && entry.candidateDomain)) {
    const existing = all.get(row.licenseNumber)
    if (!existing) all.set(row.licenseNumber, { licenseNumber: row.licenseNumber, businessName: row.businessName, cityStateZip: row.cityStateZip, candidateDomain: row.candidateDomain, sources: source, status: 'candidate_found' })
    else if (existing.candidateDomain === row.candidateDomain) existing.sources += `|${source}`
    else { existing.sources += `|${source}`; existing.status = 'conflicting_domains'; existing.candidateDomain += `|${row.candidateDomain}` }
  }
  const headers = ['licenseNumber', 'businessName', 'cityStateZip', 'candidateDomain', 'sources', 'status']
  const rows = [...all.values()].sort((a, b) => a.businessName.localeCompare(b.businessName))
  await writeFile(OUTPUT, `${headers.join(',')}\n${rows.map((row) => headers.map((header) => esc(row[header] ?? '')).join(',')).join('\n')}\n`, 'utf8')
  console.log(`Merged candidate domains: ${rows.filter((row) => row.status === 'candidate_found').length}; conflicts: ${rows.filter((row) => row.status === 'conflicting_domains').length}`)
}
main()
