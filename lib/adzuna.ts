const BASE = 'https://api.adzuna.com/v1/api/jobs/us/search'

export async function searchJobs(params: {
  what?: string
  where?: string
  page?: number
  results_per_page?: number
  salary_min?: string
  [key: string]: string | number | undefined
}) {
  const { page = 1, results_per_page = 30, ...rest } = params

  const filteredParams = Object.fromEntries(
    Object.entries(rest).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
  )

  const query = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    results_per_page: String(results_per_page),
    ...Object.fromEntries(
      Object.entries(filteredParams).map(([k, v]) => [k, String(v)])
    ),
  }).toString()

  const url = `${BASE}/${page}?${query}`
  console.log('Adzuna URL:', url)

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 10800 },
  })

  if (!res.ok) {
    console.error('Adzuna error:', res.status, await res.text())
    return { results: [], count: 0 }
  }

  const data = await res.json()

  return {
    results: data.results ?? [],
    count: data.count ?? 0,
  }
}