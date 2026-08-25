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
  isRemote?: boolean;
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
  [/\bfull[_ -]?time\b/i, 'FULL_TIME'], [/\bpart[_ -]?time\b/i, 'PART_TIME'],
  [/\bcontract(?:or)?\b/i, 'CONTRACTOR'], [/\btemporary\b/i, 'TEMPORARY'], [/\bintern(?:ship)?\b/i, 'INTERN'],
];
const clean = (value: string) => value.replace(/\s+/g, ' ').trim();

function findEmploymentType(...values: Array<string | undefined>): string | undefined {
  const text = values.filter(Boolean).join('\n');
  return EMPLOYMENT_TYPES.find(([pattern]) => pattern.test(text))?.[1];
}

function titleFromDocument($: cheerio.CheerioAPI, url: string, selector?: string): string {
  const raw = clean((selector ? $(selector).first().text() : '') || $('h1').first().text() || $('title').text());
  const domain = new URL(url).hostname.replace(/^www\./, '').replace(/\.[^.]+$/, '');
  return clean(raw.split(/\s+[|\u2013\u2014-]\s+/)[0] || raw).replace(new RegExp(`\\b${domain}\\b`, 'ig'), '').trim();
}

function findLocation(text: string): { location: string; locality?: string; region?: string } {
  const cityState = text.match(/\b([A-Z][a-zA-Z.' -]{1,60}),\s*([A-Z]{2})\b/);
  if (cityState && extractStateFromLocation(cityState[0])) return { location: cityState[0], locality: cityState[1].trim(), region: cityState[2] };
  // Page text is normalized before extraction, so a generic "Location:" match
  // must stop at the next job-facts label rather than consume the description.
  const labelled = text.match(/\blocation\s*:\s*([a-z][a-z /-]{1,80}?)(?=\s+(?:salary(?:\s+range)?|experience|position|requirements|responsibilities|apply)\b|$)/i)?.[1]?.trim()
    ?? text.match(/(?:based in|office)\s*[:\-]?\s*([^\n|]{2,100})/i)?.[1]?.trim();
  const firstRegion = labelled?.split(/[\/|]/)[0].trim();
  const region = firstRegion
    ? extractStateFromLocation(firstRegion) ?? extractStateFromLocation(firstRegion.replace(/^(central|north|south|east|west)\s+/i, ''))
    : undefined;
  return { location: labelled ?? '', region };
}

function isUsFullyRemote(text: string, schemaLocationType?: string): boolean {
  const remote = /\b(remote|work[ -]?from[ -]?home|wfh|telecommut(?:e|ing))\b/i.test(text) || /^telecommute$/i.test(schemaLocationType ?? '');
  const unitedStates = /\b(united states|u\.?s\.?a?\.?|us[- ]based)\b/i.test(text);
  return remote && unitedStates;
}

function salaryNumberFromText(value: string): number | undefined {
  const normalized = value.replace(/[$,\s]/g, '');
  const match = normalized.match(/^(\d+(?:\.\d+)?)([km])?$/i);
  if (!match) return undefined;
  const multiplier = match[2]?.toLowerCase() === 'k' ? 1_000 : match[2]?.toLowerCase() === 'm' ? 1_000_000 : 1;
  const number = Number(match[1]) * multiplier;
  return Number.isFinite(number) ? number : undefined;
}

function textSalary(text: string): ExtractedSalary | undefined {
  // Intentionally requires a dollar sign on the lower bound so that unrelated
  // numeric ranges in a job description are not mistaken for compensation.
  const amount = '\\d[\\d,]*(?:\\.\\d+)?\\s*[kKmM]?';
  const range = new RegExp(
    `(\\$\\s*${amount})\\s*(?:-|\\u2013|\\u2014|to)\\s*(\\$?\\s*${amount})` +
    `(?:\\s*(?:/|per)\\s*(hour|hr|year|yr|month|mo|week|wk)\\b|\\s*\\b(annual(?:ly)?|hourly|monthly|weekly)\\b)?`,
    'i',
  ).exec(text);
  if (!range) return undefined;
  const min = salaryNumberFromText(range[1]);
  const max = salaryNumberFromText(range[2]);
  if (min === undefined || max === undefined) return undefined;
  const periodText = (range[3] ?? range[4] ?? '').toLowerCase();
  const period = periodText
    ? /^(year|yr|annual)/.test(periodText) ? 'YEAR'
      : /^(hour|hr|hourly)/.test(periodText) ? 'HOUR'
        : /^(month|mo|monthly)/.test(periodText) ? 'MONTH'
          : 'WEEK'
    : undefined;
  return { display: clean(range[0]), min, max, period };
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
  jobLocationType?: string;
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
  const remote = isUsFullyRemote(`${rawLocation}\n${schemaLocation}\n${description}`, jobPosting?.jobLocationType);
  const rawEmploymentType = clean(selectors?.employmentType ? $(selectors.employmentType).first().text() : '');
  const schemaEmploymentType = Array.isArray(jobPosting?.employmentType) ? jobPosting.employmentType[0] : jobPosting?.employmentType;
  // Many small employer sites place "Type: Full-time" in a job facts panel
  // which Readability omits from the main description. The page text is a
  // legitimate fallback, while the pattern map keeps the stored value within
  // Google's allowed employmentType values.
  const employmentType = findEmploymentType(rawEmploymentType, schemaEmploymentType, description, $('body').text()) ?? schemaEmploymentType;
  const salary = schemaSalary(jobPosting?.baseSalary) ?? textSalary(description) ?? textSalary($('body').text());
  const schemaDate = jobPosting?.datePosted ? new Date(jobPosting.datePosted) : undefined;
  const canonicalHref = $('link[rel="canonical"]').attr('href');
  let canonicalUrl: string | undefined;
  try { canonicalUrl = canonicalHref ? new URL(canonicalHref, url).href : undefined; } catch { /* ignore malformed canonical */ }
  return {
    title: clean((selectors?.title ? $(selectors.title).first().text() : '') || jobPosting?.title || titleFromDocument($, url, selectors?.title)),
    description, location: remote ? 'Remote' : locationData.location, addressLocality: locationData.locality, addressRegion: locationData.region, isRemote: remote, employmentType,
    salary: salary?.display, salaryMin: salary?.min, salaryMax: salary?.max, salaryPeriod: salary?.period,
    experienceLevel: experienceLevel(jobPosting?.experienceRequirements, description), postedAt: schemaDate && !Number.isNaN(schemaDate.valueOf()) ? schemaDate : undefined, canonicalUrl,
  };
}
