import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { isJobTooOld, sourcePostedAt } from '../lib/jobRetention';

function load(file: string, require: (id: string) => any, globals = {}) {
  // Exercise the exported serverless entry point without invoking the CLI.
  const source = fs.readFileSync(file, 'utf8').split('if (process.argv[1] && import.meta.url')[0];
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: any = {};
  vm.runInNewContext('(function(require,exports){' + compiled + '\n})', { console: { log() {}, error() {} }, ...globals })(require, exports);
  return exports;
}

const SYNC_NOW = new Date('2026-10-15T12:00:00Z');
class SyncDate extends Date { constructor(value: number = SYNC_NOW.getTime()) { super(value); } }

function seedHarness({ known = false, raced = false, dryRun = false, postedAt = SYNC_NOW as Date | null, postedAtEstimated = false, newOnly = true } = {}) {
  const writes: string[] = [];
  let locks = 0;
  let disconnected = false;
  const offer = { source: 'lever', url: 'https://jobs.lever.co/solar/123', title: 'Solar Installer', company: 'Solar', location: 'Austin, TX', description: 'Install solar panels.', postedAt, postedAtEstimated, applyUrl: 'https://example.com/apply' };
  const tx = {
    $queryRaw: async () => { locks++; return []; },
    job: {
      findFirst: async () => raced ? { id: 'known' } : null,
      create: async ({ data }: any) => { writes.push('create'); return { id: 'new', ...data }; },
      update: async () => { writes.push('slug'); },
    },
  };
  class PrismaClient {
    job = { findMany: async () => known ? [offer] : [], ...tx.job };
    $transaction = async (fn: any) => fn(tx);
    $disconnect = async () => { disconnected = true; };
  }
  const registry = new Proxy({}, { get: (_, key) => String(key).endsWith('_COMPANIES') ? [{ slug: 'solar', tenant: 'solar', site: 'jobs' }] : {} });
  const api = load('scripts/seed-solar-jobs.ts', (id) => {
    if (id === '@prisma/client') return { PrismaClient };
    if (id.endsWith('company-seed')) return registry;
    if (id.endsWith('custom-scrape/config')) return { CUSTOM_SCRAPE_COMPANIES: [] };
    if (id.endsWith('jobRetention')) return { isJobTooOld, sourcePostedAt };
    if (id.endsWith('/geo')) return { isUSJob: () => true };
    if (id.endsWith('jobTaxonomy')) return { extractSolarJobTaxonomy: () => ({ skills: [] }) };
    if (id.endsWith('slugify')) return { buildJobSlug: () => 'solar-installer-austin' };
    if (id.endsWith('workSetting')) return { normalizeWorkSetting: () => null };
    if (id === 'node:url') return {};
    return new Proxy({}, { get: () => async () => [offer, offer] });
  }, { Date: SyncDate });
  return { run: () => api.runAtsSeed({ providerName: 'lever', companyIndex: 0, newOnly, dryRun }), writes, locks: () => locks, disconnected: () => disconnected };
}

test('incremental discovery accepts only real publication dates under fourteen days old', async () => {
  for (const [postedAt, accepted] of [
    [SYNC_NOW, true],
    [new Date('2026-10-08T12:00:00Z'), true],
    [new Date('2026-10-01T12:00:00.001Z'), true],
    [new Date('2026-10-01T12:00:00Z'), false],
    [new Date('2026-09-25T12:00:00Z'), false],
    [new Date('2026-10-15T12:00:00.001Z'), false],
    [new Date('invalid'), false],
    [null, false],
  ] as const) {
    const h = seedHarness({ postedAt });
    await h.run();
    assert.deepEqual(h.writes, accepted ? ['create', 'slug'] : [], String(postedAt));
  }
  const estimated = seedHarness({ postedAtEstimated: true });
  await estimated.run();
  assert.deepEqual(estimated.writes, []);
});

test('manual seed still accepts a publication older than fourteen days', async () => {
  const h = seedHarness({ postedAt: new Date(Date.now() - 20 * 86400000), newOnly: false });
  await h.run();
  assert.ok(h.writes.includes('create'));
});

test('incremental sync leaves known offers untouched, including expiry and publication date', async () => {
  const h = seedHarness({ known: true });
  await h.run();
  assert.deepEqual(h.writes, []);
  assert.equal(h.locks(), 0);
  assert.equal(h.disconnected(), true);
});

test('a new offer is created once with a canonical slug despite duplicate feed entries', async () => {
  const h = seedHarness();
  await h.run();
  assert.deepEqual(h.writes, ['create', 'slug']);
  assert.equal(h.locks(), 1);
});

test('a concurrent insertion detected under the database lock is skipped', async () => {
  const h = seedHarness({ raced: true });
  await h.run();
  assert.deepEqual(h.writes, []);
  assert.equal(h.locks(), 1);
});

