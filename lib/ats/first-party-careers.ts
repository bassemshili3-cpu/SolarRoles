import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export type FirstPartyCareerSeed = {
  kind: 'gamechange' | 'purelight' | 'solar-optimum';
  careersUrl: string;
  name: string;
  verified: boolean;
};

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeStaticJob(
  company: FirstPartyCareerSeed,
  input: { id: string; title: string; location: string; description: string; url: string; applyUrl?: string },
): NormalizedJob | undefined {
  if (!input.description || !isSolarInstallerRole(input.title, input.description)) return undefined;
  return {
    source: 'first-party-careers',
    externalId: input.id,
    title: input.title,
    company: company.name,
    location: input.location,
    addressRegion: extractStateFromLocation(input.location),
    description: input.description,
    url: input.url,
    applyUrl: input.applyUrl ?? input.url,
  };
}

async function fetchSolarOptimum(company: FirstPartyCareerSeed): Promise<NormalizedJob[]> {
  const response = await fetch(company.careersUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) return [];
  const dom = cheerio.load(await response.text());
  return dom('.vc_tta-panel').toArray().flatMap((element) => {
    const panel = dom(element);
    const title = cleanText(panel.find('.vc_tta-panel-title .vc_tta-title-text').first().text());
    const id = panel.attr('id') || slug(title);
    const description = cleanText(panel.find('.vc_tta-panel-body').first().text());
    const job = normalizeStaticJob(company, {
      id,
      title,
      location: 'United States',
      description,
      url: `${company.careersUrl}#${id}`,
      applyUrl: company.careersUrl,
    });
    return job ? [job] : [];
  });
}

async function fetchGameChange(company: FirstPartyCareerSeed): Promise<NormalizedJob[]> {
  const response = await fetch(company.careersUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) return [];
  const html = await response.text();
  const dom = cheerio.load(html);
  const script = dom('script').toArray().map((element) => dom(element).text())
    .find((text) => text.includes('OpenCareerPositions') && text.includes('recordsByCollectionId'));
  if (!script) return [];

  const jobs: NormalizedJob[] = [];
  const parsed = JSON.parse(script) as any;
  const records = parsed?.appsWarmupData?.dataBinding?.dataStore
    ?.recordsByCollectionId?.OpenCareerPositions ?? {};
  for (const record of Object.values(records) as Array<{ _id?: string; department?: string; title?: string }>) {
    const id = record._id ?? '';
    const department = record.department ?? '';
    const title = record.title ?? '';
    if (!id || !title) continue;
    const description = `${title}. ${department}. GameChange Energy designs and supports utility-scale solar trackers, racking and balance-of-system equipment.`;
    const job = normalizeStaticJob(company, {
      id,
      title,
      location: 'United States',
      description,
      url: `${company.careersUrl}#${id}`,
      applyUrl: company.careersUrl,
    });
    if (job) jobs.push(job);
  }
  return jobs;
}

async function fetchRenderedListings(company: FirstPartyCareerSeed): Promise<NormalizedJob[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT, locale: 'en-US' });
  const page = await context.newPage();
  try {
    await page.goto(company.careersUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForTimeout(2_000);
    const links = await page.locator('a[href]').evaluateAll((anchors) => anchors.map((anchor) => {
      const url = (anchor as HTMLAnchorElement).href;
      const text = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
      const container = anchor.closest('article, li, [class*="job"], [class*="position"]') as HTMLElement | null;
      const containerText = (container?.innerText ?? '').replace(/\s+/g, ' ').trim();
      return { url, text, containerText };
    }).filter((item) => /\/listings\//.test(item.url)));

    const unique = new Map(links.map((item) => [item.url, item]));
    const jobs: NormalizedJob[] = [];
    for (const [url, listing] of unique) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(500);
      const title = cleanText(await page.locator('h1, h2').first().innerText().catch(() => listing.text));
      const bodyText = cleanText(await page.locator('body').innerText());
      const location = cleanText(
        bodyText.match(/(?:Location|Job Location)\s*:?\s*(.+?)(?:\s+(?:Department|Employment Type|Description|Job Type))/i)?.[1]
          ?? listing.containerText.match(/([A-Za-z .'-]+,\s*[A-Z]{2})/)?.[1]
          ?? 'United States',
      );
      const id = url.match(/\/listings\/([^/?#]+)/)?.[1] ?? url.match(/[?&](?:id|gh_jid)=([^&#]+)/)?.[1] ?? slug(title);
      const job = normalizeStaticJob(company, { id, title, location, description: bodyText, url });
      if (job) jobs.push(job);
    }
    return jobs;
  } finally {
    await context.close();
    await browser.close();
  }
}

export async function fetchFirstPartyCareerJobs(company: FirstPartyCareerSeed): Promise<NormalizedJob[]> {
  if (!company.verified) return [];
  try {
    if (company.kind === 'solar-optimum') return fetchSolarOptimum(company);
    if (company.kind === 'gamechange') return fetchGameChange(company);
    return fetchRenderedListings(company);
  } catch (error) {
    console.warn(
      `[first-party-careers] ${company.name}: fetch failed — ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
}
