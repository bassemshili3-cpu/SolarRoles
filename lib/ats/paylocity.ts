import * as cheerio from 'cheerio';
import { launchAtsBrowser } from './browser';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';
import { sourcePublicationDate, htmlPublicationDate } from './publicationDate';
import { structuredSalary, textBaseSalary } from './salaryFields';
import { jobPostings, sameSourceJob, htmlText } from './sourceFields';
import type { AtsFetchContext } from './fetch-context';
import type { APIRequestContext } from 'playwright';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

export type PaylocityCompanySeed = {
  boardUrl: string;
  name: string;
  verified: boolean;
};

type JobPosting = {
  '@type'?: string;
  title?: string;
  datePosted?: string;
  baseSalary?: unknown;
  description?: string;
  employmentType?: string | string[];
  locationText?: string;
  jobLocation?: { address?: { addressLocality?: string; addressRegion?: string; addressCountry?: string } };
};

export class PaylocityRateLimit extends Error {}

export function retryAfterMs(value: string | undefined, now = Date.now()): number {
  if (!value) return 30_000;
  const seconds = Number(value);
  return Math.max(1_000, Number.isFinite(seconds) ? seconds * 1000 : (Date.parse(value) - now) || 30_000);
}

export async function paylocityHtml(request: Pick<APIRequestContext, 'get'>, url: string, deadline: number,
  sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await request.get(url, { timeout: 20_000, headers: { Accept: 'text/html' } });
    if (response.ok()) { try { return await response.text(); } finally { await response.dispose(); } }
    const status = response.status();
    const wait = status === 429 ? retryAfterMs(response.headers()['retry-after']) : (attempt + 1) * 5_000;
    await response.dispose();
    if (status === 429 && (attempt === 2 || Date.now() + wait + 25_000 >= deadline)) {
      throw new PaylocityRateLimit(`HTTP 429; resume after ${new Date(Date.now() + wait).toISOString()}`);
    }
    if ((status !== 429 && status < 500) || attempt === 2) throw new Error(`HTTP ${status} for ${url}`);
    await sleep(wait);
  }
  throw new Error(`Paylocity retries exhausted for ${url}`);
}

function textFromHtml(html: string): string {
  return htmlText(html);
}

export function parsePosting(html: string, url?: string): JobPosting | undefined {
  if (url) {
    const structured = jobPostings(html, { url, allowSingleWithoutUrl: true })[0] as JobPosting | undefined;
    if (structured) return structured;
    // Some current Paylocity boards expose a complete server-rendered job,
    // without any JSON-LD. Bind that fallback to the requested detail URL.
    const $ = cheerio.load(html);
    const canonical = $('meta[property="og:url"]').attr('content');
    if (!canonical || !sameSourceJob(canonical, url)) return undefined;
    const title = $('.job-preview-title').first().text().replace(/\s+/g, ' ').trim();
    const body = $('.job-preview-details').first().clone();
    body.find('a,button,script,style').remove();
    if (!title || body.text().trim().length < 60) return undefined;
    const typeLabel = $('.job-listing-header').filter((_, el) => $(el).text().trim() === 'Job Type').first();
    return { title, description: body.html() ?? '',
      employmentType: typeLabel.next().text().trim() || undefined,
      locationText: $('.preview-location').first().text().replace(/\s+/g, ' ').trim(),
      datePosted: htmlPublicationDate(html, { url, title })?.toISOString(),
    };
  }
  const dom = cheerio.load(html);
  for (const element of dom('script[type="application/ld+json"]').toArray()) {
    try {
      const value = JSON.parse(dom(element).text()) as JobPosting | JobPosting[];
      const posting = (Array.isArray(value) ? value : [value]).find((entry) => entry?.['@type'] === 'JobPosting');
      if (posting) return posting;
    } catch {
      // Ignore unrelated malformed structured data.
    }
  }
  return undefined;
}


export async function fetchPaylocityJobs(company: PaylocityCompanySeed, run?: AtsFetchContext): Promise<NormalizedJob[]> {
  const results: NormalizedJob[] = [];
  const deadline = run?.deadline ?? Infinity;
  const browser = await launchAtsBrowser({ headless: true });
  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    let links: string[];
    try {
      const response = await page.goto(company.boardUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      if (response && !response.ok()) throw new Error(`HTTP ${response.status()} for board`);
      await page.locator('a[href*="/Details/" i], a[href*="/details/"], .no-jobs, [class*="noJobs"]').first()
        .waitFor({ state: 'attached', timeout: 15_000 }).catch(() => {});
      links = [...new Set(await page.locator('a[href]').evaluateAll((anchors) =>
        anchors
          .map((anchor) => (anchor as HTMLAnchorElement).href)
          .filter((href) => /\/recruiting\/jobs\/details\/\d+/i.test(href)),
      ))];
    } finally {
      await page.close();
    }
    console.log(`[paylocity] ${company.name}: ${links.length} postes bruts découverts`);

    // A request context shares the board's cookies. Resume a rate-limited detail
    // first so a large board cannot keep starving its later jobs.
    const cursor = run?.cursor as { pendingUrl?: string } | undefined;
    if (cursor?.pendingUrl && links.includes(cursor.pendingUrl)) {
      const start = links.indexOf(cursor.pendingUrl);
      links = [...links.slice(start), ...links.slice(0, start)];
    }
    for (const [index, url] of links.entries()) {
      if (Date.now() + 75_000 >= deadline) { run?.checkpoint({ pendingUrl: url }); return results; }
      if (run?.isKnown('paylocity', url)) continue;
      try {
        if (index) await new Promise(resolve => setTimeout(resolve, 1000));
        const posting = parsePosting(await paylocityHtml(context.request, url, deadline), url);
        if (!posting?.title) console.warn(`[paylocity] ${company.name}: missing JobPosting for ${url}`);
        if (!posting?.title) continue;
        const description = textFromHtml(posting.description ?? '');
        if (!isSolarInstallerRole(posting.title, description)) continue;
        const address = posting.jobLocation?.address;
        const location = [address?.addressLocality, address?.addressRegion, address?.addressCountry].filter(Boolean).join(', ') || posting.locationText || '';
        const externalId = new URL(url).pathname.match(/\/Details\/(\d+)/i)?.[1] ?? url;

        results.push({
          source: 'paylocity',
          externalId,
          title: posting.title,
          company: company.name,
          location,
          addressRegion: extractStateFromLocation(location),
          description,
          url,
          applyUrl: url.replace(/\/Details\//i, '/Apply/'),
          contractType: Array.isArray(posting.employmentType) ? posting.employmentType.join(', ') : posting.employmentType,
          postedAt: sourcePublicationDate(posting, 'paylocity'),
          ...(structuredSalary(posting.baseSalary) ?? textBaseSalary(description)),
        });
      } catch (error) {
        console.warn(`[paylocity] ${company.name}: ${url}: ${(error as Error).message}`);
        if (error instanceof PaylocityRateLimit) { run?.checkpoint({ pendingUrl: url }); return results; }
      }
    }
    run?.checkpoint({ pendingUrl: null });
    return results;
  } catch (error) {
    console.warn(`[paylocity] ${company.name}: fetch échoué — ${error instanceof Error ? error.message : String(error)}`);
    return results;
  } finally {
    await browser.close();
  }
}
