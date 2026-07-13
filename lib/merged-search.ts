// lib/merged-search.ts
import { prisma } from '@/lib/prisma'





const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']

// ==================== KEYWORDS ====================
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

// ── Helper ────────────────────────────────────────────────────────────────────

function resolveString(v: string | string[] | undefined, fallback = ''): string {
  if (!v) return fallback
  return Array.isArray(v) ? (v[0] ?? fallback) : v
}

// ==================== getMergedJobCount ====================

export async function getMergedJobCount(params: {
  what?:          string | string[]
  where?:         string | string[]
  salary_min?:    number | string
  postedWithin?:  number
  jobTypes?:      string[]
  arrangements?:  string[]
  experience?:    string
  education?:     string
  companySizes?:  string[]
  benefits?:      string[]
  easyApply?:     boolean
  visaSponsorship?: boolean
}) {
  const what       = resolveString(params.what)
  const where      = resolveString(params.where)
  const salary_min = params.salary_min !== undefined ? Number(params.salary_min) : undefined

  const {
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

  try {
    const AND: any[] = []

    

    // Where
    if (where) {
      AND.push({
        OR: [
          { location:      { contains: where, mode: 'insensitive' } },
          { addressRegion: { contains: where, mode: 'insensitive' } },
        ],
      })
    }

    // Salary
    if (salary_min) {
      AND.push({ salaryMin: { gte: salary_min } })
    }

    // Posted within
    if (postedWithin) {
      AND.push({ postedAt: { gte: new Date(Date.now() - postedWithin * 86_400_000) } })
    }

    // Job Types
    if (jobTypes.length > 0) {
      const typeConds = jobTypes.flatMap(t => {
        const kws = JOB_TYPE_KEYWORDS[t] || []
        return kws.flatMap(kw => [
          { title:       { contains: kw, mode: 'insensitive' } },
          { description: { contains: kw, mode: 'insensitive' } },
        ])
      })
      if (typeConds.length > 0) AND.push({ OR: typeConds })
    }

    // Arrangements
    if (arrangements.length > 0) {
      const arrKws = arrangements.flatMap(a => ARRANGEMENT_KEYWORDS[a] || [])
      if (arrKws.length > 0) {
        AND.push({
          OR: arrKws.flatMap(kw => [
            { location:    { contains: kw, mode: 'insensitive' } },
            { title:       { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } },
          ]),
        })
      }
    }

    // Experience
    if (experience && EXPERIENCE_KEYWORDS[experience]) {
      const kws = EXPERIENCE_KEYWORDS[experience]
      AND.push({ OR: kws.flatMap(kw => [
        { title:       { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } },
      ])})
    }

    // Education
    if (education && EDUCATION_KEYWORDS[education]) {
      const kws = EDUCATION_KEYWORDS[education]
      AND.push({ OR: kws.flatMap(kw => [
        { title:       { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } },
      ])})
    }

    // Company size
    if (companySizes.length > 0) {
      const kws = companySizes.flatMap(s => COMPANY_SIZE_KEYWORDS[s] || [])
      if (kws.length > 0) {
        AND.push({ OR: kws.map(kw => ({ description: { contains: kw, mode: 'insensitive' } })) })
      }
    }

    // Benefits
    if (benefits.length > 0) {
      benefits.forEach(b => {
        const kws = BENEFIT_KEYWORDS[b] || []
        if (kws.length > 0) {
          AND.push({ OR: kws.map(kw => ({ description: { contains: kw, mode: 'insensitive' } })) })
        }
      })
    }

    // Easy apply
    if (easyApply) AND.push({ applyUrl: { not: '' } })

    // Visa sponsorship
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

    const whereClause: any = {
      active:    true,
      expiresAt: { gt: new Date() },
      source:    { in: ACTIVE_SOURCES },
      ...(AND.length > 0 && { AND }),
    }

    const count = await prisma.job.count({ where: whereClause })
    return { count }
  } catch (err: any) {
    console.error('Prisma count error:', err.message)
    return { count: 0 }
  }
}

// ==================== searchMergedJobs ====================

export async function searchMergedJobs(params: {
  what?:            string | string[]
  whatPhrases?:     string[]
  excludePhrases?:  string[]  // NEW: si une de ces phrases apparaît, l'offre est écartée
                               // même si elle matche whatPhrases. Utile pour désambiguïser
                               // un acronyme comme "FIFO" (rotation FIFO vs méthode d'inventaire).
  where?:           string | string[]
  salary_min?:      number | string
  results_per_page?: number
  page?:            number
}) {
  const what       = resolveString(params.what)
  const where      = resolveString(params.where)
  const salary_min = params.salary_min !== undefined ? Number(params.salary_min) : undefined
  const results_per_page = params.results_per_page ?? 30
  const page             = params.page ?? 1

  try {
    const AND: any[] = []

    if (params.whatPhrases && params.whatPhrases.length > 0) {
    AND.push({
      OR: params.whatPhrases.flatMap((phrase) => [
        { title:       { contains: phrase, mode: 'insensitive' } },
        { company:     { contains: phrase, mode: 'insensitive' } },
        { description: { contains: phrase, mode: 'insensitive' } },
      ]),
    })
  } else if (what) {
      for (const kw of what.split(/\s+/).filter(Boolean)) {
        AND.push({
          OR: [
            { title:       { contains: kw, mode: 'insensitive' } },
            { company:     { contains: kw, mode: 'insensitive' } },
            { description: { contains: kw, mode: 'insensitive' } },
          ],
        })
      }
    }

      // NEW: exclusion — une offre est écartée si title OU description contient une des phrases d'exclusion
  if (params.excludePhrases && params.excludePhrases.length > 0) {
    params.excludePhrases.forEach((phrase) => {
      AND.push({
        NOT: {
          OR: [
            { title:       { contains: phrase, mode: 'insensitive' } },
            { description: { contains: phrase, mode: 'insensitive' } },
          ],
        },
      })
    })
  }


    if (where) {
      AND.push({
        OR: [
          { location:      { contains: where, mode: 'insensitive' } },
          { addressRegion: { contains: where, mode: 'insensitive' } },
        ],
      })
    }

    if (salary_min) {
      AND.push({ salaryMin: { gte: salary_min } })
    }

    const whereClause = {
      active:    true,
      expiresAt: { gt: new Date() },
      source:    { in: ACTIVE_SOURCES },
      ...(AND.length > 0 && { AND }),
    }

    const [dbJobs, count] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        orderBy: [
          { sourcePriority: 'asc' },
          { fetchedAt: 'desc' },
        ],
        skip: (page - 1) * results_per_page,
        take: results_per_page,
      }),
      prisma.job.count({ where: whereClause }),
    ])

    const results = dbJobs.map((job) => ({
      id:            job.id,
      title:         job.title,
      company:       job.company,
      location:      job.location,
      addressRegion: job.addressRegion,
      description:   job.description,
      url:           job.url,
      applyUrl:      job.applyUrl,
      apply_url:     job.applyUrl,
      salary:        job.salary,
      salaryMin:     job.salaryMin,
      salaryMax:     job.salaryMax,
      salary_min:    job.salaryMin,
      salary_max:    job.salaryMax,
      contractType:  job.contractType,
      contractTime:  job.contractTime,
      source:        job.source,
      postedAt:      job.postedAt?.toISOString() || null,
      created:       job.postedAt?.toISOString() || null,
    }))

    return { results, count }
  } catch (err: any) {
    console.error('searchMergedJobs error:', err.message)
    return { results: [], count: 0 }
  }
}