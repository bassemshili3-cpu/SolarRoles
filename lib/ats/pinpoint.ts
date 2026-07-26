import { isCyberSecurityRole } from './cyber-taxonomy';
import type { AtsCompanySeed } from './company-seeds';
import type { NormalizedJob } from './ashby';

// NOTE: field names below are based on Pinpoint's documented public
// postings.json shape but haven't been checked against a live cybersecurity
// company's payload (none were available to verify at build time — see
// company-seeds.ts). Log a sample response the first time you add a real
// Pinpoint slug and adjust field names below if they don't match.
interface PinpointPosting {
  id: number | string;
  title: string;
  location?: { name?: string };
  description?: string;
  url?: string;
  apply_url?: string;
  published_at?: string;
  employment_type?: string;
  salary?: string;
}

interface PinpointResponse {
  data?: PinpointPosting[];
  postings?: PinpointPosting[];
}

const USER_AGENT = 'oh-my-job.com job aggregator (contact: hello@oh-my-job.com)';

export async function fetchPinpointJobs(company: AtsCompanySeed): Promise<NormalizedJob[]> {
  const endpoint = `https://${company.slug}.pinpointhq.com/postings.json`;

  const res = await fetch(endpoint, { headers: { 'User-Agent': USER_AGENT } });

  if (!res.ok) {
    console.warn(`[pinpoint] ${company.slug}: HTTP ${res.status}, skipping`);
    return [];
  }

  const data = (await res.json()) as PinpointResponse;
  const postings = data.data ?? data.postings ?? [];
  const filtered = postings.filter((p) => isCyberSecurityRole(p.title));

  return filtered.map((p) => ({
    source: 'pinpoint',
    externalId: String(p.id),
    title: p.title,
    company: company.name,
    location: p.location?.name ?? '',
    description: p.description ?? '',
    url: p.url ?? `https://${company.slug}.pinpointhq.com/postings/${p.id}`,
    applyUrl: p.apply_url ?? p.url ?? '',
    contractType: p.employment_type,
    postedAt: p.published_at ? new Date(p.published_at) : undefined,
    salary: p.salary,
  }));
}