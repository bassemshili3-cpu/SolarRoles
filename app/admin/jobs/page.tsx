import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import AdminJobsDashboard from './admin-jobs-dashboard'

type JobStatus = 'active' | 'paused' | 'expired' | 'flagged'

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
    status: (job.flaggedAt
      ? 'flagged'
      : job.pausedAt
        ? 'paused'
        : job.expiresAt < new Date()
          ? 'expired'
          : 'active') as JobStatus,
    clicks: job.clickCount,
    applications: job._count.applications,
    flagReasons: job.flagReasons ?? undefined,
  }))

  return <AdminJobsDashboard initialJobs={jobs} />
}