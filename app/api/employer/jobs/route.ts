// app/api/employer/jobs/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { sendJobPostedConfirmation } from '@/lib/sendJobPostedConfirmation'
import { customAlphabet } from 'nanoid'


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

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'You must be signed in to post a job.' }, { status: 401 })
  }

  const body = await request.json()
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

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)
  const { contractType, contractTime } = EMPLOYMENT_TYPE_MAP[employmentType]
  const salaryMinValue = Number(salaryMin)
  const salaryMaxValue = Number(salaryMax)

let job
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = `employer-${nanoid()}`
    try {
      job = await prisma.job.create({
        data: {
          id,
          source: 'employer',
          title: title.trim(),
          company: company.trim(),
          location: remote ? 'Remote' : `${city.trim()}, ${state.trim()}`,
          addressRegion: remote ? '' : state.trim(),
          postalCode: remote ? null : zipCode.trim(),
          salaryPeriod,
          description: description.trim(),
          url: `https://www.oh-my-job.com/jobs/${id}`,
          applyUrl: `mailto:${notificationEmail.trim()}`,
          salaryMin: annualizedSalary(salaryMinValue, salaryPeriod),
          salaryMax: annualizedSalary(salaryMaxValue, salaryPeriod),
          salary: `$${salaryMinValue.toLocaleString()} - $${salaryMaxValue.toLocaleString()} ${salaryPeriod === 'hour' ? 'an hour' : 'a year'}`,
          contractType,
          contractTime,
          postedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          active: true,
          sourcePriority: 0,
          postedByUserId: user.id,
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

  await sendJobPostedConfirmation({
    employerEmail: notificationEmail.trim(),
    jobTitle: job.title,
    jobUrl: job.url,
    expiresAt: job.expiresAt,
  })

  return NextResponse.json({ id: job.id }, { status: 201 })

 
}