import { prisma } from '@/lib/prisma'
import { matchesRoleTitle, ROLES } from '@/lib/roleSalary'
import { STATE_CODE_TO_NAME, codeToSlug } from '@/lib/usStates'

const STATE_NAMES = STATE_CODE_TO_NAME as Record<string, string>

export type WorkforceJob = {
  id: string
  title: string
  company: string | null
  description: string | null
  addressRegion: string | null
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryPeriod: string | null
  experienceLevel: string | null
  specialty: string | null
  postedAt: Date | null
  fetchedAt: Date
  source: string | null
  url: string | null
  applyUrl: string | null
  canonicalSlug: string | null
}

type RoleDefinition = {
  key: string
  label: string
  test: (job: WorkforceJob) => boolean
  jobsHref?: string
  salaryHref?: string
  guideHref?: string
}

const NAME_TO_CODE = Object.fromEntries(
  Object.entries(STATE_NAMES).map(([code, name]) => [name.toLowerCase(), code])
)

const STATE_ENTRIES = Object.entries(STATE_NAMES)
  .filter(([code]) => code.length === 2 && code !== 'DC')
  .sort((a, b) => a[1].localeCompare(b[1]))

const text = (value: string | null | undefined) => (value ?? '').toLowerCase()

export function normalizeStateCode(region: string | null | undefined) {
  if (!region) return null
  const raw = region.trim()
  const upper = raw.toUpperCase()
  if (STATE_NAMES[upper]) return upper
  return NAME_TO_CODE[raw.toLowerCase()] ?? null
}

const COMPANY_ALIASES: Record<string, string> = {
  nextera: 'NextEra Energy',
  'nextera energy': 'NextEra Energy',
  'aes us': 'AES',
  aes: 'AES',
  'novasource power services': 'NovaSource Power',
  'novasource power': 'NovaSource Power',
  'moss construction': 'Moss',
  'moss & associates': 'Moss',
  moss: 'Moss',
  'skillit.': 'Skillit',
  skillit: 'Skillit',
}

const KNOWN_STAFFING_RECRUITING = new Set([
  'skillit',
  'salesdraft recruiting',
  'charlie mike recruiting',
  'jobot',
  'aerotek',
])

export type EmployerOrganizationType = 'direct-employer' | 'staffing-recruiting'

export function cleanCompanyName(company: string | null | undefined) {
  if (!company) return 'Employer not listed'

  const stripped = company
    .replace(/\s+duplicate check\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!stripped) return 'Employer not listed'

  return COMPANY_ALIASES[stripped.toLowerCase()] ?? stripped
}

export function classifyEmployerOrganization(
  company: string | null | undefined
): EmployerOrganizationType {
  const normalized = cleanCompanyName(company).toLowerCase()

  if (
    KNOWN_STAFFING_RECRUITING.has(normalized) ||
    /\b(recruiting|staffing|talent solutions|workforce solutions)\b/i.test(normalized)
  ) {
    return 'staffing-recruiting'
  }

  return 'direct-employer'
}

