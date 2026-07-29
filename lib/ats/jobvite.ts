import * as cheerio from 'cheerio';
import { isSolarInstallerRole, isGenericInstallerTitle } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { NormalizedJob } from './types'; // adapte si ton fichier partagé s'appelle autrement
import type { AtsCompanySeed } from './company-seed';


const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';
const LIST_URL = (slug: string) => `https://jobs.jobvite.com/${slug}/jobs`;

interface ScrapedJobRow {
  title: string;
  href: string;
  location: string;
}

interface JobDetail {
  description: string;
  location: string;
}

// Conteneurs de ligne possibles, du plus spécifique au plus générique.
// On essaie chacun dans l'ordre et on garde le premier qui donne un
// ancêtre réel (row.length > 0) — avant on ne testait qu'une seule
// liste de sélecteurs, donc si aucun ne matchait pour le site en cours
// on retombait silencieusement sur a.parent(), qui ne contient que le
// titre lui-même => location toujours vide (bug enphase-energy).
const ROW_CONTAINER_SELECTORS = [
  '.jv-job-list-single',
  'li.jv-job-list-item',
  '[data-testid="job-list-item"]',
  'li',
];

// Sélecteurs dédiés à la location sur la page LISTE, quand le markup
// les expose. Gardé comme fallback de dernier recours seulement — en
// pratique la location de la page detail (DETAIL_LOCATION_SELECTORS
// plus bas) s'est révélée bien plus fiable, donc c'est elle la source
// principale désormais.
const LOCATION_SELECTORS = [
  '.jv-job-list-location',
  '.jv-job-list-job-location',
  '[data-testid="job-list-location"]',
  '[class*="location"]',
];

// Sélecteurs de location sur la page DETAIL d'un job — c'est la source
// principale maintenant (voir fetchJobDetail).
const DETAIL_LOCATION_SELECTORS = [
  '.jv-job-detail-location',
  '.jv-page-header [class*="location"]',
  '[data-testid="job-detail-location"]',
  '[class*="location"]',
];

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function findRowContainer($: cheerio.CheerioAPI, anchor: cheerio.Cheerio<any>) {
  for (const selector of ROW_CONTAINER_SELECTORS) {
    const row = anchor.closest(selector);
    if (row.length) return row;
  }
  return null;
}

function extractLocationFromTitle(title: string): string {
  const dashIndex = title.lastIndexOf(' - ');
  if (dashIndex === -1) return '';

  let loc = title.slice(dashIndex + 3).trim();
  loc = loc.replace(/\(.*?\)\s*$/, '').trim(); // vire "(6 month Temporary Assignment)"
  return loc;
}

// Extraction "best effort" depuis la page liste — utilisée seulement
// comme dernier filet de sécurité si la page detail ne donne rien.
function extractListLocation($: cheerio.CheerioAPI, row: cheerio.Cheerio<any> | null, title: string): string {
  if (row) {
    for (const selector of LOCATION_SELECTORS) {
      const loc = row.find(selector).first().text().trim();
      if (loc) return loc;
    }
    const stripped = row.text().replace(title, '').trim();
    if (stripped) return stripped;
  }
  return extractLocationFromTitle(title);
}

function parseJobRows(html: string): ScrapedJobRow[] {
  const $ = cheerio.load(html);

  const SELECTORS = [
    '.jv-job-list .jv-job-list-name a',
    '[data-testid="job-list-item"] a',
    'a[href*="/job/"]',
  ];

  for (const selector of SELECTORS) {
    const anchors = $(selector);
    if (anchors.length === 0) continue;

    const rows: ScrapedJobRow[] = [];
    anchors.each((_, el) => {
      const a = $(el);
      const href = a.attr('href') ?? '';
      const title = a.text().trim();
      if (!title || !href) return;

      const row = findRowContainer($, a);
      const location = extractListLocation($, row, title);

      rows.push({
        title,
        href: href.startsWith('http') ? href : new URL(href, LIST_URL('')).toString(),
        location,
      });
    });

    if (rows.length > 0) return rows;
  }

  return [];
}

function extractIdFromHref(href: string): string {
  const match = href.match(/\/job\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : href;
}

// Va chercher la description ET la location sur la page detail d'un
// job — la location y est quasi toujours présente et fiable, contrairement
// à la page liste dont le markup varie trop d'une entreprise à l'autre.
async function fetchJobDetail(href: string): Promise<JobDetail> {
  try {
    const html = await fetchHtml(href);
    const $ = cheerio.load(html);

    const descContainer = $('.jv-job-detail-description, .jv-page-body, main').first();
    const description = (descContainer.length ? descContainer.text() : $('body').text())
      .replace(/\s+/g, ' ')
      .trim();

    let location = '';
    for (const selector of DETAIL_LOCATION_SELECTORS) {
      const loc = $(selector).first().text().trim();
      if (loc) {
        location = loc;
        break;
      }
    }

    return { description, location };
  } catch (err) {
    console.warn(`[jobvite] échec récupération détail ${href}: ${(err as Error).message}`);
    return { description: '', location: '' };
  }
}

export async function fetchJobviteJobs(company: AtsCompanySeed): Promise<NormalizedJob[]> {
  let rows: ScrapedJobRow[];

  try {
    const html = await fetchHtml(LIST_URL(company.slug));
    rows = parseJobRows(html);
  } catch (err) {
    console.warn(`[jobvite] ${company.slug}: fetch/parse échoué, skipping — ${(err as Error).message}`);
    return [];
  }

  if (rows.length === 0) {
    console.warn(
      `[jobvite] ${company.slug}: 0 ligne trouvée — soit pas d'offres, soit le rendu nécessite du JS (à vérifier manuellement).`
    );
  }

  const results: NormalizedJob[] = [];
  let emptyLocationCount = 0;

  for (const r of rows) {
    // Pré-filtre sur le titre seul pour éviter de fetcher le detail de
    // chaque job du board (ex. "Marketing Manager" n'a aucune raison
    // d'être fetché) — mais dès qu'un titre est candidat (solaire clair
    // OU générique à vérifier), on va chercher le detail dans tous les
    // cas, pour la description ET pour une location fiable.
    if (!isSolarInstallerRole(r.title) && !isGenericInstallerTitle(r.title)) continue;

    const { description, location: detailLocation } = await fetchJobDetail(r.href);

    if (!isSolarInstallerRole(r.title, description)) continue;

    const location = detailLocation || r.location;
    if (!location) emptyLocationCount++;

    results.push(normalize(r, company, description, location));
  }

  if (emptyLocationCount > 0) {
    console.warn(
      `[jobvite] ${company.slug}: ${emptyLocationCount} job(s) matché(s) sans location (ni page detail, ni liste) — à vérifier manuellement.`
    );
  }

  return results;
}

function normalize(r: ScrapedJobRow, company: AtsCompanySeed, description: string, location: string): NormalizedJob {
  const id = extractIdFromHref(r.href);
  return {
    source: 'jobvite',
    externalId: id,
    title: r.title,
    company: company.name,
    location,
    addressRegion: extractStateFromLocation(location),
    description,
    url: r.href,
    applyUrl: r.href,
    contractType: undefined,
    postedAt: undefined,
    salary: undefined,
  };
}