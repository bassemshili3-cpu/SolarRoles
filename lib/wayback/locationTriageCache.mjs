import { createHash } from 'node:crypto'
import { JOB_CAPTURE_TRIAGE_VERSION } from './jobCaptureTriage.mjs'
import { conflictingLocationSources } from './jobLocation.mjs'

/** URL is part of the key: host-specific exclusions and job context cannot leak across captures. */
export function createLocationTriageCache(db){
 db.exec('CREATE TABLE IF NOT EXISTS location_parse_cache(payloadHash TEXT,original TEXT,parserVersion TEXT,result TEXT,PRIMARY KEY(payloadHash,original,parserVersion)); CREATE TABLE IF NOT EXISTS location_triage_stats(metric TEXT PRIMARY KEY,n INTEGER NOT NULL)')
 db.exec('CREATE TABLE IF NOT EXISTS location_stats_version(id INTEGER PRIMARY KEY CHECK(id=1),version TEXT NOT NULL)')
 if(db.prepare('SELECT version FROM location_stats_version WHERE id=1').get()?.version!==JOB_CAPTURE_TRIAGE_VERSION){
  db.exec('BEGIN IMMEDIATE')
  try{db.exec('DELETE FROM location_triage_stats');db.prepare('INSERT OR REPLACE INTO location_stats_version VALUES(1,?)').run(JOB_CAPTURE_TRIAGE_VERSION);db.exec('COMMIT')}catch(error){db.exec('ROLLBACK');throw error}
 }
 const find=db.prepare('SELECT result FROM location_parse_cache WHERE payloadHash=? AND original=? AND parserVersion=?')
 const save=db.prepare('INSERT OR REPLACE INTO location_parse_cache VALUES(?,?,?,?)')
 const increment=db.prepare('INSERT INTO location_triage_stats(metric,n) VALUES(?,1) ON CONFLICT(metric) DO UPDATE SET n=n+1')
 let writes=0
 return {
  key(body,contentType=''){return createHash('sha256').update(contentType+'\0').update(body).digest('hex')},
  get(hash,original){const row=find.get(hash,original,JOB_CAPTURE_TRIAGE_VERSION);if(!row)return null;try{const value=JSON.parse(row.result);if(conflictingLocationSources(value.location?.locations))value.location={...value.location,usStatus:'AMBIGUOUS',confidence:0,evidence:[...(value.location.evidence??[]),{source:'reconciliation',reason:'conflicting_sources',conflict:true}]};return value}catch{return null}},
  save(hash,original,triage){save.run(hash,original,JOB_CAPTURE_TRIAGE_VERSION,JSON.stringify(triage))},
  count(triage,decision,cached){
   increment.run('processed');increment.run('status:'+ (triage.location?.usStatus??'AMBIGUOUS'));increment.run(cached?'cache_hits':'payloads_parsed')
   if(decision==='filtered_non_us')increment.run('filtered_non_us')
   if(triage.location?.evidence?.some(e=>e.conflict))increment.run('source_conflicts')
   const structured=(triage.location?.locations??[]).filter(l=>l.priority<=3&&l.country)
   const visible=(triage.location?.locations??[]).filter(l=>l.priority>=4&&l.priority<=6&&l.country)
   if(structured.length&&visible.length&&!structured.some(a=>visible.some(b=>(a.hasUSLocation?'US':a.country)===(b.hasUSLocation?'US':b.country))))increment.run('structured_text_conflicts')
   const reasons=[...new Set((triage.location?.evidence??[]).map(e=>e.reason).filter(Boolean))]
   for(const reason of reasons)increment.run('reason:'+reason)
  },
  prune(){if(++writes%1000===0)db.exec('DELETE FROM location_parse_cache WHERE rowid IN (SELECT rowid FROM location_parse_cache ORDER BY rowid DESC LIMIT -1 OFFSET 10000)')},
  stats(){const metrics=Object.fromEntries(db.prepare('SELECT metric,n FROM location_triage_stats').all().map(r=>[r.metric,r.n]));return {parserVersion:JOB_CAPTURE_TRIAGE_VERSION,structured_text_conflicts:0,...metrics,nonUSPayloadDiscardRate:metrics.processed?(metrics.filtered_non_us??0)/metrics.processed:0}},
 }
}
