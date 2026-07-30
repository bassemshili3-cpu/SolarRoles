// app/jobs/[id]/[slug]/page.tsx
import ApplyToggle from '../apply-toggle'

import { AdUnit } from '@/components/AdUnit'

import { buildBreadcrumbSegments, buildBreadcrumbSchema } from '@/lib/buildBreadcrumbSchema'

import { getSimilarJobs } from '@/lib/similarJobs'

import { getEmployerProfile } from '@/lib/employerProfile'

import { matchRoleCategory, getRoleKeywords, KNOWN_SALARY_REPORT_SLUGS } from '@/lib/roleCategories'

import { getRoleDemandByState } from '@/lib/roleDemandByState'

import RoleDemandMap from '@/components/RoleDemandMap'

import { resolveStateName, stateToSlug } from '@/lib/usStates'

import { getRoleLocationStats } from '@/lib/roleLocationStats'

import { Metadata } from 'next'

import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'

import { MapPin, Clock, DollarSign, ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'

import Link from 'next/link'

import PaycheckCalculatorCard from '@/components/PaycheckCalculatorCard'

import { formatJobDescription, sanitizeStructuredHtml } from '@/lib/formatJobDescription'

import { buildSchemaDescription } from '@/lib/buildSchemaDescription'

import ShareBar from '@/components/ShareBar'

import CompanyLogo from '@/components/CompanyLogo'

import { formatDistanceToNow } from 'date-fns'

import { compareSalaryToMarket } from '@/lib/salaryComparison'

import { getJobDetail, getJobDetailWithSalary, type JobDetail } from '@/lib/jobDetail'

import { buildJobSlug } from '@/lib/slugify'

import { extractSolarJobTaxonomy } from "@/lib/jobTaxonomy"

import { guessDomainFromName } from '@/lib/companyDomain'
import Breadcrumb from '@/components/Breadcrumb'


export const revalidate = 3600


// ─── Employment type resolver ────────────────────────────────────────────────


function resolveEmploymentType(job: JobDetail): string {

  const contractTimeMap: Record<string, string> = {

    full_time: 'FULL_TIME',

    part_time: 'PART_TIME',

    contract: 'CONTRACTOR',

    temporary: 'TEMPORARY',

    intern: 'INTERN',

  }


  const contractTypeMap: Record<string, string> = {

    permanent: 'FULL_TIME',

    contract: 'CONTRACTOR',

    temporary: 'TEMPORARY',

    part_time: 'PART_TIME',

  }


  if (job.contract_time && contractTimeMap[job.contract_time.toLowerCase()])

    return contractTimeMap[job.contract_time.toLowerCase()]


  if (job.contract_type && contractTypeMap[job.contract_type.toLowerCase()])

    return contractTypeMap[job.contract_type.toLowerCase()]


  const text = (job.title + ' ' + (job.description || '')).toLowerCase()

  if (text.includes('part-time') || text.includes('part time')) return 'PART_TIME'

  if (text.includes('contract')) return 'CONTRACTOR'

  if (text.includes('intern')) return 'INTERN'

  return 'FULL_TIME'

}


function formatPostedDate(date: Date | null): string {

  if (!date) return 'Recently posted'

  try {

    return formatDistanceToNow(date, { addSuffix: true })

  } catch {

    return 'Recently posted'

  }

}


// ─── Title helper (Bing/Google best practice: ≤ 60 chars) ────────────────────


function buildPageTitle(job: JobDetail): string {

  const company = job.company?.trim() || 'Company'

  const brand = ' | Solar Roles'

  const MAX = 60


  const full = `${job.title} at ${company}${brand}`

  if (full.length <= MAX) return full


  const suffix = ` at ${company}${brand}`

  const roomForTitle = MAX - suffix.length

  if (roomForTitle >= 15) {

    const truncated =

      job.title.length > roomForTitle - 1

        ? job.title.slice(0, roomForTitle - 1).trimEnd() + '…'

        : job.title

    return `${truncated}${suffix}`

  }


  const fallback = `${job.title}${brand}`

  if (fallback.length <= MAX) return fallback

  return job.title.slice(0, MAX - 1).trimEnd() + '…'

}


// ─── Schema helpers ─────────────────────────────────────────────────────────


function parseLocationForSchema(location: string, _stateCode: string) {

  const trimmed = (location ?? '').trim()

  const lower = trimmed.toLowerCase()

  const isRemote = lower === 'remote' || lower.includes('anywhere') || lower.includes('wfh')

  const city = trimmed.split(',')[0]?.trim() ?? ''

  return { city, isRemote }

}


function inferExperienceRequirements(title: string): string | undefined {

  const t = title.toLowerCase()

  if (/\b(senior|sr\.|lead|principal|staff)\b/.test(t)) return 'SENIOR_LEVEL'

  if (/\b(junior|jr\.|entry|associate|intern)\b/.test(t)) return 'ENTRY_LEVEL'

  if (/\b(mid|intermediate)\b/.test(t)) return 'MID_LEVEL'

  return undefined

}

// Convertit le niveau interne (SENIOR_LEVEL/MID_LEVEL/ENTRY_LEVEL, tel que
// renvoyé par inferExperienceRequirements) en texte libre valide pour
// schema.org JobPosting. Google rejette un enum brut type "SENIOR_LEVEL"
// dans experienceRequirements — ce champ attend du texte, pas un enum.
function toSchemaExperienceRequirements(level: string) {
  switch (level) {
    case 'ENTRY_LEVEL':
      return { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 0 }
    case 'MID_LEVEL':
      return { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 24 }
    case 'SENIOR_LEVEL':
      return { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 60 }
    default:
      return undefined
  }
}

// ─── Schema ─────────────────────────────────────────────────────────────────
function buildJobPostingSchema(

  job: JobDetail,

  context: {

    industry?: string

    occupationalCategory?: string

    skills?: string[]

    companyDomain?: string | null

  } = {},

) {

  const { city, isRemote } = parseLocationForSchema(job.location || '', job.addressRegion || '')

  const employmentType = resolveEmploymentType(job)

  const stateCode = job.addressRegion || ''


  // ── hiringOrganization: always set logo + sameAs when we can derive a domain ──

  const hiringOrganization: Record<string, unknown> = {

    '@type': 'Organization',

    name: job.company || 'Unknown',

  }


  const domain = context.companyDomain


  if (domain) {

    hiringOrganization.logo = `https://img.logo.dev/${domain}?token=pk_d6CIF_WHQoevYfXGUe1nSQ`


  }


  // ── base schema ──

  const schema: Record<string, unknown> = {

    '@context': 'https://schema.org',

    '@type': 'JobPosting',


    title: job.title,

    description: buildSchemaDescription({

      title: job.title,

      company: job.company || '',

      city,

      state: stateCode,

      stateCode,

      description: job.description || '',

      salaryMin: job.salary_min,

      salaryMax: job.salary_max,

      employmentType,

      remote: isRemote,

    }),

    hiringOrganization,

    jobLocation: {

      '@type': 'Place',

      address: (() => {
  const addr: Record<string, unknown> = {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  }
  if (city) addr.addressLocality = city
  if (stateCode) addr.addressRegion = stateCode
  if (job.postalCode) addr.postalCode = job.postalCode
  return addr
})(),

    },

    url: `https://www.solarroles.com/jobs/${job.id}/${buildJobSlug(job)}`,

  datePosted: new Date(job.postedAt).toISOString().split('T')[0],
validThrough: new Date(job.expiresAt).toISOString().split('T')[0],

    directApply: job.source === 'employer',

    employmentType,

  }


  // ── identifier (source attribution) ──

 const sourceNames: Record<string, string> = {
  adzuna: 'Adzuna',
  lensa: 'Lensa',
  jooble: 'Jooble',
  careerjet: 'CareerJet',
  employer: 'Solar Roles',

  // ── ATS directs (nouveaux, cf. lib/ats/company-seed.ts) ──
  ashby: 'Ashby',
  smartrecruiters: 'SmartRecruiters',
  lever: 'Lever',
  workable: 'Workable',
  pinpoint: 'Pinpoint',
  jobvite: 'Jobvite',
  greenhouse: 'Greenhouse',
  workday: 'Workday',
}

  schema.identifier = {

    '@type': 'PropertyValue',

    name: sourceNames[job.source] || job.source,

    value: job.id,

  }

  // ── baseSalary ──

  if (job.salary_min && job.salary_max) {

    schema.baseSalary = {

      '@type': 'MonetaryAmount',

      currency: 'USD',

      value: {

        '@type': 'QuantitativeValue',

        minValue: job.salary_min,

        maxValue: job.salary_max,

        unitText: 'YEAR',

      },

    }

  }


  // ── remote handling ──

  if (isRemote) {

    schema.jobLocationType = 'TELECOMMUTE'

    schema.applicantLocationRequirements = { '@type': 'Country', name: 'US' }

  }


  // ── industry + occupationalCategory ──

  if (context.industry) schema.industry = context.industry

  if (context.occupationalCategory) schema.occupationalCategory = context.occupationalCategory


// ── experienceRequirements (inferred from title) ──

  const expReq = inferExperienceRequirements(job.title)

  if (expReq) {

    schema.experienceRequirements = toSchemaExperienceRequirements(expReq)

  }


  // ── skills (when you have extraction) ──

  if (context.skills && context.skills.length > 0) {

    schema.skills = context.skills.join(', ')

  }


  return schema

}


// ─── Metadata ────────────────────────────────────────────────────────────────


export async function generateMetadata(

  { params }: { params: Promise<{ id: string; slug: string }> }

): Promise<Metadata> {

  const { id } = await params

  const raw = await getJobDetail(id)

  if (!raw) notFound()

  const job = getJobDetailWithSalary(raw)



  const canonicalUrl = `https://www.solarroles.com/jobs/${id}/${buildJobSlug(job)}`


  const salaryStr =

    job.salary_min && job.salary_max

      ? ` – $${job.salary_min.toLocaleString('en-US')} to $${job.salary_max.toLocaleString('en-US')}`

      : ''

      const NON_INDEXABLE_SOURCES = ['adzuna', 'jooble', 'careerjet', 'lensa']
const isIndexable = !NON_INDEXABLE_SOURCES.includes(job.source)

  return {

    title: buildPageTitle(job),

    description: `${job.title} position at ${job.company || 'a top employer'} in ${job.location || 'United States'}${salaryStr}. Apply now on Solar Roles.`,

    alternates: { canonical: canonicalUrl },

     robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: true },

    openGraph: {

      title: `${job.title} at ${job.company || 'Company'}`,

      description: `${job.title} in ${job.location || 'United States'}${salaryStr}. Apply today.`,

      type: 'website',

      url: canonicalUrl,


    },

  }

}


