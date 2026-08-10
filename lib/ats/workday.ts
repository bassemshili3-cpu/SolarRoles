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
import { STATE_CODE_TO_NAME } from '@/lib/usStates';

const FULL_STATE_NAMES = new Set(
  Object.values(STATE_CODE_TO_NAME).map((n) => n.toLowerCase())
);


export interface WorkdayCompanySeed {
  tenant: string;   // ex: 'sunrun'
  host: string;     // ex: 'wd5' (wd1 à wd5 selon l'entreprise)
  site: string;     // ex: 'Sunrun_Careers'
  name: string;
  verified: boolean;
}

const PAGE_SIZE = 20;
const REQUEST_DELAY_MIN_MS = 300;
const REQUEST_DELAY_MAX_MS = 900; // politesse — Workday a de l'anti-bot (Akamai) sur certains tenants ; plage aléatoire plutôt que fixe pour éviter un pattern de timing trop régulier
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

// Certains tenants Workday utilisent bulletFields[0] pour un facet
// "arrangement de travail" (Field/Remote/Hybrid/Office/...) plutôt que pour
// la localisation — ex: solvenergy renvoie "Field" à cette position pour
// les rôles terrain. On refuse ces valeurs connues comme non-localisation
// plutôt que de les accepter aveuglément.
const NON_LOCATION_BULLET_VALUES = new Set([
  'field', 'remote', 'hybrid', 'onsite', 'on-site', 'office',
  'flexible', 'virtual', 'various', 'various locations',
]);

function isUsableLocationText(raw: string | undefined): raw is string {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (/^\d+\s+Location/i.test(trimmed)) return false;
  if (NON_LOCATION_BULLET_VALUES.has(trimmed.toLowerCase())) return false;
  return true;
}

// Dernier recours quand ni locationsText, ni bulletFields, ni l'appel détail
// ne donnent une localisation exploitable : certains tenants (ex: solvenergy)
// mettent la vraie localisation entre parenthèses en fin de titre, ex:
// "Solar Field Service Technician - Level 2 (Tulia, TX)".
function extractLocationFromTitle(title: string): string | undefined {
  // "(City, ST)" en fin de titre
  const paren = title.match(/\(([^()]+,\s*[A-Za-z]{2})\)\s*$/);
  if (paren) return paren[1].trim();

  // "- City, ST" en fin de titre, sans parenthèses
  const dashCityState = title.match(/[-–]\s*([^-–,]+,\s*[A-Za-z]{2})\s*$/);
  if (dashCityState) return dashCityState[1].trim();

  // "- StateFullName" en fin de titre (état seul, pas de ville) — on
  // valide contre la vraie liste d'états pour ne pas accrocher un suffixe
  // comme "-EPC" ou "-EPC" dans "High Voltage-EPC".
  const dashState = title.match(/[-–]\s*([A-Za-z ]+)\s*$/);
  if (dashState && FULL_STATE_NAMES.has(dashState[1].trim().toLowerCase())) {
    return dashState[1].trim(); // ex: "Texas" — extractStateFromLocation gère déjà les noms complets
  }

  return undefined;
}

