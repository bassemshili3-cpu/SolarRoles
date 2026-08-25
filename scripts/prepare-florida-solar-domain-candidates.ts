import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DIRECTORY = path.join(process.cwd(), 'data', 'florida-solar-contractors')
const INPUT = path.join(DIRECTORY, 'florida-solar-domain-discovery-clearout.csv')
const OUTPUT = path.join(DIRECTORY, 'florida-solar-domain-candidates.csv')
type Row = Record<string, string>
function csv(text: string): Row[] { const rows: string[][] = []; let row: string[] = [], value = '', quoted = false; for (let i = 0; i < text.length; i += 1) { const char = text[i]; if (quoted) { if (char === '"' && text[i + 1] === '"') { value += char; i += 1 } else if (char === '"') quoted = false; else value += char } else if (char === '"') quoted = true; else if (char === ',') { row.push(value); value = '' } else if (char === '\n') { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = '' } else value += char }; if (value || row.length) { row.push(value); rows.push(row) }; const [headers = [], ...data] = rows; return data.filter((entry) => entry.some(Boolean)).map((entry) => Object.fromEntries(headers.map((header, index) => [header, entry[index] ?? '']))) }
function esc(value: string) { return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value }
async function main() { const rows = csv(await readFile(INPUT, 'utf8')).filter((row) => row.status === 'candidate_found' && row.candidateDomain); const headers = ['licenseNumber', 'businessName', 'cityStateZip', 'candidateDomain', 'sources', 'status']; const output = rows.map((row) => ({ licenseNumber: row.licenseNumber, businessName: row.businessName, cityStateZip: row.cityStateZip, candidateDomain: row.candidateDomain, sources: 'clearout', status: 'candidate_found' })); await writeFile(OUTPUT, `${headers.join(',')}\n${output.map((row) => headers.map((header) => esc(row[header as keyof typeof row])).join(',')).join('\n')}\n`, 'utf8'); console.log(`Florida candidates: ${output.length}/${rows.length}`) }
main()
