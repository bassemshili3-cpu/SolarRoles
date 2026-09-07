import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { buildJobWhere, type JobWhereParams } from '@/lib/job-where'

export const MIN_LANDING_JOB_COUNT = 20

const getCachedLandingJobCount = unstable_cache(
  async (params: JobWhereParams) =>
    prisma.job.count({ where: buildJobWhere(params) }),
  ['landing-job-count'],
  { revalidate: 60 },
)

export async function getLandingJobCount(
  params: JobWhereParams,
): Promise<number | null> {
  try {
    return await getCachedLandingJobCount(params)
  } catch (error) {
    console.error('getLandingJobCount error:', error)
    return null
  }
}

export function withLandingJobCount(
  title: string,
  count: number | null,
): string {
  if (count === null || count < MIN_LANDING_JOB_COUNT) return title

  return `${count.toLocaleString('en-US')} ${title}`
}

export function getLandingPageNumber(value: unknown): number {
  const page = Number.parseInt(String(value || '1'), 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export function getLandingCanonical(
  baseUrl: string,
  searchParams: Record<string, unknown>,
): string {
  const page = getLandingPageNumber(searchParams.page)
  const hasFilters = Object.entries(searchParams).some(
    ([key, value]) => key !== 'page' && value !== undefined && value !== '',
  )

  return page > 1 && !hasFilters ? `${baseUrl}?page=${page}` : baseUrl
}