test('incremental dry-run does not acquire write locks or insert offers', async () => {
  const h = seedHarness({ dryRun: true });
  await h.run();
  assert.deepEqual(h.writes, []);
  assert.equal(h.locks(), 0);
});

test('sitemap includes fourteen days and puts jobs newest first before static pages', async () => {
  let where: any;
  let orderBy: any;
  const jobs = [{ id: 'recent', updatedAt: SYNC_NOW }, { id: 'older', updatedAt: SYNC_NOW }];
  const api = load('app/sitemap.ts', (id) => {
    if (id.endsWith('/prisma')) return { prisma: { job: { findMany: async (query: any) => { where = query.where; orderBy = query.orderBy; return jobs; } } } };
    if (id.endsWith('certifications-data')) return { CERTIFICATIONS: [] };
    if (id.endsWith('site-url')) return { SITE_URL: 'https://solarroles.com' };
    if (id.endsWith('job-indexing')) return { NON_INDEXABLE_JOB_SOURCES: ['adzuna'] };
    return { getCanonicalJobUrl: (job: any) => `https://solarroles.com/jobs/${job.id}` };
  });
  const entries = await api.default();
  assert.equal(where.active, true);
  assert.equal(where.postedAt.lte.getTime() - where.postedAt.gt.getTime(), 14 * 86400000);
  assert.equal(where.expiresAt.gt.getTime(), where.postedAt.lte.getTime());
  assert.equal(JSON.stringify(orderBy), JSON.stringify([{ postedAt: 'desc' }, { id: 'asc' }]));
  assert.equal(JSON.stringify(where.source.notIn), JSON.stringify(['adzuna']));
  assert.equal(entries[0].url, 'https://solarroles.com/jobs/recent');
  assert.equal(entries[1].url, 'https://solarroles.com/jobs/older');
  assert.equal(entries[2].url, 'https://solarroles.com');
  assert.equal(where.OR, undefined);
});

test('hourly Netlify dispatcher launches only its slot and authenticates background requests', async () => {
  const calls: any[] = [];
  const tasks = Array.from({ length: 12 }, (_, companyIndex) => ({ providerName: 'lever', companyIndex }));
  class SlotDate extends Date { getUTCHours() { return 8; } }
  const api = load('netlify/functions/sync-ats.ts', () => ({ getAtsSyncTasks: () => tasks }), {
    process: { env: { CRON_SECRET: 'test', URL: 'https://solarroles.netlify.app' } },
    Date: SlotDate, URL, AbortSignal,
    fetch: async (url: URL, options: any) => { calls.push({ url, options }); return { status: 202 }; },
  });
  await api.default();
  assert.deepEqual(calls.map((c) => JSON.parse(c.options.body).companyIndex), [2, 8]);
  for (const call of calls) {
    assert.equal(call.url.pathname, '/.netlify/functions/sync-ats-background');
    assert.equal(call.options.headers.authorization, 'Bearer test');
  }
});

test('background worker rejects unauthorized calls and forces insert-only ATS ingestion', async () => {
  const calls: any[] = [];
  const api = load('netlify/functions/sync-ats-background.ts', () => ({ runAtsSeed: async (options: any) => { calls.push(options); } }), {
    process: { env: { CRON_SECRET: 'test' } },
  });
  const event = { httpMethod: 'POST', headers: { authorization: 'Bearer test' }, body: JSON.stringify({ providerName: 'lever', companyIndex: 3 }) };
  await assert.rejects(api.handler({ ...event, headers: {} }), /Unauthorized/);
  await assert.rejects(api.handler({ ...event, body: JSON.stringify({ providerName: 'custom-scrape', companyIndex: 0 }) }), /Invalid/);
  assert.equal(calls.length, 0);
  await api.handler(event);
  assert.equal(calls[0].providerName, 'lever');
  assert.equal(calls[0].companyIndex, 3);
  assert.equal(calls[0].newOnly, true);
});

test('browser launch keeps local options and supplies a packaged executable on Netlify', async () => {
  for (const netlify of [false, true]) {
    const calls: any[] = [];
    const api = load('lib/ats/browser.ts', (id) => {
      if (id === 'playwright') return { chromium: { launch: async (options: any) => { calls.push(options); } } };
      return { __esModule: true, default: { args: ['--no-sandbox'], executablePath: async () => '/tmp/chromium' } };
    }, { process: { env: { ATS_SERVERLESS_BROWSER: String(netlify) } } });
    await api.launchAtsBrowser({ headless: true, args: ['--custom'] });
    assert.equal(calls[0].executablePath, netlify ? '/tmp/chromium' : undefined);
    assert.equal(calls[0].args.join(','), netlify ? '--no-sandbox,--custom' : '--custom');
  }
});
