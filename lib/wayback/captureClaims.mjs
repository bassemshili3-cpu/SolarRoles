export function createCaptureClaims(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS captures_claim_pending ON captures(status) WHERE status='pending';
    CREATE INDEX IF NOT EXISTS captures_claim_retry ON captures(attempts) WHERE status='retry';
    CREATE INDEX IF NOT EXISTS captures_claim_deferred ON captures(attempts) WHERE status='deferred';`)
  // Find the candidate without holding SQLite's writer. The conditional UPDATE
  // still transfers ownership atomically if another connection claims it first.
  const pending = db.prepare("SELECT id FROM captures INDEXED BY captures_claim_pending WHERE status='pending' ORDER BY rowid LIMIT 1")
  const retry = db.prepare("SELECT id FROM captures INDEXED BY captures_claim_retry WHERE status='retry' AND retryAt<=? ORDER BY attempts,rowid LIMIT 1")
  const deferred = db.prepare("SELECT id FROM captures INDEXED BY captures_claim_deferred WHERE status='deferred' AND retryAt<=? ORDER BY attempts,rowid LIMIT 1")
  const claim = db.prepare("UPDATE captures SET status='fetching' WHERE id=? AND status=? AND retryAt<=? RETURNING *")
  function take(select, status, now) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const candidate = select.get(...(status === 'pending' ? [] : [now]))
      if (!candidate) return
      const row = claim.get(candidate.id, status, status === 'pending' ? Number.MAX_SAFE_INTEGER : now)
      if (row) return row
    }
  }
  return { pending: () => take(pending, 'pending', 0), followup: now => take(retry, 'retry', now) ?? take(deferred, 'deferred', now) }
}
