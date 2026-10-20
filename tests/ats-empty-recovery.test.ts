import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchWorkdayBatch } from '../lib/ats/workday';
import { fetchWorkableJobs, parseWorkableApiIndex } from '../lib/ats/workable';
import { fetchSmartRecruitersJobs } from '../lib/ats/smartrecruiters';
import { parseHostedLinks, parseHostedDetail } from '../lib/ats/hosted-board';
import { fetchRipplingJobs } from '../lib/ats/rippling';
import { parseSuccessFactorsRss } from '../lib/ats/successfactors';
import { recoverConfiguredAtsSource } from '../lib/ats/source-migrations';
import type { AtsFetchContext } from '../lib/ats/fetch-context';

const company = { slug: 'test-solar', name: 'Test Solar', verified: false };
const description = 'Install solar photovoltaic panels and PV racking on residential rooftops in Austin, Texas. OSHA 10 certification required.';
function context(cursor?: unknown) {
  const state: { cursor?: unknown } = {};
  const run: AtsFetchContext = { cursor, deadline: Date.now() + 480_000, isKnown: () => false, checkpoint: value => { state.cursor = structuredClone(value); } };
  return { run, state };
}
async function mocked(fetcher: typeof fetch, check: () => Promise<void>) {
  const previous = globalThis.fetch;
  globalThis.fetch = fetcher;
  try { await check(); } finally { globalThis.fetch = previous; }
}
const markdown = (title: string) => `# ${title}\n\n## Description\n\n${title === 'Solar Installer' ? description : 'Groom domestic dogs, trim coats and maintain grooming equipment in the veterinary salon.'}\n\n## Apply\n\n[Apply](https://apply.workable.com/test-solar/j/A1/apply)`;

test('Workday passes offset 40 when subsequent nonempty pages report total zero', async () => {
  const origin = 'https://test.wd5.myworkdayjobs.com';
  const offsets: number[] = [];
  const { run, state } = context();
  run.isKnown = (_source, url) => !url.endsWith('/job/40');
  const page = { url: () => origin, evaluate: async (_: unknown, request: any) => {
    if (request.url.endsWith('/jobs')) {
      const offset = request.body.offset; offsets.push(offset);
      return { ok: true, data: { total: offset === 0 ? 41 : 0, jobPostings: Array.from({ length: Math.max(0, Math.min(20, 41 - offset)) }, (_, i) => ({ title: 'Solar Installer', externalPath: `/job/${offset + i}` })) } };
    }
    return { ok: true, data: { jobPostingInfo: { jobDescription: description, location: 'Austin, TX', startDate: '2026-10-19' } } };
  } };
  const jobs = await fetchWorkdayBatch({ tenant: 'test', host: 'wd5', site: 'Careers', name: 'Test', verified: false }, page as any, origin, run);
  assert.deepEqual(offsets, [0, 20, 40, 41]); assert.equal(jobs.length, 1);
  assert.deepEqual(state.cursor, { version: 1, offset: 0, completed: [] });
});

test('Breezy accepts 12/14 hexadecimal IDs, deduplicates links and rejects foreign or malformed job URLs', () => {
  const links = ['0123456789ab', '0123456789abcd', '0123456789abc', '0123456789abcde', 'zzzzzzzzzzzzzz'].map(id => `<a href="/p/${id}-solar-installer">Solar Installer</a>`).join('');
  const html = links + '<a href="https://other.breezy.hr/p/0123456789abcd-solar-installer">Solar Installer</a>' + links;
  assert.equal(parseHostedLinks(html, 'breezy', company).length, 2);
  const url = 'https://test-solar.breezy.hr/p/0123456789abcd-solar-installer';
  const detail = `<script type="application/ld+json">${JSON.stringify({ '@type': 'JobPosting', title: 'Solar Installer', description, datePosted: '2026-10-19', jobLocation: { '@type': 'Place', address: { addressLocality: 'Austin', addressRegion: 'TX', addressCountry: 'US' } }, url })}</script>`;
  assert.equal(parseHostedDetail(detail, url, 'breezy', company)?.externalId, 'test-solar:0123456789abcd');
});

