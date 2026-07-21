// app/api/employer/jobs/[id]/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

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

  const { action } = await request.json()
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