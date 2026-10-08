export function createBridgeQueries(db) {
  db.exec(`CREATE INDEX IF NOT EXISTS captures_remote_unsent ON captures(status) WHERE status='queued_triage' AND json_extract(metadata,'$.remoteTaskKey') IS NULL;
    CREATE INDEX IF NOT EXISTS captures_remote_sent ON captures(status) WHERE status='queued_triage' AND json_extract(metadata,'$.remoteTaskKey') IS NOT NULL;`)
  return {
    pending: db.prepare("SELECT * FROM captures INDEXED BY captures_remote_unsent WHERE status='queued_triage' AND json_extract(metadata,'$.remoteTaskKey') IS NULL ORDER BY rowid LIMIT 128"),
    recovery: db.prepare("SELECT rowid AS seq,* FROM captures INDEXED BY captures_remote_sent WHERE status='queued_triage' AND json_extract(metadata,'$.remoteTaskKey') IS NOT NULL AND rowid>? ORDER BY rowid LIMIT 4"),
  }
}
