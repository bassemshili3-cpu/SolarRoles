import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { createCaptureMetrics } from '../lib/wayback/captureMetrics.mjs'

test('report totals match capture facts across inserts, transitions, metadata changes, deletes and rollback', () => {
  const db = new DatabaseSync(':memory:')
  db.exec('CREATE TABLE captures(id TEXT PRIMARY KEY,status TEXT,metadata TEXT)')
  const insert = db.prepare('INSERT INTO captures VALUES(?,?,?)')
  insert.run('existing','done',JSON.stringify({bytes:20,reused:true}))
  const totals = createCaptureMetrics(db)
  const check = () => assert.deepEqual(totals(), {...db.prepare(`SELECT
    COALESCE(SUM(CASE WHEN status='done' THEN COALESCE(json_extract(metadata,'$.bytes'),0) ELSE 0 END),0) savedBytes,
    COALESCE(SUM(CASE WHEN json_extract(metadata,'$.reused')=1 THEN 1 ELSE 0 END),0) reusedCaptures,
    COALESCE(SUM(CASE WHEN json_extract(metadata,'$.contentDeduplicated')=1 THEN 1 ELSE 0 END),0) contentDeduplicated FROM captures`).get()})
  check()
  insert.run('pending','pending',null); check()
  insert.run('queued','queued_triage',JSON.stringify({bytes:40,contentDeduplicated:true})); check()
  db.exec("UPDATE captures SET status='done' WHERE id='queued'"); check()
  db.prepare("UPDATE captures SET metadata=? WHERE id='queued'").run(JSON.stringify({bytes:30,reused:true})); check()
  db.exec("UPDATE captures SET status='retry' WHERE id='queued'"); check()
  db.exec('BEGIN'); db.exec("DELETE FROM captures WHERE id='existing'"); check(); db.exec('ROLLBACK'); check()
  db.exec("DELETE FROM captures WHERE id='existing'"); check()
  db.exec("UPDATE captures SET metadata=NULL WHERE id='queued'"); check()
  assert.deepEqual(createCaptureMetrics(db)(), totals())
  db.close()
})
