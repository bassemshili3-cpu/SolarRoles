/**
 * Greenhouse ATS provider — https://boards-api.greenhouse.io/v1/boards/{slug}/jobs
 * JSON API publique. Très agrégé par Indeed/LinkedIn mais c'est le seul ATS
 * avec une vraie profondeur de jobs "solar installer/technician" en 2026.
 */

import { isSolarInstallerRole } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { NormalizedJob } from './ashby';
import type { AtsCompanySeed } from './company-seed';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

interface GreenhouseJob {
  id: number;
  title: string;
  location: { name?: string };
  content: string; // HTML
  departments?: Array<{ name?: string }>;
  offices?: Array<{ name?: string }>;
  metadata?: Array<{ name: string; value: string | null }>;
  updated_at: string;
  created_at: string;
  absolute_url: string;
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

function getSalary(j: GreenhouseJob): string | undefined {
  if (!j.metadata) return undefined;
  const fields: Record<string, string> = {};
  for (const m of j.metadata) fields[m.name] = m.value ?? '';
  const min = fields['Pay Min'] ?? fields['Salary Min'] ?? fields['Compensation Min'];
  const max = fields['Pay Max'] ?? fields['Salary Max'] ?? fields['Compensation Max'];
  if (min && max) return `$${min} - $${max}`;
  if (min) return `from $${min}`;
  if (max) return `up to $${max}`;
  return undefined;
}

export async function fetchGreenhouseJobs(company: AtsCompanySeed): Promise<NormalizedJob[]> {
  const res = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs?content=true`,
    { headers: { 'User-Agent': USER_AGENT } },
  );
  if (!res.ok) {
    console.warn(`[greenhouse] ${company.slug}: HTTP ${res.status}, skipping`);
    return [];
  }

  const data = (await res.json()) as { jobs?: GreenhouseJob[] };
  const jobs = data.jobs ?? [];

  // Filtre : on matche sur titre + département + office pour ne rien rater
  const matched = jobs.filter((j) => {
    const text = `${j.title} ${j.departments?.map((d) => d.name).join(' ') ?? ''} ${j.offices?.map((o) => o.name).join(' ') ?? ''}`;
    return isSolarInstallerRole(j.title) || isSolarInstallerRole(text);
  });

  return matched.map((j) => {
    const location = j.location?.name ?? '';
    return {
      source: 'greenhouse',
      externalId: String(j.id),
      title: j.title,
      company: company.name,
      location,
      addressRegion: extractStateFromLocation(location),
      description: stripHtml(j.content ?? ''),
      url: j.absolute_url,
      applyUrl: j.absolute_url,
      contractType: undefined,
      postedAt: j.created_at ? new Date(j.created_at) : undefined,
      salary: getSalary(j),
    };
  });
}