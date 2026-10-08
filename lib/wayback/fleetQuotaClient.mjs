import fs from 'node:fs'
import { WebshareQuotaPause } from './webshareQuota.mjs'

export function createFleetUsageReceiver(observe) {
  let previous = 0
  return message => {
    if (message.type !== 'quota_usage' || !Number.isSafeInteger(message.bytes) || message.bytes < previous) return
    observe(message.bytes - previous); previous = message.bytes
  }
}

// Each child reports a monotonic byte count; the parent accounts for its deltas.
export function createFleetQuotaClient(file, send = message => process.send?.(message, () => {})) {
  let bytes = 0, reported = 0, cached = null, readAt = 0, timer = null
  function status() {
    if (!cached || Date.now() - readAt > 250) {
      cached = JSON.parse(fs.readFileSync(file, 'utf8')); readAt = Date.now()
    }
    return { ...cached, estimatedBytes: cached.estimatedBytes + Math.max(0, bytes - reported) * 2 }
  }
  function flush() { if (bytes > reported) { send({ type: 'quota_usage', bytes }); reported = bytes } }
  return {
    async refresh() { return status() }, status,
    check() {
      const current = status()
      if (!Number.isFinite(current.estimatedBytes) || !(current.stopAtBytes > 0)
        || !Number.isFinite(Date.parse(current.checkedAt)) || !Number.isFinite(Date.parse(current.updatedAt))
        || Date.now() - Date.parse(current.updatedAt) > 30000)
        throw new WebshareQuotaPause('Fleet quota supervisor unavailable')
      if (current.pauseReason || current.estimatedBytes >= current.stopAtBytes)
        throw new WebshareQuotaPause(current.pauseReason ?? 'Webshare budget threshold reached')
    },
    observe(amount) {
      if (Number.isFinite(amount) && amount > 0) bytes += amount
      if (bytes - reported >= 1_000_000) flush()
    },
    startPolling() { if (!timer) { timer = setInterval(flush, 1000); timer.unref() } },
    stopPolling() { clearInterval(timer); timer = null; flush() },
    writeStatus(target) { fs.writeFileSync(target, JSON.stringify(status()) + '\n') },
  }
}
