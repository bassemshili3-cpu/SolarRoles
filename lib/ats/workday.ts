// lib/ats/workday.ts
/**
 * Workday ATS provider — utilisé par la plupart des gros installateurs
 * solaires nationaux (Sunrun confirmé, à vérifier au cas par cas pour
 * les autres). API CXS non officiellement documentée par Workday mais
 * stable et largement reverse-engineered.
 *
 * Format d'URL Workday : https://{tenant}.{host}.myworkdayjobs.com/{site}
 * ex: https://sunrun.wd5.myworkdayjobs.com/Sunrun_Careers
 *   → tenant = 'sunrun', host = 'wd5', site = 'Sunrun_Careers'
 *
 * IMPORTANT : contrairement à Greenhouse/Lever, il n'y a pas de "slug"
 * unique — il faut les 3 valeurs (tenant/host/site), à vérifier à la
 * main sur la vraie page carrière avant d'ajouter une entreprise ici.
 *
 * VERSION PLAYWRIGHT
 * -------------------
 * Certains tenants Workday sont derrière Akamai et bloquent les appels
 * fetch/axios "nus" (pas de JS challenge résolu, TLS fingerprint suspect,
 * headers incohérents). Ici on:
 *   1. Lance un vrai navigateur Chromium headless
 *   2. Navigue vers la page carrière publique (résout le JS challenge,
 *      pose les cookies de session Akamai/Workday normalement)
 *   3. Exécute les appels à l'API CXS via `page.evaluate(...)`, donc le
 *      fetch part *depuis* la page (même origine, mêmes cookies, même
 *      fingerprint TLS/JS que n'importe quel visiteur) plutôt que depuis
 *      Node directement.
 *
 * Un seul Browser est partagé entre toutes les entreprises (coûteux à
 * lancer), mais chaque entreprise a son propre BrowserContext (donc ses
 * propres cookies) fermé à la fin de son traitement. Pense à appeler
 * `closeWorkdayBrowser()` une fois le run terminé (fin de cron/script).
 */

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { isSolarInstallerRole } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { NormalizedJob } from './types';

export interface WorkdayCompanySeed {
  tenant: string;   // ex: 'sunrun'
  host: string;     // ex: 'wd5' (wd1 à wd5 selon l'entreprise)
  site: string;     // ex: 'Sunrun_Careers'
  name: string;
  verified: boolean;
}

const PAGE_SIZE = 20;
const REQUEST_DELAY_MS = 400; // politesse — Workday a de l'anti-bot (Akamai) sur certains tenants
const NAV_TIMEOUT_MS = 30_000;
const MAX_OFFSET = 5000; // plafond de sécurité (250 pages) au cas où un tenant renvoie des pages en boucle

const REALISTIC_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const US_STATE_ABBR = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

// Workday renvoie souvent "ST, City" (ex: "NJ, Somerset") au lieu du
// format habituel "City, ST" attendu par isUSJob()/extractStateFromLocation()
// dans le reste du pipeline. On normalise ici, à la source.
// Reconnaît un code d'état US isolé (entouré de non-lettres) n'importe où
// dans la chaîne — couvre "NJ, Somerset" ET "BRANCH - CA - Bay Area South".
function normalizeWorkdayLocation(raw: string): string {
  const trimmed = raw.trim();

  // Cas 1 (déjà géré) : "ST, City"
  const commaMatch = trimmed.match(/^([A-Za-z]{2}),\s*(.+)$/);
  if (commaMatch && US_STATE_ABBR.has(commaMatch[1].toUpperCase())) {
    const [, state, city] = commaMatch;
    return `${city}, ${state.toUpperCase()}`;
  }

  // Cas 2 (nouveau) : état isolé n'importe où, ex "BRANCH - CA - Bay Area South",
  // "Region: TX - Austin", etc. On prend le token qui matche exactement un
  // abbr d'état US et on reconstruit "reste, ST".
  const tokens = trimmed.split(/[\s\-–,]+/).filter(Boolean);
  const stateToken = tokens.find((t) => US_STATE_ABBR.has(t.toUpperCase()));
  if (stateToken) {
    const rest = tokens.filter((t) => t !== stateToken).join(' ');
    return `${rest}, ${stateToken.toUpperCase()}`;
  }

  return raw; // ni virgule ni token d'état trouvé — laissé tel quel, sera géré par le fallback détail
}

