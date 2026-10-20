import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { isJobTooOld, sourcePostedAt } from '../lib/jobRetention';
import { normalizeSourceFields } from '../lib/ats/normalizeSourceFields';
import * as monitor from '../lib/ats/sync-monitor';
import { enqueueSeedRewrite } from '../lib/seo/enqueue-seed-rewrite';

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

function seedHarness({ known = false, raced = false, dryRun = false, postedAt = SYNC_NOW as Date | null, postedAtEstimated = false, newOnly = true, verified = true, checkpoint = false, insertFails = false, enqueueSeoRewrite = false } = {}) {
  const writes: string[] = [];
  let locks = 0;
  let disconnected = false;
  const offer = { source: 'lever', url: 'https://jobs.lever.co/solar/123', title: 'Solar Installer', company: 'Solar', location: 'Austin, TX', description: 'Install solar panels.', postedAt, postedAtEstimated, applyUrl: 'https://example.com/apply' };
  const tx = {
    $executeRaw: async () => { writes.push('queue'); return 1; },
    $queryRaw: async () => { locks++; return []; },
    job: {
      findFirst: async () => raced ? { id: 'known' } : null,
      create: async ({ data }: any) => { if (insertFails) throw Error('insert failed'); writes.push('create'); return { id: 'new', ...data }; },
      update: async () => { writes.push('slug'); },
    },
  };
  class PrismaClient {
    job = { findMany: async () => known ? [offer] : [], ...tx.job };
    $transaction = async (fn: any) => fn(tx);
    $disconnect = async () => { disconnected = true; };
  }
  const registry = new Proxy({}, { get: (_, key) => String(key).endsWith('_COMPANIES') ? [{ slug: 'solar', tenant: 'solar', site: 'jobs', verified }] : {} });
  const api = load('scripts/seed-solar-jobs.ts', (id) => {
    if (id === '@prisma/client') return { PrismaClient };
    if (id.endsWith('company-seed')) return registry;
    if (id.endsWith('enqueue-seed-rewrite')) return { enqueueSeedRewrite };
    if (id.endsWith('source-recovery')) return { recoverAtsSource: async () => undefined };
    if (id.endsWith('source-migrations')) return { recoverConfiguredAtsSource: async () => undefined };
    if (id.endsWith('custom-scrape/config')) return { CUSTOM_SCRAPE_COMPANIES: [] };
    if (id.endsWith('jobRetention')) return { isJobTooOld, sourcePostedAt };
    if (id.endsWith('normalizeSourceFields')) return { normalizeSourceFields };
    if (id.endsWith('/geo')) return { isUSJob: () => true };
    if (id.endsWith('jobTaxonomy')) return { extractSolarJobTaxonomy: () => ({ skills: [] }) };
    if (id.endsWith('slugify')) return { buildJobSlug: () => 'solar-installer-austin' };
    if (id.endsWith('workSetting')) return { normalizeWorkSetting: () => null };
    if (id === 'node:url') return {};
    return new Proxy({}, { get: () => async (_company: any, context: any) => {
      if (checkpoint && context) context.checkpoint({ offset: 20 });
      return [offer, offer];
    } });
  }, { Date: SyncDate });
  return { run: () => api.runAtsSeed({ providerName: 'lever', companyIndex: 0, newOnly, dryRun, enqueueSeoRewrite,
    checkpoints: checkpoint ? { load: async () => null, save: async () => { writes.push('checkpoint'); } } : undefined }), writes, locks: () => locks, disconnected: () => disconnected };
}

test('only newly inserted cron jobs enqueue an SEO task inside their insertion transaction', async () => {
  const inserted = seedHarness({ enqueueSeoRewrite: true });
  await inserted.run();
  assert.deepEqual(inserted.writes, ['create', 'slug', 'queue']);
  for (const options of [{ known: true }, { raced: true }, { dryRun: true }]) {
    const skipped = seedHarness({ ...options, enqueueSeoRewrite: true });
    await skipped.run();
    assert.ok(!skipped.writes.includes('queue'));
  }
});

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

test('legacy verified flags do not exclude sources from ingestion', async () => {
  const h = seedHarness({ verified: false });
  const summary = await h.run();
  assert.equal(summary.companiesAttempted, 1);
  assert.equal(summary.created, 1);
});

