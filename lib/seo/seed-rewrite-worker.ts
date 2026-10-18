import { randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import { rewriteJobDescriptionForSeo, rewriteTokenReservation, RewriteApiError, SEO_REWRITE_VERSION } from './rewrite-description';
import { validateBoundedRewrite } from './rewrite-validation';
type Tx = Prisma.TransactionClient;
const CONTROL = 'seed-mistral';
const LEASE_MS = 300_000;
const setting = (key: string, fallback: number) => {
  const value = Number(process.env[key] ?? fallback);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`Invalid ${key}`);
  return value;
};
export function retryPolicy(error: unknown, attempts: number, now = Date.now()) {
  const api = error instanceof RewriteApiError ? error : null;
  const quota = api?.status === 429;
  const configuration = api?.status === 401 || api?.status === 403;
  const header = api?.retryAfter;
  const parsed = header ? (/^\d+(?:\.\d+)?$/.test(header) ? now + Number(header) * 1000 : Date.parse(header)) : NaN;
  const delay = quota ? 300_000 : configuration ? 3_600_000 : Math.min(3_600_000, 60_000 * 2 ** Math.min(attempts, 6));
  return {
    refund: quota || configuration, stop: quota || configuration,
    status: !quota && !configuration && attempts >= 4 ? 'failed' : 'pending',
    nextAttemptAt: new Date(Math.max(now + delay, Number.isFinite(parsed) ? parsed : 0)),
    error: api ? api.message : error instanceof Error && error.message.startsWith('Mistral output') ? error.message.slice(0, 150) : 'Rewrite failed validation or request; retry scheduled',
  };
}
async function fence(tx: Tx, owner: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "SeoRewriteControl"
    WHERE id = ${CONTROL} AND "leaseOwner" = ${owner} AND "leaseUntil" > CURRENT_TIMESTAMP FOR UPDATE`;
  if (!rows.length) throw new Error('SEO rewrite lease lost; result not saved');
}
/** One API call per invocation, with persistent reservation and fenced saving. */
export async function runSeedRewrites(db: PrismaClient, rewrite = rewriteJobDescriptionForSeo) {
  if (!process.env.MISTRAL_API_KEY) throw new Error('MISTRAL_API_KEY is required');
  const budget = setting('SEO_REWRITE_DAILY_TOKEN_BUDGET', 180_000);
  const spacing = setting('SEO_REWRITE_INTERVAL_MS', 65_000);
  const owner = randomUUID();
  await db.$executeRaw`INSERT INTO "SeoRewriteControl" (id) VALUES (${CONTROL}) ON CONFLICT DO NOTHING`;
  const acquired = await db.$executeRaw`UPDATE "SeoRewriteControl" SET "leaseOwner" = ${owner}, "leaseUntil" = ${new Date(Date.now() + LEASE_MS)}
    WHERE id = ${CONTROL} AND ("leaseUntil" IS NULL OR "leaseUntil" <= CURRENT_TIMESTAMP)`;
  if (!acquired) return { decision: 'busy' };
  try {
    const reservation = await db.$transaction(async tx => {
      await fence(tx, owner);
      const [control] = await tx.$queryRaw<{ nextRequestAt: Date; budgetDay: string; reservedTokens: number }[]>`SELECT * FROM "SeoRewriteControl" WHERE id = ${CONTROL}`;
      const now = new Date();
      if (control.nextRequestAt > now) return { decision: 'cooldown' as const, resumeAt: control.nextRequestAt };
      const tasks = await tx.$queryRaw<{ jobId: string; attempts: number }[]>`SELECT "jobId", attempts FROM "SeoRewriteTask"
        WHERE status = 'pending' AND "nextAttemptAt" <= CURRENT_TIMESTAMP ORDER BY "createdAt", "jobId" LIMIT 1 FOR UPDATE`;
      if (!tasks.length) return { decision: 'empty' as const };
      const task = tasks[0];
      if (task.attempts >= 4) {
        await tx.$executeRaw`UPDATE "SeoRewriteTask" SET status = 'failed', "lastError" = 'Four interrupted or failed attempts; manual review required' WHERE "jobId" = ${task.jobId}`;
        return { decision: 'failed' as const };
      }
      const job = await tx.job.findUnique({ where: { id: task.jobId } });
      if (!job || !job.active || job.deletedAt || job.expiresAt <= now || job.source === 'adzuna' || (job.seoDescription && job.seoDescriptionVersion >= SEO_REWRITE_VERSION)) {
        await tx.$executeRaw`UPDATE "SeoRewriteTask" SET status = 'skipped', "completedAt" = CURRENT_TIMESTAMP WHERE "jobId" = ${task.jobId}`;
        return { decision: 'skipped' as const };
      }
      const tokens = rewriteTokenReservation(job);
      if (tokens > budget) {
        await tx.$executeRaw`UPDATE "SeoRewriteTask" SET status = 'failed', "lastError" = 'Input exceeds configured daily token budget' WHERE "jobId" = ${task.jobId}`;
        return { decision: 'input_budget_exceeded' as const };
      }
      const day = now.toISOString().slice(0, 10);
      const previous = control.budgetDay === day ? control.reservedTokens : 0;
      if (previous + tokens > budget) return { decision: 'daily_budget' as const };
      await tx.$executeRaw`UPDATE "SeoRewriteControl" SET "budgetDay" = ${day}, "reservedTokens" = ${previous + tokens},
        "requestCount" = CASE WHEN "budgetDay" = ${day} THEN "requestCount" + 1 ELSE 1 END,
        "nextRequestAt" = ${new Date(now.getTime() + spacing)} WHERE id = ${CONTROL}`;
      await tx.$executeRaw`UPDATE "SeoRewriteTask" SET attempts = attempts + 1,
        "nextAttemptAt" = ${new Date(now.getTime() + LEASE_MS)} WHERE "jobId" = ${task.jobId}`;
      return { decision: 'reserved' as const, task, job };
    });
    if (reservation.decision !== 'reserved') return reservation;
    const { task, job } = reservation;
    let output: string;
    try {
      output = await rewrite(job, { maxCharacters: 3000, attempt: task.attempts });
      validateBoundedRewrite(output);
    } catch (error) {
      const policy = retryPolicy(error, task.attempts + 1);
      await db.$transaction(async tx => {
        await fence(tx, owner);
        await tx.$executeRaw`UPDATE "SeoRewriteTask" SET status = ${policy.status}, "lastError" = ${policy.error},
          attempts = attempts - ${policy.refund ? 1 : 0}, "nextAttemptAt" = ${policy.nextAttemptAt} WHERE "jobId" = ${task.jobId}`;
        if (policy.stop) await tx.$executeRaw`UPDATE "SeoRewriteControl" SET "nextRequestAt" = ${policy.nextAttemptAt} WHERE id = ${CONTROL}`;
      });
      return { decision: policy.status === 'failed' ? 'failed' : 'retry', jobId: job.id, resumeAt: policy.nextAttemptAt, error: policy.error };
    }
    return await db.$transaction(async tx => {
      await fence(tx, owner);
      const saved = await tx.job.updateMany({
        where: { id: job.id, active: true, deletedAt: null, expiresAt: { gt: new Date() },
          description: job.description, title: job.title, company: job.company, location: job.location,
          seoDescription: job.seoDescription, seoDescriptionVersion: job.seoDescriptionVersion },
        data: { seoDescription: output, seoDescriptionVersion: SEO_REWRITE_VERSION, lastGoogleIndexingSubmittedAt: null },
      });
      if (saved.count) {
        await tx.$executeRaw`UPDATE "SeoRewriteTask" SET status = 'done', "lastError" = NULL, "completedAt" = CURRENT_TIMESTAMP WHERE "jobId" = ${job.id}`;
      } else {
        await tx.$executeRaw`UPDATE "SeoRewriteTask" SET "lastError" = 'Job changed during rewrite; rechecking', "nextAttemptAt" = CURRENT_TIMESTAMP WHERE "jobId" = ${job.id}`;
      }
      return { decision: saved.count ? 'done' : 'changed', jobId: job.id, characters: output.length };
    });
  } finally {
    await db.$executeRaw`UPDATE "SeoRewriteControl" SET "leaseOwner" = NULL, "leaseUntil" = NULL WHERE id = ${CONTROL} AND "leaseOwner" = ${owner}`;
  }
}
export async function seedRewriteStatus(db: PrismaClient) {
  const counts = await db.$queryRaw<{ status: string; count: number }[]>`SELECT status, COUNT(*)::int AS count FROM "SeoRewriteTask" GROUP BY status`;
  const controls = await db.$queryRaw`SELECT id, "leaseUntil", "nextRequestAt", "budgetDay", "reservedTokens", "requestCount" FROM "SeoRewriteControl" WHERE id = ${CONTROL}`;
  const failures = await db.$queryRaw`SELECT "jobId", attempts, "lastError", "nextAttemptAt" FROM "SeoRewriteTask" WHERE status = 'failed' ORDER BY "createdAt" DESC LIMIT 10`;
  return { checkedAt: new Date().toISOString(), counts, controls, failures };
}
