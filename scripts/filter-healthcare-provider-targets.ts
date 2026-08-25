import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type CsvRow = Record<string, string>

const DEFAULTS = {
  minResidents: 20,
  maxResidents: 125,
  minNursingFte: 12,
  maxNursingFte: 65,
  maxFacilitiesInChain: 3,
  minHomeHealthEpisodes: 75,
  maxHomeHealthEpisodes: 1_500,
}

// These are intentionally only a first-pass exclusion. The domain/ATS check is
// the next stage and remains the source of truth for every retained provider.
const LARGE_OPERATOR_PATTERN = /\b(amedisys|aveanna|bayada|centerwell|compassus|enhabit|elara caring|interim health(?:care)?|lhc group|kindred|accentcare|vitas|optum|unitedhealth|commonspirit|providence|trinity health)\b/i
const HOME_HEALTH_EPISODES_COLUMN =
  'No. of episodes to calc how much Medicare spends per episode of care at agency, compared to spending at all agencies (national)'

function parseArgs() {
  const args = process.argv.slice(2)
  const positional = args.filter((argument) => argument !== '--out' && !argument.startsWith('--out='))
  const outputFlagIndex = args.indexOf('--out')
  const outputFromFlag = outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : args.find((argument) => argument.startsWith('--out='))?.slice(6)

  if (positional.length < 2) {
    throw new Error(
      'Usage: tsx scripts/filter-healthcare-provider-targets.ts <nursing-homes.csv> <home-health.csv> [--out <directory>]'
    )
  }

  return {
    nursingHomesPath: positional[0],
    homeHealthPath: positional[1],
    outputDirectory: outputFromFlag ?? path.join(process.cwd(), 'data', 'healthcare-provider-targets'),
  }
}

function parseCsv(source: string): CsvRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    const nextCharacter = source[index + 1]

    if (character === '"') {
      if (quoted && nextCharacter === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (character === ',' && !quoted) {
      row.push(value)
      value = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1
      row.push(value)
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
      value = ''
      continue
    }

    value += character
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value)
    rows.push(row)
  }

  const [headers = [], ...records] = rows
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] ?? '']))
  )
}

function numberValue(value: string | undefined): number | null {
  if (!value || value.trim() === '-' || value.trim() === '*') return null
  const parsed = Number(value.replaceAll(',', '').trim())
  return Number.isFinite(parsed) ? parsed : null
}

