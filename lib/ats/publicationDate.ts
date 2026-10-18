import * as cheerio from 'cheerio';
import { jobPostings, type JobIdentity } from './sourceFields';

/** Only absolute source dates: never use updated_at, fetchedAt or relative labels. */
export function absolutePublicationDate(value: unknown, now = new Date()): Date | undefined {
  if (value instanceof Date) return Number.isFinite(value.getTime()) && value <= now ? new Date(value) : undefined;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return;
  const day = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== value.slice(0, 10)) return;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date <= now ? date : undefined;
}

export function greenhousePublicationDate(job: { first_published?: unknown; created_at?: unknown }): Date | undefined {
  return sourcePublicationDate(job, 'greenhouse');
}

/** Aliases are scoped to documented/observed source fields, never arbitrary dates. */
export function sourcePublicationDate(value: unknown, source = '', now = new Date()): Date | undefined {
  if (!value || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  const fields = new Map(Object.entries(record).map(([key, v]) => [key.replace(/[_-]/g, '').toLowerCase(), v]));
  const aliases = ['datePosted', 'postedAt', 'publishedAt', 'firstPublished', 'firstPublishedAt', 'publishedDate', 'publicationDate', 'postingDate', 'PostedDate'];
  if (source === 'workday') aliases.push('startDate');
  if (source === 'greenhouse') aliases.push('created_at');
  if (source === 'ashby') aliases.push('publishedAt');
  if (source === 'smartrecruiters') aliases.push('releasedDate');
  if (source === 'adp') aliases.push('postDate');
  if (source === 'rippling') aliases.push('createdOn');
  if ([record['@type']].flat().includes('JobPosting')) aliases.push('datePublished');
  for (const alias of aliases) {
    const date = absolutePublicationDate(fields.get(alias.replace(/[_-]/g, '').toLowerCase()), now);
    if (date) return date;
  }
  if (source === 'lever') {
    const epoch = fields.get('createdat');
    if (typeof epoch === 'number' && Number.isFinite(epoch) && epoch > 1_000_000_000_000) return absolutePublicationDate(new Date(epoch), now);
  }
}

export function htmlPublicationDate(html: string, identity: JobIdentity): Date | undefined {
  const dates = jobPostings(html, identity).map(node => sourcePublicationDate(node)).filter((date): date is Date => Boolean(date));
  if (dates.length) return new Set(dates.map(date => date.toISOString())).size === 1 ? dates[0] : undefined;
  const $ = cheerio.load(html), values: Date[] = [];
  // Explicit publication properties only. Generic article dates belong to the page.
  $('[itemprop="datePosted"], meta[property="job:posted_time"]').each((_, el) => {
    const raw = $(el).attr('content') ?? $(el).attr('datetime') ?? $(el).text().trim();
    const date = absolutePublicationDate(raw);
    if (date) values.push(date);
  });
  return new Set(values.map(date => date.toISOString())).size === 1 ? values[0] : undefined;
}

export function jobvitePublicationDate(html: string, url: string): Date | undefined {
  return htmlPublicationDate(html, { url });
}
