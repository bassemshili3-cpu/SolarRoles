// lib/job-where.ts
// Shared Prisma WHERE clause builder — used by /api/jobs-all and /api/jobs-count

import { Prisma } from '@prisma/client'
import { STATES } from './usStates'

// ── Constants ─────────────────────────────────────────────────────────────────

export const ACTIVE_SOURCES = ['lever', 'adzuna', 'pinpoint', 'workable', 'employer', 'greenhouse'] as const

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that',
  'the', 'to', 'was', 'were', 'will', 'with',
])

function meaningfulKeywords(input: string): string[] {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .filter((kw) => kw.length > 2 && !STOPWORDS.has(kw.toLowerCase()))
}

const JOB_TYPE_KEYWORDS: Record<string, string[]> = {
  'Full-time':  ['full-time', 'full time'],
  'Part-time':  ['part-time', 'part time'],
  'Contract':   ['contract', 'contractor'],
  'Internship': ['intern', 'internship'],
  'Temporary':  ['temporary', 'temp'],
  'Freelance':  ['freelance'],
  'Per diem':   ['per diem'],
}

const EXPERIENCE_KEYWORDS: Record<string, string[]> = {
  internship: ['intern', 'internship'],
  entry:      ['entry level', 'entry-level', 'junior', 'associate', 'new grad', '0-1 year', '0-2 year', 'no experience'],
  mid:        ['mid level', 'mid-level', '2-4 year', '3-5 year', '2+ year', '3+ year'],
  senior:     ['senior', 'sr.', 'lead', '5+ year', '5-8 year', '7+ year'],
  manager:    ['manager', 'management', 'team lead', 'supervisor', 'head of'],
  director:   ['director', 'vp of', 'vice president'],
  executive:  ['chief', 'cto', 'cfo', 'coo', 'ceo', 'executive', 'president', 'c-suite'],
}

const EDUCATION_KEYWORDS: Record<string, string[]> = {
  high_school: ['high school diploma', 'ged', 'high school'],
  associate:   ["associate's degree", "associate degree", 'a.a.', 'a.s.'],
  bachelor:    ["bachelor's degree", "bachelor degree", 'b.s.', 'b.a.', 'undergraduate degree'],
  master:      ["master's degree", "master degree", 'm.s.', 'm.b.a.', 'mba', 'postgraduate'],
  phd:         ['phd', 'doctorate', 'ph.d.', 'doctoral degree'],
}

const ARRANGEMENT_KEYWORDS: Record<string, string[]> = {
  Remote:    ['remote', 'work from home', 'wfh', 'telecommute', 'distributed'],
  Hybrid:    ['hybrid', 'flexible work', 'partial remote'],
  'On-site': ['on-site', 'onsite', 'in-office', 'in office', 'on site'],
}

const BENEFIT_KEYWORDS: Record<string, string[]> = {
  'Health insurance':       ['health insurance', 'medical insurance', 'medical benefits', 'healthcare'],
  'Dental & Vision':        ['dental', 'vision insurance', 'dental and vision'],
  '401(k) match':           ['401k', '401(k)', 'retirement match', 'employer match'],
  'Paid time off':          ['paid time off', 'pto', 'vacation days', 'paid vacation'],
  'Stock options / RSU':    ['stock options', 'equity', 'rsu', 'restricted stock', 'esop'],
  'Remote stipend':         ['remote stipend', 'home office stipend', 'equipment stipend', 'internet stipend'],
  'Tuition reimbursement':  ['tuition reimbursement', 'education assistance', 'tuition assistance'],
  'Parental leave':         ['parental leave', 'maternity leave', 'paternity leave', 'family leave'],
  'Wellness perks':         ['gym membership', 'wellness', 'mental health', 'employee assistance'],
}

