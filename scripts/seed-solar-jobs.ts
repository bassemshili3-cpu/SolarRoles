// scripts/seed-solar-jobs.ts
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
  PINPOINT_COMPANIES,
  SMARTRECRUITERS_COMPANIES,
  WORKDAY_COMPANIES,
} from '../lib/ats/company-seed';
import { fetchLeverJobs, type NormalizedJob } from '../lib/ats/lever';
import { fetchPinpointJobs } from '../lib/ats/pinpoint';
import { fetchAshbyJobs } from '../lib/ats/ashby';
import { fetchSmartRecruitersJobs } from '../lib/ats/smartrecruiters';
import { fetchJobviteJobs } from '../lib/ats/jobvite';
import { fetchWorkdayJobs } from '../lib/ats/workday';
import { isUSJob } from '../lib/ats/geo';
import { extractSolarJobTaxonomy, type JobTaxonomy } from '../lib/jobTaxonomy';

const prisma = new PrismaClient();

const EXPIRES_IN_DAYS = 45;
const SOURCE_PRIORITY = 1;

type AtsProvider<T> = {
  name: string;
  companies: T[];
  fetch: (company: T) => Promise<NormalizedJob[]>;
  label: (company: T) => string;
};

function provider<T>(
  name: string,
  companies: T[],
  fetch: (company: T) => Promise<NormalizedJob[]>,
  label: (company: T) => string,
): AtsProvider<T> {
  return { name, companies, fetch, label };
}

const PROVIDERS: AtsProvider<any>[] = [
  provider('lever',           LEVER_COMPANIES,           fetchLeverJobs,           (c) => c.slug),
  provider('ashby',           ASHBY_COMPANIES,           fetchAshbyJobs,           (c) => c.slug),
  provider('smartrecruiters', SMARTRECRUITERS_COMPANIES, fetchSmartRecruitersJobs, (c) => c.slug),
  provider('jobvite',         JOBVITE_COMPANIES,         fetchJobviteJobs,         (c) => c.slug),
  provider('greenhouse',      GREENHOUSE_COMPANIES,      fetchGreenhouseJobs,      (c) => c.slug),
  provider('pinpoint',        PINPOINT_COMPANIES,        fetchPinpointJobs,        (c) => c.slug),
  provider('workday',         WORKDAY_COMPANIES,         fetchWorkdayJobs,         (c) => `${c.tenant}/${c.site}`),
];


async function upsertJob(job: NormalizedJob, taxonomy: JobTaxonomy): Promise<'created' | 'updated'> {
  const existing = await prisma.job.findFirst({
    where: { url: job.url, source: job.source },
  });

  const expiresAt = new Date(Date.now() + EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

  const taxonomyFields = {
    specialty: taxonomy.specialty,
    occupationalCategory: taxonomy.occupationalCategory,
    skills: taxonomy.skills,
    experienceLevel: taxonomy.experienceLevel,
  };

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
        ...taxonomyFields,
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
      ...taxonomyFields,
    },
  });
  return 'created';
}

async function main() {
  let created = 0;
  let updated = 0;
  let skippedNonUS = 0;

  for (const provider of PROVIDERS) {
    for (const company of provider.companies) {
      const label = provider.label(company);
      console.log(`[${provider.name}] fetching ${label}...`);
      const jobs = await provider.fetch(company);
      console.log(`[${provider.name}] ${label}: ${jobs.length} solar installer role(s) matched`);
      for (const job of jobs) {
        if (!isUSJob(job, { allowBareRemote: false })) {
          skippedNonUS++;
          console.log(`  ↳ skipped (non-US): ${job.title} — "${job.location}"`);
          continue;
        }
        const taxonomy = extractSolarJobTaxonomy({ title: job.title, description: job.description });
        const result = await upsertJob(job, taxonomy);
        result === 'created' ? created++ : updated++;
      }
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}, Skipped (non-US): ${skippedNonUS}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});