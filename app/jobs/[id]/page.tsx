// app/jobs/[id]/page.tsx
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getJobDetail, getJobDetailWithSalary, type JobDetail } from '@/lib/jobDetail'
import { buildJobSlug } from '@/lib/slugify'
import { getCanonicalSlugFromCache } from '@/lib/jobSlugCache'

const SITE_URL = 'https://www.solarroles.com'
const NON_INDEXABLE_SOURCES = new Set(['adzuna', 'jooble', 'careerjet', 'lensa'])

function buildPageTitle(job: JobDetail): string {
  const brand = ' | Solar Roles'
  const fullTitle = job.location
    ? `${job.title} - ${job.location}${brand}`
    : `${job.title} at ${job.company || 'Company'}${brand}`

  return fullTitle.length <= 60
    ? fullTitle
    : `${fullTitle.slice(0, 59).trimEnd()}…`
}

/**
 * The short legacy URL responds with a redirect, but Next still builds its
 * document head on the server. Supplying route-specific metadata here keeps
 * non-JS crawlers from receiving the generic /jobs metadata before following
 * the canonical slug URL.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const rawJob = await getJobDetail(id)

  if (!rawJob) {
    return {
      title: 'Job not found | Solar Roles',
      description: 'This job posting is no longer available on Solar Roles.',
      robots: { index: false, follow: true },
    }
  }

  const job = getJobDetailWithSalary(rawJob)
  const canonicalUrl = `${SITE_URL}/jobs/${job.id}/${buildJobSlug(job)}`
  const salary = job.salary_min && job.salary_max
    ? ` — $${job.salary_min.toLocaleString('en-US')} to $${job.salary_max.toLocaleString('en-US')}`
    : ''
  const description = `${job.title} position at ${job.company || 'a top employer'} in ${job.location || 'the United States'}${salary}. Apply now on Solar Roles.`

  return {
    title: buildPageTitle(job),
    description,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: !NON_INDEXABLE_SOURCES.has(job.source),
      follow: true,
    },
    openGraph: {
      title: `${job.title} at ${job.company || 'Company'}`,
      description,
      type: 'website',
      url: canonicalUrl,
    },
  }
}

export default async function LegacyJobRedirect({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1. On tente d'abord le cache Redis (rapide, évite la DB)
  const cachedSlug = await getCanonicalSlugFromCache(id)
  if (cachedSlug) {
    permanentRedirect(`/jobs/${id}/${cachedSlug}`)
  }

  // 2. Sinon, fallback sur la DB comme avant
  const job = await getJobDetail(id)
  if (!job) notFound()
  permanentRedirect(`/jobs/${id}/${buildJobSlug(job)}`)
}
