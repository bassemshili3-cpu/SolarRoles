import * as cheerio from 'cheerio';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

export type RipplingRoleFilter = 'solar_taxonomy' | 'handyman_or_hvac_installer' | 'solar_installer' | 'solar_om_or_technician';

export type RipplingCompanySeed = {
  slug: string;
  name: string;
  verified: boolean;
  roleFilter: RipplingRoleFilter;
};

type RipplingListing = {
  id: string;
  name: string;
  url: string;
  locations?: Array<{ name?: string; stateCode?: string }>;
};

type RipplingDetail = {
  uuid?: string;
  name?: string;
  description?: { company?: string };
  workLocations?: string[];
  employmentType?: { id?: string; label?: string };
  createdOn?: string;
  url?: string;
  payRangeDetails?: unknown[];
};

function textFromHtml(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
}

function findListings(value: unknown): RipplingListing[] {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findListings(item);
      if (found.length) return found;
    }
    return [];
  }

  const object = value as Record<string, unknown>;
  if (Array.isArray(object.items) && object.items.every((item) => {
    const candidate = item as Record<string, unknown>;
    return typeof candidate?.id === 'string' && typeof candidate?.name === 'string' && typeof candidate?.url === 'string';
  })) {
    return object.items as RipplingListing[];
  }

  for (const nested of Object.values(object)) {
    const found = findListings(nested);
    if (found.length) return found;
  }
  return [];
}

function matchesRoleFilter(filter: RipplingRoleFilter, title: string, description = ''): boolean {
  switch (filter) {
    case 'handyman_or_hvac_installer':
      return /\bhandyman\b|\bhvac\s+installer\b/i.test(title);
    case 'solar_installer':
      return /\b(?:solar|pv)\b.{0,30}\binstall(?:er|ation)\b|\binstall(?:er|ation)\b.{0,30}\b(?:solar|pv)\b/i.test(title);
    case 'solar_om_or_technician':
      return /\bsolar\s*(?:o\s*&\s*m|o\s*and\s*m|operations?\s*(?:and|&)\s*maintenance|technician)\b|\b(?:solar|pv)\s+(?:field\s+)?tech(?:nician)?\b/i.test(title);
    case 'solar_taxonomy':
      return isSolarInstallerRole(title, description);
  }
}

function nextData(html: string): unknown | undefined {
  const raw = cheerio.load(html)('#__NEXT_DATA__').text();
  if (!raw) return undefined;
  try { return JSON.parse(raw); } catch { return undefined; }
}

async function fetchHtml(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' } });
    if (!response.ok) {
      console.warn(`[rippling] ${url}: HTTP ${response.status}, skipping`);
      return undefined;
    }
    return await response.text();
  } catch (error) {
    console.warn(`[rippling] ${url}: ${error instanceof Error ? error.message : String(error)}, skipping`);
    return undefined;
  }
}

export async function fetchRipplingJobs(company: RipplingCompanySeed): Promise<NormalizedJob[]> {
  const boardUrl = `https://ats.rippling.com/${company.slug}/jobs`;
  const boardHtml = await fetchHtml(boardUrl);
  if (!boardHtml) return [];

  // A single Rippling requisition can be repeated once per work location.
  // We retain one canonical job URL; its detail payload carries all locations.
  const listings = [...new Map(findListings(nextData(boardHtml)).map((listing) => [listing.id, listing])).values()];
  if (!listings.length) {
    console.warn(`[rippling] ${company.slug}: no jobs found in the public board payload`);
    return [];
  }

  const results: NormalizedJob[] = [];
  for (const listing of listings) {
    if (!matchesRoleFilter(company.roleFilter, listing.name)) continue;
    const detailUrl = listing.url || `${boardUrl}/${listing.id}`;
    const detailHtml = await fetchHtml(detailUrl);
    if (!detailHtml) continue;
    const apiData = (nextData(detailHtml) as { props?: { pageProps?: { apiData?: { jobPost?: RipplingDetail } } } })?.props?.pageProps?.apiData;
    const detail = apiData?.jobPost;
    if (!detail?.name || !detail.description?.company) {
      console.warn(`[rippling] ${company.slug}: ${listing.id} has no public job detail payload`);
      continue;
    }
    const description = textFromHtml(detail.description.company);
    if (!matchesRoleFilter(company.roleFilter, detail.name, description)) continue;
    const location = detail.workLocations?.join(' | ') || listing.locations?.map((location) => location.name).filter(Boolean).join(' | ') || '';
    results.push({
      source: 'rippling',
      externalId: detail.uuid || listing.id,
      title: detail.name,
      company: company.name,
      location,
      addressRegion: extractStateFromLocation(location) || listing.locations?.find((location) => location.stateCode)?.stateCode,
      description,
      url: detail.url || detailUrl,
      applyUrl: detail.url || detailUrl,
      contractType: detail.employmentType?.id || detail.employmentType?.label,
      postedAt: detail.createdOn ? new Date(detail.createdOn) : undefined,
    });
  }
  return results;
}
