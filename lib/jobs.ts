import { searchLensaJobs, LensaJobAdvert } from '@/lensa'
import { searchJobs as searchAdzunaJobs } from '@/adzuna'

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
  const limitEach = Math.floor((Number(params.results_per_page) || 30) / 2) // 15 chacun = 30 total

  const lensaOffset = Math.min((page - 1) * limitEach, 150) // hard limit 180

  const [lensaData, adzunaData] = await Promise.allSettled([
    searchLensaJobs({
      job_title: params.what,
      offset: lensaOffset,
      limit: limitEach,
    }),
    searchAdzunaJobs({
      what: params.what || '',
      where: params.where || '',
      page,
      results_per_page: limitEach,
      ...(params.salary_min && { salary_min: params.salary_min }),
    }),
  ])

  const lensaJobs: UnifiedJob[] = lensaData.status === 'fulfilled'
    ? lensaData.value.job_adverts.map(normalizeLensa)
    : []

  const adzunaJobs: UnifiedJob[] = adzunaData.status === 'fulfilled'
    ? adzunaData.value.results.map(normalizeAdzuna)
    : []

  const lensaCount = lensaData.status === 'fulfilled' ? lensaData.value.count : 0
  const adzunaCount = adzunaData.status === 'fulfilled' ? adzunaData.value.count : 0

  // Lensa en premier, puis Adzuna — intercalés pour un mix naturel
  const interleaved: UnifiedJob[] = []
  const maxLen = Math.max(lensaJobs.length, adzunaJobs.length)
  for (let i = 0; i < maxLen; i++) {
    if (lensaJobs[i]) interleaved.push(lensaJobs[i])
    if (adzunaJobs[i]) interleaved.push(adzunaJobs[i])
  }

  return {
    results: interleaved,
    count: lensaCount + adzunaCount,
  }
}