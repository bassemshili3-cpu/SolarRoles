export type PopularJobFilterTagId =
  | 'new'
  | 'salary'
  | 'entry-level'
  | 'per-diem'
  | 'full-time'
  | 'company-vehicle'
  | 'apprenticeship'
  | 'osha-10'
  | 'remote'

type ContextualJobFilterTagId = Exclude<PopularJobFilterTagId, 'new' | 'salary'>

export type PopularJobFilterTag = {
  id: PopularJobFilterTagId
  label: string
  param: 'sort' | 'salary_min' | 'experience' | 'benefits' | 'job_type' | 'certification' | 'arrangement'
  value: string
  multiValue?: boolean
}

type LandingFilterConfig = {
  salaryMin: number
  contextualTags: readonly [ContextualJobFilterTagId, ContextualJobFilterTagId]
}

const TAGS: Record<ContextualJobFilterTagId, PopularJobFilterTag> = {
  'entry-level': { id: 'entry-level', label: 'Entry-level', param: 'experience', value: 'entry' },
  'per-diem': { id: 'per-diem', label: 'Per diem', param: 'benefits', value: 'Per diem / travel pay', multiValue: true },
  'full-time': { id: 'full-time', label: 'Full-time', param: 'job_type', value: 'Full-time', multiValue: true },
  'company-vehicle': { id: 'company-vehicle', label: 'Company vehicle', param: 'benefits', value: 'Company vehicle', multiValue: true },
  apprenticeship: { id: 'apprenticeship', label: 'Apprenticeship', param: 'job_type', value: 'Apprenticeship', multiValue: true },
  'osha-10': { id: 'osha-10', label: 'OSHA 10', param: 'certification', value: 'osha10' },
  remote: { id: 'remote', label: 'Remote', param: 'arrangement', value: 'Remote', multiValue: true },
}

const DEFAULT_CONFIG: LandingFilterConfig = {
  salaryMin: 80_000,
  contextualTags: ['entry-level', 'per-diem'],
}

const LANDING_CONFIGS: Record<string, LandingFilterConfig> = {
  '/jobs': DEFAULT_CONFIG,
  '/solar-pv-installer-jobs': { salaryMin: 60_000, contextualTags: ['entry-level', 'full-time'] },
  '/lead-solar-installer-jobs': { salaryMin: 60_000, contextualTags: ['company-vehicle', 'per-diem'] },
  '/solar-electrician-jobs': { salaryMin: 80_000, contextualTags: ['apprenticeship', 'osha-10'] },
  '/solar-technician-jobs': { salaryMin: 70_000, contextualTags: ['entry-level', 'company-vehicle'] },
  '/bess-technician-jobs': { salaryMin: 70_000, contextualTags: ['osha-10', 'per-diem'] },
  '/solar-engineer-jobs': { salaryMin: 100_000, contextualTags: ['full-time', 'remote'] },
  '/solar-sales-jobs': { salaryMin: 100_000, contextualTags: ['full-time', 'remote'] },
  '/solar-jobs-no-experience': { salaryMin: 60_000, contextualTags: ['full-time', 'company-vehicle'] },
}

function normalizePathname(pathname: string | null): string {
  if (!pathname) return '/jobs'
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

export function getPopularJobFilterTags(pathname: string | null): PopularJobFilterTag[] {
  const config = LANDING_CONFIGS[normalizePathname(pathname)] ?? DEFAULT_CONFIG
  const salaryLabel = `$${Math.round(config.salaryMin / 1000)}k+`

  return [
    { id: 'new', label: 'New', param: 'sort', value: 'newest' },
    { id: 'salary', label: salaryLabel, param: 'salary_min', value: String(config.salaryMin) },
    ...config.contextualTags.map((tagId) => TAGS[tagId]),
  ]
}

export function isPromotedDrawerValue(
  pathname: string | null,
  param: PopularJobFilterTag['param'],
  value: string,
): boolean {
  if (param === 'sort' || param === 'salary_min') return false
  return getPopularJobFilterTags(pathname).some((tag) => tag.param === param && tag.value === value)
}

function splitParam(value: string | null): string[] {
  return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []
}

export function isPopularJobFilterActive(
  searchParams: Pick<URLSearchParams, 'get'>,
  tag: PopularJobFilterTag,
): boolean {
  if (!tag.multiValue) return searchParams.get(tag.param) === tag.value
  return splitParam(searchParams.get(tag.param)).includes(tag.value)
}

export function togglePopularJobFilter(
  searchParams: Pick<URLSearchParams, 'toString'>,
  tag: PopularJobFilterTag,
): URLSearchParams {
  const params = new URLSearchParams(searchParams.toString())
  const isActive = isPopularJobFilterActive(params, tag)

  if (tag.multiValue) {
    const values = splitParam(params.get(tag.param))
    const nextValues = isActive
      ? values.filter((value) => value !== tag.value)
      : [...values, tag.value]

    if (nextValues.length > 0) params.set(tag.param, nextValues.join(','))
    else params.delete(tag.param)
  } else if (isActive) {
    params.delete(tag.param)
  } else {
    params.set(tag.param, tag.value)
  }

  params.delete('page')
  return params
}
