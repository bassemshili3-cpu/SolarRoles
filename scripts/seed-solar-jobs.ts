// scripts/seed-solar-jobs.ts
/**
 * Pulls solar-installer-relevant jobs from Lever, Ashby, SmartRecruiters,
 * and Pinpoint for the companies listed in lib/ats/company-seed.ts, and
 * upserts them into the Job table.
 *
 * Usage: npx tsx -r dotenv/config scripts/seed-solar-jobs.ts
 */
import { PrismaClient } from '@prisma/client';
import { fetchGreenhouseJobs } from '../lib/ats/greenhouse';
import {
  LEVER_COMPANIES, GREENHOUSE_COMPANIES,
  JOBVITE_COMPANIES,
  ASHBY_COMPANIES,
  PINPOINT_COMPANIES,
  SMARTRECRUITERS_COMPANIES,
  RIPPLING_COMPANIES,
  WORKDAY_COMPANIES,
} from '../lib/ats/company-seed';
import { CUSTOM_SCRAPE_COMPANIES } from '../lib/ats/custom-scrape/config';
import { fetchLeverJobs, type NormalizedJob } from '../lib/ats/lever';
import { fetchPinpointJobs } from '../lib/ats/pinpoint';
import { fetchAshbyJobs } from '../lib/ats/ashby';
import { fetchSmartRecruitersJobs } from '../lib/ats/smartrecruiters';
import { fetchJobviteJobs } from '../lib/ats/jobvite';
import { fetchWorkdayJobs } from '../lib/ats/workday';
import { fetchCustomScrapeJobs } from '../lib/ats/custom-scrape';
import { fetchRipplingJobs } from '../lib/ats/rippling';
import { isUSJob } from '../lib/ats/geo';
import { extractSolarJobTaxonomy, type JobTaxonomy } from '../lib/jobTaxonomy';

const prisma = new PrismaClient();

const EXPIRES_IN_DAYS = 45;
const CUSTOM_SCRAPE_EXPIRES_IN_DAYS = 7;
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
  provider('rippling',        RIPPLING_COMPANIES,        fetchRipplingJobs,        (c) => c.slug),
  provider('custom-scrape',   CUSTOM_SCRAPE_COMPANIES,   fetchCustomScrapeJobs,    (c) => c.domain),
];

const requestedProvider = process.argv[2];


async function upsertJob(job: NormalizedJob, taxonomy: JobTaxonomy): Promise<'created' | 'updated'> {
  const existing = await prisma.job.findFirst({
    where: { url: job.url, source: job.source },
  });

  const expiresInDays = job.source === 'custom-scrape' ? CUSTOM_SCRAPE_EXPIRES_IN_DAYS : EXPIRES_IN_DAYS;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const taxonomyFields = {
    specialty: taxonomy.specialty,
    occupationalCategory: taxonomy.occupationalCategory,
    skills: taxonomy.skills,
    experienceLevel: taxonomy.experienceLevel,
  };

  if (existing) {
    const contentChanged =
      existing.title !== job.title ||
      existing.company !== job.company ||
      existing.location !== job.location ||
      existing.addressRegion !== (job.addressRegion ?? '') ||
      existing.description !== job.description ||
      existing.applyUrl !== job.applyUrl ||
      existing.contractType !== job.contractType ||
      existing.salaryMin !== (job.salaryMin ?? null) ||
      existing.salaryMax !== (job.salaryMax ?? null);
    await prisma.job.update({
      where: { id: existing.id },
      data: {
        title: job.title,
        company: job.company,
        location: job.location,
        addressRegion: job.addressRegion,
        locationRegions: job.locationRegions ?? [],
        description: job.description,
        applyUrl: job.applyUrl,
        contractType: job.contractType,
        // Do not renew the apparent publication date at every custom scrape
        // when it was inferred from first discovery. A genuine source date can
        // still replace that fallback if it becomes available later.
        postedAt: job.postedAtEstimated ? (existing.postedAt ?? job.postedAt) : job.postedAt,
        salary: job.salary,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryPeriod: job.salaryPeriod,
        active: true,
        expiresAt,
        fetchedAt: new Date(),
        // Make genuinely changed offers eligible for the next hourly Google
        // batch; a routine scrape with identical content does not reset them.
        ...(contentChanged ? { lastGoogleIndexingSubmittedAt: null } : {}),
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
      locationRegions: job.locationRegions ?? [],
      description: job.description,
      url: job.url,
      applyUrl: job.applyUrl,
      contractType: job.contractType,
      postedAt: job.postedAt,
      salary: job.salary,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryPeriod: job.salaryPeriod,
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

  const providers = requestedProvider
    ? PROVIDERS.filter((provider) => provider.name === requestedProvider)
    : PROVIDERS;

  if (requestedProvider && providers.length === 0) {
    throw new Error(`Unknown provider "${requestedProvider}". Available providers: ${PROVIDERS.map((provider) => provider.name).join(', ')}`);
  }

  for (const provider of providers) {
    for (const company of provider.companies) {
      const label = provider.label(company);
      console.log(`[${provider.name}] fetching ${label}...`);
      const jobs = await provider.fetch(company);
      console.log(`[${provider.name}] ${label}: ${jobs.length} solar installer role(s) matched`);
      for (const job of jobs) {
        // A custom-scrape job is marked isRemote only after its detail page
        // contains both a remote signal and US eligibility. For that bounded
        // case, a bare "Remote" location is safe to retain; ATS jobs keep the
        // stricter physical-US-location requirement.
        if (!isUSJob(job, { allowBareRemote: job.source === 'custom-scrape' && job.isRemote === true })) {
          skippedNonUS++;
          console.log(`  ↳ skipped (non-US): ${job.title} — "${job.location}"`);
          continue;
        }
        const taxonomy = extractSolarJobTaxonomy({ title: job.title, description: job.description });
        if (job.experienceLevel) taxonomy.experienceLevel = job.experienceLevel;
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
