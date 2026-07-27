/**
 * SmartRecruiters ATS provider — https://api.smartrecruiters.com/v1/companies/{slug}/postings
 * Public JSON API, no auth, mid-market/enterprise.
 * /postings ne retourne pas la description — on fait un 2e call par job matché
 * pour /postings/{id} (batch parallèle).
 */

import { isSolarInstallerRole } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { NormalizedJob } from './ashby';
import type { AtsCompanySeed } from './company-seed';

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

export async function fetchSmartRecruitersJobs(company: AtsCompanySeed): Promise<NormalizedJob[]> {
  const listUrl = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company.slug)}/postings?limit=100`;

  const res = await fetch(listUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    console.warn(`[smartrecruiters] ${company.slug}: HTTP ${res.status}, skipping`);
    return [];
  }

  const data = (await res.json()) as SmartRecruitersListResponse;
  const postings = data.content ?? [];

  // Filter via ta taxonomy partagée — même logique que ashby.ts
  const matched = postings.filter((p) => isSolarInstallerRole(p.name));

  // Detail calls en parallèle (description + salary)
  const detailed = await Promise.all(
    matched.map(async (p) => {
      const detailUrl = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company.slug)}/postings/${p.id}`;
      try {
        const dr = await fetch(detailUrl, { headers: { 'User-Agent': USER_AGENT } });
        if (!dr.ok) return { p, detail: null };
        return { p, detail: (await dr.json()) as SmartRecruitersDetailResponse };
      } catch {
        return { p, detail: null };
      }
    })
  );

  return detailed.map(({ p, detail }) => {
    const location = formatLocation(p.location);
    const description = extractDescription(detail) || p.name;
    return {
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
      postedAt: p.releasedDate ? new Date(p.releasedDate) : undefined,
      salary: detail?.compensation?.summary,
    };
  });
}