function normalizedDestinationUrl(job: WorkforceJob) {
  const candidate = (job.applyUrl || job.url || '').trim()
  if (!candidate) return null

  try {
    const parsed = new URL(candidate)
    parsed.hash = ''
    ;[
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'source',
      'src',
    ].forEach((param) => parsed.searchParams.delete(param))
    return parsed.toString().replace(/\/$/, '').toLowerCase()
  } catch {
    return candidate
      .replace(/[?#].*$/, '')
      .replace(/\/$/, '')
      .toLowerCase()
  }
}

function employerRankingKey(job: WorkforceJob) {
  const company = cleanCompanyName(job.company).toLowerCase()
  const destination = normalizedDestinationUrl(job)

  // Exact destination URLs are the safest cross-source duplicate signal we have.
  // When no destination is available, keep the Prisma record distinct rather
  // than collapsing same-title/same-location requisitions that may be legitimate.
  return destination ? `${company}|${destination}` : `${company}|id:${job.id}`
}

function dedupeEmployerRankingJobs(jobs: WorkforceJob[]) {
  const seen = new Set<string>()
  const unique: WorkforceJob[] = []
  let duplicateRowsRemoved = 0

  for (const job of jobs) {
    const key = employerRankingKey(job)
    if (seen.has(key)) {
      duplicateRowsRemoved += 1
      continue
    }
    seen.add(key)
    unique.push(job)
  }

  return { unique, duplicateRowsRemoved }
}

export function isExplicitEntryLevel(job: WorkforceJob) {
  const d = text(job.description)
  const level = text(job.experienceLevel)
  return (
    level === 'entry_level' ||
    level === 'entry level' ||
    d.includes('entry-level') ||
    d.includes('entry level') ||
    d.includes('no experience required') ||
    d.includes('no experience necessary')
  )
}

function containsAny(haystack: string, terms: string[]) {
  return terms.some((term) => haystack.includes(term))
}

// Validated ambiguity guards from the September 15, 2026 manual spot-check.
// Generic exact-term matchers remain sufficient for the other audited terms.
const ROLE_SECTION_MARKERS = [
  'about the role',
  'position overview',
  'job description',
  'basic job functions',
  'responsibilities',
  "what you'll do",
  'what you’ll do',
  'essential duties',
  'qualifications',
  'requirements',
  'preferred qualifications',
  'position summary',
  'job functions',
  'key responsibilities',
]

export function matchesBessJobContext(title: string, description: string) {
  if (/\bBESS\b/i.test(title)) return true

  const normalized = description.replace(/\s+/g, ' ')
  const matches = [...normalized.matchAll(/\bBESS\b/gi)]

  if (matches.length === 0) return false
  if (matches.length >= 2) return true

  const matchIndex = matches[0].index ?? -1
  if (matchIndex < 0) return false

  const lower = normalized.toLowerCase()
  const markerPositions = ROLE_SECTION_MARKERS
    .map((marker) => lower.indexOf(marker))
    .filter((position) => position >= 0)

  return markerPositions.length > 0 && Math.min(...markerPositions) < matchIndex
}

const ELECTRICAL_JOURNEYMAN_PATTERN =
  /\bjourneyman\s+(?:electrician|electrical|wireman|license|licence|certification)\b|\b(?:electrical|electrician)\s+journeyman\b|\bjourneyman\s+level\b/i

export function matchesElectricalJourneyman(title: string, description: string) {
  const combined = `${title} ${description}`

  if (ELECTRICAL_JOURNEYMAN_PATTERN.test(combined)) return true

  if (
    !/\bjourneyman\b/i.test(combined) ||
    !/\b(electrician|electrical|solar technician|pv technician|field service technician)\b/i.test(title)
  ) {
    return false
  }

  const matches = [...combined.matchAll(/\bjourneyman\b/gi)]

  return matches.some((match) => {
    const index = match.index ?? 0
    const local = combined.slice(
      Math.max(0, index - 100),
      Math.min(combined.length, index + 120)
    )

    return /\b(electric|wireman|solar|pv)\b/i.test(local)
  })
}

function matchesPostingPattern(job: WorkforceJob, pattern: RegExp) {
  return pattern.test(`${job.title} ${job.description ?? ''}`)
}

export function matchesSolarTechnicianTitle(title: string) {
  const normalizedTitle = text(title)
  return (
    containsAny(normalizedTitle, ['solar technician', 'pv technician', 'solar field service', 'pv field service']) ||
    (containsAny(normalizedTitle, ['technician', 'o&m', 'field service']) &&
      containsAny(normalizedTitle, ['solar', 'pv', 'photovoltaic']))
  )
}

export function matchesProjectManagementTitle(title: string) {
  return containsAny(text(title), [
    'project manager',
    'assistant project manager',
    'construction manager',
    'superintendent',
  ])
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    key: 'pv-installer',
    label: 'PV Installer',
    test: (job) => {
      const t = text(job.title)
      return (
        (containsAny(t, ['solar installer', 'pv installer', 'photovoltaic installer']) ||
          (t.includes('installer') && containsAny(t, ['solar', 'pv', 'photovoltaic']))) &&
        !containsAny(t, ['lead installer', 'crew lead', 'foreman'])
      )
    },
    jobsHref: '/solar-pv-installer-jobs',
    salaryHref: '/data/salaries/solar-photovoltaic-installer',
    guideHref: '/resources/how-to-become-a-solar-installer',
  },
  {
    key: 'lead-installer',
    label: 'Lead Installer / Foreman',
    test: (job) => {
      const t = text(job.title)
      return (
        containsAny(t, ['lead solar installer', 'lead installer', 'solar foreman', 'pv foreman']) ||
        (containsAny(t, ['crew lead', 'foreman']) && containsAny(t, ['solar', 'pv']))
      )
    },
    jobsHref: '/lead-solar-installer-jobs',
    salaryHref: '/data/salaries/lead-solar-installer',
    guideHref: '/resources/solar-certifications-by-job-role',
  },
  {
    key: 'electrician',
    label: 'Solar Electrician',
    test: (job) => {
      const t = text(job.title)
      return t.includes('solar electrician') || (t.includes('electrician') && containsAny(t, ['solar', 'pv']))
    },
    jobsHref: '/solar-electrician-jobs',
    salaryHref: '/data/salaries/solar-electrician',
    guideHref: '/resources/solar-installer-vs-electrician-texas',
  },
  {
    key: 'technician',
    label: 'Solar Technician / O&M',
    test: (job) => matchesSolarTechnicianTitle(job.title),
    jobsHref: '/solar-technician-jobs',
    salaryHref: '/data/salaries/solar-technician',
    guideHref: '/resources/solar-certifications-by-job-role',
  },
  {
    key: 'sales',
    label: 'Solar Sales',
    test: (job) => {
      const t = text(job.title)
      return (
        (t.includes('solar') && containsAny(t, ['sales', 'consultant', 'advisor', 'closer', 'setter'])) ||
        (containsAny(t, ['sales representative', 'energy consultant', 'energy advisor']) && text(job.specialty).includes('residential'))
      )
    },
    jobsHref: '/solar-sales-jobs',
    salaryHref: '/data/salaries/solar-sales-representative',
    guideHref: '/resources/solar-sales-1099-vs-w2-pay',
  },
  {
    key: 'engineer',
    label: 'Solar / BESS Engineer',
    test: (job) => {
      const t = text(job.title)
      return t.includes('engineer') && containsAny(`${t} ${text(job.specialty)}`, ['solar', 'pv', 'photovoltaic', 'bess', 'battery'])
    },
    jobsHref: '/solar-engineer-jobs',
    salaryHref: '/data/salaries/solar-engineer',
    guideHref: '/resources/solar-engineer-jobs',
  },
  {
    key: 'project-management',
    label: 'Project Management',
    test: (job) => matchesProjectManagementTitle(job.title),
    guideHref: '/resources',
  },
  {
    key: 'bess-technician',
    label: 'BESS Technician',
    test: (job) => matchesRoleTitle(ROLES['bess-technician'], job.title),
    jobsHref: '/bess-technician-jobs',
    guideHref: '/resources/do-you-need-to-be-an-electrician-for-bess',
  },
]

export const SKILL_DEFINITIONS = [
  { label: 'SCADA', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bSCADA\b/i), href: '/solar-technician-jobs' },
  { label: 'BESS', test: (job: WorkforceJob) => matchesBessJobContext(job.title, job.description ?? ''), href: '/bess-technician-jobs' },
  { label: 'NABCEP', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bNABCEP\b/i), href: '/certifications' },
  { label: 'OSHA 10', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bOSHA[\s-]*10\b/i), href: '/certifications' },
  { label: 'OSHA 30', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bOSHA[\s-]*30\b/i), href: '/certifications' },
  { label: 'NFPA 70E', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bNFPA[\s-]*70E\b/i), href: '/resources/osha-safety-guide-solar-installers' },
  { label: 'AutoCAD', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bAutoCAD\b/i), href: '/resources/solar-engineer-jobs' },
  { label: 'PVsyst', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bPVsyst\b/i), href: '/resources/solar-engineer-jobs' },
  { label: 'HelioScope', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bHelioScope\b/i), href: '/resources/solar-engineer-jobs' },
  { label: 'ETAP', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bETAP\b/i), href: '/resources/solar-engineer-jobs' },
  { label: 'PVcase', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bPVcase\b/i), href: '/resources/solar-engineer-jobs' },
  { label: 'Revit', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bRevit\b/i), href: '/resources/solar-engineer-jobs' },
  { label: 'Bluebeam', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bBluebeam\b/i), href: '/resources/solar-engineer-jobs' },
  { label: 'Electrical journeyman', test: (job: WorkforceJob) => matchesElectricalJourneyman(job.title, job.description ?? ''), href: '/resources/solar-certifications-by-job-role' },
  { label: 'Electrical license', test: (job: WorkforceJob) => matchesPostingPattern(job, /\blicensed\s+(?:master\s+)?electrician\b|\b(?:apprentice\s+|journeyman\s+|master\s+|state\s+|commercial\s+|residential\s+)?electrical\s+(?:license|licence|licensing)\b|\belectrician\s+(?:license|licence)\b/i), href: '/resources/solar-certifications-by-job-role' },
  { label: 'Commissioning', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bcommissioning\b/i), href: '/solar-technician-jobs' },
  { label: 'CPR', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bCPR\b/i), href: '/resources/osha-safety-guide-solar-installers' },
  { label: 'First Aid', test: (job: WorkforceJob) => matchesPostingPattern(job, /\bfirst[\s-]+aid\b/i), href: '/resources/osha-safety-guide-solar-installers' },
]

