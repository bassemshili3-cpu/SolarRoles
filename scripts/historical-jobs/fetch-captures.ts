import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { extractHttpPayloadFromWarc, sha256, type CommonCrawlRecord } from '../../lib/historical-jobs/commonCrawl'

const DEFAULT_DATA_ROOT = 'https://data.commoncrawl.org'
const DEFAULT_USER_AGENT = 'SolarRoles-HistoricalResearch/1.0 (+https://www.solarroles.com/)'

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
  const concurrency = Math.max(1, Math.min(8, numberArg(args, '--concurrency', 2)))
  const retries = Math.max(1, Math.min(8, numberArg(args, '--retries', 4)))
  const requestsPerSecond = Math.max(0.2, Math.min(20, numberArg(args, '--requests-per-second', 2)))
  const manifestName = arg(args, '--manifest', 'index-records.jsonl')
  const retryFailedFrom = arg(args, '--retry-failed-from', '')
  const dataRoot = arg(args, '--data-root', DEFAULT_DATA_ROOT).replace(/\/$/, '')
  const userAgent = arg(args, '--user-agent', DEFAULT_USER_AGENT)
  const resultsName = arg(args, '--results', retryFailedFrom
    ? 'fetch-results-retry.jsonl'
    : manifestName === 'index-records.jsonl'
      ? 'fetch-results.jsonl'
      : `fetch-results-${path.basename(manifestName, path.extname(manifestName))}.jsonl`)
  const rawDir = path.join(root, 'raw')
  const htmlDir = path.join(root, 'html')
  await mkdir(rawDir, { recursive: true })
  await mkdir(htmlDir, { recursive: true })

  const body = await readFile(path.join(root, manifestName), 'utf8')
  const indexed = body.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as IndexedCapture)

  let retryCaptureIds: Set<string> | null = null
  if (retryFailedFrom) {
    const previousBody = await readFile(path.join(root, retryFailedFrom), 'utf8')
    retryCaptureIds = new Set(
      previousBody.split(/\r?\n/).filter(Boolean)
        .map((line) => JSON.parse(line) as Record<string, unknown>)
        .filter((row) => row.status === 'failed' || row.status === 'skipped_forbidden_circuit')
        .map((row) => String(row.captureId ?? ''))
        .filter(Boolean),
    )
  }

  const retrySelected = retryCaptureIds
    ? indexed.filter((capture) => retryCaptureIds!.has(sha256(`${capture.crawlId}|${capture.timestamp}|${capture.url}|${capture.digest}`)))
    : indexed
  const selected = max ? retrySelected.slice(0, max) : retrySelected
  const results: Array<Record<string, unknown> | undefined> = new Array(selected.length)
  let cursor = 0
  let completed = 0
  let nextRequestAt = 0
  let consecutiveForbidden = 0
  let forbiddenCircuitOpen = false

  async function waitForRequestSlot() {
    const intervalMs = Math.ceil(1000 / requestsPerSecond)
    const now = Date.now()
    const slot = Math.max(now, nextRequestAt)
    nextRequestAt = slot + intervalMs
    if (slot > now) await new Promise((resolve) => setTimeout(resolve, slot - now))
  }

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
          if (forbiddenCircuitOpen) throw new Error('403 circuit open')
          await waitForRequestSlot()
          const response = await fetch(`${dataRoot}/${capture.filename}`, {
            headers: {
              range: `bytes=${offset}-${offset + length - 1}`,
              'user-agent': userAgent,
            },
          })
          if (response.status !== 206 && response.status !== 200) {
            const responseText = (await response.text()).replace(/\s+/g, ' ').trim().slice(0, 300)
            if (response.status === 403) {
              consecutiveForbidden += 1
              if (consecutiveForbidden >= 5) forbiddenCircuitOpen = true
            } else {
              consecutiveForbidden = 0
            }
            throw new Error(`${response.status} ${response.statusText}${responseText ? `: ${responseText}` : ''}`)
          }
          consecutiveForbidden = 0
          compressed = Buffer.from(await response.arrayBuffer())
          break
        } catch (error) {
          lastError = error
          if (forbiddenCircuitOpen || attempt === retries) break
          const message = String(error)
          const delayMs = message.includes('403')
            ? Math.min(60000, 5000 * 2 ** (attempt - 1))
            : Math.min(10000, 750 * 2 ** (attempt - 1))
          await new Promise((resolve) => setTimeout(resolve, delayMs))
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
      if (forbiddenCircuitOpen) return
      const index = cursor
      cursor += 1
      if (index >= selected.length) return
      results[index] = await processCapture(index, selected[index])
    }
  }

  console.log(`[fetch] ${selected.length} captures | manifest=${manifestName} | concurrency=${concurrency} | requestsPerSecond=${requestsPerSecond} | retries=${retries}`)
  await Promise.all(Array.from({ length: Math.min(concurrency, selected.length) }, () => worker()))

  if (forbiddenCircuitOpen) {
    for (let index = 0; index < selected.length; index += 1) {
      if (results[index]) continue
      const capture = selected[index]
      const captureId = sha256(`${capture.crawlId}|${capture.timestamp}|${capture.url}|${capture.digest}`)
      results[index] = {
        captureId,
        sourceUrl: capture.url,
        status: 'skipped_forbidden_circuit',
        error: 'Stopped after repeated HTTP 403 responses; wait before retrying.',
      }
    }
  }

  const completedResults = results.filter((row): row is Record<string, unknown> => Boolean(row))
  await writeFile(path.join(root, resultsName), completedResults.map((row) => `${JSON.stringify(row)}\n`).join(''))

  const failedIndexes: IndexedCapture[] = []
  const failureCounts = new Map<string, number>()
  for (let index = 0; index < results.length; index += 1) {
    const row = results[index]
    if (!row || (row.status !== 'failed' && row.status !== 'skipped_forbidden_circuit')) continue
    const capture = selected[index]
    if (capture) failedIndexes.push(capture)
    const raw = String(row.error ?? 'unknown_error')
    const normalized =
      raw.match(/\b(?:429|403|404|416|500|502|503|504)\b/)?.[0]
      ?? raw.replace(/^Error:\s*/i, '').slice(0, 180)
    failureCounts.set(normalized, (failureCounts.get(normalized) ?? 0) + 1)
  }

  const failedManifestName = manifestName === 'index-records.jsonl'
    ? 'index-records-failed.jsonl'
    : `${path.basename(manifestName, path.extname(manifestName))}-failed.jsonl`
  await writeFile(
    path.join(root, failedManifestName),
    failedIndexes.map((row) => `${JSON.stringify(row)}\n`).join(''),
  )

  const topFailures = [...failureCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([error, count]) => ({ error, count }))

  console.log(JSON.stringify({
    captures: selected.length,
    concurrency,
    retries,
    requestsPerSecond,
    manifest: manifestName,
    retryFailedFrom: retryFailedFrom || null,
    dataRoot,
    results: resultsName,
    failedManifest: failedManifestName,
    downloaded: completedResults.filter((row) => row.status === 'downloaded').length,
    reusedHtml: completedResults.filter((row) => row.status === 'reused_html').length,
    failed: completedResults.filter((row) => row.status === 'failed').length,
    skippedForbiddenCircuit: completedResults.filter((row) => row.status === 'skipped_forbidden_circuit').length,
    forbiddenCircuitOpen,
    topFailures,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
