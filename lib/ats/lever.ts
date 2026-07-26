import { isSolarInstallerRole } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { AtsCompanySeed } from './company-seed';
import type { NormalizedJob } from './ashby';

export type { NormalizedJob };

interface LeverPosting {
  id: string;
  text: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  descriptionPlain?: string;
  descriptionBodyPlain?: string;
  categories?: {
    location?: string;
    commitment?: string;
    team?: string;
  };
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
}

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

export async function fetchLeverJobs(company: AtsCompanySeed): Promise<NormalizedJob[]> {
  const endpoint = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;

  const res = await fetch(endpoint, { headers: { 'User-Agent': USER_AGENT } });

  if (!res.ok) {
    console.warn(`[lever] ${company.slug}: HTTP ${res.status}, skipping`);
    return [];
  }

  const postings = (await res.json()) as LeverPosting[];
  const filtered = postings.filter((p) => isSolarInstallerRole(p.text));

  return filtered.map((p) => {
    const location = p.categories?.location ?? '';
    return {
      source: 'lever',
      externalId: p.id,
      title: p.text,
      company: company.name,
      location,
      addressRegion: extractStateFromLocation(location),
      description: p.descriptionPlain ?? p.descriptionBodyPlain ?? '',
      url: p.hostedUrl ?? `https://jobs.lever.co/${company.slug}/${p.id}`,
      applyUrl: p.applyUrl ?? p.hostedUrl ?? '',
      contractType: p.categories?.commitment,
      postedAt: p.createdAt ? new Date(p.createdAt) : undefined,
      salary:
        p.salaryRange?.min && p.salaryRange?.max
          ? `${p.salaryRange.currency ?? 'USD'} ${p.salaryRange.min.toLocaleString()}–${p.salaryRange.max.toLocaleString()}`
          : undefined,
    };
  });
}