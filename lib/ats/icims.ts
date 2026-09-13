import * as cheerio from 'cheerio';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

export interface IcimsCompanySeed {
  baseUrl: string;
  name: string;
  /** Optional category when only one division of a shared iCIMS tenant is in scope. */
  categoryName?: string;
  verified: boolean;
}

interface IcimsListJob {
  id: string;
  title: string;
  url: string;
}

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

function cleanTitle(raw: string): string {
  return raw.replace(/^\s*Job Title\s*/i, '').replace(/\s+/g, ' ').trim();
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
  const value = lines.find((line) => /^\(\d{1,2}\/\d{1,2}\/\d{4}/.test(line));
  const match = value?.match(/\((\d{1,2}\/\d{1,2}\/\d{4})/);
  if (!match) return undefined;
  const date = new Date(`${match[1]} 12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseIcimsDetail(html: string, fallbackTitle: string) {
  const $ = cheerio.load(html);
  const lines = $('body').text().split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const title = cleanTitle($('h1').first().text() || fallbackTitle);
  const locationLabel = lines.findIndex((line) => line === 'Job Locations');
  const location = normalizeIcimsLocation(locationLabel >= 0 ? lines[locationLabel + 1] ?? '' : '');
  const descriptionStart = lines.findIndex((line) => line === 'Overview');
  const description = (descriptionStart >= 0 ? lines.slice(descriptionStart + 1) : lines).join(' ');
  return { title, location, description, postedAt: parsePostedDate(lines) };
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
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
    console.warn(`[icims] ${company.name}: catégorie "${company.categoryName}" introuvable, skipping`);
    return [];
  }

  const jobs = new Map<string, IcimsListJob>();
  for (let page = 0; page < 100; page++) {
    const url = new URL(`${baseUrl}/jobs/search`);
    url.searchParams.set('ss', '1');
    url.searchParams.set('in_iframe', '1');
    if (categoryValue) url.searchParams.set('searchCategory', categoryValue);
    url.searchParams.set('pr', String(page));

    const $ = cheerio.load(await fetchHtml(url.toString()));
    let additions = 0;
    $('a[href*="/jobs/"][href*="/job"]').each((_, anchor) => {
      const href = $(anchor).attr('href');
      const match = href?.match(/\/jobs\/(\d+)\//);
      if (!href || !match || jobs.has(match[1])) return;
      const title = cleanTitle($(anchor).text());
      if (!title) return;
      const detailUrl = new URL(href, baseUrl);
      detailUrl.searchParams.set('in_iframe', '1');
      jobs.set(match[1], { id: match[1], title, url: detailUrl.toString() });
      additions++;
    });

    const hasNextPage = $(`a[href*="pr=${page + 1}"]`).length > 0;
    if (additions === 0 || !hasNextPage) break;
  }

  console.log(`[icims] ${company.name}: ${jobs.size} postes bruts${company.categoryName ? ` dans la catégorie ${company.categoryName}` : ''}`);

  const results: NormalizedJob[] = [];
  for (const job of jobs.values()) {
    try {
      const detail = parseIcimsDetail(await fetchHtml(job.url), job.title);
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
      });
    } catch (error) {
      console.warn(`[icims] ${company.name}: détail ignoré (${job.id}) — ${(error as Error).message}`);
    }
  }

  return results;
}
