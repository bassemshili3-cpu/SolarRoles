import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { action } = await request.json()

  try {
    if (action === 'pause') {
      await prisma.job.update({ where: { id }, data: { pausedAt: new Date() } })
    } else if (action === 'activate') {
      await prisma.job.update({ where: { id }, data: { pausedAt: null } })
    } else if (action === 'approve') {
      await prisma.job.update({
        where: { id },
        data: { flaggedAt: null, flagReasons: [] },
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin job update error:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.job.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin job delete error:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}