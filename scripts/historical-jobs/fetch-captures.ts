import { mkdir, readFile, writeFile } from 'node:fs/promises'
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
  const rawDir = path.join(root, 'raw')
  const htmlDir = path.join(root, 'html')
  await mkdir(rawDir, { recursive: true })
  await mkdir(htmlDir, { recursive: true })

  const body = await readFile(path.join(root, 'index-records.jsonl'), 'utf8')
  const indexed = body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as IndexedCapture)
  const selected = max ? indexed.slice(0, max) : indexed
  const results: Array<Record<string, unknown>> = []

  for (const capture of selected) {
    const captureId = sha256(`${capture.crawlId}|${capture.timestamp}|${capture.url}|${capture.digest}`)
    const rawPath = path.join(rawDir, `${captureId}.warc.gz`)
    const htmlPath = path.join(htmlDir, `${captureId}.html`)
    try {
      try {
        await readFile(htmlPath)
        results.push({ captureId, sourceUrl: capture.url, status: 'reused_html', htmlPath: path.relative(process.cwd(), htmlPath) })
        continue
      } catch {
        // Missing local HTML: fetch the WARC byte range below.
      }

      const offset = Number(capture.offset)
      const length = Number(capture.length)
      const response = await fetch(`${DATA_ROOT}/${capture.filename}`, {
        headers: {
          range: `bytes=${offset}-${offset + length - 1}`,
          'user-agent': 'SolarRoles historical research pipeline',
        },
      })
      if (response.status !== 206 && response.status !== 200) throw new Error(`${response.status} ${response.statusText}`)
      const compressed = Buffer.from(await response.arrayBuffer())
      await writeFile(rawPath, compressed)
      const payload = extractHttpPayloadFromWarc(compressed)
      const html = payload.body.toString(capture.encoding?.toLowerCase() === 'iso-8859-1' ? 'latin1' : 'utf8')
      await writeFile(htmlPath, html)
      results.push({
        captureId,
        sourceUrl: capture.url,
        status: 'downloaded',
        httpStatusLine: payload.statusLine,
        rawPath: path.relative(process.cwd(), rawPath),
        htmlPath: path.relative(process.cwd(), htmlPath),
      })
    } catch (error) {
      results.push({ captureId, sourceUrl: capture.url, status: 'failed', error: String(error) })
    }
  }

  await writeFile(path.join(root, 'fetch-results.jsonl'), results.map((row) => `${JSON.stringify(row)}\n`).join(''))
  console.log(JSON.stringify({
    captures: selected.length,
    downloaded: results.filter((row) => row.status === 'downloaded').length,
    reusedHtml: results.filter((row) => row.status === 'reused_html').length,
    failed: results.filter((row) => row.status === 'failed').length,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
