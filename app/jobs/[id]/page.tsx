// app/jobs/[id]/page.tsx
// ─── Page détail job HYBRIDE ─────────────────────────────────────────────────
// 1. Essaie l'API en temps réel (Adzuna, Lensa)
// 2. Si l'API échoue (404, 429, timeout) → lit depuis la base Prisma
// 3. Jooble toujours depuis la base (pas d'endpoint par ID)
import { buildBreadcrumbSegments, buildBreadcrumbSchema } from '@/lib/buildBreadcrumbSchema'
import { getSimilarJobs } from '@/lib/similarJobs'
import { getEmployerProfile } from '@/lib/employerProfile'
import { matchRoleCategory, getRoleKeywords, KNOWN_SALARY_REPORT_SLUGS } from '@/lib/roleCategories'
import { resolveStateName, stateToSlug } from '@/lib/usStates'
import { getRoleLocationStats } from '@/lib/roleLocationStats'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import PaycheckCalculatorCard from '@/components/PaycheckCalculatorCard'

import { extractSalaryFromText } from '@/lib/extractSalary'
import { formatJobDescription } from '@/lib/formatJobDescription'
import { buildSchemaDescription } from '@/lib/buildSchemaDescription'
import { normalizeAdzuna } from '@/lib/jobs'
import { getJobById } from '@/lib/adzuna'
import { prisma } from '@/lib/prisma'
import ShareBar from '@/components/ShareBar'
import { isDescriptionTruncated } from '@/lib/description-quality'
import CompanyLogo from '@/components/CompanyLogo'
import { formatDistanceToNow } from 'date-fns'
import { compareSalaryToMarket } from '@/lib/salaryComparison'


export const revalidate = 3600

type JobDetail = {
  id: string
  title: string
  company?: string
  location?: string
  addressRegion?: string
  salary?: string
  salary_min?: number
  salary_max?: number
  description?: string
  created?: string
  contract_type?: string
  contract_time?: string
  source: 'lensa' | 'adzuna' | 'jooble' | 'careerjet'
  externalApplyUrl?: string | null
  apply_url?: string
}

async function getJobDetail(id: string): Promise<JobDetail | null> {
  // ── 1. Toujours essayer la DB en premier ──────────────────────────────────
  try {
    const dbJob = await prisma.job.findUnique({ where: { id } })
    if (dbJob && dbJob.active) {
      return {
        id: dbJob.id,
        title: dbJob.title,
        company: dbJob.company,
        location: dbJob.location,
        addressRegion: dbJob.addressRegion,
        description: dbJob.description,
        salary_min: dbJob.salaryMin || undefined,
        salary_max: dbJob.salaryMax || undefined,
        salary: dbJob.salary || undefined,
        created: dbJob.postedAt?.toISOString(),
       source: dbJob.source as 'adzuna' | 'lensa' | 'jooble' | 'careerjet',
        externalApplyUrl: dbJob.applyUrl,
        apply_url: dbJob.applyUrl,
        contract_type: dbJob.contractType || undefined,
        contract_time: dbJob.contractTime || undefined,
      }
    }
  } catch (error: any) {
    console.error('DB error:', error.message)
  }

  // ── 2. Fallback Adzuna ────────────────────────────────────────────────────
  if (id.startsWith('adzuna-')) {
    try {
      const adzunaId = id.replace('adzuna-', '')
      const raw = await getJobById(adzunaId)
      if (raw) {
        const job = normalizeAdzuna(raw)
        return { ...job, source: 'adzuna' }
      }
    } catch (error: any) {
      console.error('Adzuna API error:', error.message)
    }
  }

  // ── 4. Jooble : DB only, pas d'endpoint par ID ────────────────────────────
  // (déjà couvert par l'étape 1)

  return null
}
// ─── Enrichissement salaire ──────────────────────────────────────────────────

function getJobDetailWithSalary(job: JobDetail): JobDetail {
  const hasRealSalary = job.salary_min && job.salary_max && job.salary_min !== job.salary_max

  if (hasRealSalary) {
    // salary_min/salary_max existent déjà, mais la chaîne d'affichage `salary`
    // peut ne jamais avoir été stockée par certaines sources (ex: CareerJet).
    // On la reconstruit à la volée si besoin, sans écraser une valeur existante.
    if (!job.salary) {
      job.salary = `$${job.salary_min!.toLocaleString('en-US')} - $${job.salary_max!.toLocaleString('en-US')}/year`
    }
    return job
  }

  const extracted = extractSalaryFromText(job.title, job.description || '')
  if (extracted) {
    job.salary = extracted.display
    job.salary_min = extracted.min
    job.salary_max = extracted.max
  } else if (job.salary_min && job.salary_min === job.salary_max) {
    job.salary = `~$${job.salary_min.toLocaleString('en-US')}/year (est.)`
  }

  return job
}

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

