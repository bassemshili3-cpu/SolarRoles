import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function checkAtsSync(argv) {
  if (argv.includes('--help')) {
    console.log('node --env-file=.env.local scripts/check-ats-sync.mjs [--hours=8] [--json] [--site=https://solarroles.com]\nRead-only. CRON_SECRET must match the deployed Functions value. Full report saved in .temp/.'); return;
  }
  for (const arg of argv) if (arg !== '--json' && !arg.startsWith('--hours=') && !arg.startsWith('--site=')) throw Error('Unknown option: ' + arg);
  const option = (key, fallback) => argv.find(a => a.startsWith(key + '='))?.slice(key.length + 1) ?? fallback;
  const hours = Number(option('--hours', '8'));
  if (!Number.isInteger(hours) || hours < 1 || hours > 24) throw Error('--hours must be from 1 to 24');
  if (!process.env.CRON_SECRET) throw Error('CRON_SECRET is missing from .env.local; use the same value as the Netlify Functions environment.');
  const url = new URL('/.netlify/functions/ats-sync-status', option('--site', 'https://solarroles.com'));
  if (url.protocol !== 'https:') throw Error('--site must use HTTPS');
  url.searchParams.set('hours', String(hours));
  const response = await fetch(url, { headers: { authorization: 'Bearer ' + process.env.CRON_SECRET }, redirect: 'error', signal: AbortSignal.timeout(60000) });
  if (response.status === 404) throw Error('Monitoring endpoint not found. Deploy the ATS monitoring changes first.');
  if (response.status === 401) throw Error('Unauthorized: CRON_SECRET differs from the deployed value.');
  if (!response.ok) throw Error('Monitoring endpoint HTTP ' + response.status + '; cron health could not be verified.');
  const report = await response.json();
  const dir = path.resolve('.temp'); fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'ats-sync-status-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
  fs.writeFileSync(file, JSON.stringify(report, null, 2));
  if (argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(JSON.stringify({ at: report.at, health: report.health, hours: report.hours, monitoringStartedAt: report.monitoringStartedAt,
      runs: report.runs.length, counts: report.counts, counters: report.counters, missingScheduledHours: report.missingScheduledHours, report: file }, null, 2));
    const providers = {};
    for (const run of report.runs) for (const task of run.tasks) {
      const row = providers[task.providerName] ??= { provider: task.providerName, tasks: 0, completed: 0, pending: 0, attention: 0, errors: 0 };
      row.tasks++;
      if (task.state === 'completed') row.completed++;
      else if (['running', 'accepted', 'dispatch_unknown'].includes(task.state)) row.pending++;
      else if (['empty', 'completed_with_warnings'].includes(task.state)) row.attention++;
      else row.errors++;
    }
    console.table(Object.values(providers));
    const issues = report.runs.flatMap(run => run.tasks.filter(t => !['completed', 'running', 'accepted'].includes(t.state)).map(task => {
      const last = task.attempts.at(-1);
      return { at: run.startedAt, provider: task.providerName, employer: task.label, state: task.state,
        created: last?.progress?.created ?? 0, detail: (last?.error || last?.diagnostics?.samples?.[0]?.message || task.dispatch?.error || '').slice(0, 180) };
    }));
    if (issues.length) console.table(issues.slice(0, 50));
    if (issues.length > 50) console.log(`${issues.length} tasks need review; all details are in ${file}`);
    if (report.health === 'unknown') console.log('No scheduled execution has been verified for this monitoring window yet.');
  }
  process.exitCode = report.health === 'unknown' ? 3 : ['error', 'attention'].includes(report.health) ? 2 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) checkAtsSync(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
