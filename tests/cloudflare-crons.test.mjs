import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { dispatch } from '../tools/cloudflare/crons/worker.mjs';
const env = { APP_ORIGIN: 'https://solarroles.com', CRONS_ENABLED: 'true', CRON_SECRET: 'test' };
test('disabled cron sends no requests', async () => {
  assert.equal((await dispatch('seed', Date.now(), { ...env, CRONS_ENABLED: 'false' }, () => { throw Error('unexpected'); })).decision, 'disabled');
});
test('dispatch carries authentication and scheduled time and rejects errors', async () => {
  const time = Date.now();
  const mock = async (url, options) => { assert.equal(url.pathname, '/.netlify/functions/sync-ats'); assert.equal(options.headers.authorization, 'Bearer test'); assert.equal(options.headers['x-scheduled-time'], String(time)); return Response.json({ dispatched: 53 }); };
  assert.equal((await dispatch('seed', time, env, mock)).dispatched, 53);
  await assert.rejects(dispatch('rewrite', time, env, async () => new Response('private', { status: 500 })), /HTTP 500/);
});
test('manual execution and Groq proxy require authenticated POST', async () => {
  for (const route of ['/run/seed', '/run/rewrite', '/internal/groq']) assert.equal((await worker.fetch(new Request('https://worker' + route, { method: 'POST' }), env)).status, 401);
  assert.equal((await worker.fetch(new Request('https://worker/run/seed', { headers: { authorization: 'Bearer test' } }), env)).status, 405);
});
test('proxy rejects alternate model before accessing the key', async () => {
  const response = await worker.fetch(new Request('https://worker/internal/groq', { method: 'POST', headers: { authorization: 'Bearer test' }, body: JSON.stringify({ model: 'other' }) }), env);
  assert.equal(response.status, 400);
});
