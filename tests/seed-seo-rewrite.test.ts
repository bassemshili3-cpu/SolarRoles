import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rewriteJobDescriptionForSeo, RewriteApiError } from '../lib/seo/rewrite-description';
import { retryPolicy } from '../lib/seo/seed-rewrite-worker';
const job = { title: 'PV Installer', company: 'Solar', location: 'Austin, TX', description: 'Install PV modules. OSHA 10 required.' };
const html = '<p>Solar hires a PV installer in Austin, TX.</p><h3>Responsibilities</h3><ul><li>Install PV modules.</li></ul><h3>Requirements</h3><ul><li>OSHA 10.</li></ul>';
async function mockApi(response: () => Response, callback: () => Promise<void>) {
  const fetchBefore = globalThis.fetch, key = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test-key';
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
    const body = JSON.parse(init?.body as string);
    assert.equal((init?.headers as Record<string,string>).authorization, 'Bearer test-key');
    assert.match(body.messages[0].content, /no more than 3000 characters/);
    assert.equal(body.max_completion_tokens, 2000);
    return response();
  };
  try { await callback(); } finally { globalThis.fetch = fetchBefore; if (key === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = key; }
}
test('Groq request preserves the prompt and cleans fenced HTML', async () => {
  await mockApi(() => Response.json({ choices: [{ finish_reason: 'stop', message: { content: '```html\n' + html + '\n```' } }] }), async () => assert.equal(await rewriteJobDescriptionForSeo(job), html));
});
test('empty, truncated, unsafe and oversized output cannot be saved', async () => {
  for (const [content, finish_reason] of [['', 'stop'], [html, 'MAX_TOKENS'], [html, 'SAFETY'], [html + '<script>alert(1)</script>', 'stop'], [html + 'x'.repeat(3000), 'stop']]) {
    await mockApi(() => Response.json({ choices: [{ finish_reason, message: { content } }] }), async () => { await assert.rejects(rewriteJobDescriptionForSeo(job)); });
  }
});
test('429 is surfaced once with Retry-After and no sensitive error body', async () => {
  let calls = 0;
  await mockApi(() => { calls++; return new Response('private provider payload', { status: 429, headers: { 'retry-after': '900' } }); }, async () => {
    await assert.rejects(rewriteJobDescriptionForSeo(job), error => error instanceof RewriteApiError && error.status === 429 && error.retryAfter === '900' && !error.message.includes('private'));
  });
  assert.equal(calls, 1);
});
test('quota and credential errors refund attempts and honor provider dates', () => {
  const now = Date.parse('2026-10-18T12:00:00Z');
  const policy = retryPolicy(new RewriteApiError(429, '900'), 99, now);
  assert.equal(policy.refund, true); assert.equal(policy.status, 'pending');
  assert.equal(policy.nextAttemptAt.getTime(), now + 900000);
  assert.equal(retryPolicy(new RewriteApiError(429, new Date(now + 1800000).toUTCString()), 4, now).nextAttemptAt.getTime(), now + 1800000);
  assert.equal(retryPolicy(new RewriteApiError(401, null), 4, now).refund, true);
  assert.equal(retryPolicy(new Error('invalid HTML'), 4, now).status, 'failed');
  assert.equal(retryPolicy(new Error('contains secret'), 1, now).error.includes('secret'), false);
});

test('429 without Retry-After uses durable exponential backoff', () => { assert.equal(retryPolicy(new RewriteApiError(429, null), 1, 0).nextAttemptAt.getTime(), 300000); });

test('Cloudflare proxy uses cron authentication without sending the Groq key', async () => {
  const previous = { fetch: globalThis.fetch, proxy: process.env.GROQ_PROXY_URL, secret: process.env.CRON_SECRET, key: process.env.GROQ_API_KEY };
  process.env.GROQ_PROXY_URL = 'https://example.workers.dev/internal/groq';
  process.env.CRON_SECRET = 'cron-test'; process.env.GROQ_API_KEY = 'must-remain-private';
  globalThis.fetch = async (url, options) => {
    assert.equal(url, process.env.GROQ_PROXY_URL);
    assert.equal((options?.headers as Record<string, string>).authorization, 'Bearer cron-test');
    assert.ok(!JSON.stringify(options).includes('must-remain-private'));
    return Response.json({ choices: [{ finish_reason: 'stop', message: { content: html } }] });
  };
  try { assert.equal(await rewriteJobDescriptionForSeo(job), html); }
  finally {
    globalThis.fetch = previous.fetch;
    for (const [key, value] of Object.entries({ GROQ_PROXY_URL: previous.proxy, CRON_SECRET: previous.secret, GROQ_API_KEY: previous.key })) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});
