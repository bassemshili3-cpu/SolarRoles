// lib/careerjet.ts
// ─── CareerJet Partner API v4 ─────────────────────────────────────────────
// Endpoint : https://search.api.careerjet.net/v4/query
// Auth     : Basic base64(API_KEY:)
// 403      : déclenché si user_ip ou user_agent sont absents
// Doc      : https://www.careerjet.com/partners/api
// ✅ Option 2 (plus robuste) : hash SHA1
import { createHash } from 'crypto'

const CAREERJET_API_KEY = process.env.CAREERJET_API_KEY || ''
const CAREERJET_ENDPOINT = 'https://search.api.careerjet.net/v4/query'

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

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

function getAuthHeader(): string {
  const credentials = Buffer.from(`${CAREERJET_API_KEY}:`).toString('base64')
  return `Basic ${credentials}`
}

export async function searchCareerjetJobs(params: SearchParams): Promise<CareerjetSearchResult> {
  // user_ip et user_agent sont OBLIGATOIRES — un 403 est renvoyé si absents
  const userIp = params.user_ip || '8.8.8.8'
  const userAgent = params.user_agent || DEFAULT_USER_AGENT

  const queryParams = new URLSearchParams({
    locale_code: 'en_US',
    keywords: params.keywords || '',
    location: params.location || '',
    page: String(params.page || 1),
    page_size: String(params.page_size || 20),
    sort: params.sort || 'relevance',
    fragment_size: '300',
    user_ip: userIp,
    user_agent: userAgent,
  })

  if (params.contract_type) queryParams.set('contract_type', params.contract_type)
  if (params.work_hours) queryParams.set('work_hours', params.work_hours)

  const url = `${CAREERJET_ENDPOINT}?${queryParams.toString()}`

  console.log(`🔵 CareerJet → keywords="${params.keywords}" page=${params.page} ip=${userIp}`)

  const res = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(),
      Accept: 'application/json',
      Referer: process.env.NEXT_PUBLIC_APP_URL || 'https://www.oh-my-job.com',
    },
    ...(params.noCache ? { cache: 'no-store' } : { next: { revalidate: 3600 } }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`❌ CareerJet ${res.status} ${res.statusText} — ${body}`)
    return { type: 'JOBS', hits: 0, message: 'API error', pages: 0, response_time: 0, jobs: [] }
  }

  const data: CareerjetSearchResult = await res.json()
  console.log(`✅ CareerJet: ${data.jobs?.length ?? 0} jobs (hits: ${data.hits ?? 0})`)

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

 const stableId = `cj-${createHash('sha1').update(job.url).digest('hex').slice(0, 24)}`

  return {
    id: stableId,
    title: job.title,
    company: job.company || '',
    location: job.locations || '',
    description: job.description || '',
    salary: job.salary || undefined,
    salaryMin: salaryMin || undefined,
    salaryMax: salaryMax || undefined,
    url: `/jobs/${stableId}`,
    applyUrl: job.url,
    source: 'careerjet' as const,
    sourcePriority: 1,
    postedAt: job.date ? new Date(job.date).toISOString() : undefined,
  }
}
