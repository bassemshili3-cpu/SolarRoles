/**
 * Jobvite ATS provider — https://jobs.jobvite.com/{slug}/jobs
 *
 * Jobvite career sites sont des SPA : le HTML initial ne contient PAS la
 * liste des jobs (juste un placeholder "There are currently no open jobs"
 * tant que le JS n'a pas résolu son appel XHR interne). Un simple fetch()
 * ne peut donc rien extraire — on rend la page avec Playwright et on
 * attend que le DOM soit hydraté avant de parser.
 *
 * ⚠️ Les sélecteurs CSS ci-dessous (JOB_ITEM_SELECTORS) sont une best
 * guess basée sur les classes jv-* documentées publiquement — je n'ai
 * pas pu inspecter le DOM hydraté réel. Avant de lancer ça en prod,
 * lance `npx tsx scripts/debug-jobvite.ts freedomforever` (fourni plus
 * bas) et ajuste JOB_ITEM_SELECTORS si le count reste à 0.
 */

import { chromium, type Browser } from 'playwright';
import { isSolarInstallerRole } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { NormalizedJob } from './ashby';
import type { AtsCompanySeed } from './company-seed';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';
const LIST_URL = (slug: string) => `https://jobs.jobvite.com/${slug}/jobs`;

// Délai max pour laisser le XHR interne de Jobvite se résoudre.
const NAV_TIMEOUT_MS = 20_000;
const HYDRATION_WAIT_MS = 1_500;

// Plusieurs sélecteurs candidats, essayés dans l'ordre — Jobvite ne
// documente pas ses classes publiquement et elles varient parfois d'un
// tenant à l'autre selon le thème appliqué au career site.
const JOB_ITEM_SELECTORS = [
  '.jv-job-list .jv-job-list-name a',
  '[data-testid="job-list-item"] a',
  'a[href*="/job/"]',
];

interface ScrapedJobRow {
  title: string;
  href: string;
  location: string;
}

let sharedBrowser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!sharedBrowser) {
    sharedBrowser = await chromium.launch({ headless: true });
  }
  return sharedBrowser;
}

export async function closeJobviteBrowser(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}

async function scrapeJobRows(slug: string): Promise<ScrapedJobRow[]> {
  const browser = await getBrowser();
  const page = await browser.newPage({ userAgent: USER_AGENT });

  try {
    await page.goto(LIST_URL(slug), {
      waitUntil: 'networkidle',
      timeout: NAV_TIMEOUT_MS,
    });

    // Laisse un peu de marge après networkidle : certains career sites
    // Jobvite font un second appel (pagination/lazy-load) juste après
    // le rendu initial.
    await page.waitForTimeout(HYDRATION_WAIT_MS);

    let rows: ScrapedJobRow[] = [];

    for (const selector of JOB_ITEM_SELECTORS) {
      const found = await page.$$eval(selector, (els) =>
        els
          .map((el) => {
            const a = el as HTMLAnchorElement;
            // La location est souvent dans un élément frère/parent proche —
            // on remonte au conteneur de la ligne et on prend son texte,
            // en retirant le titre pour ne garder que le reste (location).
            const row = a.closest('li, .jv-job-list-item, [data-testid="job-list-item"]') ?? a.parentElement;
            const rowText = row?.textContent?.replace(a.textContent ?? '', '').trim() ?? '';
            return {
              title: a.textContent?.trim() ?? '',
              href: a.href,
              location: rowText,
            };
          })
          .filter((j) => j.title && j.href),
      );

      if (found.length > 0) {
        rows = found;
        break;
      }
    }

    return rows;
  } finally {
    await page.close();
  }
}

function extractIdFromHref(href: string): string {
  // ex: https://jobs.jobvite.com/freedomforever/job/ofPgufwy → "ofPgufwy"
  const match = href.match(/\/job\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : href;
}

export async function fetchJobviteJobs(company: AtsCompanySeed): Promise<NormalizedJob[]> {
  let rows: ScrapedJobRow[];

  try {
    rows = await scrapeJobRows(company.slug);
  } catch (err) {
    console.warn(`[jobvite] ${company.slug}: scrape failed, skipping — ${(err as Error).message}`);
    return [];
  }

  const matched = rows.filter((r) => isSolarInstallerRole(r.title));

  return matched.map((r) => {
    const id = extractIdFromHref(r.href);
    return {
      source: 'jobvite',
      externalId: id,
      title: r.title,
      company: company.name,
      location: r.location,
      addressRegion: extractStateFromLocation(r.location),
      description: '', // detail page = 2e call si tu veux le JD complet plus tard
      url: r.href,
      applyUrl: r.href,
      contractType: undefined,
      postedAt: undefined, // pas fiable à extraire du DOM listing — à faire depuis la page détail si besoin
      salary: undefined,
    };
  });
}