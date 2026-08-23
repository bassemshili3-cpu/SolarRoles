import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { CustomScrapeSelectors } from './types';

export type ExtractedJobDetail = {
  title: string;
  description: string;
  location: string;
  addressLocality?: string;
  addressRegion?: string;
  employmentType?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  experienceLevel?: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL';
  postedAt?: Date;
  canonicalUrl?: string;
};

const EMPLOYMENT_TYPES: Array<[RegExp, string]> = [
  [/\bfull[ -]?time\b/i, 'FULL_TIME'], [/\bpart[ -]?time\b/i, 'PART_TIME'],
  [/\bcontract(?:or)?\b/i, 'CONTRACTOR'], [/\btemporary\b/i, 'TEMPORARY'], [/\bintern(?:ship)?\b/i, 'INTERN'],
];
const clean = (value: string) => value.replace(/\s+/g, ' ').trim();

function titleFromDocument($: cheerio.CheerioAPI, url: string, selector?: string): string {
  const raw = clean((selector ? $(selector).first().text() : '') || $('h1').first().text() || $('title').text());
  const domain = new URL(url).hostname.replace(/^www\./, '').replace(/\.[^.]+$/, '');
  return clean(raw.split(/\s+[|\u2013\u2014-]\s+/)[0] || raw).replace(new RegExp(`\\b${domain}\\b`, 'ig'), '').trim();
}

