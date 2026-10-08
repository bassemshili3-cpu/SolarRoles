import { setImmediate } from 'node:timers/promises'

// INSERT OR IGNORE makes replay of a partially committed CDX page safe. Its
// cursor advances only after every batch is durable, never after a partial page.
export async function writeInventoryBatches(db, records, prepare, insert, finish, { batchSize = 500, yieldControl = setImmediate } = {}) {
  if (!Number.isSafeInteger(batchSize) || batchSize < 1) throw Error('Invalid inventory batch size')
  const transaction = operation => {
    db.exec('BEGIN IMMEDIATE')
    try { operation(); db.exec('COMMIT') }
    catch (error) { db.exec('ROLLBACK'); throw error }
  }
  for (let offset = 0; offset < records.length; offset += batchSize) {
    // URL parsing, matching and hashing do not need the writer lock.
    const batch = records.slice(offset, offset + batchSize).map(prepare).filter(Boolean)
    if (batch.length) transaction(() => { for (const row of batch) insert(row) })
    await yieldControl()
  }
  transaction(finish)
}
