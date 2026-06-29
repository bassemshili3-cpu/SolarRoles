// lib/job-filters.ts

export const JOB_TYPE_KEYWORDS: Record<string, string[]> = {
  'Full-time':  ['full-time', 'full time'],
  'Part-time':  ['part-time', 'part time'],
  'Contract':   ['contract', 'contractor'],
  'Internship': ['intern', 'internship'],
  'Temporary':  ['temporary', 'temp'],
  'Freelance':  ['freelance'],
  'Per diem':   ['per diem'],
}

export const EXPERIENCE_KEYWORDS: Record<string, string[]> = {
  internship: ['intern', 'internship'],
  entry:      ['entry level', 'entry-level', 'junior', 'associate', 'new grad', '0-1 year', '0-2 year', 'no experience'],
  mid:        ['mid level', 'mid-level', '2-4 year', '3-5 year', '2+ year', '3+ year'],
  senior:     ['senior', 'sr.', 'lead', '5+ year', '5-8 year', '7+ year'],
  manager:    ['manager', 'management', 'team lead', 'supervisor', 'head of'],
  director:   ['director', 'vp of', 'vice president'],
  executive:  ['chief', 'cto', 'cfo', 'coo', 'ceo', 'executive', 'president', 'c-suite'],
}

export const EDUCATION_KEYWORDS: Record<string, string[]> = {
  high_school: ['high school diploma', 'ged', 'high school'],
  associate:   ["associate's degree", "associate degree", 'a.a.', 'a.s.'],
  bachelor:    ["bachelor's degree", "bachelor degree", 'b.s.', 'b.a.', 'undergraduate degree'],
  master:      ["master's degree", "master degree", 'm.s.', 'm.b.a.', 'mba', 'postgraduate'],
  phd:         ['phd', 'doctorate', 'ph.d.', 'doctoral degree'],
}

export const ARRANGEMENT_KEYWORDS: Record<string, string[]> = {
  Remote:    ['remote', 'work from home', 'wfh', 'telecommute', 'distributed'],
  Hybrid:    ['hybrid', 'flexible work', 'partial remote'],
  'On-site': ['on-site', 'onsite', 'in-office', 'in office', 'on site'],
}

export const BENEFIT_KEYWORDS: Record<string, string[]> = {
  'Health insurance':      ['health insurance', 'medical insurance', 'medical benefits', 'healthcare'],
  'Dental & Vision':       ['dental', 'vision insurance', 'dental and vision'],
  '401(k) match':          ['401k', '401(k)', 'retirement match', 'employer match'],
  'Paid time off':         ['paid time off', 'pto', 'vacation days', 'paid vacation'],
  'Stock options / RSU':   ['stock options', 'equity', 'rsu', 'restricted stock', 'esop'],
  'Remote stipend':        ['remote stipend', 'home office stipend', 'equipment stipend', 'internet stipend'],
  'Tuition reimbursement': ['tuition reimbursement', 'education assistance', 'tuition assistance'],
  'Parental leave':        ['parental leave', 'maternity leave', 'paternity leave', 'family leave'],
  'Wellness perks':        ['gym membership', 'wellness', 'mental health', 'employee assistance'],
}

export const COMPANY_SIZE_KEYWORDS: Record<string, string[]> = {
  'Startup (1–50)':    ['startup', 'start-up', 'early stage', 'seed stage', 'series a'],
  'Small (51–200)':    ['small company', 'growing team', 'small team', 'boutique'],
  'Mid-size (201–1k)': ['mid-size', 'midsize', 'medium company'],
  'Large (1k–5k)':     ['large company', 'established company', 'well-established'],
  'Enterprise (5k+)':  ['fortune 500', 'fortune500', 'enterprise', 'multinational', 'global company'],
}

export interface JobFilterParams {
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

export interface FilterableJob {
  title: string
  company: string
  location: string
  description: string
  applyUrl: string
  postedAt: Date | null
}

export function hasAdvancedFilters(f: JobFilterParams): boolean {
  return Boolean(
    f.postedWithin ||
    f.jobTypes?.length ||
    f.arrangements?.length ||
    f.experience ||
    f.education ||
    f.companySizes?.length ||
    f.benefits?.length ||
    f.easyApply ||
    f.visaSponsorship
  )
}

function textMatches(job: FilterableJob, keywords: string[]): boolean {
  const haystack = `${job.title} ${job.description} ${job.location}`.toLowerCase()
  return keywords.some(kw => haystack.includes(kw.toLowerCase()))
}

export function matchesFilters(job: FilterableJob, f: JobFilterParams): boolean {
  if (f.postedWithin) {
    if (!job.postedAt) return false
    const cutoff = new Date(Date.now() - f.postedWithin * 86_400_000)
    if (job.postedAt < cutoff) return false
  }

  if (f.jobTypes?.length) {
    const kws = f.jobTypes.flatMap(t => JOB_TYPE_KEYWORDS[t] || [])
    if (kws.length && !textMatches(job, kws)) return false
  }

  if (f.arrangements?.length) {
    const kws = f.arrangements.flatMap(a => ARRANGEMENT_KEYWORDS[a] || [])
    if (kws.length && !textMatches(job, kws)) return false
  }

  if (f.experience && EXPERIENCE_KEYWORDS[f.experience]) {
    if (!textMatches(job, EXPERIENCE_KEYWORDS[f.experience])) return false
  }

  if (f.education && EDUCATION_KEYWORDS[f.education]) {
    if (!textMatches(job, EDUCATION_KEYWORDS[f.education])) return false
  }

  if (f.companySizes?.length) {
    const kws = f.companySizes.flatMap(s => COMPANY_SIZE_KEYWORDS[s] || [])
    if (kws.length && !textMatches(job, kws)) return false
  }

  // Chaque benefit sélectionné doit matcher (logique ET, comme dans merged-search.ts)
  if (f.benefits?.length) {
    for (const b of f.benefits) {
      const kws = BENEFIT_KEYWORDS[b] || []
      if (kws.length && !textMatches(job, kws)) return false
    }
  }

  if (f.easyApply && !job.applyUrl) return false

  if (f.visaSponsorship) {
    const kws = ['visa sponsorship', 'will sponsor', 'h1b', 'h-1b', 'work authorization']
    if (!textMatches(job, kws)) return false
  }

  return true
}