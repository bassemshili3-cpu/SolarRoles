import { notFound, permanentRedirect } from 'next/navigation'
import { getJobDetail } from '@/lib/jobDetail'
import { buildJobSlug } from '@/lib/slugify'

export default async function LegacyJobRedirect({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJobDetail(id)
  if (!job) notFound()
  permanentRedirect(`/jobs/${id}/${buildJobSlug(job)}`)
}