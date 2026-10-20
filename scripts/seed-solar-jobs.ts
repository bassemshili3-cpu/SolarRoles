// scripts/seed-solar-jobs.ts
/**
 * Pulls solar-installer-relevant jobs from ATS providers by default and
 * upserts them into the Job table. Custom scraping requires an explicit
 * custom-scrape provider argument.
 *
 * Usage:
 *   npm run seed:new-sources       # seed only the newly added companies
 *   npm run dry-run:new-sources    # fetch and classify them without DB writes
 *   npm run seed:new-30-sources    # seed only the latest group of 30 companies
 *   npm run seed:new-34-sources    # seed only the latest group of 34 companies
 *   npm run seed:new-98-sources    # seed only the latest group of 98 companies
 *   npm run seed:new-ats-2026-09-19 # seed only sources added from the September 19 request
 * Custom scrape only: npx tsx -r dotenv/config scripts/seed-solar-jobs.ts custom-scrape
 */ 
import { PrismaClient } from '@prisma/client';
import { isJobTooOld, sourcePostedAt } from '../lib/jobRetention';
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
  WORKABLE_COMPANIES,
  HRMDIRECT_COMPANIES,
  SAASHR_COMPANIES,
  NEW_SOURCE_KEYS_BY_PROVIDER,
  NEW_30_SOURCE_KEYS_BY_PROVIDER,
  NEW_34_SOURCE_KEYS_BY_PROVIDER,
  NEW_98_SOURCE_KEYS_BY_PROVIDER,
  NEW_ATS_2026_09_19_SOURCE_KEYS_BY_PROVIDER,
} from '../lib/ats/company-seed';
import { CUSTOM_SCRAPE_COMPANIES } from '../lib/ats/custom-scrape/config';
import { fetchLeverJobs, type NormalizedJob } from '../lib/ats/lever';
import { fetchPinpointJobs } from '../lib/ats/pinpoint';
import { fetchAshbyJobs } from '../lib/ats/ashby';
import { fetchSmartRecruitersJobs } from '../lib/ats/smartrecruiters';
import { fetchJobviteJobs } from '../lib/ats/jobvite';
import { fetchWorkdayJobs, closeWorkdayBrowser } from '../lib/ats/workday';
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
import { fetchWorkableJobs } from '../lib/ats/workable';
import { fetchHrmDirectJobs } from '../lib/ats/hrmdirect';
import { fetchSaaShrJobs } from '../lib/ats/saashr';
import { isUSJob } from '../lib/ats/geo';
import { extractSolarJobTaxonomy, type JobTaxonomy } from '../lib/jobTaxonomy';
import { buildJobSlug } from '../lib/slugify';
import { pathToFileURL } from 'node:url';
import type { AtsSeedSummary } from '../lib/ats/sync-summary';
import type { AtsCheckpoints, AtsFetchContext } from '../lib/ats/fetch-context';
import { enqueueSeedRewrite } from '../lib/seo/enqueue-seed-rewrite';
import { recoverAtsSource } from '../lib/ats/source-recovery';
import { recoverConfiguredAtsSource } from '../lib/ats/source-migrations';


const EXPIRES_IN_DAYS = 45;
const CUSTOM_SCRAPE_EXPIRES_IN_DAYS = 7;
// ATS and custom-scrape offers come first in every listing.
const SOURCE_PRIORITY = 0;

type AtsProvider<T> = {
  name: string;
  companies: T[];
  fetch: (company: T, context?: AtsFetchContext) => Promise<NormalizedJob[]>;
  label: (company: T) => string;
};

function provider<T>(
  name: string,
  companies: T[],
  fetch: (company: T, context?: AtsFetchContext) => Promise<NormalizedJob[]>,
  label: (company: T) => string,
): AtsProvider<T> {
  return { name, companies, fetch: async (company, context) =>
    await recoverConfiguredAtsSource(name, company as { name: string; slug?: string })
      ?? await recoverAtsSource(name, company as { name: string; slug?: string }, context) ?? await fetch(company, context), label };
}

