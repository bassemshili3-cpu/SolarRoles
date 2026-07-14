// lib/getJobs.ts
import { prisma } from '@/lib/prisma'
import { buildJobWhere, JobWhereParams } from '@/lib/job-where'

const JOB_LIST_SELECT = {
  id: true, title: true, company: true, location: true,
  addressRegion: true, url: true, applyUrl: true,
  salaryMin: true, salaryMax: true, salary: true,
  contractType: true, contractTime: true, source: true, postedAt: true,
  // description volontairement exclu : trop lourd pour une liste
} as const

function mapJob(job: any) {
  return {
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
  }
}

/** Remplace searchMergedJobs — retourne résultats paginés + count, tous filtres supportés */
export async function getJobs(
  params: JobWhereParams & { page?: number; resultsPerPage?: number }
) {
  const { page = 1, resultsPerPage = 30, ...whereParams } = params
  try {
    const whereClause = buildJobWhere(whereParams)
    const [dbJobs, count] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        select: JOB_LIST_SELECT,
        orderBy: [{ sourcePriority: 'asc' }, { fetchedAt: 'desc' }],
        skip: (page - 1) * resultsPerPage,
        take: resultsPerPage,
      }),
      prisma.job.count({ where: whereClause }),
    ])
    return { results: dbJobs.map(mapJob), count }
  } catch (err: any) {
    console.error('getJobs error:', err.message)
    return { results: [], count: 0 }
  }
}

/** Remplace getMergedJobCount — mêmes filtres, sans le coût de fetch des résultats */
export async function getJobsCount(params: JobWhereParams) {
  try {
    const count = await prisma.job.count({ where: buildJobWhere(params) })
    return { count }
  } catch (err: any) {
    console.error('getJobsCount error:', err.message)
    return { count: 0 }
  }
}