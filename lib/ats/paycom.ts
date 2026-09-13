import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isGenericInstallerTitle, isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export type PaycomCompanySeed = {
  clientKey: string;
  name: string;
  verified: boolean;
};

type PaycomPosting = {
  jobId?: number;
  jobTitle?: string;
  location?: string;
  positionType?: string;
  salaryRange?: string;
  description?: string;
  qualifications?: string;
  googleJobJson?: string;
};

function textFromHtml(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
}

function validDate(raw: unknown): Date | undefined {
  if (typeof raw !== 'string') return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function fetchPaycomJobs(company: PaycomCompanySeed): Promise<NormalizedJob[]> {
  if (!company.verified) return [];

  const baseUrl = `https://www.paycomonline.net/v4/ats/web.php/portal/${company.clientKey}`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: USER_AGENT, locale: 'en-US' });
  const listingPage = await context.newPage();

  try {
    await listingPage.goto(`${baseUrl}/career-page`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await listingPage.getByText(/\d+ Results?/).first().waitFor({ timeout: 30_000 });
    const resultText = await listingPage.getByText(/\d+ Results?/).first().innerText();
    const total = Number(resultText.match(/\d+/)?.[0] ?? 0);
    const pages = Math.max(1, Math.ceil(total / 10));
    const listings = new Map<string, string>();

    for (let pageNumber = 1; pageNumber <= pages; pageNumber++) {
      if (pageNumber > 1) {
        const response = listingPage.waitForResponse((candidate) => candidate.url().includes('/job-posting-previews/search'));
        await listingPage.getByRole('button', { name: String(pageNumber), exact: true }).click();
        await response;
      }

      const current = await listingPage.locator('a').evaluateAll((anchors) => anchors
        .filter((anchor) => /\/jobs\/\d+/.test((anchor as HTMLAnchorElement).href))
        .map((anchor) => ({
          url: (anchor as HTMLAnchorElement).href,
          title: anchor.querySelector('h2')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        })));
      for (const job of current) if (job.title) listings.set(job.url, job.title);
    }

    console.log(`[paycom] ${company.name}: ${listings.size} postes bruts découverts`);
    const detailPage = await context.newPage();
    const results: NormalizedJob[] = [];

    for (const [url, listingTitle] of listings) {
      if (!isSolarInstallerRole(listingTitle) && !isGenericInstallerTitle(listingTitle)) continue;
      const id = new URL(url).pathname.match(/\/jobs\/(\d+)/)?.[1];
      if (!id) continue;

      try {
        const responsePromise = detailPage.waitForResponse((response) => response.url().endsWith(`/job-postings/${id}`));
        await detailPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        const payload = await (await responsePromise).json() as { jobPosting?: PaycomPosting };
        const posting = payload.jobPosting;
        if (!posting?.jobTitle) continue;
        const description = textFromHtml([posting.description, posting.qualifications].filter(Boolean).join('\n'));
        if (!isSolarInstallerRole(posting.jobTitle, description)) continue;

        let schema: { datePosted?: string } = {};
        try {
          schema = JSON.parse(posting.googleJobJson ?? '{}') as { datePosted?: string };
        } catch {
          // The source date is optional; never substitute the crawl date.
        }
        const location = posting.location ?? '';
        results.push({
          source: 'paycom',
          externalId: String(posting.jobId ?? id),
          title: posting.jobTitle,
          company: company.name,
          location,
          addressRegion: extractStateFromLocation(location),
          description,
          url,
          applyUrl: url,
          contractType: posting.positionType,
          postedAt: validDate(schema.datePosted),
          salary: posting.salaryRange || undefined,
        });
      } catch (error) {
        console.warn(`[paycom] ${company.name}: détail ignoré (${id}) — ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    await detailPage.close();
    return results;
  } catch (error) {
    console.warn(`[paycom] ${company.name}: fetch échoué — ${error instanceof Error ? error.message : String(error)}`);
    return [];
  } finally {
    await context.close();
    await browser.close();
  }
}
