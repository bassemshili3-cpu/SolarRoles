// Inventory owns one lane only. Other lanes can consume the capture backlog.
export function createCollectorScheduler(db, claims) {
  const primary = db.prepare("SELECT * FROM partitions WHERE status IN ('pending','running') AND retryAt<=? ORDER BY rowid LIMIT 1")
  const retry = db.prepare("SELECT * FROM partitions WHERE status='retry' AND retryAt<=? ORDER BY rowid LIMIT 1")
  return (inventoryBusy, now = Date.now()) => {
    const pending = claims.pending()
    if (pending) return { kind: 'capture', row: pending }
    if (!inventoryBusy) {
      const part = primary.get(now) ?? retry.get(now)
      if (part) return { kind: 'inventory', row: part }
    }
    const followup = claims.followup(now)
    if (followup) return { kind: 'capture', row: followup }
    return { kind: inventoryBusy ? 'inventory_wait' : 'idle' }
  }
}

// All lanes share a bounded-age spool reading instead of scanning it per lane.
export function createSharedSpoolReading(read, ttlMs = 1000) {
  let value, expires = 0
  return (now = Date.now()) => {
    if (!value || now >= expires) { value = read(); expires = now + ttlMs }
    return value
  }
}
