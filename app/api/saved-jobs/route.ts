// app/api/saved-jobs/route.ts
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

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