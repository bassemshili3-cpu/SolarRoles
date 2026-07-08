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
//
// ─── Filtre qualité ───────────────────────────────────────────────────────────
// Endpoint générique = appelé par différentes sources dans le temps, qui ne
// filtrent pas forcément en amont. Pour éviter de pousser du thin content
// à Google (peu importe qui appelle cette route), chaque URL de type
// /jobs/[id] est re-vérifiée ici : le job doit être actif ET avoir une
// description suffisante. Les URLs qui ne matchent pas ce pattern (pages
// /data/states, /data/salaries, etc.) passent sans ce filtre spécifique.

import { NextRequest, NextResponse } from 'next/server'
import { notifyGoogleBatch, IndexingAction } from '@/lib/google-indexing'
import { prisma } from '@/lib/prisma'
import { hasEnoughDescriptionContent } from '@/lib/description-quality'

const BASE_URL = 'https://www.oh-my-job.com'
const JOB_ID_PATTERN = /\/jobs\/([^/?]+)/

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

  // ─── Filtre qualité pour les URLs de jobs ──────────────────────────────────
  // On ne re-vérifie pas les URLs URL_DELETED : on veut notifier une
  // suppression même si le job ne passerait plus le filtre qualité
  // aujourd'hui (il n'existe peut-être déjà plus en DB).
  const checkedUrls: string[] = []
  const skippedUrls: { url: string; reason: string }[] = []

  if (action === 'URL_DELETED') {
    checkedUrls.push(...fullUrls)
  } else {
    for (const url of fullUrls) {
      const match = url.match(JOB_ID_PATTERN)

      if (!match) {
        // Pas une URL de job (ex: /data/states/california) → pas de filtre
        checkedUrls.push(url)
        continue
      }

      const jobId = match[1]
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { active: true, description: true },
      })

      if (!job) {
        skippedUrls.push({ url, reason: 'job not found' })
        continue
      }

      if (!job.active) {
        skippedUrls.push({ url, reason: 'job inactive' })
        continue
      }

      if (!hasEnoughDescriptionContent(job.description)) {
        skippedUrls.push({ url, reason: 'description too short' })
        continue
      }

      checkedUrls.push(url)
    }
  }

  if (checkedUrls.length === 0) {
    return NextResponse.json({
      total: 0,
      succeeded: 0,
      failed: 0,
      results: [],
      skipped: skippedUrls,
      message: 'All URLs were filtered out by the quality check',
    })
  }

  // ─── Envoi à Google ───────────────────────────────────────────────────────
  console.log(`📡 Indexing API: sending ${checkedUrls.length} URLs with action ${action} (${skippedUrls.length} skipped)`)

  const results = await notifyGoogleBatch(
    checkedUrls.map((url: string) => ({ url, action: action as IndexingAction }))
  )

  const succeeded = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`📊 Indexing results: ${succeeded} succeeded, ${failed} failed`)

  return NextResponse.json({
    total: results.length,
    succeeded,
    failed,
    results,
    skipped: skippedUrls,
  })
}