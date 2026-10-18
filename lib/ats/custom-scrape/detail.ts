import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { CustomScrapeSelectors } from './types';
import { htmlPublicationDate } from '../publicationDate';
import { htmlBaseSalary, textBaseSalary } from '../salaryFields';
import { jobPostings, htmlText } from '../sourceFields';

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
  const expectedTitle = clean((selectors?.title ? $(selectors.title).first().text() : '') || $('h1').first().text());
  const jobPosting = jobPostings(html, { url, title: expectedTitle, allowSingleWithoutUrl: true })[0] as JsonLdJobPosting | undefined;
  const reader = new Readability(new JSDOM(html, { url }).window.document).parse();
  const description = clean((selectors?.description ? $(selectors.description).first().text() : '') || jobPosting?.description || reader?.textContent || $('main').text() || $('body').text());
  const rawLocation = clean(selectors?.location ? $(selectors.location).first().text() : $('.location').first().text());
  const schemaAddress = (Array.isArray(jobPosting?.jobLocation) ? jobPosting.jobLocation[0] : jobPosting?.jobLocation)?.address;
  const schemaLocation = [schemaAddress?.addressLocality, schemaAddress?.addressRegion].filter(Boolean).join(', ');
  const inferredLocation = findLocation(description);
  const locationData = rawLocation ? { ...findLocation(rawLocation), location: rawLocation } : schemaLocation
    ? { location: schemaLocation, locality: schemaAddress?.addressLocality, region: schemaAddress?.addressRegion }
    : inferredLocation.location ? inferredLocation : findLocation(htmlText(html));
  const remote = isUsFullyRemote(`${rawLocation}\n${schemaLocation}\n${description}`, jobPosting?.jobLocationType);
  const rawEmploymentType = clean(selectors?.employmentType ? $(selectors.employmentType).first().text() : '');
  const schemaEmploymentType = Array.isArray(jobPosting?.employmentType) ? jobPosting.employmentType[0] : jobPosting?.employmentType;
  // Many small employer sites place "Type: Full-time" in a job facts panel
  // which Readability omits from the main description. The page text is a
  // legitimate fallback, while the pattern map keeps the stored value within
  // Google's allowed employmentType values.
  const employmentType = findEmploymentType(rawEmploymentType, schemaEmploymentType, description, htmlText(html).replace(/Type(?=Full|Part)/g, 'Type ')) ?? schemaEmploymentType;
  const identity = { url, title: expectedTitle || jobPosting?.title };
  const salary = htmlBaseSalary(html, identity) ?? textBaseSalary(description) ?? textBaseSalary($('body').text());
  const schemaDate = htmlPublicationDate(html, identity);
  const canonicalHref = $('link[rel="canonical"]').attr('href');
  let canonicalUrl: string | undefined;
  try { canonicalUrl = canonicalHref ? new URL(canonicalHref, url).href : undefined; } catch { /* ignore malformed canonical */ }
  return {
    title: clean((selectors?.title ? $(selectors.title).first().text() : '') || jobPosting?.title || titleFromDocument($, url, selectors?.title)),
    description, location: remote ? 'Remote' : locationData.location, addressLocality: locationData.locality, addressRegion: locationData.region, isRemote: remote, employmentType,
    salary: salary?.salary, salaryMin: salary?.salaryMin, salaryMax: salary?.salaryMax, salaryPeriod: salary?.salaryPeriod,
    experienceLevel: experienceLevel(jobPosting?.experienceRequirements, description), postedAt: schemaDate && !Number.isNaN(schemaDate.valueOf()) ? schemaDate : undefined, canonicalUrl,
  };
}
