// app/jobs/[id]/go/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const job = await prisma.job.findUnique({
    where: { id },
    select: { applyUrl: true, active: true },
  })

  if (!job || !job.active || !job.applyUrl) {
    return NextResponse.redirect(new URL('/jobs', request.url))
  }

  // Fire-and-forget: on n'attend pas le résultat pour ne pas ralentir la redirection
  prisma.job.update({
    where: { id },
    data: { clickCount: { increment: 1 } },
  }).catch((err) => console.error('Click tracking error:', err))

  return NextResponse.redirect(job.applyUrl)
}