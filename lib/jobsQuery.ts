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

// Pattern canonique Next.js : unstable_cache créé UNE SEULE FOIS au niveau module,
// avec la fonction cachée qui reçoit les vrais arguments à chaque appel. C'est ce
// qui permet à Next de dériver correctement une clé de cache par combinaison
// (params, page, resultsPerPage) — recréer un unstable_cache à chaque requête
// avec une closure sans argument (comme la version précédente) casse cette
// dérivation et produit des collisions de cache.
export const getCachedJobsPage = unstable_cache(
  fetchJobsPageUncached,
  ['jobs-page'],
  { revalidate: 60 },
)