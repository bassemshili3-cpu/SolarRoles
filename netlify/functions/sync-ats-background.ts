import { randomUUID } from 'node:crypto';
import { getAtsSyncTasks, runAtsSeed } from '../../scripts/seed-solar-jobs';
import { createManifest, runPrefix, saveManifest, saveAttempt, safeDiagnostic, taskKey, type SyncManifest, type SyncAttempt } from '../../lib/ats/sync-monitor';
import { captureAtsDiagnostics } from '../../lib/ats/sync-diagnostics';
import { atsSyncStore } from '../lib/ats-sync-store';

// The -background suffix enables Netlify's asynchronous execution (15 minutes).
export async function handler(event: { httpMethod: string; headers: Record<string, string | undefined>; body: string | null; blobs?: string }) {
  const secret = process.env.CRON_SECRET;
  if (!secret || event.headers.authorization !== `Bearer ${secret}`) {
    throw new Error('Unauthorized ATS sync');
  }
  if (event.httpMethod !== 'POST') throw new Error('ATS sync requires POST');
  const input = JSON.parse(event.body || '{}') as { providerName?: unknown; companyIndex?: unknown; runId?: unknown };
  const task = getAtsSyncTasks().find(t => t.providerName === input.providerName && t.companyIndex === input.companyIndex);
  if (!task) {
    throw new Error('Invalid ATS sync task');
  }
  const store = atsSyncStore(event);
  let manifest: SyncManifest;
  if (input.runId !== undefined) {
    if (typeof input.runId !== 'string') throw new Error('Invalid ATS run id');
    manifest = await store.get(runPrefix(input.runId) + 'manifest', { type: 'json' });
    if (!manifest?.tasks.some(t => taskKey(t) === taskKey(task))) throw new Error('ATS run does not include this employer');
  } else {
    // Direct, authenticated invocations remain supported and are labelled manual.
    manifest = createManifest([task], 'manual');
    await saveManifest(store, manifest);
  }
  process.env.ATS_SERVERLESS_BROWSER = 'true';
  await captureAtsDiagnostics(async diagnostics => {
    const startedAt = new Date().toISOString();
    let attempt: SyncAttempt = { attemptId: randomUUID(), taskKey: taskKey(task), startedAt, heartbeatAt: startedAt, state: 'running', diagnostics };
    const persist = () => saveAttempt(store, manifest.runId, { ...attempt, heartbeatAt: new Date().toISOString() });
    // Do not begin an untracked write-producing worker if the audit store is down.
    await persist();
    let pending = Promise.resolve();
    const heartbeat = setInterval(() => {
      pending = pending.then(persist).catch(error => { console.error('ATS monitor heartbeat failed:', safeDiagnostic(error)); });
    }, 60000);
    try {
      const summary = await runAtsSeed({ providerName: task.providerName, companyIndex: task.companyIndex, newOnly: true,
        onProgress: progress => { attempt.progress = progress; } });
      attempt = { ...attempt, state: 'completed', progress: summary, finishedAt: new Date().toISOString() };
    } catch (error) {
      attempt = { ...attempt, state: 'failed', error: safeDiagnostic(error), finishedAt: new Date().toISOString() };
      throw error;
    } finally {
      clearInterval(heartbeat);
      await pending;
      await persist();
      console.log(JSON.stringify({ runId: manifest.runId, taskKey: attempt.taskKey, attemptId: attempt.attemptId, state: attempt.state, progress: attempt.progress,
        warnings: diagnostics.warnings, errors: diagnostics.errors }));
    }
  });
}
