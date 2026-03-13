// app/api/cron/index-jobs/route.ts
// ─── Cron Job : soumettre automatiquement les nouveaux jobs à Google ─────────
//
// Appeler via Vercel Cron (vercel.json) toutes les heures :
//   { "crons": [{ "path": "/api/cron/index-jobs", "schedule": "0 * * * *" }] }
//
// Ce cron :
//   1. Récupère les dernières offres Adzuna (les plus récentes)
//   2. Envoie leurs URLs à l'API d'indexation Google
//   3. Log les résultats
//
// Quota Google : 200 URLs/jour → avec un cron toutes les heures,
// on envoie ~8 URLs par heure max pour rester dans les limites.

import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '@/lib/adzuna'
import { notifyGoogleBatch } from '@/lib/google-indexing'

const BASE_URL = 'https://www.oh-my-job.com'
const MAX_URLS_PER_RUN = 8 // 8 × 24h = 192/jour (sous la limite de 200)

export async function GET(req: NextRequest) {
  // ─── Sécurité : vérifie le header Vercel Cron ─────────────────────────────
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // En production, Vercel envoie automatiquement le CRON_SECRET
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

    // ─── Construit les URLs ──────────────────────────────────────────────────
    const urls = data.results.map((job: any) => ({
      url: `${BASE_URL}/jobs/adzuna-${job.id}`,
      action: 'URL_UPDATED' as const,
    }))

    console.log(`📡 Soumission de ${urls.length} URLs à Google Indexing API`)

    // ─── Envoi à Google ──────────────────────────────────────────────────────
    const results = await notifyGoogleBatch(urls)

    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log(`📊 Résultats : ${succeeded} OK, ${failed} échoués`)
    console.log('🕐 === CRON INDEX-JOBS END ===')

    return NextResponse.json({
      message: `Submitted ${urls.length} URLs`,
      succeeded,
      failed,
      results: results.map((r) => ({ url: r.url, success: r.success, error: r.error })),
    })
  } catch (error: any) {
    console.error('💥 Cron index-jobs error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}