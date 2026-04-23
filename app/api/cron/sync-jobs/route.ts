// app/api/cron/sync-jobs/route.ts
// ─── Cron Job : Sync Jooble → DB → Google Indexing + IndexNow ───────────────
//
// Flow:
//   1. Fetch Jooble jobs (rotates through keyword pool)
//   2. Upsert into PostgreSQL (Prisma)
//   3. Fetch active URLs from DB
//   4. Submit to Google Indexing API + IndexNow (Bing/Yandex)
//
// Adzuna partnership paused.
// Careerjet has its own dedicated cron (sync-careerjet).
//
// Schedule: hourly via vercel.json
//   { "path": "/api/cron/sync-jobs", "schedule": "0 * * * *" }

import { NextRequest, NextResponse } from 'next/server'
import { syncAllJobs } from '@/lib/job-sync'
import { getActiveJobUrls } from '@/lib/job-db'
import { notifyGoogleBatch } from '@/lib/google-indexing'
import { submitToIndexNow } from '@/lib/indexnow'

const MAX_GOOGLE_URLS = 16 // ~16/h × 24h = ~384/day (adjust based on quota)

export async function GET(req: NextRequest) {
  // ─── Security ──────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🕐 === CRON SYNC-JOBS START ===')

  try {
    // ─── Step 1: Sync APIs → DB ─────────────────────────────────────────
    // Rotate through the keyword pool using current hour
    // With 50+ keywords and 8 per run, you cover the full pool every ~6-7 runs
    const currentHour = new Date().getUTCHours()
    const page = currentHour + 1 // 1 to 24, ensures rotation across the day

    console.log(`📥 Syncing Jooble (rotation page ${page})...`)
    const syncResult = await syncAllJobs(page, 50)

    console.log(`📊 Sync results:`)
    console.log(`   Jooble: ${syncResult.jooble.fetched} fetched, ${syncResult.jooble.saved} saved (${syncResult.jooble.queriesRun} queries)`)
    console.log(`   Expired: ${syncResult.expired} deactivated`)

    // ─── Step 2: Get URLs to index from DB ───────────────────────────────
    const urls = await getActiveJobUrls(MAX_GOOGLE_URLS)

    if (urls.length === 0) {
      console.log('⚠️ No active URLs to submit')
      return NextResponse.json({ message: 'Sync done, no URLs to index', syncResult })
    }

    // ─── Step 3: IndexNow (Bing/Yandex) — no quota ─────────────────────
    const indexNowResult = await submitToIndexNow(urls)
    console.log(`🔔 IndexNow: ${indexNowResult.success ? 'OK' : 'Failed'} (${urls.length} URLs)`)

    // ─── Step 4: Google Indexing API — limited quota ────────────────────
    const googleUrls = urls.slice(0, MAX_GOOGLE_URLS).map((url) => ({
      url,
      action: 'URL_UPDATED' as const,
    }))

    console.log(`📡 Google Indexing: submitting ${googleUrls.length} URLs`)
    const googleResults = await notifyGoogleBatch(googleUrls)

    const succeeded = googleResults.filter((r) => r.success).length
    const failed = googleResults.filter((r) => !r.success).length

    console.log(`📊 Google: ${succeeded} OK, ${failed} failed`)
    console.log('🕐 === CRON SYNC-JOBS END ===')

    return NextResponse.json({
      message: 'Sync + indexing complete',
      sync: {
        jooble: syncResult.jooble,
        expired: syncResult.expired,
      },
      indexing: {
        indexNow: { submitted: urls.length, success: indexNowResult.success },
        google: { submitted: googleUrls.length, succeeded, failed },
      },
    })
  } catch (error: any) {
    console.error('💥 Cron sync-jobs error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}