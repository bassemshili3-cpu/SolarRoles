import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { writeInventoryBatches } from '../lib/wayback/inventoryWrites.mjs'

test('a failed batch never advances pagination and replay preserves unique captures', async () => {
  const db = new DatabaseSync(':memory:')
  db.exec('CREATE TABLE captures(id INTEGER PRIMARY KEY); CREATE TABLE cursor(page INTEGER); INSERT INTO cursor VALUES(0)')
  const insert = db.prepare('INSERT OR IGNORE INTO captures VALUES(?)')
  const records = Array.from({length:7}, (_,index) => index)
  let fail = true, yields = 0
  const write = () => writeInventoryBatches(db,records,id=>({id}),row=>{
    if (fail && row.id===4) throw Error('interrupted')
    insert.run(row.id)
  },()=>db.exec('UPDATE cursor SET page=1'),{batchSize:3,yieldControl:async()=>{
    // No write transaction survives the yield between batches.
    db.exec('BEGIN IMMEDIATE; ROLLBACK'); yields++
  }})
  await assert.rejects(write(), /interrupted/)
  assert.equal(db.prepare('SELECT COUNT(*) n FROM captures').get().n,3)
  assert.equal(db.prepare('SELECT page FROM cursor').get().page,0)
  fail = false; await write()
  assert.equal(db.prepare('SELECT COUNT(*) n FROM captures').get().n,7)
  assert.equal(db.prepare('SELECT page FROM cursor').get().page,1)
  assert.equal(yields,4)
  db.close()
})
