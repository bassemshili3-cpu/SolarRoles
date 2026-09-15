import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { getSolarMarketData } from '@/lib/solarMarketMetrics'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

function utcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')

  if (cronSecret && authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const market = await getSolarMarketData()
    const snapshotDate = utcDay()
    const snapshot = {
      totalJobs: market.totalJobs,
      employerCount: market.employerCount,
      metrics: market.metrics,
      activeJobIds: market.activeJobIds,
      employerCounts: market.employerCounts,
      stateCounts: market.stateCounts,
    }

    await prisma.marketSnapshot.upsert({
      where: { snapshotDate },
      create: { snapshotDate, ...snapshot },
      update: snapshot,
    })

    return NextResponse.json({
      ok: true,
      snapshotDate: snapshotDate.toISOString().slice(0, 10),
      totalJobs: market.totalJobs,
      employerCount: market.employerCount,
    })
  } catch (error) {
    console.error('Solar market snapshot error:', error)
    return NextResponse.json({ error: 'Unable to store solar market snapshot' }, { status: 500 })
  }
}
