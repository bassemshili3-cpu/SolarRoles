// app/dashboard/employer/new/page.tsx
import { redirect } from 'next/navigation'

import { hasPartnerAccess, PARTNER_FEATURED_JOB_LIMIT } from '@/lib/employerBilling'
import { prisma } from '@/lib/prisma'
import { createServerSupabase } from '@/lib/supabase-server'
import JobForm from '../job-form'

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan: requestedPlan } = await searchParams
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const planQuery = requestedPlan === 'partner' ? '?plan=partner' : '?plan=featured'
    redirect(`/auth/login?redirectTo=${encodeURIComponent(`/dashboard/employer/new${planQuery}`)}`)
  }

  const subscription = await prisma.employerSubscription.findUnique({ where: { userId: user.id } })
  const partnerAccess = hasPartnerAccess(subscription)
  if (requestedPlan === 'partner' && !partnerAccess) {
    redirect('/dashboard/employer?upgrade=partner')
  }

  const plan = partnerAccess && requestedPlan !== 'featured' ? 'partner' : 'featured'
  const activeFeaturedJobs = partnerAccess
    ? await prisma.job.count({
        where: {
          postedByUserId: user.id,
          active: true,
          featured: true,
          featuredUntil: { gt: new Date() },
        },
      })
    : 0

  return (
    <JobForm
      mode="create"
      plan={plan}
      partnerFeaturedRemaining={Math.max(0, PARTNER_FEATURED_JOB_LIMIT - activeFeaturedJobs)}
    />
  )
}
