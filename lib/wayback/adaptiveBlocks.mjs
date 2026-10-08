export function initAdaptiveBlocks(db) {
 db.exec('CREATE TABLE IF NOT EXISTS host_windows(scope TEXT PRIMARY KEY,months INTEGER NOT NULL)')
}
const scope=p=>`${p.host}:${p.from.slice(0,4)}`
const nextDay=value=>{const d=new Date(`${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10).replaceAll('-','')}
export function chooseAdaptiveBlock(db,part) {
 const p=JSON.parse(part.data)
 if(p.blockMembers||part.page||part.cursor||part.error||part.status!=='pending')return part
 const width=db.prepare('SELECT months FROM host_windows WHERE scope=?').get(scope(p))?.months??1
 if(width===1)return part
 const candidates=db.prepare("SELECT * FROM partitions WHERE status='pending' AND page=0 AND cursor IS NULL AND error IS NULL AND retryAt=0").all()
  .map(row=>({...row,p:JSON.parse(row.data)})).filter(row=>row.p.host===p.host&&row.p.from>=p.from&&row.p.from.slice(0,4)===p.from.slice(0,4))
  .sort((a,b)=>a.p.from.localeCompare(b.p.from))
 const members=[];let expected=p.from
 const used=db.prepare("SELECT 1 FROM captures WHERE json_extract(data,'$.partitionId')=? LIMIT 1")
 for(const row of candidates) {
  if(row.p.from!==expected||row.p.blockMembers||used.get(row.id))break
  members.push(row.p);expected=nextDay(row.p.to)
  if(members.length===width)break
 }
 if(members.length<2||members[0].id!==part.id)return part
 const data={...p,queryFrom:members[0].from,queryTo:members.at(-1).to,blockMembers:members,cdxObservedRecords:0,cdxTotalKnown:true}
 db.exec('BEGIN')
 try {
  db.prepare('UPDATE partitions SET data=? WHERE id=?').run(JSON.stringify(data),part.id)
  const mark=db.prepare("UPDATE partitions SET status='grouped' WHERE id=?")
  for(const member of members.slice(1))mark.run(member.id)
  db.exec('COMMIT')
 }catch(e){db.exec('ROLLBACK');throw e}
 return {...part,data:JSON.stringify(data)}
}
export function advanceAdaptiveBlock(db,part,page) {
 const p=JSON.parse(part.data)
 const known=p.cdxTotalKnown??(part.page===0&&!part.cursor)
 const data={...p,cdxTotalKnown:known,cdxObservedRecords:(p.cdxObservedRecords??0)+page.records.length}
 db.prepare('UPDATE partitions SET data=?,status=?,page=?,cursor=?,error=NULL,retryAt=0 WHERE id=?')
  .run(JSON.stringify(data),page.resumeKey?'running':'complete',part.page+1,page.resumeKey,part.id)
 if(page.resumeKey)return
 for(const member of p.blockMembers??[])if(member.id!==part.id)db.prepare("UPDATE partitions SET status='complete',error=NULL,retryAt=0 WHERE id=?").run(member.id)
 if(!known||data.cdxObservedRecords>=50000)return
 const current=db.prepare('SELECT months FROM host_windows WHERE scope=?').get(scope(p))?.months??1
 const months=current===1?3:6
 db.prepare('INSERT INTO host_windows(scope,months) VALUES(?,?) ON CONFLICT(scope) DO UPDATE SET months=MAX(months,excluded.months)').run(scope(p),months)
}
