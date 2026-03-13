// app/api/indexing/route.ts
// ─── API Route pour Google Indexing ──────────────────────────────────────────
//
// POST /api/indexing
//   Body: { urls: ["https://www.oh-my-job.com/jobs/adzuna-12345"], action: "URL_UPDATED" }
//   → Notifie Google pour chaque URL
//
// Sécurisé par un token secret (INDEXING_API_SECRET) pour éviter les abus.
// Tu peux appeler cette route depuis :
//   - Ton cron Vercel (quand de nouveaux jobs arrivent)
//   - Manuellement via curl ou Postman
//   - Un webhook depuis ton système de jobs

import { NextRequest, NextResponse } from 'next/server'
import { notifyGoogleBatch, IndexingAction } from '@/lib/google-indexing'

const BASE_URL = 'https://www.oh-my-job.com'

export async function POST(req: NextRequest) {
  // ─── Auth check ───────────────────────────────────────────────────────────
  const secret = req.headers.get('x-api-secret') || req.headers.get('authorization')?.replace('Bearer ', '')

  if (!process.env.INDEXING_API_SECRET) {
    return NextResponse.json({ error: 'INDEXING_API_SECRET not configured on server' }, { status: 500 })
  }

  if (secret !== process.env.INDEXING_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ─── Parse body ───────────────────────────────────────────────────────────
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { urls, action = 'URL_UPDATED' } = body

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { error: 'Missing or empty "urls" array. Example: { "urls": ["/jobs/adzuna-123"], "action": "URL_UPDATED" }' },
      { status: 400 }
    )
  }

  if (!['URL_UPDATED', 'URL_DELETED'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "URL_UPDATED" or "URL_DELETED"' },
      { status: 400 }
    )
  }

  // ─── Limite de sécurité (200/jour max côté Google) ────────────────────────
  if (urls.length > 200) {
    return NextResponse.json(
      { error: `Too many URLs (${urls.length}). Google allows max 200/day.` },
      { status: 400 }
    )
  }

  // ─── Normalise les URLs (ajoute le domaine si chemin relatif) ─────────────
  const fullUrls = urls.map((u: string) =>
    u.startsWith('http') ? u : `${BASE_URL}${u.startsWith('/') ? u : `/${u}`}`
  )

  // ─── Envoi à Google ───────────────────────────────────────────────────────
  console.log(`📡 Indexing API: sending ${fullUrls.length} URLs with action ${action}`)

  const results = await notifyGoogleBatch(
    fullUrls.map((url: string) => ({ url, action: action as IndexingAction }))
  )

  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`📊 Indexing results: ${succeeded} succeeded, ${failed} failed`)

  return NextResponse.json({
    total: results.length,
    succeeded,
    failed,
    results,
  })
}