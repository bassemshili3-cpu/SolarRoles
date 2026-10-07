import type { Prisma } from '@prisma/client'
export const WORK_SETTING_PHRASES = {
 HYBRID: ['hybrid', 'partial remote'],
 REMOTE: ['fully remote', 'work from home', 'remote'],
 ON_SITE: ['on-site', 'onsite', 'on site', 'field-based', 'field based', 'in-office', 'in office', 'jobsite', 'job site', 'rooftop'],
} as const
export type WorkSetting = keyof typeof WORK_SETTING_PHRASES
export function normalizeWorkSetting(job: { workSetting?: string | null; isRemote?: boolean; location: string }): WorkSetting | null {
 if (job.workSetting && job.workSetting in WORK_SETTING_PHRASES) return job.workSetting as WorkSetting
 const location = job.location.toLowerCase()
 if (WORK_SETTING_PHRASES.HYBRID.some(v => location.includes(v))) return 'HYBRID'
 if (job.isRemote === true || WORK_SETTING_PHRASES.REMOTE.some(v => location.includes(v))) return 'REMOTE'
 if (WORK_SETTING_PHRASES.ON_SITE.some(v => location.includes(v))) return 'ON_SITE'
 return null
}
export function workSettingValues(labels: string[]) {
 return [...new Set(labels.flatMap(label => label === 'Hybrid' ? ['HYBRID'] : label === 'Remote' ? ['REMOTE'] : label === 'Office / Remote' ? ['REMOTE','HYBRID','ON_SITE'] : label === 'On-site' || label === 'Field / On-site' ? ['ON_SITE'] : []))] as WorkSetting[]
}
export function workSettingWhere(labels: string[]): Prisma.JobWhereInput {
 const values = workSettingValues(labels)
 const locationHas = (phrases: readonly string[]): Prisma.JobWhereInput => ({ OR: phrases.map(phrase => ({ location: { contains: phrase, mode: 'insensitive' } })) })
 return { OR: values.map(value => ({ OR: [
  { workSetting: value },
  { AND: [{ workSetting: null }, locationHas(WORK_SETTING_PHRASES[value]), ...(value !== 'HYBRID' ? [{ NOT: locationHas(WORK_SETTING_PHRASES.HYBRID) }] : []), ...(value === 'ON_SITE' ? [{ NOT: locationHas(WORK_SETTING_PHRASES.REMOTE) }] : [])] },
 ] })) }
}
