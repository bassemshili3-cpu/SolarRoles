import { createHash } from 'node:crypto';
import { isSolarInstallerRole } from '../solar-taxonomy';
import type { NormalizedJob } from '../types';
import { discoverJobLinks, discoverNextPageUrl } from './discover';
import { extractJobDetail } from './detail';
import type { CustomScrapeOutcome, CustomScrapeOutcomeCounts, CustomScrapeSeed, GoogleJobPosting } from './types';

export * from './types';
export { discoverJobLinks } from './discover';
export { discoverNextPageUrl } from './discover';
export { extractJobDetail } from './detail';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';
const MIN_DESCRIPTION_LENGTH = 60;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const DOMAIN_DELAY_MS = 1_250;
const DEFAULT_MAX_LISTING_PAGES = 10;
const lastRequestAt = new Map<string, number>();

export type CustomScrapeDiagnostic = {
  url: string;
  title: string;
  outcome: CustomScrapeOutcome;
  missingFields?: string[];
  location?: string;
  employmentType?: string;
  descriptionLength?: number;
};
export type CustomScrapeRun = { jobs: NormalizedJob[]; outcomes: CustomScrapeOutcomeCounts; googleJobs: GoogleJobPosting[]; diagnostics: CustomScrapeDiagnostic[] };

function emptyOutcomes(): CustomScrapeOutcomeCounts {
  return { extracted: 0, filtered_role: 0, filtered_length: 0, missing_required_fields: 0, not_job_page: 0, error: 0, skipped_robots: 0, skipped_unverified: 0 };
}
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function rateLimit(url: string) {
  const hostname = new URL(url).hostname;
  const elapsed = Date.now() - (lastRequestAt.get(hostname) ?? 0);
  if (elapsed < DOMAIN_DELAY_MS) await sleep(DOMAIN_DELAY_MS - elapsed);
  lastRequestAt.set(hostname, Date.now());
}

async function fetchText(url: string): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await rateLimit(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' }, signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS - 1) await sleep(500 * 2 ** attempt);
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

/**
 * Browser fallback for sites whose job cards only appear after pressing a
 * configured "See more" button. This is deliberately opt-in per domain.
 */
async function fetchListingAfterLoadMore(seed: CustomScrapeSeed): Promise<string> {
  if (!seed.selectors?.loadMore) return fetchText(seed.careersUrl);
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ userAgent: USER_AGENT });
    await page.goto(seed.careersUrl, { waitUntil: 'networkidle', timeout: REQUEST_TIMEOUT_MS });
    const maxClicks = Math.max(0, (seed.maxListingPages ?? DEFAULT_MAX_LISTING_PAGES) - 1);
    for (let click = 0; click < maxClicks; click++) {
      const button = page.locator(seed.selectors.loadMore).first();
      if (!(await button.isVisible().catch(() => false))) break;
      await button.click();
      await sleep(DOMAIN_DELAY_MS);
      await page.waitForLoadState('networkidle', { timeout: REQUEST_TIMEOUT_MS }).catch(() => undefined);
    }
    return await page.content();
  } finally {
    await browser.close();
  }
}

/** Minimal robots.txt evaluator for Allow/Disallow rules applying to this crawler. */
export function isAllowedByRobots(robots: string, url: string): boolean {
  const path = new URL(url).pathname || '/';
  const sections = robots.replace(/\r/g, '').split(/\n\s*\n/);
  const matching = sections.filter((section) => /user-agent\s*:\s*(\*|solarroles)/i.test(section));
  const rules = matching.flatMap((section) => section.split('\n').map((line) => line.match(/^\s*(allow|disallow)\s*:\s*(\S*)/i)).filter(Boolean) as RegExpMatchArray[]);
  let winner: { length: number; allow: boolean } | undefined;
  for (const rule of rules) {
    const value = rule[2];
    if (!value || !path.startsWith(value)) continue;
    if (!winner || value.length >= winner.length) winner = { length: value.length, allow: rule[1].toLowerCase() === 'allow' };
  }
  return winner?.allow ?? true;
}