function resolveLocation(p: WorkdayJobPosting, detailLocation?: string): string {
  const raw = p.locationsText ?? p.bulletFields?.[0] ?? '';

  // "N Locations" (ou vide) n'est pas exploitable : on préfère la
  // localisation renvoyée par l'appel détail (jobPostingInfo.location),
  // récupérée en même temps que la description.
  if (/^\d+\s+Location/i.test(raw.trim()) || !raw.trim()) {
    if (detailLocation) return normalizeWorkdayLocation(detailLocation);
    return raw;
  }

  return normalizeWorkdayLocation(raw);
}

interface WorkdayJobPosting {
  title: string;
  externalPath: string;
  locationsText?: string;
  bulletFields?: string[];
  postedOn?: string;
  jobPostingId?: string;
}

interface WorkdayJobsResponse {
  total: number;
  jobPostings: WorkdayJobPosting[];
}

interface WorkdayJobDetailResponse {
  jobPostingInfo?: {
    jobDescription?: string; // HTML
    location?: string;
    startDate?: string;
    jobReqId?: string;
  };
}

function cxsBaseUrl(company: WorkdayCompanySeed): string {
  return `https://${company.tenant}.${company.host}.myworkdayjobs.com/wday/cxs/${company.tenant}/${company.site}`;
}

