// app/jobs/[id]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Building2, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { extractSalaryFromText } from '@/lib/extractSalary'
import { formatJobDescription } from '@/lib/formatJobDescription'
import { normalizeLensa, normalizeAdzuna } from '@/lib/jobs'
import { searchLensaJobs } from '@/lib/lensa'
import { getJobById } from '@/lib/adzuna'

export const revalidate = 3600 // Cache ISR 1h — évite les 429 Adzuna

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
  source: 'lensa' | 'adzuna'
  externalApplyUrl?: string | null
  apply_url?: string
}

async function getJobDetail(id: string): Promise<JobDetail | null> {
  try {
    if (id.startsWith('lensa-')) {
      const originalId = id.replace('lensa-', '')
      const lensaData = await searchLensaJobs({ limit: 180 })
      const job = lensaData.job_adverts?.find(j => j.unique_id === originalId)
      if (!job) return null
      return { ...normalizeLensa(job), source: 'lensa' as const }
    }

    if (id.startsWith('adzuna-')) {
      const originalId = id.replace('adzuna-', '')
      const jobRaw = await getJobById(originalId)
      if (!jobRaw) return null

      const normalized = normalizeAdzuna(jobRaw)

      return {
        ...normalized,
        source: 'adzuna' as const,
        externalApplyUrl: jobRaw.redirect_url || null,
        salary_min: jobRaw.salary_min,
        salary_max: jobRaw.salary_max,
        addressRegion: normalized.addressRegion,
        contract_type: jobRaw.contract_type,
      }
    }

    return null
  } catch (error: any) {
    console.error('Error in getJobDetail:', error.message || error)
    return null
  }
}

/** Wrapper: fetches job + extracts salary from text when API fields are empty or estimated */
async function getJobDetailWithSalary(id: string): Promise<JobDetail | null> {
  const job = await getJobDetail(id)
  if (!job) return null

  // Real salary = both fields present AND different (not an Adzuna estimate)
  const hasRealSalary = job.salary_min && job.salary_max && job.salary_min !== job.salary_max

  if (!hasRealSalary) {
    const extracted = extractSalaryFromText(job.title, job.description || '')
    if (extracted) {
      job.salary = extracted.display
      job.salary_min = extracted.min
      job.salary_max = extracted.max
    }
    // No extraction found but Adzuna gave an estimate (min === max)
    // Show it as estimate rather than a fake range
    else if (job.salary_min && job.salary_min === job.salary_max) {
      job.salary = `~$${job.salary_min.toLocaleString('en-US')}/year (est.)`
    }
  }

  return job
}

// ─── Strip HTML pour la description dans le schema ───────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// ─── JobPosting Schema (Google Jobs optimized) ───────────────────────────────
function buildJobPostingSchema(job: JobDetail) {
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
    datePosted: job.created
      ? new Date(job.created).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],

    // Adzuna compliance: users are redirected to Adzuna to apply
    directApply: false,
  }

  // Unique identifier — helps Google deduplicate listings
  if (job.id) {
    schema.identifier = {
      '@type': 'PropertyValue',
      name: job.source === 'adzuna' ? 'Adzuna' : 'Lensa',
      value: job.id,
    }
  }

  // validThrough: +60 days after datePosted
  const base = job.created ? new Date(job.created) : new Date()
  base.setDate(base.getDate() + 60)
  schema.validThrough = base.toISOString().split('T')[0]

  // ─── employmentType ─────────────────────────────────────────────────────
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

  let employmentType =
    (job.contract_time && contractTimeMap[job.contract_time.toLowerCase()]) ||
    (job.contract_type && contractTypeMap[job.contract_type.toLowerCase()])

  if (!employmentType) {
    const text = (job.title + ' ' + (job.description || '')).toLowerCase()
    if (text.includes('part-time') || text.includes('part time')) {
      employmentType = 'PART_TIME'
    } else if (text.includes('contract')) {
      employmentType = 'CONTRACTOR'
    } else if (text.includes('intern')) {
      employmentType = 'INTERN'
    } else if (text.includes('temporary') || text.includes('temp ')) {
      employmentType = 'TEMPORARY'
    } else {
      employmentType = 'FULL_TIME'
    }
  }

  schema.employmentType = employmentType

  // ─── baseSalary ─────────────────────────────────────────────────────────
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

  // ─── Remote detection ───────────────────────────────────────────────────
  const locationLower = (job.location || '').toLowerCase()
  if (locationLower.includes('remote')) {
    schema.jobLocationType = 'TELECOMMUTE'
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: 'US',
    }
  }

  return schema
}

// ─── Metadata dynamiques ─────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const job = await getJobDetailWithSalary(id)

  if (!job) return { title: 'Job Not Found | Oh My Job' }

  const salaryStr =
    job.salary_min && job.salary_max
      ? ` – $${job.salary_min.toLocaleString()} to $${job.salary_max.toLocaleString()}`
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getJobDetailWithSalary(id)

  if (!job) notFound()

  const schema = buildJobPostingSchema(job)

  return (
    <>
      {/* JobPosting Schema for Google Jobs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/jobs" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        <div className="bg-card border rounded-2xl p-8 shadow-sm">

          {/* Adzuna attribution — required by partnership terms */}
          {job.source === 'adzuna' && (
            <div className="flex justify-end mb-4">
              <a
                href="https://www.adzuna.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/adzuna-logo.png"
                  alt="Powered by Adzuna"
                  width={116}
                  height={23}
                />
              </a>
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
            {job.created && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />{' '}
                {new Date(job.created).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            )}
            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-base">
              <DollarSign className="w-4 h-4" /> {job.salary || 'Salary not listed'}
            </div>
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

          {/* Job description — formatted for readability */}
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
            {job.source === 'adzuna' && job.externalApplyUrl ? (
              <Button asChild size="lg" className="w-full md:w-auto">
                <a href={job.externalApplyUrl} target="_blank" rel="noopener noreferrer">
                  Apply now on Adzuna <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                <a href={job.apply_url || '#'} target="_blank" rel="noopener noreferrer">
                  Apply on Lensa <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}