// ─── Schema ──────────────────────────────────────────────────────────────────

function buildJobPostingSchema(job: JobDetail) {
  const isRemote = (job.location || '').toLowerCase().includes('remote')
  const employmentType = resolveEmploymentType(job)

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: buildSchemaDescription({
      title: job.title,
      company: job.company || '',
      city: job.location || '',
      state: job.addressRegion || '',
      stateCode: job.addressRegion || '',
      description: job.description || '',
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      employmentType,
      remote: isRemote,
    }),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company || 'Unknown',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location || '',
        addressRegion: job.addressRegion || '',
        addressCountry: 'US',
        streetAddress: job.location || '',
        postalCode: '',
      },
    },
    url: `https://www.oh-my-job.com/jobs/${job.id}`,
    datePosted: job.created
      ? new Date(job.created).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    directApply: false,
    employmentType,
  }

  const sourceNames: Record<string, string> = {
  adzuna: 'Adzuna', lensa: 'Lensa', jooble: 'Jooble', careerjet: 'CareerJet',
}
  schema.identifier = {
    '@type': 'PropertyValue',
    name: sourceNames[job.source] || job.source,
    value: job.id,
  }

  const base = job.created ? new Date(job.created) : new Date()
  base.setDate(base.getDate() + 60)
  schema.validThrough = base.toISOString().split('T')[0]

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

  if (isRemote) {
    schema.jobLocationType = 'TELECOMMUTE'
    schema.applicantLocationRequirements = { '@type': 'Country', name: 'US' }
  }

  return schema
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const raw = await getJobDetail(id)
if (!raw) notFound()

const job = getJobDetailWithSalary(raw)


const truncated = isDescriptionTruncated(job.description || '')

  const salaryStr =
    job.salary_min && job.salary_max
      ? ` – $${job.salary_min.toLocaleString('en-US')} to $${job.salary_max.toLocaleString('en-US')}`
      : ''

  return {
    title: `${job.title} at ${job.company || 'Company'} | Oh My Job`,
    description: `${job.title} position at ${job.company || 'a top employer'} in ${job.location || 'United States'}${salaryStr}. Apply now on Oh My Job.`,
    alternates: {
      canonical: `https://www.oh-my-job.com/jobs/${id}`,
    },
    openGraph: {
      title: `${job.title} at ${job.company || 'Company'}`,
      description: `${job.title} in ${job.location || 'United States'}${salaryStr}. Apply today.`,
      type: 'website',
      url: `https://www.oh-my-job.com/jobs/${id}`,
    },
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const { from } = await searchParams
  const decoded = from ? decodeURIComponent(from) : null
  const backUrl = decoded && decoded.startsWith('/') ? decoded : '/jobs'
  const raw = await getJobDetail(id)

  if (!raw) notFound()

  const job = getJobDetailWithSalary(raw)

  const roleMatch = matchRoleCategory(job.title)
  const stateName = resolveStateName(job.addressRegion)
  const roleStats =
    roleMatch && stateName
      ? await getRoleLocationStats(getRoleKeywords(roleMatch), stateName)
      : null

      const salaryComparison = roleStats
  ? compareSalaryToMarket(job.salary_min, job.salary_max, roleStats.avgSalary)
  : null

      const similarJobs = roleMatch
  ? await getSimilarJobs(getRoleKeywords(roleMatch), job.addressRegion, job.id, 4)
  : []

  const employerProfile = job.company
    ? await getEmployerProfile(job.company, job.id)
    : null

  const salaryReportSlug =
    roleMatch && KNOWN_SALARY_REPORT_SLUGS.has(roleMatch.slug) ? roleMatch.slug : null

    console.log('[SEO block debug]', {
    title: job.title,
    addressRegion: job.addressRegion,
    roleMatch,
    stateName,
    roleStats,
  })

  const breadcrumbSegments = buildBreadcrumbSegments({
  jobTitle: job.title,
  stateName,
  stateSlug: stateName ? stateToSlug(stateName) : null,
  roleLabel: roleMatch?.label || null,
  roleSlug: salaryReportSlug,
})
const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbSegments)

  const schema = buildJobPostingSchema(job)

 const applyConfig: Record<string, { label: string; className: string }> = {
  adzuna:    { label: 'Apply now on Adzuna', className: 'bg-green-600 text-white' },
  lensa:     { label: 'Apply on Lensa',       className: 'bg-purple-600 text-white' },
  jooble:    { label: 'Apply on Company Site', className: 'bg-blue-600 text-white' },
  careerjet: { label: 'Apply on Company Site', className: 'bg-slate-700 text-white' },
}

  const apply = applyConfig[job.source] || applyConfig.adzuna
  const applyUrl = job.externalApplyUrl || job.apply_url

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
/>

      <div className="max-w-6xl mx-auto px-6 py-12">

        <Link
          href={backUrl}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          
        </Link>

        {/* ── Layout 2 colonnes ── */}
        <div className="flex gap-6 items-start">

          {/* ── Sidebar sticky gauche ── */}
          
