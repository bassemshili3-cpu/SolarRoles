import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { createCaptureClaims } from '../lib/wayback/captureClaims.mjs'

test('70 interleaved lanes claim each capture once and preserve delayed retries', async () => {
  const db = new DatabaseSync(':memory:')
  db.exec("CREATE TABLE captures(id INTEGER PRIMARY KEY,status TEXT,attempts INTEGER DEFAULT 0,retryAt INTEGER DEFAULT 0)")
  const insert = db.prepare('INSERT INTO captures(id,status,retryAt) VALUES(?,?,?)')
  for (let id = 0; id < 500; id++) insert.run(id, 'pending', 0)
  insert.run(500, 'retry', 1000); insert.run(501, 'deferred', 0)
  const claims = createCaptureClaims(db), seen = new Set()
  await Promise.all(Array.from({ length: 70 }, async () => {
    let row
    while ((row = claims.pending())) {
      assert.equal(seen.has(row.id), false)
      seen.add(row.id)
      await Promise.resolve()
    }
  }))
  assert.equal(seen.size, 500)
  assert.equal(claims.followup(999).id, 501)
  assert.equal(claims.followup(999), undefined)
  assert.equal(claims.followup(1000).id, 500)
  assert.equal(claims.followup(1000), undefined)
  db.close()
})

test('retry priority, attempt order and row order use indexes without temporary sorting', () => {
  const db = new DatabaseSync(':memory:')
  db.exec("CREATE TABLE captures(id TEXT PRIMARY KEY,status TEXT,attempts INTEGER DEFAULT 0,retryAt INTEGER DEFAULT 0); CREATE INDEX captures_status ON captures(status,retryAt)")
  const insert = db.prepare('INSERT INTO captures VALUES(?,?,?,?)')
  insert.run('deferred','deferred',0,0)
  insert.run('later','retry',0,1000)
  insert.run('higher','retry',2,0)
  insert.run('first','retry',1,0)
  insert.run('second','retry',1,0)
  const claims = createCaptureClaims(db)
  assert.equal(claims.followup(100).id, 'first')
  assert.equal(claims.followup(100).id, 'second')
  assert.equal(claims.followup(100).id, 'higher')
  assert.equal(claims.followup(100).id, 'deferred')
  assert.equal(claims.followup(1000).id, 'later')
  for (const status of ['retry','deferred']) {
    const plan = db.prepare(`EXPLAIN QUERY PLAN SELECT id FROM captures INDEXED BY captures_claim_${status} WHERE status='${status}' AND retryAt<=? ORDER BY attempts,rowid LIMIT 1`).all(100)
    assert.equal(plan.some(row => /TEMP B-TREE/.test(row.detail)), false)
  }
  db.close()
})

test('a competing claim between candidate selection and ownership update is never duplicated', () => {
  const db = new DatabaseSync(':memory:')
  db.exec("CREATE TABLE captures(id TEXT PRIMARY KEY,status TEXT,attempts INTEGER DEFAULT 0,retryAt INTEGER DEFAULT 0); INSERT INTO captures(id,status) VALUES('first','pending'),('second','pending')")
  let intercept = true
  const wrapper = { exec: sql => db.exec(sql), prepare: sql => {
    const statement = db.prepare(sql)
    if (!sql.startsWith('SELECT id') || !sql.includes("status='pending'")) return statement
    return { get: (...args) => {
      const candidate = statement.get(...args)
      if (candidate && intercept) {
        intercept = false
        db.prepare("UPDATE captures SET status='fetching' WHERE id=?").run(candidate.id)
      }
      return candidate
    } }
  } }
  const claims = createCaptureClaims(wrapper)
  assert.equal(claims.pending().id, 'second')
  assert.equal(claims.pending(), undefined)
  db.close()
})