function resolveLocation(p: WorkdayJobPosting, detailLocation?: string): string {
  if (isUsableLocationText(p.locationsText)) {
    return normalizeWorkdayLocation(p.locationsText);
  }

  const bulletRaw = p.bulletFields?.[0];
  if (isUsableLocationText(bulletRaw)) {
    return normalizeWorkdayLocation(bulletRaw);
  }

  if (isUsableLocationText(detailLocation)) {
    return normalizeWorkdayLocation(detailLocation);
  }

  const titleLocation = extractLocationFromTitle(p.title);
  if (titleLocation) {
    return normalizeWorkdayLocation(titleLocation);
  }

  if (isRemoteSignal(bulletRaw) || isRemoteSignal(p.locationsText) || isRemoteSignal(detailLocation)) {
    return 'Remote, US';
  }

  return p.locationsText || bulletRaw || '';
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

  // Diagnostic : le TypeError "Failed to fetch" levé côté page.evaluate ne
  // dit pas *pourquoi* la requête a échoué (reset Akamai, CSP, DNS...).
  // `requestfailed` expose le vrai code réseau Chromium (net::ERR_*), donc
  // on le log pour toute requête vers l'API CXS de ce tenant.
  page.on('requestfailed', (req) => {
    if (req.url().includes('/wday/cxs/')) {
      console.warn(
        `[workday] ${company.tenant}/${company.site}: requête réseau échouée — ${req.url()} — ${req.failure()?.errorText}`
      );
    }
  });

  // Filet de diagnostic secondaire : si ce n'est pas une redirection
  // cross-origin, une CSP stricte bloquant le fetch loggerait une erreur
  // explicite ici (ex: "Refused to connect to ... because it violates the
  // following Content Security Policy directive...").
  page.on('console', (msg) => {
    if (msg.type() === 'error' && /content security policy|csp|cors/i.test(msg.text())) {
      console.warn(`[workday] ${company.tenant}/${company.site}: erreur console — ${msg.text()}`);
    }
  });

  // Trace toute la chaîne de navigation. Certains tenants renvoient d'abord
  // vers un interstitiel anti-bot (ex: community.workday.com, observé sur
  // AES) via une redirection JS déclenchée APRÈS le domcontentloaded initial
  // — un check d'origine fait juste après le goto() ne le voit donc pas.
  const navigationLog: string[] = [];
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) navigationLog.push(frame.url());
  });

  await page.goto(careerPageUrl(company), {
    waitUntil: 'domcontentloaded',
    timeout: NAV_TIMEOUT_MS,
  });

  // Simule un minimum d'activité humaine avant le premier appel CXS —
  // délai variable, mouvement de souris, petit scroll — plutôt qu'un
  // waitForTimeout fixe suivi d'un appel API immédiat, pattern mécanique
  // facilement repérable par un anti-bot. Ce délai laisse aussi le temps à
  // un éventuel interstitiel anti-bot de rediriger (ou pas) vers la vraie
  // page carrière.
  await humanizePageInteraction(page);

  // Check fait après le warm-up complet — pas juste après le goto() initial
  // — pour attraper les redirections tardives. Deux signaux distincts d'un
  // gate anti-bot (pas d'un vrai mur d'authentification — sur un portail
  // carrière public, parcourir les offres ne devrait jamais exiger de
  // login ; seul l'apply le ferait) :
  //  1. Origine différente (ex: interstitiel community.workday.com sur AES)
  //  2. Même origine mais chemin de login/SSO (ex: /login, /authn, /session)
  const expectedOrigin = new URL(careerPageUrl(company)).origin;
  const finalUrl = new URL(page.url());
  const actualOrigin = finalUrl.origin;
  const looksLikeAuthRedirect = /\b(login|signin|sign-in|authn|auth|session)\b/i.test(finalUrl.pathname);

  if (actualOrigin !== expectedOrigin || looksLikeAuthRedirect) {
    const reason = actualOrigin !== expectedOrigin ? 'origine différente' : 'redirection vers login/auth';
    console.warn(
      `[workday] ${company.tenant}/${company.site}: page bloquée (${reason}) — ` +
        `attendu ${expectedOrigin}, obtenu ${page.url()} — chaîne de navigation: ` +
        `${navigationLog.join(' → ')} — probable gate anti-bot (une vraie page carrière publique ` +
        `ne devrait jamais exiger de login pour parcourir les offres), entreprise ignorée`
    );
    throw new Error(
      `redirection suspecte vers ${page.url()} (${reason}, probable anti-bot), ` +
        `impossible de récupérer les postes pour ${company.tenant}/${company.site}`
    );
  }

  return page;
}

async function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  await sleep(ms);
}

