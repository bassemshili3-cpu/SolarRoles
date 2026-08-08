// lib/jobsQuery.ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { buildJobWhere, type JobWhereParams } from '@/lib/job-where'

export type JobsListResult = {
  results: any[]
  count: number
}

const JOB_SELECT = {
  id: true, title: true, company: true, location: true,
  addressRegion: true, url: true, applyUrl: true,
  salaryMin: true, salaryMax: true, salary: true,
  contractType: true, contractTime: true, source: true, postedAt: true,
} as const

export async function fetchJobsPageUncached(
  params: JobWhereParams,
  page: number,
  resultsPerPage: number,
): Promise<JobsListResult> {
  const whereClause = buildJobWhere(params)

  const [dbJobs, count] = await Promise.all([
    prisma.job.findMany({
      where: whereClause,
      select: JOB_SELECT,
      orderBy: [
        { sourcePriority: 'asc' },
        { fetchedAt: 'desc' },
      ],
      skip: (page - 1) * resultsPerPage,
      take: resultsPerPage,
    }),
    prisma.job.count({ where: whereClause }),
  ])

  const results = dbJobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    addressRegion: job.addressRegion,
    url: job.url,
    applyUrl: job.applyUrl,
    apply_url: job.applyUrl,
    salary: job.salary,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    contractType: job.contractType,
    contractTime: job.contractTime,
    source: job.source,
    postedAt: job.postedAt?.toISOString() || null,
    created: job.postedAt?.toISOString() || null,
  }))

  return { results, count }
}

// Comme pour /api/jobs-count avant : on ne fait pas confiance au hashing implicite
// des arguments par unstable_cache pour différencier les combinaisons de filtres.
// La clé encode explicitement params + page + resultsPerPage — même combinaison
// = même entrée de cache, combinaison différente = entrée différente, garanti.
export async function getCachedJobsPage(
  params: JobWhereParams,
  page: number,
  resultsPerPage: number,
): Promise<JobsListResult> {
  return unstable_cache(
    () => fetchJobsPageUncached(params, page, resultsPerPage),
    ['jobs-page', JSON.stringify(params), String(page), String(resultsPerPage)],
    { revalidate: 60 },
  )()
}