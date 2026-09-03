// lib/job-where.ts
// Shared Prisma WHERE clause builder — used by /api/jobs-all and /api/jobs-count

import { Prisma } from '@prisma/client'
import { STATES } from './usStates'
import {
  ENTRY_LEVEL_DESCRIPTION_EXCLUDES,
  ENTRY_LEVEL_INCLUDE_KEYWORDS,
  ENTRY_LEVEL_TITLE_EXCLUDES,
} from './entry-level-filter'

// ── Constants ─────────────────────────────────────────────────────────────────

export const ACTIVE_SOURCES = ['lever', 'adzuna', 'pinpoint', 'workable', 'employer', 'greenhouse', 'asby', 'workday', 'rippling', 'successfactors'] as const

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
  'Contract':   ['contract position', 'contract role', 'contract employment', 'contract-to-hire', 'independent contractor', '1099'],
  'Apprenticeship': ['apprentice', 'apprenticeship'],
  'Internship': ['intern', 'internship'],
  'Temporary':  ['temporary position', 'temporary role', 'seasonal', 'fixed-term', 'fixed term'],
  'Freelance':  ['freelance'],
  'Per diem':   ['per diem'],
}

const JOB_TYPE_STRUCTURED_VALUES: Record<string, string[]> = {
  'Full-time': ['full-time', 'full time', 'permanent'],
  'Part-time': ['part-time', 'part time'],
  'Contract': ['contract'],
  'Apprenticeship': ['apprentice', 'apprenticeship'],
  'Temporary': ['temporary', 'seasonal', 'fixed-term'],
}

const EXPERIENCE_KEYWORDS: Record<string, string[]> = {
  apprentice: ['apprentice', 'apprenticeship', 'trainee'],
  internship: ['intern', 'internship'],
  entry:      [...ENTRY_LEVEL_INCLUDE_KEYWORDS],
  experienced: ['experienced installer', 'experienced technician', '2+ years', '3+ years', 'journeyman'],
  lead:       ['lead installer', 'lead technician', 'crew lead', 'crew foreman', 'foreman'],
  superintendent: ['superintendent'],
  mid:        ['mid level', 'mid-level', '2-4 year', '3-5 year', '2+ year', '3+ year'],
  senior:     ['senior', 'sr.', 'lead', '5+ year', '5-8 year', '7+ year'],
  manager:    ['project manager', 'construction manager', 'program manager'],
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
  'Field / On-site': ['field-based', 'field based', 'on-site', 'onsite', 'on site', 'jobsite', 'job site', 'solar farm', 'rooftop'],
  'Office / Remote': ['remote', 'work from home', 'wfh', 'hybrid', 'office-based', 'office based', 'in-office', 'in office'],
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
  'Per diem / travel pay':  ['per diem', 'travel pay', 'travel allowance', 'travel reimbursement'],
  'Tool allowance':         ['tool allowance', 'tool reimbursement', 'tools provided', 'company-provided tools'],
  'Company vehicle':        ['company vehicle', 'company truck', 'take-home vehicle', 'vehicle allowance'],
  'Certification reimbursement': ['certification reimbursement', 'certification assistance', 'paid certification', 'training reimbursement'],
  'Overtime / prevailing wage': ['overtime pay', 'paid overtime', 'prevailing wage', 'davis-bacon'],
}

const CERTIFICATION_KEYWORDS: Record<string, string[]> = {
  osha10: ['OSHA 10', 'OSHA-10', 'OSHA 10-hour'],
  osha30: ['OSHA 30', 'OSHA-30', 'OSHA 30-hour'],
  nabcep_associate: ['NABCEP PV Associate', 'NABCEP Associate'],
  nabcep_installer: ['NABCEP PV Installation Professional', 'NABCEP PVIP', 'NABCEP certified'],
  journeyman: ['journeyman electrician', 'journeyman license', 'journeyman electrical license'],
}

const TITLE_ONLY_EXPERIENCE_LEVELS = new Set([
  'lead', 'superintendent', 'manager', 'executive',
])

const COMPANY_SIZE_KEYWORDS: Record<string, string[]> = {
  'Startup (1–50)':     ['startup', 'start-up', 'early stage', 'seed stage', 'series a'],
  'Small (51–200)':     ['small company', 'growing team', 'small team', 'boutique'],
  'Mid-size (201–1k)':  ['mid-size', 'midsize', 'medium company'],
  'Large (1k–5k)':      ['large company', 'established company', 'well-established'],
  'Enterprise (5k+)':   ['fortune 500', 'fortune500', 'enterprise', 'multinational', 'global company'],
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface JobWhereParams {
  sort?: 'newest'
  what?: string
  whatPhrases?: string[]
  excludePhrases?: string[]
  descriptionContainsAny?: string[]
   requiredDomainTerms?: string[]
   titleContainsAny?: string[]  
  isFifo?: boolean
  entryLevel?: boolean
  where?: string
  salaryMin?: number
  postedWithin?: number
  jobTypes?: string[]
  arrangements?: string[]
  experience?: string
  certification?: string
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
     requiredDomainTerms = [], 
      titleContainsAny = [], 
    isFifo        = false,
    entryLevel    = false, 
    where         = '',
    salaryMin,
    postedWithin,
    jobTypes      = [],
    arrangements  = [],
    experience    = '',
    certification = '',
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
    AND.push({ OR: keywordOr([kw], ['title']) })  // un AND.push par mot
  }
}
// Require an explicit entry-level signal in the job title or description.
// This keeps broad installer postings out of the no-experience landing page.
const ENTRY_LEVEL_TITLE_KEYWORDS = [
  'entry level', 'entry-level', 'junior', 'jr.', 'jr ', 'trainee',
  'apprentice', 'helper',
]