// ─── Page ────────────────────────────────────────────────────────────────────


export default async function JobDetailPage({

  params,

  searchParams,

}: {

  params: Promise<{ id: string; slug: string }>

  searchParams: Promise<{ from?: string }>

}) {

  const { id, slug } = await params

  const { from } = await searchParams

  const decoded = from ? decodeURIComponent(from) : null

  const backUrl = decoded && decoded.startsWith('/') ? decoded : '/jobs'


  const raw = await getJobDetail(id)

  if (!raw) notFound()


  const job = getJobDetailWithSalary(raw)


  const taxonomy = extractSolarJobTaxonomy({

    title: job.title,

    description: job.description || '',

  })


  const canonicalSlug = buildJobSlug(job)


  const roleMatch = matchRoleCategory(job.title, job.description)

  const stateName = resolveStateName(job.addressRegion)


  const [roleStats, similarJobs, roleDemand, employerProfile] = await Promise.all([

    roleMatch && stateName

      ? getRoleLocationStats(getRoleKeywords(roleMatch), stateName, !!roleMatch.matchInDescription)

      : Promise.resolve(null),

    roleMatch

      ? getSimilarJobs(getRoleKeywords(roleMatch), job.addressRegion, job.id, 4)

      : Promise.resolve([]),

    roleMatch

      ? getRoleDemandByState(roleMatch.slug)

      : Promise.resolve([]),

    job.company

      ? getEmployerProfile(job.company, job.id)

      : Promise.resolve(null),


  ])


  const salaryComparison = roleStats

    ? compareSalaryToMarket(job.salary_min, job.salary_max, roleStats.avgSalary)

    : null


  const salaryReportSlug =

    roleMatch && KNOWN_SALARY_REPORT_SLUGS.has(roleMatch.slug) ? roleMatch.slug : null


  const breadcrumbSegments = buildBreadcrumbSegments({

    jobTitle: job.title,

    stateName,

    stateSlug: stateName ? stateToSlug(stateName) : null,

    roleLabel: roleMatch?.label || null,

    roleSlug: salaryReportSlug,

  })

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbSegments)