async function permitted(seed: CustomScrapeSeed, url: string): Promise<boolean> {
  const robotsUrl = new URL('/robots.txt', `https://${seed.domain}`).href;
  try {
    return isAllowedByRobots(await fetchText(robotsUrl), url);
  } catch (error) {
    console.warn(`[custom-scrape] ${seed.domain}: could not read robots.txt (${error instanceof Error ? error.message : String(error)}), skipping`);
    return false;
  }
}

export function buildGoogleJobPosting(job: NormalizedJob, locality: string | undefined): GoogleJobPosting | undefined {
  if (!job.title || !job.description || !job.postedAt || !job.company || !locality || !job.addressRegion || !job.contractType) return undefined;
  const validThrough = new Date(job.postedAt);
  validThrough.setDate(validThrough.getDate() + 90);
  return {
    title: job.title, description: job.description, datePosted: job.postedAt.toISOString(), validThrough: validThrough.toISOString(),
    hiringOrganization: { name: job.company }, jobLocation: { address: { addressLocality: locality, addressRegion: job.addressRegion } }, employmentType: job.contractType,
    ...(job.salary ? { baseSalary: job.salary } : {}),
  };
}

function missingGoogleFields(job: NormalizedJob, locality: string | undefined): string[] {
  return [
    !job.title && 'title', !job.description && 'description', !job.postedAt && 'datePosted', !job.company && 'hiringOrganization.name',
    !locality && 'jobLocation.address.addressLocality', !job.addressRegion && 'jobLocation.address.addressRegion', !job.contractType && 'employmentType',
  ].filter(Boolean) as string[];
}

