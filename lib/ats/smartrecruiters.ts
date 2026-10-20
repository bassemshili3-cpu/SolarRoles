/**
 * SmartRecruiters ATS provider — https://api.smartrecruiters.com/v1/companies/{slug}/postings
 * Public JSON API, no auth, mid-market/enterprise.
 * /postings ne retourne pas la description — on fait un 2e call par job matché
 * pour /postings/{id} (batch parallèle).
 */

import { isGenericInstallerTitle, isSolarInstallerRole } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { NormalizedJob } from './ashby';
import type { AtsCompanySeed } from './company-seed';
import { sourcePublicationDate } from './publicationDate';
import { textBaseSalary } from './salaryFields';
import type { AtsFetchContext } from './fetch-context';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

interface SmartRecruitersPosting {
  id: string;
  name: string;
  releasedDate?: string;
  department?: { label?: string };
  location?: { city?: string; region?: string; country?: string };
  typeOfEmployment?: { label?: string };
  applyUrl?: string;
  url?: string;
}

interface SmartRecruitersListResponse {
  content?: SmartRecruitersPosting[];
  totalFound?: number;
}

interface SmartRecruitersDetailResponse {
  jobAd?: { sections?: Record<string, { text?: string }> };
  compensation?: { summary?: string };
}

function formatLocation(loc: SmartRecruitersPosting['location']): string {
  if (!loc) return '';
  const { city, region, country } = loc;
  if (city && region) return `${city}, ${region}`;
  if (city && country) return `${city}, ${country}`;
  return city || country || '';
}

function extractDescription(detail: SmartRecruitersDetailResponse | null): string {
  const sections = detail?.jobAd?.sections;
  if (!sections) return '';
  return Object.values(sections)
    .map((s) => s?.text ?? '')
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

export async function fetchSmartRecruitersJobs(company: AtsCompanySeed, run?: AtsFetchContext): Promise<NormalizedJob[]> {
  const listUrl = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company.slug)}/postings?limit=100`;
  const saved = run?.cursor as { offset?: number; completed?: string[] } | undefined;
  let offset = Number.isSafeInteger(saved?.offset) && saved!.offset! >= 0 ? saved!.offset! : 0;
  let completed = new Set(Array.isArray(saved?.completed) ? saved.completed.filter(id => typeof id === 'string') : []);
  const results: NormalizedJob[] = [];
  const seen = new Set<string>();
  const checkpoint = () => run?.checkpoint({ offset, completed: [...completed] });
  try {
    while (true) {
      checkpoint();
      if (Date.now() + 35_000 >= (run?.deadline ?? Infinity)) return results;
      const res = await fetch(`${listUrl}&offset=${offset}`, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status} at offset ${offset}`);
      const data = (await res.json()) as SmartRecruitersListResponse;
      if (!Array.isArray(data.content)) throw new Error('Missing postings content array');
      const postings = data.content;
      if (!postings.length) { run?.checkpoint({ offset: 0, completed: [] }); break; }
      if (postings.some(p => typeof p.id !== 'string' || typeof p.name !== 'string')) throw new Error('Invalid posting identity');
      const signature = JSON.stringify(postings.map(p => p.id));
      if (seen.has(signature)) throw new Error('Pagination repeated an already scanned page');
      seen.add(signature);
      for (const p of postings) {
        if (completed.has(p.id)) continue;
        const canonical = p.applyUrl ?? p.url ?? `${listUrl}#${p.id}`;
        if ((!isSolarInstallerRole(p.name) && !isGenericInstallerTitle(p.name)) || run?.isKnown('smartrecruiters', canonical)) {
          completed.add(p.id); continue;
        }
        checkpoint();
        if (Date.now() + 35_000 >= (run?.deadline ?? Infinity)) return results;
        const detailUrl = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company.slug)}/postings/${p.id}`;
        const dr = await fetch(detailUrl, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(20_000) });
        if (dr.status === 404 || dr.status === 410) {
          await dr.body?.cancel();
          console.warn(`[smartrecruiters] ${company.slug}: posting ${p.id} is no longer available (HTTP ${dr.status})`);
          completed.add(p.id); continue;
        }
        if (!dr.ok) throw new Error(`Detail HTTP ${dr.status} for ${p.id}`);
        const detail = await dr.json() as SmartRecruitersDetailResponse;
        const location = formatLocation(p.location);
        const description = extractDescription(detail) || p.name;
        if (isSolarInstallerRole(p.name, description)) results.push({
          source: 'smartrecruiters',
          externalId: p.id,
          title: p.name,
          company: company.name,
          location,
          addressRegion: extractStateFromLocation(location),
          description,
          url: p.applyUrl ?? p.url ?? `${listUrl}#${p.id}`,
          applyUrl: p.applyUrl ?? p.url ?? '',
          contractType: p.typeOfEmployment?.label,
          postedAt: sourcePublicationDate(p, 'smartrecruiters'),
          salary: detail?.compensation?.summary,
          ...(textBaseSalary(description) ?? textBaseSalary(detail?.compensation?.summary || '', true)),
        });
        completed.add(p.id);
      }
      offset += postings.length;
      completed = new Set();
      console.log(`[smartrecruiters] ${company.slug}: scanned ${offset}/${data.totalFound ?? '?'} postings, ${results.length} matches`);
      if (typeof data.totalFound === 'number' && data.totalFound > 0 && offset >= data.totalFound) {
        run?.checkpoint({ offset: 0, completed: [] }); break;
      }
    }
  } catch (error) {
    checkpoint();
    console.warn(`[smartrecruiters] ${company.slug}: scan paused at ${offset}: ${(error as Error).message}`);
  }
  return results;
}
