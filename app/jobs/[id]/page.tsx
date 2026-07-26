// app/jobs/[id]/page.tsx
import { notFound, permanentRedirect } from 'next/navigation'
import { getJobDetail } from '@/lib/jobDetail'
import { buildJobSlug } from '@/lib/slugify'
import { getCanonicalSlugFromCache } from '@/lib/jobSlugCache'

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