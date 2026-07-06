// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// Ne matche que /jobs/[id] — un seul segment après /jobs.
// Ne matche PAS /jobs (page de recherche/listing).
export const config = {
  matcher: '/jobs/:id',
}

const sql = neon(process.env.DATABASE_URL!)

export async function middleware(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop()
  if (!id) return NextResponse.next()

  try {
    const rows = await sql`
      SELECT "active", "expiresAt" FROM "Job" WHERE id = ${id} LIMIT 1
    `
    const job = rows[0] as { active: boolean; expiresAt: string | null } | undefined

    const isGone =
      !job ||
      job.active === false ||
      (job.expiresAt !== null && new Date(job.expiresAt) < new Date())

    if (isGone) {
      return new NextResponse(GONE_HTML, {
        status: 410,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex',
        },
      })
    }
  } catch (error) {
    // En cas d'erreur DB (cold start, timeout réseau...), on laisse
    // passer vers la page normale plutôt que de bloquer l'utilisateur —
    // page.tsx refera de toute façon sa propre vérification via Prisma.
    console.error('Middleware job-gone check failed:', error)
  }

  return NextResponse.next()
}

const GONE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Job no longer available | Oh My Job</title>
  <meta name="robots" content="noindex" />
</head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 80px auto; text-align: center; color: #334155;">
  <h1 style="font-size: 24px;">This job posting is no longer available</h1>
  <p>It may have expired or been filled.</p>
  <a href="/jobs" style="color: #2563eb; text-decoration: underline;">Browse current job openings →</a>
</body>
</html>`