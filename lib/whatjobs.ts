export interface WhatJobsJob {
  url: string
  title: string
  company: string | null
  location: string | null
  postcode: string | null
  snippet: string | null
  job_type: string | null
  salary: string | null
  logo: string | null
  age: string | null
  age_days: number | null
  onmousedown: string | null
}

export interface WhatJobsResponse {
  total: number
  per_page: number
  current_page: number
  last_page: number
  data: WhatJobsJob[]
}

const WHATJOBS_API_URL = 'https://api.whatjobs.com/api/v1/jobs.json'

function cleanText(value: string | null | undefined): string {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeSalary(value: string | null | undefined): string | null {
  const salary = cleanText(value)
  if (!salary) return null

  // WhatJobs sometimes returns machine-formatted values such as
  // "0.000000 - 0.000000" or "33.000000 - 38.000000". A zero range is not
  // a salary, while decimal-only US values should be presented as money.
  const plainRange = salary.match(/^\s*(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*$/i)
  if (plainRange) {
    const minimum = Number(plainRange[1])
    const maximum = Number(plainRange[2])

    if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || (minimum <= 0 && maximum <= 0)) {
      return null
    }

    const format = (amount: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)

    return `${format(minimum)} – ${format(maximum)}`
  }

  return salary
}

export function normalizeWhatJobsResponse(payload: unknown): WhatJobsResponse {
  const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const rawJobs = Array.isArray(body.data) ? body.data : []

  const data = rawJobs.flatMap((raw): WhatJobsJob[] => {
    if (!raw || typeof raw !== 'object') return []
    const job = raw as Record<string, unknown>
    const url = typeof job.url === 'string' ? job.url : ''
    const title = cleanText(typeof job.title === 'string' ? job.title : '')
    if (!url.startsWith('https://') || !title) return []

    return [{
      url,
      title,
      company: cleanText(typeof job.company === 'string' ? job.company : '') || null,
      location: cleanText(typeof job.location === 'string' ? job.location : '') || null,
      postcode: cleanText(typeof job.postcode === 'string' ? job.postcode : '') || null,
      snippet: cleanText(typeof job.snippet === 'string' ? job.snippet : '') || null,
      job_type: cleanText(typeof job.job_type === 'string' ? job.job_type : '') || null,
      salary: normalizeSalary(typeof job.salary === 'string' ? job.salary : ''),
      logo: typeof job.logo === 'string' && job.logo.startsWith('https://') ? job.logo : null,
      age: cleanText(typeof job.age === 'string' ? job.age : '') || null,
      age_days: typeof job.age_days === 'number' ? job.age_days : null,
      onmousedown: typeof job.onmousedown === 'string' ? job.onmousedown : null,
    }]
  })

  return {
    total: typeof body.total === 'number' ? body.total : data.length,
    per_page: typeof body.per_page === 'number' ? body.per_page : data.length,
    current_page: typeof body.current_page === 'number' ? body.current_page : 1,
    last_page: typeof body.last_page === 'number' ? body.last_page : 1,
    data,
  }
}

export async function fetchWhatJobs(params: {
  publisher: string
  userIp: string
  userAgent?: string
  keyword?: string
  location?: string
  page?: number
  limit?: number
}): Promise<WhatJobsResponse> {
  const query = new URLSearchParams({
    publisher: params.publisher,
    user_ip: params.userIp,
    keyword: params.keyword?.trim() || 'solar',
    limit: String(Math.min(Math.max(params.limit || 6, 1), 50)),
    page: String(Math.max(params.page || 1, 1)),
  })

  if (params.userAgent) query.set('user_agent', params.userAgent)
  if (params.location?.trim()) query.set('location', params.location.trim())

  const response = await fetch(`${WHATJOBS_API_URL}?${query.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`WhatJobs returned HTTP ${response.status}`)
  }

  return normalizeWhatJobsResponse(await response.json())
}
