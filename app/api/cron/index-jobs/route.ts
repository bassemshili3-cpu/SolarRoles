// app/api/cron/index-jobs/route.ts
// Sends ONLY Jooble, Lensa, and Careerjet job URLs to Google Indexing API
// Adzuna paused — no Adzuna API calls made here

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { google } from 'googleapis'

const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']
const BATCH_SIZE = 50 // Google Indexing API quota: 200 URLs/day on default tier

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ── Fetch recent Jooble/Lensa/Careerjet jobs that haven't been indexed ──
    const jobs = await prisma.job.findMany({
      where: {
        active: true,
        source: { in: ACTIVE_SOURCES },
        expiresAt: { gt: new Date() },
        // Add a field like 'googleIndexed' if you have one, otherwise use fetchedAt
        fetchedAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24h
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

    // ── Authenticate with Google Indexing API ──
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    })

    const authClient = await auth.getClient()
    const accessToken = await authClient.getAccessToken()

    // ── Submit each URL ──
    let submitted = 0
    let failed = 0
    const errors: string[] = []

    for (const job of jobs) {
      const url = `https://www.oh-my-job.com/jobs/${job.id}`

      try {
        const response = await fetch(
          'https://indexing.googleapis.com/v3/urlNotifications:publish',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken.token}`,
            },
            body: JSON.stringify({
              url,
              type: 'URL_UPDATED',
            }),
          }
        )

        if (response.ok) {
          submitted++
        } else {
          failed++
          const errText = await response.text()
          errors.push(`${job.id}: ${response.status} - ${errText.slice(0, 100)}`)
        }
      } catch (err: any) {
        failed++
        errors.push(`${job.id}: ${err.message}`)
      }

      // Rate limit: 200ms between requests
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    return NextResponse.json({
      success: true,
      totalJobs: jobs.length,
      submitted,
      failed,
      sources: [...new Set(jobs.map((j) => j.source))],
      errors: errors.slice(0, 5), // First 5 errors only
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