// URL de la vraie page carrière — c'est là qu'on navigue en premier
// pour obtenir une session légitime (cookies Akamai/Workday, JS
// challenge résolu par le vrai moteur du navigateur).
function careerPageUrl(company: WorkdayCompanySeed): string {
  return `https://${company.tenant}.${company.host}.myworkdayjobs.com/${company.site}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------
// Gestion du navigateur partagé
// ---------------------------------------------------------------------

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: [
        // réduit les signaux d'automatisation les plus grossiers détectés
        // par les scripts anti-bot type Akamai/Distil
        '--disable-blink-features=AutomationControlled',
      ],
    });
  }
  return browserPromise;
}

/** À appeler en fin de run (script/cron) pour libérer proprement le navigateur. */
export async function closeWorkdayBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}

async function createCompanyContext(): Promise<BrowserContext> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: REALISTIC_USER_AGENT,
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });

  // masque webdriver=true, le signal le plus basique de détection headless
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  return context;
}

/**
 * Ouvre une page, navigue vers la page carrière publique pour établir
 * une session légitime (cookies + JS challenge résolus par le vrai
 * moteur du navigateur), puis renvoie la page prête à faire des appels
 * `fetch` in-page vers l'API CXS.
 */
async function openWarmedPage(company: WorkdayCompanySeed, context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.goto(careerPageUrl(company), {
    waitUntil: 'domcontentloaded',
    timeout: NAV_TIMEOUT_MS,
  });
  // laisse le temps aux éventuels scripts anti-bot / hydratation de tourner
  await page.waitForTimeout(1000);
  return page;
}

/**
 * Exécute un fetch JSON *depuis* la page (donc avec les cookies de
 * session, le fingerprint TLS/JS du navigateur, etc.) plutôt que
 * depuis Node. `url`/`init` doivent être sérialisables (pas de
 * closures) puisqu'ils traversent la frontière page.evaluate.
 */
async function fetchInPage<T>(
  page: Page,
  url: string,
  init: { method?: string; body?: unknown } = {}
): Promise<{ ok: true; status: number; data: T } | { ok: false; status: number }> {
  return page.evaluate(
    async ({ url, method, body }) => {
      const res = await fetch(url, {
        method: method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        return { ok: false as const, status: res.status };
      }
      const data = await res.json();
      return { ok: true as const, status: res.status, data };
    },
    { url, method: init.method, body: init.body }
  );
}

// ---------------------------------------------------------------------
// Récupération des postes
// ---------------------------------------------------------------------

async function fetchAllPostings(company: WorkdayCompanySeed, page: Page): Promise<WorkdayJobPosting[]> {
  const seen = new Map<string, WorkdayJobPosting>(); // dédup par externalPath, au cas où une page se répète
  let offset = 0;
  // `total` n'est pas fiable page par page (parfois 0 sur une page qui contient
  // pourtant des postes — probablement un artefact bot-mitigation), mais quand
  // il se confirme non-nul sur plusieurs pages consécutives c'est le vrai
  // décompte du tenant. On garde le dernier total non-nul vu comme plafond réel.
  let knownTotal = 0;

  while (true) {
    const result = await fetchInPage<WorkdayJobsResponse>(page, `${cxsBaseUrl(company)}/jobs`, {
      method: 'POST',
      body: { appliedFacets: {}, limit: PAGE_SIZE, offset, searchText: '' },
    });

    if (!result.ok) {
      console.warn(`[workday] ${company.tenant}/${company.site}: HTTP ${result.status}, skipping`);
      break;
    }

    const { data } = result;
    const postings = data.jobPostings ?? [];
    if (data.total) knownTotal = data.total;

    console.log(
      `[workday] ${company.tenant} offset=${offset}: total=${data.total} (known=${knownTotal}), got=${postings.length}`
    );

    // debug ponctuel — dump des clés du premier poste pour identifier
    // le vrai nom du champ id (jobPostingId semble absent)
    if (offset === 0 && postings[0]) {
      console.log(`[workday] ${company.tenant} keys du 1er posting:`, Object.keys(postings[0]));
    }

    let newCount = 0;
    for (const p of postings) {
      const key = p.externalPath;
      if (!seen.has(key)) {
        seen.set(key, p);
        newCount++;
      }
    }

    // fin réelle : page vide, plus aucun poste nouveau (on boucle sur les
    // mêmes résultats — arrive quand offset dépasse le total réel), ou
    // offset qui a rattrapé le total connu et fiable.
    if (postings.length === 0) break;
    if (newCount === 0) {
      console.warn(`[workday] ${company.tenant}: page identique à une page déjà vue à offset=${offset}, arrêt`);
      break;
    }
    if (knownTotal > 0 && offset + PAGE_SIZE >= knownTotal) break;

    offset += PAGE_SIZE;
    if (offset >= MAX_OFFSET) {
      console.warn(`[workday] ${company.tenant}: plafond de sécurité atteint (${MAX_OFFSET}), arrêt`);
      break;
    }

    await sleep(REQUEST_DELAY_MS);
  }

  return Array.from(seen.values());
}

async function fetchJobDescription(company: WorkdayCompanySeed, page: Page, externalPath: string): Promise<string> {
  try {
    const path = externalPath.replace(/^\/job/, '');
    const result = await fetchInPage<WorkdayJobDetailResponse>(page, `${cxsBaseUrl(company)}/job${path}`);
    if (!result.ok) return '';
    return stripHtml(result.data.jobPostingInfo?.jobDescription ?? '');
  } catch (err) {
    console.warn(`[workday] échec récupération description ${externalPath}: ${(err as Error).message}`);
    return '';
  }
}

async function fetchJobDetail(
  company: WorkdayCompanySeed,
  page: Page,
  externalPath: string
): Promise<{ description: string; location?: string }> {
  try {
    const path = externalPath.replace(/^\/job/, '');
    const result = await fetchInPage<WorkdayJobDetailResponse>(page, `${cxsBaseUrl(company)}/job${path}`);
    if (!result.ok) return { description: '' };
    return {
      description: stripHtml(result.data.jobPostingInfo?.jobDescription ?? ''),
      location: result.data.jobPostingInfo?.location,
    };
  } catch (err) {
    console.warn(`[workday] échec récupération description ${externalPath}: ${(err as Error).message}`);
    return { description: '' };
  }
}


export async function fetchWorkdayJobs(company: WorkdayCompanySeed): Promise<NormalizedJob[]> {
  const context = await createCompanyContext();
  let page: Page;

  try {
    page = await openWarmedPage(company, context);
  } catch (err) {
    console.warn(`[workday] ${company.tenant}/${company.site}: navigation échouée — ${(err as Error).message}`);
    await context.close();
    return [];
  }

  let postings: WorkdayJobPosting[];
  try {
    postings = await fetchAllPostings(company, page);
  } catch (err) {
    console.warn(`[workday] ${company.tenant}/${company.site}: fetch échoué — ${(err as Error).message}`);
    await context.close();
    return [];
  }

  console.log(`[workday] ${company.tenant}/${company.site}: ${postings.length} postes bruts reçus`);

  const results: NormalizedJob[] = [];

  try {
    for (const p of postings) {
  const detail = await fetchJobDetail(company, page, p.externalPath);
  await sleep(REQUEST_DELAY_MS);

  if (isSolarInstallerRole(p.title, detail.description)) {
    results.push(normalize(company, p, detail.description, detail.location));
  }
}
  } finally {
    await context.close();
  }

  return results;
}

function normalize(
  company: WorkdayCompanySeed,
  p: WorkdayJobPosting,
  description: string,
  detailLocation?: string
): NormalizedJob {
  const location = resolveLocation(p, detailLocation);
  const url = `https://${company.tenant}.${company.host}.myworkdayjobs.com/${company.site}${p.externalPath}`;
  return {
    source: 'workday',
    externalId: p.jobPostingId ?? p.externalPath,
    title: p.title,
    company: company.name,
    location,
    addressRegion: extractStateFromLocation(location),
    description,
    url,
    applyUrl: url,
    contractType: undefined,
    postedAt: undefined, // postedOn est du texte relatif ("Posted 3 Days Ago"), pas une vraie date exploitable
    salary: undefined,
  };
}