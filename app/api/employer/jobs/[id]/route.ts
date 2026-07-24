// app/api/employer/jobs/[id]/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

const ALLOWED_EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship']

const EMPLOYMENT_TYPE_MAP: Record<string, { contractType: string | null; contractTime: string | null }> = {
  'Full-time': { contractType: null, contractTime: 'full_time' },
  'Part-time': { contractType: null, contractTime: 'part_time' },
  'Contract': { contractType: 'contract', contractTime: null },
  'Temporary': { contractType: 'contract', contractTime: null },
  'Internship': { contractType: 'internship', contractTime: null },
}

function annualizedSalary(amount: number, period: 'year' | 'hour') {
  return period === 'hour' ? Math.round(amount * 2080) : amount
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

  const job = await getOwnedJob(id, user.id)
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()

  // Quick actions from the dashboard (pause / activate a listing)
  if (typeof body.action === 'string') {
    const { action } = body
    if (action !== 'pause' && action !== 'activate') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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

  if (typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'A job title is required.' }, { status: 400 })
  }
  if (typeof company !== 'string' || !company.trim()) {
    return NextResponse.json({ error: 'A company name is required.' }, { status: 400 })
  }
  if (!ALLOWED_EMPLOYMENT_TYPES.includes(employmentType)) {
    return NextResponse.json({ error: 'Invalid employment type.' }, { status: 400 })
  }
  if (!remote && (!city?.trim() || !state?.trim())) {
    return NextResponse.json({ error: 'A location is required for non-remote jobs.' }, { status: 400 })
  }
  if (!remote && (!zipCode?.trim() || !/^\d{5}(-\d{4})?$/.test(zipCode.trim()))) {
    return NextResponse.json({ error: 'A valid ZIP code is required for non-remote jobs.' }, { status: 400 })
  }
  if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin > salaryMax) {
    return NextResponse.json({ error: 'A valid salary range is required.' }, { status: 400 })
  }
  if (typeof description !== 'string' || description.trim().length < 50) {
    return NextResponse.json({ error: 'A description of at least 50 characters is required.' }, { status: 400 })
  }
  if (typeof notificationEmail !== 'string' || !/^\S+@\S+\.\S+$/.test(notificationEmail.trim())) {
    return NextResponse.json({ error: 'A valid notification email is required.' }, { status: 400 })
  }

  const { contractType, contractTime } = EMPLOYMENT_TYPE_MAP[employmentType]
  const salaryMinValue = Number(salaryMin)
  const salaryMaxValue = Number(salaryMax)

  const updated = await prisma.job.update({
    where: { id },
    data: {
      title: title.trim(),
      company: company.trim(),
      location: remote ? 'Remote' : `${city.trim()}, ${state.trim()}`,
      addressRegion: remote ? '' : state.trim(),
      postalCode: remote ? null : zipCode.trim(),
      salaryPeriod,
      description: description.trim(),
      applyUrl: `mailto:${notificationEmail.trim()}`,
      salaryMin: annualizedSalary(salaryMinValue, salaryPeriod),
      salaryMax: annualizedSalary(salaryMaxValue, salaryPeriod),
      salary: `$${salaryMinValue.toLocaleString()} - $${salaryMaxValue.toLocaleString()} ${salaryPeriod === 'hour' ? 'an hour' : 'a year'}`,
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

  const job = await getOwnedJob(id, user.id)
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.job.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}