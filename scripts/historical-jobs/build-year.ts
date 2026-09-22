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

  if (stage === 'discovery') {
    const discoveryArgs = ['--year', year, '--parquet-dir', parquetDir, '--output', path.join(root, 'discovery')]
    if (crawl) discoveryArgs.push('--crawl', crawl)
    await run('scripts/historical-jobs/discover-sources.ts', discoveryArgs)
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

  throw new Error(`Unknown --stage ${stage}. Use discovery, index, fetch, parse, classify, features, or audit.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
