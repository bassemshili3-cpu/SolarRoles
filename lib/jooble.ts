// lib/jooble.ts
// ─── Jooble REST API Integration ─────────────────────────────────────────────

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY!
const JOOBLE_API_URL = `https://jooble.org/api/${JOOBLE_API_KEY}`

export interface JoobleJob {
  title: string
  location: string
  snippet: string
  salary: string
  source: string
  type: string
  link: string
  company: string
  updated: string
  id: string
}

export interface JoobleSearchParams {
  keywords?: string
  location?: string
  page?: number
  resultsOnPage?: number
  salary?: number
}

export interface JoobleSearchResult {
  totalCount: number
  jobs: JoobleJob[]
}

export async function searchJooble(params: JoobleSearchParams): Promise<JoobleSearchResult> {
  const body: Record<string, any> = {}

  if (params.keywords) body.keywords = params.keywords
  if (params.location) body.location = params.location
  if (params.page) body.page = params.page
  if (params.resultsOnPage) body.resultsOnPage = params.resultsOnPage
  if (params.salary) body.salary = params.salary

  console.log('🔵 Jooble API call:', JSON.stringify(body))

const res = await fetch(JOOBLE_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
  },
  body: JSON.stringify(body),
})

  if (!res.ok) {
    const text = await res.text()
    console.error(`❌ Jooble API error: ${res.status} ${text}`)
    throw new Error(`Jooble API error: ${res.status}`)
  }

  const data = await res.json()

  console.log(`✅ Jooble: ${data.jobs?.length || 0} jobs (total: ${data.totalCount || 0})`)

  return {
    totalCount: data.totalCount || 0,
    jobs: data.jobs || [],
  }
}