const PROVIDERS: AtsProvider<any>[] = [
  provider('jazzhr',          JAZZHR_COMPANIES,          fetchJazzHrJobs,          (c) => c.slug),
  provider('breezy',          BREEZY_COMPANIES,          fetchBreezyJobs,          (c) => c.slug),
  provider('workable',        WORKABLE_COMPANIES,        fetchWorkableJobs,        (c) => c.slug),
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

export function getAtsSyncTasks() {
  // Legacy verified flags are informational. Observe every configured ATS source.
  return PROVIDERS.filter((item) => item.name !== 'custom-scrape').flatMap((item) =>
    item.companies.map((company, companyIndex) => ({ providerName: item.name, companyIndex, label: item.label(company) })),
  );
}

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


import { normalizeWorkSetting } from '../lib/workSetting';
import { normalizeSourceFields } from '../lib/ats/normalizeSourceFields';

async function upsertJob(prisma: PrismaClient, job: NormalizedJob, taxonomy: JobTaxonomy, newOnly: boolean, enqueueRewrite = false): Promise<'created' | 'updated' | 'skipped' | 'existing'> {
  // Serialize check/create for a URL across background retries and overlapping
  // invocations. Known offers remain unchanged; new offers may enqueue an SEO task.
  if (newOnly) {
    return prisma.$transaction(async (tx) => {
      const key = JSON.stringify([job.source, job.url]);
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))::text`;
      const existing = await tx.job.findFirst({ where: { url: job.url, source: job.source }, select: { id: true } });
      if (existing) return 'existing';
      // Reuse the creation path with this transaction's client.
      return upsertJob(tx as unknown as PrismaClient, job, taxonomy, false, enqueueRewrite);
    }, { timeout: 30000 });
  }
  const existing = await prisma.job.findFirst({
    where: { url: job.url, source: job.source },
  });
  const postedAt = sourcePostedAt(job);
  if (isJobTooOld(postedAt) || (!postedAt && isJobTooOld(existing?.postedAt))) return 'skipped';

  const expiresInDays = job.source === 'custom-scrape' ? CUSTOM_SCRAPE_EXPIRES_IN_DAYS : EXPIRES_IN_DAYS;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const taxonomyFields = {
    specialty: taxonomy.specialty,
    occupationalCategory: taxonomy.occupationalCategory,
    skills: taxonomy.skills,
    workSetting: normalizeWorkSetting(job),
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
        // First discovery is not publication. Leave estimates undated and
        // retain a known source date only when the source omits it this time.
        postedAt: job.postedAtEstimated ? null : (postedAt ?? existing.postedAt),
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
      postedAt,
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
  if (enqueueRewrite) await enqueueSeedRewrite(prisma, createdJob.id);
  return 'created';
}

export async function runAtsSeed(options: { providerName?: string; companyIndex?: number; newOnly?: boolean; dryRun?: boolean; enqueueSeoRewrite?: boolean; checkpoints?: AtsCheckpoints; onProgress?: (summary: AtsSeedSummary) => void } = {}): Promise<AtsSeedSummary> {
  const requestedProvider = options.providerName;
  const dryRun = options.dryRun ?? false;
  const newOnly = options.newOnly ?? false;
  const syncNow = new Date();
  const syncCutoff = new Date(syncNow.getTime() - 14 * 86_400_000);
  const prisma = new PrismaClient();
  let created = 0;
  let updated = 0;
  let matched = 0;
  let skippedNonUS = 0;
  let skippedOld = 0;
  let skippedExisting = 0;
  let skippedPublicationWindow = 0;
  let skippedMissingPublication = 0;
  let skippedOutsidePublicationWindow = 0;
  let failedCompanies = 0;
  let companiesAttempted = 0;
  let companiesCompleted = 0;
  let received = 0;
  let phase: AtsSeedSummary['phase'] = 'loading_existing';
  const snapshot = (): AtsSeedSummary => ({ newOnly, providerName: requestedProvider, phase, companiesAttempted,
    companiesCompleted, received, matched, created, updated, skippedNonUS, skippedOld, skippedExisting,
    skippedPublicationWindow, skippedMissingPublication, skippedOutsidePublicationWindow, failedCompanies });
  const progress = () => options.onProgress?.(snapshot());
  try {
  progress();

  const providers = requestedProvider === 'new-sources'
    ? selectSourceProviders(NEW_SOURCE_KEYS_BY_PROVIDER, 'New-source')
    : requestedProvider === 'new-30-sources'
      ? selectSourceProviders(NEW_30_SOURCE_KEYS_BY_PROVIDER, 'New-30-source')
    : requestedProvider === 'new-34-sources'
      ? selectSourceProviders(NEW_34_SOURCE_KEYS_BY_PROVIDER, 'New-34-source')
    : requestedProvider === 'new-98-sources'
      ? selectSourceProviders(NEW_98_SOURCE_KEYS_BY_PROVIDER, 'New-98-source')
    : requestedProvider === 'new-ats-2026-09-19'
      ? selectSourceProviders(NEW_ATS_2026_09_19_SOURCE_KEYS_BY_PROVIDER, 'New-ATS-2026-09-19')
    : requestedProvider
      ? PROVIDERS.filter((provider) => provider.name === requestedProvider)
      : PROVIDERS.filter((provider) => provider.name !== 'custom-scrape');

  if (requestedProvider && providers.length === 0) {
    throw new Error(`Unknown provider "${requestedProvider}". Available providers: new-sources, new-30-sources, new-34-sources, new-98-sources, new-ats-2026-09-19, ${PROVIDERS.map((provider) => provider.name).join(', ')}`);
  }

  if (options.companyIndex !== undefined) {
    if (providers.length !== 1 || !Number.isInteger(options.companyIndex) || options.companyIndex < 0 || options.companyIndex >= providers[0].companies.length) {
      throw new Error('Invalid ATS company index');
    }
    providers[0] = { ...providers[0], companies: [providers[0].companies[options.companyIndex]] };
  }

  const jobKey = (job: { source: string; url: string }) => JSON.stringify([job.source, job.url]);
  const knownJobs = new Set<string>();
  if (newOnly) {
    const existingJobs = await prisma.job.findMany({
      where: { source: { in: providers.map((item) => item.name) } },
      select: { source: true, url: true },
    });
    for (const job of existingJobs) knownJobs.add(jobKey(job));
  }

  for (const provider of providers) {
    for (const company of provider.companies) {
      const label = provider.label(company);
      companiesAttempted++;
      phase = 'fetching'; progress();
      console.log(`[${provider.name}] fetching ${label}...`);
      let jobs: NormalizedJob[];
      const checkpointKey = `${provider.name}/${encodeURIComponent(label + (company.host ? `@${company.host}` : ''))}`;
      let stagedCursor: unknown;
      try {
        const fetchContext: AtsFetchContext | undefined = options.checkpoints ? {
          deadline: Date.now() + 8 * 60_000,
          cursor: await options.checkpoints.load(checkpointKey),
          isKnown: (source, url) => newOnly && knownJobs.has(jobKey({ source, url })),
          checkpoint: cursor => { stagedCursor = cursor; },
        } : undefined;
        jobs = await provider.fetch(company, fetchContext);
      } catch (error) {
        if (!newOnly) throw error;
        failedCompanies++;
        console.error(`[${provider.name}] ${label}: fetch failed`, error);
        continue;
      }
      console.log(`[${provider.name}] ${label}: ${jobs.length} solar installer role(s) matched`);
      received += jobs.length;
      phase = 'processing'; progress();
      for (const rawJob of jobs) {
        progress();
        if (newOnly && knownJobs.has(jobKey(rawJob))) { skippedExisting++; continue; }
        const job = normalizeSourceFields(rawJob);
        // Incremental discovery requires a genuine publication under 14 days old.
        // The manual update mode keeps its existing two-month retention policy.
        const postedAt = sourcePostedAt(job);
        if (newOnly && (!postedAt || postedAt <= syncCutoff || postedAt > syncNow)) {
          skippedPublicationWindow++;
          if (!postedAt) skippedMissingPublication++;
          else skippedOutsidePublicationWindow++;
          continue;
        }
        if (isJobTooOld(sourcePostedAt(job))) { skippedOld++; continue; }
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
          if (newOnly) knownJobs.add(jobKey(job));
          console.log(`  ↳ dry-run: ${job.title} — ${job.location}`);
          continue;
        }
        const result = await upsertJob(prisma, job, taxonomy, newOnly, newOnly && options.enqueueSeoRewrite === true);
        if (result === 'created') created++;
        else if (result === 'updated') updated++;
        else if (result === 'existing') skippedExisting++;
        else skippedOld++;
        if (newOnly && (result === 'created' || result === 'existing')) knownJobs.add(jobKey(job));
      }
      // A failed insert never advances the source cursor. Replaying is insert-only.
      if (!dryRun && stagedCursor !== undefined) await options.checkpoints!.save(checkpointKey, stagedCursor);
      companiesCompleted++; progress();
    }
  }

  console.log(`\nDone${dryRun ? ' (dry-run)' : ''}. Matched: ${matched}, Created: ${created}, Updated: ${updated}, Skipped (non-US): ${skippedNonUS}, Skipped (older than two months): ${skippedOld}`);
  console.log(JSON.stringify(snapshot()));
  if (failedCompanies > 0) throw new Error(`${failedCompanies} ATS employer fetch(es) failed`);
  phase = 'complete'; progress();
  return snapshot();
  } finally {
    progress();
    try {
      await closeWorkdayBrowser();
    } finally {
      await prisma.$disconnect();
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAtsSeed({
    providerName: process.argv.slice(2).find((arg) => !arg.startsWith('--')),
    dryRun: process.argv.includes('--dry-run'),
    newOnly: process.argv.includes('--new-only'),
  }).catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