test('Workable instruction pages use API token pagination and retain real publication dates', async () => {
  const { run, state } = context(); const tokens: unknown[] = [];
  await mocked(async (input, options) => {
    const url = String(input);
    if (url.endsWith('/jobs.md')) return new Response('# Test — Open Positions\nThis company has 31 open positions. Use the search endpoint to filter results.\n## How to Search\n');
    if (url.includes('/api/v3/')) {
      const body = JSON.parse(String(options?.body)); tokens.push(body.token ?? null);
      return Response.json({ results: [{ shortcode: body.token ? 'B2' : 'A1', title: body.token ? 'Solar Installer' : 'Dog Groomer', published: '2026-10-19T00:00:00Z', location: { city: 'Austin', region: 'Texas', country: 'United States' } }], nextPage: body.token ? null : 'opaque-next' });
    }
    return new Response(markdown(url.includes('B2') ? 'Solar Installer' : 'Dog Groomer'));
  }, async () => {
    const jobs = await fetchWorkableJobs(company, run);
    assert.equal(jobs.length, 1); assert.equal(jobs[0].postedAt?.toISOString(), '2026-10-19T00:00:00.000Z');
    assert.deepEqual(tokens, [null, 'opaque-next']);
    assert.deepEqual(state.cursor, { kind: 'api', token: null, completed: [] });
  });
});

test('Workable persists the failed token and skips already processed details when resuming', async () => {
  const { run, state } = context({ kind: 'api', token: 'page-two', completed: ['A1'] });
  const calls: string[] = [];
  await mocked(async (input, options) => {
    const url = String(input); calls.push(url);
    if (url.endsWith('/jobs.md')) return new Response('# Open Positions\n447 open positions. Use the search endpoint.\n## How to Search\n');
    if (url.includes('/api/v3/')) { assert.equal(JSON.parse(String(options?.body)).token, 'page-two'); return Response.json({ results: [{ shortcode: 'A1', title: 'Solar Installer' }, { shortcode: 'B2', title: 'Solar Installer' }], nextPage: null }); }
    return new Response('', { status: 503 });
  }, async () => {
    assert.equal((await fetchWorkableJobs(company, run)).length, 0);
    assert.ok(!calls.some(url => url.includes('/view/A1')));
    assert.deepEqual(state.cursor, { kind: 'api', token: 'page-two', completed: ['A1'] });
  });
});

test('Workable never treats malformed API data as an empty completed catalogue', () => {
  for (const payload of [{}, { results: null }, { results: [{ title: 'Missing ID' }] }, { results: [], nextPage: {} }]) assert.throws(() => parseWorkableApiIndex(payload, 'test-solar'));
  assert.deepEqual(parseWorkableApiIndex({ results: [], nextPage: null }, 'test-solar').jobs, []);
});

test('SmartRecruiters reads beyond the first 100 postings and fetches a later solar detail', async () => {
  const { run, state } = context(); const offsets: number[] = [];
  await mocked(async input => {
    const url = new URL(String(input));
    if (url.searchParams.has('limit')) {
      const offset = Number(url.searchParams.get('offset')); offsets.push(offset);
      return Response.json({ totalFound: 101, content: offset === 0 ? Array.from({ length: 100 }, (_, i) => ({ id: String(i), name: 'Dog Groomer' })) : [{ id: '100', name: 'Solar Installer', releasedDate: '2026-10-19', location: { city: 'Austin', region: 'TX', country: 'US' } }] });
    }
    return Response.json({ jobAd: { sections: { jobDescription: { text: description } } } });
  }, async () => {
    assert.equal((await fetchSmartRecruitersJobs(company, run)).length, 1);
    assert.deepEqual(offsets, [0, 100]); assert.deepEqual(state.cursor, { offset: 0, completed: [] });
  });
});

test('SmartRecruiters bounds page work and resumes a failed later page without restarting the catalogue', async () => {
  const { run, state } = context({ offset: 100, completed: ['already'] });
  await mocked(async input => {
    const url = new URL(String(input));
    if (url.searchParams.has('limit')) { assert.equal(url.searchParams.get('offset'), '100'); return Response.json({ totalFound: 102, content: [{ id: 'already', name: 'Solar Installer' }, { id: 'next', name: 'Solar Installer' }] }); }
    assert.ok(url.pathname.endsWith('/next')); return new Response('', { status: 503 });
  }, async () => {
    assert.equal((await fetchSmartRecruitersJobs(company, run)).length, 0);
    assert.deepEqual(state.cursor, { offset: 100, completed: ['already'] });
  });
  run.deadline = Date.now() + 20_000;
  await mocked(async () => { throw Error('Deadline must prevent network work'); }, async () => assert.equal((await fetchSmartRecruitersJobs(company, run)).length, 0));
});

