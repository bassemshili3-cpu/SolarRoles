/**
 * Rewrites job descriptions via Claude for SEO and stores the result in
 * Job.seoDescription, stamping Job.seoDescriptionVersion so already
 * -processed jobs aren't re-billed on every run.
 *
 * Job.schemaDescription is a separate, pre-existing field used to build
 * the JSON-LD schema.org JobPosting payload (see buildSchemaDescription())
 * — this pipeline does not touch it.
 *
 * Run this on a schedule (cron / Vercel cron) after scripts/seed-cyber-jobs.ts
 * so new jobs get picked up automatically. Safe to run frequently — jobs
 * already at the current version are skipped by the WHERE clause.
 *
 * Usage: npx tsx scripts/rewrite-descriptions.ts
 */

import { PrismaClient } from '@prisma/client';
import { rewriteJobDescriptionForSeo, SEO_REWRITE_VERSION } from '../lib/seo/rewrite-description';

const prisma = new PrismaClient();

const BATCH_SIZE = 20; // per run — keep small enough to fit inside a cron/serverless timeout
const DELAY_MS = 300; // spacing between calls, comfortably under rate limits

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const jobs = await prisma.job.findMany({
    where: {
      active: true,
      seoDescriptionVersion: { lt: SEO_REWRITE_VERSION },
    },
    take: BATCH_SIZE,
    orderBy: { fetchedAt: 'desc' },
  });

  console.log(`Found ${jobs.length} job(s) needing an SEO rewrite (target version ${SEO_REWRITE_VERSION})`);

  let done = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      const rewritten = await rewriteJobDescriptionForSeo({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
      });

      await prisma.job.update({
        where: { id: job.id },
        data: {
          seoDescription: rewritten,
          seoDescriptionVersion: SEO_REWRITE_VERSION,
        },
      });

      done++;
      console.log(`✅ ${job.title} @ ${job.company}`);
    } catch (err) {
      failed++;
      console.error(`❌ ${job.title} @ ${job.company}:`, err);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. Rewritten: ${done}, Failed: ${failed}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});