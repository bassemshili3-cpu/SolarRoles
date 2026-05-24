// app/api/saved-jobs/route.ts
import { createClient } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { job_id } = await request.json()

  const { error } = await supabase
    .from('saved_jobs')
    .insert({ user_id: user.id, job_id })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const job_id = searchParams.get('job_id')

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