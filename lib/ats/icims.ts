import * as cheerio from 'cheerio';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole, isGenericInstallerTitle } from './solar-taxonomy';
import type { NormalizedJob } from './types';
import { absolutePublicationDate, htmlPublicationDate } from './publicationDate';
import { htmlBaseSalary, textBaseSalary } from './salaryFields';

export interface IcimsCompanySeed {
  baseUrl: string;
  name: string;
  /** Optional category when only one division of a shared iCIMS tenant is in scope. */
  categoryName?: string;
  employerName?: string;
  searchKeyword?: string;
  employerAliases?: string[];
  verified: boolean;
}

interface IcimsListJob {
  id: string;
  title: string;
  url: string;
  checkEmployer?: boolean;
}

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

function cleanTitle(raw: string): string {
  return raw.replace(/^\s*(?:Job\s+)?Title\s*/i, '').replace(/\s+/g, ' ').trim();
}

function normalizeIcimsLocation(raw: string): string {
  const first = raw.split('|').map((value) => value.trim()).find((value) => value.startsWith('US-')) ?? raw.trim();
  const parts = first.split('-').filter(Boolean);
  if (parts[0] === 'US' && parts[1]) {
    const city = parts.slice(2).join(' ');
    return city ? `${city}, ${parts[1]}` : parts[1];
  }
  return first;
}

function parsePostedDate(lines: string[]): Date | undefined {
  const value = lines.find((line) => /\(\d{1,2}\/\d{1,2}\/\d{4}/.test(line));
  const match = value?.match(/\((\d{1,2}\/\d{1,2}\/\d{4})/);
  if (!match) return undefined;
  const [month, day, year] = match[1].split('/');
  return absolutePublicationDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
}

export function parseIcimsDetail(html: string, fallbackTitle: string, url?: string) {
  const $ = cheerio.load(html);
  let posting: any;
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const data = JSON.parse($(element).text());
      const entries = Array.isArray(data) ? data : [data, ...(data['@graph'] || [])];
      posting ??= entries.find(entry => [entry?.['@type']].flat().includes('JobPosting') && (!url || !entry.url || new URL(entry.url, url).pathname === new URL(url).pathname));
    } catch { /* Fall back to the visible job page. */ }
  });
  $('script, style, nav, footer').remove();
  const lines = $('body').text().split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const title = cleanTitle($('h1').first().text() || fallbackTitle);
  const locationLabel = lines.findIndex((line) => line === 'Job Locations');
  const location = normalizeIcimsLocation(locationLabel >= 0 ? lines[locationLabel + 1] ?? '' : '');
  const descriptionStart = lines.findIndex((line) => line === 'Overview');
  const description = posting?.description ? cheerio.load(posting.description).text().replace(/\s+/g, ' ').trim() : (descriptionStart >= 0 ? lines.slice(descriptionStart + 1) : lines).join(' ');
  const address = (Array.isArray(posting?.jobLocation) ? posting.jobLocation[0] : posting?.jobLocation)?.address;
  const structuredLocation = address ? [address.addressLocality, address.addressRegion, typeof address.addressCountry === 'string' ? address.addressCountry : address.addressCountry?.name].filter(Boolean).join(', ') : '';
  const identity = url ? { url, title } : undefined;
  return { title, location: structuredLocation || location, description,
    postedAt: (identity ? htmlPublicationDate(html, identity) : undefined) ?? parsePostedDate(lines),
    salaryFields: (identity ? htmlBaseSalary(html, identity) : undefined) ?? textBaseSalary(description),
  };
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

