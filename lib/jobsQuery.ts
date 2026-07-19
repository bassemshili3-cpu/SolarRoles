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

async function fetchJobsPageUncached(
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

// Version cachée : mémorise la réponse par combinaison (params, page, resultsPerPage)
// pendant 60s. La majorité du trafic SEO tombe sur /jobs (page 1, aucun filtre) —
// ces visiteurs partagent tous la même réponse en cache, donc plus de round-trip
// Prisma du tout pour eux pendant la fenêtre de revalidation.
// NB: chaque combinaison distincte de filtres crée sa propre entrée de cache ;
// c'est voulu (long-tail de recherches filtrées reste correct), mais si un jour
// le nombre de combinaisons explose, réduire `revalidate` ou ne cacher que page===1.
export const getCachedJobsPage = unstable_cache(
  fetchJobsPageUncached,
  ['jobs-page'],
  { revalidate: 60 },
)

export { fetchJobsPageUncached }