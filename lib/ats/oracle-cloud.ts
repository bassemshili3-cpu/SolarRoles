import * as cheerio from 'cheerio';
import { launchAtsBrowser } from './browser';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isGenericInstallerTitle, isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';
import { sourcePublicationDate } from './publicationDate';
import { structuredSalary, textBaseSalary } from './salaryFields';

export interface OracleCloudCompanySeed {
  baseUrl: string;
  name: string;
  verified: boolean;
}

interface OracleAddress {
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string | { name?: string };
}

interface OracleJobPosting {
  '@type'?: string;
  title?: string;
  datePosted?: string;
  baseSalary?: unknown;
  employmentType?: string | string[];
  description?: string;
  url?: string;
  jobLocation?: { address?: OracleAddress } | Array<{ address?: OracleAddress }>;
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function stripHtml(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
}

export function parseOracleJobPosting(raw: string): OracleJobPosting | undefined {
  try {
    const value = JSON.parse(raw) as OracleJobPosting | OracleJobPosting[];
    const entries = Array.isArray(value) ? value : [value];
    return entries.find((entry) => entry?.['@type'] === 'JobPosting');
  } catch {
    return undefined;
  }
}

function normalizeLocation(job: OracleJobPosting): string {
  const locations = Array.isArray(job.jobLocation)
    ? job.jobLocation
    : job.jobLocation
      ? [job.jobLocation]
      : [];
  const address = locations.map((location) => location.address).find(Boolean);
  if (!address) return '';

  const country = typeof address.addressCountry === 'string'
    ? address.addressCountry
    : address.addressCountry?.name;
  return [address.addressLocality, address.addressRegion, country]
    .filter(Boolean)
    .join(', ');
}


export async function fetchOracleCloudJobs(company: OracleCloudCompanySeed): Promise<NormalizedJob[]> {
    const browser = await launchAtsBrowser({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT, locale: 'en-US' });
  const page = await context.newPage();
  const baseUrl = company.baseUrl.replace(/\/$/, '');
  const links = new Map<string, string>();

  try {
    await page.goto(`${baseUrl}/jobs`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.locator('a[href*="/job/"], .no-results').first().waitFor({ state: 'attached', timeout: 20_000 }).catch(() => {});

    let stableRounds = 0;
    let previousSize = -1;
    for (let attempt = 0; attempt < 12 && stableRounds < 3; attempt++) {
      const currentLinks = await page.locator('a[href*="/job/"]').evaluateAll((anchors) =>
        anchors.map((anchor) => ({
          url: (anchor as HTMLAnchorElement).href,
          // Current Oracle boards use an empty overlay anchor. Its accessible
          // label points to a sibling containing the visible job title.
          title: (anchor.textContent?.trim()
            || anchor.getAttribute('aria-labelledby')?.split(/\s+/).map(id => document.getElementById(id)?.querySelector('.job-tile__title')?.textContent).filter(Boolean).join(' ')
            || anchor.parentElement?.querySelector('.job-tile__title')?.textContent
            || '').replace(/\s+/g, ' ').trim(),
        })),
      );
      for (const link of currentLinks) {
        if (/\/job\/\d+(?:[/?#]|$)/.test(link.url)) links.set(link.url.split('?')[0], link.title);
      }

      stableRounds = links.size === previousSize ? stableRounds + 1 : 0;
      previousSize = links.size;
      const lastLink = page.locator('a[href*="/job/"]').last();
      if (await lastLink.count()) await lastLink.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1_000);
    }

    console.log(`[oraclecloud] ${company.name}: ${links.size} postes bruts découverts`);
    if (links.size === 0 && !/no (?:open |matching )?(?:jobs|results)|0 open jobs/i.test(await page.locator('body').innerText())) {
      console.warn(`[oraclecloud] ${company.name}: listing not recognized, cannot confirm an empty board`);
    }

    const results: NormalizedJob[] = [];
    for (const [url, listingTitle] of links) {
      // The taxonomy can only accept a title without an explicit solar signal
      // when it belongs to the bounded generic-title fallback list.
      if (!isSolarInstallerRole(listingTitle) && !isGenericInstallerTitle(listingTitle)) continue;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.locator('script[type="application/ld+json"]').first().waitFor({
          state: 'attached',
          timeout: 5_000,
        });
        const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
        const posting = scripts.map(parseOracleJobPosting).find(Boolean);
        if (!posting?.title) continue;

        const description = stripHtml(posting.description ?? '');
        if (!isSolarInstallerRole(posting.title, description)) continue;

        const location = normalizeLocation(posting);
        results.push({
          source: 'oraclecloud',
          externalId: new URL(url).pathname.split('/').filter(Boolean).at(-1) ?? url,
          title: posting.title,
          company: company.name,
          location,
          addressRegion: extractStateFromLocation(location),
          description,
          url,
          applyUrl: url,
          contractType: Array.isArray(posting.employmentType)
            ? posting.employmentType.join(', ')
            : posting.employmentType,
          postedAt: sourcePublicationDate(posting, 'oraclecloud'),
          ...(structuredSalary(posting.baseSalary) ?? textBaseSalary(description)),
        });
      } catch (error) {
        console.warn(`[oraclecloud] ${company.name}: détail ignoré (${url}) — ${(error as Error).message}`);
      }
    }

    return results;
  } catch (error) {
    console.warn(`[oraclecloud] ${company.name}: fetch échoué — ${(error as Error).message}`);
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}
