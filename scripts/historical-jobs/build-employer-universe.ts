import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { HistoricalEmployer } from '../../lib/historical-jobs/commonCrawl'

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function compact(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

async function readJson<T>(filename: string, optional = false): Promise<T> {
  try {
    return JSON.parse(await readFile(filename, 'utf8')) as T
  } catch (error) {
    if (optional) return [] as T
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)
  const year = Number(arg(args, '--year', '2020'))
  if (!Number.isInteger(year)) throw new Error('Invalid --year')

  const basePath = path.resolve(arg(args, '--base', 'data/common-crawl-historical-jobs/employers.json'))
  const currentPath = path.resolve(arg(args, '--current', 'data/common-crawl-historical-jobs/current-employer-source-discovery-registry.json'))
  const discoveredPath = path.resolve(arg(args, '--discovered', `data/common-crawl-historical-jobs/employer-discovery-${year}/discovered-employers.json`))
  const outputPath = path.resolve(arg(args, '--output', `data/common-crawl-historical-jobs/historical-employer-universe-${year}.json`))

  const base = await readJson<HistoricalEmployer[]>(basePath)
  const current = await readJson<HistoricalEmployer[]>(currentPath, true)
  const discovered = await readJson<HistoricalEmployer[]>(discoveredPath, true)

  type Acc = HistoricalEmployer & { sources: Set<string>; providers: Set<string> }
  const merged = new Map<string, Acc>()

  const ingest = (employers: HistoricalEmployer[], source: string, priority: number) => {
    for (const employer of employers) {
      const key = compact(employer.employerName)
      if (!key) continue
      const existing = merged.get(key)
      if (!existing) {
        merged.set(key, {
          ...employer,
          patterns: [...new Set(employer.patterns)],
          sources: new Set([source]),
          providers: new Set([employer.atsProvider]),
          notes: `[priority=${priority}; source=${source}] ${employer.notes ?? ''}`.trim(),
        })
        continue
      }

      for (const pattern of employer.patterns) {
        if (!existing.patterns.includes(pattern)) existing.patterns.push(pattern)
      }
      existing.sources.add(source)
      existing.providers.add(employer.atsProvider)
      existing.notes = [existing.notes, `[${source}] ${employer.notes ?? ''}`].filter(Boolean).join(' ')
    }
  }

  // Base historical registry wins identity when names collide, followed by
  // current SolarRoles seeds; open discovery mainly contributes new employers
  // and additional validated patterns.
  ingest(base, 'historical_base', 1)
  ingest(current, 'current_solarroles_seed', 2)
  ingest(discovered, 'open_common_crawl_discovery', 3)

  const output = [...merged.values()]
    .map((employer) => ({
      employerId: employer.employerId,
      employerName: employer.employerName,
      atsProvider: employer.providers.size === 1 ? [...employer.providers][0] : 'mixed_historical',
      patterns: employer.patterns.sort(),
      discoverySourceKey: employer.discoverySourceKey,
      discoverySourceScope: employer.discoverySourceScope,
      notes: `${employer.notes ?? ''} Universe sources: ${[...employer.sources].sort().join(', ')}.`.trim(),
    }))
    .sort((a, b) => a.employerName.localeCompare(b.employerName))

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  await writeFile(outputPath.replace(/\.json$/i, '-report.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    year,
    historicalBaseEmployers: base.length,
    currentSeedEmployersWithSafePatterns: current.length,
    openDiscoveryValidatedEmployers: discovered.length,
    mergedEmployerUniverse: output.length,
    note: 'This universe is for historical source discovery. It is intentionally broader than the final analytical panel and must not be treated as the final set of employers with usable historical jobs.',
  }, null, 2)}\n`, 'utf8')

  console.log(JSON.stringify({
    year,
    historicalBaseEmployers: base.length,
    currentSeedEmployersWithSafePatterns: current.length,
    openDiscoveryValidatedEmployers: discovered.length,
    mergedEmployerUniverse: output.length,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
