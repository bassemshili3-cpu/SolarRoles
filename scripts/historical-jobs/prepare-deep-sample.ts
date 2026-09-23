import { access, copyFile, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

interface ManifestRow {
  urlkey: string
  timestamp: string
  url: string
  digest: string
  filename: string
  offset: string
  length: string
  discoverySourceKey?: string
  discoverySampleRank?: number
  discoverySampleSolarUrlSignal?: boolean
  [key: string]: unknown
}

interface DeepSampleCandidate {
  sourceKey: string
  recommendedDeepSampleCount: number
}

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

async function readJsonLines<T>(filename: string) {
  const body = await readFile(filename, 'utf8')
  return body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T)
}

function captureKey(row: ManifestRow) {
  return `${row.filename}|${row.offset}|${row.length}|${row.digest}|${row.url}`
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/employer-discovery-2020'))
  const manifestPath = path.join(root, 'index-records.jsonl')
  const initialBackup = path.join(root, 'index-records.initial.jsonl')
  const reservoirPath = path.join(root, 'sample-reservoir.jsonl')
  const candidatePath = path.join(root, 'deep-sample-candidates.json')

  try {
    await access(initialBackup)
  } catch {
    await copyFile(manifestPath, initialBackup)
  }

  const current = await readJsonLines<ManifestRow>(manifestPath)
  const reservoir = await readJsonLines<ManifestRow>(reservoirPath)
  const candidates = JSON.parse(await readFile(candidatePath, 'utf8')) as DeepSampleCandidate[]
  const targetBySource = new Map(candidates.map((candidate) => [
    candidate.sourceKey,
    Number(candidate.recommendedDeepSampleCount) || 0,
  ]))

  const existingKeys = new Set(current.map(captureKey))
  const currentCounts = new Map<string, number>()
  for (const row of current) {
    const sourceKey = row.discoverySourceKey
    if (!sourceKey) continue
    currentCounts.set(sourceKey, (currentCounts.get(sourceKey) ?? 0) + 1)
  }

  const reservoirBySource = new Map<string, ManifestRow[]>()
  for (const row of reservoir) {
    const sourceKey = row.discoverySourceKey
    if (!sourceKey || !targetBySource.has(sourceKey)) continue
    const list = reservoirBySource.get(sourceKey) ?? []
    list.push(row)
    reservoirBySource.set(sourceKey, list)
  }

  const added: ManifestRow[] = []
  for (const [sourceKey, target] of targetBySource) {
    let count = currentCounts.get(sourceKey) ?? 0
    if (count >= target) continue
    const candidatesForSource = (reservoirBySource.get(sourceKey) ?? []).sort((a, b) =>
      Number(Boolean(b.discoverySampleSolarUrlSignal)) - Number(Boolean(a.discoverySampleSolarUrlSignal))
      || Number(a.discoverySampleRank ?? 0) - Number(b.discoverySampleRank ?? 0),
    )
    for (const row of candidatesForSource) {
      if (count >= target) break
      const key = captureKey(row)
      if (existingKeys.has(key)) continue
      existingKeys.add(key)
      added.push(row)
      count += 1
    }
  }

  const merged = [...current, ...added]
  await writeFile(manifestPath, merged.map((row) => `${JSON.stringify(row)}\n`).join(''), 'utf8')
  await writeFile(path.join(root, 'deep-sample-added.jsonl'), added.map((row) => `${JSON.stringify(row)}\n`).join(''), 'utf8')
  await writeFile(path.join(root, 'deep-sample-report.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    sourcesRequested: targetBySource.size,
    initialManifestCaptures: current.length,
    addedCaptures: added.length,
    expandedManifestCaptures: merged.length,
    sourcesExpanded: new Set(added.map((row) => row.discoverySourceKey).filter(Boolean)).size,
    note: 'Rerun historical:fetch and the discovery parse/classify/summary stages. Existing HTML is reused; only newly added captures require network fetches.',
  }, null, 2)}\n`, 'utf8')

  console.log(JSON.stringify({
    sourcesRequested: targetBySource.size,
    initialManifestCaptures: current.length,
    addedCaptures: added.length,
    expandedManifestCaptures: merged.length,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