function annualizedMidpoint(job: WorkforceJob) {
  if (job.salaryMin == null || job.salaryMax == null) return null
  const midpoint = (job.salaryMin + job.salaryMax) / 2
  const period = text(job.salaryPeriod).toUpperCase()

  let annual = midpoint
  if (period === 'HOUR') annual = midpoint * 2080
  else if (period === 'WEEK') annual = midpoint * 52
  else if (period === 'MONTH') annual = midpoint * 12
  else if (period === 'YEAR') annual = midpoint
  else if (midpoint >= 10 && midpoint <= 250) annual = midpoint * 2080

  if (annual < 20_000 || annual > 600_000) return null
  return annual
}

function avg(values: number[]) {
  if (!values.length) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function median(values: number[]) {
  if (!values.length) return null

  const sorted = [...values].sort((a, b) => a - b)
  const midpoint = Math.floor(sorted.length / 2)
  const value = sorted.length % 2
    ? sorted[midpoint]
    : (sorted[midpoint - 1] + sorted[midpoint]) / 2

  return Math.round(value)
}

export async function getWorkforceJobs(): Promise<WorkforceJob[]> {
  return prisma.job.findMany({
    where: { active: true },
    select: {
      id: true,
      title: true,
      company: true,
      description: true,
      addressRegion: true,
      location: true,
      salaryMin: true,
      salaryMax: true,
      salaryPeriod: true,
      experienceLevel: true,
      specialty: true,
      postedAt: true,
      fetchedAt: true,
      source: true,
      url: true,
      applyUrl: true,
      canonicalSlug: true,
    },
  })
}

export async function getWorkforceSnapshot() {
  const jobs = await getWorkforceJobs()
  const {
    unique: employerRankingJobs,
    duplicateRowsRemoved: employerRankingDuplicateRowsRemoved,
  } = dedupeEmployerRankingJobs(jobs)

  const stateMap = new Map<string, number>()
  const employerMap = new Map<
    string,
    {
      count: number
      states: Set<string>
      organizationType: EmployerOrganizationType
    }
  >()
  const entryEmployerMap = new Map<string, number>()
  const entryStateMap = new Map<string, number>()
  const entryStateEmployerMap = new Map<string, Map<string, number>>()

  for (const job of jobs) {
    const stateCode = normalizeStateCode(job.addressRegion)
    if (stateCode && stateCode !== 'DC') {
      stateMap.set(stateCode, (stateMap.get(stateCode) ?? 0) + 1)
    }

    const company = cleanCompanyName(job.company)

    if (isExplicitEntryLevel(job)) {
      entryEmployerMap.set(company, (entryEmployerMap.get(company) ?? 0) + 1)
      if (stateCode) {
        entryStateMap.set(stateCode, (entryStateMap.get(stateCode) ?? 0) + 1)

        const employersForState = entryStateEmployerMap.get(stateCode) ?? new Map<string, number>()
        employersForState.set(company, (employersForState.get(company) ?? 0) + 1)
        entryStateEmployerMap.set(stateCode, employersForState)
      }
    }
  }

  // Employer ranking uses a more conservative posting layer than the rest of
  // the workforce snapshot: exact duplicate destination URLs are collapsed,
  // while separate requisitions are retained when duplication cannot be shown.
  for (const job of employerRankingJobs) {
    const stateCode = normalizeStateCode(job.addressRegion)
    const company = cleanCompanyName(job.company)
    const employer = employerMap.get(company) ?? {
      count: 0,
      states: new Set<string>(),
      organizationType: classifyEmployerOrganization(company),
    }

    employer.count += 1
    if (stateCode) employer.states.add(stateCode)
    employerMap.set(company, employer)
  }

  const states = STATE_ENTRIES.map(([code, name]) => {
    const entryLevelCount = entryStateMap.get(code) ?? 0
    const entryEmployers = Array.from((entryStateEmployerMap.get(code) ?? new Map<string, number>()).entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    const topEntryEmployer = entryEmployers[0] ?? null

    return {
      code,
      name,
      slug: codeToSlug(code) ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: stateMap.get(code) ?? 0,
      entryLevelCount,
      entryLevelEmployerCount: entryEmployers.length,
      entryLevelTopEmployerName: topEntryEmployer?.[0] ?? null,
      entryLevelTopEmployerCount: topEntryEmployer?.[1] ?? 0,
      entryLevelTopEmployerShare:
        entryLevelCount > 0 && topEntryEmployer ? (topEntryEmployer[1] / entryLevelCount) * 100 : 0,
    }
  }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const topEmployers = Array.from(employerMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      states: Array.from(data.states).sort(),
      organizationType: data.organizationType,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const entryLevelJobs = jobs.filter(isExplicitEntryLevel)
  const topEntryEmployers = Array.from(entryEmployerMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const roleStats = ROLE_DEFINITIONS.map((role) => {
    const matching = jobs.filter(role.test)
    const salaries = matching.map(annualizedMidpoint).filter((value): value is number => value != null)
    return {
      key: role.key,
      label: role.label,
      count: matching.length,
      entryLevelCount: matching.filter(isExplicitEntryLevel).length,
      avgAnnualizedListedPay: avg(salaries),
      medianAnnualizedListedPay: median(salaries),
      salarySample: salaries.length,
      jobsHref: role.jobsHref,
      salaryHref: role.salaryHref,
      guideHref: role.guideHref,
    }
  })

  const skillStats = SKILL_DEFINITIONS.map((skill) => {
    const count = jobs.reduce(
      (total, job) => total + (skill.test(job) ? 1 : 0),
      0
    )
    return { label: skill.label, href: skill.href, count }
  }).sort((a, b) => b.count - a.count)

  const salaryValues = jobs.map(annualizedMidpoint).filter((value): value is number => value != null)

  return {
    dataAsOf: jobs.reduce<Date | null>(
      (latest, job) => (!latest || job.fetchedAt > latest ? job.fetchedAt : latest),
      null
    ),
    totalJobs: jobs.length,
    employerCount: employerMap.size,
    statesCovered: states.filter((state) => state.count > 0).length,
    entryLevelCount: entryLevelJobs.length,
    entryLevelPct: jobs.length ? (entryLevelJobs.length / jobs.length) * 100 : 0,
    avgAnnualizedListedPay: avg(salaryValues),
    medianAnnualizedListedPay: median(salaryValues),
    salarySample: salaryValues.length,
    states,
    topStates: states.filter((state) => state.count > 0).slice(0, 12),
    topEmployers,
    employerRankingDuplicateRowsRemoved,
    topEntryEmployers,
    roleStats,
    skillStats,
  }
}

export function formatMoney(value: number | null | undefined) {
  if (value == null) return '—'
  return `$${Math.round(value).toLocaleString('en-US')}`
}
