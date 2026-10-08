// Capture-level decisions only. Files and tenant discovery evidence are retained.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const registryFile=new URL('../../data/wayback-solar/raw-content-exclusion-rules.json',import.meta.url);
const extra=fs.existsSync(registryFile)?JSON.parse(fs.readFileSync(registryFile,'utf8')).rules:[];
export const CONTENT_EXCLUSION_VERSION='20261004-v2'+(extra.length?'-'+createHash('sha256').update(JSON.stringify(extra)).digest('hex').slice(0,12):'');
const rules=[
 ['arris_consumer_knowledge','arris.my.salesforce-sites.com',/^\/consumers\/articles\/knowledge\//i,/ARRIS Consumer Care|Consumers -/i],
 ['magicsoftware_knowledge','magicsoftware.my.salesforce-sites.com',/^\/PublicKnowledge\/articles\/Knowledge\//i,/Magic xpa|Magic\.ini|Magic Software/i],
 ['bflcdpc_personal_loan','bflcdpc.my.salesforce-sites.com',/^\/onlineProducts\/DocumentsUpload$/i,/Submit the following details to get your Personal Loan approved/i],
 ['firsttee_parent_login','firsttee.my.site.com',/^\/TFT_Login$/i,/Parent First Name.*Parent Last Name.*Are you a Military Family/i],
 ['sva_admissions_event','sva-admissions.my.salesforce-sites.com',/^\/(?:EventsListing|EventRegistrationMob)\/?$/i,/(?:current students|current SVA students|faculty|Undergraduate Open House)/i],
 ['iipstate_event','iipstate.my.salesforce-sites.com',/^\/Events$/i,/Register for:.*When:.*Where:.*Attendees/i],
 ['pg_privacy_request','pg-lex.my.salesforce-sites.com',/^\/DNSForm\/?$/i,/P&G Do Not Sell Form.*California Consumer Privacy Act/i],
 ['capstage_donation','capstage.my.salesforce-sites.com',/^\/donate\/?$/i,/make your tax.deductible donation/i],
 ['eriephil_donation','eriephil.my.salesforce-sites.com',/^\/donate\/?$/i,/Make a donation to the Erie Philharmonic today/i],
 ...['bfl-crm.secure.force.com','bflcrm.my.salesforce-sites.com'].map(host=>['bajaj_customer_satisfaction',host,/^\/NPSform\/?$/i,/Feedback Form Based on your latest experience with us, how likely are you to recommend us.*Please rate us from 0 to 10.*Bajaj Finserv/i]),
 ['lexcall_service_case','lexcall.my.salesforce-sites.com',/^\/servicerequest\/LexcallRequestTracking$/i,/LexCall Track Request.*Case Information Status.*Problem/i],
 ['lodha_feedback_expired','lodhagroup.my.salesforce-sites.com',/^\/casefeedback$/i,/Lodha Customer Feedback.*feedback link has been expired/i],
 ['co_school_improvement','co-uip.my.salesforce-sites.com',/^\/$/,/Colorado's Unified Improvement Plan for Schools.*Improvement Plan Information.*Root Cause/i],
 ...['escardio.my.site.com','escardio--community.force.com'].map(host=>['escardio_account',host,/^\/ESCRegister$/i,/Create your MyESC account.*Your My ESC account is your personal record/i]),
 ['energystar_account','energystar.my.site.com',/^\/MesaLogin$/i,/My ENERGY STAR \(MESA\).*ENERGY STAR Privacy and Security Notice/i],
 ['macmillan_support','macmillaneducation.my.salesforce-sites.com',/^\/help\/$/i,/Welcome to Macmillan Education Customer Support.*new support site/i],
 ['lastfm_support','cbsi.my.salesforce-sites.com',/^\/lastfm\/knowledgehome_lfm$/i,/Last\.fm.*Support.*Frequently Asked Questions/i],
 ...['career4.successfactors.com','career8.successfactors.com','career10.successfactors.com'].map(host=>['successfactors_request_error',host,/^\/careers?$/i,/SuccessFactors An error occurred while processing your request\. Please go back to your original page and check the URL/i]),
 ...extra.map(r=>[r.id,r.host,new RegExp(r.pathRegex,'i'),new RegExp(r.contentRegex,'i')]),
];
export function hasRecruitmentEvidence(html,text=visibleCaptureText(html)){return /JobPosting/i.test(html)||/\b(?:Job Description|Job ID|Requisition ID|apply (?:now|for (?:this|the) (?:job|position))|Career Opportunities|job application|upload your (?:CV|resume))\b/i.test(text)}
export function visibleCaptureText(html){return html.replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,' ').replace(/<!--[^]*?-->/g,' ').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|amp|quot|apos|#39|#x27);/gi,x=>({'&nbsp;':' ','&amp;':'&','&quot;':'"','&apos;':"'",'&#39;':"'",'&#x27;':"'"})[x.toLowerCase()]).replace(/\s+/g,' ').trim();}
export function inspectRawContentExclusion(original,html){
 let url;try{url=new URL(original)}catch{return null}
 const text=visibleCaptureText(html);
 // A benefit mentioning loans, a sign-in page or job-related URL is not a rejection.
 if(hasRecruitmentEvidence(html,text))return null;
 let id=null,match=null;
 if(url.hostname.endsWith('.file.force.com')&&/^\/sfc\/dist\/version\/download\//i.test(url.pathname)){
  match=/Unable to Process Request.*We couldn't access the content delivery.*deleted, doesn't exist, or can't be previewed/i.exec(text);if(match)id='salesforce_failed_delivery';
 }
 if(!id)for(const [ruleId,host,route,content]of rules)if(url.hostname===host&&route.test(url.pathname)){match=content.exec(text);if(match){id=ruleId;break}}
 if(!id)return null;
 return {disposition:'excluded_non_job',signature:id,version:CONTENT_EXCLUSION_VERSION,scope:'capture',excerpt:text.slice(Math.max(0,match.index-80),match.index+Math.min(match[0].length,400)+120)};
}
