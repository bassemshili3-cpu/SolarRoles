// app/api/employer/jobs/route.ts
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createServerSupabase } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

const ALLOWED_EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship']

// Mirrors the contractType / contractTime split already used for aggregated
// (Adzuna-style) jobs. Check lib/job-where.ts to confirm these values match
// what your filters expect before relying on this mapping.
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
const { title, company, employmentType, remote, city, state, salaryMin, salaryMax, salaryPeriod, description, notificationEmail } = body


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
  if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin > salaryMax) {
    return NextResponse.json({ error: 'A valid salary range is required.' }, { status: 400 })
  }
  if (typeof description !== 'string' || description.trim().length < 50) {
    return NextResponse.json({ error: 'A description of at least 50 characters is required.' }, { status: 400 })
  }
 if (typeof notificationEmail !== 'string' || !/^\S+@\S+\.\S+$/.test(notificationEmail.trim())) {
  return NextResponse.json({ error: 'A valid notification email is required.' }, { status: 400 })
}

  const id = `employer-${randomUUID()}`
  const { contractType, contractTime } = EMPLOYMENT_TYPE_MAP[employmentType]
  const salaryMinValue = Number(salaryMin)
  const salaryMaxValue = Number(salaryMax)

  const job = await prisma.job.create({
    data: {
      id,
      source: 'employer',
      title: title.trim(),
      company: company.trim(),
      location: remote ? 'Remote' : `${city.trim()}, ${state.trim()}`,
      addressRegion: remote ? '' : state.trim(),
      description: description.trim(),
      url: `https://www.oh-my-job.com/jobs/${id}`,
      applyUrl: `mailto:${notificationEmail.trim()}`,
      salaryMin: annualizedSalary(salaryMinValue, salaryPeriod),
      salaryMax: annualizedSalary(salaryMaxValue, salaryPeriod),
      salary: `$${salaryMinValue.toLocaleString()} - $${salaryMaxValue.toLocaleString()} ${salaryPeriod === 'hour' ? 'an hour' : 'a year'}`,
      contractType,
      contractTime,
      postedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // matches the "30 days" promise on /post-a-job-free
      active: true,
      sourcePriority: 0, // first-party listings ranked above aggregated ones, adjust if you'd rather not
      postedByUserId: user.id,
    },
  })

  return NextResponse.json({ id: job.id }, { status: 201 })
}