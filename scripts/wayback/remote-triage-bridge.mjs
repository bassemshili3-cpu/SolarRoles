import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync, backup } from 'node:sqlite'
import { createWaybackCloudStore } from '../../lib/wayback/cloudStorage.mjs'
import { createCaptureCleanup } from '../../lib/wayback/captureCleanup.mjs'
import { createLocationTriageCache } from '../../lib/wayback/locationTriageCache.mjs'
import { atomicJson } from '../../lib/wayback/core.mjs'
import { remoteTaskKeys, REMOTE_QUEUE_VERSION, finishRemoteCapture, enqueueRemoteCapture, validateRemoteResult, runRemoteTaskPool } from '../../lib/wayback/remoteTriage.mjs'

import { createSerialCheckpointQueue } from '../../lib/wayback/diskRecovery.mjs'
import { createBridgeLimiter, createStageMetrics } from '../../lib/wayback/bridgePool.mjs'
import { createBridgeQueries } from '../../lib/wayback/bridgeQueries.mjs'
const uploadConcurrency = Number(process.env.WAYBACK_BRIDGE_CONCURRENCY ?? 4)
if (!Number.isSafeInteger(uploadConcurrency) || uploadConcurrency < 1 || uploadConcurrency > 16) throw Error('Invalid bridge concurrency')
const uploadLimiter = createBridgeLimiter(Number(process.env.WAYBACK_BRIDGE_GLOBAL_CONCURRENCY ?? 32))
const acknowledgementLimiter = createBridgeLimiter(8)
const serialCheckpoint = createSerialCheckpointQueue()
const checkpointIntervalMs = Number(process.env.WAYBACK_CHECKPOINT_INTERVAL_MS ?? 300000)
if (!Number.isSafeInteger(checkpointIntervalMs) || checkpointIntervalMs < 300000 || checkpointIntervalMs > 86400000) throw Error('Invalid checkpoint interval')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
export async function runRemoteTriageBridge(root, lot) {
  const metrics = createStageMetrics()
  const checkpointAbort = new AbortController()
  const store = createWaybackCloudStore()
  const cloud = new Proxy(store, { get(target, key) {
    const value = target[key]
    if (typeof value !== 'function' || !['putFile','putJson','getJson','head','list','delete','deleteMany'].includes(key)) return value
    return (...args) => metrics.measure(key, () => value.apply(target, args))
  } })
  const lock = new DatabaseSync(path.join(root, 'triage-lock.sqlite'))
  lock.exec('PRAGMA busy_timeout=0; CREATE TABLE IF NOT EXISTS owner(id INTEGER); BEGIN EXCLUSIVE')
  const db = new DatabaseSync(path.join(root, 'checkpoint.sqlite'))
  db.exec("PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; UPDATE captures SET status='queued_triage' WHERE status='triaging'")
  const cleanup = createCaptureCleanup(db), cache = createLocationTriageCache(db)
  db.exec('CREATE TABLE IF NOT EXISTS remote_queue_cleanup(id TEXT PRIMARY KEY,keys TEXT NOT NULL)')
  const {pending,recovery} = createBridgeQueries(db)
  // DatabaseSync waits block every lot's bridge in this process. Contention is
  // retried by the asynchronous loop, with durable tasks and cleanup retained.
  db.exec('PRAGMA busy_timeout=50')
  let stopping = false, producerDone = !process.connected, sent = 0, processed = 0, lastPoll = 0, lastReport = 0, lastBackup = Date.now(), recoveryCursor = 0
  let checkpointJob = null
  let acknowledgementJob = null
  let resultsToken
  const uploads = new Map(), retryAfter = new Map()
  let uploadFailures = 0, maxActiveUploads = 0
  const stop = () => { stopping = true; checkpointAbort.abort() }
  const message = m => { if (m?.lot && m.lot !== lot) return; if (m?.type === 'stop') stop(); if (m?.type === 'producer_done') producerDone = true }
  const disconnect = stop
  process.on('SIGTERM', stop); process.on('SIGINT', stop); process.on('message', message); process.on('disconnect', disconnect)
  const read = id => db.prepare('SELECT * FROM captures WHERE id=?').get(id)
  async function enqueue(row) {
    const metadata = JSON.parse(row.metadata)
    if (Number.isFinite(metadata.downloadCompressWriteMs)) {
      const s = metrics.stages.downloadCompressWrite ??= {calls:0,failures:0,totalMs:0,maxMs:0}
      s.calls++;s.totalMs+=metadata.downloadCompressWriteMs;s.maxMs=Math.max(s.maxMs,metadata.downloadCompressWriteMs)
    }
    // A restored checkpoint may predate the offload: recover its durable outcome.
    if (metadata.spoolFile && !fs.existsSync(path.resolve(root, metadata.spoolFile))) {
      const keys = remoteTaskKeys(cloud, lot, row.id)
      try {
        const result = await cloud.getJson(keys.audit)
        row.metadata = JSON.stringify({...metadata,remoteBodySha256:result.bodySha256,remoteTaskKey:keys.task})
        finishRemoteCapture(db, cleanup, row, result, [], cache); processed++; return
      } catch (error) { if (error?.$metadata?.httpStatusCode !== 404) throw error }
      const task = await cloud.getJson(keys.task)
      if(task.id!==row.id || task.original!==row.original || task.timestamp!==row.timestamp || task.bodyKey!==keys.body)throw Error('Recovery task identity mismatch')
      const head = await cloud.head(keys.body)
      if(head.Metadata?.sha256!==task.bodySha256 || Number(head.ContentLength)!==task.bodyBytes)throw Error('Recovery body integrity mismatch')
      Object.assign(metadata,{remoteTaskKey:keys.task,remoteBodySha256:task.bodySha256,remoteBodyBytes:task.bodyBytes})
      delete metadata.spoolFile;delete metadata.spoolBytes
      db.prepare("UPDATE captures SET metadata=? WHERE id=? AND status='queued_triage'").run(JSON.stringify(metadata),row.id)
      sent++;return
    }
    // HEAD verification precedes SQLite ownership transfer and any local cleanup.
    await enqueueRemoteCapture(cloud, db, cleanup, root, lot, row, process.env.WAYBACK_AMBIGUOUS_POLICY ?? 'retain')
    sent++
  }
  async function pollResults() {
    const prefix = `${cloud.prefix}/remote-triage/${REMOTE_QUEUE_VERSION}/results/${lot}/`
    let token = resultsToken
    // Bound each sweep so a large results prefix cannot indefinitely postpone
    // queue cleanup, acknowledgement recovery or shutdown.
    for (let pageNumber = 0; pageNumber < 2 && !stopping; pageNumber++) {
      const page = await cloud.list(prefix, token, 100)
      let failure
      await runRemoteTaskPool(page.Contents ?? [],4,object=>acknowledgementLimiter.run(async()=>{
        if(stopping)return
        const id = path.posix.basename(object.Key, '.json'), row = read(id)
        if (!row) throw Error('Result for capture not owned by this lot')
        const keys = remoteTaskKeys(cloud, lot, id)
        if (row.status === 'queued_triage') {
          // A task may finish before the enqueue transaction commits: wait for its identity.
          if (!JSON.parse(row.metadata).remoteTaskKey) return
          const result = await cloud.getJson(object.Key)
          validateRemoteResult(row,result,JSON.parse(row.metadata))
          result.auditKey = keys.audit
          // This permanent evidence survives a lost producer/checkpoint, unlike the queue.
          await cloud.putJson(keys.audit,{...result,captureData:JSON.parse(row.data),captureMetadata:JSON.parse(row.metadata)})
          if (finishRemoteCapture(db, cleanup, row, result, [], cache)) processed++
        }
        // Durable separate cleanup: cloud deletion failures never revert a result.
        if (read(id).status !== 'queued_triage') db.prepare('INSERT OR IGNORE INTO remote_queue_cleanup VALUES(?,?)').run(id, JSON.stringify(keys))
      }),{shouldStop:()=>stopping,onError:error=>{failure ??= error}})
      if (failure) throw failure
      token = page.IsTruncated ? page.NextContinuationToken : undefined
      resultsToken = token
      if (!token) break
    }
  }
  async function drainCloudCleanup() {
    const rows = db.prepare('SELECT * FROM remote_queue_cleanup LIMIT 200').all()
    if (!rows.length || stopping) return
    const keys = rows.map(row=>JSON.parse(row.keys))
    // Task first; the immutable outcome and permanent body remain untouched.
    // Partial S3 failures retain every cleanup intent for an idempotent retry.
    await cloud.deleteMany(keys.map(key=>key.task))
    await cloud.deleteMany(keys.flatMap(key=>[key.body,key.result]))
    db.exec('BEGIN IMMEDIATE')
    try {
      const remove = db.prepare('DELETE FROM remote_queue_cleanup WHERE id=?')
      for (const row of rows) remove.run(row.id)
      db.exec('COMMIT')
    } catch (error) { db.exec('ROLLBACK'); throw error }
  }
  async function recoverAcknowledged() {
    const rows=recovery.all(recoveryCursor)
    if(!rows.length){recoveryCursor=0;return}
    for(const row of rows){
      recoveryCursor=row.seq
      const keys=remoteTaskKeys(cloud,lot,row.id)
      try {
        const result=await cloud.getJson(keys.audit)
        finishRemoteCapture(db,cleanup,row,result,[],cache);processed++
        db.prepare('INSERT OR IGNORE INTO remote_queue_cleanup VALUES(?,?)').run(row.id,JSON.stringify(keys))
      } catch(error){if(error?.$metadata?.httpStatusCode!==404)throw error}
    }
  }
  async function checkpoint() {
    return serialCheckpoint(async () => {
    if (stopping) return
    const disk = fs.statfsSync(root)
    const available = Number(disk.bavail) * Number(disk.bsize)
    const assignmentFile = path.resolve(import.meta.dirname, '../../.tools/wayback-cloud/node-assignment.json')
    const floor = fs.existsSync(assignmentFile) ? JSON.parse(fs.readFileSync(assignmentFile, 'utf8')).minFreeGb ?? 20 : 20
    const required = fs.statSync(path.join(root, 'checkpoint.sqlite')).size + (floor + 1) * 1024 ** 3
    if (available < required) return // Local WAL checkpoint remains authoritative.
    const file = path.join(root, 'checkpoint.remote-backup.tmp.sqlite')
    const source = new DatabaseSync(path.join(root,'checkpoint.sqlite'),{readOnly:true})
    try { await backup(source, file); source.close(); await cloud.putFile(cloud.key(lot, 'checkpoint/latest.sqlite'), file, 'application/x-sqlite3',{abortSignal:checkpointAbort.signal}) }
    finally { try { source.close() } catch {} try { fs.unlinkSync(file) } catch {} }
    })
  }
  try {
    while (!stopping) {
      try {
        if (!acknowledgementJob && Date.now() - lastPoll >= 3000) {
          lastPoll = Date.now()
          acknowledgementJob = (async()=>{
            let failure
            for (const [stage, operation] of [['results',pollResults],['recovery',recoverAcknowledged],['cloudCleanup',drainCloudCleanup]]) {
              try { await metrics.measure(stage, operation) } catch (error) { failure ??= error }
            }
            if (failure) throw failure
          })()
            .catch(error=>console.error(JSON.stringify({event:'remote_ack_retry',lot,error:String(error)})))
            .finally(()=>{acknowledgementJob=null})
        }
        const rows = pending.all()
        for (const row of rows) {
          if (uploads.size >= uploadConcurrency || stopping) break
          if (uploads.has(row.id) || (retryAfter.get(row.id) ?? 0) > Date.now()) continue
          const task = uploadLimiter.run(() => metrics.measure('enqueue', () => enqueue(row)))
            .then(() => retryAfter.delete(row.id))
            .catch(error => { uploadFailures++;retryAfter.set(row.id, Date.now()+2000);console.error(JSON.stringify({event:'remote_enqueue_retry',lot,error:String(error)})) })
            .finally(() => uploads.delete(row.id))
          uploads.set(row.id,task);maxActiveUploads=Math.max(maxActiveUploads,uploads.size)
        }
        for (const [id, until] of retryAfter) if (until < Date.now()-60000) retryAfter.delete(id)
        cleanup.drain()
        if (Date.now() - lastReport >= 10000) {
          const queued = db.prepare("SELECT COUNT(*) n FROM captures WHERE status IN ('queued_triage','triaging')").get().n
          await atomicJson(path.join(root, 'triage-report.json'), { updatedAt: new Date().toISOString(), pid: process.pid,
            state: 'remote_bridge', queued, sent, processed, uploadConcurrency, activeUploads: uploads.size, maxActiveUploads, globalActiveUploads: uploadLimiter.active, globalWaitingUploads: uploadLimiter.waiting, uploadFailures, stages: metrics.stages, cleanupPending: cleanup.pending(), location: cache.stats() })
          lastReport = Date.now()
          if (producerDone && !queued) break
        }
        if (producerDone && fs.existsSync(path.resolve(import.meta.dirname, '../../.tools/wayback-cloud/fleet-stop.request'))) break
        if (!checkpointJob && Date.now() - lastBackup >= checkpointIntervalMs) {
          lastBackup = Date.now()
          checkpointJob = checkpoint().catch(error => console.error(JSON.stringify({event:'remote_checkpoint_retry',lot,error:String(error)})))
            .finally(()=>{checkpointJob=null})
        }
        if (uploads.size) await Promise.race([...uploads.values(), sleep(50)])
        else await sleep(500)
      } catch (error) {
        console.error(JSON.stringify({ event: 'remote_bridge_retry', lot, error: String(error) }))
        await sleep(2000)
      }
    }
    stop()
    await Promise.allSettled(uploads.values())
    await acknowledgementJob
    cleanup.drain(); await checkpointJob
    await checkpoint().catch(error => console.error(JSON.stringify({event:'remote_checkpoint_retry',lot,error:String(error)})))
  } finally {
    db.close(); lock.exec('ROLLBACK'); lock.close()
    process.off('SIGTERM', stop); process.off('SIGINT', stop); process.off('message', message); process.off('disconnect', disconnect)
  }
}
