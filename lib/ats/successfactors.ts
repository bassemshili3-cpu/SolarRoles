import * as cheerio from 'cheerio';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

export type SuccessFactorsCompanySeed = {
  baseUrl: string;
  name: string;
  verified: boolean;
  locale: string;
  keywords: string[];
};

function textFromHtml(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
}

function splitFeedTitle(rawTitle: string): { title: string; location: string } {
  const match = rawTitle.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  return match
    ? { title: match[1].trim(), location: match[2].trim() }
    : { title: rawTitle.trim(), location: '' };
}

function canonicalJobUrl(rawUrl: string): string | undefined {
  try {
    const url = new URL(rawUrl);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return undefined;
  }
}

function externalIdFromUrl(url: string): string | undefined {
  return new URL(url).pathname.match(/\/(\d+)\/?$/)?.[1];
}

function validDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseSuccessFactorsRss(
  xml: string,
  company: SuccessFactorsCompanySeed,
): NormalizedJob[] {
  const dom = cheerio.load(xml, { xmlMode: true });
  const jobs = new Map<string, NormalizedJob>();

  dom('item').each((_, element) => {
    const item = dom(element);
    const { title, location } = splitFeedTitle(item.find('title').text());
    const description = textFromHtml(item.find('description').text());
    const url = canonicalJobUrl(item.find('link').text().trim());
    if (!title || !description || !url || !isSolarInstallerRole(title, description)) return;

    const externalId = externalIdFromUrl(url);
    if (!externalId) return;

    jobs.set(url, {
      source: 'successfactors',
      externalId,
      title,
      company: company.name,
      location,
      addressRegion: extractStateFromLocation(location),
      description,
      url,
      applyUrl: url,
      postedAt: validDate(item.find('pubDate').text().trim()),
    });
  });

  return [...jobs.values()];
}

export async function fetchSuccessFactorsJobs(
  company: SuccessFactorsCompanySeed,
): Promise<NormalizedJob[]> {
  if (!company.verified) {
    console.warn(`[successfactors] ${company.name}: unverified seed, skipping`);
    return [];
  }

  const jobs = new Map<string, NormalizedJob>();
  for (const keyword of company.keywords) {
    const feedUrl = new URL('/services/rss/job/', company.baseUrl);
    feedUrl.searchParams.set('locale', company.locale);
    feedUrl.searchParams.set('keywords', `(${keyword})`);

    try {
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/rss+xml,application/xml,text/xml',
        },
      });
      if (!response.ok) {
        console.warn(`[successfactors] ${company.name} "${keyword}": HTTP ${response.status}, skipping`);
        continue;
      }

      const parsed = parseSuccessFactorsRss(await response.text(), company);
      console.log(`[successfactors] ${company.name} "${keyword}": ${parsed.length} relevant role(s)`);
      for (const job of parsed) jobs.set(job.url, job);
    } catch (error) {
      console.warn(
        `[successfactors] ${company.name} "${keyword}": ${error instanceof Error ? error.message : String(error)}, skipping`,
      );
    }
  }

  return [...jobs.values()];
}
