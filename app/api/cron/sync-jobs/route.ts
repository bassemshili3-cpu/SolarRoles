// app/api/cron/sync-jobs/route.ts
// ─── Cron Job v2 : Sync → DB → Google Indexing + IndexNow ───────────────────
//
// Nouveau flow :
//   1. Fetch les jobs depuis Adzuna + Jooble
//   2. Upsert en base PostgreSQL (Prisma)
//   3. Récupère les URLs actives depuis la base
//   4. Soumet à Google Indexing API + IndexNow (Bing/Yandex)
//
// Fini les 404 : Googlebot trouve toujours une page valide puisque
// les données sont servies depuis la base, pas depuis un cache volatile.
//
// Schedule : toutes les heures via vercel.json
//   { "crons": [{ "path": "/api/cron/sync-jobs", "schedule": "0 * * * *" }] }

import { NextRequest, NextResponse } from 'next/server'
import { syncAllJobs } from '@/lib/job-sync'
import { getActiveJobUrls } from '@/lib/job-db'
import { notifyGoogleBatch } from '@/lib/google-indexing'
import { submitToIndexNow } from '@/lib/indexnow'

const MAX_GOOGLE_URLS = 16 // ~16/h × 24h = 384/jour (sous quota 200... on ajustera)

export async function GET(req: NextRequest) {
  // ─── Sécurité ──────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🕐 === CRON SYNC-JOBS START ===')

  try {
    // ─── Étape 1 : Sync APIs → Base ─────────────────────────────────────────
    const currentHour = new Date().getUTCHours()
    const page = (currentHour % 12) + 1 // rotation des pages

    console.log(`📥 Syncing page ${page} from APIs...`)
    const syncResult = await syncAllJobs(page, 50)

    console.log(`📊 Sync results:`)
    console.log(`   Adzuna: ${syncResult.adzuna.fetched} fetched, ${syncResult.adzuna.saved} saved`)
    console.log(`   Jooble: ${syncResult.jooble.fetched} fetched, ${syncResult.jooble.saved} saved`)
    console.log(`   Expired: ${syncResult.expired} deactivated`)

    // ─── Étape 2 : Récupère les URLs à indexer depuis la base ────────────────
    const urls = await getActiveJobUrls(MAX_GOOGLE_URLS)

    if (urls.length === 0) {
      console.log('⚠️ Aucune URL active à soumettre')
      return NextResponse.json({ message: 'Sync done, no URLs to index', syncResult })
    }

    // ─── Étape 3 : IndexNow (Bing/Yandex) — pas de quota ────────────────────
    const indexNowResult = await submitToIndexNow(urls)
    console.log(`🔔 IndexNow: ${indexNowResult.success ? 'OK' : 'Failed'} (${urls.length} URLs)`)

    // ─── Étape 4 : Google Indexing API — quota limité ────────────────────────
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
        adzuna: syncResult.adzuna,
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