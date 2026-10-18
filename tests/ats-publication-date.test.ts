import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as cheerio from 'cheerio';
import * as publication from '../lib/ats/publicationDate';
import * as salary from '../lib/ats/salaryFields';
const { absolutePublicationDate, greenhousePublicationDate, jobvitePublicationDate } = publication;

test('source dates must be absolute, valid and nonfuture; no modification or discovery fallback', () => {
  const now = new Date('2026-10-15T12:00:00Z');
  assert.equal(absolutePublicationDate('2026-10-14', now)?.toISOString(), '2026-10-14T00:00:00.000Z');
  for (const input of ['Posted Yesterday', '2026-02-30', '2026-10-16', '', undefined]) assert.equal(absolutePublicationDate(input, now), undefined);
  assert.equal(greenhousePublicationDate({ first_published: '2026-10-14', created_at: '2026-09-01' })?.toISOString(), '2026-10-14T00:00:00.000Z');
  assert.equal(greenhousePublicationDate({ created_at: '2026-09-01' })?.toISOString(), '2026-09-01T00:00:00.000Z');
  assert.equal(greenhousePublicationDate({}), undefined);
});

const url = 'https://jobs.jobvite.com/solar/job/123';
const schema = (datePosted: string, jobUrl = url) => ({ '@type': 'JobPosting', title: 'Solar Installer', url: jobUrl, datePosted });
const html = (nodes: unknown) => `<script type="application/ld+json">${JSON.stringify(nodes)}</script>`;

test('Jobvite reads only the exact job publication and rejects conflicting dates', () => {
  assert.equal(jobvitePublicationDate(html({ '@graph': [schema('2026-10-14')] }), url)?.toISOString(), '2026-10-14T00:00:00.000Z');
  assert.equal(jobvitePublicationDate(html(schema('2026-10-14', url + 'other')), url), undefined);
  assert.equal(jobvitePublicationDate(html([schema('2026-10-14'), schema('2026-10-13')]), url), undefined);
  assert.equal(jobvitePublicationDate(html({ '@type': 'Article', datePosted: '2026-10-14', url }), url), undefined);
});

function provider(file: string, fetch: (url: string) => Promise<unknown>) {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: any = {};
  const require = (id: string) => {
    if (id === 'cheerio') return cheerio;
    if (id.endsWith('publicationDate')) return publication;
    if (id.endsWith('salaryFields')) return salary;
    if (id.endsWith('solar-taxonomy')) return { isSolarInstallerRole: () => true, isGenericInstallerTitle: () => true };
    if (id.includes('parseLocation')) return { extractStateFromLocation: () => 'TX' };
    if (id.endsWith('/browser')) return {};
    if (id.endsWith('/usStates')) return { STATE_CODE_TO_NAME: { TX: 'Texas' } };
    throw Error(`Unexpected dependency ${id}`);
  };
  const expose = file.endsWith('workday.ts') ? '\nexports.detailForTest = fetchJobDetail; exports.normalizeForTest = normalize;' : '';
  vm.runInNewContext('(function(require,exports){' + compiled + expose + '\n})', { fetch, URL, console })(require, exports);
  return exports;
}

test('Greenhouse connector forwards first_published in a real normalized offer', async () => {
  const api = provider('lib/ats/greenhouse.ts', async () => ({ ok: true, json: async () => ({ jobs: [{ id: 123, title: 'Solar Installer', location: { name: 'Austin, TX' }, content: 'Install solar panels.', first_published: '2026-10-14', updated_at: '2026-10-15', absolute_url: url }] }) }));
  const jobs = await api.fetchGreenhouseJobs({ slug: 'solar', name: 'Solar' });
  assert.equal(jobs[0].postedAt.toISOString(), '2026-10-14T00:00:00.000Z');
});

test('Jobvite connector requests embeddable detail and preserves its publication date', async () => {
  const calls: string[] = [];
  const api = provider('lib/ats/jobvite.ts', async target => {
    calls.push(target);
    return { ok: true, text: async () => target.includes('/jobs?')
      ? `<ul><li><a href="${url}">Solar Installer</a><span class="jv-job-list-location">Austin, TX</span></li></ul>`
      : `<h1>Solar Installer</h1><main>Install solar panels.</main><div class="jv-job-detail-location">Austin, TX</div>${html(schema('2026-10-14'))}` };
  });
  const jobs = await api.fetchJobviteJobs({ slug: 'solar', name: 'Solar' });
  assert.equal(jobs[0].postedAt.toISOString(), '2026-10-14T00:00:00.000Z');
  assert.equal(new URL(calls[1]).searchParams.get('fr'), 'false');
  assert.equal(new URL(calls[1]).searchParams.get('nl'), '1');
});

test('Workday detail startDate reaches the normalized offer; postedOn is never substituted', async () => {
  const api = provider('lib/ats/workday.ts', async () => { throw Error('No external fetch'); });
  const company = { tenant: 'solar', host: 'wd5', site: 'Careers', name: 'Solar' };
  const origin = 'https://solar.wd5.myworkdayjobs.com';
  let startDate: string | undefined = '2026-10-14';
  const page = { url: () => origin + '/Careers', evaluate: async () => ({ ok: true, status: 200, data: { jobPostingInfo: { jobDescription: 'Install solar.', location: 'Austin, TX', startDate, postedOn: 'Posted Yesterday' } } }) };
  const posting = { title: 'Solar Installer', externalPath: '/job/Austin/Installer_R123', locationsText: 'Austin, TX' };
  const detail = await api.detailForTest(company, page, posting.externalPath, origin);
  const normalized = api.normalizeForTest(company, posting, detail.description, detail.location, detail.isUnitedStates, detail.postedAt);
  assert.equal(normalized.postedAt.toISOString(), '2026-10-14T00:00:00.000Z');
  startDate = undefined;
  assert.equal((await api.detailForTest(company, page, posting.externalPath, origin)).postedAt, undefined);
});
