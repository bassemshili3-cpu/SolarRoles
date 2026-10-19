import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { runSeedRewrites } from '../lib/seo/seed-rewrite-worker';
import { RewriteApiError } from '../lib/seo/rewrite-description';
import { enqueueSeedRewrite } from '../lib/seo/enqueue-seed-rewrite';
const html = '<p>A solar PV installation role.</p><h3>Responsibilities</h3><ul><li>Install modules.</li></ul>';
const enabled = process.env.TEST_SEED_REWRITE_DB === '1';
// These checks use temporary queue tables and roll back all Job changes.
async function scenario(check: (db: any, tx: any, job: any) => Promise<void>) {
  const p = new PrismaClient();
  const rollback = new Error('test rollback');
  const beforeKey = process.env.MISTRAL_API_KEY;
  process.env.MISTRAL_API_KEY = 'test-only';
  try {
    await assert.rejects(p.$transaction(async tx => {
      await tx.$executeRawUnsafe('CREATE TEMP TABLE "SeoRewriteTask" ("jobId" TEXT PRIMARY KEY, status TEXT DEFAULT \'pending\', attempts INT DEFAULT 0, "nextAttemptAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "lastError" TEXT, "completedAt" TIMESTAMP, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ON COMMIT DROP');
      await tx.$executeRawUnsafe('CREATE TEMP TABLE "SeoRewriteControl" (id TEXT PRIMARY KEY, "leaseOwner" TEXT, "leaseUntil" TIMESTAMP, "nextRequestAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "budgetDay" TEXT DEFAULT \'\', "reservedTokens" INT DEFAULT 0, "requestCount" INT DEFAULT 0, "consecutiveRateLimits" INT DEFAULT 0, "lastProviderError" TEXT) ON COMMIT DROP');
      const job = await tx.job.findFirst({ where: { active: true, deletedAt: null, expiresAt: { gt: new Date() }, source: { not: 'adzuna' } } });
      assert.ok(job);
      await tx.job.update({ where: { id: job.id }, data: { seoDescriptionVersion: 0 } });
      await enqueueSeedRewrite(tx, job.id);
      await enqueueSeedRewrite(tx, job.id);
      const db = { $executeRaw: tx.$executeRaw.bind(tx), $queryRaw: tx.$queryRaw.bind(tx), $transaction: (fn: any) => fn(tx) };
      await check(db, tx, job);
      throw rollback;
    }, { timeout: 30000 }), error => error === rollback);
  } finally { if (beforeKey === undefined) delete process.env.MISTRAL_API_KEY; else process.env.MISTRAL_API_KEY = beforeKey; await p.$disconnect(); }
}
test('database: deduplicated queue, atomic SEO save, raw description preserved', { skip: !enabled }, async () => {
  await scenario(async (db, tx, job) => {
    let calls = 0;
    assert.equal((await runSeedRewrites(db, async () => { calls++; return html; })).decision, 'done');
    const current = await tx.job.findUnique({ where: { id: job.id } });
    assert.equal(current.description, job.description); assert.equal(current.seoDescription, html);
    const tasks = await tx.$queryRaw`SELECT * FROM "SeoRewriteTask"`;
    assert.equal(tasks.length, 1); assert.equal(tasks[0].status, 'done');
    assert.equal((await runSeedRewrites(db, async () => { calls++; return html; })).decision, 'cooldown');
    assert.equal(calls, 1);
  });
});
test('database: 429 keeps task pending, refunds attempt, and persists cooldown', { skip: !enabled }, async () => {
  await scenario(async (db, tx) => {
    assert.equal((await runSeedRewrites(db, async () => { throw new RewriteApiError(429, '900'); })).decision, 'retry');
    const [task] = await tx.$queryRaw`SELECT * FROM "SeoRewriteTask"`;
    assert.equal(task.attempts, 0); assert.equal(task.status, 'pending');
    const [control] = await tx.$queryRaw`SELECT "reservedTokens", "requestCount", "consecutiveRateLimits" FROM "SeoRewriteControl"`;
    assert.equal(control.reservedTokens, 0); assert.equal(control.requestCount, 1);
    assert.equal(control.consecutiveRateLimits, 1);
    assert.equal((await runSeedRewrites(db, async () => { throw Error('must not call'); })).decision, 'cooldown');
  });
});
test('database: active lease blocks competitors and expired lease fences old result', { skip: !enabled }, async () => {
  await scenario(async (db, tx, job) => {
    await assert.rejects(runSeedRewrites(db, async () => {
      assert.equal((await runSeedRewrites(db, async () => { throw Error('must not call'); })).decision, 'busy');
      await tx.$executeRaw`UPDATE "SeoRewriteControl" SET "leaseUntil" = CURRENT_TIMESTAMP - INTERVAL '1 minute'`;
      return html;
    }), /lease lost/);
    const current = await tx.job.findUnique({ where: { id: job.id } });
    assert.equal(current.seoDescription, job.seoDescription);
  });
});
test('database: changed job is never overwritten by an old API result', { skip: !enabled }, async () => {
  await scenario(async (db, tx, job) => {
    const result = await runSeedRewrites(db, async () => {
      await tx.job.update({ where: { id: job.id }, data: { seoDescription: '<p>Manual edit</p>' } });
      return html;
    });
    assert.equal(result.decision, 'changed');
    assert.equal((await tx.job.findUnique({ where: { id: job.id } })).seoDescription, '<p>Manual edit</p>');
  });
});
test('database: four interrupted attempts stop without another provider call', { skip: !enabled }, async () => {
  await scenario(async (db, tx) => {
    await tx.$executeRaw`UPDATE "SeoRewriteTask" SET attempts = 4`;
    assert.equal((await runSeedRewrites(db, async () => { throw Error('must not call'); })).decision, 'failed');
    const [task] = await tx.$queryRaw`SELECT * FROM "SeoRewriteTask"`;
    assert.equal(task.status, 'failed');
  });
});
test('database: oversized reservation cannot bypass the daily cap', { skip: !enabled }, async () => {
  const previous = process.env.SEO_REWRITE_DAILY_TOKEN_BUDGET;
  process.env.SEO_REWRITE_DAILY_TOKEN_BUDGET = '1';
  try {
    await scenario(async db => {
      assert.equal((await runSeedRewrites(db, async () => { throw Error('must not call'); })).decision, 'input_budget_exceeded');
    });
  } finally { if (previous === undefined) delete process.env.SEO_REWRITE_DAILY_TOKEN_BUDGET; else process.env.SEO_REWRITE_DAILY_TOKEN_BUDGET = previous; }
});

