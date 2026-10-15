import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { captureAtsDiagnostics } from '../lib/ats/sync-diagnostics';
import { createManifest, readSyncStatus, runPrefix, saveManifest, saveDispatch, saveAttempt, summarizeRun, safeDiagnostic, taskKey,
  type MonitorStore, type SyncAttempt, type SyncManifest } from '../lib/ats/sync-monitor';
import type { AtsSeedSummary } from '../lib/ats/sync-summary';

const now = new Date('2026-10-15T20:40:00Z');
const start = new Date('2026-10-15T20:17:00Z');
const task = { providerName: 'lever', companyIndex: 0, label: 'solar' };
const summary: AtsSeedSummary = { newOnly: true, providerName: 'lever', phase: 'complete', companiesAttempted: 1, companiesCompleted: 1,
  received: 5, matched: 1, created: 1, updated: 0, skippedExisting: 2, skippedNonUS: 0, skippedOld: 0,
  skippedPublicationWindow: 2, skippedMissingPublication: 1, skippedOutsidePublicationWindow: 1, failedCompanies: 0 };
function attempt(extra: Partial<SyncAttempt> = {}): SyncAttempt {
  return { attemptId: 'attempt-1', taskKey: taskKey(task), startedAt: start.toISOString(), heartbeatAt: start.toISOString(),
    finishedAt: new Date(start.getTime() + 60000).toISOString(), state: 'completed', diagnostics: { warnings: 0, errors: 0, samples: [] }, progress: summary, ...extra };
}
class MemoryStore implements MonitorStore {
  data = new Map<string, any>();
  writes: string[] = [];
  async get(key: string) { return structuredClone(this.data.get(key) ?? null); }
  async setJSON(key: string, data: unknown, options?: { onlyIfNew: boolean }) {
    if (options?.onlyIfNew && this.data.has(key)) return;
    this.writes.push(key); this.data.set(key, structuredClone(data));
  }
  async list({ prefix }: { prefix: string }) { return { blobs: [...this.data.keys()].filter(key => key.startsWith(prefix)).map(key => ({ key })) }; }
}
async function fixture(trigger: SyncManifest['trigger'] = 'scheduled') {
  const store = new MemoryStore(); const manifest = createManifest([task], trigger, start);
  await saveManifest(store, manifest);
  await saveDispatch(store, manifest, { finishedAt: start.toISOString(), outcomes: [{ taskKey: taskKey(task), accepted: true }] });
  return { store, manifest };
}

test('accepted dispatches never count as completed and absent starts become visible', async () => {
  const { manifest, store } = await fixture();
  const sent = await store.get(runPrefix(manifest.runId) + 'dispatch');
  assert.equal(summarizeRun(manifest, sent, [], start.getTime() + 1000).tasks[0].state, 'accepted');
  assert.equal(summarizeRun(manifest, sent, [], now.getTime()).tasks[0].state, 'not_started');
  assert.equal(summarizeRun(manifest, null, [], now.getTime()).tasks[0].state, 'not_started');
  assert.equal(summarizeRun(manifest, { ...sent, outcomes: [{ taskKey: taskKey(task), accepted: false, error: 'HTTP 503' }] }, [], now.getTime()).tasks[0].state, 'dispatch_error');
});

test('heartbeats distinguish running tasks from vanished workers and the execution deadline', async () => {
  const { manifest } = await fixture();
  const active = attempt({ state: 'running', finishedAt: undefined, startedAt: new Date(now.getTime() - 60000).toISOString(), heartbeatAt: now.toISOString() });
  assert.equal(summarizeRun(manifest, null, [active], now.getTime()).tasks[0].state, 'running');
  assert.equal(summarizeRun(manifest, null, [{ ...active, heartbeatAt: new Date(now.getTime() - 181000).toISOString() }], now.getTime()).tasks[0].state, 'stalled');
  assert.equal(summarizeRun(manifest, null, [{ ...active, startedAt: start.toISOString() }], now.getTime()).tasks[0].state, 'stalled');
});

test('completed, empty, warnings and swallowed connector errors remain distinct', async () => {
  const { manifest } = await fixture();
  const state = (a: SyncAttempt) => summarizeRun(manifest, null, [a], now.getTime()).tasks[0].state;
  assert.equal(state(attempt()), 'completed');
  assert.equal(state(attempt({ progress: { ...summary, received: 0 } })), 'empty');
  assert.equal(state(attempt({ diagnostics: { warnings: 1, errors: 0, samples: [] } })), 'completed_with_warnings');
  assert.equal(state(attempt({ diagnostics: { warnings: 0, errors: 1, samples: [] } })), 'completed_with_errors');
  assert.equal(state(attempt({ state: 'failed', error: 'Database unreachable' })), 'failed');
});

