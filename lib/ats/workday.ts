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
 */

import { isSolarInstallerRole, isGenericInstallerTitle } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { NormalizedJob } from './types';

export interface WorkdayCompanySeed {
  tenant: string;   // ex: 'sunrun'
  host: string;     // ex: 'wd5' (wd1 à wd5 selon l'entreprise)
  site: string;     // ex: 'Sunrun_Careers'
  name: string;
  verified: boolean;
}

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';
const PAGE_SIZE = 20;
const REQUEST_DELAY_MS = 400; // politesse — Workday a de l'anti-bot (Akamai) sur certains tenants

// dans workday.ts

const US_STATE_ABBR = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

// Workday renvoie souvent "ST, City" (ex: "NJ, Somerset") au lieu du
// format habituel "City, ST" attendu par isUSJob()/extractStateFromLocation()
// dans le reste du pipeline. On normalise ici, à la source.
function normalizeWorkdayLocation(raw: string): string {
  const match = raw.trim().match(/^([A-Za-z]{2}),\s*(.+)$/);
  if (match && US_STATE_ABBR.has(match[1].toUpperCase())) {
    const [, state, city] = match;
    return `${city}, ${state.toUpperCase()}`;
  }
  return raw;
}

function resolveLocation(p: WorkdayJobPosting): string {
  const raw = p.locationsText ?? p.bulletFields?.[0] ?? '';
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

function baseUrl(company: WorkdayCompanySeed): string {
  return `https://${company.tenant}.${company.host}.myworkdayjobs.com/wday/cxs/${company.tenant}/${company.site}`;
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

async function fetchAllPostings(company: WorkdayCompanySeed): Promise<WorkdayJobPosting[]> {
  const all: WorkdayJobPosting[] = [];
  let offset = 0;

  while (true) {
    const res = await fetch(`${baseUrl(company)}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit: PAGE_SIZE,
        offset,
        searchText: '',
      }),
    });

    if (!res.ok) {
      console.warn(`[workday] ${company.tenant}/${company.site}: HTTP ${res.status}, skipping`);
      return all;
    }

    const data = (await res.json()) as WorkdayJobsResponse;
    const postings = data.jobPostings ?? [];
    all.push(...postings);

    offset += PAGE_SIZE;
    if (offset >= (data.total ?? 0) || postings.length === 0) break;

    await sleep(REQUEST_DELAY_MS);
  }

  return all;
}

async function fetchJobDescription(company: WorkdayCompanySeed, externalPath: string): Promise<string> {
  try {
    const res = await fetch(`${baseUrl(company)}/job${externalPath.replace(/^\/job/, '')}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
    });
    if (!res.ok) return '';
    const data = (await res.json()) as WorkdayJobDetailResponse;
    return stripHtml(data.jobPostingInfo?.jobDescription ?? '');
  } catch (err) {
    console.warn(`[workday] échec récupération description ${externalPath}: ${(err as Error).message}`);
    return '';
  }
}


export async function fetchWorkdayJobs(company: WorkdayCompanySeed): Promise<NormalizedJob[]> {
  let postings: WorkdayJobPosting[];

  try {
    postings = await fetchAllPostings(company);
  } catch (err) {
    console.warn(`[workday] ${company.tenant}/${company.site}: fetch échoué — ${(err as Error).message}`);
    return [];
  }

  console.log(`[workday] ${company.tenant}/${company.site}: ${postings.length} postes bruts reçus`);

  const results: NormalizedJob[] = [];

  for (const p of postings) {
    let description = '';

    if (isSolarInstallerRole(p.title)) {
      results.push(normalize(company, p, description));
      continue;
    }

    if (isGenericInstallerTitle(p.title)) {
      description = await fetchJobDescription(company, p.externalPath);
      await sleep(REQUEST_DELAY_MS);
      if (isSolarInstallerRole(p.title, description)) {
        results.push(normalize(company, p, description));
      }
    }
  }

  return results;
}

function normalize(company: WorkdayCompanySeed, p: WorkdayJobPosting, description: string): NormalizedJob {
  const location = resolveLocation(p);
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