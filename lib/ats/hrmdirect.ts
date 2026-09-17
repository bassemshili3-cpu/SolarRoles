import * as cheerio from 'cheerio';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isGenericInstallerTitle, isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

export type HrmDirectCompanySeed = {
  subdomain: string;
  name: string;
  verified: boolean;
};

type Listing = {
  externalId: string;
  title: string;
  location: string;
  url: string;
};

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function parseHrmDirectListings(html: string, company: HrmDirectCompanySeed): Listing[] {
  const dom = cheerio.load(html);
  const baseUrl = `https://${company.subdomain}.hrmdirect.com/employment/`;
  const listings: Listing[] = [];

  dom('tr[data-req-id]').each((_, element) => {
    const row = dom(element);
    const externalId = row.attr('data-req-id')?.trim() ?? '';
    const title = cleanText(row.find('.posTitle').text());
    const city = cleanText(row.find('.cities').text());
    const state = cleanText(row.find('.state').text());
    const href = row.find('.posTitle a').attr('href');
    if (!externalId || !title || !href) return;

    listings.push({
      externalId,
      title,
      location: [city, state].filter(Boolean).join(', '),
      url: new URL(href.replace(/&amp;/g, '&'), baseUrl).toString(),
    });
  });

  return listings;
}

export function parseHrmDirectDetail(
  html: string,
  listing: Listing,
  company: HrmDirectCompanySeed,
): NormalizedJob | undefined {
  const dom = cheerio.load(html);
  const title = cleanText(dom('h2').first().text()) || listing.title;
  const description = cleanText(dom('.jobDesc').text());
  const fields = new Map<string, string>();
  dom('table.viewFields tr').each((_, element) => {
    const cells = dom(element).find('td');
    const key = cleanText(cells.eq(0).text()).replace(/:$/, '').toLowerCase();
    const value = cleanText(cells.eq(1).text());
    if (key && value) fields.set(key, value);
  });
  const location = fields.get('location') || listing.location;

  if (!description || !isSolarInstallerRole(title, description)) return undefined;

  return {
    source: 'hrmdirect',
    externalId: listing.externalId,
    title,
    company: company.name,
    location,
    addressRegion: extractStateFromLocation(location),
    description,
    url: listing.url,
    applyUrl: listing.url,
  };
}

export async function fetchHrmDirectJobs(company: HrmDirectCompanySeed): Promise<NormalizedJob[]> {
  if (!company.verified) return [];

  const listUrl = `https://${company.subdomain}.hrmdirect.com/employment/job-openings.php?search=true`;
  const response = await fetch(listUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) {
    console.warn(`[hrmdirect] ${company.name}: HTTP ${response.status}, skipping`);
    return [];
  }

  const candidates = parseHrmDirectListings(await response.text(), company).filter(
    (job) => isSolarInstallerRole(job.title) || isGenericInstallerTitle(job.title),
  );
  const jobs: NormalizedJob[] = [];

  for (const listing of candidates) {
    try {
      const detailResponse = await fetch(listing.url, { headers: { 'User-Agent': USER_AGENT } });
      if (!detailResponse.ok) continue;
      const job = parseHrmDirectDetail(await detailResponse.text(), listing, company);
      if (job) jobs.push(job);
    } catch (error) {
      console.warn(
        `[hrmdirect] ${company.name}: ${listing.externalId} skipped — ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return jobs;
}
