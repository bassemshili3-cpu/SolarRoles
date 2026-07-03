// app/api/cron/backfill-address-region/route.ts
// ─── Backfill ponctuel : remplit addressRegion pour les jobs existants
// où il est vide, en reparsant `location`. Idempotent — safe à relancer.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractStateFromLocation } from '@/lib/usStates'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dry_run') !== 'false' // dry-run par défaut, sécurité
  const limit = parseInt(searchParams.get('limit') || '500')

  // Ne touche que les jobs actifs avec addressRegion vide et une location exploitable
  const candidates = await prisma.job.findMany({
    where: {
      addressRegion: '',
      location: { not: '' },
    },
    select: { id: true, location: true, source: true },
    take: limit,
  })

  let matched = 0
  let unmatched = 0
  const preview: { id: string; location: string; resolved: string | null }[] = []

  for (const job of candidates) {
    const resolved = extractStateFromLocation(job.location)

    if (resolved) {
      matched++
      if (preview.length < 20) preview.push({ id: job.id, location: job.location, resolved })

      if (!dryRun) {
        await prisma.job.update({
          where: { id: job.id },
          data: { addressRegion: resolved },
        })
      }
    } else {
      unmatched++
    }
  }

  return NextResponse.json({
    dryRun,
    candidatesFound: candidates.length,
    matched,
    unmatched,
    preview, // vérifie que le parsing a l'air correct avant de relancer en dry_run=false
  })
}