/**
 * Simule un minimum d'activité humaine sur la page après navigation, avant
 * de commencer les appels fetch in-page. Un contexte fraîchement navigué
 * qui déclenche immédiatement un appel API avec un délai fixe est lui-même
 * un signal pour les solutions anti-bot (Akamai, PerimeterX, etc.) — un
 * vrai visiteur bouge la souris, scroll un peu, et attend une durée variable
 * avant d'interagir.
 */
async function humanizePageInteraction(page: Page): Promise<void> {
  // Laisse le temps aux scripts anti-bot / hydratation de tourner, avec une
  // durée variable plutôt qu'un délai fixe et prévisible.
  await randomDelay(800, 1800);

  try {
    const viewport = page.viewportSize() ?? { width: 1280, height: 800 };

    // Quelques mouvements de souris en plusieurs étapes plutôt qu'un
    // téléport direct — Playwright peut simuler des points intermédiaires.
    const moves = 2 + Math.floor(Math.random() * 2); // 2-3 mouvements
    for (let i = 0; i < moves; i++) {
      const x = Math.floor(Math.random() * viewport.width);
      const y = Math.floor(Math.random() * viewport.height);
      await page.mouse.move(x, y, { steps: 10 + Math.floor(Math.random() * 15) });
      await randomDelay(150, 500);
    }

    // Petit scroll vertical, comme un visiteur qui parcourt la page carrière
    // avant de chercher un poste.
    const scrollAmount = 200 + Math.floor(Math.random() * 400);
    await page.mouse.wheel(0, scrollAmount);
    await randomDelay(300, 700);
  } catch {
    // Ces interactions sont un bonus de discrétion, jamais bloquantes —
    // si la page a une structure inattendue ou que le scroll échoue, on
    // continue sans faire échouer tout le run pour ça.
  }

  await randomDelay(400, 900);
}
const REMOTE_BULLET_VALUES = new Set(['remote', 'virtual']);

function isRemoteSignal(raw: string | undefined): boolean {
  if (!raw) return false;
  return REMOTE_BULLET_VALUES.has(raw.trim().toLowerCase());
}

/**
 * Exécute un fetch JSON *depuis* la page (donc avec les cookies de
 * session, le fingerprint TLS/JS du navigateur, etc.) plutôt que
 * depuis Node. `url`/`init` doivent être sérialisables (pas de
 * closures) puisqu'ils traversent la frontière page.evaluate.
 *
 * Ne catch PAS les erreurs réseau (ex: `TypeError: Failed to fetch`
 * quand Akamai reset la connexion, ou un CSP qui bloque le fetch) —
 * elles remontent telles quelles pour que `fetchInPageWithRetry`
 * puisse retenter.
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

const FETCH_MAX_RETRIES = 3;
const FETCH_RETRY_BASE_DELAY_MS = 1000; // backoff: 1s, 2s, 4s

/**
 * Variante de `fetchInPage` avec retry/backoff pour absorber les échecs
 * réseau transitoires côté navigateur (`TypeError: Failed to fetch`).
 * Ce type d'erreur ne vient PAS d'un statut HTTP (déjà géré par
 * `fetchInPage` via `ok: false`) mais d'un échec de la requête elle-même
 * — connexion resetée par un anti-bot (Akamai), CSP qui bloque le
 * `connect-src`, DNS transitoire, etc. Certains tenants Workday semblent
 * plus agressifs que d'autres à ce niveau (ex: igsenergy), donc on
 * retente avant d'abandonner.
 */
async function fetchInPageWithRetry<T>(
  company: WorkdayCompanySeed,
  page: Page,
  url: string,
  init: { method?: string; body?: unknown } = {}
): Promise<{ ok: true; status: number; data: T } | { ok: false; status: number }> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= FETCH_MAX_RETRIES; attempt++) {
    try {
      return await fetchInPage<T>(page, url, init);
    } catch (err) {
      lastErr = err;
      const message = (err as Error).message ?? String(err);
      console.warn(
        `[workday] ${company.tenant}/${company.site}: échec réseau (tentative ${attempt}/${FETCH_MAX_RETRIES}) sur ${url} — ${message}`
      );
      if (attempt < FETCH_MAX_RETRIES) {
        await sleep(FETCH_RETRY_BASE_DELAY_MS * attempt);
      }
    }
  }
  throw lastErr;
}

