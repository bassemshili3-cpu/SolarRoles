// lib/adzuna.ts
import { unstable_cache } from 'next/cache'

const BASE = 'https://api.adzuna.com/v1/api/jobs/us'

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

// ──────────────────────────────────────────────────────────────
// FONCTION ORIGINALE (inchangée, on la garde pour d'autres usages)
// ──────────────────────────────────────────────────────────────
export async function searchJobs(params: AdzunaSearchParams): Promise<AdzunaSearchResult> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) {
    console.error('❌ Adzuna credentials missing')
    return { count: 0, results: [] }
  }

  const searchParams = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(params.results_per_page || 10),
  })

  if (params.what) searchParams.set('what', params.what)
  if (params.where) searchParams.set('where', params.where)
  if (params.salary_min) searchParams.set('salary_min', String(params.salary_min))

  const url = `${BASE}/search/${params.page || 1}?${searchParams}`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OhMyJob/1.0' },
      next: { revalidate: 10800 },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('❌ Adzuna API error:', response.status, errorText)
      return { count: 0, results: [] }
    }

    const data = await response.json()
    return {
      count: data.count || 0,
      results: data.results || [],
    }
  } catch (error) {
    console.error('❌ Adzuna fetch error:', error)
    return { count: 0, results: [] }
  }
}

// ──────────────────────────────────────────────────────────────
// NOUVELLE FONCTION CACHÉE (celle que tu vas utiliser partout)
// ──────────────────────────────────────────────────────────────
export const getCachedJobCount = unstable_cache(
  async (what: string, where: string = '', salary_min?: number) => {
    return searchJobs({
      what,
      where,
      salary_min,
      results_per_page: 1,   // on ne veut QUE le count
    })
  },
  ['adzuna-job-count'],           // clé de cache unique
  {
    revalidate: 7200,             // 2 heures (tu peux mettre 3600 si tu veux plus frais)
    tags: ['jobs'],               // pour purger manuellement si besoin
  }
)

// Optionnel : version complète pour InfiniteJobList (si tu veux aussi la cacher plus tard)
export const getCachedJobs = unstable_cache(
  async (params: AdzunaSearchParams) => {
    return searchJobs(params)
  },
  ['adzuna-jobs'],
  { revalidate: 3600, tags: ['jobs'] }
)