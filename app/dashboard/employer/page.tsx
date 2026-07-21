// app/dashboard/employer/page.tsx
import { prisma } from '@/lib/prisma'
import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { deriveStatus } from '@/lib/employerJobStatus'
import EmployerDashboard from './employer-dashboard'

export default async function EmployerDashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/dashboard/employer')

  const jobs = await prisma.job.findMany({
    where: { postedByUserId: user.id },
    orderBy: { postedAt: 'desc' },
  })

  const mappedJobs = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    postedAt: job.postedAt ?? job.fetchedAt,
    status: deriveStatus(job),
    clicks: job.clickCount,
    applications: 0,
  }))

  return <EmployerDashboard initialJobs={mappedJobs} />
}