function csvEscape(value: unknown): string {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

async function writeCsv(filePath: string, rows: CsvRow[]) {
  const headers = rows.length === 0 ? [] : Object.keys(rows[0])
  const contents = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\n')
  await writeFile(filePath, `${contents}\n`, 'utf8')
}

function nursingHomeTargets(rows: CsvRow[]) {
  let missingStaffing = 0
  let excludedForChain = 0
  let excludedForSize = 0

  const targets = rows.flatMap((row) => {
    const residents = numberValue(row['Average Number of Residents per Day'])
    const nursingHours = numberValue(row['Reported Total Nurse Staffing Hours per Resident per Day'])
    const facilitiesInChain = numberValue(row['Number of Facilities in Chain']) ?? 0
    const name = row['Provider Name']

    if (residents === null || nursingHours === null) {
      missingStaffing += 1
      return []
    }

    // CMS reports hours/resident/day. Dividing total daily hours by an 8-hour
    // shift gives a comparable nursing FTE estimate, not total company headcount.
    const estimatedNursingFte = (residents * nursingHours) / 8
    const isLargeOperator = LARGE_OPERATOR_PATTERN.test(`${name} ${row['Legal Business Name']} ${row['Chain Name']}`)
    const isChain = facilitiesInChain > DEFAULTS.maxFacilitiesInChain || isLargeOperator
    const isTargetSize =
      residents >= DEFAULTS.minResidents &&
      residents <= DEFAULTS.maxResidents &&
      estimatedNursingFte >= DEFAULTS.minNursingFte &&
      estimatedNursingFte <= DEFAULTS.maxNursingFte

    if (isChain || row['Provider Resides in Hospital'] === 'Y') {
      excludedForChain += 1
      return []
    }
    if (!isTargetSize) {
      excludedForSize += 1
      return []
    }

    const targetScore = Math.max(
      0,
      Math.round(100 - Math.abs(estimatedNursingFte - 30) * 1.25 - Math.abs(residents - 65) * 0.35 - facilitiesInChain * 8)
    )

    return [{
      source: 'CMS nursing home provider info',
      ccn: row['CMS Certification Number (CCN)'],
      providerName: name,
      legalBusinessName: row['Legal Business Name'],
      ownershipType: row['Ownership Type'],
      address: row['Provider Address'],
      city: row['City/Town'],
      state: row.State,
      zipCode: row['ZIP Code'],
      telephone: row['Telephone Number'],
      averageResidentsPerDay: residents.toFixed(1),
      nurseHoursPerResidentDay: nursingHours.toFixed(3),
      estimatedNursingFte: estimatedNursingFte.toFixed(1),
      facilitiesInChain,
      chainName: row['Chain Name'],
      targetScore,
      sizeRationale: `${residents.toFixed(1)} residents × ${nursingHours.toFixed(3)} nursing hours/resident/day ÷ 8h = ${estimatedNursingFte.toFixed(1)} estimated nursing FTE`,
      nextStep: 'Find official domain, then verify no ATS and no JobPosting before custom-scrape onboarding',
    }]
  })

  return {
    targets: targets.sort((left, right) => Number(right.targetScore) - Number(left.targetScore)),
    excludedForChain,
    excludedForSize,
    missingStaffing,
  }
}

function homeHealthResearchTargets(rows: CsvRow[]) {
  let missingEpisodes = 0
  let excludedForScale = 0
  let excludedLargeOperator = 0

  const targets = rows.flatMap((row) => {
    const episodes = numberValue(row[HOME_HEALTH_EPISODES_COLUMN])
    const providerName = row['Provider Name']
    const isLargeOperator = LARGE_OPERATOR_PATTERN.test(providerName)

    if (episodes === null) {
      missingEpisodes += 1
      return []
    }
    if (isLargeOperator) {
      excludedLargeOperator += 1
      return []
    }
    if (episodes < DEFAULTS.minHomeHealthEpisodes || episodes > DEFAULTS.maxHomeHealthEpisodes) {
      excludedForScale += 1
      return []
    }

    const targetScore = Math.max(0, Math.round(100 - Math.abs(episodes - 450) / 12))
    return [{
      source: 'CMS home health provider info',
      ccn: row['CMS Certification Number (CCN)'],
      providerName,
      ownershipType: row['Type of Ownership'],
      address: row.Address,
      city: row['City/Town'],
      state: row.State,
      zipCode: row['ZIP Code'],
      telephone: row['Telephone Number'],
      medicareEpisodesProxy: episodes,
      targetScore,
      sizeRationale: `${episodes.toLocaleString('en-US')} Medicare episodes (activity proxy only; CMS does not provide employee or staffing data in this export)`,
      nextStep: 'Enrich with company size/domain, then verify no ATS and no JobPosting before custom-scrape onboarding',
    }]
  })

  return {
    targets: targets.sort((left, right) => Number(right.targetScore) - Number(left.targetScore)),
    excludedForScale,
    excludedLargeOperator,
    missingEpisodes,
  }
}

async function main() {
  const { nursingHomesPath, homeHealthPath, outputDirectory } = parseArgs()
  const [nursingHomeCsv, homeHealthCsv] = await Promise.all([readFile(nursingHomesPath, 'utf8'), readFile(homeHealthPath, 'utf8')])
  const nursingHomes = parseCsv(nursingHomeCsv)
  const homeHealth = parseCsv(homeHealthCsv)
  const nursingHomeResult = nursingHomeTargets(nursingHomes)
  const homeHealthResult = homeHealthResearchTargets(homeHealth)

  await mkdir(outputDirectory, { recursive: true })
  await Promise.all([
    writeCsv(path.join(outputDirectory, 'nursing-home-targets.csv'), nursingHomeResult.targets),
    writeCsv(path.join(outputDirectory, 'home-health-research-targets.csv'), homeHealthResult.targets),
    writeFile(
      path.join(outputDirectory, 'summary.json'),
      `${JSON.stringify(
        {
          criteria: DEFAULTS,
          nursingHomes: {
            input: nursingHomes.length,
            retained: nursingHomeResult.targets.length,
            excludedForChainOrHospital: nursingHomeResult.excludedForChain,
            excludedForSize: nursingHomeResult.excludedForSize,
            missingStaffing: nursingHomeResult.missingStaffing,
          },
          homeHealth: {
            input: homeHealth.length,
            retainedForDomainResearch: homeHealthResult.targets.length,
            excludedForActivityProxy: homeHealthResult.excludedForScale,
            excludedForKnownLargeOperator: homeHealthResult.excludedLargeOperator,
            missingActivityProxy: homeHealthResult.missingEpisodes,
            caveat: 'The CMS home-health export has no employee count or staffing-hours column. Medicare episodes are only an activity proxy and must not be treated as FTE.',
          },
        },
        null,
        2
      )}\n`,
      'utf8'
    ),
  ])

  console.log(`Nursing homes: ${nursingHomeResult.targets.length}/${nursingHomes.length} retained`)
  console.log(`Home health: ${homeHealthResult.targets.length}/${homeHealth.length} retained for domain research`)
  console.log(`Output: ${outputDirectory}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
