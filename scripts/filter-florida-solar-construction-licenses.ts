import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const INPUT = 'C:\\Users\\basse\\Downloads\\CONSTRUCTIONLICENSE_1.csv'
const DIRECTORY = path.join(process.cwd(), 'data', 'florida-solar-contractors')
type Record = string[]

function parseCsv(source: string): Record[] { const rows: Record[] = []; let row: string[] = [], value = '', quoted = false; for (let i = 0; i < source.length; i += 1) { const char = source[i]; if (quoted) { if (char === '"' && source[i + 1] === '"') { value += char; i += 1 } else if (char === '"') quoted = false; else value += char } else if (char === '"') quoted = true; else if (char === ',') { row.push(value); value = '' } else if (char === '\n') { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = '' } else value += char }; if (value || row.length) { row.push(value); rows.push(row) }; return rows }
function date(value: string) { const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return match ? new Date(`${match[3]}-${match[1]}-${match[2]}T00:00:00`) : undefined }
function esc(value: unknown) { const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text }

async function main() {
  const rows = parseCsv(await readFile(INPUT, 'utf8'))
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const direct = /\bsolar\b|\bphotovoltaic\b|(?<![a-z])pv(?![a-z])/i
  const secondary = /\brenewable\b|\bclean\s+energy\b|\bsunpower\b|\bsolaredge\b|\benphase\b/i
  const targets = rows.flatMap((row) => {
    // DBPR's construction-license export has no header. These positions are
    // stable in this extract: type=1, licensee=2, business=3, city=8,
    // state=9, ZIP=10, license no.=12, status=14, expiry=17.
    const [board, licenseType, licenseeName, businessName, dba, address1, address2, address3, city, state, zip, county, licenseNumber, , status, issuedAt, statusAt, expiresAt] = row
    const company = (businessName || dba || licenseeName).trim()
    const text = `${businessName} ${dba}`
    const active = status === 'A' && Boolean(date(expiresAt) && date(expiresAt)! >= today)
    const solarSignal = direct.test(text) ? 'explicit_solar_or_pv' : secondary.test(text) ? 'renewable_or_solar_brand' : ''
    if (!active || !solarSignal || !company) return []
    return [{ board, licenseType, licenseNumber, businessName: company, licenseeName, city, state, zip, county, businessAddress: [address1, address2, address3].filter(Boolean).join(', '), licenseStatus: status, expiresAt, solarSignal, targetScore: solarSignal === 'explicit_solar_or_pv' ? '100' : '70', nextStep: 'Find official domain, then audit careers pages for detailed solar jobs.' }]
  }).sort((a, b) => Number(b.targetScore) - Number(a.targetScore) || a.businessName.localeCompare(b.businessName))
  await mkdir(DIRECTORY, { recursive: true })
  const headers = ['board', 'licenseType', 'licenseNumber', 'businessName', 'licenseeName', 'city', 'state', 'zip', 'county', 'businessAddress', 'licenseStatus', 'expiresAt', 'solarSignal', 'targetScore', 'nextStep']
  await writeFile(path.join(DIRECTORY, 'florida-solar-construction-contractors.csv'), `${headers.join(',')}\n${targets.map((target) => headers.map((header) => esc(target[header as keyof typeof target])).join(',')).join('\n')}\n`, 'utf8')
  await writeFile(path.join(DIRECTORY, 'summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), source: INPUT, totalLicenses: rows.length, retained: targets.length, explicitSolarOrPv: targets.filter((target) => target.solarSignal === 'explicit_solar_or_pv').length, renewableOrSolarBrand: targets.filter((target) => target.solarSignal === 'renewable_or_solar_brand').length }, null, 2))
  console.log(`Florida construction licenses: ${targets.length}/${rows.length} retained`)
  console.log(`Output: ${path.relative(process.cwd(), DIRECTORY)}`)
}
main()
