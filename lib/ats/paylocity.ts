import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

export type PaylocityCompanySeed = {
  boardUrl: string;
  name: string;
  verified: boolean;
};

type JobPosting = {
  '@type'?: string;
  title?: string;
  datePosted?: string;
  description?: string;
  employmentType?: string | string[];
  jobLocation?: { address?: { addressLocality?: string; addressRegion?: string; addressCountry?: string } };
};

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, { headers: { Accept: 'text/html', 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

function textFromHtml(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
}

function parsePosting(html: string): JobPosting | undefined {
  const dom = cheerio.load(html);
  for (const element of dom('script[type="application/ld+json"]').toArray()) {
    try {
      const value = JSON.parse(dom(element).text()) as JobPosting | JobPosting[];
      const posting = (Array.isArray(value) ? value : [value]).find((entry) => entry?.['@type'] === 'JobPosting');
      if (posting) return posting;
    } catch {
      // Ignore unrelated malformed structured data.
    }
  }
  return undefined;
}

function validDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function fetchPaylocityJobs(company: PaylocityCompanySeed): Promise<NormalizedJob[]> {
  if (!company.verified) return [];

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ userAgent: USER_AGENT });
    let links: string[];
    try {
      await page.goto(company.boardUrl, { waitUntil: 'networkidle', timeout: 30_000 });
      links = [...new Set(await page.locator('a[href]').evaluateAll((anchors) =>
        anchors
          .map((anchor) => (anchor as HTMLAnchorElement).href)
          .filter((href) => /\/recruiting\/jobs\/details\/\d+/i.test(href)),
      ))];
    } finally {
      await page.close();
      await browser.close();
    }
    console.log(`[paylocity] ${company.name}: ${links.length} postes bruts découverts`);

    const results: NormalizedJob[] = [];
    for (const url of links) {
      const posting = parsePosting(await fetchHtml(url));
      if (!posting?.title) continue;
      const description = textFromHtml(posting.description ?? '');
      if (!isSolarInstallerRole(posting.title, description)) continue;
      const address = posting.jobLocation?.address;
      const location = [address?.addressLocality, address?.addressRegion, address?.addressCountry].filter(Boolean).join(', ');
      const externalId = new URL(url).pathname.match(/\/Details\/(\d+)/i)?.[1] ?? url;

      results.push({
        source: 'paylocity',
        externalId,
        title: posting.title,
        company: company.name,
        location,
        addressRegion: extractStateFromLocation(location),
        description,
        url,
        applyUrl: url.replace(/\/Details\//i, '/Apply/'),
        contractType: Array.isArray(posting.employmentType) ? posting.employmentType.join(', ') : posting.employmentType,
        postedAt: validDate(posting.datePosted),
      });
    }

    return results;
  } catch (error) {
    console.warn(`[paylocity] ${company.name}: fetch échoué — ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
