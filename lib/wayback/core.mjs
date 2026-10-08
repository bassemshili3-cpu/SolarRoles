import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export const ROOT = process.env.WAYBACK_OUTPUT_ROOT ?? 'data/wayback-solar'
export const CDX_ENDPOINT = process.env.WAYBACK_CDX_ENDPOINT ?? 'https://web.archive.org/cdx/search/cdx'
export const FIELDS = 'urlkey,timestamp,original,mimetype,statuscode,digest,length'

export async function jsonFile(file, fallback = null) {
  try { return JSON.parse(await readFile(file, 'utf8')) }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error }
}
export async function atomicText(file, content) {
  await mkdir(path.dirname(file), { recursive: true })
  const temp = `${file}.${process.pid}.${randomUUID()}.tmp`
  await writeFile(temp, content)
  for (let attempt = 0; ; attempt++) {
    try { await rename(temp, file); break }
    catch (error) {
      if (process.platform !== 'win32' || !['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 8) throw error
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
    }
  }
}
export async function atomicJson(file, data) { await atomicText(file, `${JSON.stringify(data, null, 2)}\n`) }
export const safePart = (value) => String(value).replace(/[^a-zA-Z0-9_.-]/g, '_')

export function hostQuery(pattern) {
  const host = pattern.toLowerCase().replace(/^\*\./, '').replace(/\.$/, '')
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) throw new Error(`Unsafe host pattern: ${pattern}`)
  return { host, url: host, matchType: pattern.startsWith('*.') ? 'domain' : 'host' }
}
export function hostMatches(hostname, pattern) {
  const host = hostname.toLowerCase()
  const wanted = pattern.toLowerCase().replace(/^\*\./, '')
  return host === wanted || (pattern.startsWith('*.') && host.endsWith(`.${wanted}`))
}
// Additional restrictions for supplier families that also serve non-job products.
// A fingerprint requirement may be satisfied only by inspected content, not the URL.
export function ruleAllowsUrl(rule, rawUrl, { fingerprintVerified = false } = {}) {
  let url
  try { url = new URL(rawUrl) } catch { return false }
  if (!rule.hosts.some((pattern) => hostMatches(url.hostname, pattern))) return false
  if (rule.validationStatus === 'ready' && rule.readyHostPatterns
    && !rule.readyHostPatterns.some((pattern) => hostMatches(url.hostname, pattern))) return false
  if (rule.validationStatus === 'ready' && rule.readyUrlRegex
    && !new RegExp(rule.readyUrlRegex, 'i').test(rawUrl)) return false
  const constraints = rule.hostMatchConstraints ?? {}
  if (constraints.hostRegex && !new RegExp(constraints.hostRegex, 'i').test(url.hostname)) return false
  if (constraints.pathRegex && !new RegExp(constraints.pathRegex, 'i').test(url.pathname)) return false
  const queryFingerprint = constraints.queryFingerprint
  const queryMatches = queryFingerprint && [...url.searchParams]
    .some(([name, value]) => name.toLowerCase() === queryFingerprint.name.toLowerCase()
      && value.toLowerCase() === queryFingerprint.value.toLowerCase())
  if (constraints.requiresContentFingerprint && !fingerprintVerified && !queryMatches) return false
  return true
}
export function cdxUrl(host, from, to, resumeKey, limit = 500, fields = FIELDS, filters = []) {
  const spec = hostQuery(host)
  const url = new URL(CDX_ENDPOINT)
  for (const [key, value] of Object.entries({ url: spec.url, matchType: spec.matchType,
    from, to, output: 'json', fl: fields, showResumeKey: 'true', limit: String(limit) })) url.searchParams.set(key, value)
  for (const filter of filters) url.searchParams.append('filter', filter)
  if (resumeKey) url.searchParams.set('resumeKey', resumeKey)
  return url.toString()
}
export function parseCdx(text) {
  if (!text.trim() || /^No captures found/i.test(text.trim())) return { records: [], resumeKey: null }
  const data = JSON.parse(text)
  if (Array.isArray(data) && data.length === 0) return { records: [], resumeKey: null }
  if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('Invalid CDX JSON response')
  const header = data[0]
  if (!['urlkey', 'timestamp', 'original'].every((key) => header.includes(key))) throw new Error('Missing required CDX fields')
  let resumeKey = null
  let end = data.length
  if (end >= 3 && Array.isArray(data[end - 2]) && data[end - 2].length === 0 && Array.isArray(data[end - 1]) && data[end - 1].length === 1) {
    resumeKey = data[end - 1][0]; end -= 2
  }
  const records = []
  for (let i = 1; i < end; i++) {
    if (!Array.isArray(data[i]) || data[i].length !== header.length) throw new Error('Malformed CDX row')
    records.push(Object.fromEntries(header.map((key, index) => [key, data[i][index]])))
  }
  return { records, resumeKey }
}

export async function readCdxResponse(response, onBytes = null) {
  let body
  try { body = await response.text() }
  catch (cause) {
    const error = new Error(`CDX response read failed: ${String(cause)}`, { cause })
    error.code = 'CDX_RESPONSE_READ'
    throw error
  }
  onBytes?.(Buffer.byteLength(body))
  if (!body.trim()) {
    const error = new Error('Empty CDX response body; completeness cannot be established')
    error.code = 'CDX_INVALID_RESPONSE'
    throw error
  }
  try { return parseCdx(body) }
  catch (cause) {
    const error = new Error(`Invalid CDX response (${Buffer.byteLength(body)} bytes): ${String(cause)}`, { cause })
    error.code = 'CDX_INVALID_RESPONSE'
    throw error
  }
}

export class RequestQueue {
  /** @param {{minIntervalMs?:number,retries?:number,rateLimitRetries?:number,timeoutMs?:number,cadence?:import('./adaptiveCadence.mjs').AdaptiveCadence|null,onCadenceChange?:()=>Promise<void>,dispatcherProvider?:null|(()=>unknown)}} [options] */
  constructor({ minIntervalMs = 2000, retries = 5, rateLimitRetries = retries, timeoutMs = 45000,
    cadence = null, onCadenceChange = async () => {}, dispatcherProvider = null, onResult = () => {} } = {}) {
    this.minIntervalMs = minIntervalMs; this.retries = retries; this.rateLimitRetries = rateLimitRetries
    this.timeoutMs = timeoutMs; this.nextAt = 0; this.responseCount = 0; this.http429Count = 0
    this.cadence = cadence; this.onCadenceChange = onCadenceChange; this.dispatcherProvider = dispatcherProvider
    this.onResult = onResult
    if (cadence) { this.minIntervalMs = cadence.intervalMs; this.cooldownUntil = cadence.cooldownUntil }
  }
  async fetch(url, init = {}) {
    const { timeoutMs = this.timeoutMs, ...fetchInit } = init
    for (let attempt = 0; ; attempt++) {
      // Serialize request starts, including starts after a shared cooldown.
      let sentIntervalMs
      const ready = (this.startGate ?? Promise.resolve()).then(async () => {
        while (Date.now() < Math.max(this.nextAt, this.cooldownUntil ?? 0)) {
          await new Promise((resolve) => setTimeout(resolve, Math.max(this.nextAt, this.cooldownUntil ?? 0) - Date.now()))
        }
        this.nextAt = Date.now() + this.minIntervalMs
        sentIntervalMs = this.minIntervalMs
      })
      this.startGate = ready.catch(() => {})
      await ready
      let response
      try { response = await fetch(url, { ...fetchInit, ...(this.dispatcherProvider ? { dispatcher: this.dispatcherProvider() } : {}), signal: AbortSignal.timeout(timeoutMs), headers: { 'User-Agent': 'SolarRolesWaybackResearch/1.0 (historical public data)', ...fetchInit.headers } }) }
      catch (error) {
        this.onResult({ status: null, error: error.cause?.code ?? error.code ?? error.name, detail: error.cause?.message ?? error.message })
        if (attempt >= this.retries) throw error
        await this.backoff(attempt)
        continue
      }
      this.responseCount++
      this.onResult({ status: response.status, retryAfter: response.headers.get('Retry-After') })
      if (response.status === 429) this.http429Count++
      if (this.cadence) {
        const event = this.cadence.observe(response.status, response.headers.get('Retry-After'), Date.now(), sentIntervalMs)
        this.minIntervalMs = this.cadence.intervalMs
        this.cooldownUntil = Math.max(this.cooldownUntil ?? 0, this.cadence.cooldownUntil)
        await this.onCadenceChange()
        if (event) console.error(JSON.stringify(event))
      }
      if ((response.status === 429 && attempt < this.rateLimitRetries)
        || ([500, 502, 503, 504].includes(response.status) && attempt < this.retries)) {
        await response.body?.cancel()
        if (response.status === 429 && !this.cadence) {
          this.minIntervalMs = Math.min(7000, Math.max(1000, this.minIntervalMs * 2))
          console.error(JSON.stringify({ event: 'wayback_rate_limit', intervalMs: this.minIntervalMs,
            retryAfter: response.headers.get('Retry-After') }))
        }
        await this.backoff(attempt, response.headers.get('Retry-After'))
        continue
      }
      if (!response.ok) {
        try { await response.body?.cancel() } catch {}
        const error = new Error(`HTTP ${response.status} for ${url}`)
        error.status = response.status
        throw error
      }
      return response
    }
  }
  async backoff(attempt, retryAfter) {
    const parsed = retryAfter == null || retryAfter.trim() === '' ? NaN : Number(retryAfter)
    const date = retryAfter && Number.isNaN(parsed) ? Date.parse(retryAfter) : NaN
    const wait = Number.isFinite(parsed) ? parsed * 1000 : Number.isFinite(date) ? date - Date.now() : Math.min(120000, 2000 * 2 ** attempt + Math.random() * 1000)
    const delay = Math.max(1000, wait)
    this.cooldownUntil = Math.max(this.cooldownUntil ?? 0, Date.now() + delay)
    this.nextAt = Math.max(this.nextAt, this.cooldownUntil)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

export function monthWindows(year) {
  const now = new Date()
  if (year < 2020 || year > 2026) throw new Error('Year must be 2020..2026')
  const maxMonth = year === now.getUTCFullYear() ? now.getUTCMonth() + 1 : year > now.getUTCFullYear() ? 0 : 12
  return Array.from({ length: maxMonth }, (_, i) => {
    const month = String(i + 1).padStart(2, '0')
    const last = String(new Date(Date.UTC(year, i + 1, 0)).getUTCDate()).padStart(2, '0')
    return { label: `${year}-${month}`, from: `${year}${month}01`, to: `${year}${month}${last}` }
  })
}