const schema = buildJobPostingSchema(job, {
  industry: taxonomy.specialty,   // ✅ remplace industry par specialty
  occupationalCategory: taxonomy.occupationalCategory,
  skills: taxonomy.skills,
  companyDomain: employerProfile?.domain || undefined,
})


  const applyConfig: Record<string, { label: string; className: string }> = {

    adzuna:    { label: 'Apply now on Adzuna', className: 'bg-green-600 text-white' },

    lensa:     { label: 'Apply on Lensa',       className: 'bg-purple-600 text-white' },

    jooble:    { label: 'Apply on Company Site', className: 'bg-blue-600 text-white' },

    careerjet: { label: 'Apply on Company Site', className: 'bg-slate-700 text-white' },

    employer:  { label: 'Apply',            className: 'bg-slate-900 text-white' },
  }


 const apply = applyConfig[job.source] || { label: 'Apply now', className: 'bg-slate-900 text-white' }

  const applyUrl = job.externalApplyUrl || job.apply_url

  const canonicalUrl = `https://www.solarroles/jobs/${id}/${canonicalSlug}`

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

  return (

    
    <>

      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}

      />

      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}

      />


      <div className="max-w-6xl mx-auto px-6 py-12">

        <div className="flex gap-6 items-start">

          <div className="w-80 shrink-0 sticky top-6 self-start hidden lg:block">

            <PaycheckCalculatorCard salary={job.salary_min} state={job.location} compact />

          </div>


          <div className="flex-1 min-w-0">

            <div className="flex justify-end mb-2 px-1">

              {job.source === 'adzuna' && (

                <a href="https://www.adzuna.com" target="_blank" rel="noopener noreferrer">

                  <img src="/adzuna-logo.png" alt="Powered by Adzuna" width={116} height={23} />

                </a>

              )}

              {job.source === 'jooble' && (

                <span className="text-xs text-muted-foreground">Sourced via Jooble</span>

              )}

              {job.source === 'careerjet' && (

                <span className="text-xs text-muted-foreground">Sourced via CareerJet</span>

              )}

              {job.source === 'lensa' && (

                <span className="text-xs text-muted-foreground">Sourced via Lensa</span>

              )}

            </div>

