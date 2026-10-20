import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cwd = path.join(root, 'tools/cloudflare');
const wrangler = path.join(cwd, 'node_modules/wrangler/bin/wrangler.js');
const env = { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: path.join(cwd, '.wrangler/logs') };
const exec = promisify(execFile);

export function parseArgs(args) {
  const positional = [], options = {};
  for (const arg of args) {
    if (arg.startsWith('--account=')) options.account = arg.slice(10);
    else if (arg.startsWith('--')) throw Error(`Option inconnue : ${arg}`);
    else positional.push(arg);
  }
  const [command = 'help', worker] = positional;
  if (!['help', 'login', 'status', 'accounts', 'workers', 'crons', 'deployments', 'tail'].includes(command)) throw Error('Commande inconnue. Utiliser help.');
  if (positional.length > 2 || (worker && !['crons', 'deployments', 'tail'].includes(command))) throw Error('Arguments supplémentaires non acceptés.');
  if (['crons', 'deployments', 'tail'].includes(command) && !worker) throw Error('Nom du Worker requis.');
  return { command, worker, ...options };
}

async function captured(args) {
  try {
    const { stdout } = await exec(process.execPath, [wrangler, ...args], { cwd, env, windowsHide: true, timeout: 60_000, maxBuffer: 2 * 1024 * 1024 });
    return JSON.parse(stdout);
  } catch (error) {
    if (args[0] === 'whoami') {
      try { const value = JSON.parse(error.stdout); if (value.loggedIn === false) return value; } catch { /* No usable identity. */ }
    }
    // exec errors can embed credential-bearing stdout: never print that object.
    throw Error('Cloudflare : session absente/expirée ou commande refusée. Exécuter node scripts/cloudflare.mjs login.');
  }
}

async function streamed(args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [wrangler, ...args], { cwd, env: { ...env, ...extraEnv }, windowsHide: true, stdio: 'inherit' });
    child.on('error', () => reject(Error('Impossible de démarrer Wrangler.')));
    child.on('exit', code => code === 0 ? resolve() : reject(Error(`Wrangler terminé avec le code ${code}.`)));
  });
}

export async function apiGet(resource, credentials, fetcher = fetch) {
  if (!/^\/(?:accounts(?:\/|\?|$)|user(?:\/|\?|$))/.test(resource) || resource.includes('..') || resource.includes('#')) throw Error('Chemin API non autorisé.');
  const headers = credentials.token ? { authorization: `Bearer ${credentials.token}` } : { 'x-auth-key': credentials.key, 'x-auth-email': credentials.email };
  const response = await fetcher(`https://api.cloudflare.com/client/v4${resource}`, { method: 'GET', headers, redirect: 'error', signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw Error(`Cloudflare HTTP ${response.status} : vérifier les droits sur cette ressource.`);
  const body = await response.json();
  if (!body.success) throw Error('Cloudflare a refusé la lecture de cette ressource.');
  return body;
}

export async function main(args) {
  const { command, worker, account } = parseArgs(args);
  if (command === 'help') {
    console.log('Cloudflare SolarRoles — Wrangler officiel\n\nnode scripts/cloudflare.mjs login\nnode scripts/cloudflare.mjs status\nnode scripts/cloudflare.mjs accounts\nnode scripts/cloudflare.mjs workers [--account=ID]\nnode scripts/cloudflare.mjs crons WORKER [--account=ID]\nnode scripts/cloudflare.mjs deployments WORKER [--account=ID]\nnode scripts/cloudflare.mjs tail WORKER [--account=ID]\n\nLes commandes API lisent les ressources. tail ouvre une session de logs. Aucun cron n’est déployé par ce CLI.');
    return;
  }
  if (!existsSync(wrangler)) throw Error('Installer Wrangler : npm install --prefix tools/cloudflare --no-audit --no-fund');
  if (command === 'login') return streamed(['login', '--scopes', 'account:read', 'user:read', 'workers:write', 'workers_tail:read', 'secrets_store:write']);
  const identity = await captured(['whoami', '--json']);
  if (command === 'status') { console.log(JSON.stringify(identity, null, 2)); return; }
  if (!identity.loggedIn) throw Error('Compte non connecté. Exécuter node scripts/cloudflare.mjs login.');
  const accounts = identity.accounts ?? [];
  if (command === 'accounts') { console.log(JSON.stringify(accounts, null, 2)); return; }
  const accountId = account || process.env.CLOUDFLARE_ACCOUNT_ID || (accounts.length === 1 ? accounts[0].id : undefined);
  if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId)) throw Error('Choisir un compte avec --account=ID (voir accounts).');
  if (command === 'tail') return streamed(['tail', worker, '--format=json'], { CLOUDFLARE_ACCOUNT_ID: accountId });
  const credentials = await captured(['auth', 'token', '--json']);
  const base = `/accounts/${accountId}/workers/scripts`;
  if (command === 'workers') {
    const body = await apiGet(base, credentials);
    console.log(JSON.stringify({ accountId, workers: body.result, resultInfo: body.result_info }, null, 2));
  } else {
    const suffix = command === 'crons' ? 'schedules' : 'deployments';
    const body = await apiGet(`${base}/${encodeURIComponent(worker)}/${suffix}`, credentials);
    console.log(JSON.stringify({ accountId, worker, [suffix]: body.result }, null, 2));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
