import { readFile, mkdir, writeFile, rename } from 'node:fs/promises'
import path from 'node:path'

const MAX_INTERVAL_MS = 1500
const RECOVERY_SUCCESSES = 4

export class AdaptiveCadence {
  constructor({ initialIntervalMs = 5000, minIntervalMs = 1000, saved = {}, now = Date.now() } = {}) {
    this.minIntervalMs = Math.min(MAX_INTERVAL_MS, minIntervalMs)
    this.intervalMs = Math.min(MAX_INTERVAL_MS, Math.max(this.minIntervalMs, Number(saved.intervalMs) || initialIntervalMs))
    this.cooldownUntil = Number(saved.cooldownUntil) || 0
    this.floorUntil = Number(saved.floorUntil) || 0
    // Without a previous rejection, the saved floor is only the old configured minimum.
    this.rejectedFloor = this.cooldownUntil
      ? Math.min(MAX_INTERVAL_MS, Math.max(this.minIntervalMs, Number(saved.rejectedFloor) || this.minIntervalMs))
      : this.minIntervalMs
    this.lastChange = Number(saved.lastChange) || now
    this.successes = Number(saved.successes) || 0
  }
  observe(status, retryAfter = null, now = Date.now(), sentIntervalMs = this.intervalMs) {
    if (status === 429) {
      this.successes = 0
      const previous = this.intervalMs
      this.rejectedFloor = Math.min(MAX_INTERVAL_MS, Math.max(this.rejectedFloor, this.minIntervalMs, sentIntervalMs * 1.25))
      this.floorUntil = 0
      this.intervalMs = Math.min(MAX_INTERVAL_MS, Math.max(previous, sentIntervalMs) * 2)
      const seconds = retryAfter == null || retryAfter.trim() === '' ? NaN : Number(retryAfter)
      const wait = Number.isFinite(seconds) ? seconds * 1000 : retryAfter ? Date.parse(retryAfter) - now : 0
      this.cooldownUntil = Math.max(this.cooldownUntil, now + Math.max(120000, Number.isFinite(wait) ? wait : 0))
      this.lastChange = now
      return { event: 'wayback_rate_limit', sentIntervalMs, intervalMs: this.intervalMs,
        cooldownUntil: new Date(this.cooldownUntil).toISOString(), retryAfter }
    }
    if (status < 200 || status >= 300) { this.successes = 0; return null }
    this.successes++
    if (now < this.cooldownUntil) { this.successes = 0; return null }
    if (this.successes < RECOVERY_SUCCESSES) return null
    // Four successful responses reduce spacing by 25%, without a timed floor.
    const next = Math.max(this.minIntervalMs, Math.floor(this.intervalMs * 0.75))
    this.successes = 0
    this.rejectedFloor = Math.min(this.rejectedFloor, next)
    this.floorUntil = 0
    if (next >= this.intervalMs) return null
    const previous = this.intervalMs
    this.intervalMs = next; this.lastChange = now
    return { event: 'wayback_rate_recovery', previousIntervalMs: previous, intervalMs: next,
      maxStartsPerSecond: Number((1000 / next).toFixed(4)), learnedFloorMs: this.rejectedFloor }
  }
  snapshot() {
    return { intervalMs: this.intervalMs, cooldownUntil: this.cooldownUntil, rejectedFloor: this.rejectedFloor,
      floorUntil: this.floorUntil, lastChange: this.lastChange, successes: this.successes }
  }
}

export async function adaptiveRateOptions(file, initialIntervalMs, options = {}) {
  let saved = {}
  try { saved = JSON.parse(await readFile(file, 'utf8')) }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  const minIntervalMs = Number(options.minIntervalMs ?? process.env.WAYBACK_MIN_INTERVAL_MS ?? 1000)
  if (!Number.isFinite(minIntervalMs) || minIntervalMs <= 0) throw new Error('WAYBACK_MIN_INTERVAL_MS must be positive')
  const cadence = new AdaptiveCadence({ initialIntervalMs, minIntervalMs, saved })
  let pending = Promise.resolve()
  return { cadence, onCadenceChange: () => {
    const snapshot = `${JSON.stringify(cadence.snapshot())}\n`
    pending = pending.then(async () => {
    await mkdir(path.dirname(file), { recursive: true })
    const temporary = `${file}.${process.pid}.tmp`
    await writeFile(temporary, snapshot)
    await rename(temporary, file)
    })
    return pending
  } }
}
