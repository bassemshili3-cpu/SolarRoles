// app/jobs/[id]/page.tsx
// ─── Page détail job v2 : lecture depuis la base PostgreSQL ──────────────────
// Plus d'appel API en temps réel. Tout vient de Prisma.

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Building2, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { extractSalaryFromText } from '@/lib/extractSalary'
import { formatJobDescription } from '@/lib/formatJobDescription'
import { getJobFromDb, DbJob } from '@/lib/job-db'

export const revalidate = 3600

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function enrichSalary(job: DbJob): DbJob {
  const hasRealSalary = job.salaryMin && job.salaryMax && job.salaryMin !== job.salaryMax

  if (!hasRealSalary) {
    const extracted = extractSalaryFromText(job.title, job.description || '')
    if (extracted) {
      job.salary = extracted.display
      job.salaryMin = extracted.min ?? null
      job.salaryMax = extracted.max ?? null
    } else if (job.salaryMin && job.salaryMin === job.salaryMax) {
      job.salary = `~$${job.salaryMin.toLocaleString('en-US')}/year (est.)`
    }
  }

  return job
}

// ─── JobPosting Schema (Google Jobs) ─────────────────────────────────────────

function buildJobPostingSchema(job: DbJob) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: stripHtml(job.description || ''),
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
      },
    },
    url: `https://www.oh-my-job.com/jobs/${job.id}`,
    datePosted: job.postedAt
      ? new Date(job.postedAt).toISOString().split('T')[0]
      : new Date(job.fetchedAt).toISOString().split('T')[0],
    directApply: false,
  }

  // Identifier
  const sourceNames: Record<string, string> = {
    adzuna: 'Adzuna',
    lensa: 'Lensa',
    jooble: 'Jooble',
  }
  schema.identifier = {
    '@type': 'PropertyValue',
    name: sourceNames[job.source] || job.source,
    value: job.id,
  }

  // validThrough
  const base = job.postedAt ? new Date(job.postedAt) : new Date(job.fetchedAt)
  base.setDate(base.getDate() + 60)
  schema.validThrough = base.toISOString().split('T')[0]

  // employmentType
  const text = (job.title + ' ' + (job.description || '')).toLowerCase()
  let employmentType = 'FULL_TIME'

  if (job.contractTime) {
    const map: Record<string, string> = {
      full_time: 'FULL_TIME', part_time: 'PART_TIME',
      contract: 'CONTRACTOR', temporary: 'TEMPORARY', intern: 'INTERN',
    }
    employmentType = map[job.contractTime.toLowerCase()] || employmentType
  } else if (job.contractType) {
    const map: Record<string, string> = {
      permanent: 'FULL_TIME', contract: 'CONTRACTOR',
      temporary: 'TEMPORARY', part_time: 'PART_TIME',
    }
    employmentType = map[job.contractType.toLowerCase()] || employmentType
  } else if (text.includes('part-time') || text.includes('part time')) {
    employmentType = 'PART_TIME'
  } else if (text.includes('contract')) {
    employmentType = 'CONTRACTOR'
  } else if (text.includes('intern')) {
    employmentType = 'INTERN'
  }

  schema.employmentType = employmentType

  // baseSalary
  if (job.salaryMin && job.salaryMax) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: 'YEAR',
      },
    }
  }

  // Remote
  if ((job.location || '').toLowerCase().includes('remote')) {
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
  const raw = await getJobFromDb(id)

  if (!raw) return { title: 'Job Not Found | Oh My Job' }

  const job = enrichSalary(raw)

  const salaryStr =
    job.salaryMin && job.salaryMax
      ? ` – $${job.salaryMin.toLocaleString()} to $${job.salaryMax.toLocaleString()}`
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
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const raw = await getJobFromDb(id)

  if (!raw) notFound()

  const job = enrichSalary(raw)
  const schema = buildJobPostingSchema(job)

  // Config par source
  const applyConfig: Record<string, { label: string; className: string }> = {
    adzuna: { label: 'Apply now on Adzuna', className: '' },
    lensa: { label: 'Apply on Lensa', className: 'bg-green-600 hover:bg-green-700' },
    jooble: { label: 'Apply on Company Site', className: 'bg-blue-600 hover:bg-blue-700' },
  }

  const apply = applyConfig[job.source] || applyConfig.adzuna

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/jobs" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        <div className="bg-card border rounded-2xl p-8 shadow-sm">

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

          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>

          {job.company && (
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span className="text-lg">{job.company}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {job.location}
              </div>
            )}
            {job.postedAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />{' '}
                {new Date(job.postedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </div>
            )}
            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-base">
              <DollarSign className="w-4 h-4" />
              {(job.salary || 'Salary not listed').replace(/^\$/, '')}
            </div>
            {job.contractType && (
              <span className="bg-secondary px-3 py-1 rounded-full capitalize">
                {job.contractType}
              </span>
            )}
            {job.contractTime && (
              <span className="bg-secondary px-3 py-1 rounded-full capitalize">
                {job.contractTime.replace('_', ' ')}
              </span>
            )}
          </div>

          <hr className="my-8" />

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

          {/* Apply CTA */}
          <div className="mt-10">
            {job.applyUrl ? (
              <Button asChild size="lg" className={`w-full md:w-auto ${apply.className}`}>
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                  {apply.label} <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            ) : (
              <Button disabled size="lg" className="w-full md:w-auto">
                Apply link unavailable
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}