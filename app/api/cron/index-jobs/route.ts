// app/api/cron/index-jobs/route.ts
// Sends ONLY Jooble, Lensa, and Careerjet job URLs to Google Indexing API
// Adzuna paused — no Adzuna API calls made here

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyGoogleBatch } from '@/lib/google-indexing'

const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']
const BATCH_SIZE = 50

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const jobs = await prisma.job.findMany({
      where: {
        active: true,
        source: { in: ACTIVE_SOURCES },
        expiresAt: { gt: new Date() },
        fetchedAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { fetchedAt: 'desc' },
      take: BATCH_SIZE,
      select: {
        id: true,
        title: true,
        source: true,
      },
    })

    if (jobs.length === 0) {
      return NextResponse.json({
        message: 'No new jobs to index',
        timestamp: new Date().toISOString(),
      })
    }

    const items = jobs.map((j) => ({
      url: `https://www.oh-my-job.com/jobs/${j.id}`,
      action: 'URL_UPDATED' as const,
    }))

    const results = await notifyGoogleBatch(items)
    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      totalJobs: jobs.length,
      submitted: results.length,
      succeeded,
      failed,
      sources: [...new Set(jobs.map((j) => j.source))],
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Index jobs cron error:', error.message)
    return NextResponse.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}