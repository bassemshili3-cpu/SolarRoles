// lib/adzuna.ts
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

  if (params.what) searchParams.set('what', params.what)
  if (params.where) searchParams.set('where', params.where)
  if (params.salary_min) searchParams.set('salary_min', String(params.salary_min))

  const url = `${BASE}/search/${params.page || 1}?${searchParams}`
  console.log('🔍 Adzuna search URL appelée:', url)

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

  console.log('🔑 [getJobById] ID demandé :', id)
  console.log('   APP_ID présent ?', !!appId)
  console.log('   APP_KEY présent ?', !!appKey)

  if (!appId || !appKey) {
    console.error('❌ Adzuna credentials missing in getJobById')
    return null
  }

  try {
    const params = new URLSearchParams({ app_id: appId, app_key: appKey })
    const url = `${BASE}/ads/${id}?${params}`
    console.log('🔍 Fetch single Adzuna job URL :', url)

    const res = await fetch(url, {
      headers: { 'User-Agent': 'OhMyJob/1.0' },
      next: { revalidate: 10800 },
    })

    console.log('   Status HTTP :', res.status)

    if (!res.ok) {
      const errorText = await res.text().catch(() => '(no body)')
      console.error('❌ Adzuna single job failed:', res.status, errorText)
      return null
    }

    const job = await res.json()
    console.log('🎉 Adzuna JOB TROUVÉ ! Titre :', job.title)
    console.log('   redirect_url :', job.redirect_url || '(aucun)')

    return job
  } catch (error: any) {
    console.error('💥 Exception dans getJobById :', error.message || error)
    return null
  }
}