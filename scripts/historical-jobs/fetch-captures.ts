import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { extractHttpPayloadFromWarc, sha256, type CommonCrawlRecord } from '../../lib/historical-jobs/commonCrawl'

const DATA_ROOT = 'https://data.commoncrawl.org'

interface IndexedCapture extends CommonCrawlRecord {
  crawlId: string
  year: number
  employerId: string
}

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function numberArg(args: string[], flag: string, fallback: number) {
  const value = Number(arg(args, flag, String(fallback)))
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/benchmark-2020-29'))
  const max = numberArg(args, '--max', 0)
  const concurrency = Math.max(1, Math.min(32, numberArg(args, '--concurrency', 8)))
  const retries = Math.max(1, Math.min(8, numberArg(args, '--retries', 4)))
  const manifestName = arg(args, '--manifest', 'index-records.jsonl')
  const resultsName = arg(args, '--results', manifestName === 'index-records.jsonl' ? 'fetch-results.jsonl' : `fetch-results-${path.basename(manifestName, path.extname(manifestName))}.jsonl`)
  const rawDir = path.join(root, 'raw')
  const htmlDir = path.join(root, 'html')
  await mkdir(rawDir, { recursive: true })
  await mkdir(htmlDir, { recursive: true })

  const body = await readFile(path.join(root, manifestName), 'utf8')
  const indexed = body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as IndexedCapture)
  const selected = max ? indexed.slice(0, max) : indexed
  const results: Array<Record<string, unknown> | undefined> = new Array(selected.length)
  let cursor = 0
  let completed = 0

  async function processCapture(index: number, capture: IndexedCapture) {
    const captureId = sha256(`${capture.crawlId}|${capture.timestamp}|${capture.url}|${capture.digest}`)
    const rawPath = path.join(rawDir, `${captureId}.warc.gz`)
    const htmlPath = path.join(htmlDir, `${captureId}.html`)
    try {
      try {
        await readFile(htmlPath)
        return { captureId, sourceUrl: capture.url, status: 'reused_html', htmlPath: path.relative(process.cwd(), htmlPath) }
      } catch {
        // Missing local HTML: fetch the WARC byte range below.
      }

      const offset = Number(capture.offset)
      const length = Number(capture.length)
      let compressed: Buffer | null = null
      let lastError: unknown = null

      for (let attempt = 1; attempt <= retries; attempt += 1) {
        try {
          const response = await fetch(`${DATA_ROOT}/${capture.filename}`, {
            headers: {
              range: `bytes=${offset}-${offset + length - 1}`,
              'user-agent': 'SolarRoles historical research pipeline',
            },
          })
          if (response.status !== 206 && response.status !== 200) {
            throw new Error(`${response.status} ${response.statusText}`)
          }
          compressed = Buffer.from(await response.arrayBuffer())
          break
        } catch (error) {
          lastError = error
          if (attempt === retries) break
          await new Promise((resolve) => setTimeout(resolve, Math.min(8000, 500 * 2 ** (attempt - 1))))
        }
      }
      if (!compressed) throw lastError ?? new Error('WARC fetch failed')

      const rawTemp = `${rawPath}.tmp`
      const htmlTemp = `${htmlPath}.tmp`
      await rm(rawTemp, { force: true })
      await rm(htmlTemp, { force: true })
      await writeFile(rawTemp, compressed)
      const payload = extractHttpPayloadFromWarc(compressed)
      const html = payload.body.toString(capture.encoding?.toLowerCase() === 'iso-8859-1' ? 'latin1' : 'utf8')
      await writeFile(htmlTemp, html)
      await rename(rawTemp, rawPath)
      await rename(htmlTemp, htmlPath)
      return {
        captureId,
        sourceUrl: capture.url,
        status: 'downloaded',
        httpStatusLine: payload.statusLine,
        rawPath: path.relative(process.cwd(), rawPath),
        htmlPath: path.relative(process.cwd(), htmlPath),
      }
    } catch (error) {
      return { captureId, sourceUrl: capture.url, status: 'failed', error: String(error) }
    } finally {
      completed += 1
      if (completed % 100 === 0 || completed === selected.length) {
        console.log(`[fetch] ${completed}/${selected.length} complete`)
      }
    }
  }

  async function worker() {
    while (true) {
      const index = cursor
      cursor += 1
      if (index >= selected.length) return
      results[index] = await processCapture(index, selected[index])
    }
  }

  console.log(`[fetch] ${selected.length} captures | manifest=${manifestName} | concurrency=${concurrency} | retries=${retries}`)
  await Promise.all(Array.from({ length: Math.min(concurrency, selected.length) }, () => worker()))

  const completedResults = results.filter((row): row is Record<string, unknown> => Boolean(row))
  await writeFile(path.join(root, resultsName), completedResults.map((row) => `${JSON.stringify(row)}\n`).join(''))
  console.log(JSON.stringify({
    captures: selected.length,
    concurrency,
    retries,
    manifest: manifestName,
    results: resultsName,
    downloaded: completedResults.filter((row) => row.status === 'downloaded').length,
    reusedHtml: completedResults.filter((row) => row.status === 'reused_html').length,
    failed: completedResults.filter((row) => row.status === 'failed').length,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
