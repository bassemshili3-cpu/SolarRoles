import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { buildJobWhere, type JobWhereParams } from '@/lib/job-where'

export const MIN_LANDING_JOB_COUNT = 20

const readCachedJobCount = unstable_cache(
  async (filterKey: string) =>
    prisma.job.count({ where: buildJobWhere(JSON.parse(filterKey) as JobWhereParams) }),
  ['landing-job-count-v2'],
  { revalidate: 60 },
)

// Use one primitive key so metadata and lists also share an in-flight count.
// Empty/default filters and sorting do not change the matching jobs.
const readJobCountForRequest = cache(readCachedJobCount)

export function getCachedLandingJobCount(params: JobWhereParams): Promise<number> {
  const filters = Object.fromEntries(
    Object.entries(params)
      .filter(([key, value]) =>
        key !== 'sort' && value !== undefined && value !== '' && value !== false &&
        !(Array.isArray(value) && value.length === 0),
      )
      .sort(([a], [b]) => a.localeCompare(b)),
  )
  return readJobCountForRequest(JSON.stringify(filters))
}

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
