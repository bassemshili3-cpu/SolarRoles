/** Two calendar months, in UTC; clamp month ends instead of rolling into the next month. */
export function jobRetentionCutoff(now = new Date()): Date {
  const cutoff = new Date(now)
  const day = cutoff.getUTCDate()
  cutoff.setUTCDate(1)
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 2)
  const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate()
  cutoff.setUTCDate(Math.min(day, lastDay))
  return cutoff
}

export function isJobTooOld(postedAt: Date | string | null | undefined, now = new Date()): boolean {
  if (!postedAt) return false
  const date = new Date(postedAt)
  return Number.isFinite(date.getTime()) && date < jobRetentionCutoff(now)
}

/** A discovery estimate is not a publication date. */
export function sourcePostedAt(job: { postedAt?: Date | null; postedAtEstimated?: boolean }): Date | null {
  if (job.postedAtEstimated || !job.postedAt || !Number.isFinite(job.postedAt.getTime())) return null
  return job.postedAt
}

export function retainedJobWhere(now = new Date()) {
  return { OR: [{ postedAt: null }, { postedAt: { gte: jobRetentionCutoff(now) } }] }
}
