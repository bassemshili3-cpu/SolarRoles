// scripts/seed-solar-jobs.ts
/**
 * Pulls solar-installer-relevant jobs from ATS providers by default and
 * upserts them into the Job table. Custom scraping requires an explicit
 * custom-scrape provider argument.
 *
 * Usage:
 *   npm run seed:new-sources       # seed only the newly added companies
 *   npm run dry-run:new-sources    # fetch and classify them without DB writes
 *   npm run seed:new-34-sources    # seed only the latest group of 34 companies
 *   npm run seed:new-98-sources    # seed only the latest group of 98 companies
 * Custom scrape only: npx tsx -r dotenv/config scripts/seed-solar-jobs.ts custom-scrape
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
  SUCCESSFACTORS_COMPANIES,
  ORACLE_CLOUD_COMPANIES,
  UKG_COMPANIES,
  ICIMS_COMPANIES,
  ADP_COMPANIES,
  PAYLOCITY_COMPANIES,
  PAYCOM_COMPANIES,
  JAZZHR_COMPANIES,
  BREEZY_COMPANIES,
  HRMDIRECT_COMPANIES,
  SAASHR_COMPANIES,
  NEW_SOURCE_KEYS_BY_PROVIDER,
  NEW_34_SOURCE_KEYS_BY_PROVIDER,
  NEW_98_SOURCE_KEYS_BY_PROVIDER,
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
import { fetchSuccessFactorsJobs } from '../lib/ats/successfactors';
import { fetchOracleCloudJobs } from '../lib/ats/oracle-cloud';
import { fetchUkgJobs } from '../lib/ats/ukg';
import { fetchIcimsJobs } from '../lib/ats/icims';
import { fetchAdpJobs } from '../lib/ats/adp';
import { fetchPaylocityJobs } from '../lib/ats/paylocity';
import { fetchPaycomJobs } from '../lib/ats/paycom';
import { fetchJazzHrJobs } from '../lib/ats/jazzhr';
import { fetchBreezyJobs } from '../lib/ats/breezy';
import { fetchHrmDirectJobs } from '../lib/ats/hrmdirect';
import { fetchSaaShrJobs } from '../lib/ats/saashr';
import { isUSJob } from '../lib/ats/geo';
import { extractSolarJobTaxonomy, type JobTaxonomy } from '../lib/jobTaxonomy';
import { buildJobSlug } from '../lib/slugify';

const prisma = new PrismaClient();

const EXPIRES_IN_DAYS = 45;
const CUSTOM_SCRAPE_EXPIRES_IN_DAYS = 7;
// ATS and custom-scrape offers come first in every listing.
const SOURCE_PRIORITY = 0;

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
  provider('jazzhr',          JAZZHR_COMPANIES,          fetchJazzHrJobs,          (c) => c.slug),
  provider('breezy',          BREEZY_COMPANIES,          fetchBreezyJobs,          (c) => c.slug),
  provider('lever',           LEVER_COMPANIES,           fetchLeverJobs,           (c) => c.slug),
  provider('ashby',           ASHBY_COMPANIES,           fetchAshbyJobs,           (c) => c.slug),
  provider('smartrecruiters', SMARTRECRUITERS_COMPANIES, fetchSmartRecruitersJobs, (c) => c.slug),
  provider('jobvite',         JOBVITE_COMPANIES,         fetchJobviteJobs,         (c) => c.slug),
  provider('greenhouse',      GREENHOUSE_COMPANIES,      fetchGreenhouseJobs,      (c) => c.slug),
  provider('pinpoint',        PINPOINT_COMPANIES,        fetchPinpointJobs,        (c) => c.slug),
  provider('workday',         WORKDAY_COMPANIES,         fetchWorkdayJobs,         (c) => `${c.tenant}/${c.site}`),
  provider('rippling',        RIPPLING_COMPANIES,        fetchRipplingJobs,        (c) => c.slug),
  provider('successfactors',  SUCCESSFACTORS_COMPANIES,  fetchSuccessFactorsJobs,  (c) => c.baseUrl),
  provider('oraclecloud',     ORACLE_CLOUD_COMPANIES,     fetchOracleCloudJobs,      (c) => c.baseUrl),
  provider('ukg',             UKG_COMPANIES,              fetchUkgJobs,              (c) => c.baseUrl),
  provider('icims',           ICIMS_COMPANIES,            fetchIcimsJobs,            (c) => c.categoryName ? `${c.baseUrl}#${c.categoryName}` : c.baseUrl),
  provider('adp',             ADP_COMPANIES,               fetchAdpJobs,               (c) => c.cid),
  provider('paylocity',       PAYLOCITY_COMPANIES,         fetchPaylocityJobs,         (c) => c.boardUrl),
  provider('paycom',          PAYCOM_COMPANIES,            fetchPaycomJobs,            (c) => c.clientKey),
  provider('hrmdirect',       HRMDIRECT_COMPANIES,         fetchHrmDirectJobs,         (c) => c.subdomain),
  provider('saashr',          SAASHR_COMPANIES,            fetchSaaShrJobs,            (c) => c.careersUrl),
  provider('custom-scrape',   CUSTOM_SCRAPE_COMPANIES,   fetchCustomScrapeJobs,    (c) => c.domain),
 
];

const requestedProvider = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

function selectSourceProviders(
  sourceKeysByProvider: Readonly<Record<string, readonly string[]>>,
  groupName: string,
): AtsProvider<any>[] {
  const configuredProviders = new Set(Object.keys(sourceKeysByProvider));
  const missingProviders = [...configuredProviders].filter(
    (providerName) => !PROVIDERS.some((item) => item.name === providerName),
  );
  if (missingProviders.length > 0) {
    throw new Error(`${groupName} provider(s) are not registered: ${missingProviders.join(', ')}`);
  }

  return PROVIDERS
    .filter((item) => configuredProviders.has(item.name))
    .map((item) => {
      const requestedKeys = sourceKeysByProvider[item.name];
      const companies = item.companies.filter((company) => requestedKeys.includes(item.label(company)));
      const foundKeys = new Set(companies.map((company) => item.label(company)));
      const missingKeys = requestedKeys.filter((key) => !foundKeys.has(key));
      if (missingKeys.length > 0) {
        throw new Error(`${groupName} ${item.name} source(s) are missing from company-seed.ts: ${missingKeys.join(', ')}`);
      }
      return { ...item, companies };
    });
}


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
        sourcePriority: SOURCE_PRIORITY,
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

  const createdJob = await prisma.job.create({
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

  // Title/location can be corrected by later scrapes. Persist the first slug
  // so the public job URL and its SEO signals never move with those updates.
  await prisma.job.update({
    where: { id: createdJob.id },
    data: { canonicalSlug: buildJobSlug(createdJob) },
  });
  return 'created';
}

async function main() {
  let created = 0;
  let updated = 0;
  let matched = 0;
  let skippedNonUS = 0;

  const providers = requestedProvider === 'new-sources'
    ? selectSourceProviders(NEW_SOURCE_KEYS_BY_PROVIDER, 'New-source')
    : requestedProvider === 'new-34-sources'
      ? selectSourceProviders(NEW_34_SOURCE_KEYS_BY_PROVIDER, 'New-34-source')
    : requestedProvider === 'new-98-sources'
      ? selectSourceProviders(NEW_98_SOURCE_KEYS_BY_PROVIDER, 'New-98-source')
    : requestedProvider
      ? PROVIDERS.filter((provider) => provider.name === requestedProvider)
      : PROVIDERS.filter((provider) => provider.name !== 'custom-scrape');

  if (requestedProvider && providers.length === 0) {
    throw new Error(`Unknown provider "${requestedProvider}". Available providers: new-sources, new-34-sources, new-98-sources, ${PROVIDERS.map((provider) => provider.name).join(', ')}`);
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
        matched++;
        if (dryRun) {
          console.log(`  ↳ dry-run: ${job.title} — ${job.location}`);
          continue;
        }
        const result = await upsertJob(job, taxonomy);
        result === 'created' ? created++ : updated++;
      }
    }
  }

  console.log(`\nDone${dryRun ? ' (dry-run)' : ''}. Matched: ${matched}, Created: ${created}, Updated: ${updated}, Skipped (non-US): ${skippedNonUS}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