<div className="w-80 shrink-0 sticky top-6 self-start hidden lg:block">
  <PaycheckCalculatorCard salary={job.salary_min} state={job.location} compact />
</div>

          {/* ── Contenu principal ── */}
          <div className="flex-1 min-w-0 bg-card border rounded-2xl p-8 shadow-sm">

            {/* Attribution */}
            {job.source === 'adzuna' && (
              <div className="flex justify-end mb-4">
                <a href="https://www.adzuna.com" target="_blank" rel="noopener noreferrer">
                  <img src="/adzuna-logo.png" alt="Powered by Adzuna" width={116} height={23} />
                </a>
              </div>
            )}
            {job.source === 'jooble' && (
              <div className="flex justify-end mb-4">
                <span className="text-xs text-muted-foreground">Sourced via Jooble</span>
              </div>
            )}

            {job.source === 'careerjet' && (
  <div className="flex justify-end mb-4">
    <span className="text-xs text-muted-foreground">Sourced via CareerJet</span>
  </div>
)}
            {job.source === 'lensa' && (
              <div className="flex justify-end mb-4">
                <span className="text-xs text-muted-foreground">Sourced via Lensa</span>
              </div>
            )}

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

            {/* Job Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              
              <div
                className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed
                  prose-h3:text-lg prose-h3:font-semibold prose-h3:text-foreground prose-h3:mt-10 prose-h3:mb-4 prose-h3:border-b prose-h3:border-border prose-h3:pb-2
                  prose-p:my-4
                  prose-ul:my-4 prose-ul:pl-6 prose-ul:list-disc
                  prose-li:text-muted-foreground prose-li:my-2 prose-li:leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatJobDescription(job.description || ''),
                }}
              />
            </div>

            

            

            {/* Paycheck Calculator mobile uniquement (lg: caché dans la sidebar) */}
           <div className="mt-8 lg:hidden">
  <PaycheckCalculatorCard salary={job.salary_min} state={job.location} />
</div>

            
            

           

{/* Bloc SEO interne : stats métier x état */}
            {roleStats && stateName && roleMatch && (
              <div className="mt-16 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
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

{/* Profil employeur : vue transversale toutes sources confondues */}
{employerProfile && (
  <div className="mt-8 rounded-xl border p-5 text-sm">
    <p className="font-semibold text-foreground mb-2">
      {job.company} on Oh My Job
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


{/* Apply CTA + Share */}
<div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  {applyUrl ? (
    <Button asChild size="lg" className={`w-full sm:w-auto ${apply.className}`}>
      <a href={applyUrl} target="_blank" rel="noopener noreferrer">
        {apply.label} <ExternalLink className="w-4 h-4 ml-2" />
      </a>
    </Button>
  ) : (
    <Button disabled size="lg" className="w-full sm:w-auto">
      Apply link unavailable
    </Button>
  )}

  <ShareBar
  
    url={`https://www.oh-my-job.com/jobs/${job.id}`}
    title={job.title}
    company={job.company || ''}
  />
</div>


{/* Similar positions */}
{similarJobs.length > 0 && (
  <div className="mt-10">
    <h3 className="text-lg font-semibold text-foreground mb-3">Similar positions:</h3>
    <ul className="space-y-2">
      {similarJobs.map((sj) => (
        <li key={sj.id}>
          <Link
            href={`/jobs/${sj.id}`}
            className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary/50 hover:bg-secondary/40 transition-colors"
          >
            <CompanyLogo company={sj.company || ''} />

            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{sj.title}</p>
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

 
          {/* ── fin contenu principal ── */}

        </div>
        {/* ── fin layout 2 colonnes ── */}

      </div>
    </>
  )
}