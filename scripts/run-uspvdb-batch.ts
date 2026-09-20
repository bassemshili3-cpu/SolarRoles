import fs from 'node:fs'
import path from 'node:path'
import type { GeoJSONFeature, GeoJSONFeatureCollection } from '../lib/repowering/types'
import {
  buildRepoweringAtlas,
  flatResult,
  normalizeFeature,
  rowsToCsv,
  runFeature,
  summarize,
  type AtlasConfig,
} from './uspvdbBatch'

function parseArgs(argv: string[]) {
  const output: Record<string, string | boolean> = {}
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (!argument.startsWith('--')) continue
    const key = argument.slice(2)
    const next = argv[index + 1]
    if (next !== undefined && !next.startsWith('--')) {
      output[key] = next
      index += 1
    } else output[key] = true
  }
  return output
}

function num(value: string | boolean | undefined, fallback: number | null): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function writeJson(file: string, value: unknown) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.input) throw new Error('Usage: npm run repower:batch -- --input data/repowering/uspvdb.geojson [--scenario reference]')
  const inputPath = path.resolve(String(args.input))
  const configPath = path.resolve(String(args.config || 'data/repowering/atlas-scenarios.json'))
  const scenario = String(args.scenario || 'reference')
  const outDir = path.resolve(String(args.out || `data/repowering/output/uspvdb-${scenario}`))
  const atlasOutDir = path.resolve(String(args['atlas-out'] || 'public/data/repowering'))
  const geojson = readJson<GeoJSONFeatureCollection>(inputPath)
  const config = readJson<AtlasConfig>(configPath)
  if (!config.scenarios[scenario]) throw new Error(`Unknown scenario: ${scenario}`)

  const states = args.state
    ? new Set(String(args.state).split(',').map((state) => state.trim().toUpperCase()).filter(Boolean))
    : null
  const minYear = num(args['min-year'], null)
  const maxYear = num(args['max-year'], null)
  const offset = Math.max(0, Math.round(num(args.offset, 0) ?? 0))
  const limit = Math.max(0, Math.round(num(args.limit, 0) ?? 0))
  const candidates = geojson.features.filter((feature) => {
    const record = normalizeFeature(feature)
    if (states && (!record.state || !states.has(record.state.toUpperCase()))) return false
    if (minYear !== null && (record.year === null || record.year < minYear)) return false
    if (maxYear !== null && (record.year === null || record.year > maxYear)) return false
    return true
  })
  const selected = candidates.slice(offset, limit ? offset + limit : undefined)
  const runs: ReturnType<typeof runFeature>[] = []
  const hardErrors: Record<string, unknown>[] = []

  selected.forEach((feature: GeoJSONFeature, index) => {
    try {
      runs.push(runFeature(feature, config, scenario))
    } catch (error) {
      const record = normalizeFeature(feature)
      hardErrors.push({
        case_id: record.caseId,
        name: record.name,
        state: record.state,
        error: error instanceof Error ? error.message : String(error),
      })
    }
    if ((index + 1) % 50 === 0 || index + 1 === selected.length) console.log(`[${index + 1}/${selected.length}]`)
  })

  const summary = summarize(runs)
  const modeled = runs.filter((run) => run.status === 'modeled')
  const unableToModel = runs.filter((run) => run.status === 'unable')
  const flatModeled = modeled.map(flatResult)
  const flatUnable = unableToModel.map(flatResult)
  const topContributors = flatModeled
    .slice()
    .sort((a, b) => Number(b.headroom_dc_mw ?? 0) - Number(a.headroom_dc_mw ?? 0))
    .slice(0, 50)

  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'modeled-results.csv'), rowsToCsv(flatModeled))
  fs.writeFileSync(path.join(outDir, 'unable-to-model.csv'), rowsToCsv(flatUnable))
  fs.writeFileSync(path.join(outDir, 'hard-errors.csv'), rowsToCsv(hardErrors))
  fs.writeFileSync(path.join(outDir, 'top-50-national-contributors.csv'), rowsToCsv(topContributors))
  fs.writeFileSync(path.join(outDir, 'by-state.csv'), rowsToCsv(summary.by_state))
  fs.writeFileSync(path.join(outDir, 'by-axis.csv'), rowsToCsv(summary.by_axis))
  fs.writeFileSync(path.join(outDir, 'by-year.csv'), rowsToCsv(summary.by_year))
  writeJson(path.join(outDir, 'summary.json'), {
    ...summary,
    scenario,
    selected_features: selected.length,
    hard_errors: hardErrors.length,
  })

  const { atlas, details } = buildRepoweringAtlas(runs, {
    dataset: String(args['dataset-version'] || 'USPVDB v4.0'),
    datasetDate: String(args['dataset-date'] || 'April 2026'),
    datasetUrl: 'https://www.usgs.gov/data/united-states-large-scale-solar-photovoltaic-database-ver-40-april-2026',
    analysisRun: summary.generated_at,
    scenario,
  })
  const stateDir = path.join(atlasOutDir, 'states')
  fs.mkdirSync(stateDir, { recursive: true })
  writeJson(path.join(atlasOutDir, `atlas-${scenario}.json`), atlas)
  details.forEach((detail) => writeJson(path.join(stateDir, `${detail.state}.json`), detail))
  fs.writeFileSync(path.join(atlasOutDir, `plant-results-${scenario}.csv`), rowsToCsv(flatModeled))

  const totals = summary.modeled
  fs.writeFileSync(path.join(outDir, 'SUMMARY.md'), `# Hidden Solar GW batch summary

- Dataset: **USPVDB v4.0 (April 2026)**
- Scenario: **${scenario}**
- Source facilities: **${selected.length}**
- Facilities modeled: **${summary.counts.modeled}**
- Unable to model: **${summary.counts.unable_to_model}**
- Current DC: **${totals.current_dc_mw ?? 0} MWdc**
- Reference repowering: **${totals.modeled_dc_mw ?? 0} MWdc**
- Net headroom: **${totals.net_headroom_dc_mw ?? 0} MWdc (${totals.net_headroom_pct ?? 'n/a'}%)**

Every technically modelable facility is included. A facility is omitted only when a required input cannot be processed.

> Technical same-footprint DC nameplate potential only; not economically feasible or interconnection-approved repowering capacity.
`)
  console.log(JSON.stringify({ counts: summary.counts, modeled: summary.modeled }, null, 2))
  console.log(`Wrote ${outDir}`)
  console.log(`Wrote web atlas to ${atlasOutDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
