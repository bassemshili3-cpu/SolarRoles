// lib/getJobs.ts
import { getCachedJobsPage } from '@/lib/jobsQuery'
import type { JobWhereParams } from '@/lib/job-where'

export async function getJobs(
  params: JobWhereParams & { page?: number; resultsPerPage?: number }
) {
  const { page = 1, resultsPerPage = 30, ...whereParams } = params
  try {
    return await getCachedJobsPage(whereParams, page, resultsPerPage)
  } catch (err: any) {
    console.error('getJobs error:', err.message)
    return { results: [], count: 0 }
  }
}
