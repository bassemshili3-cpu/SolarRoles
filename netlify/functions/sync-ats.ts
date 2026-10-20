import { getAtsSyncTasks } from '../../scripts/seed-solar-jobs';
import { createManifest, saveManifest, saveDispatch, taskKey, safeDiagnostic, type DispatchOutcome } from '../../lib/ats/sync-monitor';
import { atsSyncStore } from '../lib/ats-sync-store';

// Six hourly slots cover every configured ATS employer once per six hours.
// Scheduling is owned by Cloudflare.

export default async function syncAts(request: Request) {
  if (request.method !== 'POST' || !process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
  const scheduledAt = Number(request.headers.get('x-scheduled-time'));
  if (!scheduledAt || Math.abs(Date.now() - scheduledAt) > 5 * 60_000) return new Response('Stale schedule', { status: 400 });
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error('CRON_SECRET is required for ATS sync.');
  const origin = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) throw new Error('A Netlify site URL is required for ATS sync.');
  const slot = new Date(scheduledAt).getUTCHours() % 6;
  const tasks = getAtsSyncTasks().filter((_, index) => index % 6 === slot);
  const failures: string[] = [];
  const outcomes: DispatchOutcome[] = [];
  const store = atsSyncStore();
  const manifest = createManifest(tasks, 'scheduled', new Date(scheduledAt));
  const claim = await store.setJSON(`cloudflare-slots/${new Date(scheduledAt).toISOString().slice(0, 13)}`, { runId: manifest.runId }, { onlyIfNew: true });
  if (!claim.modified) return Response.json({ decision: 'duplicate' });
  // Persist expected employers before sending anything: missing workers stay visible.
  await saveManifest(store, manifest);
  const queue = [...tasks];
  const signal = AbortSignal.timeout(22000);

  await Promise.all(Array.from({ length: Math.min(8, tasks.length) }, async () => {
    while (queue.length > 0) {
      const task = queue.shift()!;
      try {
        const response = await fetch(new URL('/.netlify/functions/sync-ats-background', origin), {
          method: 'POST',
          headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
          body: JSON.stringify({ ...task, runId: manifest.runId }),
          signal,
        });
        if (response.status !== 202) throw new Error(`HTTP ${response.status}`);
        outcomes.push({ taskKey: taskKey(task), accepted: true });
      } catch (error) {
        const message = safeDiagnostic(error);
        outcomes.push({ taskKey: taskKey(task), accepted: false, error: message });
        failures.push(`${task.providerName}[${task.companyIndex}]: ${message}`);
      }
    }
  }));

  await saveDispatch(store, manifest, { finishedAt: new Date().toISOString(), outcomes });
  console.log(JSON.stringify({ runId: manifest.runId, slot, dispatched: tasks.length - failures.length, failures }));
  if (failures.length > 0) return Response.json({ runId: manifest.runId, failures: failures.length }, { status: 502 });
  return Response.json({ runId: manifest.runId, dispatched: tasks.length });
}
