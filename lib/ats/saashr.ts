import { chromium } from 'playwright';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export type SaaShrCompanySeed = {
  careersUrl: string;
  name: string;
  verified: boolean;
};

type Listing = { externalId: string; title: string };

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export async function fetchSaaShrJobs(company: SaaShrCompanySeed): Promise<NormalizedJob[]> {
  if (!company.verified) return [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT, locale: 'en-US' });
  const page = await context.newPage();

  try {
    await page.goto(company.careersUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.locator('.c-job-header').first().waitFor({ timeout: 30_000 });
    const listings = await page.locator('.c-job-header').evaluateAll((headers) =>
      headers.map((header) => ({
        externalId: header.querySelector('button[data-tracking-id]')?.getAttribute('data-tracking-id') ?? '',
        title: (header.querySelector('.c-job-header__name')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      })).filter((job) => job.externalId && job.title),
    ) as Listing[];

    const jobs: NormalizedJob[] = [];

    // SaaSHR boards are small and several valid roles use generic titles such
    // as "Commercial Service Electrician". Read each detail before taxonomy.
    for (const listing of listings) {
      try {
        await page.goto(company.careersUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await page.locator('.c-job-header').first().waitFor({ timeout: 30_000 });
        await page.getByText(listing.title, { exact: true }).first().click();
        await page.getByText('Description', { exact: true }).first().waitFor({ timeout: 20_000 });
        // The shell and labels render before the description payload.
        await page.waitForTimeout(1_500);
        const bodyText = cleanText(await page.locator('body').innerText());
        const location = cleanText(bodyText.match(/Location\s+(.+?)\s+(?:Base Pay|Employee Type|Description)/i)?.[1] ?? '');
        const description = cleanText(
          bodyText.match(/Description\s+([\s\S]+?)(?:\s+Apply\s*$|$)/i)?.[1] ?? bodyText,
        );
        if (!description || !isSolarInstallerRole(listing.title, description)) continue;

        const url = `${company.careersUrl}#${listing.externalId}`;
        jobs.push({
          source: 'saashr',
          externalId: listing.externalId,
          title: listing.title,
          company: company.name,
          location,
          addressRegion: extractStateFromLocation(location),
          description,
          url,
          applyUrl: company.careersUrl,
        });
      } catch (error) {
        console.warn(
          `[saashr] ${company.name}: ${listing.title} skipped — ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return jobs;
  } catch (error) {
    console.warn(`[saashr] ${company.name}: fetch failed — ${error instanceof Error ? error.message : String(error)}`);
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}
