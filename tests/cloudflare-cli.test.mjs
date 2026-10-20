import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiGet, parseArgs } from '../scripts/cloudflare.mjs';

test('CLI validates command and arguments before authenticating', () => {
  assert.deepEqual(parseArgs(['crons', 'seed', '--account=abc']), { command: 'crons', worker: 'seed', account: 'abc' });
  assert.throws(() => parseArgs(['delete']), /inconnue/);
  assert.throws(() => parseArgs(['crons']), /requis/);
  assert.throws(() => parseArgs(['workers', '--token=secret']), /inconnue/);
});

test('API reads use GET and do not follow redirects', async () => {
  await apiGet('/accounts/abc/workers/scripts', { token: 'test-only' }, async (url, options) => {
    assert.equal(url, 'https://api.cloudflare.com/client/v4/accounts/abc/workers/scripts');
    assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'error');
    return Response.json({ success: true, result: [] });
  });
  await assert.rejects(apiGet('/accounts/../tokens', { token: 'test-only' }), /non autorisé/);
  await assert.rejects(apiGet('//external.example', { token: 'test-only' }), /non autorisé/);
});

test('API errors do not echo server bodies or credentials', async () => {
  await assert.rejects(apiGet('/accounts', { token: 'test-only' }, async () => new Response('secret body', { status: 403 })), error => error.message.includes('403') && !error.message.includes('secret'));
});
