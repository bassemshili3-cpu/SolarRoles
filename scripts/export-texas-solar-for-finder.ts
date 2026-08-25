import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

// The master target list has all 239 contractors. Do not use a partially
// completed SearXNG output as the source for a third-party enrichment batch.
const INPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-electrical-contractors.csv')
const OUTPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-finder-input.csv')

type Row = Record<string, string>

function parseCsv(source: string): Row[] {
  const records: string[][] = []
  let record: string[] = [], value = '', quoted = false
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { value += '"'; index += 1 }
      else if (char === '"') quoted = false
      else value += char
    } else if (char === '"') quoted = true
    else if (char === ',') { record.push(value); value = '' }
    else if (char === '\n') { record.push(value.replace(/\r$/, '')); records.push(record); record = []; value = '' }
    else value += char
  }
  if (value || record.length) { record.push(value); records.push(record) }
  const [headers = [], ...lines] = records
  return lines.filter((line) => line.some(Boolean)).map((line) => Object.fromEntries(headers.map((header, index) => [header, line[index] ?? ''])))
}

function escapeCsv(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

async function main() {
  const rows = parseCsv(await readFile(INPUT, 'utf8'))
  // This is deliberately a one-column import: the user will submit company
  // names to a company-to-domain finder, not to a domain-validation product.
  const seen = new Set<string>()
  const output = rows
    .map((row) => ({ company_name: row.businessName.trim() }))
    .filter((row) => row.company_name && !seen.has(row.company_name.toLowerCase()) && Boolean(seen.add(row.company_name.toLowerCase())))

  await mkdir(path.dirname(OUTPUT), { recursive: true })
  const headers = ['company_name']
  await writeFile(OUTPUT, `${headers.join(',')}\n${output.map((row) => headers.map((header) => escapeCsv(row[header as keyof typeof row])).join(',')).join('\n')}\n`, 'utf8')
  console.log(`Finder input: ${output.length}/${rows.length} Texas solar contractor targets`)
  console.log(`Output: ${path.relative(process.cwd(), OUTPUT)}`)
}

main()
