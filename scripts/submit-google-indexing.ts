#!/usr/bin/env ts-node

/**
 * One-shot Google Indexing API submission script
 * Soumet les URLs canoniques des jobs ATS actifs (uniquement) à l'API
 * Google Indexing, dans la limite de 200 URLs (quota quotidien google-200).
 *
 * Usage:
 *   npm run submit-google-indexing
 *   or
 *   npx tsx scripts/submit-google-indexing.ts
 */

// Load environment variables from .env.local (comme submit-indexnow.ts)
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { buildJobSlug } from '../lib/slugify';
import { isGoogleIndexingConfigured, notifyGoogleIndexing } from '../lib/googleIndexing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const prisma = new PrismaClient();

// = quota quotidien google-200 (200 URLs/jour).
const MAX_URLS = 200;

// Seules ces sources ATS sont indexables.
const ATS_SOURCES = [
  'lever',
  'ashby',
  'smartrecruiters',
  'jobvite',
  'greenhouse',
  'pinpoint',
  'workday',
  'workable',
];

async function main() {
  console.log('🚀 Starting one-shot Google Indexing submission...\n');
  console.log(`📁 Project root: ${projectRoot}`);
  console.log(
    `🔍 GOOGLE_INDEXING_CLIENT_EMAIL: ${process.env.GOOGLE_INDEXING_CLIENT_EMAIL ? '✅ Set' : '❌ Not set'}`
  );
  console.log(
    `🔍 GOOGLE_INDEXING_PRIVATE_KEY: ${process.env.GOOGLE_INDEXING_PRIVATE_KEY ? '✅ Set' : '❌ Not set'}`
  );
  console.log('');

  if (!isGoogleIndexingConfigured()) {
    console.error('❌ ERROR: GOOGLE_INDEXING_CLIENT_EMAIL / GOOGLE_INDEXING_PRIVATE_KEY not set');
    process.exit(1);
  }

  const jobs = await prisma.job.findMany({
    where: { active: true, source: { in: ATS_SOURCES } },
    select: { id: true, title: true, location: true },
    orderBy: { fetchedAt: 'desc' },
    take: MAX_URLS,
  });

  console.log(`📋 ${jobs.length} active ATS job(s) to submit (max ${MAX_URLS})`);
  console.log('');

  let submitted = 0;
  let failed = 0;

  for (const job of jobs) {
    const url = `https://www.solarroles.com/jobs/${job.id}/${buildJobSlug(job)}`;
    const result = await notifyGoogleIndexing(url, 'URL_UPDATED');

    if (result.success) {
      submitted++;
      console.log(`  ✔ ${url}`);
    } else {
      failed++;
      console.error(`  ✘ ${url}: ${JSON.stringify(result.error)}`);
      if (result.quotaExceeded) {
        console.error('⛔ Daily quota reached — stopping early');
        break;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`\nDone. Submitted: ${submitted}, Failed: ${failed}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('❌ Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});