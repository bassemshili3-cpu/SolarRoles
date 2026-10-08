import { createHash } from 'node:crypto'
import { captureSpoolPath } from './spoolPath.mjs'

export const REMOTE_QUEUE_VERSION = 'civo-v1'
export const sha256Buffer = body => createHash('sha256').update(body).digest('hex')
export async function runRemoteTaskPool(tasks, concurrency, run, {shouldStop=()=>false,onError=()=>{}} = {}) {
  let next=0
  await Promise.all(Array.from({length:Math.min(concurrency,tasks.length)},async()=>{
    while(!shouldStop()&&next<tasks.length){
      const task=tasks[next++]
      try{await run(task)}catch(error){onError(error,task)}
    }
  }))
}
export function createRemoteTaskCompletionCache(db, parserVersion) {
  db.exec('CREATE TABLE IF NOT EXISTS remote_completed_tasks(taskKey TEXT PRIMARY KEY,etag TEXT NOT NULL,parserVersion TEXT NOT NULL,completedAt INTEGER NOT NULL)')
  const find=db.prepare('SELECT 1 FROM remote_completed_tasks WHERE taskKey=? AND etag=? AND parserVersion=?')
  const save=db.prepare('INSERT INTO remote_completed_tasks VALUES(?,?,?,?) ON CONFLICT(taskKey) DO UPDATE SET etag=excluded.etag,parserVersion=excluded.parserVersion,completedAt=excluded.completedAt')
  return {has:(key,etag)=>Boolean(etag&&find.get(key,etag,parserVersion)),remember:(key,etag)=>{if(etag)save.run(key,etag,parserVersion,Date.now())}}
}
export function remoteTaskKeys(cloud, lot, id) {
  if (!/^(?:aws-(?:[1-9]|1\d|2[0-2])|local)$/.test(lot) || !/^[a-f0-9]{64}$/.test(id)) throw Error('Invalid remote capture identity')
  const base = `${cloud.prefix}/remote-triage/${REMOTE_QUEUE_VERSION}`
  return { task: `${base}/tasks/${lot}/${id}.json`, result: `${base}/results/${lot}/${id}.json`, body: `${base}/bodies/${lot}/${id}.capture.gz`, audit: cloud.key ? cloud.key(lot, `triage-results/${REMOTE_QUEUE_VERSION}/${id}.json`) : `${cloud.prefix}/${lot}/triage-results/${REMOTE_QUEUE_VERSION}/${id}.json` }
}
export function validateRemoteResult(row, result, metadata) {
  if (result.id !== row.id || result.original !== row.original || result.timestamp !== row.timestamp ||
      result.bodySha256 !== metadata.remoteBodySha256 || result.version !== REMOTE_QUEUE_VERSION ||
      !['done','filtered_non_job','filtered_non_us','review_metadata_only'].includes(result.status)) throw Error('Remote result identity mismatch')
  if (result.status === 'done' && (!result.stored?.key || result.stored.sha256 !== result.bodySha256)) throw Error('Remote stored body mismatch')
}
export async function enqueueRemoteCapture(cloud, db, cleanup, root, lot, row, policy = 'retain') {
  const metadata = JSON.parse(row.metadata), file = captureSpoolPath(root, metadata.spoolFile)
  const keys = remoteTaskKeys(cloud, lot, row.id)
  const stored = await cloud.putFile(keys.body, file)
  await cloud.putJson(keys.task, { version: REMOTE_QUEUE_VERSION, lot, id: row.id, original: row.original, timestamp: row.timestamp,
    bodyKey: stored.key, bodySha256: stored.sha256, bodyBytes: stored.bytes, contentType: metadata.contentType,
    policy, createdAt: new Date().toISOString() })
  metadata.remoteTaskKey = keys.task; metadata.remoteBodySha256 = stored.sha256; metadata.remoteBodyBytes = stored.bytes
  delete metadata.spoolFile; delete metadata.spoolBytes
  cleanup.commit(row.id, [file, file + '.meta.json'], () => {
    db.prepare("UPDATE captures SET metadata=?,error=NULL WHERE id=? AND status='queued_triage'").run(JSON.stringify(metadata), row.id)
  })
}
export function finishRemoteCapture(db, cleanup, row, result, files, cache) {
  if (db.prepare('SELECT status FROM captures WHERE id=?').get(row.id)?.status !== 'queued_triage') return false
  const metadata = JSON.parse(row.metadata)
  validateRemoteResult(row, result, metadata)
  metadata.triage = result.triage
  if (result.stored) Object.assign(metadata, { cloudKey: result.stored.key, cloudSha256: result.stored.sha256,
    storedBytes: result.stored.bytes, contentDeduplicated: result.stored.reused })
  delete metadata.spoolFile; delete metadata.spoolBytes
  metadata.remoteTriageCompletedAt = result.completedAt
  if (result.auditKey) metadata.remoteOutcomeKey = result.auditKey
  cleanup.commit(row.id, files, () => {
    db.prepare("UPDATE captures SET status=?,metadata=?,error=NULL,retryAt=0 WHERE id=? AND status='queued_triage'")
      .run(result.status, JSON.stringify(metadata), row.id)
    const digest = JSON.parse(row.data).digest
    if (digest && digest !== '-') {
      if (result.status === 'done') db.prepare('INSERT OR IGNORE INTO digest_sources(digest,captureId,htmlFile,contentType) VALUES(?,?,?,?)')
        .run(digest, row.id, 's3:' + metadata.cloudKey, metadata.contentType)
      else db.prepare('INSERT INTO digest_decisions(digest,original,status,metadata,captureId) VALUES(?,?,?,?,?) ON CONFLICT(digest,original) DO UPDATE SET status=excluded.status,metadata=excluded.metadata,captureId=excluded.captureId')
        .run(digest, row.original, result.status, JSON.stringify(metadata), row.id)
    }
    cache?.count(result.triage, result.status === 'done' ? 'store' : result.status, Boolean(result.cached))
  })
  return true
}
