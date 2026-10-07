import { prisma } from '@/lib/prisma'
import { getCanonicalJobPath } from '@/lib/job-url'
import { isJobAvailable } from '@/lib/job-availability'

export const dynamic = 'force-dynamic'

// Historical short URLs are resolved before React rendering or streaming.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const job = await prisma.job.findUnique({
    where: { id },
    select: { id: true, title: true, location: true, canonicalSlug: true, active: true, expiresAt: true },
  })
  if (!job || !isJobAvailable(job)) {
    return new Response('Job not found', {
      status: 404,
      headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' },
    })
  }
  return new Response(null, {
    status: 308,
    headers: { Location: getCanonicalJobPath(job), 'Cache-Control': 'no-store' },
  })
}

export const HEAD = GET
