import { differenceInCalendarDays, isValid, parse } from 'date-fns'
import type { WhatJobsJob } from './whatjobs'

type WhatJobsPostingAge = Pick<WhatJobsJob, 'age' | 'age_days'>

export function isNewWhatJobsJob(job: WhatJobsPostingAge, now = new Date()): boolean {
  if (Number.isInteger(job.age_days) && job.age_days !== null) {
    return job.age_days >= 0 && job.age_days < 7
  }

  const age = job.age?.trim()
  if (!age) return false
  if (/^(?:today|just now|\d+\s+(?:minute|minutes|hour|hours)\s+ago)$/i.test(age)) return true
  if (/^yesterday$/i.test(age)) return true

  const daysAgo = age.match(/^(\d+)\s+days?\s+ago$/i)
  if (daysAgo) return Number(daysAgo[1]) < 7

  for (const format of ['MMMM do, yyyy', 'MMMM d, yyyy', 'MMM do, yyyy', 'MMM d, yyyy', 'yyyy-MM-dd']) {
    const postedAt = parse(age, format, now)
    if (isValid(postedAt)) {
      const days = differenceInCalendarDays(now, postedAt)
      return days >= 0 && days < 7
    }
  }

  return false
}
