// app/api/jobs-all/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']

// Maps UI job-type labels → contractType / contractTime values stored by APIs
const JOB_TYPE_MAP: Record<string, { contractType?: string; contractTime?: string }> = {
  'Full-time':  { contractTime: 'permanent' },
  'Part-time':  { contractTime: 'part_time' },
  'Contract':   { contractType: 'contract' },
  'Internship': { contractType: 'internship' },
  'Temporary':  { contractTime: 'temporary' },
  'Freelance':  { contractType: 'freelance' },
  'Per diem':   { contractType: 'per_diem' },
}

// Keywords injected into description/title search for each filter
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

function splitParam(v: string | null): string[] {
  return v ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : []
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const what         = searchParams.get('what') || ''
  const where        = searchParams.get('where') || ''
  const page         = parseInt(searchParams.get('page') || '1')
  const resultsPerPage = parseInt(searchParams.get('results_per_page') || '30')
  const salaryMin    = searchParams.get('salary_min') ? parseInt(searchParams.get('salary_min')!) : undefined
  const postedWithin = searchParams.get('posted_within') ? parseInt(searchParams.get('posted_within')!) : undefined
  const jobTypes     = splitParam(searchParams.get('job_type'))
  const arrangements = splitParam(searchParams.get('arrangement'))
  const experience   = searchParams.get('experience') || ''
  const education    = searchParams.get('education') || ''
  const companySizes = splitParam(searchParams.get('company_size'))
  const benefits     = splitParam(searchParams.get('benefits'))
  const easyApply    = searchParams.get('easy_apply') === 'true'
  const visaSponsorship = searchParams.get('visa_sponsorship') === 'true'

  try {
    const AND: any[] = []

    // ── Keyword search ────────────────────────────────────────────────────────
    if (what) {
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

    // ── Location ──────────────────────────────────────────────────────────────
    if (where) {
      AND.push({
        OR: [
          { location:      { contains: where, mode: 'insensitive' } },
          { addressRegion: { contains: where, mode: 'insensitive' } },
        ],
      })
    }

    // ── Salary ────────────────────────────────────────────────────────────────
    if (salaryMin) AND.push({ salaryMin: { gte: salaryMin } })

    // ── Date posted ───────────────────────────────────────────────────────────
    if (postedWithin) {
      AND.push({ postedAt: { gte: new Date(Date.now() - postedWithin * 86_400_000) } })
    }

    // ── Job type (contractType / contractTime) ────────────────────────────────
    if (jobTypes.length > 0) {
      const typeConds = jobTypes.flatMap((t: string) => {
        const m = JOB_TYPE_MAP[t]
        if (!m) return []
        const conds: any[] = []
        if (m.contractType) conds.push({ contractType: { contains: m.contractType, mode: 'insensitive' } })
        if (m.contractTime) conds.push({ contractTime: { contains: m.contractTime, mode: 'insensitive' } })
        return conds
      })
      if (typeConds.length > 0) AND.push({ OR: typeConds })
    }

    // ── Work arrangement (text search) ────────────────────────────────────────
    if (arrangements.length > 0) {
      const arrKws = arrangements.flatMap((a: string) => ARRANGEMENT_KEYWORDS[a] || [])
      AND.push({
        OR: arrKws.flatMap((kw: string) => [
          { location:    { contains: kw, mode: 'insensitive' } },
          { title:       { contains: kw, mode: 'insensitive' } },
          { description: { contains: kw, mode: 'insensitive' } },
        ]),
      })
    }

    // ── Experience level (text search) ────────────────────────────────────────
    if (experience && EXPERIENCE_KEYWORDS[experience]) {
      const kws = EXPERIENCE_KEYWORDS[experience]
      AND.push({
        OR: kws.flatMap(kw => [
          { title:       { contains: kw, mode: 'insensitive' } },
          { description: { contains: kw, mode: 'insensitive' } },
        ]),
      })
    }

    // ── Education (text search) ───────────────────────────────────────────────
    if (education && EDUCATION_KEYWORDS[education]) {
      const kws = EDUCATION_KEYWORDS[education]
      AND.push({
        OR: kws.flatMap(kw => [
          { description: { contains: kw, mode: 'insensitive' } },
          { title:       { contains: kw, mode: 'insensitive' } },
        ]),
      })
    }

    // ── Company size (text search) ────────────────────────────────────────────
    if (companySizes.length > 0) {
      const kws = companySizes.flatMap((s: string) => COMPANY_SIZE_KEYWORDS[s] || [])
      AND.push({ OR: kws.map((kw: string) => ({ description: { contains: kw, mode: 'insensitive' } })) })
    }

    // ── Benefits (text search) ────────────────────────────────────────────────
    if (benefits.length > 0) {
      for (const b of benefits) {
        const kws = BENEFIT_KEYWORDS[b] || []
        if (kws.length > 0) {
          AND.push({ OR: kws.map(kw => ({ description: { contains: kw, mode: 'insensitive' } })) })
        }
      }
    }

    // ── Easy Apply ────────────────────────────────────────────────────────────
    if (easyApply) AND.push({ applyUrl: { not: '' } })

    // ── Visa sponsorship (text search) ────────────────────────────────────────
    if (visaSponsorship) {
      AND.push({
        OR: [
          { description: { contains: 'visa sponsorship', mode: 'insensitive' } },
          { description: { contains: 'will sponsor',     mode: 'insensitive' } },
          { description: { contains: 'h1b',              mode: 'insensitive' } },
          { description: { contains: 'h-1b',             mode: 'insensitive' } },
          { description: { contains: 'work authorization', mode: 'insensitive' } },
        ],
      })
    }

    const whereClause: any = {
      active: true,
      expiresAt: { gt: new Date() },
      source: { in: ACTIVE_SOURCES },
      ...(AND.length > 0 && { AND }),
    }

    const [dbJobs, count] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        orderBy: { fetchedAt: 'desc' },
        skip: (page - 1) * resultsPerPage,
        take: resultsPerPage,
      }),
      prisma.job.count({ where: whereClause }),
    ])

    const results = dbJobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      addressRegion: job.addressRegion,
      description: job.description,
      url: job.url,
      applyUrl: job.applyUrl,
      apply_url: job.applyUrl,
      salary: job.salary,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      contractType: job.contractType,
      contractTime: job.contractTime,
      source: job.source,
      postedAt: job.postedAt?.toISOString() || null,
      created: job.postedAt?.toISOString() || null,
    }))

    return NextResponse.json({ results, count })
  } catch (error: any) {
    console.error('Jobs-all API error:', error.message)
    return NextResponse.json({ results: [], count: 0 }, { status: 500 })
  }
}