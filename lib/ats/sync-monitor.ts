import { randomUUID } from 'node:crypto';
import type { AtsSeedSummary } from './sync-summary';

export const ATS_MONITOR_STORE = 'ats-sync-monitor';
export type SyncTask = { providerName: string; companyIndex: number; label: string };
export type SyncManifest = { version: 1; runId: string; trigger: 'scheduled' | 'manual'; startedAt: string;
  scheduledFor: string; slot: number; deployId?: string; tasks: SyncTask[] };
export type DispatchOutcome = { taskKey: string; accepted: boolean; error?: string };
export type DispatchReport = { finishedAt: string; outcomes: DispatchOutcome[] };
export type Diagnostics = { warnings: number; errors: number; samples: { level: string; message: string }[] };
export type SyncAttempt = { attemptId: string; taskKey: string; startedAt: string; heartbeatAt: string;
  finishedAt?: string; state: 'running' | 'completed' | 'failed'; progress?: AtsSeedSummary;
  diagnostics: Diagnostics; error?: string };
export interface MonitorStore {
  get(key: string, options: { type: 'json' }): Promise<any>;
  setJSON(key: string, data: unknown, options?: { onlyIfNew: boolean }): Promise<unknown>;
  list(options: { prefix: string }): Promise<{ blobs: { key: string }[] }>;
}

export const taskKey = (task: Pick<SyncTask, 'providerName' | 'companyIndex'>) => `${task.providerName}-${task.companyIndex}`;
export function runPrefix(runId: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_[a-f0-9-]{36}$/.test(runId)) throw new Error('Invalid ATS run id');
  return `runs/${runId.slice(0, 10)}/${runId}/`;
}
export function createManifest(tasks: SyncTask[], trigger: SyncManifest['trigger'] = 'scheduled', now = new Date()): SyncManifest {
  const scheduled = new Date(now); scheduled.setUTCMinutes(17, 0, 0);
  return { version: 1, runId: now.toISOString().replace(/[:.]/g, '-') + '_' + randomUUID(), trigger,
    startedAt: now.toISOString(), scheduledFor: scheduled.toISOString(), slot: now.getUTCHours() % 6,
    deployId: process.env.DEPLOY_ID, tasks };
}
export async function saveManifest(store: MonitorStore, manifest: SyncManifest) {
  await store.setJSON(runPrefix(manifest.runId) + 'manifest', manifest);
  if (manifest.trigger === 'scheduled') await store.setJSON('monitoring-started', { at: manifest.startedAt, scheduledFor: manifest.scheduledFor }, { onlyIfNew: true });
}
export async function saveDispatch(store: MonitorStore, manifest: SyncManifest, report: DispatchReport) {
  await store.setJSON(runPrefix(manifest.runId) + 'dispatch', report);
}
export async function saveAttempt(store: MonitorStore, runId: string, attempt: SyncAttempt) {
  await store.setJSON(runPrefix(runId) + `attempts/${attempt.taskKey}/${attempt.attemptId}`, attempt);
}

export function safeDiagnostic(value: unknown): string {
  let text = value instanceof Error ? value.message : String(value);
  for (const key of ['CRON_SECRET', 'DATABASE_URL', 'DIRECT_URL', 'NETLIFY_AUTH_TOKEN']) {
    const secret = process.env[key]; if (secret) text = text.split(secret).join('[redacted]');
  }
  return text.replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, '[database URL redacted]')
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [redacted]')
    .replace(/([?&](?:token|key|secret|api_key|access_token)=)[^&\s"']+/gi, '$1[redacted]')
    .slice(0, 1500);
}

export async function mapLimited<T, R>(items: T[], concurrency: number, work: (item: T) => Promise<R>): Promise<R[]> {
  let index = 0; const result: R[] = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) { const i = index++; result[i] = await work(items[i]); }
  }));
  return result;
}

