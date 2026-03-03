import { searchLensaJobs, LensaJobAdvert } from './lensa'
import { searchJobs as searchAdzunaJobs } from './adzuna'

export interface UnifiedJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  source: 'lensa' | 'adzuna'
  salary_min?: number
  salary_max?: number
  created?: string
}

export interface UnifiedSearchResult {
  results: UnifiedJob[]
  count: number
}

function normalizeLensa(job: LensaJobAdvert): UnifiedJob {
  return {
    id: job.unique_id,
    title: job.cleaned_job_title,
    company: job.company,
    location: `${job.city}, ${job.state}`,
    description: job.description_digest,
    url: job.incoming_click_url,
    source: 'lensa',
  }
}

function normalizeAdzuna(job: any): UnifiedJob {
  return {
    id: job.id,
    title: job.title,
    company: job.company?.display_name || '',
    location: job.location?.display_name || '',
    description: job.description,
    url: job.redirect_url,
    source: 'adzuna',
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    created: job.created,
  }
}

export async function searchAllJobs(params: {
  what?: string
  where?: string
  page?: number
  results_per_page?: number
  salary_min?: string
}): Promise<UnifiedSearchResult> {
  const page = Number(params.page) || 1
  const totalLimit = Number(params.results_per_page) || 30
  const lensaOffset = Math.min((page - 1) * totalLimit, 150)

  // Lensa tente de remplir tous les slots
  const lensaData = await searchLensaJobs({
    job_title: params.what,
    offset: lensaOffset,
    limit: totalLimit,
  }).catch(() => null)

  const lensaJobs: UnifiedJob[] = lensaData
    ? lensaData.job_adverts.map(normalizeLensa)
    : []

  const lensaCount = lensaData?.count ?? 0
  const remaining = totalLimit - lensaJobs.length

  let adzunaJobs: UnifiedJob[] = []
  let adzunaCount = 0

  // Adzuna complète seulement si Lensa n'a pas rempli les 30 slots
  if (remaining > 0) {
    const adzunaData = await searchAdzunaJobs({
      what: params.what || '',
      where: params.where || '',
      page,
      results_per_page: remaining,
      ...(params.salary_min && { salary_min: params.salary_min }),
    }).catch(() => null)

    if (adzunaData) {
      adzunaJobs = adzunaData.results.map(normalizeAdzuna)
      adzunaCount = adzunaData.count
    }
  }

  return {
    results: [...lensaJobs, ...adzunaJobs],
    count: lensaCount + adzunaCount,
  }
}