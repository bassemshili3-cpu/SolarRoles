const BASE = 'https://api.adzuna.com/v1/api/jobs/us/search'

export async function searchJobs(params: Record<string, string | number>) {
  const { page = 1, results_per_page = 30, ...rest } = params

  const filteredParams = Object.fromEntries(
    Object.entries(rest).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
    // ✅ Supprimé : v !== 'United States' — on laisse passer le where
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
    next: { revalidate: 60 }
  })

  if (!res.ok) {
    console.error('Adzuna error:', res.status, await res.text())
    return { results: [], count: 0 }
  }

  const data = await res.json()

  // ✅ Adzuna renvoie `count` et `results` — on s'assure que c'est bien retourné
  return {
    results: data.results ?? [],
    count: data.count ?? 0,
  }
}