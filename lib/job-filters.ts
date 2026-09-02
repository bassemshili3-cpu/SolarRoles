// lib/job-filters.ts

import { ENTRY_LEVEL_INCLUDE_KEYWORDS, matchesEntryLevelJob } from './entry-level-filter'

export const JOB_TYPE_KEYWORDS: Record<string, string[]> = {
  'Full-time':  ['full-time', 'full time'],
  'Part-time':  ['part-time', 'part time'],
  'Contract':   ['contract position', 'contract role', 'contract employment', 'contract-to-hire', 'independent contractor', '1099'],
  'Apprenticeship': ['apprentice', 'apprenticeship'],
  'Internship': ['intern', 'internship'],
  'Temporary':  ['temporary position', 'temporary role', 'seasonal', 'fixed-term', 'fixed term'],
  'Freelance':  ['freelance'],
  'Per diem':   ['per diem'],
}

export const EXPERIENCE_KEYWORDS: Record<string, string[]> = {
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

export const EDUCATION_KEYWORDS: Record<string, string[]> = {
  high_school: ['high school diploma', 'ged', 'high school'],
  associate:   ["associate's degree", "associate degree", 'a.a.', 'a.s.'],
  bachelor:    ["bachelor's degree", "bachelor degree", 'b.s.', 'b.a.', 'undergraduate degree'],
  master:      ["master's degree", "master degree", 'm.s.', 'm.b.a.', 'mba', 'postgraduate'],
  phd:         ['phd', 'doctorate', 'ph.d.', 'doctoral degree'],
}

export const ARRANGEMENT_KEYWORDS: Record<string, string[]> = {
  'Field / On-site': ['field-based', 'field based', 'on-site', 'onsite', 'on site', 'jobsite', 'job site', 'solar farm', 'rooftop'],
  'Office / Remote': ['remote', 'work from home', 'wfh', 'hybrid', 'office-based', 'office based', 'in-office', 'in office'],
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
  'Per diem / travel pay': ['per diem', 'travel pay', 'travel allowance', 'travel reimbursement'],
  'Tool allowance':        ['tool allowance', 'tool reimbursement', 'tools provided', 'company-provided tools'],
  'Company vehicle':       ['company vehicle', 'company truck', 'take-home vehicle', 'vehicle allowance'],
  'Certification reimbursement': ['certification reimbursement', 'certification assistance', 'paid certification', 'training reimbursement'],
  'Overtime / prevailing wage': ['overtime pay', 'paid overtime', 'prevailing wage', 'davis-bacon'],
}

export const CERTIFICATION_KEYWORDS: Record<string, string[]> = {
  osha10: ['OSHA 10', 'OSHA-10', 'OSHA 10-hour'],
  osha30: ['OSHA 30', 'OSHA-30', 'OSHA 30-hour'],
  nabcep_associate: ['NABCEP PV Associate', 'NABCEP Associate'],
  nabcep_installer: ['NABCEP PV Installation Professional', 'NABCEP PVIP', 'NABCEP certified'],
  journeyman: ['journeyman electrician', 'journeyman license', 'journeyman electrical license'],
}

const TITLE_ONLY_EXPERIENCE_LEVELS = new Set([
  'lead', 'superintendent', 'manager', 'executive',
])

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
  certification?: string
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
    f.certification ||
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
    const matches = f.experience === 'entry'
      ? matchesEntryLevelJob(job.title, job.description)
      : TITLE_ONLY_EXPERIENCE_LEVELS.has(f.experience)
        ? EXPERIENCE_KEYWORDS[f.experience].some((keyword) =>
            job.title.toLowerCase().includes(keyword.toLowerCase()),
          )
        : textMatches(job, EXPERIENCE_KEYWORDS[f.experience])
    if (!matches) return false
  }

  if (f.certification && CERTIFICATION_KEYWORDS[f.certification]) {
    if (!textMatches(job, CERTIFICATION_KEYWORDS[f.certification])) return false
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
