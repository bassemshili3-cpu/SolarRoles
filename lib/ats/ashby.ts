import { isCyberSecurityRole } from './cyber-taxonomy';
import type { AtsCompanySeed } from './company-seed';

interface AshbyJob {
  id: string;
  title: string;
  location?: string;
  publishedAt?: string;
  jobUrl?: string;
  applyUrl?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  employmentType?: string;
  compensation?: {
    compensationTierSummary?: string;
  };
}

interface AshbyBoardResponse {
  jobs: AshbyJob[];
}

export interface NormalizedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  applyUrl: string;
  contractType?: string;
  postedAt?: Date;
  salary?: string;
}

const USER_AGENT = 'oh-my-job.com job aggregator (contact: hello@oh-my-job.com)';

export async function fetchAshbyJobs(company: AtsCompanySeed): Promise<NormalizedJob[]> {
  const endpoint = `https://api.ashbyhq.com/posting-api/job-board/${company.slug}?includeCompensation=true`;

  const res = await fetch(endpoint, { headers: { 'User-Agent': USER_AGENT } });

  if (!res.ok) {
    console.warn(`[ashby] ${company.slug}: HTTP ${res.status}, skipping`);
    return [];
  }

  const data = (await res.json()) as AshbyBoardResponse;
  const jobs = data.jobs ?? [];
  const filtered = jobs.filter((j) => isCyberSecurityRole(j.title));

  return filtered.map((j) => ({
    source: 'ashby',
    externalId: j.id,
    title: j.title,
    company: company.name,
    location: j.location ?? '',
    description: j.descriptionHtml ?? j.descriptionPlain ?? '',
    url: j.jobUrl ?? `https://jobs.ashbyhq.com/${company.slug}/${j.id}`,
    applyUrl: j.applyUrl ?? j.jobUrl ?? '',
    contractType: j.employmentType,
    postedAt: j.publishedAt ? new Date(j.publishedAt) : undefined,
    salary: j.compensation?.compensationTierSummary,
  }));
}