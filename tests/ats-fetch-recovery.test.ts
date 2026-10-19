import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
import { fetchWorkdayBatch, workdayCursor } from '../lib/ats/workday';
import { paylocityHtml, PaylocityRateLimit, parsePosting, retryAfterMs } from '../lib/ats/paylocity';
import { icimsEmployerMatches, parseIcimsDetail } from '../lib/ats/icims';
import type { AtsFetchContext } from '../lib/ats/fetch-context';

const company = { tenant: 'solar', host: 'wd5', site: 'Careers', name: 'Solar', verified: false };
const origin = 'https://solar.wd5.myworkdayjobs.com';
const postings = [1, 2].map(id => ({ title: 'Solar Installer', externalPath: `/job/Austin/Installer_${id}` }));
const detail = { jobPostingInfo: { jobDescription: '<p>Install solar panels in Austin, TX.</p>', location: 'Austin, TX' } };

test('Workday returns partial results with a cursor and resumes without repeating completed details', async () => {
  let saved: unknown;
  const run: AtsFetchContext = { deadline: Date.now() + 480_000, isKnown: () => false, checkpoint: cursor => { saved = structuredClone(cursor); } };
  const calls: string[] = [];
  const page = { url: () => origin, evaluate: async (_fn: unknown, request: { url: string }) => {
    calls.push(request.url);
    if (request.url.endsWith('/jobs')) return { ok: true, data: { total: 2, jobPostings: postings } };
    run.deadline = Date.now() + 70_000;
    return { ok: true, data: detail };
  } };
  const first = await fetchWorkdayBatch(company, page as any, origin, run);
  assert.equal(first.length, 1);
  assert.deepEqual(saved, { version: 1, offset: 0, completed: [postings[0].externalPath] });
  run.cursor = saved; run.deadline = Date.now() + 480_000;
  page.evaluate = async (_fn, request) => {
    calls.push(request.url);
    return request.url.endsWith('/jobs') ? { ok: true, data: { total: 2, jobPostings: postings } } as any : { ok: true, data: detail } as any;
  };
  const second = await fetchWorkdayBatch(company, page as any, origin, run);
  assert.equal(second.length, 1);
  assert.equal(calls.filter(url => url.endsWith('Installer_1')).length, 1);
  assert.deepEqual(saved, { version: 1, offset: 0, completed: [] });
});

test('Workday retains a failed detail for retry and never accepts a cross-origin page', async () => {
  let saved: unknown;
  const run: AtsFetchContext = { deadline: Date.now() + 480_000, isKnown: () => false, checkpoint: cursor => { saved = structuredClone(cursor); } };
  const page = { url: () => origin, evaluate: async (_fn: unknown, request: { url: string }) => request.url.endsWith('/jobs')
    ? { ok: true, data: { total: 2, jobPostings: postings } } : request.url.endsWith('Installer_1')
      ? { ok: true, data: detail } : { ok: false, status: 503 } };
  assert.equal((await fetchWorkdayBatch(company, page as any, origin, run)).length, 1);
  assert.deepEqual(saved, { version: 1, offset: 0, completed: [postings[0].externalPath] });
  page.url = () => 'https://unexpected.example';
  page.evaluate = async () => { throw new Error('must not request on unexpected origin'); };
  assert.equal((await fetchWorkdayBatch(company, page as any, origin, run)).length, 0);
  assert.deepEqual(workdayCursor({ version: 1, offset: -1, completed: [] }), { version: 1, offset: 0, completed: [] });
});

test('Workday checks new first-page postings before continuing a large catalogue', async () => {
  const offsets: number[] = []; let saved: any;
  const page = { url: () => origin, evaluate: async (_fn: unknown, request: { url: string; body?: { offset: number } }) => {
    if (request.url.endsWith('/jobs')) { offsets.push(request.body!.offset); return { ok: true, data: { total: 200, jobPostings: request.body!.offset === 0 ? [postings[0]] : [] } }; }
    return { ok: true, data: detail };
  } };
  const jobs = await fetchWorkdayBatch(company, page as any, origin, {
    cursor: { version: 1, offset: 120, completed: [] }, deadline: Date.now() + 480_000,
    isKnown: () => false, checkpoint: cursor => { saved = cursor; },
  });
  assert.deepEqual(offsets, [0, 120]);
  assert.equal(jobs.length, 1);
  assert.equal(saved.offset, 0);
});

