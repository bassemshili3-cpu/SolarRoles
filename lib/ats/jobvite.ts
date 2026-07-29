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

// Sélecteurs dédiés à la location quand le markup les expose — plus
// fiable que "tout le texte de la ligne moins le titre", qui casse dès
// que la ligne contient d'autres bouts de texte (département, tag
// "remote", etc.) en plus du titre et de la location.
const LOCATION_SELECTORS = [
  '.jv-job-list-location',
  '.jv-job-list-job-location',
  '[data-testid="job-list-location"]',
  '[class*="location"]',
];

// Fallback conservé au cas où le rendu s'avère bien JS-dépendant sur certaines
// entreprises — permet de le réactiver ciblé sans tout réécrire.
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

function extractLocation($: cheerio.CheerioAPI, row: cheerio.Cheerio<any> | null, title: string): string {
  if (row) {
    for (const selector of LOCATION_SELECTORS) {
      const loc = row.find(selector).first().text().trim();
      if (loc) return loc;
    }
    const stripped = row.text().replace(title, '').trim();
    if (stripped) return stripped;
  }

  // Dernier recours : parser le titre lui-même.
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
      const location = extractLocation($, row, title);

      rows.push({
        title,
        href: href.startsWith('http') ? href : new URL(href, LIST_URL('')).toString(),
        location,
      });
    });

    if (rows.length > 0) {
      const emptyLocations = rows.filter((r) => !r.location).length;
      if (emptyLocations > 0) {
        console.warn(
          `[jobvite] ${emptyLocations}/${rows.length} ligne(s) sans location détectée avec le sélecteur "${selector}" — markup à vérifier manuellement.`
        );
      }
      return rows;
    }
  }

  return [];
}

function extractIdFromHref(href: string): string {
  const match = href.match(/\/job\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : href;
}

async function fetchJobDescription(href: string): Promise<string> {
  try {
    const html = await fetchHtml(href);
    const $ = cheerio.load(html);
    // Sélecteur à ajuster si besoin — Jobvite met en général le détail
    // dans un conteneur type .jv-job-detail-description ou similaire.
    const container = $('.jv-job-detail-description, .jv-page-body, main').first();
    const text = (container.length ? container.text() : $('body').text())
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  } catch (err) {
    console.warn(`[jobvite] échec récupération description ${href}: ${(err as Error).message}`);
    return '';
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

  for (const r of rows) {
    // Tier 1 : le titre seul suffit, pas besoin de description.
    if (isSolarInstallerRole(r.title)) {
      results.push(normalize(r, company, ''));
      continue;
    }

    // Tier 2 : titre générique → on va chercher la description sur la
    // page détail, uniquement pour ces cas-là (pour limiter les requêtes).
    if (isGenericInstallerTitle(r.title)) {
      const description = await fetchJobDescription(r.href);
      if (isSolarInstallerRole(r.title, description)) {
        results.push(normalize(r, company, description));
      }
    }
  }

  return results;
}

function normalize(r: ScrapedJobRow, company: AtsCompanySeed, description: string): NormalizedJob {
  const id = extractIdFromHref(r.href);
  return {
    source: 'jobvite',
    externalId: id,
    title: r.title,
    company: company.name,
    location: r.location,
    addressRegion: extractStateFromLocation(r.location),
    description,
    url: r.href,
    applyUrl: r.href,
    contractType: undefined,
    postedAt: undefined,
    salary: undefined,
  };
}