/** Runs discovery and extraction only. It never writes to the database. */
export async function runCustomScrape(seed: CustomScrapeSeed, options: { allowUnverified?: boolean } = {}): Promise<CustomScrapeRun> {
  const outcomes = emptyOutcomes();
  const jobs: NormalizedJob[] = [];
  const googleJobs: GoogleJobPosting[] = [];
  const diagnostics: CustomScrapeDiagnostic[] = [];
  if (seed.status !== 'active' && !options.allowUnverified) {
    outcomes.skipped_unverified++;
    return { jobs, outcomes, googleJobs, diagnostics };
  }
  if (!seed.verified && !options.allowUnverified) {
    console.warn(`[custom-scrape] ${seed.domain}: unverified seed; run the dry-run before publishing`);
    outcomes.skipped_unverified++;
    return { jobs, outcomes, googleJobs, diagnostics };
  }
  if (!(await permitted(seed, seed.careersUrl))) {
    outcomes.skipped_robots++;
    return { jobs, outcomes, googleJobs, diagnostics };
  }
  let listingHtml: string;
  try { listingHtml = await fetchListingAfterLoadMore(seed); } catch (error) {
    console.error(`[custom-scrape] ${seed.domain}: listing fetch failed`, error); outcomes.error++; return { jobs, outcomes, googleJobs, diagnostics };
  }
  const linksByUrl = new Map(discoverJobLinks(listingHtml, seed.careersUrl, seed.selectors).map((link) => [link.url, link]));
  const maxPages = seed.maxListingPages ?? DEFAULT_MAX_LISTING_PAGES;
  let pageUrl = seed.careersUrl;
  for (let pageNumber = 1; pageNumber < maxPages && !seed.selectors?.loadMore; pageNumber++) {
    const nextPageUrl = discoverNextPageUrl(listingHtml, pageUrl, seed.selectors);
    if (!nextPageUrl || new URL(nextPageUrl).hostname !== new URL(seed.careersUrl).hostname) break;
    if (!(await permitted(seed, nextPageUrl))) { outcomes.skipped_robots++; break; }
    try {
      await sleep(DOMAIN_DELAY_MS);
      listingHtml = await fetchText(nextPageUrl);
      pageUrl = nextPageUrl;
      for (const link of discoverJobLinks(listingHtml, pageUrl, seed.selectors)) linksByUrl.set(link.url, link);
    } catch (error) {
      console.warn(`[custom-scrape] ${seed.domain}: listing page ${pageNumber + 1} failed`, error);
      outcomes.error++;
      break;
    }
  }
  const links = [...linksByUrl.values()];
  for (const link of links) {
    try {
      if (!(await permitted(seed, link.url))) { outcomes.skipped_robots++; diagnostics.push({ url: link.url, title: link.titleCandidate, outcome: 'skipped_robots' }); continue; }
      const detail = extractJobDetail(await fetchText(link.url), link.url, seed.selectors);
      if (detail.canonicalUrl && detail.canonicalUrl.replace(/\/$/, '') !== link.url.replace(/\/$/, '')) {
        outcomes.not_job_page++;
        diagnostics.push({ url: link.url, title: link.titleCandidate, outcome: 'not_job_page' });
        continue;
      }
      const title = detail.title || link.titleCandidate;
      const job: NormalizedJob = {
        source: 'custom-scrape', externalId: createHash('sha256').update(link.url).digest('hex'), title, company: seed.companyName,
        location: detail.location, addressRegion: detail.addressRegion, description: detail.description, url: link.url, applyUrl: link.url,
        contractType: detail.employmentType, postedAt: detail.postedAt ?? new Date(), salary: detail.salary,
        salaryMin: detail.salaryMin, salaryMax: detail.salaryMax, salaryPeriod: detail.salaryPeriod, experienceLevel: detail.experienceLevel,
      };
      const googleJob = buildGoogleJobPosting(job, detail.addressLocality);
      if (!googleJob) {
        outcomes.missing_required_fields++;
        diagnostics.push({ url: link.url, title: job.title, outcome: 'missing_required_fields', missingFields: missingGoogleFields(job, detail.addressLocality), location: job.location, employmentType: job.contractType, descriptionLength: job.description.length });
        continue;
      }
      // A custom seed is manually curated as a solar employer. This bounded
      // context lets generic field titles (e.g. "Lead Installer") use the
      // taxonomy's existing generic-title + strong-signal path, without
      // weakening matching for the ATS providers.
      const taxonomyDescription = `${job.description}\nCompany context: ${job.company} is a solar installation company.`;
      if (!isSolarInstallerRole(job.title, taxonomyDescription)) {
        outcomes.filtered_role++;
        diagnostics.push({ url: link.url, title: job.title, outcome: 'filtered_role', location: job.location, employmentType: job.contractType, descriptionLength: job.description.length });
        continue;
      }
      if (job.description.length < MIN_DESCRIPTION_LENGTH) {
        outcomes.filtered_length++;
        diagnostics.push({ url: link.url, title: job.title, outcome: 'filtered_length', location: job.location, employmentType: job.contractType, descriptionLength: job.description.length });
        continue;
      }
      jobs.push(job); googleJobs.push(googleJob); outcomes.extracted++;
    } catch (error) {
      console.warn(`[custom-scrape] ${seed.domain}: ${link.url} failed`, error); outcomes.error++;
      diagnostics.push({ url: link.url, title: link.titleCandidate, outcome: 'error' });
    }
  }
  return { jobs, outcomes, googleJobs, diagnostics };
}

/** Production entrypoint: only active, manually verified seeds yield jobs. */
export async function fetchCustomScrapeJobs(seed: CustomScrapeSeed): Promise<NormalizedJob[]> {
  return (await runCustomScrape(seed)).jobs;
}

export async function dryRunCustomScrape(seed: CustomScrapeSeed): Promise<CustomScrapeRun> {
  return runCustomScrape(seed, { allowUnverified: true });
}
