// lib/careerjet.ts
// ─── CareerJet Public Search API ──────────────────────────────────────────
// Endpoint public : affid en query param, pas de Basic Auth.
// Doc : https://www.careerjet.com/partners/search/

const CAREERJET_AFFID = process.env.CAREERJET_API_KEY || ''
const CAREERJET_ENDPOINT = 'https://public.api.careerjet.net/search'

export type CareerjetJob = {
  title: string
  company: string
  date: string
  description: string
  locations: string
  salary: string
  salary_currency_code: string
  salary_max: number | null
  salary_min: number | null
  salary_type: string
  site: string
  url: string
}

export type CareerjetSearchResult = {
  type: 'JOBS' | 'LOCATIONS'
  hits: number
  message: string
  pages: number
  response_time: number
  jobs: CareerjetJob[]
  locations?: string[]
}

type SearchParams = {
  keywords?: string
  location?: string
  page?: number
  page_size?: number
  sort?: 'relevance' | 'date' | 'salary'
  contract_type?: 'p' | 'c' | 't' | 'i' | 'v'
  work_hours?: 'f' | 'p'
  user_ip?: string
  user_agent?: string
  noCache?: boolean
}

export async function searchCareerjetJobs(params: SearchParams): Promise<CareerjetSearchResult> {
  const queryParams = new URLSearchParams({
    affid: CAREERJET_AFFID,
    locale_code: 'en_US',
    keywords: params.keywords || '',
    location: params.location || '',
    page: String(params.page || 1),
    pagesize: String(params.page_size || 20),
    sort: params.sort || 'relevance',
    user_ip: params.user_ip || '1.1.1.1',
    user_agent: params.user_agent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  })

  if (params.contract_type) queryParams.set('contracttype', params.contract_type)
  if (params.work_hours) queryParams.set('contractperiod', params.work_hours)

  const url = `${CAREERJET_ENDPOINT}?${queryParams.toString()}`

  console.log(`🔵 CareerJet → ${url.replace(CAREERJET_AFFID, '***')}`)

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    ...(params.noCache ? { cache: 'no-store' } : { next: { revalidate: 3600 } }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`❌ CareerJet ${res.status} ${res.statusText} — body: ${body}`)
    return { type: 'JOBS', hits: 0, message: 'API error', pages: 0, response_time: 0, jobs: [] }
  }

  const data: CareerjetSearchResult = await res.json()
  console.log(`✅ CareerJet: ${data.jobs?.length ?? 0} jobs (hits: ${data.hits ?? 0}, type: ${data.type})`)

  if (data.type === 'LOCATIONS') {
    return { type: 'JOBS', hits: 0, message: data.message, pages: 0, response_time: data.response_time, jobs: [], locations: data.locations }
  }

  return data
}

export function normalizeCareerjet(job: CareerjetJob) {
  let salaryMin = job.salary_min
  let salaryMax = job.salary_max

  if (salaryMin && salaryMax && job.salary_type) {
    const multiplier: Record<string, number> = {
      Y: 1,
      M: 12,
      W: 52,
      D: 260,
      H: 2080,
    }
    const mult = multiplier[job.salary_type] || 1
    salaryMin = Math.round(salaryMin * mult)
    salaryMax = Math.round(salaryMax * mult)
  }

  return {
    id: `careerjet-${Buffer.from(job.url).toString('base64url').slice(0, 20)}`,
    title: job.title,
    company: job.company || '',
    location: job.locations || '',
    description: job.description || '',
    salary: job.salary || undefined,
    salaryMin: salaryMin || undefined,
    salaryMax: salaryMax || undefined,
    url: `/jobs/careerjet-${Buffer.from(job.url).toString('base64url').slice(0, 20)}`,
    applyUrl: job.url,
    source: 'careerjet' as const,
    postedAt: job.date ? new Date(job.date).toISOString() : undefined,
  }
}