test('database: repeated 429 increases durable cooldown without burning tokens', { skip: !enabled }, async () => {
  await scenario(async (db, tx) => {
    await runSeedRewrites(db, async () => { throw new RewriteApiError(429, null); });
    await tx.$executeRaw`UPDATE "SeoRewriteControl" SET "nextRequestAt" = CURRENT_TIMESTAMP`;
    await tx.$executeRaw`UPDATE "SeoRewriteTask" SET "nextAttemptAt" = CURRENT_TIMESTAMP`;
    const now = Date.now();
    const result = await runSeedRewrites(db, async () => { throw new RewriteApiError(429, null); });
    assert.ok('resumeAt' in result && new Date(result.resumeAt!).getTime() >= now + 600000);
    const [control] = await tx.$queryRaw`SELECT "reservedTokens", "requestCount", "consecutiveRateLimits" FROM "SeoRewriteControl"`;
    assert.equal(control.reservedTokens, 0); assert.equal(control.requestCount, 2);
    assert.equal(control.consecutiveRateLimits, 2);
  });
});
test('database: timeout reservation is retained because provider outcome is unknown', { skip: !enabled }, async () => {
  await scenario(async (db, tx) => {
    await runSeedRewrites(db, async () => { throw new Error('Timeout'); });
    const [control] = await tx.$queryRaw`SELECT "reservedTokens", "requestCount", "consecutiveRateLimits" FROM "SeoRewriteControl"`;
    assert.ok(control.reservedTokens > 0);
    const [task] = await tx.$queryRaw`SELECT * FROM "SeoRewriteTask"`;
    assert.equal(task.attempts, 1);
  });
});