export async function fetchIcimsJobs(company: IcimsCompanySeed): Promise<NormalizedJob[]> {
  const baseUrl = company.baseUrl.replace(/\/$/, '');
  const firstHtml = await fetchHtml(`${baseUrl}/jobs/search?ss=1&in_iframe=1`);
  const firstPage = cheerio.load(firstHtml);
  const categoryValue = company.categoryName
    ? firstPage('option').filter((_, option) =>
        firstPage(option).text().trim().toLowerCase() === company.categoryName!.toLowerCase(),
      ).first().attr('value')
    : undefined;

  if (company.categoryName && !categoryValue) {
    // Some shared tenants expose job functions, not employer divisions, under
    // searchCategory. Fall back to the explicit Company label on each listing.
    console.log(`[icims] ${company.name}: no division category; filtering listing Company fields`);
  }
  const expectedEmployer = company.employerName || (company.categoryName && !categoryValue ? company.categoryName : undefined);
  const employerNames = expectedEmployer ? [expectedEmployer, ...(company.employerAliases || [])] : [];

  const jobs = new Map<string, IcimsListJob>();
  for (let page = 0; page < 100; page++) {
    const url = new URL(`${baseUrl}/jobs/search`);
    url.searchParams.set('ss', '1');
    url.searchParams.set('in_iframe', '1');
    if (categoryValue) url.searchParams.set('searchCategory', categoryValue);
    // Company labels are not reliably part of the board's keyword index.
    if (company.searchKeyword) url.searchParams.set('searchKeyword', company.searchKeyword);
    else if (company.categoryName && !categoryValue && !company.employerAliases?.length) url.searchParams.set('searchKeyword', `"${company.categoryName}"`);
    url.searchParams.set('pr', String(page));

    const $ = cheerio.load(await fetchHtml(url.toString()));
    $('a[href*="/jobs/"][href*="/job"]').each((_, anchor) => {
      const href = $(anchor).attr('href');
      const match = href?.match(/\/jobs\/(\d+)\//);
      if (!href || !match || jobs.has(match[1])) return;
      const title = cleanTitle($(anchor).text());
      if (!title) return;
      const employer = icimsListingEmployer($, $(anchor));
      if (expectedEmployer && employer && !employerNames.some(name => icimsEmployerMatches($, $(anchor), name))) return;
      if (!isSolarInstallerRole(title) && !isGenericInstallerTitle(title)) return;
      const detailUrl = new URL(href, baseUrl);
      detailUrl.searchParams.set('in_iframe', '1');
      jobs.set(match[1], { id: match[1], title, url: detailUrl.toString(), checkEmployer: Boolean(expectedEmployer && !employer) });
    });

    const hasNextPage = $(`a[href*="pr=${page + 1}"]`).length > 0;
    if (!hasNextPage) break;
  }

  console.log(`[icims] ${company.name}: ${jobs.size} postes bruts${company.categoryName ? ` dans la catégorie ${company.categoryName}` : ''}`);

  const results: NormalizedJob[] = [];
  for (const job of jobs.values()) {
    try {
      const detail = parseIcimsDetail(await fetchHtml(job.url), job.title, job.url);
      if (job.checkEmployer && !icimsDescriptionEmployerMatches(detail.description, employerNames)) continue;
      if (!isSolarInstallerRole(detail.title, detail.description)) continue;
      results.push({
        source: 'icims',
        externalId: job.id,
        title: detail.title,
        company: company.name,
        location: detail.location,
        addressRegion: extractStateFromLocation(detail.location),
        description: detail.description,
        url: job.url,
        applyUrl: job.url,
        postedAt: detail.postedAt,
        ...detail.salaryFields,
      });
    } catch (error) {
      console.warn(`[icims] ${company.name}: détail ignoré (${job.id}) — ${(error as Error).message}`);
    }
  }

  return results;
}

export function icimsListingEmployer($: cheerio.CheerioAPI, anchor: cheerio.Cheerio<any>): string {
  const row = anchor.closest('.iCIMS_JobListingRow, .iCIMS_JobCardItem');
  let employer = '';
  row.find('dt, .iCIMS_JobHeaderField, .field-label').each((_, label) => {
    if ($(label).text().trim() === 'Company') employer = $(label).next().text().trim();
  });
  return employer;
}
export function icimsEmployerMatches($: cheerio.CheerioAPI, anchor: cheerio.Cheerio<any>, expected: string): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/\b(?:llc|inc|ltd)\b/g, '').replace(/[^a-z0-9]/g, '');
  const employer = icimsListingEmployer($, anchor);
  return Boolean(employer) && normalize(employer) === normalize(expected);
}
export function icimsDescriptionEmployerMatches(description: string, names: string[]): boolean {
  const text = ` ${description.slice(0, 2500).toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `;
  return names.some(name => text.includes(` ${name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `));
}