test('Paylocity respects Retry-After, bounds retries and releases response bodies', async () => {
  const waits: number[] = []; let calls = 0, disposed = 0;
  const request = { get: async () => {
    const status = ++calls < 3 ? 429 : 200;
    return { ok: () => status === 200, status: () => status, headers: () => ({ 'retry-after': '2' }), text: async () => 'success', dispose: async () => { disposed++; } };
  } };
  assert.equal(await paylocityHtml(request as any, 'https://recruiting.paylocity.com/job', Date.now() + 120_000, async ms => { waits.push(ms); }), 'success');
  assert.deepEqual(waits, [2000, 2000]); assert.equal(disposed, 3);
  calls = 0;
  await assert.rejects(paylocityHtml(request as any, 'https://recruiting.paylocity.com/job', Date.now() + 20_000), PaylocityRateLimit);
  assert.equal(calls, 1);
  const now = Date.parse('2026-10-17T12:00:00Z');
  assert.equal(retryAfterMs('Sat, 17 Oct 2026 12:00:10 GMT', now), 10_000);
});

test('Paylocity recognizes graph schemas and refuses another job identity', () => {
  const url = 'https://recruiting.paylocity.com/Recruiting/Jobs/Details/123';
  const html = `<script type="application/ld+json">${JSON.stringify({ '@graph': [{ '@type': ['JobPosting'], url, title: 'Solar Installer' }] })}</script>`;
  assert.equal(parsePosting(html, url)?.title, 'Solar Installer');
  assert.equal(parsePosting(html, url.replace('123', '456')), undefined);
});

test('Paylocity reads server-rendered details without inventing a missing publication date', () => {
  const url = 'https://recruiting.paylocity.com/Recruiting/Jobs/Details/123';
  const html = `<meta property="og:url" content="${url}"><div class="job-preview-title">Solar Installer</div>
    <div class="preview-location">Austin, TX</div><div class="job-preview-details"><div class="job-listing-header">Job Type</div><div>Full-time</div>
    <p>Install solar panels and electrical systems across residential properties in Austin.</p></div>`;
  const job = parsePosting(html, url)!;
  assert.equal(job.title, 'Solar Installer');
  assert.equal(job.employmentType, 'Full-time');
  assert.equal(job.locationText, 'Austin, TX');
  assert.equal(job.datePosted, undefined);
  assert.equal(parsePosting(html, url.replace('123', '456')), undefined);
});

test('iCIMS uses exact employer fields on shared boards and reads prefixed absolute dates', () => {
  const $ = cheerio.load('<li class="iCIMS_JobCardItem"><span class="field-label">Company</span><span>Quanta Power Solutions, LLC</span><a href="/jobs/123/job">Solar Installer</a></li>');
  assert.equal(icimsEmployerMatches($, $('a'), 'Quanta Power Solutions'), true);
  assert.equal(icimsEmployerMatches($, $('a'), 'Other Company'), false);
  const parsed = parseIcimsDetail('<h1>Solar Installer</h1><p>Posted Date 2 days ago(10/15/2026 11:11 AM)</p>', 'Solar Installer');
  assert.equal(parsed.postedAt?.toISOString(), '2026-10-15T00:00:00.000Z');
});

test('Workday malformed listing cannot block valid following postings or pin the cursor', async () => {
  let checkpoint: any;
  const page = { url: () => origin, evaluate: async (_fn: unknown, request: {url:string}) => request.url.endsWith('/jobs')
    ? {ok:true,data:{total:2,jobPostings:[{title:'Broken listing'},postings[0]]}}
    : {ok:true,data:detail} };
  const jobs = await fetchWorkdayBatch(company,page as any,origin,{deadline:Date.now()+480000,isKnown:()=>false,checkpoint:cursor=>{checkpoint=cursor;}});
  assert.equal(jobs.length,1); assert.equal(checkpoint.offset,0);
});