export function summarizeRun(manifest: SyncManifest, dispatch: DispatchReport | null, attempts: SyncAttempt[], now = Date.now()) {
  const age = now - Date.parse(manifest.startedAt);
  const tasks = manifest.tasks.map(task => {
    const key = taskKey(task);
    const executions = attempts.filter(a => a.taskKey === key).sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
    const latest = executions.at(-1);
    const sent = dispatch?.outcomes.find(o => o.taskKey === key);
    let state: string;
    if (!latest) state = sent && !sent.accepted ? 'dispatch_error' : age > 10 * 60000 ? 'not_started' : sent?.accepted ? 'accepted' : 'dispatch_unknown';
    else if (latest.state === 'failed') state = 'failed';
    else if (latest.state === 'running') state = now - Date.parse(latest.heartbeatAt) > 3 * 60000 || now - Date.parse(latest.startedAt) > 17 * 60000 ? 'stalled' : 'running';
    else if (latest.diagnostics.errors) state = 'completed_with_errors';
    else if (latest.diagnostics.warnings) state = 'completed_with_warnings';
    else if (!latest.progress || latest.progress.received === 0) state = 'empty';
    else state = 'completed';
    return { ...task, taskKey: key, state, dispatch: sent, attempts: executions };
  });
  const counts: Record<string, number> = {};
  for (const task of tasks) counts[task.state] = (counts[task.state] || 0) + 1;
  const counters: Record<string, number> = {};
  for (const attempt of attempts) {
    if (!attempt.progress) continue;
    for (const [key, value] of Object.entries(attempt.progress)) if (typeof value === 'number') counters[key] = (counters[key] || 0) + value;
  }
  return { ...manifest, dispatchFinishedAt: dispatch?.finishedAt, counts, counters, tasks };
}

export async function readSyncStatus(store: MonitorStore, hours = 8, now = Date.now()) {
  const from = now - hours * 3600000;
  const keys: string[] = [];
  const day = new Date(from); day.setUTCHours(0, 0, 0, 0);
  while (day.getTime() <= now) {
    const result = await store.list({ prefix: `runs/${day.toISOString().slice(0, 10)}/` });
    keys.push(...result.blobs.map(b => b.key)); day.setUTCDate(day.getUTCDate() + 1);
  }
  const manifests = (await mapLimited(keys.filter(k => k.endsWith('/manifest')), 12, key => store.get(key, { type: 'json' })))
    .filter((m): m is SyncManifest => Boolean(m && Date.parse(m.startedAt) >= from && Date.parse(m.startedAt) <= now));
  const runs = await mapLimited(manifests, 3, async manifest => {
    const prefix = runPrefix(manifest.runId);
    const records = await mapLimited(keys.filter(k => k.startsWith(prefix) && !k.endsWith('/manifest')), 12, async key => ({ key, value: await store.get(key, { type: 'json' }) }));
    const dispatch = records.find(r => r.key === prefix + 'dispatch')?.value ?? null;
    const attempts = records.filter(r => r.key.startsWith(prefix + 'attempts/') && r.value).map(r => r.value as SyncAttempt);
    return summarizeRun(manifest, dispatch, attempts, now);
  });
  runs.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  const activation = await store.get('monitoring-started', { type: 'json' });
  const due = new Date(now - 10 * 60000); due.setUTCMinutes(17, 0, 0);
  if (due.getTime() > now - 10 * 60000) due.setUTCHours(due.getUTCHours() - 1);
  const missingScheduledHours: string[] = [];
  const firstTracked = Date.parse(activation?.scheduledFor);
  for (let t = Math.max(from, firstTracked); Number.isFinite(t) && t <= due.getTime(); t += 3600000) {
    // Align to the schedule after clipping a partial reporting window.
    const expected = new Date(t); expected.setUTCMinutes(17, 0, 0);
    if (expected.getTime() < t) expected.setUTCHours(expected.getUTCHours() + 1);
    if (expected.getTime() > due.getTime()) break;
    if (!runs.some(r => r.trigger === 'scheduled' && r.scheduledFor === expected.toISOString())) missingScheduledHours.push(expected.toISOString());
  }
  const counts: Record<string, number> = {}, counters: Record<string, number> = {};
  for (const run of runs) {
    for (const [key, value] of Object.entries(run.counts)) counts[key] = (counts[key] || 0) + value;
    for (const [key, value] of Object.entries(run.counters)) counters[key] = (counters[key] || 0) + value;
  }
  const hasError = missingScheduledHours.length > 0 || ['dispatch_error', 'not_started', 'failed', 'stalled', 'completed_with_errors'].some(k => counts[k]);
  const attention = ['completed_with_warnings', 'empty'].some(k => counts[k]);
  const pending = ['accepted', 'running', 'dispatch_unknown'].some(k => counts[k]);
  return { at: new Date(now).toISOString(), from: new Date(from).toISOString(), hours,
    health: !activation ? 'unknown' : hasError ? 'error' : !runs.some(r => r.trigger === 'scheduled') ? 'unknown' : attention ? 'attention' : pending ? 'in_progress' : 'ok',
    monitoringStartedAt: activation?.at ?? null, missingScheduledHours, counts, counters, runs };
}
