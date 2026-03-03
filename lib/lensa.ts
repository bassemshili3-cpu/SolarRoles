const LENSA_SDK_KEY = process.env.LENSA_SDK_KEY!
const LENSA_CAMPAIGN_ID = process.env.LENSA_CAMPAIGN_ID!
const LENSA_BASE_URL = 'https://connect.lensa.com/jobs-api'

export interface LensaJobAdvert {
  unique_id: string
  cleaned_job_title: string
  description_digest: string
  city: string
  state: string
  company: string
  revenue_per_click: number
  incoming_click_url: string
}

export interface LensaSearchResult {
  job_title: string
  city: string
  state: string
  job_adverts: LensaJobAdvert[]
  count: number
}

export interface LensaSearchParams {
  job_title?: string
  city?: string
  state?: string
  postal_code?: string
  remote_only?: boolean
  offset?: number
  limit?: number
}

export async function searchLensaJobs(params: LensaSearchParams): Promise<LensaSearchResult> {
  const query = new URLSearchParams({
    sdk_access_key: LENSA_SDK_KEY,
    campaign_id: LENSA_CAMPAIGN_ID,
    limit: String(Math.min(params.limit ?? 30, 180)),
  })

  if (params.job_title)   query.set('job_title', params.job_title)
  if (params.city)        query.set('city', params.city)
  if (params.state)       query.set('state', params.state)
  if (params.postal_code) query.set('postal_code', params.postal_code)
  if (params.remote_only) query.set('remote_only', 'true')
  if (params.offset)      query.set('offset', String(params.offset))

  const res = await fetch(`${LENSA_BASE_URL}/v1/job-adverts?${query}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 10800 },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(`Lensa API error ${res.status}: ${JSON.stringify(error)}`)
  }

  return await res.json()
}