const COMPANY_SIZE_KEYWORDS: Record<string, string[]> = {
  'Startup (1–50)':     ['startup', 'start-up', 'early stage', 'seed stage', 'series a'],
  'Small (51–200)':     ['small company', 'growing team', 'small team', 'boutique'],
  'Mid-size (201–1k)':  ['mid-size', 'midsize', 'medium company'],
  'Large (1k–5k)':      ['large company', 'established company', 'well-established'],
  'Enterprise (5k+)':   ['fortune 500', 'fortune500', 'enterprise', 'multinational', 'global company'],
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JobWhereParams {
  what?: string
  whatPhrases?: string[]
  excludePhrases?: string[]
  descriptionContainsAny?: string[]
  isFifo?: boolean 
  where?: string
  salaryMin?: number
  postedWithin?: number
  jobTypes?: string[]
  arrangements?: string[]
  experience?: string
  education?: string
  companySizes?: string[]
  benefits?: string[]
  easyApply?: boolean
  visaSponsorship?: boolean
}

// ── Helper ────────────────────────────────────────────────────────────────────

function keywordOr(
  keywords: string[],
  fields: Array<'title' | 'description' | 'location' | 'company'> = ['title', 'description'],
): Prisma.JobWhereInput[] {
  return keywords.flatMap((kw) =>
    fields.map((field) => ({ [field]: { contains: kw, mode: 'insensitive' as const } })),
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildJobWhere(params: JobWhereParams): Prisma.JobWhereInput {
  const {
    what          = '',
    whatPhrases   = [],
    excludePhrases = [],
    descriptionContainsAny = [],
    isFifo        = false, 
    where         = '',
    salaryMin,
    postedWithin,
    jobTypes      = [],
    arrangements  = [],
    experience    = '',
    education     = '',
    companySizes  = [],
    benefits      = [],
    easyApply     = false,
    visaSponsorship = false,
  } = params

  const AND: Prisma.JobWhereInput[] = []

  if (whatPhrases.length > 0) {
    AND.push({ OR: keywordOr(whatPhrases, ['title', 'description']) })
 } else if (what) {
  const keywords = meaningfulKeywords(what)
  for (const kw of keywords) {
    AND.push({ OR: keywordOr([kw], ['title', 'company', 'description']) })
  }
}

  if (excludePhrases.length > 0) {
    AND.push({
      NOT: { OR: keywordOr(excludePhrases, ['title', 'description']) },
    })
  }

  // ── Description doit confirmer explicitement un âge éligible ────────────────
  // AND indépendant de whatPhrases/what — pas un OR avec eux. Utilisé par les
  // pages jobs-for-X-year-olds pour ne garder que les offres où l'employeur
  // mentionne lui-même l'âge minimum accepté.
  if (descriptionContainsAny.length > 0) {
    AND.push({
      OR: descriptionContainsAny.map((phrase) => ({
        description: { contains: phrase, mode: 'insensitive' as const },
      })),
    })
  }

   // ── Fifo tag précalculé à l'ingestion ────────────────────────────────────────
  if (isFifo) {
    AND.push({ isFifo: true })
  }

  // ── Location ────────────────────────────────────────────────────────────────
  // dans buildJobWhere, remplace le bloc where actuel par :
if (where) {
  const trimmedWhere = where.trim()
  const matchedStateCode = STATES[trimmedWhere] // ex: "Massachusetts" -> "MA", undefined si ce n'est pas un nom d'état exact

  AND.push({
    OR: [
      { location:      { contains: trimmedWhere, mode: 'insensitive' } },
      { addressRegion: { contains: trimmedWhere, mode: 'insensitive' } },
      ...(matchedStateCode
        ? [{ addressRegion: { equals: matchedStateCode, mode: 'insensitive' as const } }]
        : []),
    ],
  })
}

  // ── Salary ──────────────────────────────────────────────────────────────────
  if (salaryMin) {
    AND.push({ salaryMin: { gte: salaryMin } })
  }

  // ── Date posted ─────────────────────────────────────────────────────────────
  if (postedWithin) {
    AND.push({ postedAt: { gte: new Date(Date.now() - postedWithin * 86_400_000) } })
  }

  // ── Job type ────────────────────────────────────────────────────────────────
  if (jobTypes.length > 0) {
    const kws = jobTypes.flatMap((t) => JOB_TYPE_KEYWORDS[t] ?? [])
    if (kws.length > 0) {
      AND.push({ OR: keywordOr(kws, ['title', 'description']) })
    }
  }

  // ── Work arrangement ────────────────────────────────────────────────────────
  if (arrangements.length > 0) {
    const kws = arrangements.flatMap((a) => ARRANGEMENT_KEYWORDS[a] ?? [])
    if (kws.length > 0) {
      AND.push({ OR: keywordOr(kws, ['location', 'title', 'description']) })
    }
  }

  // ── Experience level ────────────────────────────────────────────────────────
  if (experience && EXPERIENCE_KEYWORDS[experience]) {
    AND.push({ OR: keywordOr(EXPERIENCE_KEYWORDS[experience], ['title', 'description']) })
  }

  // ── Education ───────────────────────────────────────────────────────────────
  if (education && EDUCATION_KEYWORDS[education]) {
    AND.push({ OR: keywordOr(EDUCATION_KEYWORDS[education], ['description', 'title']) })
  }

  // ── Company size ────────────────────────────────────────────────────────────
  if (companySizes.length > 0) {
    const kws = companySizes.flatMap((s) => COMPANY_SIZE_KEYWORDS[s] ?? [])
    if (kws.length > 0) {
      AND.push({ OR: kws.map((kw) => ({ description: { contains: kw, mode: 'insensitive' as const } })) })
    }
  }

  // ── Benefits (each benefit is an independent AND constraint) ────────────────
  for (const b of benefits) {
    const kws = BENEFIT_KEYWORDS[b] ?? []
    if (kws.length > 0) {
      AND.push({ OR: kws.map((kw) => ({ description: { contains: kw, mode: 'insensitive' as const } })) })
    }
  }

  // ── Easy Apply ──────────────────────────────────────────────────────────────
  if (easyApply) {
    AND.push({ applyUrl: { not: '' } })
  }

  // ── Visa sponsorship ────────────────────────────────────────────────────────
  if (visaSponsorship) {
    AND.push({
      OR: [
        { description: { contains: 'visa sponsorship',   mode: 'insensitive' } },
        { description: { contains: 'will sponsor',       mode: 'insensitive' } },
        { description: { contains: 'h1b',                mode: 'insensitive' } },
        { description: { contains: 'h-1b',               mode: 'insensitive' } },
        { description: { contains: 'work authorization', mode: 'insensitive' } },
      ],
    })
  }

  // ── Base guards (active, not expired, known source) ─────────────────────────
  return {
    active:    true,
    expiresAt: { gt: new Date() },
    source:    { in: [...ACTIVE_SOURCES] },
    ...(AND.length > 0 && { AND }),
  }
}

// ── Query-param helpers (for use in route handlers) ───────────────────────────

export function splitParam(v: string | null): string[] {
  return v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []
}

export function splitPhrasesParam(v: string | null): string[] {
  return v ? v.split('|').map((s) => s.trim()).filter(Boolean) : []
}

export function parseJobWhereParams(searchParams: URLSearchParams): JobWhereParams {
  return {
    what:           searchParams.get('what')?.trim() || '',
    whatPhrases:    splitPhrasesParam(searchParams.get('what_phrases')),
    excludePhrases: splitPhrasesParam(searchParams.get('exclude_phrases')),
    descriptionContainsAny: splitPhrasesParam(searchParams.get('description_contains_any')),
    isFifo:         searchParams.get('is_fifo') === 'true', 
    where:          searchParams.get('where')?.trim() || '',
    salaryMin:      searchParams.get('salary_min')     ? parseInt(searchParams.get('salary_min')!)    : undefined,
    postedWithin:   searchParams.get('posted_within')  ? parseInt(searchParams.get('posted_within')!) : undefined,
    jobTypes:       splitParam(searchParams.get('job_type')),
    arrangements:   splitParam(searchParams.get('arrangement')),
    experience:     searchParams.get('experience')  || '',
    education:      searchParams.get('education')   || '',
    companySizes:   splitParam(searchParams.get('company_size')),
    benefits:       splitParam(searchParams.get('benefits')),
    easyApply:      searchParams.get('easy_apply')        === 'true',
    visaSponsorship:searchParams.get('visa_sponsorship')  === 'true',
  }
}