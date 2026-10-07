import { getPublicJobLink } from './job-url'
import { prisma } from '@/lib/prisma'
import { buildJobWhere } from './job-where'
const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']
function resolveString(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] || '' : value || '' }
export async function getMergedJobCount(params: {
  what?:          string | string[]
  whatPhrases?:   string[]
  excludePhrases?: string[]
  descriptionContainsAny?: string[] // AND indépendant : la description doit contenir au moins une de ces phrases
  where?:         string | string[]
  salary_min?:    number | string
  postedWithin?:  number
  jobTypes?:      string[]
  arrangements?:  string[]
  experience?:    string
  education?:     string
  companySizes?:  string[]
  benefits?:      string[]
  easyApply?:     boolean
  visaSponsorship?: boolean
}) {
 const where = buildJobWhere({ ...params, what: resolveString(params.what), where: resolveString(params.where), salaryMin: params.salary_min ? Number(params.salary_min) : undefined })
 return { count: await prisma.job.count({ where: { ...where, source: { in: ACTIVE_SOURCES } } }) }
}
export async function searchMergedJobs(params: {
  what?:            string | string[]
  whatPhrases?:     string[]
  excludePhrases?:  string[]  // NEW: si une de ces phrases apparaît, l'offre est écartée
                               // même si elle matche whatPhrases. Utile pour désambiguïser
                               // un acronyme comme "FIFO" (rotation FIFO vs méthode d'inventaire).
  descriptionContainsAny?: string[] // AND indépendant : la description doit contenir au moins une de ces phrases
  where?:           string | string[]
  salary_min?:      number | string
  results_per_page?: number
  page?:            number
}) {
 const page = params.page ?? 1, take = params.results_per_page ?? 30
 const where = { ...buildJobWhere({ ...params, what: resolveString(params.what), where: resolveString(params.where), salaryMin: params.salary_min ? Number(params.salary_min) : undefined }), source: { in: ACTIVE_SOURCES } }
 const [jobs, count] = await Promise.all([prisma.job.findMany({ where, orderBy: [{ sourcePriority: 'asc' }, { fetchedAt: 'desc' }], skip: (page - 1) * take, take }), prisma.job.count({ where })])
 return { count, results: jobs.map(job => ({ ...job, url: getPublicJobLink(job), apply_url: job.applyUrl, salary_min: job.salaryMin, salary_max: job.salaryMax, postedAt: job.postedAt?.toISOString() || null, created: job.postedAt?.toISOString() || null })) }
}
