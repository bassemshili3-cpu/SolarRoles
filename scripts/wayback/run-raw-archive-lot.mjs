import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync, backup } from 'node:sqlite'
import { createHash } from 'node:crypto'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { createGzip, createGunzip, gunzipSync } from 'node:zlib'
import { createInterface } from 'node:readline'
import { cdxUrl, readCdxResponse, RequestQueue, hostMatches, ruleAllowsUrl, atomicJson } from '../../lib/wayback/core.mjs'
import { adaptiveRateOptions } from '../../lib/wayback/adaptiveCadence.mjs'
import { initAdaptiveBlocks,chooseAdaptiveBlock,advanceAdaptiveBlock } from '../../lib/wayback/adaptiveBlocks.mjs'
import { createWaybackCloudStore } from '../../lib/wayback/cloudStorage.mjs'
import { createWaybackProxyPool } from '../../lib/wayback/proxyPool.mjs'
import { triageJobCapture, jobCaptureStorageDecision, JOB_CAPTURE_TRIAGE_VERSION, LEGACY_JOB_CAPTURE_TRIAGE_VERSION, canReuseRetainedTriage } from '../../lib/wayback/jobCaptureTriage.mjs'
import { ambiguousJobLocation, LOCATION_PARSER_VERSION, canDiscardNonUS } from '../../lib/wayback/jobLocation.mjs'
import { createWebshareQuotaGuard, WebshareQuotaPause } from '../../lib/wayback/webshareQuota.mjs'
import { createFleetQuotaClient } from '../../lib/wayback/fleetQuotaClient.mjs'
import { createCaptureClaims } from '../../lib/wayback/captureClaims.mjs'
import { createCaptureMetrics } from '../../lib/wayback/captureMetrics.mjs'
import { writeInventoryBatches } from '../../lib/wayback/inventoryWrites.mjs'
import { createCaptureCleanup } from '../../lib/wayback/captureCleanup.mjs'
import { createCollectorScheduler, createSharedSpoolReading } from '../../lib/wayback/collectorScheduling.mjs'

const arg=(name,fallback=null)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1]}
const manifest=JSON.parse(fs.readFileSync(arg('manifest'),'utf8'))
const root=path.resolve(arg('output'))
const cloud=process.argv.includes('--cloud')?createWaybackCloudStore():null
const proxyPool=process.argv.includes('--proxy')?createWaybackProxyPool():null
const spoolMode=Boolean(cloud&&process.argv.includes('--spool'))
const proxyQuota=proxyPool?(process.env.WAYBACK_FLEET_QUOTA_FILE
  ?createFleetQuotaClient(process.env.WAYBACK_FLEET_QUOTA_FILE):createWebshareQuotaGuard()):null
