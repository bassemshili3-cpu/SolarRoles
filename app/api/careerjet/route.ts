// lib/careerjet.ts
const CAREERJET_API_KEY = process.env.CAREERJET_API_KEY || ''
const CAREERJET_ENDPOINT = 'https://search.api.careerjet.net/v4/query'

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
  salary_type: string // Y=yearly, M=monthly, W=weekly, D=daily, H=hourly
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
}

function getAuthHeader(): string {
  // Basic auth: username = API key, password = empty string
  const credentials = Buffer.from(`${CAREERJET_API_KEY}:`).toString('base64')
  return `Basic ${credentials}`
}

export async function searchCareerjetJobs(params: SearchParams): Promise<CareerjetSearchResult> {
  const queryParams = new URLSearchParams({
    locale_code: 'en_US',
    keywords: params.keywords || '',
    location: params.location || '',
    page: String(params.page || 1),
    page_size: String(params.page_size || 20),
    sort: params.sort || 'relevance',
    fragment_size: '300',
    // Required params: use server-side placeholders for SSR
    user_ip: '0.0.0.0',
    user_agent: 'Mozilla/5.0 (compatible; OhMyJob/1.0)',
  })

  if (params.contract_type) queryParams.set('contract_type', params.contract_type)
  if (params.work_hours) queryParams.set('work_hours', params.work_hours)

  const url = `${CAREERJET_ENDPOINT}?${queryParams.toString()}`

  const res = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(),
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    console.error(`Careerjet API error: ${res.status} ${res.statusText}`)
    return { type: 'JOBS', hits: 0, message: 'API error', pages: 0, response_time: 0, jobs: [] }
  }

  const data: CareerjetSearchResult = await res.json()

  // Handle location disambiguation responses
  if (data.type === 'LOCATIONS') {
    return { type: 'JOBS', hits: 0, message: data.message, pages: 0, response_time: data.response_time, jobs: [], locations: data.locations }
  }

  return data
}

// ── Normalize to your common Job format ──
export function normalizeCareerjet(job: CareerjetJob) {
  // Convert salary to annual if needed
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
    url: job.url,
    applyUrl: job.url,
    source: 'careerjet' as const,
    postedAt: job.date ? new Date(job.date).toISOString() : undefined,
  }
}