// app/api/cron/index-jobs/route.ts
// ─── Cron Job : soumettre automatiquement les nouveaux jobs à Google ─────────
//
// Appeler via Vercel Cron (vercel.json) toutes les heures :
//   { "crons": [{ "path": "/api/cron/index-jobs", "schedule": "0 * * * *" }] }
//
// Ce cron :
//   1. Récupère les dernières offres Adzuna (les plus récentes)
//   2. Vérifie que chaque page existe (200) avant de la soumettre
//   3. Envoie les URLs valides à l'API d'indexation Google
//   4. Log les résultats
//
// Quota Google : 200 URLs/jour → avec un cron toutes les heures,
// on envoie ~8 URLs par heure max pour rester dans les limites.

import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '@/lib/adzuna'
import { notifyGoogleBatch } from '@/lib/google-indexing'
import { submitToIndexNow } from '@/lib/indexnow'

const BASE_URL = 'https://www.oh-my-job.com'
const MAX_URLS_PER_RUN = 16 // 16 × 24h = 384/jour (sous la limite de 400)

async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return res.status === 200
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  // ─── Sécurité : vérifie le header Vercel Cron ─────────────────────────────
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🕐 === CRON INDEX-JOBS START ===')

  try {
    // ─── Récupère les dernières offres ────────────────────────────────────────
    const data = await searchJobs({
      what: '',
      where: '',
      results_per_page: MAX_URLS_PER_RUN,
      page: 1,
    })

    if (!data.results || data.results.length === 0) {
      console.log('⚠️ Aucun job récent trouvé')
      return NextResponse.json({ message: 'No recent jobs found', submitted: 0 })
    }

    // ─── Construit les URLs et vérifie qu'elles existent ─────────────────────
    const candidates = data.results.map((job: any) => `${BASE_URL}/jobs/adzuna-${job.id}`)

    console.log(`🔍 Vérification de ${candidates.length} URLs...`)

    const checks = await Promise.all(
      candidates.map(async (url: string) => ({
        url,
        alive: await checkUrlExists(url),
      }))
    )

    const alive = checks.filter((c) => c.alive)
    const dead = checks.filter((c) => !c.alive)

    console.log(`✅ ${alive.length} pages OK, ❌ ${dead.length} pages 404 (skipped)`)

    if (dead.length > 0) {
      console.log('🗑️ URLs skipped (404):', dead.map((d) => d.url).join(', '))
    }

    if (alive.length === 0) {
      console.log('⚠️ Aucune URL valide à soumettre')
      return NextResponse.json({
        message: 'No valid URLs to submit',
        checked: candidates.length,
        alive: 0,
        dead: dead.length,
      })
    }

    // ─── Envoi à IndexNow (Bing, Yandex) ──────────────────────────────
const aliveUrls = alive.map((c) => c.url)
const indexNowResult = await submitToIndexNow(aliveUrls)
console.log(`🔔 IndexNow: ${indexNowResult.success ? 'OK' : 'Failed'}`)

    // ─── Envoi à Google (uniquement les URLs vivantes) ───────────────────────
    const urls = alive.map((c) => ({
      url: c.url,
      action: 'URL_UPDATED' as const,
    }))

    console.log(`📡 Soumission de ${urls.length} URLs à Google Indexing API`)

    const results = await notifyGoogleBatch(urls)

    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log(`📊 Résultats : ${succeeded} OK, ${failed} échoués`)
    console.log('🕐 === CRON INDEX-JOBS END ===')

    return NextResponse.json({
      message: `Checked ${candidates.length}, submitted ${urls.length} URLs`,
      checked: candidates.length,
      alive: alive.length,
      dead: dead.length,
      succeeded,
      failed,
      results: results.map((r) => ({ url: r.url, success: r.success, error: r.error })),
    })
  } catch (error: any) {
    console.error('💥 Cron index-jobs error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