const parallelConfig=arg('parallel-config')
const laneQueues=[]
let inventoryBusy=false,reportPending=Promise.resolve()
let lastReportAt=0
const ambiguousPolicy=process.env.WAYBACK_AMBIGUOUS_POLICY??'retain'
if(cloud&&!['retain','metadata'].includes(ambiguousPolicy))throw Error('WAYBACK_AMBIGUOUS_POLICY must be retain or metadata')
fs.mkdirSync(root,{recursive:true});fs.mkdirSync(path.join(root,'raw'),{recursive:true})
const rules=JSON.parse(fs.readFileSync(arg('rules'),'utf8')).rules
const CDX_PAGE_SIZE=150000
const reused=new Map()
if(arg('reuse')&&!cloud)for await(const line of createInterface({input:fs.createReadStream(arg('reuse')).pipe(createGunzip()),crlfDelay:Infinity})) {
  if(line){const r=JSON.parse(line);reused.set(r.id,r)}
}
const lock=new DatabaseSync(path.join(root,'worker-lock.sqlite'));lock.exec('PRAGMA busy_timeout=0; CREATE TABLE IF NOT EXISTS owner(id INTEGER); BEGIN EXCLUSIVE')
const db=new DatabaseSync(path.join(root,'checkpoint.sqlite'))
db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS partitions(id TEXT PRIMARY KEY,data TEXT,status TEXT DEFAULT 'pending',page INTEGER DEFAULT 0,cursor TEXT,error TEXT,retryAt INTEGER DEFAULT 0);
 CREATE TABLE IF NOT EXISTS captures(id TEXT PRIMARY KEY,original TEXT,timestamp TEXT,data TEXT,status TEXT DEFAULT 'pending',attempts INTEGER DEFAULT 0,metadata TEXT,error TEXT,retryAt INTEGER DEFAULT 0);
 CREATE INDEX IF NOT EXISTS captures_status ON captures(status,retryAt);
 CREATE TABLE IF NOT EXISTS digest_sources(digest TEXT PRIMARY KEY,captureId TEXT NOT NULL,htmlFile TEXT NOT NULL,contentType TEXT);
 CREATE TABLE IF NOT EXISTS digest_decisions(digest TEXT NOT NULL,original TEXT NOT NULL,status TEXT NOT NULL,metadata TEXT NOT NULL,captureId TEXT NOT NULL,PRIMARY KEY(digest,original));
 CREATE TABLE IF NOT EXISTS cdx_filter_disabled(host TEXT PRIMARY KEY,reason TEXT,disabledAt TEXT);
 CREATE TABLE IF NOT EXISTS host_cdx_limits(host TEXT PRIMARY KEY,pageLimit INTEGER NOT NULL,failures INTEGER NOT NULL DEFAULT 0);`)
db.exec("UPDATE captures SET status='pending' WHERE status='fetching'")
if(!db.prepare('PRAGMA table_info(partitions)').all().some(column=>column.name==='attempts'))db.exec('ALTER TABLE partitions ADD COLUMN attempts INTEGER DEFAULT 0')
// Existing successful exact replays provide reusable bodies for later CDX rows.
if(!db.prepare('SELECT 1 FROM digest_sources LIMIT 1').get())db.exec(`
 INSERT OR IGNORE INTO digest_sources(digest,captureId,htmlFile,contentType)
 SELECT json_extract(data,'$.digest'),id,json_extract(metadata,'$.htmlFile'),json_extract(metadata,'$.contentType')
 FROM captures WHERE status='done' AND json_extract(metadata,'$.exactReplay')=1
 AND json_extract(metadata,'$.reused') IS NULL AND json_extract(data,'$.digest') IS NOT NULL
 AND json_extract(metadata,'$.htmlFile') IS NOT NULL`)
// Signals based on URL alone affect priority, never permanent inclusion.
db.exec("UPDATE captures SET status='deferred' WHERE status='pending' AND json_array_length(json_extract(data,'$.blockedByRules'))>0")
const insertPart=db.prepare('INSERT OR IGNORE INTO partitions(id,data) VALUES(?,?)')
initAdaptiveBlocks(db)
db.exec('BEGIN');for(const p of manifest.partitions)insertPart.run(p.id,JSON.stringify(p));db.exec('COMMIT')
const existingManifest=path.join(root,'manifest.json')
if(fs.existsSync(existingManifest)&&JSON.parse(fs.readFileSync(existingManifest)).registryHash!==manifest.registryHash)throw Error('Registry changed: use a new run directory')
await atomicJson(existingManifest,manifest)
const cadence=await adaptiveRateOptions(path.join(root,'rate-state.json'),1000,{minIntervalMs:1000})
// A failed request is queued for the second pass, not retried inline. 429
// cooldowns and Retry-After are still honored by the adaptive cadence.
const queue=new RequestQueue({minIntervalMs:1000,retries:0,rateLimitRetries:0,timeoutMs:30000,...cadence,
  dispatcherProvider:proxyPool?()=>proxyPool.next():null})
const counts=db.prepare('SELECT status,COUNT(*) AS n FROM captures GROUP BY status')
let stopping=false, requests=0
process.on('SIGTERM',()=>{stopping=true});process.on('SIGINT',()=>{stopping=true})
process.on('message',message=>{if(message?.type==='stop')stopping=true})
process.on('disconnect',()=>{stopping=true})
const freeFloor=Number(arg('min-free-gb','20'))*1024**3
const retryDelayMs=Number(arg('retry-delay-ms','120000'))
const replayBase=(process.env.WAYBACK_REPLAY_BASE??'https://web.archive.org').replace(/\/$/,'')
const technical=/\.(?:css|js|mjs|map|png|jpe?g|gif|svg|woff2?|ttf|ico|zip|pdf)(?:$|[?#])/i
const cdxFilters=['statuscode:^200$','mimetype:(?i).*(html|json).*']
const filterDisabled=db.prepare('SELECT 1 FROM cdx_filter_disabled WHERE host=?')
const disableFilter=db.prepare('INSERT OR IGNORE INTO cdx_filter_disabled(host,reason,disabledAt) VALUES(?,?,?)')
const readHostLimit=db.prepare('SELECT pageLimit,failures FROM host_cdx_limits WHERE host=?')
const saveHostLimit=db.prepare('INSERT INTO host_cdx_limits(host,pageLimit,failures) VALUES(?,?,?) ON CONFLICT(host) DO UPDATE SET pageLimit=excluded.pageLimit,failures=excluded.failures')
const resetHostFailures=db.prepare('UPDATE host_cdx_limits SET failures=0 WHERE host=?')
const addCapture=db.prepare('INSERT OR IGNORE INTO captures(id,original,timestamp,data,status) VALUES(?,?,?,?,?)')
const addReused=db.prepare("INSERT OR IGNORE INTO captures(id,original,timestamp,data,status,metadata) VALUES(?,?,?,?,'done',?)")
const setCapture=db.prepare('UPDATE captures SET status=?,attempts=attempts+1,metadata=?,error=?,retryAt=? WHERE id=?')
const setReused=db.prepare("UPDATE captures SET status='done',metadata=?,error=NULL,retryAt=0 WHERE id=?")
const setDecision=db.prepare('UPDATE captures SET status=?,metadata=?,error=NULL,retryAt=0 WHERE id=?')
const findDigest=db.prepare('SELECT captureId,htmlFile,contentType FROM digest_sources WHERE digest=?')
const saveDigest=db.prepare('INSERT OR IGNORE INTO digest_sources(digest,captureId,htmlFile,contentType) VALUES(?,?,?,?)')
const dropDigest=db.prepare('DELETE FROM digest_sources WHERE digest=?')
const findDecision=db.prepare('SELECT status,metadata,captureId FROM digest_decisions WHERE digest=? AND original=?')
const saveDecision=db.prepare('INSERT INTO digest_decisions(digest,original,status,metadata,captureId) VALUES(?,?,?,?,?) ON CONFLICT(digest,original) DO UPDATE SET status=excluded.status,metadata=excluded.metadata,captureId=excluded.captureId')
const readCaptureMetadata=db.prepare('SELECT original,metadata FROM captures WHERE id=?')
const plannedPartitions=db.prepare('SELECT COUNT(*) n FROM partitions')
const claims=createCaptureClaims(db)
const readCaptureMetrics=createCaptureMetrics(db)
const cleanup=createCaptureCleanup(db)
if(process.env.WAYBACK_REMOTE_TRIAGE==='1')db.exec("CREATE INDEX IF NOT EXISTS captures_local_spool ON captures(status) WHERE status IN ('queued_triage','triaging') AND json_extract(metadata,'$.spoolFile') IS NOT NULL")
const spoolStats=db.prepare("SELECT COUNT(*) n,COALESCE(SUM(json_extract(metadata,'$.spoolBytes')),0) bytes FROM captures WHERE status IN ('queued_triage','triaging')"+
  (process.env.WAYBACK_REMOTE_TRIAGE==='1'?" AND json_extract(metadata,'$.spoolFile') IS NOT NULL":""))
const readSpool=createSharedSpoolReading(()=>spoolStats.get())
const scheduleCapture=createCollectorScheduler(db,claims)
function report(state='running') {
  lastReportAt=Date.now()
  reportPending=reportPending.then(()=>writeReport(state))
  return reportPending
}
async function writeReport(state='running') {
  lastReportAt=Date.now()
  if(!spoolMode)cleanup.drain()
  const metricCache=readCaptureMetrics()
  const statuses=Object.fromEntries(counts.all().map(r=>[r.status,r.n]))
  const partitions=Object.fromEntries(db.prepare('SELECT status,COUNT(*) AS n FROM partitions GROUP BY status').all().map(r=>[r.status,r.n]))
  const firstPassRemaining=(statuses.pending??0)+(partitions.pending??0)+(partitions.running??0)
  const unfinishedCaptures=(statuses.pending??0)+(statuses.fetching??0)+(statuses.retry??0)+(statuses.deferred??0)+(statuses.queued_triage??0)+(statuses.triaging??0)
  const unfinishedPartitions=(partitions.pending??0)+(partitions.running??0)+(partitions.retry??0)+(partitions.grouped??0)
  const out={updatedAt:new Date().toISOString(),pid:process.pid,lot:manifest.id,state,cutoff:manifest.cutoff,
    plannedPartitions:plannedPartitions.get().n,completedPartitions:partitions.complete??0,partitions,captures:statuses,
    savedBytes:metricCache.savedBytes,
    reusedCaptures:metricCache.reusedCaptures,
    intervalMs:cadence.cadence.intervalMs,cooldownUntil:cadence.cadence.cooldownUntil,requests,
    downloadLanes:laneQueues.length||1,
    lanes:laneQueues.map(q=>({slot:q.proxySlot,intervalMs:q.cadence.intervalMs,cooldownUntil:q.cadence.cooldownUntil})),
    waybackResponses:(laneQueues.length?laneQueues:[queue]).reduce((n,q)=>n+q.responseCount,0),
    http429Responses:(laneQueues.length?laneQueues:[queue]).reduce((n,q)=>n+q.http429Count,0),cdxPageSize:CDX_PAGE_SIZE,
    cdxReducedHosts:db.prepare('SELECT COUNT(*) n FROM host_cdx_limits WHERE pageLimit<?').get(CDX_PAGE_SIZE).n,adaptiveBlocks:true,
    storage:cloud?{kind:'idrive_e2',bucket:cloud.bucket,prefix:cloud.prefix}:null,
    proxyCount:proxyPool?.count??0,
    proxyQuota:proxyQuota?.status()??null,spool:spoolMode?spoolStats.get():null,
    triage:cloud?{version:JOB_CAPTURE_TRIAGE_VERSION,ambiguousPolicy,
      filteredNonJobs:statuses.filtered_non_job??0,filteredNonUS:statuses.filtered_non_us??0,metadataOnly:statuses.review_metadata_only??0,
      contentDeduplicated:metricCache.contentDeduplicated}:null,
    pass:firstPassRemaining?'first':'second',firstPassRemaining,
    finished:!unfinishedPartitions&&!unfinishedCaptures,
    complete:(partitions.complete??0)===plannedPartitions.get().n&&!unfinishedCaptures&&!statuses.http_error&&!statuses.replay_mismatch&&!statuses.unavailable,
    cleanupPending:cleanup.pending(),
    warning:'Raw archived HTML/JSON on catalog host families. Blocked-by-rules URLs and failed requests are deferred to a second pass; no URL is permanently excluded by that signal.'}
  await atomicJson(path.join(root,'report.json'),out);console.log(JSON.stringify(out))
  if(proxyQuota)proxyQuota.writeStatus(path.join(root,'proxy-quota.json'))
  return out
}
async function inventory(part,activeQueue=queue) {
  const p=JSON.parse(part.data)
  // Domain-wide searches are large and server-side regex filtering can make
  // them much slower. An exact host falls back to the original query after
  // its first filtered transport/server failure.
  const useServerFilters=!p.host.startsWith('*.')&&!filterDisabled.get(p.host)
  const pageLimit=readHostLimit.get(p.host)?.pageLimit??CDX_PAGE_SIZE
  try {
    const url=new URL(cdxUrl(p.host,p.queryFrom??p.from,p.queryTo??p.to,part.cursor,pageLimit,undefined,useServerFilters?cdxFilters:[]))
    requests++
    const response=await activeQueue.fetch(url.toString(),{timeoutMs:120000}), page=await readCdxResponse(response,bytes=>proxyQuota?.observe(bytes))
    const saved=path.join(root,'cdx',p.id,`page-${part.page+1}.json`)
    if(cloud){
      try{await cloud.putJson(cloud.key(manifest.id,`cdx/${p.id}/page-${part.page+1}.json`),page)}
      catch(error){error.cloudStorageFailure=true;throw error}
    }
    else await atomicJson(saved,page)
    await writeInventoryBatches(db,page.records,r=>{
        let u;try{u=new URL(r.original)}catch{return null}
        const member=(p.blockMembers??[p]).find(m=>r.timestamp.slice(0,8)>=m.from&&r.timestamp.slice(0,8)<=m.to)
        if(!hostMatches(u.hostname,p.host)||!member)return null
        if(String(r.statuscode)!=='200'||!/(?:html|json)/i.test(r.mimetype??'')||technical.test(u.pathname))return null
        const matching=rules.filter(rule=>rule.hosts?.some(h=>hostMatches(u.hostname,h)))
        const blockedByRules=matching.filter(rule=>!ruleAllowsUrl(rule,r.original)).map(r=>r.atsId)
        const id=createHash('sha256').update(`${r.timestamp}\0${r.original}`).digest('hex')
        const data=JSON.stringify({...r,atsIds:matching.map(r=>r.atsId),blockedByRules,partitionId:member.id})
        const cached=reused.get(id)
        return {id,original:r.original,timestamp:r.timestamp,data,cached,blocked:blockedByRules.length>0}
    },r=>{
        if(r.cached)addReused.run(r.id,r.original,r.timestamp,r.data,JSON.stringify({...r.cached,reused:true,bytes:0}))
        else addCapture.run(r.id,r.original,r.timestamp,r.data,r.blocked?'deferred':'pending')
    },()=>{
      advanceAdaptiveBlock(db,part,page)
      resetHostFailures.run(p.host)
    })
  }catch(error){
    if(error.cloudStorageFailure)throw error
    if(useServerFilters&&((error.status??0)>=500||/timeout|terminated|fetch failed/i.test(String(error))))
      disableFilter.run(p.host,String(error).slice(0,500),new Date().toISOString())
    if((error.status??0)>=500||/timeout|terminated/i.test(String(error))){
      const prior=readHostLimit.get(p.host)??{pageLimit:CDX_PAGE_SIZE,failures:0}
      const failures=prior.failures+1
      const pageLimit=Math.min(prior.pageLimit,failures>=4?10000:failures>=2?50000:CDX_PAGE_SIZE)
      saveHostLimit.run(p.host,pageLimit,failures)
    }
    const attempt=(part.attempts??0)+1
    const exhausted=attempt>=(error.status===429?3:(error.status>=400&&error.status<500?2:5))
    db.prepare('UPDATE partitions SET status=?,attempts=?,error=?,retryAt=? WHERE id=?')
      .run(exhausted?'inventory_failed':'retry',attempt,String(error),exhausted?0:Date.now()+retryDelayMs,p.id)
    if(exhausted)for(const member of p.blockMembers??[])if(member.id!==p.id)
      db.prepare("UPDATE partitions SET status='inventory_failed',error=? WHERE id=?").run(`Parent block failed: ${p.id}`,member.id)
  }
}
async function download(row,activeQueue=queue) {
  const item=JSON.parse(row.data)
  const digest=item.digest&&item.digest!=='-'?item.digest:null
  const file=path.join(root,'raw',row.id.slice(0,2),row.id+'.capture.gz')
  const temp=cloud?path.join(root,'spool',row.id+'.capture.gz.tmp'):file+'.tmp'
  const spoolFile=spoolMode?path.join(root,'spool',row.id+'.capture.gz'):null
  const spoolMeta=spoolFile?spoolFile+'.meta.json':null
  try {
    if(spoolMode&&fs.existsSync(spoolMeta)){
      if(!fs.existsSync(spoolFile)&&fs.existsSync(temp))fs.renameSync(temp,spoolFile)
      if(fs.existsSync(spoolFile)){
        setDecision.run('queued_triage',fs.readFileSync(spoolMeta,'utf8'),row.id)
        return
      }
    }
    const priorDecision=cloud&&digest?findDecision.get(digest,row.original):null
    if(priorDecision){
      const prior=JSON.parse(priorDecision.metadata)
      if([JOB_CAPTURE_TRIAGE_VERSION,LEGACY_JOB_CAPTURE_TRIAGE_VERSION].includes(prior.triage?.version) &&
          (priorDecision.status==='filtered_non_job'||priorDecision.status==='filtered_non_us'&&prior.triage?.version===JOB_CAPTURE_TRIAGE_VERSION&&canDiscardNonUS(prior.triage.location))){
        setDecision.run(priorDecision.status,JSON.stringify({...prior,reusedDecision:true,
          sourceCaptureId:priorDecision.captureId,checkedAt:new Date().toISOString(),bytes:0}),row.id)
        return
      }
    }
    // A CDX payload digest can reuse a body already fetched and verified by
    // an exact replay. Keep this capture's own URL, timestamp and raw path.
    const source=digest?findDigest.get(digest):null
    if(source){
      const sourceRow=cloud?readCaptureMetadata.get(source.captureId):null
      const sourceMetadata=cloud?JSON.parse(sourceRow?.metadata??'null'):null
      const reusableTriage=sourceMetadata?.triage?{...sourceMetadata.triage,location:sourceRow.original===row.original&&sourceMetadata.triage.location?.parserVersion===LOCATION_PARSER_VERSION?sourceMetadata.triage.location:ambiguousJobLocation('legacy_or_different_url_digest_location_unparsed')}:null
      const sourceEligible=!cloud||canReuseRetainedTriage(sourceMetadata?.triage)&&
        sourceMetadata.triage.disposition!=='non_job'
      if(!sourceEligible)dropDigest.run(digest)
      const cloudSource=cloud&&source.htmlFile?.startsWith('s3:')?source.htmlFile.slice(3):null
      if(sourceEligible&&cloudSource){
        try {
          await cloud.head(cloudSource)
          setReused.run(JSON.stringify({httpStatus:200,finalUrl:null,contentType:source.contentType,
            checkedAt:new Date().toISOString(),bytes:0,partial:false,htmlFile:null,cloudKey:cloudSource,
            actualReplayTimestamp:null,exactReplay:true,digest,reused:true,triage:reusableTriage,
            reuseMethod:'cdx_digest_cloud_reference',sourceCaptureId:source.captureId,
            replayVerification:'source_exact_replay_and_cdx_digest'}),row.id)
          return
        }catch{dropDigest.run(digest)}
      }
      const sourceFile=cloud?null:path.join(root,source.htmlFile)
      if(sourceFile&&fs.existsSync(sourceFile)&&!fs.existsSync(file)){
        fs.mkdirSync(path.dirname(file),{recursive:true})
        try {
          fs.linkSync(sourceFile,file)
          setReused.run(JSON.stringify({httpStatus:200,finalUrl:null,contentType:source.contentType,
            checkedAt:new Date().toISOString(),bytes:0,partial:false,htmlFile:path.relative(root,file),
            actualReplayTimestamp:null,exactReplay:true,digest:item.digest,reused:true,
            reuseMethod:'cdx_digest_hardlink',sourceCaptureId:source.captureId,
            replayVerification:'source_exact_replay_and_cdx_digest'}),row.id)
          return
        }catch(error){if(error.code!=='EXDEV'&&error.code!=='EPERM'&&error.code!=='ENOTSUP')throw error}
      }else if(sourceFile&&!fs.existsSync(sourceFile))dropDigest.run(digest)
    }
    requests++
    const response=await activeQueue.fetch(`${replayBase}/web/${row.timestamp}id_/${row.original}`)
    const metadata={httpStatus:response.status,finalUrl:response.url,contentType:response.headers.get('content-type'),checkedAt:new Date().toISOString(),bytes:0,partial:response.status===206,htmlFile:null}
    if(response.status!==200) {
      await response.body?.cancel()
      setCapture.run(response.status>=500||response.status===429?'retry':'http_error',JSON.stringify(metadata),`HTTP ${response.status}`,Date.now()+retryDelayMs,row.id);return
    }
    fs.mkdirSync(path.dirname(temp),{recursive:true})
    const controller=new AbortController()
    const timer=setTimeout(()=>controller.abort(),90000)
    try {
      const input=Readable.fromWeb(response.body)
      input.on('data',chunk=>{metadata.bytes+=chunk.length;proxyQuota?.observe(chunk.length)})
      const streamStarted = performance.now()
      await pipeline(input,createGzip({level:1}),fs.createWriteStream(temp),{signal:controller.signal})
      metadata.downloadCompressWriteMs = performance.now() - streamStarted
    }finally{clearTimeout(timer)}
    const match=/\/web\/(\d{14})[^/]*\/(https?:\/\/.*)$/.exec(response.url)
    metadata.actualReplayTimestamp=match?.[1]??null
    let actualHost=null;try{actualHost=new URL(match?.[2]).hostname}catch{}
    metadata.exactReplay=metadata.actualReplayTimestamp===row.timestamp&&actualHost===new URL(row.original).hostname
    metadata.digest=digest
    if(spoolMode&&metadata.exactReplay){
      metadata.spoolFile=path.relative(root,spoolFile).split(path.sep).join('/')
      metadata.spoolBytes=fs.statSync(temp).size
      await atomicJson(spoolMeta,metadata)
      fs.renameSync(temp,spoolFile)
      setCapture.run('queued_triage',JSON.stringify(metadata),null,0,row.id)
      return
    }
    if(cloud){
      if(!metadata.exactReplay){
        metadata.triage={disposition:'ambiguous',reason:'replay_mismatch',version:JOB_CAPTURE_TRIAGE_VERSION}
        cleanup.commit(row.id,[temp],()=>setCapture.run('replay_mismatch',JSON.stringify(metadata),null,0,row.id))
        cleanup.drain()
        return
      }
      let triage
      try {triage=triageJobCapture(row.original,gunzipSync(fs.readFileSync(temp),{maxOutputLength:12*1024*1024}),metadata.contentType)}
      catch {triage={disposition:'ambiguous',reason:'oversized_or_unreadable_capture',version:JOB_CAPTURE_TRIAGE_VERSION,forceRetain:true,location:ambiguousJobLocation('oversized_or_unreadable_capture')} }
      metadata.triage=triage
      const decision=jobCaptureStorageDecision(triage,ambiguousPolicy)
      if(decision!=='store'){
        cleanup.commit(row.id,[temp],()=>{
          setCapture.run(decision,JSON.stringify(metadata),null,0,row.id)
          if(digest)saveDecision.run(digest,row.original,decision,JSON.stringify(metadata),row.id)
        })
        cleanup.drain()
        return
      }
      let stored
      try{stored=await cloud.putDeduplicatedCapture(temp)}
      catch(error){error.cloudStorageFailure=true;throw error}
      metadata.htmlFile=null;metadata.cloudKey=stored.key;metadata.cloudSha256=stored.sha256;
      metadata.storedBytes=stored.bytes;metadata.contentDeduplicated=stored.reused
    }else{
      fs.renameSync(temp,file)
      metadata.htmlFile=path.relative(root,file)
    }
    cleanup.commit(row.id,cloud?[temp]:[],()=>{
      setCapture.run(metadata.exactReplay?'done':'replay_mismatch',JSON.stringify(metadata),null,0,row.id)
      if(metadata.exactReplay&&digest)saveDigest.run(digest,row.id,cloud?'s3:'+metadata.cloudKey:metadata.htmlFile,metadata.contentType)
    })
    cleanup.drain()
  }catch(error){
    // A post-commit cleanup/SQLite error cannot downgrade a durable result.
    if(db.prepare('SELECT status FROM captures WHERE id=?').get(row.id)?.status!=='fetching')return
    if(error.cloudStorageFailure)throw error
    try{fs.unlinkSync(temp)}catch{}
    const attempt=row.attempts+1,exhausted=attempt>=(error.status===429?3:2)
    const metadata=error.status?JSON.stringify({httpStatus:error.status,checkedAt:new Date().toISOString(),bytes:0,htmlFile:null}):null
    setCapture.run(exhausted?'unavailable':'retry',metadata,String(error),exhausted?0:Date.now()+retryDelayMs,row.id)
  }
}
await report()
async function cloudCheckpoint(){
  if(!cloud)return
  if(spoolMode)return // The separate triage worker snapshots SQLite without delaying Wayback.
  const snapshot=path.join(root,'checkpoint.cloud-backup.tmp.sqlite')
  try{
    const source=new DatabaseSync(path.join(root,'checkpoint.sqlite'),{readOnly:true})
    try{await backup(source,snapshot)}finally{source.close()}
    await cloud.putFile(cloud.key(manifest.id,'checkpoint/latest.sqlite'),snapshot,'application/x-sqlite3')
    await cloud.putFile(cloud.key(manifest.id,'checkpoint/rate-state.json'),path.join(root,'rate-state.json'),'application/json')
    await cloud.putFile(cloud.key(manifest.id,'checkpoint/report.json'),path.join(root,'report.json'),'application/json')
  }finally{try{fs.unlinkSync(snapshot)}catch{}}
}
if(cloud){
  await cadence.onCadenceChange()
  await cloud.putJson(cloud.key(manifest.id,'manifest.json'),manifest)
  await cloudCheckpoint()
}
if(proxyQuota){await proxyQuota.refresh();proxyQuota.startPolling()}
let exitState='idle'
let operationsSinceReport=0,lastReportedRequests=requests,lastCloudCheckpointRequests=requests
async function runLane(activeQueue) {
  while(!stopping) {
    if(proxyQuota)try{proxyQuota.check()}catch(error){if(error instanceof WebshareQuotaPause){exitState='paused_proxy_budget';stopping=true;break}throw error}
    const disk=fs.statfsSync(root);if(Number(disk.bavail)*Number(disk.bsize)<freeFloor){exitState='paused_disk_space';stopping=true;break}
    if(spoolMode){
      const backlog=readSpool()
      if((process.env.WAYBACK_REMOTE_TRIAGE !== '1' && backlog.n>=Number(process.env.WAYBACK_SPOOL_MAX_CAPTURES??1000))||
          backlog.bytes>=Number(process.env.WAYBACK_SPOOL_MAX_BYTES??1073741824)){
        if(Date.now()-lastReportAt>=10000)await report('waiting_triage_capacity')
        await new Promise(resolve=>setTimeout(resolve,1000))
        continue
      }
    }
    const task=scheduleCapture(inventoryBusy)
    if(task.kind==='capture')await download(task.row,activeQueue)
    else if(task.kind==='inventory'){
      inventoryBusy=true
      try{await inventory(chooseAdaptiveBlock(db,task.row),activeQueue)}finally{inventoryBusy=false}
    }
    else if(task.kind==='inventory_wait'){
      await new Promise(resolve=>setTimeout(resolve,250));continue
    }
    else {
      const status=await report('waiting_retry')
      if(status.finished){exitState=status.complete?'complete':'finished_with_errors';stopping=true;break}
      await new Promise(resolve=>setTimeout(resolve,10000))
    }
    operationsSinceReport++
    if(Date.now()-lastReportAt>=10000&&(requests>lastReportedRequests||operationsSinceReport>=100)){lastReportedRequests=requests;operationsSinceReport=0;await report()}
    if(cloud&&requests-lastCloudCheckpointRequests>=100){await cloudCheckpoint();lastCloudCheckpointRequests=requests}
    if(Number(arg('max-requests','0'))&&requests>=Number(arg('max-requests'))){exitState='paused_request_limit';stopping=true;break}
  }
}
async function runParallel() {
  const tasks=[]
  const slots=new Set()
  let failure=null
  while(!stopping){
    const config=JSON.parse(fs.readFileSync(parallelConfig,'utf8'))
    for(const slot of config.assignments[manifest.id]??[])if(!slots.has(slot)){
      slots.add(slot)
      const rate=await adaptiveRateOptions(path.join(root,`rate-slot-${slot}.json`),1000,{minIntervalMs:1000})
      rate.cadence.cooldownUntil=Math.max(rate.cadence.cooldownUntil,cadence.cadence.cooldownUntil)
      let identity=null
      const activeQueue=new RequestQueue({minIntervalMs:1000,retries:0,rateLimitRetries:0,timeoutMs:30000,...rate,
        dispatcherProvider:()=>{identity=proxyPool.identity(slot);return proxyPool.at(slot)},
        onResult:result=>{if(process.connected)process.send({type:'proxy_result',slot,identity,...result})}})
      activeQueue.proxySlot=slot
      laneQueues.push(activeQueue)
      tasks.push(runLane(activeQueue).catch(error=>{failure=error;stopping=true}))
    }
    await new Promise(resolve=>setTimeout(resolve,1000))
  }
  await Promise.all(tasks)
  if(failure)throw failure
}
try {
  if(parallelConfig)await runParallel()
  else await runLane(queue)
  await report(exitState==='idle'?'stopped':exitState)
  await cloudCheckpoint()
}catch(error){
  await report(error.cloudStorageFailure?'paused_cloud_storage':'crashed')
  throw error
}finally{proxyQuota?.stopPolling();db.close();lock.exec('ROLLBACK');lock.close();await proxyPool?.close();if(process.connected)process.disconnect()}
