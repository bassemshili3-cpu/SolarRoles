// lib/adzuna.ts
// ─── ADZUNA — active, utilisé comme backfill de volume (source noindex) ─────
// API publique Adzuna : https://api.adzuna.com/v1/api/jobs/{country}/search/{page}
// Nécessite ADZUNA_APP_ID et ADZUNA_APP_KEY dans les variables d'environnement.

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

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs/us/search'

function getCredentials() {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) {
    throw new Error('ADZUNA_APP_ID / ADZUNA_APP_KEY manquants dans les variables d\'environnement')
  }
  return { appId, appKey }
}

// ─── Recherche ────────────────────────────────────────────────────────────────

export async function searchJobs(params: AdzunaSearchParams): Promise<AdzunaSearchResult> {
  const { appId, appKey } = getCredentials()
  const page = params.page ?? 1

  const url = new URL(`${ADZUNA_BASE_URL}/${page}`)
  url.searchParams.set('app_id', appId)
  url.searchParams.set('app_key', appKey)
  url.searchParams.set('results_per_page', String(params.results_per_page ?? 20))
  url.searchParams.set('content-type', 'application/json')
  if (params.what) url.searchParams.set('what', params.what)
  if (params.where) url.searchParams.set('where', params.where)
  if (params.salary_min) url.searchParams.set('salary_min', String(params.salary_min))

  const res = await fetch(url.toString())
  if (!res.ok) {
    console.warn(`[adzuna] HTTP ${res.status} for query "${params.what}"`)
    return { count: 0, results: [] }
  }

  const data = await res.json()
  return {
    count: data.count ?? 0,
    results: (data.results ?? []) as AdzunaJob[],
  }
}

export async function getJobById(_id: string): Promise<AdzunaJob | null> {
  // Adzuna n'expose pas de endpoint "get by id" public fiable — non utilisé
  // dans le pipeline de seed, on garde le stub pour compatibilité d'export.
  return null
}

export const getCachedJobCount = unstable_cache(
  async (what: string, where: string = '', salary_min?: number) => {
    return searchJobs({ what, where, salary_min, results_per_page: 1 })
  },
  ['adzuna-job-count'],
  { revalidate: 86400, tags: ['jobs'] }
)

export const getCachedJobs = unstable_cache(
  async (params: AdzunaSearchParams) => {
    return searchJobs(params)
  },
  ['adzuna-jobs'],
  { revalidate: 86400, tags: ['jobs'] }
)

// ─── Normalisation vers le format Job de la base ────────────────────────────

export interface NormalizedAdzunaJob {
  id: string
  source: 'adzuna'
  title: string
  company: string
  location: string
  addressRegion: string
  description: string
  url: string
  applyUrl: string
  salaryMin: number | null
  salaryMax: number | null
  postedAt: Date | null
  contractType?: string
}

export function normalizeAdzuna(job: AdzunaJob): NormalizedAdzunaJob {
  // area est un tableau du général au précis, ex: ["US", "Texas", "Austin"] —
  // le code d'état à 2 lettres n'est pas fourni directement par Adzuna,
  // on garde le nom complet de la sous-région la plus précise disponible.
  const area = job.location?.area ?? []
  const region = area.length > 1 ? area[1] : ''

  return {
    id: `adzuna-${job.id}`,
    source: 'adzuna',
    title: job.title,
    company: job.company?.display_name ?? '',
    location: job.location?.display_name ?? '',
    addressRegion: region,
    description: job.description ?? '',
    url: job.redirect_url,
    applyUrl: job.redirect_url,
    salaryMin: job.salary_min ? Math.round(job.salary_min) : null,
    salaryMax: job.salary_max ? Math.round(job.salary_max) : null,
    postedAt: job.created ? new Date(job.created) : null,
    contractType: job.contract_type,
  }
}