test('SmartRecruiters detects servers repeating the same page rather than looping forever', async () => {
  let requests = 0;
  await mocked(async () => { requests++; return Response.json({ totalFound: 1000, content: [{ id: '1', name: 'Dog Groomer' }] }); }, async () => {
    assert.equal((await fetchSmartRecruitersJobs(company)).length, 0); assert.equal(requests, 2);
  });
});

test('a withdrawn SmartRecruiters detail cannot pin all subsequent jobs', async () => {
  const { run, state } = context();
  await mocked(async input => {
    const url = new URL(String(input));
    if (url.searchParams.has('limit')) return Response.json({ totalFound: 2, content: [{ id: 'closed', name: 'Solar Installer' }, { id: 'open', name: 'Solar Installer' }] });
    if (url.pathname.endsWith('/closed')) return new Response('', { status: 404 });
    return Response.json({ jobAd: { sections: { jobDescription: { text: description } } } });
  }, async () => {
    assert.equal((await fetchSmartRecruitersJobs(company, run)).length, 1);
    assert.deepEqual(state.cursor, { offset: 0, completed: [] });
  });
});

test('a withdrawn Workable detail cannot pin the API continuation', async () => {
  const { run, state } = context();
  await mocked(async input => {
    const url = String(input);
    if (url.endsWith('/jobs.md')) return new Response('# Open Positions\n447 open positions. Use the search endpoint.\n## How to Search\n');
    if (url.includes('/api/v3/')) return Response.json({ results: [{ shortcode: 'A1', title: 'Solar Installer' }, { shortcode: 'B2', title: 'Solar Installer' }] });
    return url.includes('/view/A1') ? new Response('', { status: 410 }) : new Response(markdown('Solar Installer'));
  }, async () => {
    assert.equal((await fetchWorkableJobs(company, run)).length, 1);
    assert.deepEqual(state.cursor, { kind: 'api', token: null, completed: [] });
  });
});

test('Rippling evaluates the description for generic taxonomy while retaining restricted title scopes', async () => {
  const payload = (value: unknown) => new Response(`<script id="__NEXT_DATA__">${JSON.stringify(value)}</script>`);
  let detailRequests = 0, solarDetail = true;
  await mocked(async input => {
    if (String(input).endsWith('/jobs')) return payload({ items: [{ id: '1', name: 'Electrical Engineer I', url: 'https://ats.rippling.com/test-solar/jobs/1' }] });
    detailRequests++;
    return payload({ props: { pageProps: { apiData: { jobPost: { uuid: '1', name: 'Electrical Engineer I', description: { company: solarDetail ? 'Design solar systems and oversee solar construction projects in Austin, Texas.' : 'Design electrical systems for textile factories and industrial food processing facilities.' }, createdOn: '2026-10-19', workLocations: ['Austin, TX'] } } } } });
  }, async () => {
    assert.equal((await fetchRipplingJobs({ ...company, roleFilter: 'solar_taxonomy' })).length, 1);
    assert.equal((await fetchRipplingJobs({ ...company, roleFilter: 'solar_installer' })).length, 0);
    solarDetail = false;
    assert.equal((await fetchRipplingJobs({ ...company, roleFilter: 'solar_taxonomy' })).length, 0);
    assert.equal(detailRequests, 2);
  });
});

test('HTTP 200 HTML cannot masquerade as a valid empty RSS feed', () => {
  const seed = { baseUrl: 'https://example.test', name: 'Test', verified: false, locale: 'en_US', keywords: ['solar'] };
  assert.throws(() => parseSuccessFactorsRss('<html><body>Careers site</body></html>', seed), /RSS/);
  assert.deepEqual(parseSuccessFactorsRss('<rss><channel><title>No vacancies</title></channel></rss>', seed), []);
  const xml = `<rss><channel><item><title>Solar Installer (Austin, TX)</title><link>https://example.test/job/123/</link><description><![CDATA[<html><body>${description}</body></html>]]></description></item></channel></rss>`;
  assert.equal(parseSuccessFactorsRss(xml, seed).length, 1);
});

test('the documented board move keeps the source task and preserves unmatched sources', async () => {
  let calls = 0;
  await mocked(async input => { calls++; assert.ok(String(input).includes('/plantedsolar')); return Response.json({ jobs: [] }); }, async () => {
    assert.deepEqual(await recoverConfiguredAtsSource('breezy', { slug: 'planted-solar-inc', name: 'Planted Solar' }), []);
    assert.equal(await recoverConfiguredAtsSource('breezy', company), undefined); assert.equal(calls, 1);
  });
});
