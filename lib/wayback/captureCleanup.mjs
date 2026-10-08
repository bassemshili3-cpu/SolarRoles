import fs from 'node:fs'

// Cleanup intent is committed with the final capture state. File deletion is
// independent: a locked file must never undo an upload or a filtering decision.
export function createCaptureCleanup(db, { unlink = fs.unlinkSync, now = Date.now, warn = message => console.error(message) } = {}) {
  db.exec(`CREATE TABLE IF NOT EXISTS capture_file_cleanup (
    path TEXT PRIMARY KEY, captureId TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
    retryAt INTEGER NOT NULL DEFAULT 0, error TEXT);
    CREATE INDEX IF NOT EXISTS capture_file_cleanup_retry ON capture_file_cleanup(retryAt);`)
  const enqueue = db.prepare('INSERT OR IGNORE INTO capture_file_cleanup(path,captureId) VALUES(?,?)')
  const next = db.prepare('SELECT * FROM capture_file_cleanup WHERE retryAt<=? ORDER BY retryAt LIMIT ?')
  const remove = db.prepare('DELETE FROM capture_file_cleanup WHERE path=?')
  const defer = db.prepare('UPDATE capture_file_cleanup SET attempts=attempts+1,retryAt=?,error=? WHERE path=?')
  const count = db.prepare('SELECT COUNT(*) n FROM capture_file_cleanup')
  let busyUntil = 0
  return {
    commit(captureId, files, finalize) {
      db.exec('BEGIN IMMEDIATE')
      try {
        finalize()
        for (const file of files) enqueue.run(file, captureId)
        db.exec('COMMIT')
      } catch (error) { db.exec('ROLLBACK'); throw error }
    },
    drain(limit = 16) {
      if (now() < busyUntil) return
      try {
      const outcomes = []
      for (const row of next.all(now(), limit)) {
        try { unlink(row.path) }
        catch (error) {
          if (error.code !== 'ENOENT') {
            outcomes.push({ row, error })
            warn(JSON.stringify({ event: 'capture_cleanup_deferred', captureId: row.captureId, code: error.code ?? 'UNKNOWN' }))
            continue
          }
        }
        outcomes.push({ row })
      }
      // Delete files outside the writer transaction, then persist the entire
      // batch with one durable commit instead of one fsync per file.
      if (outcomes.length) {
        db.exec('BEGIN IMMEDIATE')
        try {
          for (const { row, error } of outcomes) {
            if (error) defer.run(now() + Math.min(3600000, 30000 * 2 ** Math.min(row.attempts, 7)), String(error), row.path)
            else remove.run(row.path)
          }
          db.exec('COMMIT')
        } catch (error) { db.exec('ROLLBACK'); throw error }
      }
      } catch (error) {
        // A collector can briefly own SQLite's writer. The durable cleanup
        // intent survives; even a file already deleted is safe to retry.
        if (!/database is locked|SQLITE_BUSY/.test(String(error))) throw error
        busyUntil = now() + 1000
      }
    },
    pending: () => count.get().n,
  }
}
