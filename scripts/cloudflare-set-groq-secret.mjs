import { execFile } from 'node:child_process';
import { promisify, parseEnv } from 'node:util';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Upload this one explicitly authorized key; no other .env.local value is sent.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cwd = path.join(root, 'tools/cloudflare');
const wrangler = path.join(cwd, 'node_modules/wrangler/bin/wrangler.js');
const exec = promisify(execFile);
const env = { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: path.join(cwd, '.wrangler/logs') };

async function auth(args) {
  try {
    const { stdout } = await exec(process.execPath, [wrangler, ...args], { cwd, env, windowsHide: true, timeout: 60_000 });
    return JSON.parse(stdout);
  } catch { throw Error('Connexion Cloudflare indisponible ou droit Secrets Store absent.'); }
}

async function main() {
  if (process.argv.slice(2).some(arg => arg !== '--apply')) throw Error('Usage: node scripts/cloudflare-set-groq-secret.mjs [--apply]');
  const key = parseEnv(readFileSync(path.join(root, '.env.local'), 'utf8')).GROQ_API_KEY?.trim();
  if (!key) throw Error('GROQ_API_KEY absente ou vide dans .env.local.');
  if (!process.argv.includes('--apply')) { console.log(JSON.stringify({ key: 'GROQ_API_KEY', present: true, action: 'preview', destination: 'Cloudflare account Secrets Store', valueDisplayed: false })); return; }
  const identity = await auth(['whoami', '--json']);
  if (!identity.loggedIn || identity.accounts?.length !== 1) throw Error('Un unique compte Cloudflare connecté est nécessaire.');
  if (!identity.tokenPermissions?.includes('secrets_store:write')) throw Error('Autoriser secrets_store:write via Wrangler OAuth avant cet envoi.');
  const accountId = identity.accounts[0].id;
  const credentials = await auth(['auth', 'token', '--json']);
  if (!credentials.token) throw Error('Une connexion OAuth ou API token est nécessaire.');
  async function api(suffix, method = 'GET', body) {
    let response;
    try {
      response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/secrets_store/stores${suffix}`, {
        method, headers: { authorization: `Bearer ${credentials.token}`, 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(30_000),
      });
    } catch { throw Error('Requête Cloudflare interrompue ; vérifier les métadonnées avant de réessayer.'); }
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      const message = (details.errors ?? []).map(error => `${error.code ?? ''} ${error.message ?? ''}`).join('; ')
        .split(key).join('[redacted]').split(credentials.token).join('[redacted]').slice(0, 800);
      throw Error(`Secrets Store ${method} ${suffix || '/'} : HTTP ${response.status}. ${message}`);
    }
    const data = await response.json();
    if (!data.success) throw Error('Cloudflare a refusé cette opération Secrets Store.');
    return data.result;
  }
  const stores = await api('');
  if (!Array.isArray(stores) || stores.length > 1) throw Error('Sélection du coffre Cloudflare ambiguë.');
  let store = stores[0], storeCreated = false;
  if (!store) {
    const created = await api('', 'POST', { name: 'solarroles' });
    store = created; storeCreated = true;
  }
  if (!store?.id) throw Error('Identifiant du coffre Cloudflare absent.');
  const before = await api(`/${store.id}/secrets`);
  const previous = before.find(secret => secret.name === 'GROQ_API_KEY');
  if (previous) {
    await api(`/${store.id}/secrets/${previous.id}`, 'PATCH', { value: key });
  } else {
    await api(`/${store.id}/secrets`, 'POST', [{ name: 'GROQ_API_KEY', value: key, scopes: ['workers'] }]);
  }
  const after = await api(`/${store.id}/secrets`);
  const saved = after.find(secret => secret.name === 'GROQ_API_KEY');
  if (!saved?.id) throw Error('Secret non retrouvé lors de la vérification des métadonnées.');
  const receipt = { checkedAt: new Date().toISOString(), accountId, storeId: store.id, storeName: store.name,
    storeCreated, secret: { id: saved.id, name: saved.name, scopes: saved.scopes }, action: previous ? 'updated' : 'created',
    metadataVerified: true, workerBound: false, cronEnabled: false, groqRequestSent: false };
  mkdirSync(path.join(root, '.temp'), { recursive: true });
  writeFileSync(path.join(root, '.temp/cloudflare-groq-secret-receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