function assertOnExpectedOrigin(company: WorkdayCompanySeed, page: Page, expectedOrigin: string): void {
  const actualOrigin = new URL(page.url()).origin;
  if (actualOrigin !== expectedOrigin) {
    throw new Error(
      `[workday] ${company.tenant}/${company.site}: page a dérivé vers ${actualOrigin} ` +
        `en cours de scraping (probable interstitiel anti-bot déclenché après coup), arrêt`
    );
  }
}
// ---------------------------------------------------------------------
// Récupération des postes
// ---------------------------------------------------------------------

async function fetchAllPostings(
  company: WorkdayCompanySeed,
  page: Page,
  expectedOrigin: string,
): Promise<WorkdayJobPosting[]> {
  const seen = new Map<string, WorkdayJobPosting>();
  let offset = 0;
  let knownTotal = 0;

  while (true) {
    assertOnExpectedOrigin(company, page, expectedOrigin);
    const result = await fetchInPageWithRetry<WorkdayJobsResponse>(company, page, `${cxsBaseUrl(company)}/jobs`, {
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

    if (offset === 0 && postings[0]) {
      console.log(`[workday] ${company.tenant} keys du 1er posting:`, Object.keys(postings[0]));
    }

    let newCount = 0;
    for (const p of postings) {
      const key = p.externalPath ?? `__missing-external-path-${offset}-${newCount}`;
      if (!seen.has(key)) {
        seen.set(key, p);
        newCount++;
      }
    }
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

    await randomDelay(REQUEST_DELAY_MIN_MS, REQUEST_DELAY_MAX_MS);
  }

  const all = Array.from(seen.values());


  const valid = all.filter((p) => typeof p.externalPath === 'string' && p.externalPath.length > 0);
  const dropped = all.length - valid.length;
  if (dropped > 0) {
    const example = all.find((p) => !p.externalPath || typeof p.externalPath !== 'string');
    console.warn(
      `[workday] ${company.tenant}/${company.site}: ${dropped} posting(s) sans externalPath ignoré(s) — ` +
        `exemple: ${JSON.stringify(example)}`
    );
  }

  return valid;
}

async function fetchJobDetail(
  company: WorkdayCompanySeed,
  page: Page,
  externalPath: string,
  expectedOrigin: string,
): Promise<{ description: string; location?: string }> {
  if (!externalPath) {
    console.warn(`[workday] ${company.tenant}/${company.site}: externalPath manquant, poste ignoré`);
    return { description: '' };
  }

  assertOnExpectedOrigin(company, page, expectedOrigin);

  try {
    const path = externalPath.replace(/^\/job/, '');
  
    const result = await fetchInPageWithRetry<WorkdayJobDetailResponse>(
      company,
      page,
      `${cxsBaseUrl(company)}/job${path}`
    );
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
  const expectedOrigin = new URL(careerPageUrl(company)).origin;
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
    postings = await fetchAllPostings(company, page, expectedOrigin);
  } catch (err) {
    console.warn(`[workday] ${company.tenant}/${company.site}: fetch échoué — ${(err as Error).message}`);
    await context.close();
    return [];
  }

  console.log(`[workday] ${company.tenant}/${company.site}: ${postings.length} postes bruts reçus`);

  const results: NormalizedJob[] = [];

  try {
    for (const p of postings) {
      const detail = await fetchJobDetail(company, page, p.externalPath, expectedOrigin);
      await randomDelay(REQUEST_DELAY_MIN_MS, REQUEST_DELAY_MAX_MS);

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