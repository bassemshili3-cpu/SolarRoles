/**
 * Pulls solar-installer-relevant jobs from Lever, Ashby, SmartRecruiters,
 * and Pinpoint for the companies listed in lib/ats/company-seed.ts, and
 * upserts them into the Job table.
 *
 * Usage: npx tsx scripts/seed-solar-jobs.ts
 */

import { PrismaClient } from '@prisma/client';
import { fetchGreenhouseJobs } from '../lib/ats/greenhouse';
import {
  LEVER_COMPANIES, GREENHOUSE_COMPANIES,
  JOBVITE_COMPANIES,
  ASHBY_COMPANIES,
  SMARTRECRUITERS_COMPANIES,
} from '../lib/ats/company-seed';
import { fetchLeverJobs, type NormalizedJob } from '../lib/ats/lever';
import { fetchPinpointJobs } from '../lib/ats/pinpoint';
import { fetchAshbyJobs } from '../lib/ats/ashby';
import { fetchSmartRecruitersJobs } from '../lib/ats/smartrecruiters';
import { fetchJobviteJobs } from '../lib/ats/jobvite';

const prisma = new PrismaClient();

const EXPIRES_IN_DAYS = 45;
const SOURCE_PRIORITY = 1;

type AtsProvider = {
  name: string;
  companies: typeof LEVER_COMPANIES;
  fetch: (company: typeof LEVER_COMPANIES[number]) => Promise<NormalizedJob[]>;
};

const PROVIDERS: AtsProvider[] = [
  { name: 'lever',            companies: LEVER_COMPANIES,            fetch: fetchLeverJobs },
  { name: 'ashby',            companies: ASHBY_COMPANIES,            fetch: fetchAshbyJobs },
  { name: 'smartrecruiters',  companies: SMARTRECRUITERS_COMPANIES,  fetch: fetchSmartRecruitersJobs },
  { name: 'jobvite',          companies: JOBVITE_COMPANIES,          fetch: fetchJobviteJobs },
{ name: 'greenhouse',       companies: GREENHOUSE_COMPANIES,       fetch: fetchGreenhouseJobs },
];

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

  for (const provider of PROVIDERS) {
    for (const company of provider.companies) {
      console.log(`[${provider.name}] fetching ${company.slug}...`);
      const jobs = await provider.fetch(company);
      console.log(`[${provider.name}] ${company.slug}: ${jobs.length} solar installer role(s) matched`);
      for (const job of jobs) {
        const result = await upsertJob(job);
        result === 'created' ? created++ : updated++;
      }
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