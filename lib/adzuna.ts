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

  // ⚠️ On NE met PLUS 'page' dans les query params (il est déjà dans l'URL path)
  if (params.what)       searchParams.set('what', params.what)
  if (params.where)      searchParams.set('where', params.where)
  if (params.salary_min) searchParams.set('salary_min', String(params.salary_min))

  const url = `${BASE}/search/${params.page || 1}?${searchParams}`
  console.log('🔍 Adzuna URL appelée:', url)

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 10800 },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('❌ Adzuna API error:', response.status, errorText)
      return { count: 0, results: [] }
    }

    const data = await response.json()
    console.log(`✅ Adzuna: ${data.results?.length || 0} jobs (total: ${data.count})`)
    return {
      count: data.count || 0,
      results: data.results || [],
    }
  } catch (error) {
    console.error('❌ Adzuna fetch error:', error)
    return { count: 0, results: [] }
  }
}

export async function getJobById(id: string): Promise<AdzunaJob | null> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  try {
    const res = await fetch(
      `${BASE}/ads/${id}?app_id=${appId}&app_key=${appKey}`,
      { next: { revalidate: 10800 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}