<Breadcrumb segments={breadcrumbSegments} />

            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">

              {job.headerImage && (
  <div className="relative h-48 sm:h-56">
    <img
      src={job.headerImage}
      alt={`Illustration - ${job.title}`}
      className="w-full h-full object-cover opacity-70"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
  </div>
)}


              <div className="p-8">

                <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>


                {job.company && (

                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">

                    <CompanyLogo company={job.company} size={36} />

                    <span className="text-lg">{job.company}</span>

                  </div>

                )}


                <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">

                  {job.location && (

                    <div className="flex items-center gap-1">

                      <MapPin className="w-4 h-4" /> {job.location}

                    </div>

                  )}

                  {job.created && (

                    <div className="flex items-center gap-1">

                      <Clock className="w-4 h-4" />{' '}

                      {new Date(job.created).toLocaleDateString('en-US', {

                        month: 'short', day: 'numeric', year: 'numeric',

                      })}

                    </div>

                  )}

                  <div className="flex items-center gap-1 text-emerald-600 font-semibold text-base">

                    <DollarSign className="w-4 h-4" />

                    {(job.salary || 'Salary not listed').replace(/^\$/, '')}

                  </div>


                  {salaryComparison && (

                    <span

                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${

                        salaryComparison.direction === 'above'

                          ? 'bg-emerald-50 text-emerald-700'

                          : salaryComparison.direction === 'below'

                          ? 'bg-amber-50 text-amber-700'

                          : 'bg-slate-100 text-slate-600'

                      }`}

                    >

                      {salaryComparison.direction === 'above' && (

                        <>

                          <TrendingUp className="w-3.5 h-3.5" />

                          +{salaryComparison.percentDiff}% vs {stateName} average

                        </>

                      )}

                      {salaryComparison.direction === 'below' && (

                        <>

                          <TrendingDown className="w-3.5 h-3.5" />

                          -{salaryComparison.percentDiff}% vs {stateName} average

                        </>

                      )}

                      {salaryComparison.direction === 'average' && (

                        <>

                          <Minus className="w-3.5 h-3.5" />

                          Average for {stateName}

                        </>

                      )}

                    </span>

                  )}

                  {job.contract_type && (

                    <span className="bg-secondary px-3 py-1 rounded-full capitalize">

                      {job.contract_type}

                    </span>

                  )}

                  {job.contract_time && (

                    <span className="bg-secondary px-3 py-1 rounded-full capitalize">

                      {job.contract_time.replace('_', ' ')}

                    </span>

                  )}

                </div>


                <hr className="my-8" />


                <div>

                  <h2 className="text-xl font-semibold mb-4">Job Description</h2>

                  <div

                    className="job-description"

                   dangerouslySetInnerHTML={{
  __html: job.seoDescription
    ? sanitizeStructuredHtml(job.seoDescription)
    : formatJobDescription(job.description || ''),
}}

                  />

                </div>


                <div className="mt-8 lg:hidden">

                  <PaycheckCalculatorCard salary={job.salary_min} state={job.location} />

                </div>


                {roleStats && stateName && roleMatch && (

                  <div className="mt-10 rounded-xl border border-[#F5B819]/25 bg-[#FEF3C7] p-5 text-sm text-[#B45309]">

                    <p>

                      <span className="font-semibold">{roleMatch.label}</span> roles in{' '}

                      <span className="font-semibold">{stateName}</span> average{' '}

                      <span className="font-semibold">

                        ${roleStats.avgSalary.toLocaleString('en-US')}/year

                      </span>

                      , based on {roleStats.count.toLocaleString('en-US')} active listings on our database.

                    </p>

                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">

                      <Link

                        href={`/data/states/${stateToSlug(stateName)}`}

                        className="font-medium underline hover:text-blue-700"

                      >

                        See the full {stateName} job market report →

                      </Link>

                      {salaryReportSlug && (

                        <Link

                          href={`/data/salaries/${salaryReportSlug}`}

                          className="font-medium underline hover:text-blue-700"

                        >

                          {roleMatch.label} salaries by state →

                        </Link>

                      )}

                    </p>

                  </div>

                )}


                {employerProfile && (

                  <div className="mt-8 rounded-xl border p-5 text-sm">

                    <p className="font-semibold text-foreground mb-2">

                      {job.company} on Solar Roles

                    </p>

                    <p className="text-muted-foreground">

                      {employerProfile.totalOpenings.toLocaleString('en-US')} open position

                      {employerProfile.totalOpenings > 1 ? 's' : ''} right now

                      {employerProfile.singleState ? (

                        <>, all of them in {resolveStateName(employerProfile.singleState) || employerProfile.singleState}</>

                      ) : (

                        employerProfile.states[0] && (

                          <>

                            , including {employerProfile.states[0].count} in{' '}

                            {resolveStateName(employerProfile.states[0].state) || employerProfile.states[0].state}

                          </>

                        )

                      )}

                      .

                      {employerProfile.avgSalaryMin && employerProfile.avgSalaryMax && (

                        <>

                          {' '}Average salary across all roles: $

                          {employerProfile.avgSalaryMin.toLocaleString('en-US')}–$

                          {employerProfile.avgSalaryMax.toLocaleString('en-US')}.

                        </>

                      )}

                    </p>

                  </div>

                )}


               <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 {job.source === 'employer' ? (
  <div className="w-full">
    <ApplyToggle jobId={job.id} jobTitle={job.title} />
  </div>
) : applyUrl ? (
    <Button asChild size="lg" className={`w-full sm:w-auto ${apply.className}`}>
      <a href={`/jobs/${job.id}/go`} target="_blank" rel="noopener noreferrer">
        {apply.label} <ExternalLink className="w-4 h-4 ml-2" />
      </a>
    </Button>
  ) : (
    <Button disabled size="lg" className="w-full sm:w-auto">
      Apply link unavailable
    </Button>
  )}

   {job.source === 'employer' && <AdUnit slot="job-detail" />}

  <ShareBar
    url={`https://www.solarroles.com/jobs/${job.id}/${buildJobSlug(job)}`}
    title={job.title}
    company={job.company || ''}
  />
</div>


                {roleMatch && (

                  <RoleDemandMap data={roleDemand} roleLabel={roleMatch.label} />

                )}


                {similarJobs.length > 0 && (

                  <div className="mt-10">

                    <h3 className="text-lg font-semibold text-foreground mb-3">Similar positions:</h3>

                    <ul className="space-y-2">

                      {similarJobs.map((sj) => (

                        <li key={sj.id}>

                          <Link

                            href={`/jobs/${sj.id}/${buildJobSlug(sj)}`}

                            className="group flex items-center gap-3 rounded-lg border p-3 hover:border-primary/50 hover:bg-secondary/40 transition-colors"

                          >

                            <CompanyLogo company={sj.company || ''} />

                            <div className="min-w-0 flex-1">

                              <p className="font-medium truncate group-hover:text-blue-600 transition-colors">{sj.title}</p>

                              <p className="text-xs text-muted-foreground truncate">

                                {sj.company}{sj.location ? ` • ${sj.location}` : ''}

                              </p>

                            </div>

                            <span className="shrink-0 text-xs text-muted-foreground">

                              {formatPostedDate(sj.postedAt)}

                            </span>

                          </Link>

                        </li>

                      ))}

                    </ul>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </>

  )

}