const ENTRY_LEVEL_DESCRIPTION_KEYWORDS = [
  'no experience required', 'no experience necessary', 'no prior experience',
  'no solar experience required', 'entry level', 'entry-level', 'will train',
  'we will train', 'training provided', 'on-the-job training',
  'on the job training',
]

const ENTRY_LEVEL_EXCLUDE_KEYWORDS = [
  'senior', 'sr.', 'sr ', 'lead', 'principal', 'foreman', 'supervisor',
  'manager', 'director', 'journeyman', 'master electrician',
  'all experience levels',
]

// A no-experience page must not rely on a broad role name such as "laborer":
// plenty of those postings still demand previous solar or construction work.
// These phrases are applied to both title and description as hard exclusions.
const ENTRY_LEVEL_REQUIRED_EXPERIENCE_PHRASES = [
  'must have experience', 'must have prior experience', 'must have solar experience',
  'solar experience required', 'solar experience is required', 'previous solar experience',
  'prior solar experience', 'solar installation experience',
  'prior experience required', 'prior installation experience required',
  'years of experience required', 'years experience required',
]

if (titleContainsAny.length > 0) {
  AND.push({ OR: keywordOr(titleContainsAny, ['title']) })
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

  // buildJobWhere — juste après le bloc descriptionContainsAny existant
if (requiredDomainTerms.length > 0) {
  AND.push({
    OR: requiredDomainTerms.map((phrase) => ({
      description: { contains: phrase, mode: 'insensitive' as const },
    })),
  })
}

   // ── Fifo tag précalculé à l'ingestion ────────────────────────────────────────
  if (isFifo) {
    AND.push({ isFifo: true })
  }

  // ── Entry level (fallback texte tant que experienceLevel n'est pas fiable) ──
  if (entryLevel) {
    AND.push({
      OR: [
        ...keywordOr(ENTRY_LEVEL_TITLE_KEYWORDS, ['title']),
        ...keywordOr(ENTRY_LEVEL_DESCRIPTION_KEYWORDS, ['description']),
      ],
    })
    // These rank words are reliable in a title, but too broad in a description
    // (an apprentice can legitimately report to a "lead installer").
    AND.push({ NOT: { OR: keywordOr(ENTRY_LEVEL_EXCLUDE_KEYWORDS, ['title']) } })
    AND.push({ NOT: { OR: keywordOr(ENTRY_LEVEL_REQUIRED_EXPERIENCE_PHRASES, ['title', 'description']) } })
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
    const structuredValues = jobTypes.flatMap((t) => JOB_TYPE_STRUCTURED_VALUES[t] ?? [])
    if (kws.length > 0 || structuredValues.length > 0) {
      AND.push({
        OR: [
          ...keywordOr(kws, ['title', 'description']),
          ...structuredValues.flatMap((value) => [
            { contractType: { contains: value, mode: 'insensitive' as const } },
            { contractTime: { contains: value, mode: 'insensitive' as const } },
          ]),
        ],
      })
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
    if (experience === 'entry') {
      AND.push({ OR: keywordOr([...ENTRY_LEVEL_INCLUDE_KEYWORDS], ['title', 'description']) })
      AND.push({ NOT: { OR: keywordOr([...ENTRY_LEVEL_TITLE_EXCLUDES], ['title']) } })
      AND.push({ NOT: { OR: keywordOr([...ENTRY_LEVEL_DESCRIPTION_EXCLUDES], ['description']) } })
    } else {
      const fields: Array<'title' | 'description'> = TITLE_ONLY_EXPERIENCE_LEVELS.has(experience)
        ? ['title']
        : ['title', 'description']
      AND.push({ OR: keywordOr(EXPERIENCE_KEYWORDS[experience], fields) })
    }
  }

  // Solar credentials are frequently present only in the job description.
  if (certification && CERTIFICATION_KEYWORDS[certification]) {
    AND.push({ OR: keywordOr(CERTIFICATION_KEYWORDS[certification], ['title', 'description']) })
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
    sort:           searchParams.get('sort') === 'newest' ? 'newest' : undefined,
    what:           searchParams.get('what')?.trim() || '',
    whatPhrases:    splitPhrasesParam(searchParams.get('what_phrases')),
    excludePhrases: splitPhrasesParam(searchParams.get('exclude_phrases')),
    descriptionContainsAny: splitPhrasesParam(searchParams.get('description_contains_any')),
    titleContainsAny:       splitPhrasesParam(searchParams.get('title_contains_any')),
    requiredDomainTerms:    splitPhrasesParam(searchParams.get('required_domain_terms')),  
    isFifo:         searchParams.get('is_fifo') === 'true', 
    entryLevel:     searchParams.get('entry_level') === 'true',
    where:          searchParams.get('where')?.trim() || '',
    salaryMin:      searchParams.get('salary_min')     ? parseInt(searchParams.get('salary_min')!)    : undefined,
    postedWithin:   searchParams.get('posted_within')  ? parseInt(searchParams.get('posted_within')!) : undefined,
    jobTypes:       splitParam(searchParams.get('job_type')),
    arrangements:   splitParam(searchParams.get('arrangement')),
    experience:     searchParams.get('experience')  || '',
    certification:  searchParams.get('certification') || '',
    education:      searchParams.get('education')   || '',
    companySizes:   splitParam(searchParams.get('company_size')),
    benefits:       splitParam(searchParams.get('benefits')),
    easyApply:      searchParams.get('easy_apply')        === 'true',
    visaSponsorship:searchParams.get('visa_sponsorship')  === 'true',
  }
}
