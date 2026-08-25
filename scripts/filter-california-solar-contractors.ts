import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx') as typeof import('xlsx')

type SourceRow = Record<string, unknown>
type Target = Record<string, string>

const DEFAULT_SOURCE_DIRECTORY = 'C:\\Users\\basse\\Downloads'
const DEFAULT_OUTPUT_DIRECTORY = path.join(process.cwd(), 'data', 'california-solar-contractors')

function parseArgs() {
  const args = process.argv.slice(2)
  const valueAfter = (flag: string) => {
    const index = args.indexOf(flag)
    return index >= 0 ? args[index + 1] : args.find((argument) => argument.startsWith(`${flag}=`))?.slice(flag.length + 1)
  }
  return {
    sourceDirectory: valueAfter('--source-dir') ?? DEFAULT_SOURCE_DIRECTORY,
    outputDirectory: valueAfter('--out') ?? DEFAULT_OUTPUT_DIRECTORY,
  }
}

function normalize(value: unknown) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function csvEscape(value: unknown) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

async function writeCsv(filePath: string, rows: Target[]) {
  const headers = rows.length ? Object.keys(rows[0]) : []
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\n')
  await writeFile(filePath, `${csv}\n`, 'utf8')
}

function hasSolarClassification(value: string) {
  return /(?:^|\|)\s*C\s*-?\s*46\b/i.test(value)
}

function hasEmployeesCoverage(value: string) {
  const normalized = value.toLowerCase()
  return normalized.includes('workers') && !normalized.includes('exempt')
}

async function main() {
  const options = parseArgs()
  const files = (await readdir(options.sourceDirectory))
    .filter((file) => /^CSLBSearchData_\d+\.xlsx$/i.test(file))
    .sort()
  if (!files.length) throw new Error(`No CSLBSearchData_*.xlsx files found in ${options.sourceDirectory}`)

  const sourceRows: Array<SourceRow & { sourceFile: string }> = []
  for (const file of files) {
    const workbook = XLSX.readFile(path.join(options.sourceDirectory, file), { raw: false })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<SourceRow>(firstSheet, { defval: '' })
    sourceRows.push(...rows.map((row) => ({ ...row, sourceFile: file })))
  }

  const byLicense = new Map<string, SourceRow & { sourceFiles: Set<string> }>()
  for (const row of sourceRows) {
    const licenseNumber = normalize(row.LicenseNumber)
    if (!licenseNumber) continue
    const existing = byLicense.get(licenseNumber)
    if (existing) existing.sourceFiles.add(normalize(row.sourceFile))
    else byLicense.set(licenseNumber, { ...row, sourceFiles: new Set([normalize(row.sourceFile)]) })
  }

  const unique = [...byLicense.values()]
  const clear = unique.filter((row) => normalize(row.Status).toUpperCase() === 'CLEAR')
  const solar = clear.filter((row) => hasSolarClassification(normalize(row['Classification(s)'])))
  const targets = solar
    .filter((row) => hasEmployeesCoverage(normalize(row.WorkersCompCoverageType)))
    .map<Target>((row) => ({
      licenseNumber: normalize(row.LicenseNumber),
      businessName: normalize(row.BusinessName),
      businessType: normalize(row.BusinessType),
      address: normalize(row.Address),
      city: normalize(row.City),
      state: normalize(row.State),
      zip: normalize(row['ZIP Code']),
      county: normalize(row.County),
      phone: normalize(row.PhoneNumber),
      issueDate: normalize(row.IssueDate),
      expirationDate: normalize(row.ExpirationDate),
      classifications: normalize(row['Classification(s)']),
      workersCompCoverageType: normalize(row.WorkersCompCoverageType),
      workersCompInsuranceCompany: normalize(row.WorkersCompInsuranceCompany),
      workersCompPolicyExpiration: normalize(row.ExpirationDate1),
      sourceFiles: [...row.sourceFiles].sort().join('|'),
    }))
    .sort((left, right) => left.businessName.localeCompare(right.businessName))

  await mkdir(options.outputDirectory, { recursive: true })
  await writeCsv(path.join(options.outputDirectory, 'solar-contractor-targets.csv'), targets)
  await writeFile(path.join(options.outputDirectory, 'summary.json'), `${JSON.stringify({
    sourceFiles: files,
    inputRows: sourceRows.length,
    uniqueLicenses: unique.length,
    activeClearLicenses: clear.length,
    activeSolarC46Licenses: solar.length,
    retainedWithWorkersComp: targets.length,
    excludedAsExemptOrNoWorkersComp: solar.length - targets.length,
    criteria: 'Active (CLEAR) California C-46 solar contractor with non-exempt workers compensation coverage.',
  }, null, 2)}\n`, 'utf8')

  console.log(`CSLB rows: ${sourceRows.length}; unique licenses: ${unique.length}`)
  console.log(`Active C-46 solar contractors: ${solar.length}; retained with workers' comp: ${targets.length}`)
  console.log(`Output: ${options.outputDirectory}`)
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
