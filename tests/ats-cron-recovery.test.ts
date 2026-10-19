import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
import { fetchOracleNativePosting } from '../lib/ats/oracle-cloud';
import { fetchJobviteJobs } from '../lib/ats/jobvite';
import { icimsDescriptionEmployerMatches, fetchIcimsJobs, parseIcimsDetail } from '../lib/ats/icims';
import { retryPolicy } from '../lib/seo/seed-rewrite-worker';
import { RewriteApiError } from '../lib/seo/rewrite-description';
const originalFetch = globalThis.fetch;
test('Oracle native detail preserves absolute date, qualifications and responsibilities without JSON-LD rendering', async () => {
  globalThis.fetch = async url => {
    assert.equal(new URL(String(url)).searchParams.get('finder'), 'ById;Id=123');
    return Response.json({ items: [{ Id: '999', Title: 'Wrong role' }, { Id: '123', Title: 'Solar Engineer', ExternalPostedStartDate: '2026-10-18T10:00:00Z', ExternalDescriptionStr: '<p>Design PV systems.</p>', ExternalResponsibilitiesStr: 'Prepare wiring diagrams.', ExternalQualificationsStr: 'NABCEP required.', PrimaryLocation: 'Austin, TX', PrimaryLocationCountry: 'US' }] });
  };
  try { const job = await fetchOracleNativePosting('https://employer.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX/job/123'); assert.equal(job?.title, 'Solar Engineer'); assert.equal(job?.datePosted, '2026-10-18T10:00:00Z'); assert.match(job!.description!, /NABCEP/); assert.match(job!.description!, /wiring/); } finally { globalThis.fetch = originalFetch; }
});
test('iCIMS category mismatch falls back to exact employer labels, excluding unrelated subsidiaries', async () => {
  globalThis.fetch = async url => {
    const target = String(url);
    if (/\/jobs\/1\//.test(target)) return new Response('<h1>Solar Installer</h1><p>Overview</p><p>Install solar PV in Austin, TX.</p>');
    return new Response('<select name="searchCategory"><option value="1">Engineering</option></select><li class="iCIMS_JobCardItem"><dt>Company</dt><dd>NorthStar Energy Solutions, LLC.</dd><a href="/jobs/1/solar/job">Solar Installer</a></li><li class="iCIMS_JobCardItem"><dt>Company</dt><dd>Other Subsidiary</dd><a href="/jobs/2/solar/job">Solar Installer</a></li>');
  };
  try { const jobs = await fetchIcimsJobs({ baseUrl: 'https://example.icims.com', name: 'NorthStar', categoryName: 'NorthStar Energy Solutions', verified: false }); assert.equal(jobs.length, 1); assert.match(jobs[0].url, /\/jobs\/1\//); } finally { globalThis.fetch = originalFetch; }
});
test('iCIMS unknown employer requires explicit description identity and scripts cannot contaminate the role', () => {
  assert.equal(icimsDescriptionEmployerMatches('William Charles Electric is hiring a PV installer.', ['William Charles Electric']), true);
  assert.equal(icimsDescriptionEmployerMatches('Another employer needs PV installers.', ['William Charles Electric']), false);
  const detail = parseIcimsDetail('<h1>Solar Installer</h1><script>unrelated garbage</script><script type="application/ld+json">{"@type":"JobPosting","description":"<p>Install PV modules.</p>"}</script>', 'Solar Installer');
  assert.equal(detail.description, 'Install PV modules.');
});
test('Jobvite falls back to the real search list instead of treating a filters-only page as empty', async () => {
  const paths: string[] = [];
  globalThis.fetch = async url => {
    paths.push(new URL(String(url)).pathname);
    if (String(url).includes('/search?')) return new Response('<table><tr><td class="jv-job-list-name"><a href="https://jobs.jobvite.com/employer/job/123">Solar Installer</a></td><td class="jv-job-list-location">Austin, TX</td></tr></table>');
    if (String(url).includes('/job/123')) return new Response('<main><p>Install solar PV modules in Austin, TX.</p></main>');
    return new Response('<h1>Employer careers</h1><select><option>Categories</option></select>');
  };
  try { const jobs = await fetchJobviteJobs({slug:'employer',name:'Employer',verified:false}); assert.equal(jobs.length,1); assert.ok(paths.includes('/employer/search')); } finally { globalThis.fetch=originalFetch; }
});
test('429 exponential cooldown caps at six hours and honors longer Retry-After', () => {
  assert.equal(retryPolicy(new RewriteApiError(429,null), 0, 0, 1).nextAttemptAt.getTime(),600000);
  assert.equal(retryPolicy(new RewriteApiError(429,null), 0, 0, 99).nextAttemptAt.getTime(),21600000);
  assert.equal(retryPolicy(new RewriteApiError(429,'86400'), 0, 0, 1).nextAttemptAt.getTime(),86400000);
});

test('Jobvite pagination remains embedded and accepts no cross-board next link', async () => {
  const urls:string[]=[];
  globalThis.fetch=async url=>{const u=new URL(String(url));urls.push(u.href);
    if(u.pathname.endsWith('/jobs'))return new Response('<h1>Careers</h1>');
    if(u.pathname.includes('/search')&&!u.searchParams.has('p'))return new Response('<a href="https://jobs.jobvite.com/employer/job/123">Solar Installer</a><a class="jv-pagination-next" href="/employer/search/?p=1">Next</a>');
    if(u.pathname.includes('/search')){assert.equal(u.searchParams.get('nl'),'1');assert.equal(u.searchParams.get('fr'),'false');return new Response('<a href="https://jobs.jobvite.com/employer/job/456">Solar Electrician</a><a rel="next" href="https://other.example/jobs">Next</a>');}
    return new Response('<main>Install solar photovoltaic modules and electrical systems.</main>');
  };
  try{const jobs=await fetchJobviteJobs({slug:'employer',name:'Employer',verified:false});assert.equal(jobs.length,2);assert.ok(!urls.some(u=>u.includes('other.example')));}finally{globalThis.fetch=originalFetch;}
});
test('Jobvite retries the real search endpoint after the old list is unavailable', async () => {
  globalThis.fetch=async url=>{const u=new URL(String(url));
    if(u.pathname.endsWith('/jobs'))return new Response('',{status:404});
    if(u.pathname.includes('/search'))return new Response('<a href="https://jobs.jobvite.com/employer/job/123">Solar Installer</a>');
    return new Response('<main>Install solar photovoltaic modules.</main>');
  };
  try{assert.equal((await fetchJobviteJobs({slug:'employer',name:'Employer',verified:false})).length,1);}finally{globalThis.fetch=originalFetch;}
});
