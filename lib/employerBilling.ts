export const PARTNER_ACTIVE_STATUSES = ['active', 'trialing'] as const
export const PARTNER_ACTIVE_JOB_LIMIT = 10
export const PARTNER_FEATURED_JOB_LIMIT = 3

export function hasPartnerAccess(subscription: { plan: string; status: string } | null | undefined) {
  return Boolean(
    subscription?.plan === 'PARTNER' &&
    PARTNER_ACTIVE_STATUSES.includes(subscription.status as (typeof PARTNER_ACTIVE_STATUSES)[number]),
  )
}

export function isCurrentlyFeatured(job: {
  featured: boolean
  featuredUntil: Date | null
}, now = new Date()) {
  return job.featured && Boolean(job.featuredUntil && job.featuredUntil > now)
}
