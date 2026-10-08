import fs from 'node:fs'
import * as cheerio from 'cheerio'

export const LOCATION_PARSER_VERSION='20261005-us-v2'
export const NON_US_CONFIDENCE=0.95
const reference=JSON.parse(fs.readFileSync(new URL('./us-location-reference.json',import.meta.url)))
export const normalizeLocationText=value=>String(value??'').replace(/&(?:nbsp|amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi,entity=>{
 const named={'&nbsp;':' ','&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>'};if(named[entity.toLowerCase()])return named[entity.toLowerCase()]
 const number=parseInt(entity.slice(entity.toLowerCase().startsWith('&#x')?3:2,-1),entity.toLowerCase().startsWith('&#x')?16:10);return number<=0x10ffff?String.fromCodePoint(number):entity
}).normalize('NFKD').replace(/\p{M}/gu,'').replace(/[\u2010-\u2015]/g,'-').replace(/\s+/g,' ').trim()
const norm=value=>normalizeLocationText(value).toLowerCase()
const territories=new Set(['PR','VI','GU','AS','MP','UM'])
const excludedRegions=new Set(['AA','AE','AP','FM','MH','PW'])
const states=new Map(Object.entries(reference.states).filter(([code])=>!excludedRegions.has(code)).flatMap(([code,name])=>[[norm(name),code],[norm(code),code]]))
const zctas=new Set(reference.zctas)
const countryNames=new Map(),countryCodes=new Set()
const display=new Intl.DisplayNames(['en'],{type:'region'})
for(let a=65;a<=90;a++)for(let b=65;b<=90;b++){
 const code=String.fromCharCode(a,b),name=display.of(code)
 if(name&&name!==code&&!/unknown region/i.test(name)&&!['EU','UN','QO','XA','XB','ZZ','AN','BU','CS','DD','FX','NT','SU','TP','UK','YD','YU','ZR','AC','CP','DG','EA','IC','TA'].includes(code)){
  countryCodes.add(code);countryNames.set(norm(name),code)
 }
}
for(const [name,code] of [['United States of America','US'],['US','US'],['USA','US'],['U.S.','US'],['U.S.A.','US'],['UK','GB'],['United Kingdom','GB'],['Great Britain','GB'],['South Korea','KR'],['Russia','RU'],['U.S. Virgin Islands','VI']])countryNames.set(norm(name),code)
for(const alias of ['D.C.','Washington DC','Washington, DC'])states.set(norm(alias),'DC')
function country(value){
 if(value&&typeof value==='object')value=value.name??value.identifier??value['@id']
 const text=normalizeLocationText(value)
 return countryCodes.has(text.toUpperCase())?text.toUpperCase():countryNames.get(norm(text))??null
}
function state(value){return states.get(norm(value))??null}
const workplace=value=>/hybrid/i.test(value)?'hybrid':/(?:remote|telecommut|home[- ]based|anywhere|nationwide|virtual)/i.test(value)?'remote':/on[- ]?site|in[- ]?office/i.test(value)?'onsite':'unknown'
const scope=value=>/north america|\bamer(?:icas)?\b/i.test(value)?'NORTH_AMERICA':/worldwide|global|anywhere in the world/i.test(value)?'GLOBAL':/\b(?:united states(?: of america)?|u\.?s\.?a?\.?|conus)\b/i.test(value)?'US':'UNKNOWN'
const empty=reason=>({locationRaw:null,locations:[],city:null,state:null,postalCode:null,country:null,workplaceType:'unknown',remoteScope:'UNKNOWN',eligibleStates:[],excludedStates:[],hasUSLocation:false,usStatus:'AMBIGUOUS',confidence:0,evidence:[{source:'safety',reason}],parserVersion:LOCATION_PARSER_VERSION})
export const ambiguousJobLocation=empty
export function conflictingLocationSources(locations=[]){
 const groups=new Map()
 for(const l of locations)if(l.country){const countries=groups.get(l.source)??new Set();countries.add(l.hasUSLocation?'US':l.country);groups.set(l.source,countries)}
 const entries=[...groups.values()]
 return entries.some((a,i)=>entries.slice(i+1).some(b=>![...a].some(country=>b.has(country))))
}

/** Country and region have intentionally separate dictionaries. ZIP-only is never decisive. */
export function normalizeLocationCandidate(candidate){
 const raw=normalizeLocationText(candidate.raw??candidate.name??'')
 let city=normalizeLocationText(candidate.city)||null,region=state(candidate.state),code=country(candidate.country),postal=normalizeLocationText(candidate.postalCode)||null
 const source=candidate.source??'unknown',evidence=[{source,priority:candidate.priority??9,raw:raw.slice(0,500),reason:'location_field'}]
 let conflict=Boolean(candidate.malformed)||(candidate.country!=null&&!code),hasUSLocation=false,confidence=0,usStatus='AMBIGUOUS'
 const parts=raw.split(/\b(?:except|excluding|not in)\b/i)[0].split(/[,;|]/).map(s=>s.trim()).filter(Boolean)
 const rawCountries=parts.filter(p=>norm(p)!=='georgia').map(p=>countryNames.get(norm(p))).filter(Boolean)
 // Free-text Georgia/CA/DE/IN etc. cannot safely choose a country or state.
 const terminal=parts.at(-1),namedCountry=terminal&&norm(terminal)!=='georgia'?countryNames.get(norm(terminal)):null
 if(code&&namedCountry&&code!==namedCountry)conflict=true
 if(!code&&namedCountry)code=namedCountry
 if(new Set(rawCountries).size>1)conflict=true
 if(!city&&parts.length>=2)city=parts[0].replace(/^(?:remote|hybrid|on[- ]?site)\s*[-:]?\s*/i,'').trim()||null
 const regionPart=parts.length>=2?parts.at(namedCountry?-2:-1):null
 if(!region&&regionPart){
  const match=/^(.+?)(?:\s+(\d{5}(?:-\d{4})?))?$/.exec(regionPart)
  const parsed=state(match?.[1]);
  const validCity=parsed&&city&&reference.places[norm(city)]?.includes(parsed)
  // Full state names in an explicit location field are usable; bare ambiguous codes need country/city evidence.
  if(parsed&&(norm(match[1]).length>2||validCity||code==='US'||territories.has(parsed))){region=parsed;postal??=match?.[2]??null}
 }
 if(!region&&parts.length===1&&raw.length>2&&norm(raw)!=='georgia')region=state(raw)
 const military=excludedRegions.has(normalizeLocationText(candidate.state).toUpperCase())||/\b(?:APO|FPO|DPO|AA|AE|AP)\b/.test(raw)
 if(region&&code&&code!=='US'&&code!==region)conflict=true
 if(city&&region)evidence.push({source:'census_places',reason:reference.places[norm(city)]?.includes(region)?'city_state_validated':'city_state_not_in_reference',city,state:region})
 if(postal){const zip=/^\d{5}(?:-\d{4})?$/.test(postal)?postal.slice(0,5):null;evidence.push({source:'census_zcta',reason:zip&&zctas.has(zip)?'known_zcta_not_zip_crosswalk':'postal_not_validated',postalCode:postal})}
 const type=workplace(candidate.workplaceType??raw),remoteScope=scope(raw+' '+(candidate.remoteScope??''))
 const stateList=value=>[...new Set(String(value??'').split(/[,;|]/).map(v=>state(v.trim())).filter(Boolean))]
 const except=/\b(?:except|excluding|not in)\s+(.+)$/i.exec(raw)
 const excludedStates=stateList(candidate.excludedStates??except?.[1])
 const eligibleStates=stateList(candidate.eligibleStates)
 if(candidate.eligibility&&region&&!territories.has(region)&&!eligibleStates.includes(region))eligibleStates.push(region)
 let effectiveScope=eligibleStates.length?'STATE_RESTRICTED':remoteScope
 if(/^(?:remote\s*[-:]?\s*|home[- ]based\s*[-:]?\s*)?(?:united states(?: of america)?|u\.?s\.?a?\.?)(?:\s*[-:]?\s*remote|\s+nationwide|\s+except\b.*)?$/i.test(raw)||/remote within the united states|anywhere in the u\.?s\.?|remote us\b|remote usa\b/i.test(raw))code??='US'
 if(type==='remote'&&effectiveScope==='US')code??='US'
 if(conflict||military){evidence.push({source,reason:military?'military_or_associated_region':'conflicting_country_region_or_raw'});usStatus='AMBIGUOUS'}
 else if(region||territories.has(code)){
  region??=code;code??='US';hasUSLocation=true;confidence=candidate.priority<=3?.99:.9
  usStatus=region==='DC'?'US_DC':territories.has(region)?'US_TERRITORY':'US_STATE'
  if(type==='remote'&&candidate.eligibility)effectiveScope='STATE_RESTRICTED'
 }else if(code==='US'){
  hasUSLocation=true;confidence=.98
  usStatus=type==='remote'?'US_REMOTE':'AMBIGUOUS'
  if(type==='remote')effectiveScope='US'
 }else if(code){
  if(type==='remote'&&(!candidate.eligibility||['GLOBAL','NORTH_AMERICA'].includes(effectiveScope))){evidence.push({source,reason:'remote_country_without_applicant_restriction'})}
  else{usStatus='NON_US';confidence=candidate.priority<=3?.99:candidate.priority===4?.96:.65;evidence.push({source,reason:'affirmative_non_us_country'})}
 }else{
  const hint=/\b(?:conus|usa east|usa west|socal|norcal|pnw|bay area|dmv|mid-atlantic|northeast|tri-state)\b/i.exec(raw)
  evidence.push({source,reason:hint?'informal_region_insufficient_for_state':'unresolved_location'})
 }
 return {locationRaw:raw||null,city,state:region,postalCode:postal,country:code,workplaceType:type,remoteScope:effectiveScope,eligibleStates,excludedStates,hasUSLocation,usStatus,confidence,evidence,source,priority:candidate.priority??9}
}

const isPosting=o=>o&&typeof o==='object'&&!Array.isArray(o)&&([o['@type']].flat().some(t=>/(?:^|\/)JobPosting$/i.test(String(t)))||Boolean((o.title||o.text||o.jobTitle)&&(o.description||o.descriptionPlain||o.content||o.jobDescription)&&(o.id||o.jobId||o.requisitionId||o.jobReqId)))
const asArray=v=>v==null?[]:Array.isArray(v)?v:[v]
function unwrapAddress(value,extra){
 extra=Object.fromEntries(Object.entries(extra).filter(([,v])=>v!=null))
 if(typeof value==='string')return {raw:value,...extra}
 if(!value||typeof value!=='object')return {raw:'',malformed:true,...extra}
 const address=value.address??value
 const ownCountry=address.addressCountry??address.country
 if(extra.country&&ownCountry&&country(extra.country)!==country(ownCountry))extra={...extra,malformed:true}
 return {raw:value.name??address.name??[address.addressLocality,address.addressRegion,typeof address.addressCountry==='string'?address.addressCountry:address.addressCountry?.name].filter(Boolean).join(', '),city:address.addressLocality??address.city,state:address.addressRegion??address.state??address.region,postalCode:address.postalCode,country:address.addressCountry??address.country,...extra}
}

/** Extract only location candidates attached to the current job; other postings and site addresses are not evidence. */
export function extractJobLocationCandidates(original,body,contentType=''){
 const text=Buffer.isBuffer(body)?body.toString('utf8'):String(body),candidates=[],records=[],errors=[]
 let boardContainer=false
 const host=new URL(original).hostname
 function walk(value,source,depth=0){
  if(depth>30||!value||typeof value!=='object')return
  if(Array.isArray(value.jobs)||Array.isArray(value.jobPostings)||[value['@type']].flat().includes('ItemList'))boardContainer=true
  if(isPosting(value)){records.push({job:value,source});return}
  if(value.jobPostingInfo&&typeof value.jobPostingInfo==='object')records.push({job:value.jobPostingInfo,source:'ats_workday'})
  for(const [key,child] of Object.entries(value))if(child&&typeof child==='object'&&!['hiringOrganization','relatedJobs','recommendedJobs','similarJobs','offices','departments'].includes(key))walk(child,source,depth+1)
 }
 const $=cheerio.load(text)
 if(/json/i.test(contentType)||/^[\s\uFEFF]*[\[{]/.test(text)){
  try{const value=JSON.parse(text);if(Array.isArray(value))boardContainer=true;walk(value,'ats_native')}catch{errors.push('malformed_native_json')}
 }else{
  $('script[type="application/ld+json"]').each((_,e)=>{try{walk(JSON.parse($(e).text()),'jsonld')}catch{errors.push('malformed_jsonld')}})
  $('script:not([src]):not([type="application/ld+json"])').each((_,e)=>{
   const value=$(e).text().trim();if(value.length>8*1024*1024){errors.push('oversized_hydration');return}
   try{if(/^[\[{]/.test(value))walk(JSON.parse(value),'hydration')
    else{const assignment=/^(?:window\.)?(?:__INITIAL_STATE__|__APOLLO_STATE__|initialState)\s*=\s*([\s\S]+?);?\s*$/.exec(value);if(assignment)walk(JSON.parse(assignment[1].replace(/;\s*$/,'')),'hydration')}
   }catch{errors.push('malformed_hydration')}
  })
 }
 // Identical JSON-LD/hydration descriptions of one job are multiple sources, not a board.
 const identities=new Set(records.map(r=>norm(r.job.id??r.job.jobId??r.job.requisitionId??r.job.identifier?.value??r.job.title??r.job.text??r.job.jobTitle)))
 const board=boardContainer||identities.size>1||records.some(r=>r.job.jobPostings||r.job.jobs)
 if($('meta[http-equiv]').toArray().some(e=>/refresh/i.test($(e).attr('http-equiv')))||/\b(?:window\.)?location\.(?:replace|assign)\s*\(/.test(text))errors.push('expired_error_or_redirect')
 for(const {job,source} of records){
  const native=source==='ats_native'||source.startsWith('ats_'),priority=native?1:source==='jsonld'?2:3
  const descriptionText=cheerio.load(String(job.description??job.descriptionPlain??job.content??job.jobDescription??'')).text()
  const explicitType=job.workplaceType??job.jobLocationType??(job.remote===true?'remote':null)
  const type=workplace(explicitType)==='unknown'?workplace(descriptionText):explicitType
  if(workplace(explicitType)==='onsite'&&/this (?:job|position|role) is (?:fully )?remote/i.test(descriptionText))errors.push('conflicting_workplace_sources')
  const context={source,priority,workplaceType:type}
  for(const v of asArray(job.jobLocation))candidates.push(unwrapAddress(v,context))
  for(const v of asArray(job.applicantLocationRequirements)){
   const item=unwrapAddress(v,{...context,eligibility:true,workplaceType:type??'remote'})
   if(v?.['@type']==='Country')item.country=v.name??v.identifier
   if(v?.['@type']==='State'||v?.['@type']==='AdministrativeArea')item.state=v.name
   candidates.push(item)
  }
  if(native||source==='hydration'){
   const ats=/greenhouse/i.test(host)?'greenhouse':/lever/i.test(host)?'lever':/myworkdayjobs|workday/i.test(host)?'workday':/icims/i.test(host)?'icims':/jobvite/i.test(host)?'jobvite':'generic_native'
   const extra={...context,source:'ats_'+ats,priority:1,country:job.country??job.countryCode}
   const locations=job.categories?.allLocations??job.locations??job.additionalLocations
   for(const v of asArray(locations))candidates.push(unwrapAddress(v,extra))
   const location=job.categories?.location??job.location??job.primaryLocation
   if(location)candidates.push(unwrapAddress(location,extra))
   if(job.city||job.state||job.country||job.countryCode)candidates.push({raw:[job.city,job.state,job.country??job.countryCode].filter(v=>typeof v==='string').join(', '),city:job.city,state:job.state,country:job.country??job.countryCode,...context})
   if(job.location?.name&&job.offices)for(const office of asArray(job.offices))if(office.name===job.location.name&&office.location)candidates.push(unwrapAddress(office.location,extra))
  }
 }
 // Remove site chrome, related offers, disclaimers and the Wayback toolbar before visible-field extraction.
 $('script,style,noscript,nav,footer,header,#wm-ipp-base,#wm-ipp-print,[id*="related"],[class*="related"],[class*="similar"],[class*="recommend"],[class*="eeo"],[class*="legal"],[class*="salary-transparency"]').remove()
 const container=$('main,[role="main"],article').first().length?$('main,[role="main"],article').first():$('body')
 const seen=new Set()
 container.find('[itemprop="jobLocation"],.location,.job-location,.posting-categories .location,[data-automation-id="locations"],[data-automation-id="location"] span').each((_,e)=>{
  if($(e).closest('[itemprop="hiringOrganization"]').length)return
  const raw=normalizeLocationText($(e).text());if(raw&&raw.length<250&&!seen.has(raw)){seen.add(raw);candidates.push({raw,source:'visible_location',priority:4})}
 })
 container.find('p,li,dd,td,div,span').each((_,e)=>{
  if($(e).children('p,li,dd,td,div').length)return
  const raw=normalizeLocationText($(e).text()),m=/^(?:job\s+location|location|work\s+location|勤務地|lieu|standort)\s*:\s*(.{1,240})$/i.exec(raw)
  if(m&&!seen.has(m[1])){seen.add(m[1]);candidates.push({raw:m[1],source:'visible_location_label',priority:4})}
 })
 container.find('dt,label,strong,b').each((_,e)=>{
  if(!/^(?:job\s+location|location|work\s+location)\s*:?$/i.test(normalizeLocationText($(e).text())))return
  const raw=normalizeLocationText($(e).next().text());if(raw&&raw.length<250&&!seen.has(raw)){seen.add(raw);candidates.push({raw,source:'visible_location_label',priority:4})}
 })
 const lead=normalizeLocationText(container.text()).slice(0,1000)
 const description=normalizeLocationText(container.text())
 const visibleType=workplace(description)
 if(visibleType!=='unknown')for(const candidate of candidates)if(workplace(candidate.workplaceType)==='unknown')candidate.workplaceType=visibleType
 for(const match of description.matchAll(/\b(?:this (?:job|position|role)|the position)\s+is\s+(?:based|located)\s+in\s+([^.!?\n]{2,180})(?:[.!?]|$)/gi)){
  candidates.push({raw:match[1].trim(),source:'job_description_text',priority:6})
 }
 // URL hints are evidence for retention only, and never justify payload deletion.
 if(!candidates.length){
  const pathname=decodeURIComponent(new URL(original).pathname)
  for(const match of pathname.matchAll(/(?:\/|-)([a-z]+(?:-[a-z]+){0,2})-([a-z]{2})(?=-|\/|$)/gi)){
   const city=match[1].replaceAll('-',' '),region=state(match[2])
   if(region&&reference.places[norm(city)]?.includes(region))candidates.push({raw:city+', '+region,city,state:region,source:'url_hint',priority:7})
  }
 }
 const unavailable=/^(?:.*?)(?:job (?:has expired|is no longer available|not found)|position (?:has been filled|is closed)|page not found|access denied)/i.test(lead)
 if(board)errors.push('multiple_job_records_or_board')
 if(unavailable)errors.push('expired_error_or_redirect')
 return {candidates,errors,board,workplaceType:workplace(records.map(r=>r.job.workplaceType??r.job.jobLocationType??'').join(' '))}
}

export function parseJobLocation(original,body,contentType='',{jobDisposition='job'}={}){
 let extracted
 try{extracted=extractJobLocationCandidates(original,body,contentType)}catch{return empty('location_parse_error')}
 if(jobDisposition!=='job'||extracted.board||extracted.errors.length){const result=empty(jobDisposition!=='job'?'job_not_confirmed':extracted.errors[0]);result.evidence.push(...extracted.errors.map(reason=>({source:'safety',reason})));return result}
 if(!extracted.candidates.length)return empty('location_missing_or_dynamic')
 const locations=extracted.candidates.sort((a,b)=>a.priority-b.priority).map(normalizeLocationCandidate)
 const positives=locations.filter(l=>l.hasUSLocation),negatives=locations.filter(l=>l.usStatus==='NON_US'),unknown=locations.filter(l=>l.usStatus==='AMBIGUOUS'&&!l.hasUSLocation)
 const contradictory=locations.some(l=>l.evidence.some(e=>e.reason==='conflicting_country_region_or_raw'))||conflictingLocationSources(locations)
 let usStatus='AMBIGUOUS',confidence=0
 if(contradictory){confidence=0}
 else if(positives.length&&negatives.length){usStatus='MIXED';confidence=Math.min(...[...positives,...negatives].map(l=>l.confidence))}
 else if(positives.length){const decisive=positives.find(l=>l.usStatus!=='AMBIGUOUS');if(decisive){usStatus=decisive.usStatus;confidence=decisive.confidence}}
 else if(negatives.length&&!unknown.length){usStatus='NON_US';confidence=Math.min(...negatives.map(l=>l.confidence))}
 const primary=locations[0],evidence=locations.flatMap(l=>l.evidence)
 if(contradictory||positives.length&&negatives.length)evidence.push({source:'reconciliation',reason:contradictory?'conflicting_sources':'us_and_non_us_locations',conflict:true})
 return {...primary,locationRaw:locations.map(l=>l.locationRaw).filter(Boolean).join(' | '),locations,workplaceType:extracted.workplaceType==='unknown'?primary.workplaceType:extracted.workplaceType,eligibleStates:[...new Set(locations.flatMap(l=>l.eligibleStates))],excludedStates:[...new Set(locations.flatMap(l=>l.excludedStates))],hasUSLocation:Boolean(positives.length),usStatus,confidence,evidence,parserVersion:LOCATION_PARSER_VERSION}
}

export const canDiscardNonUS=location=>location?.parserVersion===LOCATION_PARSER_VERSION&&location.usStatus==='NON_US'&&location.confidence>=NON_US_CONFIDENCE&&!location.hasUSLocation&&!conflictingLocationSources(location.locations)
