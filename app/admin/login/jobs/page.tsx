import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import AdminJobsDashboard from './admin-jobs-dashboard'

export default async function AdminJobsPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin/login')

  const dbJobs = await prisma.job.findMany({
    where: { source: 'employer', deletedAt: null },
    orderBy: { fetchedAt: 'desc' },
    include: { _count: { select: { applications: true } } },
  })

  const jobs = dbJobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    postedAt: job.postedAt ?? job.fetchedAt,
    status: (job.pausedAt
      ? 'paused'
      : job.expiresAt < new Date()
        ? 'expired'
        : 'active') as 'active' | 'paused' | 'expired',
    clicks: job.clickCount,
    applications: job._count.applications,
  }))

  return <AdminJobsDashboard initialJobs={jobs} />
}