function findLocation(text: string): { location: string; locality?: string; region?: string } {
  const cityState = text.match(/\b([A-Z][a-zA-Z.' -]{1,60}),\s*([A-Z]{2})\b/);
  if (cityState && extractStateFromLocation(cityState[0])) return { location: cityState[0], locality: cityState[1].trim(), region: cityState[2] };
  const labelled = text.match(/(?:location|based in|office)\s*[:\-]?\s*([^\n|]{2,100})/i)?.[1]?.trim();
  const region = labelled ? extractStateFromLocation(labelled) : undefined;
  return { location: labelled ?? '', region };
}

function findSalary(text: string): string | undefined {
  return text.match(/(?:\$\s?\d[\d,]*(?:\.\d{2})?\s*(?:-|\u2013|to)\s*\$?\s?\d[\d,]*(?:\.\d{2})?\s*(?:\/?\s*(?:hour|hr|year|yr))?)/i)?.[0];
}

type JsonLdJobPosting = {
  '@type'?: string | string[];
  title?: string;
  description?: string;
  datePosted?: string;
  employmentType?: string | string[];
  baseSalary?: unknown;
  experienceRequirements?: unknown;
  jobLocation?: { address?: { addressLocality?: string; addressRegion?: string } } | Array<{ address?: { addressLocality?: string; addressRegion?: string } }>;
  '@graph'?: JsonLdJobPosting[];
};

function getJobPosting($: cheerio.CheerioAPI): JsonLdJobPosting | undefined {
  const nodes: JsonLdJobPosting[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const parsed = JSON.parse($(element).text()) as JsonLdJobPosting | JsonLdJobPosting[];
      const values = Array.isArray(parsed) ? parsed : [parsed, ...(parsed['@graph'] ?? [])];
      nodes.push(...values);
    } catch {
      // Invalid JSON-LD is common on career pages; continue with the HTML fallback.
    }
  });
  return nodes.find((node) => {
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    return types.includes('JobPosting');
  });
}

type ExtractedSalary = { display: string; min?: number; max?: number; period?: string };

function salaryNumber(value: unknown): number | undefined {
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.replace(/,/g, '')) : NaN;
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function schemaSalary(value: unknown): ExtractedSalary | undefined {
  const salary = Array.isArray(value) ? value[0] : value;
  if (typeof salary === 'string') return { display: salary };
  if (!salary || typeof salary !== 'object') return undefined;
  const amount = salary as {
    currency?: string; value?: unknown; minValue?: unknown; maxValue?: unknown; unitText?: string;
  };
  const raw = amount.value && typeof amount.value === 'object' ? amount.value as Record<string, unknown> : amount;
  const min = salaryNumber(raw.minValue ?? raw.value);
  const max = salaryNumber(raw.maxValue ?? raw.value);
  const currency = amount.currency ?? (typeof raw.currency === 'string' ? raw.currency : 'USD');
  const period = typeof raw.unitText === 'string' ? raw.unitText.toUpperCase() : undefined;
  if (min === undefined && max === undefined) return undefined;
  const format = (number: number) => number.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const display = min !== undefined && max !== undefined && min !== max
    ? `${currency} ${format(min)}–${format(max)}`
    : `${currency} ${format(min ?? max!)}`;
  return { display: `${display}${period ? `/${period}` : ''}`, min, max, period };
}

function experienceLevel(value: unknown, description: string): ExtractedJobDetail['experienceLevel'] {
  const text = [
    typeof value === 'string' ? value : '',
    value && typeof value === 'object' ? JSON.stringify(value) : '',
    description,
  ].join(' ');
  if (/\b(entry[ -]?level|intern(ship)?|apprentice|trainee|no experience (required|necessary))\b/i.test(text)) return 'ENTRY_LEVEL';
  if (/\b(senior|lead|principal|manager|director|[5-9]\+?\s+years?)\b/i.test(text)) return 'SENIOR_LEVEL';
  if (/\b(mid[ -]?level|intermediate|journeyman|[2-4]\+?\s+years?)\b/i.test(text)) return 'MID_LEVEL';
  return undefined;
}

export function extractJobDetail(html: string, url: string, selectors?: CustomScrapeSelectors): ExtractedJobDetail {
  const $ = cheerio.load(html);
  const jobPosting = getJobPosting($);
  const reader = new Readability(new JSDOM(html, { url }).window.document).parse();
  const description = clean((selectors?.description ? $(selectors.description).first().text() : '') || jobPosting?.description || reader?.textContent || $('main').text() || $('body').text());
  const rawLocation = clean(selectors?.location ? $(selectors.location).first().text() : '');
  const schemaAddress = (Array.isArray(jobPosting?.jobLocation) ? jobPosting.jobLocation[0] : jobPosting?.jobLocation)?.address;
  const schemaLocation = [schemaAddress?.addressLocality, schemaAddress?.addressRegion].filter(Boolean).join(', ');
  const locationData = rawLocation ? { ...findLocation(rawLocation), location: rawLocation } : schemaLocation
    ? { location: schemaLocation, locality: schemaAddress?.addressLocality, region: schemaAddress?.addressRegion }
    : findLocation(description);
  const rawEmploymentType = clean(selectors?.employmentType ? $(selectors.employmentType).first().text() : '');
  const schemaEmploymentType = Array.isArray(jobPosting?.employmentType) ? jobPosting.employmentType[0] : jobPosting?.employmentType;
  const employmentType = EMPLOYMENT_TYPES.find(([pattern]) => pattern.test(rawEmploymentType || schemaEmploymentType || description))?.[1] ?? schemaEmploymentType;
  const salary = schemaSalary(jobPosting?.baseSalary);
  const schemaDate = jobPosting?.datePosted ? new Date(jobPosting.datePosted) : undefined;
  const canonicalHref = $('link[rel="canonical"]').attr('href');
  let canonicalUrl: string | undefined;
  try { canonicalUrl = canonicalHref ? new URL(canonicalHref, url).href : undefined; } catch { /* ignore malformed canonical */ }
  return {
    title: clean((selectors?.title ? $(selectors.title).first().text() : '') || jobPosting?.title || titleFromDocument($, url, selectors?.title)),
    description, location: locationData.location, addressLocality: locationData.locality, addressRegion: locationData.region, employmentType,
    salary: salary?.display ?? findSalary(description), salaryMin: salary?.min, salaryMax: salary?.max, salaryPeriod: salary?.period,
    experienceLevel: experienceLevel(jobPosting?.experienceRequirements, description), postedAt: schemaDate && !Number.isNaN(schemaDate.valueOf()) ? schemaDate : undefined, canonicalUrl,
  };
}
