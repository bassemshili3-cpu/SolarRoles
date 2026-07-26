/**
 * Pulls solar-installer-relevant jobs from Lever and Pinpoint for the
 * companies listed in lib/ats/company-seed.ts, and upserts them into
 * the Job table.
 *
 * Usage: npx tsx scripts/seed-solar-jobs.ts
 */

import { PrismaClient } from '@prisma/client';
import { LEVER_COMPANIES, PINPOINT_COMPANIES } from '../lib/ats/company-seed';
import { fetchLeverJobs, type NormalizedJob } from '../lib/ats/lever';
import { fetchPinpointJobs } from '../lib/ats/pinpoint';

const prisma = new PrismaClient();

const EXPIRES_IN_DAYS = 45;
// Direct-employer ATS sources are higher trust/freshness than the
// aggregated CareerJet/Jooble/Lensa feeds — lower number = higher priority
// (matches the existing sourcePriority convention).
const SOURCE_PRIORITY = 1;

async function upsertJob(job: NormalizedJob): Promise<'created' | 'updated'> {
  const existing = await prisma.job.findFirst({
    where: { url: job.url, source: job.source },
  });

  const expiresAt = new Date(Date.now() + EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

  if (existing) {
    await prisma.job.update({
      where: { id: existing.id },
      data: {
        title: job.title,
        company: job.company,
        location: job.location,
        addressRegion: job.addressRegion,
        description: job.description,
        applyUrl: job.applyUrl,
        contractType: job.contractType,
        postedAt: job.postedAt,
        salary: job.salary,
        active: true,
        expiresAt,
        fetchedAt: new Date(),
      },
    });
    return 'updated';
  }

  await prisma.job.create({
    data: {
      source: job.source,
      title: job.title,
      company: job.company,
      location: job.location,
      addressRegion: job.addressRegion,
      description: job.description,
      url: job.url,
      applyUrl: job.applyUrl,
      contractType: job.contractType,
      postedAt: job.postedAt,
      salary: job.salary,
      sourcePriority: SOURCE_PRIORITY,
      expiresAt,
      needsHeaderImage: true,
      seoDescriptionVersion: 0,
    },
  });
  return 'created';
}

async function main() {
  let created = 0;
  let updated = 0;

  for (const company of LEVER_COMPANIES) {
    console.log(`[lever] fetching ${company.slug}...`);
    const jobs = await fetchLeverJobs(company);
    console.log(`[lever] ${company.slug}: ${jobs.length} solar installer role(s) matched`);
    for (const job of jobs) {
      const result = await upsertJob(job);
      result === 'created' ? created++ : updated++;
    }
  }

  for (const company of PINPOINT_COMPANIES) {
    console.log(`[pinpoint] fetching ${company.slug}...`);
    const jobs = await fetchPinpointJobs(company);
    console.log(`[pinpoint] ${company.slug}: ${jobs.length} solar installer role(s) matched`);
    for (const job of jobs) {
      const result = await upsertJob(job);
      result === 'created' ? created++ : updated++;
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});