// app/jobs/[id]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Building2, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { normalizeLensa, normalizeAdzuna } from '@/lib/jobs'
import { searchLensaJobs } from '@/lib/lensa'
import { getJobById } from '@/lib/adzuna'

type JobDetail = {
  id: string
  title: string
  company?: string
  location?: string
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
  console.log('🔍 === getJobDetail START for ID:', id, '===')

  try {
    if (id.startsWith('lensa-')) {
      console.log('→ Mode LENSA')
      const originalId = id.replace('lensa-', '')
      const lensaData = await searchLensaJobs({ limit: 180 })
      const job = lensaData.job_adverts?.find(j => j.unique_id === originalId)
      console.log('   Job Lensa trouvé ?', !!job)
      if (!job) return null
      return { ...normalizeLensa(job), source: 'lensa' as const }
    }

    if (id.startsWith('adzuna-')) {
      console.log('→ Mode ADZUNA')
      const originalId = id.replace('adzuna-', '')
      console.log('   originalId extrait :', originalId)

      const jobRaw = await getJobById(originalId)

      console.log('   === RÉSULTAT getJobById ===')
      console.log('   Type     :', typeof jobRaw)
      console.log('   Valeur complète :', JSON.stringify(jobRaw, null, 2))
      console.log('   Est truthy ?', !!jobRaw)

      if (!jobRaw) {
        console.error('❌ getJobById a retourné null → job introuvable ou credentials manquants')
        return null
      }

      console.log('🎉 Job Adzuna trouvé ! Titre :', jobRaw.title)

      return {
        ...normalizeAdzuna(jobRaw),
        source: 'adzuna' as const,
        externalApplyUrl: jobRaw.redirect_url || null,
        salary_min: jobRaw.salary_min,
        salary_max: jobRaw.salary_max,
      }
    }

    return null
  } catch (error: any) {
    console.error('💥 ERREUR EXCEPTION dans getJobDetail :', error.message || error)
    return null
  }
}

// ─── JobPosting Schema ────────────────────────────────────────────────────────
function buildJobPostingSchema(job: JobDetail) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || '',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company || 'Unknown',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location || '',
        addressCountry: 'US',
      },
    },
    url: `https://www.oh-my-job.com/jobs/${job.id}`,
    datePosted: job.created
      ? new Date(job.created).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  }

  // validThrough : +60 jours après datePosted
  const base = job.created ? new Date(job.created) : new Date()
  base.setDate(base.getDate() + 60)
  schema.validThrough = base.toISOString().split('T')[0]

  // baseSalary — uniquement si dispo (Adzuna seulement)
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

  // Remote detection automatique sur le champ location
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
  const job = await getJobDetail(id)

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
  console.log('📌 Page chargée avec ID :', id)

  const job = await getJobDetail(id)

  if (!job) {
    console.error('❌ Job final non trouvé → 404')
    notFound()
  }

  console.log('🎉 JOB AFFICHÉ AVEC SUCCÈS →', job.title)

  const schema = buildJobPostingSchema(job)

  return (
    <>
      {/* ✅ JobPosting Schema injecté pour Google Jobs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/jobs" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          

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
                <Clock className="w-4 h-4" /> {new Date(job.created).toLocaleDateString('fr-FR')}
              </div>
            )}
            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-base">
              <DollarSign className="w-4 h-4" /> {job.salary || 'Salary not listed'}
            </div>
            {job.contract_type && (
              <span className="bg-secondary px-3 py-1 rounded-full capitalize">{job.contract_type}</span>
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
              className="prose max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.description || '' }}
            />
          </div>

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