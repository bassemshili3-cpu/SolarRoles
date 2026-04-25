// lib/adzuna.ts
// ─── ADZUNA MUTED — partnership paused ──────────────────────────────────────
// All functions return empty results without making any API calls.
// This file keeps the same exports so existing imports across landing pages
// continue to compile without modification.
//
// To re-enable Adzuna later: restore the original implementation from git history.

import { unstable_cache } from 'next/cache'

export interface AdzunaJob {
  id: string
  title: string
  description: string
  redirect_url: string
  created: string
  company: { display_name: string; logo?: string }
  location: { display_name: string; area?: string[] }
  category: { label: string }
  salary_min?: number
  salary_max?: number
  salary_time_unit?: string
  contract_type?: string
}

export interface AdzunaSearchResult {
  count: number
  results: AdzunaJob[]
}

export interface AdzunaSearchParams {
  what?: string
  where?: string
  salary_min?: number
  results_per_page?: number
  page?: number
}

// ─── No-op implementations ───────────────────────────────────────────────────

export async function searchJobs(_params: AdzunaSearchParams): Promise<AdzunaSearchResult> {
  return { count: 0, results: [] }
}

export async function getJobById(_id: string): Promise<AdzunaJob | null> {
  return null
}

export const getCachedJobCount = unstable_cache(
  async (_what: string, _where: string = '', _salary_min?: number) => {
    return { count: 0, results: [] as AdzunaJob[] }
  },
  ['adzuna-job-count-muted'],
  { revalidate: 86400, tags: ['jobs'] }
)

export const getCachedJobs = unstable_cache(
  async (_params: AdzunaSearchParams) => {
    return { count: 0, results: [] as AdzunaJob[] }
  },
  ['adzuna-jobs-muted'],
  { revalidate: 86400, tags: ['jobs'] }
)