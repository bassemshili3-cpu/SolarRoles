import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rewriteJobDescriptionForSeo, RewriteApiError } from '../lib/seo/rewrite-description';
import { retryPolicy } from '../lib/seo/seed-rewrite-worker';
const job = { title: 'PV Installer', company: 'Solar', location: 'Austin, TX', description: 'Install PV modules. OSHA 10 required.' };
const html = '<p>Solar hires a PV installer in Austin, TX.</p><h3>Responsibilities</h3><ul><li>Install PV modules.</li></ul><h3>Requirements</h3><ul><li>OSHA 10.</li></ul>';
async function mockApi(response: () => Response, callback: () => Promise<void>) {
  const fetchBefore = globalThis.fetch, key = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key';
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');
    const body = JSON.parse(init?.body as string);
    assert.equal((init?.headers as Record<string,string>)['x-goog-api-key'], 'test-key');
    assert.match(body.systemInstruction.parts[0].text, /no more than 3000 characters/);
    assert.equal(body.generationConfig.maxOutputTokens, 2000);
    return response();
  };
  try { await callback(); } finally { globalThis.fetch = fetchBefore; if (key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = key; }
}
test('Gemini request preserves the prompt and cleans fenced HTML', async () => {
  await mockApi(() => Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '```html\n' + html + '\n```' }] } }] }), async () => assert.equal(await rewriteJobDescriptionForSeo(job), html));
});
test('empty, truncated, unsafe and oversized output cannot be saved', async () => {
  for (const [content, finish_reason] of [['', 'STOP'], [html, 'MAX_TOKENS'], [html, 'SAFETY'], [html + '<script>alert(1)</script>', 'STOP'], [html + 'x'.repeat(3000), 'STOP']]) {
    await mockApi(() => Response.json({ candidates: [{ finishReason: finish_reason, content: { parts: [{ text: content }] } }] }), async () => { await assert.rejects(rewriteJobDescriptionForSeo(job)); });
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

test('Gemini RetryInfo cooldown is respected without exposing the provider body', async () => {
  await mockApi(() => Response.json({error:{message:'private provider payload',details:[{'@type':'type.googleapis.com/google.rpc.RetryInfo',retryDelay:'900.5s'}]}},{status:429}), async () => {
    await assert.rejects(rewriteJobDescriptionForSeo(job), error => error instanceof RewriteApiError && error.retryAfter === '900.5' && !error.message.includes('private'));
  });
});
test('Gemini thought parts are excluded from saved HTML', async () => {
  await mockApi(() => Response.json({candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'internal thinking'},{text:html}]}}]}),async()=>assert.equal(await rewriteJobDescriptionForSeo(job),html));
});
