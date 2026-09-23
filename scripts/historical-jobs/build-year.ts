import { spawn } from 'node:child_process'
import path from 'node:path'

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

async function run(script: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [
      '--import', 'data:text/javascript,if(!process.geteuid)process.geteuid=()=>0',
      '--import', 'tsx',
      script,
      ...args,
    ], { cwd: process.cwd(), stdio: 'inherit', windowsHide: true })
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${script} exited with code ${code}`)))
  })
}

async function main() {
  const args = process.argv.slice(2)
  const year = arg(args, '--year', '2020')
  const stage = arg(args, '--stage', 'discovery')
  const root = arg(args, '--output', `data/common-crawl-historical-jobs/year-${year}`)
  const parquetDir = arg(args, '--parquet-dir', 'data/common-crawl-historical-jobs/parquet')
  const crawl = arg(args, '--crawl', '')

  if (stage === 'discovery' || stage === 'employer-discovery') {
    const discoveryArgs = ['--year', year, '--parquet-dir', parquetDir, '--output', path.join(root, 'employer-discovery')]
    if (crawl) discoveryArgs.push('--crawl', crawl)
    await run('scripts/historical-jobs/discover-employers.ts', discoveryArgs)
    return
  }
  if (stage === 'current-registry') {
    await run('scripts/historical-jobs/build-current-employer-registry.ts', [])
    return
  }
  if (stage === 'universe') {
    await run('scripts/historical-jobs/build-employer-universe.ts', ['--year', year])
    return
  }
  if (stage === 'source-discovery') {
    const registry = arg(args, '--registry', `data/common-crawl-historical-jobs/historical-employer-universe-${year}.json`)
    const discoveryArgs = ['--year', year, '--parquet-dir', parquetDir, '--output', path.join(root, 'source-discovery'), '--registry', registry]
    if (crawl) discoveryArgs.push('--crawl', crawl)
    await run('scripts/historical-jobs/discover-sources.ts', discoveryArgs)
    return
  }
  if (stage === 'discovery-fetch') {
    await run('scripts/historical-jobs/fetch-captures.ts', ['--input', path.join(root, 'employer-discovery')])
    return
  }
  if (stage === 'discovery-parse') {
    const discoveryRoot = path.join(root, 'employer-discovery')
    await run('scripts/historical-jobs/parse-jobs.ts', [
      '--input', discoveryRoot,
      '--output', discoveryRoot,
      '--registry', path.join(discoveryRoot, 'provisional-employers.json'),
    ])
    return
  }
  if (stage === 'discovery-classify') {
    const discoveryRoot = path.join(root, 'employer-discovery')
    await run('scripts/historical-jobs/classify-jobs.ts', ['--input', discoveryRoot, '--output', discoveryRoot])
    return
  }
  if (stage === 'discovery-process-batched') {
    const discoveryRoot = path.join(root, 'employer-discovery')
    const manifest = arg(args, '--manifest', 'index-records-expanded.jsonl')
    const batchSize = arg(args, '--batch-size', '2500')
    await run('scripts/historical-jobs/process-sample-batched.ts', [
      '--input', discoveryRoot,
      '--manifest', manifest,
      '--registry', path.join(discoveryRoot, 'provisional-employers.json'),
      '--batch-size', batchSize,
    ])
    return
  }
  if (stage === 'discovery-summarize') {
    await run('scripts/historical-jobs/summarize-employer-discovery.ts', ['--input', path.join(root, 'employer-discovery')])
    return
  }
  if (stage === 'discovery-deep-sample') {
    await run('scripts/historical-jobs/prepare-deep-sample.ts', ['--input', path.join(root, 'employer-discovery')])
    return
  }
  if (stage === 'index') {
    const registry = arg(args, '--registry', 'data/common-crawl-historical-jobs/employers.json')
    const indexArgs = ['--years', year, '--parquet-dir', parquetDir, '--output', root, '--registry', registry]
    if (crawl) indexArgs.push('--crawls', crawl)
    await run('scripts/query-common-crawl-url-index.ts', indexArgs)
    return
  }
  if (stage === 'fetch') {
    await run('scripts/historical-jobs/fetch-captures.ts', ['--input', root])
    return
  }
  if (stage === 'parse') {
    await run('scripts/historical-jobs/parse-jobs.ts', ['--input', root, '--output', root])
    return
  }
  if (stage === 'classify') {
    await run('scripts/historical-jobs/classify-jobs.ts', ['--input', root, '--output', root])
    return
  }
  if (stage === 'features') {
    await run('scripts/historical-jobs/extract-features.ts', ['--input', root, '--output', root])
    return
  }
  if (stage === 'audit') {
    await run('scripts/historical-jobs/audit-dataset.ts', ['--input', root])
    return
  }

  throw new Error(`Unknown --stage ${stage}. Use discovery, employer-discovery, discovery-fetch, discovery-parse, discovery-classify, discovery-process-batched, discovery-summarize, discovery-deep-sample, current-registry, universe, source-discovery, index, fetch, parse, classify, features, or audit.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
