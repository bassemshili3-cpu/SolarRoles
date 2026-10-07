import { validateEmployerJob } from '@/lib/employerJobValidation'
import { parseCompensation } from '@/lib/jobCompensation'
import { getCanonicalJobSlug } from '@/lib/slugify'
import { getCanonicalJobUrl } from '@/lib/job-url'
import { hasAccountPermission } from '@/lib/accountPermission'
// app/api/employer/jobs/[id]/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { hasPartnerAccess, PARTNER_ACTIVE_JOB_LIMIT } from '@/lib/employerBilling'
import { getStripe } from '@/lib/stripe'


const EMPLOYMENT_TYPE_MAP: Record<string, { contractType: string | null; contractTime: string | null }> = {
  'Full-time': { contractType: null, contractTime: 'full_time' },
  'Part-time': { contractType: null, contractTime: 'part_time' },
  'Contract': { contractType: 'contract', contractTime: null },
  'Temporary': { contractType: 'contract', contractTime: null },
  'Internship': { contractType: 'internship', contractTime: null },
}


async function getOwnedJob(id: string, userId: string) {
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job || job.postedByUserId !== userId) return null
  return job
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await hasAccountPermission(supabase, user.id, 'employer'))) return NextResponse.json({ error: 'An employer account is required.' }, { status: 403 })

  const job = await getOwnedJob(id, user.id)
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  // Quick actions from the dashboard (pause / activate a listing)
  if (typeof body.action === 'string') {
    const { action } = body
    if (action !== 'pause' && action !== 'activate') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (action === 'activate' && job.paymentStatus !== 'paid' && job.paymentStatus !== 'included' && job.paymentStatus !== 'not_required') {
      return NextResponse.json({ error: 'This listing cannot be activated before payment is confirmed.' }, { status: 402 })
    }

    if (action === 'activate' && job.listingPlan === 'PARTNER') {
      const subscription = await prisma.employerSubscription.findUnique({ where: { userId: user.id } })
      if (!hasPartnerAccess(subscription)) {
        return NextResponse.json({ error: 'An active Hiring Partner subscription is required.' }, { status: 403 })
      }
      const activeJobCount = await prisma.job.count({
        where: { postedByUserId: user.id, active: true, expiresAt: { gt: new Date() } },
      })
      if (activeJobCount >= PARTNER_ACTIVE_JOB_LIMIT) {
        return NextResponse.json({ error: `Hiring Partner includes up to ${PARTNER_ACTIVE_JOB_LIMIT} active jobs.` }, { status: 409 })
      }
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        pausedAt: action === 'pause' ? new Date() : null,
        active: action === 'pause' ? false : true,
      },
    })

    return NextResponse.json({ ok: true, pausedAt: updated.pausedAt })
  }

  // Full edit from the job form
  const {
    title, company, employmentType, remote, city, state, zipCode,
    salaryMin, salaryMax, salaryPeriod, description, notificationEmail,
  } = body

  const validationError = validateEmployerJob(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  let compensation
  try { compensation = parseCompensation(body) } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid compensation.' }, { status: 400 })
  }


  const { contractType, contractTime } = EMPLOYMENT_TYPE_MAP[employmentType]
  // Freeze the existing URL even when a legacy employer offer has no stored slug.
  const canonicalSlug = getCanonicalJobSlug(job)
  const canonicalUrl = getCanonicalJobUrl({ ...job, canonicalSlug })

  const updated = await prisma.job.update({
    where: { id },
    data: {
      canonicalSlug,
      url: canonicalUrl,
      title: title.trim(),
      company: company.trim(),
      location: remote ? 'Remote' : `${city.trim()}, ${state.trim()}`,
          workSetting: remote ? 'REMOTE' : 'ON_SITE',
      addressRegion: remote ? '' : state.trim(),
      postalCode: remote ? null : zipCode.trim(),
      description: description.trim(),
      applyUrl: `mailto:${notificationEmail.trim()}`,
          ...compensation,
      contractType,
      contractTime,
    },
  })

  return NextResponse.json({ id: updated.id })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await hasAccountPermission(supabase, user.id, 'employer'))) return NextResponse.json({ error: 'An employer account is required.' }, { status: 403 })

  const job = await getOwnedJob(id, user.id)
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (job.paymentStatus === 'pending' && job.stripeCheckoutId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(job.stripeCheckoutId)
      if (session.status === 'complete') {
        return NextResponse.json(
          { error: 'Stripe is still confirming this payment. This draft cannot be deleted yet.' },
          { status: 409 },
        )
      }
      if (session.status === 'open') {
        await getStripe().checkout.sessions.expire(session.id)
      }
    } catch (error) {
      console.error(`Could not close Stripe Checkout for job ${id}:`, error)
      return NextResponse.json({ error: 'Could not safely delete this paid draft. Try again shortly.' }, { status: 502 })
    }
  }

  await prisma.job.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
