// app/api/saved-jobs/route.ts
import { createServerSupabase } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: savedRows, error } = await supabase
    .from('saved_jobs')
    .select('job_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const jobIds = (savedRows || []).map((s: any) => s.job_id as string)

  if (new URL(request.url).searchParams.get('idsOnly') === '1') {
    return NextResponse.json({ jobIds })
  }

  if (jobIds.length === 0) {
    return NextResponse.json({ jobs: [], savedAt: {} })
  }

  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds } },
    select: {
      id: true,
      title: true,
      company: true,
      location: true,
      salary: true,
      salaryMin: true,
      salaryMax: true,
      contractType: true,
      contractTime: true,
      postedAt: true,
      url: true,
      applyUrl: true,
    },
  })

  const savedAt: Record<string, string> = {}
  for (const s of savedRows || []) {
    savedAt[s.job_id] = s.created_at
  }

  const sorted = jobIds
    .map((id: string) => jobs.find(j => j.id === id))
    .filter(Boolean)

  return NextResponse.json({ jobs: sorted, savedAt })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { job_id } = await request.json()

  if (typeof job_id !== 'string' || !job_id.trim()) {
    return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
  }

  const job = await prisma.job.findUnique({ where: { id: job_id }, select: { id: true } })
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('saved_jobs')
    .insert({ user_id: user.id, job_id })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const job_id = searchParams.get('job_id')

  if (!job_id) {
    return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
  }

  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('user_id', user.id)
    .eq('job_id', job_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
