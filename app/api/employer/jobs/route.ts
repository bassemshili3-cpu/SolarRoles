import { validateEmployerJob } from '@/lib/employerJobValidation'
import { parseCompensation } from '@/lib/jobCompensation'
import { buildJobSlug } from '@/lib/slugify'
import { getCanonicalJobUrl } from '@/lib/job-url'
import { hasAccountPermission } from '@/lib/accountPermission'
// app/api/employer/jobs/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { sendJobPostedConfirmation } from '@/lib/sendJobPostedConfirmation'
import { customAlphabet } from 'nanoid'
import {
  hasPartnerAccess,
  PARTNER_ACTIVE_JOB_LIMIT,
  PARTNER_FEATURED_JOB_LIMIT,
} from '@/lib/employerBilling'



const EMPLOYMENT_TYPE_MAP: Record<string, { contractType: string | null; contractTime: string | null }> = {
  'Full-time': { contractType: null, contractTime: 'full_time' },
  'Part-time': { contractType: null, contractTime: 'part_time' },
  'Contract': { contractType: 'contract', contractTime: null },
  'Temporary': { contractType: 'contract', contractTime: null },
  'Internship': { contractType: 'internship', contractTime: null },
}


export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'You must be signed in to post a job.' }, { status: 401 })
  }
  if (!(await hasAccountPermission(supabase, user.id, 'employer'))) return NextResponse.json({ error: 'An employer account is required.' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  const {
    title, company, employmentType, remote, city, state, zipCode,
    salaryMin, salaryMax, salaryPeriod, description, notificationEmail,
    plan, featureWithPartner,
  } = body

  if (plan !== 'featured' && plan !== 'partner') {
    return NextResponse.json({ error: 'Choose a valid posting plan.' }, { status: 400 })
  }

  const validationError = validateEmployerJob(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })
  let compensation
  try { compensation = parseCompensation(body) } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid compensation.' }, { status: 400 })
  }


const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)
  const { contractType, contractTime } = EMPLOYMENT_TYPE_MAP[employmentType]
  const now = new Date()
  const subscription = await prisma.employerSubscription.findUnique({ where: { userId: user.id } })
  const partnerAccess = hasPartnerAccess(subscription)

  if (plan === 'partner' && !partnerAccess) {
    return NextResponse.json({ error: 'An active Hiring Partner subscription is required.' }, { status: 403 })
  }

  let partnerFeatured = false
  if (plan === 'partner') {
    const activeJobCount = await prisma.job.count({
      where: { postedByUserId: user.id, active: true, expiresAt: { gt: now } },
    })
    if (activeJobCount >= PARTNER_ACTIVE_JOB_LIMIT) {
      return NextResponse.json({ error: `Hiring Partner includes up to ${PARTNER_ACTIVE_JOB_LIMIT} active jobs.` }, { status: 409 })
    }

    if (featureWithPartner === true) {
      const featuredJobCount = await prisma.job.count({
        where: {
          postedByUserId: user.id,
          active: true,
          featured: true,
          featuredUntil: { gt: now },
        },
      })
      if (featuredJobCount >= PARTNER_FEATURED_JOB_LIMIT) {
        return NextResponse.json({ error: `Hiring Partner includes up to ${PARTNER_FEATURED_JOB_LIMIT} featured jobs.` }, { status: 409 })
      }
      partnerFeatured = true
    }
  }

let job
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = `employer-${nanoid()}`
    const canonicalJob = {
      id,
      title: title.trim(),
      location: remote ? 'Remote' : `${city.trim()}, ${state.trim()}`,
    }
    const canonicalSlug = buildJobSlug(canonicalJob)
    try {
      job = await prisma.job.create({
        data: {
          id,
          source: 'employer',
          title: title.trim(),
          company: company.trim(),
          location: remote ? 'Remote' : `${city.trim()}, ${state.trim()}`,
          workSetting: remote ? 'REMOTE' : 'ON_SITE',
          addressRegion: remote ? '' : state.trim(),
          postalCode: remote ? null : zipCode.trim(),
          description: description.trim(),
          canonicalSlug,
          url: getCanonicalJobUrl({ ...canonicalJob, canonicalSlug }),
          applyUrl: `mailto:${notificationEmail.trim()}`,
          ...compensation,
          contractType,
          contractTime,
          postedAt: plan === 'partner' ? now : null,
          expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          active: plan === 'partner',
          sourcePriority: 0,
          postedByUserId: user.id,
          featured: partnerFeatured,
          featuredUntil: partnerFeatured ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
          listingPlan: plan === 'partner' ? 'PARTNER' : 'FEATURED',
          paymentStatus: plan === 'partner' ? 'included' : 'pending',
        },
      })
      break
    } catch (err: any) {
      if (err?.code === 'P2002' && attempt < 2) continue // collision d'ID, on retente
      throw err
    }
  }

  if (!job) {
    return NextResponse.json({ error: 'Could not create job. Try again.' }, { status: 500 })
  }

  if (plan === 'partner') {
    await sendJobPostedConfirmation({
      employerEmail: notificationEmail.trim(),
      jobTitle: job.title,
      jobUrl: job.url,
      expiresAt: job.expiresAt,
    })
  }

  return NextResponse.json({
    id: job.id,
    requiresCheckout: plan === 'featured',
  }, { status: 201 })

 
}
