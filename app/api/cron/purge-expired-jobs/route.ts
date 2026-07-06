// app/api/cron/purge-expired-jobs/route.ts
// ─── Suppression définitive, APRÈS un délai de grâce depuis la désactivation ──
// Le délai laisse le temps à Google/Bing d'avoir traité la notification
// URL_DELETED envoyée par mark-expired-jobs avant de retirer la ligne pour de bon.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const GRACE_PERIOD_DAYS = 14

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const graceCutoff = new Date(Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)

  const deleted = await prisma.job.deleteMany({
    where: {
      active: false,
      // On ne purge que ce qui est inactif depuis au moins GRACE_PERIOD_DAYS,
      // en s'appuyant sur fetchedAt comme proxy du moment de désactivation
      // (dernière fois que ce job a été touché par un cron)
      fetchedAt: { lt: graceCutoff },
    },
  })

  return NextResponse.json({
    deleted: deleted.count,
    gracePeriodDays: GRACE_PERIOD_DAYS,
    timestamp: new Date().toISOString(),
  })
}