// app/jobs/[id]/go/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isJobAvailable } from '@/lib/job-availability'

async function redirectToApplication(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const job = await prisma.job.findUnique({
    where: { id },
    select: { applyUrl: true, active: true, expiresAt: true },
  })

  const response = NextResponse.redirect(
    job && isJobAvailable(job) && job.applyUrl
      ? job.applyUrl
      : new URL('/jobs', request.url),
  )
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('Cache-Control', 'private, no-store')

  // Fire-and-forget: on n'attend pas le résultat pour ne pas ralentir la redirection
  const purpose = `${request.headers.get('purpose') || ''} ${request.headers.get('sec-purpose') || ''}`
  if (job && isJobAvailable(job) && job.applyUrl && request.method === 'GET' && !/prefetch|prerender/i.test(purpose)) {
    prisma.job.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    }).catch((err) => console.error('Click tracking error:', err))
  }

  return response
}

export const GET = redirectToApplication
export const HEAD = redirectToApplication
