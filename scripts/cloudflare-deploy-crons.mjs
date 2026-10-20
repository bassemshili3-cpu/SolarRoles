import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'tools/cloudflare/crons');
async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--apply') || args.length > 1) throw Error('Usage: node scripts/cloudflare-deploy-crons.mjs [--apply]');
  const config = JSON.parse(fs.readFileSync(path.join(directory, 'wrangler.jsonc'), 'utf8'));
  if (config.name !== 'solarroles-crons' || config.account_id !== 'de91aa3e3ca5a28bf3fdd6c1de5657ab') throw Error('Unexpected deployment target');
  if (!args.includes('--apply')) {
    console.log(JSON.stringify({ worker: config.name, account: config.account_id, enabled: config.vars.CRONS_ENABLED, schedules: config.triggers.crons, applied: false }));
    return;
  }
  let token;
  try {
    const { stdout } = await promisify(execFile)(process.execPath, [path.join(root, 'tools/cloudflare/node_modules/wrangler/bin/wrangler.js'), 'auth', 'token', '--json'], {
      cwd: root, windowsHide: true, timeout: 30_000,
      env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: path.join(root, 'tools/cloudflare/.wrangler/logs') },
    });
    token = JSON.parse(stdout).token;
  } catch { throw Error('Cloudflare authentication unavailable; run node scripts/cloudflare.mjs login'); }
  if (!token) throw Error('Cloudflare OAuth token missing');
  const base = `https://api.cloudflare.com/client/v4/accounts/${config.account_id}/workers/scripts/${config.name}`;
  const metadata = {
    main_module: 'worker.mjs', compatibility_date: config.compatibility_date,
    bindings: [
      ...Object.entries(config.vars).map(([name, text]) => ({ name, type: 'plain_text', text })),
      { name: 'CRON_SECRET', type: 'inherit' },
      ...config.secrets_store_secrets.map(({ binding: name, store_id, secret_name }) => ({ name, type: 'secrets_store_secret', store_id, secret_name })),
    ], observability: { enabled: true },
  };
  const form = new FormData();
  form.set('metadata', JSON.stringify(metadata));
  form.set('worker.mjs', new Blob([fs.readFileSync(path.join(directory, 'worker.mjs'))], { type: 'application/javascript+module' }), 'worker.mjs');
  const response = await fetch(base, { method: 'PUT', headers: { authorization: `Bearer ${token}` }, body: form, signal: AbortSignal.timeout(60_000) });
  const result = await response.json();
  if (!response.ok || !result.success) throw Error(`Cloudflare Worker upload HTTP ${response.status}; details suppressed`);
  const schedules = await fetch(base + '/schedules', {
    method: 'PUT', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(config.triggers.crons.map(cron => ({ cron }))), signal: AbortSignal.timeout(30_000),
  });
  const scheduleResult = await schedules.json();
  if (!schedules.ok || !scheduleResult.success) throw Error(`Worker uploaded but schedule update failed (HTTP ${schedules.status})`);
  console.log(JSON.stringify({ worker: config.name, applied: true, enabled: config.vars.CRONS_ENABLED, schedules: config.triggers.crons }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
