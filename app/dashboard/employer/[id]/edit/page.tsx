// app/dashboard/employer/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { STATE_CODE_TO_NAME } from '@/lib/usStates'
import JobForm, { type JobFormInitialData } from '../../job-form'

const CONTRACT_TIME_TO_EMPLOYMENT_TYPE: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
}

const CONTRACT_TYPE_TO_EMPLOYMENT_TYPE: Record<string, string> = {
  contract: 'Contract',
  internship: 'Internship',
}

function resolveEmploymentType(contractType: string | null, contractTime: string | null): string {
  if (contractTime && CONTRACT_TIME_TO_EMPLOYMENT_TYPE[contractTime]) {
    return CONTRACT_TIME_TO_EMPLOYMENT_TYPE[contractTime]
  }
  if (contractType && CONTRACT_TYPE_TO_EMPLOYMENT_TYPE[contractType]) {
    return CONTRACT_TYPE_TO_EMPLOYMENT_TYPE[contractType]
  }
  return 'Full-time'
}

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirectTo=/dashboard/employer/${id}/edit`)

  const job = await prisma.job.findUnique({ where: { id } })
  if (!job || job.postedByUserId !== user.id) notFound()

  const isRemote = job.location === 'Remote'
  const [city] = isRemote ? [''] : job.location.split(',').map((s) => s.trim())

  const notificationEmail = job.applyUrl?.startsWith('mailto:')
    ? job.applyUrl.replace('mailto:', '')
    : ''

  const stateName = isRemote
    ? ''
    : STATE_CODE_TO_NAME[job.addressRegion.toUpperCase()] || ''

  const initialData: JobFormInitialData = {
    title: job.title,
    company: job.company,
    employmentType: resolveEmploymentType(job.contractType, job.contractTime),
    remote: isRemote,
    city: isRemote ? '' : city || '',
    stateName,
    zipCode: job.postalCode || '',
    salaryMin: String(job.salaryMin ?? ''),
    salaryMax: String(job.salaryMax ?? ''),
    salaryPeriod: (job.salaryPeriod as 'year' | 'hour') || 'year',
    description: job.description,
    notificationEmail,
  }
  
  return <JobForm mode="edit" jobId={id} initialData={initialData} />
}