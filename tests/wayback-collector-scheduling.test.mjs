import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { createCaptureClaims } from '../lib/wayback/captureClaims.mjs'
import { createCollectorScheduler, createSharedSpoolReading } from '../lib/wayback/collectorScheduling.mjs'

test('an occupied CDX lane does not block 39 lanes claiming retries and deferred captures', async () => {
  const db = new DatabaseSync(':memory:')
  db.exec("CREATE TABLE partitions(id INTEGER PRIMARY KEY,status TEXT,retryAt INTEGER); CREATE TABLE captures(id INTEGER PRIMARY KEY,status TEXT,attempts INTEGER DEFAULT 0,retryAt INTEGER DEFAULT 0)")
  db.exec("INSERT INTO partitions VALUES(1,'running',0)")
  const insert = db.prepare('INSERT INTO captures(id,status,retryAt) VALUES(?,?,?)')
  for (let id=0;id<78;id++) insert.run(id,id%2?'deferred':'retry',0)
  insert.run(100,'retry',2000)
  insert.run(101,'pending',0)
  const select = createCollectorScheduler(db,createCaptureClaims(db))
  assert.equal(select(false,1000).row.id,101)
  assert.equal(select(false,1000).kind,'inventory')
  const seen = new Set()
  await Promise.all(Array.from({length:39},async()=>{
    for (;;) {
      const task = select(true,1000)
      if(task.kind!=='capture') {assert.equal(task.kind,'inventory_wait');break}
      assert.equal(seen.has(task.row.id),false);seen.add(task.row.id)
      await Promise.resolve()
    }
  }))
  assert.equal(seen.size,78)
  assert.equal(select(true,2000).row.id,100)
  db.exec("UPDATE partitions SET status='complete'")
  assert.equal(select(false,2000).kind,'idle')
  db.close()
})

test('spool cache is shared across lanes and refreshes after one second',()=>{
  let calls=0
  const read=createSharedSpoolReading(()=>({bytes:++calls}))
  for(let lane=0;lane<70;lane++) assert.equal(read(100).bytes,1)
  assert.equal(read(1099).bytes,1)
  assert.equal(read(1100).bytes,2)
})
