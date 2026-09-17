import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isGenericInstallerTitle, isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

chromium.use(StealthPlugin());

export type QcellsCompanySeed = {
  name: string;
  baseUrl: string;
  verified: boolean;
};

type Listing = { externalId: string; title: string; url: string };

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export async function fetchQcellsJobs(company: QcellsCompanySeed): Promise<NormalizedJob[]> {
  if (!company.verified) return [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT, locale: 'en-US' });
  const page = await context.newPage();

  try {
    const listings = new Map<string, Listing>();
    for (let pageNumber = 1; pageNumber <= 40; pageNumber++) {
      const url = `${company.baseUrl}/jobs/search${pageNumber === 1 ? '' : `?page=${pageNumber}`}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.locator('a[href*="/jobs/"]').first().waitFor({ timeout: 30_000 });

      const current = await page.locator('a[href*="/jobs/"]').evaluateAll((anchors) =>
        anchors.map((anchor) => ({
          title: (anchor.textContent ?? '').replace(/\s+/g, ' ').trim(),
          url: (anchor as HTMLAnchorElement).href,
        })),
      );

      let added = 0;
      for (const item of current) {
        const externalId = item.url.match(/\/jobs\/(\d+)-/)?.[1];
        if (!externalId || !item.title || listings.has(externalId)) continue;
        listings.set(externalId, { externalId, title: item.title, url: item.url });
        added++;
      }
      if (added === 0) break;
    }

    const candidates = [...listings.values()].filter(
      (job) => isSolarInstallerRole(job.title) || isGenericInstallerTitle(job.title),
    );
    const jobs: NormalizedJob[] = [];

    for (const listing of candidates) {
      try {
        await page.goto(listing.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        const title = cleanText(await page.locator('h1').first().innerText());
        const body = page.locator('main').first();
        const bodyText = cleanText((await body.count()) ? await body.innerText() : await page.locator('body').innerText());
        const locationMatch = bodyText.match(/Location:\s*(.+?)(?:Location Type:|Description)/i);
        const location = cleanText(locationMatch?.[1] ?? '')
          .replace(/\s+Share:.*$/i, '')
          .replace(/\s+Apply Now.*$/i, '')
          .trim();
        const description = cleanText(bodyText.replace(/^[\s\S]*?Description\s*/i, ''));
        if (!description || !isSolarInstallerRole(title || listing.title, description)) continue;

        jobs.push({
          source: 'qcells',
          externalId: listing.externalId,
          title: title || listing.title,
          company: company.name,
          location,
          addressRegion: extractStateFromLocation(location),
          isRemote: /\bremote\b/i.test(location) && /\bUnited States\b/i.test(location),
          description,
          url: listing.url,
          applyUrl: listing.url,
        });
      } catch (error) {
        console.warn(
          `[qcells] ${listing.externalId} skipped — ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return jobs;
  } catch (error) {
    console.warn(`[qcells] fetch failed — ${error instanceof Error ? error.message : String(error)}`);
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}
