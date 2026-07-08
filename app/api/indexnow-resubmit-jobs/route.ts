// app/api/indexnow-resubmit-jobs/route.ts
// Ping IndexNow en masse sur toutes les pages job actuellement actives.
// À utiliser après un changement structurel du template /jobs/[id]
// (nouveau bloc, nouvelle section...), pas à chaque sync régulière.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { submitAllToIndexNow } from '@/lib/indexnow'

const BASE_URL = 'https://www.oh-my-job.com'

// Même fenêtre que le sitemap : on ne pingue que ce qui est réellement
// listé/visible, pas les vieilles offres en train d'expirer.
function getJobCutoff(): Date {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  return cutoff
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const jobs = await prisma.job.findMany({
    where: {
      active: true,
      expiresAt: { gt: new Date() },
      fetchedAt: { gt: getJobCutoff() },
    },
    select: { id: true },
  })

  const urls = jobs.map((job) => `${BASE_URL}/jobs/${job.id}`)

  if (urls.length === 0) {
    return NextResponse.json({ success: true, totalUrls: 0, submitted: 0, failed: 0, batches: 0 })
  }

  const result = await submitAllToIndexNow(urls)

  return NextResponse.json({
    success: result.success,
    totalUrls: urls.length,
    submitted: result.submitted,
    failed: result.failed,
    batches: result.batches,
  })
}