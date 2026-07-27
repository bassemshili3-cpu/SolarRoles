/**
 * Jobvite ATS provider — https://jobs.jobvite.com/{slug}/jobs
 * Pas d'API publique stable — on scrape le HTML.
 * Jobvite embed les jobs en JSON dans <script id="jv-page-data">,
 * avec fallback regex si jamais le format change.
 */

import { isSolarInstallerRole } from './solar-taxonomy';
import { extractStateFromLocation } from '@/lib/parseLocation';
import type { NormalizedJob } from './ashby';
import type { AtsCompanySeed } from './company-seed';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';
const LIST_URL = (slug: string) => `https://jobs.jobvite.com/${slug}/jobs`;

interface RawJobviteJob {
  id?: string | number;
  jobId?: string;
  eId?: string;
  title: string;
  location?: { city?: string; state?: string; country?: string };
  locationText?: string;
  date?: string;
  postedDate?: string;
}

function extractJobsFromHtml(html: string, slug: string): RawJobviteJob[] {
  // Primary: parse <script id="jv-page-data"> window.jvGlobals or jv-page-data
  const scriptMatch = html.match(
    /<script[^>]*id=["']jv-page-data["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (scriptMatch) {
    try {
      const data = JSON.parse(scriptMatch[1]);
      const jobs = data?.jobs ?? data?.jobList ?? data?.results ?? [];
      if (Array.isArray(jobs) && jobs.length > 0) {
        return jobs.map((j: any) => ({
          id: j.id ?? j.jobId ?? j.eId,
          title: j.title,
          location: j.location,
          locationText: j.locationText,
          date: j.date ?? j.postedDate,
        }));
      }
    } catch {
      // fall through to regex
    }
  }

  // Fallback: regex sur les liens jobs
  const linkRe = new RegExp(
    `<a[^>]+href="[^"]*${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/job/([a-zA-Z0-9_-]+)"[^>]*>([^<]+)</a>`,
    'gi',
  );
  return [...html.matchAll(linkRe)].map((m) => ({
    id: m[1],
    title: m[2].trim(),
  }));
}

function formatLocation(loc: RawJobviteJob['location'] | undefined, fallback?: string): string {
  if (fallback) return fallback;
  if (!loc) return '';
  const { city, state, country } = loc;
  if (city && state) return `${city}, ${state}`;
  if (city && country) return `${city}, ${country}`;
  return city || state || country || '';
}

export async function fetchJobviteJobs(company: AtsCompanySeed): Promise<NormalizedJob[]> {
  const res = await fetch(LIST_URL(company.slug), {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) {
    console.warn(`[jobvite] ${company.slug}: HTTP ${res.status}, skipping`);
    return [];
  }

  const html = await res.text();
  const jobs = extractJobsFromHtml(html, company.slug);
  const matched = jobs.filter((j) => j.title && isSolarInstallerRole(j.title));

  return matched.map((j) => {
    const location = formatLocation(j.location, j.locationText);
    return {
      source: 'jobvite',
      externalId: String(j.id ?? ''),
      title: j.title,
      company: company.name,
      location,
      addressRegion: extractStateFromLocation(location),
      description: '', // detail page = 2e call si tu veux le JD complet plus tard
      url: `${LIST_URL(company.slug)}/${j.id ?? ''}`,
      applyUrl: `${LIST_URL(company.slug)}/${j.id ?? ''}`,
      contractType: undefined,
      postedAt: j.date ? new Date(j.date) : j.postedDate ? new Date(j.postedDate) : undefined,
      salary: undefined,
    };
  });
}