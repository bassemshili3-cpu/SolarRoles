import { createReadStream, createWriteStream } from 'node:fs'
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { spawn } from 'node:child_process'
import readline from 'node:readline'
import path from 'node:path'

const PIPELINE_VERSION = 'historical-batched-processing-v1-classifier-v3'

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function intArg(args: string[], flag: string, fallback: number) {
  const value = Number(arg(args, flag, String(fallback)))
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid ${flag}`)
  return value
}

async function exists(filename: string) {
  try {
    await access(filename)
    return true
  } catch {
    return false
  }
}

async function writeLine(stream: ReturnType<typeof createWriteStream>, line: string) {
  if (!stream.write(line.endsWith('\n') ? line : `${line}\n`)) await once(stream, 'drain')
}

async function finishStream(stream: ReturnType<typeof createWriteStream>) {
  stream.end()
  await once(stream, 'finish')
}

async function* streamLines(filename: string): AsyncGenerator<string> {
  const input = createReadStream(filename, { encoding: 'utf8' })
  const lines = readline.createInterface({ input, crlfDelay: Infinity })
  for await (const raw of lines) {
    const line = raw.trim()
    if (line) yield line
  }
}

async function runTs(script: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [
      '--max-old-space-size=1024',
      '--import', 'data:text/javascript,if(!process.geteuid)process.geteuid=()=>0',
      '--import', 'tsx',
      script,
      ...args,
    ], {
      cwd: process.cwd(),
      stdio: 'inherit',
      windowsHide: true,
    })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${script} exited with code ${code}`)))
  })
}

type BatchPlan = {
  index: number
  label: string
  manifestPath: string
  relativeManifest: string
  captures: number
  manifestHash: string
  outputDir: string
}

