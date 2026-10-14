import { getAtsSyncTasks } from '../../scripts/seed-solar-jobs';

// Six hourly slots cover every configured ATS employer once per six hours.
export const config = { schedule: '17 * * * *' };

export default async function syncAts() {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error('CRON_SECRET is required for ATS sync.');
  const origin = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) throw new Error('A Netlify site URL is required for ATS sync.');
  const slot = new Date().getUTCHours() % 6;
  const tasks = getAtsSyncTasks().filter((_, index) => index % 6 === slot);
  const failures: string[] = [];
  const queue = [...tasks];
  const signal = AbortSignal.timeout(22000);

  await Promise.all(Array.from({ length: Math.min(8, tasks.length) }, async () => {
    while (queue.length > 0) {
      const task = queue.shift()!;
      try {
        const response = await fetch(new URL('/.netlify/functions/sync-ats-background', origin), {
          method: 'POST',
          headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
          body: JSON.stringify(task),
          signal,
        });
        if (response.status !== 202) throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        failures.push(`${task.providerName}[${task.companyIndex}]: ${String(error)}`);
      }
    }
  }));

  console.log(JSON.stringify({ slot, dispatched: tasks.length - failures.length, failures }));
  if (failures.length > 0) throw new Error(`${failures.length} ATS background dispatch(es) failed`);
}
