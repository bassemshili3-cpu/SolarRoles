/** Process the same durable queue as the Netlify cron; no implicit catalog backfill. */
import { PrismaClient } from '@prisma/client';
import { pathToFileURL } from 'node:url';
import { runSeedRewrites, seedRewriteStatus } from '../lib/seo/seed-rewrite-worker';
import { rewriteLongAtsDescriptions } from '../lib/seo/rewrite-long-ats';
export async function main(args = process.argv.slice(2)) {
  const prisma = new PrismaClient();
  try {
    if (args.includes('--ats-over-3000')) {
      // Explicit legacy backfill, never called by the scheduled worker.
      await rewriteLongAtsDescriptions(prisma, args);
    } else {
      console.log(JSON.stringify(args.includes('--status') ? await seedRewriteStatus(prisma) : await runSeedRewrites(prisma)));
    }
  } finally { await prisma.$disconnect(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('Seed rewrite failed; check database connectivity and GEMINI_API_KEY'); process.exitCode = 1; });
}