async function buildBatchManifests(root: string, manifestName: string, batchRoot: string, batchSize: number) {
  const manifestsDir = path.join(batchRoot, 'manifests')
  const resultsDir = path.join(batchRoot, 'results')
  await mkdir(manifestsDir, { recursive: true })
  await mkdir(resultsDir, { recursive: true })

  const plans: BatchPlan[] = []
  let lines: string[] = []
  let batchIndex = 0

  async function flush() {
    if (!lines.length) return
    batchIndex += 1
    const label = String(batchIndex).padStart(4, '0')
    const body = lines.map((line) => `${line}\n`).join('')
    const manifestHash = createHash('sha1').update(body).digest('hex')
    const manifestPath = path.join(manifestsDir, `batch-${label}.jsonl`)
    await writeFile(manifestPath, body, 'utf8')
    plans.push({
      index: batchIndex,
      label,
      manifestPath,
      relativeManifest: path.relative(root, manifestPath),
      captures: lines.length,
      manifestHash,
      outputDir: path.join(resultsDir, `batch-${label}`),
    })
    lines = []
  }

  for await (const line of streamLines(path.join(root, manifestName))) {
    lines.push(line)
    if (lines.length >= batchSize) await flush()
  }
  await flush()

  await writeFile(path.join(batchRoot, 'batch-plan.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    pipelineVersion: PIPELINE_VERSION,
    manifest: manifestName,
    batchSize,
    batches: plans.map((plan) => ({
      batch: plan.index,
      captures: plan.captures,
      manifestHash: plan.manifestHash,
      manifest: path.relative(root, plan.manifestPath),
      output: path.relative(root, plan.outputDir),
    })),
  }, null, 2)}\n`, 'utf8')

  return plans
}

async function batchIsComplete(plan: BatchPlan) {
  const marker = path.join(plan.outputDir, 'batch-complete.json')
  try {
    const value = JSON.parse(await readFile(marker, 'utf8')) as Record<string, unknown>
    return value.pipelineVersion === PIPELINE_VERSION && value.manifestHash === plan.manifestHash
  } catch {
    return false
  }
}

async function mergeConcat(plans: BatchPlan[], filename: string, destination: string) {
  const temp = `${destination}.tmp`
  await rm(temp, { force: true })
  const output = createWriteStream(temp, { encoding: 'utf8' })
  let rows = 0
  for (const plan of plans) {
    const source = path.join(plan.outputDir, filename)
    if (!(await exists(source))) continue
    for await (const line of streamLines(source)) {
      await writeLine(output, line)
      rows += 1
    }
  }
  await finishStream(output)
  await rm(destination, { force: true })
  await rename(temp, destination)
  return rows
}

async function mergeUnique(
  plans: BatchPlan[],
  filename: string,
  destination: string,
  keyField: string,
) {
  const temp = `${destination}.tmp`
  await rm(temp, { force: true })
  const output = createWriteStream(temp, { encoding: 'utf8' })
  const seen = new Set<string>()
  let rows = 0

  for (const plan of plans) {
    const source = path.join(plan.outputDir, filename)
    if (!(await exists(source))) continue
    for await (const line of streamLines(source)) {
      const parsed = JSON.parse(line) as Record<string, unknown>
      const key = String(parsed[keyField] ?? '')
      if (!key || seen.has(key)) continue
      seen.add(key)
      await writeLine(output, line)
      rows += 1
    }
  }

  await finishStream(output)
  await rm(destination, { force: true })
  await rename(temp, destination)
  return rows
}

async function classificationStats(filename: string) {
  const stats = {
    parsedJobs: 0,
    solarUsJobs: 0,
    solarUsCandidates: 0,
    solarUnknownLocationCandidates: 0,
    explicitForeignSolarCandidates: 0,
    notSolarRelated: 0,
    notUsOrUnknown: 0,
  }

  for await (const line of streamLines(filename)) {
    const row = JSON.parse(line) as Record<string, unknown>
    stats.parsedJobs += 1
    if (row.isUsJob === true && row.isSolarRelated === true) stats.solarUsJobs += 1
    if (row.solarCandidate === true && row.usStatus !== 'foreign') stats.solarUsCandidates += 1
    if (row.solarCandidate === true && row.usStatus === 'unknown') stats.solarUnknownLocationCandidates += 1
    if (row.solarCandidate === true && row.usStatus === 'foreign') stats.explicitForeignSolarCandidates += 1
    if (row.rejectionReason === 'not_solar_related') stats.notSolarRelated += 1
    if (row.rejectionReason === 'not_us_or_unknown') stats.notUsOrUnknown += 1
  }
  return stats
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/employer-discovery-2020'))
  const manifestName = arg(args, '--manifest', 'index-records-expanded.jsonl')
  const registry = path.resolve(arg(args, '--registry', path.join(root, 'provisional-employers.json')))
  const batchSize = intArg(args, '--batch-size', 2500)
  const parserWorkerSize = intArg(args, '--parser-worker-size', 100)
  const reset = args.includes('--reset')
  const batchRoot = path.join(root, '.batched-processing', path.basename(manifestName, path.extname(manifestName)))

  if (reset) await rm(batchRoot, { recursive: true, force: true })
  await mkdir(batchRoot, { recursive: true })

  const plans = await buildBatchManifests(root, manifestName, batchRoot, batchSize)
  console.log(`[batched] ${plans.reduce((sum, plan) => sum + plan.captures, 0)} captures | ${plans.length} batches | batchSize=${batchSize} | parserWorkerSize=${parserWorkerSize}`)

  for (const plan of plans) {
    if (await batchIsComplete(plan)) {
      console.log(`[batched] batch ${plan.index}/${plans.length}: complete, reusing`)
      continue
    }

    await rm(plan.outputDir, { recursive: true, force: true })
    await mkdir(plan.outputDir, { recursive: true })
    console.log(`[batched] batch ${plan.index}/${plans.length}: parsing ${plan.captures} captures`)

    await runTs('scripts/historical-jobs/parse-jobs.ts', [
      '--input', root,
      '--output', plan.outputDir,
      '--registry', registry,
      '--manifest', plan.relativeManifest,
      '--batch-size', String(parserWorkerSize),
    ])

    console.log(`[batched] batch ${plan.index}/${plans.length}: classifying`)
    await runTs('scripts/historical-jobs/classify-jobs.ts', [
      '--input', plan.outputDir,
      '--output', plan.outputDir,
    ])

    await writeFile(path.join(plan.outputDir, 'batch-complete.json'), `${JSON.stringify({
      completedAt: new Date().toISOString(),
      pipelineVersion: PIPELINE_VERSION,
      manifestHash: plan.manifestHash,
      captures: plan.captures,
    }, null, 2)}\n`, 'utf8')
  }

  console.log('[batched] merging batch outputs')

  const parseResults = await mergeConcat(plans, 'parse-results.jsonl', path.join(root, 'parse-results.jsonl'))
  const parsedJobObservations = await mergeConcat(plans, 'parsed-job-observations.jsonl', path.join(root, 'parsed-job-observations.jsonl'))
  const distinctParsedJobs = await mergeUnique(plans, 'parsed-jobs.jsonl', path.join(root, 'parsed-jobs.jsonl'), 'historicalJobId')
  await mergeUnique(plans, 'job-classifications.jsonl', path.join(root, 'job-classifications.jsonl'), 'historicalJobId')
  const strictSolarUsJobs = await mergeUnique(plans, 'solar-us-jobs.jsonl', path.join(root, 'solar-us-jobs.jsonl'), 'historicalJobId')
  const solarUsCandidates = await mergeUnique(plans, 'solar-us-candidates.jsonl', path.join(root, 'solar-us-candidates.jsonl'), 'historicalJobId')
  const solarUnknownLocationCandidates = await mergeUnique(
    plans,
    'solar-location-unknown-candidates.jsonl',
    path.join(root, 'solar-location-unknown-candidates.jsonl'),
    'historicalJobId',
  )

  let parseFailuresOrMissingHtml = 0
  for await (const line of streamLines(path.join(root, 'parse-results.jsonl'))) {
    const row = JSON.parse(line) as Record<string, unknown>
    if (row.parseStatus === 'html_missing_or_parse_failed') parseFailuresOrMissingHtml += 1
  }

  const classify = await classificationStats(path.join(root, 'job-classifications.jsonl'))

  await writeFile(path.join(root, 'parse-report.json'), `${JSON.stringify({
    parserMode: 'fresh-process batches',
    pipelineVersion: PIPELINE_VERSION,
    manifest: manifestName,
    batchSize,
    parserWorkerSize,
    batches: plans.length,
    indexedCaptures: parseResults,
    parsedJobObservations,
    distinctParsedJobs,
    parseFailuresOrMissingHtml,
  }, null, 2)}\n`, 'utf8')

  await writeFile(path.join(root, 'classification-report.json'), `${JSON.stringify({
    classifierVersion: 'common-crawl-classifier-v3',
    pipelineVersion: PIPELINE_VERSION,
    ...classify,
    strictSolarUsJobs,
    solarUsCandidates,
    solarUnknownLocationCandidates,
    candidateDefinition: 'solar-specific signal and not explicitly foreign; unknown-location candidates are retained for recall review, while solar-us-jobs.jsonl remains the strict final subset',
  }, null, 2)}\n`, 'utf8')

  const report = {
    generatedAt: new Date().toISOString(),
    pipelineVersion: PIPELINE_VERSION,
    manifest: manifestName,
    captures: parseResults,
    batchSize,
    batches: plans.length,
    parsedJobObservations,
    distinctParsedJobs,
    parseFailuresOrMissingHtml,
    strictSolarUsJobs,
    solarUsCandidates,
    solarUnknownLocationCandidates,
  }
  await writeFile(path.join(root, 'batched-processing-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
