import * as cheerio from 'cheerio';
import { extractJobDetail } from './custom-scrape/detail';
import { isSolarInstallerRole, isGenericInstallerTitle } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { STATE_CODE_TO_NAME } from '@/lib/usStates';
import type { AtsCompanySeed } from './company-seed';
import type { NormalizedJob } from './types';

export type HostedBoard = 'jazzhr' | 'breezy';
const clean = (value: string) => value.replace(/\s+/g, ' ').trim();
const state = (value: string): string | undefined => {
  const code = STATE_CODE_TO_NAME[value.trim().toUpperCase()] ? value.trim().toUpperCase() : extractStateFromLocation(value);
  return code && STATE_CODE_TO_NAME[code] ? code : undefined;
};
export const boardUrl = (source: HostedBoard, slug: string) => source === 'jazzhr'
  ? `https://${slug}.applytojob.com/apply` : `https://${slug}.breezy.hr/`;

function jobId(source: HostedBoard, url: URL): string | undefined {
  return source === 'jazzhr'
    ? url.pathname.match(/^\/apply\/([a-zA-Z0-9]{10})\/[^/]+\/?$/)?.[1]
    : url.pathname.match(/^\/p\/([a-f0-9]{12})-[^/]+\/?$/)?.[1];
}

function approved(company: AtsCompanySeed, title: string): boolean {
  return company.includeJobTitles?.some((value) => clean(value).toLowerCase() === clean(title).toLowerCase()) ?? false;
}

export function parseHostedLinks(html: string, source: HostedBoard, company: AtsCompanySeed) {
  const base = boardUrl(source, company.slug);
  const $ = cheerio.load(html);
  const links = new Map<string, { url: string; title: string }>();
  $('a[href]').each((_, element) => {
    const anchor = $(element);
    try {
      const url = new URL(anchor.attr('href')!, base);
      if (url.origin !== new URL(base).origin) return;
      const id = jobId(source, url);
      if (!id) return;
      const title = clean(anchor.find('h2, h3, .position-title').first().text() || anchor.text());
      if (!approved(company, title) && !isSolarInstallerRole(title) && !isGenericInstallerTitle(title)) return;
      url.search = ''; url.hash = '';
      if (!links.has(id)) links.set(id, { url: url.href, title });
    } catch { /* Ignore malformed links and links to application forms. */ }
  });
  return [...links.values()];
}

export function parseHostedDetail(html: string, url: string, source: HostedBoard, company: AtsCompanySeed): NormalizedJob | undefined {
  const $ = cheerio.load(html);
  const id = jobId(source, new URL(url));
  if (!id) return;
  // A closed job can redirect to the board with HTTP 200. Require a job body.
  let selectors = source === 'jazzhr'
    ? { title: '.job-header h2', description: '#job-description', location: '.job-attributes-container [title="Location"]', employmentType: '#resumator-job-employment' }
    : undefined;
  if (source === 'jazzhr' && !$('#job-description').length) return;
  let schema: any;
  const visit = (value: any): void => {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!value || typeof value !== 'object') return;
    if ([value['@type']].flat().includes('JobPosting')) schema ??= value;
    if (value['@graph']) visit(value['@graph']);
  };
  $('script[type="application/ld+json"]').each((_, element) => {
    try { visit(JSON.parse($(element).text())); } catch { /* Try next block. */ }
  });
  if (source === 'breezy' && !schema) {
    if (!$('.position-header h1').length || !$('.job-description .description').length) return;
    selectors = { title: '.position-header h1', description: '.job-description .description', location: '.position-header .fa-map-marker + span', employmentType: '.position-header .type .label' };
  }
  if (schema?.validThrough && new Date(schema.validThrough).getTime() < Date.now()) return;
  const detail = extractJobDetail(html, url, selectors);
  if (detail.canonicalUrl) {
    const canonical = new URL(detail.canonicalUrl);
    if (canonical.origin !== new URL(url).origin || jobId(source, canonical) !== id) return;
    url = canonical.href;
  }
  const descriptionText = clean(cheerio.load(detail.description).text());
  if (!detail.title || descriptionText.length < 60) return;
  if (!approved(company, detail.title) && !isSolarInstallerRole(detail.title, descriptionText)) return;
  const addresses = [schema?.jobLocation].flat().filter(Boolean).map((place: any) => place.address).filter(Boolean);
  const countryName = (country: any): string => typeof country === 'string' ? country : country?.name ?? '';
  const locations = addresses.map((address: any) => [address.addressLocality, address.addressRegion, countryName(address.addressCountry)].filter(Boolean).join(', '));
  const rawLocation = selectors ? clean($(selectors.location).text()) : locations.join(' / ');
  const requirements = [schema?.applicantLocationRequirements].flat().filter(Boolean);
  const us = /\b(?:united states|USA|US)\b/i;
  const explicitUs = addresses.some((address: any) => us.test(countryName(address.addressCountry)))
    || requirements.some((place: any) => us.test(place.name ?? ''))
    || /\b(?:must (?:be located|live|reside)|(?:candidates|applicants) must (?:live|reside)) in (?:the )?(?:US|U\.S\.|United States)\b/i.test(descriptionText);
  const remote = schema?.jobLocationType === 'TELECOMMUTE'
    || /^remote$/i.test(rawLocation)
    || /\b(?:fully remote|completely remote|100% remote)\b/i.test(descriptionText);
  const regions = [...new Set<string>(addresses.map((address: any) => state(address.addressRegion ?? '')).filter((value): value is string => Boolean(value)))];
  const location = rawLocation || (remote ? 'Remote' : '');
  if (!location) return;
  return {
    source, externalId: `${company.slug}:${id}`, title: detail.title, company: company.name,
    location: remote && explicitUs && /^remote$/i.test(location) ? 'Remote, US' : location,
    addressRegion: regions[0] ?? state(location), locationRegions: regions.length ? regions : undefined,
    isRemote: remote && explicitUs, description: detail.description, url, applyUrl: url,
    contractType: detail.employmentType, postedAt: detail.postedAt,
    salary: detail.salary, salaryMin: detail.salaryMin, salaryMax: detail.salaryMax, salaryPeriod: detail.salaryPeriod,
    experienceLevel: detail.experienceLevel,
  };
}

async function fetchPage(url: string): Promise<{ html: string; url: string }> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'solarroles.com job aggregator (contact: hello@solarroles.com)' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return { html: await response.text(), url: response.url || url };
}

export async function fetchHostedJobs(source: HostedBoard, company: AtsCompanySeed): Promise<NormalizedJob[]> {
  if (!company.verified) return [];
  const jobs: NormalizedJob[] = [];
  try {
    const listing = await fetchPage(boardUrl(source, company.slug));
    const links = parseHostedLinks(listing.html, source, company);
    console.log(`[${source}] ${company.slug}: ${links.length} candidate job(s)`);
    for (const link of links) {
      try {
        const detail = await fetchPage(link.url);
        if (new URL(detail.url).origin !== new URL(link.url).origin || jobId(source, new URL(detail.url)) !== jobId(source, new URL(link.url))) continue;
        const job = parseHostedDetail(detail.html, detail.url, source, company);
        if (job) jobs.push(job);
      } catch (error) { console.warn(`[${source}] ${link.url}: ${(error as Error).message}`); }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  } catch (error) { console.warn(`[${source}] ${company.slug}: ${(error as Error).message}`); }
  return jobs;
}