test('source cursor commits after inserts and never advances on an insert failure or dry-run', async () => {
  const good = seedHarness({ checkpoint: true });
  await good.run();
  assert.deepEqual(good.writes, ['create', 'slug', 'checkpoint']);
  const failed = seedHarness({ checkpoint: true, insertFails: true });
  await assert.rejects(failed.run(), /insert failed/);
  assert.deepEqual(failed.writes, []);
  const preview = seedHarness({ checkpoint: true, dryRun: true });
  await preview.run(); assert.deepEqual(preview.writes, []);
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

test('seed returns auditable totals without confusing known or undated jobs with creations', async () => {
  const known = await seedHarness({ known: true }).run();
  assert.equal(known.phase, 'complete'); assert.equal(known.received, 2);
  assert.equal(known.created, 0); assert.equal(known.skippedExisting, 2);
  assert.equal(known.companiesAttempted, 1); assert.equal(known.companiesCompleted, 1);
  const missing = await seedHarness({ postedAt: null }).run();
  assert.equal(missing.created, 0); assert.equal(missing.skippedMissingPublication, 2);
  const fresh = await seedHarness().run();
  assert.equal(fresh.created, 1); assert.equal(fresh.skippedExisting, 1);
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

test('Cloudflare-authenticated hourly dispatcher launches only its slot and deduplicates it', async () => {
  const calls: any[] = [];
  const tasks = Array.from({ length: 12 }, (_, companyIndex) => ({ providerName: 'lever', companyIndex, label: 'solar-' + companyIndex }));
  const stored = new Map();
  let storageDown = false;
  const store = { setJSON: async (key: string, data: unknown, options?: { onlyIfNew?: boolean }) => { if (storageDown) throw Error('Storage unavailable'); if (options?.onlyIfNew && stored.has(key)) return { modified: false }; stored.set(key, data); return { modified: true }; } };
  class SlotDate extends Date { getUTCHours() { return 8; } }
  const api = load('netlify/functions/sync-ats.ts', (id) => id.endsWith('sync-monitor') ? monitor : id.endsWith('ats-sync-store') ? { atsSyncStore: () => store } : ({ getAtsSyncTasks: () => tasks }), {
    process: { env: { CRON_SECRET: 'test', URL: 'https://solarroles.netlify.app' } },
    Date: SlotDate, URL, AbortSignal, Response,
    fetch: async (url: URL, options: any) => { calls.push({ url, options }); return { status: 202 }; },
  });
  const request = () => new Request('https://solarroles.netlify.app/.netlify/functions/sync-ats', { method: 'POST', headers: { authorization: 'Bearer test', 'x-scheduled-time': String(Date.now()) } });
  assert.equal((await api.default(new Request('https://example.test', { method: 'POST' }))).status, 401);
  await api.default(request());
  assert.deepEqual(calls.map((c) => JSON.parse(c.options.body).companyIndex), [2, 8]);
  for (const call of calls) {
    assert.equal(call.url.pathname, '/.netlify/functions/sync-ats-background');
    assert.equal(call.options.headers.authorization, 'Bearer test');
    assert.ok(JSON.parse(call.options.body).runId);
  }
  assert.equal([...stored.keys()].filter(k => k.endsWith('/manifest')).length, 1);
  assert.equal([...stored.values()].find(v => v.outcomes)?.outcomes.length, 2);
  assert.equal((await (await api.default(request())).json()).decision, 'duplicate');
  assert.equal(calls.length, 2);
  storageDown = true; calls.length = 0;
  await assert.rejects(api.default(request()), /Storage unavailable/);
  assert.equal(calls.length, 0, 'never dispatch tasks without an expected-employer manifest');
});

test('background worker rejects unauthorized calls and forces insert-only ATS ingestion', async () => {
  const calls: any[] = [];
  const records = new Map();
  let seedFails = false, storageDown = false;
  const store = { setJSON: async (key: string, data: unknown) => { if (storageDown) throw Error('Storage unavailable'); records.set(key, JSON.parse(JSON.stringify(data))); } };
  const api = load('netlify/functions/sync-ats-background.ts', (id) => {
    if (id === 'node:crypto') return { randomUUID: () => 'attempt' };
    if (id.endsWith('sync-monitor')) return monitor;
    if (id.endsWith('ats-sync-store')) return { atsSyncStore: () => store };
    if (id.endsWith('sync-diagnostics')) return { captureAtsDiagnostics: (work: any) => work({ warnings: 0, errors: 0, samples: [] }) };
    return { getAtsSyncTasks: () => [{ providerName: 'lever', companyIndex: 3, label: 'solar' }], runAtsSeed: async (options: any) => {
      calls.push(options);
      if (seedFails) { options.onProgress({ received: 5, created: 1 }); throw Error('Database write failed'); }
      return { received: 1, created: 1 };
    } };
  }, {
    process: { env: { CRON_SECRET: 'test' } },
    setInterval, clearInterval,
  });
  const event = { httpMethod: 'POST', headers: { authorization: 'Bearer test' }, body: JSON.stringify({ providerName: 'lever', companyIndex: 3 }) };
  const invoke = (event: { httpMethod: string; headers: Record<string, string>; body: string }) => api.default(new Request('https://solarroles.com/.netlify/functions/sync-ats-background', {
    method: event.httpMethod, headers: event.headers, body: event.httpMethod === 'POST' ? event.body : undefined,
  }));
  assert.equal(api.config.background, true);
  assert.equal(api.handler, undefined, 'use the native Request entrypoint without the legacy Lambda bridge');
  await assert.rejects(invoke({ ...event, headers: {} }), /Unauthorized/);
  await assert.rejects(invoke({ ...event, httpMethod: 'GET' }), /requires POST/);
  await assert.rejects(invoke({ ...event, body: JSON.stringify({ providerName: 'custom-scrape', companyIndex: 0 }) }), /Invalid/);
  assert.equal(calls.length, 0);
  await invoke(event);
  assert.equal(calls[0].providerName, 'lever');
  assert.equal(calls[0].companyIndex, 3);
  assert.equal(calls[0].newOnly, true);
  const attempt = [...records.values()].find(v => v.attemptId);
  assert.equal(attempt.state, 'completed');
  assert.equal(attempt.progress.created, 1);
  seedFails = true;
  await assert.rejects(invoke(event), /Database write failed/);
  const failed = [...records.values()].find(v => v.state === 'failed');
  assert.equal(failed.error, 'Database write failed'); assert.equal(failed.progress.created, 1);
  storageDown = true; const before = calls.length;
  await assert.rejects(invoke(event), /Storage unavailable/);
  assert.equal(calls.length, before, 'never start ingestion when the audit store cannot record the worker');
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