test('a fast worker cannot be overwritten by a later dispatch receipt; retries keep separate histories', async () => {
  const { store, manifest } = await fixture();
  await saveAttempt(store, manifest.runId, attempt({ state: 'failed', progress: { ...summary, created: 1 } }));
  await saveAttempt(store, manifest.runId, attempt({ attemptId: 'attempt-2', startedAt: new Date(start.getTime() + 120000).toISOString(), progress: { ...summary, created: 2 } }));
  await saveDispatch(store, manifest, { finishedAt: now.toISOString(), outcomes: [{ taskKey: taskKey(task), accepted: true }] });
  const report = await readSyncStatus(store, 8, now.getTime());
  assert.equal(report.runs[0].tasks[0].attempts.length, 2);
  assert.equal(report.runs[0].tasks[0].state, 'completed');
  assert.equal(report.counters.created, 3);
});

test('history survives store handles and reveals missing hourly invocations, including total cron silence', async () => {
  const { store, manifest } = await fixture(); await saveAttempt(store, manifest.runId, attempt());
  assert.equal((await readSyncStatus(store, 8, now.getTime())).health, 'ok');
  const later = new Date('2026-10-15T22:40:00Z').getTime();
  const report = await readSyncStatus(store, 8, later);
  assert.equal(report.health, 'error');
  assert.deepEqual(report.missingScheduledHours, ['2026-10-15T21:17:00.000Z', '2026-10-15T22:17:00.000Z']);
  const noRecentRuns = await readSyncStatus(store, 1, later);
  assert.equal(noRecentRuns.health, 'error'); assert.equal(noRecentRuns.runs.length, 0);
  const newer = createManifest([task], 'scheduled', new Date('2026-10-15T22:17:00Z'));
  await saveManifest(store, newer);
  assert.equal((await store.get('monitoring-started')).at, start.toISOString());
});

test('new installations and manual-only runs cannot claim that the scheduled cron is healthy', async () => {
  assert.equal((await readSyncStatus(new MemoryStore(), 8, now.getTime())).health, 'unknown');
  const { store, manifest } = await fixture('manual'); await saveAttempt(store, manifest.runId, attempt());
  assert.equal((await readSyncStatus(store, 8, now.getTime())).health, 'unknown');
});

test('status spans UTC midnight and does not flag invocations before monitoring activation', async () => {
  const store = new MemoryStore();
  for (const date of ['2026-10-15T23:17:00Z', '2026-10-16T00:17:00Z']) {
    const manifest = createManifest([task], 'scheduled', new Date(date));
    await saveManifest(store, manifest); await saveAttempt(store, manifest.runId, attempt());
  }
  const report = await readSyncStatus(store, 8, new Date('2026-10-16T00:40:00Z').getTime());
  assert.equal(report.runs.length, 2); assert.deepEqual(report.missingScheduledHours, []); assert.equal(report.health, 'ok');
});

test('diagnostics capture concurrent async contexts separately and redact credentials in persisted samples', async () => {
  const reports = await Promise.all([0, 1].map(i => captureAtsDiagnostics(async diagnostics => {
    await new Promise(resolve => setTimeout(resolve, 1));
    console.warn(`provider-${i} HTTP 403 https://example.com/?token=private`);
    if (i) console.error('db postgres://user:password@host/database');
    return diagnostics;
  })));
  assert.equal(reports[0].warnings, 1); assert.equal(reports[0].errors, 0);
  assert.equal(reports[1].warnings, 1); assert.equal(reports[1].errors, 1);
  assert.match(reports[0].samples[0].message, /provider-0/);
  assert.doesNotMatch(JSON.stringify(reports), /private|password/);
  assert.equal(safeDiagnostic('Bearer secret'), 'Bearer [redacted]');
});

function loadStatus(store: MonitorStore) {
  const source = fs.readFileSync('netlify/functions/ats-sync-status.ts', 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports: any = {};
  vm.runInNewContext('(function(require,exports){' + compiled + '\n})', { process: { env: { CRON_SECRET: 'private-secret' } }, Buffer, URL, Response })((id: string) => {
    if (id === 'node:crypto') return { timingSafeEqual: (a: Buffer, b: Buffer) => a.equals(b) };
    if (id.endsWith('ats-sync-store')) return { atsSyncStore: () => store };
    return { readSyncStatus };
  }, exports);
  return exports.default;
}
test('status endpoint authenticates before accessing storage and never returns health ok during a storage outage', async () => {
  const broken = { get: async () => { throw Error('Unavailable'); }, list: async () => { throw Error('Unavailable'); }, setJSON: async () => {} };
  const handler = loadStatus(broken);
  const url = 'https://solarroles.com/.netlify/functions/ats-sync-status';
  assert.equal((await handler(new Request(url))).status, 401);
  assert.equal((await handler(new Request(url, { headers: { authorization: 'Bearer wrong-secret' } }))).status, 401);
  const headers = { authorization: 'Bearer private-secret' };
  assert.equal((await handler(new Request(url + '?hours=25', { headers }))).status, 400);
  assert.equal((await handler(new Request(url, { method: 'POST', headers }))).status, 405);
  const response = await handler(new Request(url, { headers }));
  assert.equal(response.status, 503); assert.equal((await response.json()).health, 'unknown');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
