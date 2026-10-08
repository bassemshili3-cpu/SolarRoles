import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { createBridgeQueries } from '../lib/wayback/bridgeQueries.mjs'

test('bridge cursor recovers only sent captures in row order without scanning or sorting the full queue', () => {
  const db=new DatabaseSync(':memory:')
  db.exec('CREATE TABLE captures(id TEXT PRIMARY KEY,status TEXT,metadata TEXT,retryAt INTEGER DEFAULT 0); CREATE INDEX captures_status ON captures(status,retryAt)')
  const insert=db.prepare('INSERT INTO captures(id,status,metadata) VALUES(?,?,?)')
  insert.run('done','done',JSON.stringify({remoteTaskKey:'complete'}))
  insert.run('unsent','queued_triage',JSON.stringify({spoolFile:'local'}))
  insert.run('first','queued_triage',JSON.stringify({remoteTaskKey:'task/first'}))
  insert.run('triaging','triaging',JSON.stringify({remoteTaskKey:'excluded'}))
  insert.run('second','queued_triage',JSON.stringify({remoteTaskKey:'task/second'}))
  const queries=createBridgeQueries(db)
  assert.deepEqual(queries.pending.all().map(row=>row.id),['unsent'])
  const first=queries.recovery.all(0)
  assert.deepEqual(first.map(row=>row.id),['first','second'])
  assert.deepEqual(queries.recovery.all(first[0].seq).map(row=>row.id),['second'])
  const plan=db.prepare("EXPLAIN QUERY PLAN SELECT rowid AS seq,* FROM captures INDEXED BY captures_remote_sent WHERE status='queued_triage' AND json_extract(metadata,'$.remoteTaskKey') IS NOT NULL AND rowid>? ORDER BY rowid LIMIT 4").all(0)
  assert.ok(plan.some(row=>/captures_remote_sent.*rowid>/.test(row.detail)))
  assert.equal(plan.some(row=>/TEMP B-TREE/.test(row.detail)),false)
  db.close()
})
