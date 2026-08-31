// app/api/cron/mark-expired-jobs/route.ts
// ─── Désactive les jobs expirés + notifie explicitement les moteurs ──────────
// Ne supprime PAS en DB immédiatement : passe juste active=false, pour
// laisser le temps à Google/Bing de traiter la désindexation avant le
// hard-delete définitif (voir purge-expired-jobs, cron séparé).

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ATS_SOURCES } from '@/lib/job-db'
import { getCanonicalJobSlug } from '@/lib/slugify'
import { isGoogleIndexingConfigured, notifyGoogleIndexing } from '@/lib/googleIndexing'

// Réserve une marge sur le quota quotidien google-200 (200 URLs/jour) :
// le cron google-indexing en consomme l'essentiel, on n'utilise ici qu'un
// petit quota pour la désindexation.
const MAX_DELETE_NOTIFICATIONS = 50

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // On ne cible que les jobs encore actifs mais qui viennent d'expirer —
  // pas ceux déjà marqués inactifs lors d'un run précédent (évite de
  // re-notifier en boucle les mêmes URLs à chaque passage du cron).
  const toDeactivate = await prisma.job.findMany({
    where: {
      active: true,
      expiresAt: { lt: new Date() },
    },
    select: {
      id: true,
      title: true,
      canonicalSlug: true,
      company: true,
      location: true,
      addressRegion: true,
      source: true,
    },
  })

  if (toDeactivate.length === 0) {
    return NextResponse.json({ message: 'Rien à désactiver', timestamp: new Date().toISOString() })
  }

  const ids = toDeactivate.map((j) => j.id)
  const indexableJobs = toDeactivate.filter((j) => ATS_SOURCES.includes(j.source) || j.source === 'custom-scrape')

  // ─── Notifier AVANT ou APRÈS le flag ? Après — pour que le prochain
  // crawl de Google tombe déjà sur un contenu cohérent avec le statut "supprimé" ───
  await prisma.job.updateMany({
    where: { id: { in: ids } },
    data: { active: false },
  })

  // ─── Google Indexing : URL_DELETED pour les seuls jobs ATS ──────────────
  // Les autres sources (jooble/lensa/careerjet/adzuna) sont déjà en noindex.
  let googleSent = 0
  let googleFailed = 0
  if (isGoogleIndexingConfigured()) {
    for (const job of indexableJobs.slice(0, MAX_DELETE_NOTIFICATIONS)) {
      const url = `https://www.solarroles.com/jobs/${job.id}/${getCanonicalJobSlug(job)}`
      const result = await notifyGoogleIndexing(url, 'URL_DELETED')
      if (result.success) {
        googleSent++
        console.log(`[MarkExpired] Google URL_DELETED ✔ ${url}`)
      } else {
        googleFailed++
        console.error(`[MarkExpired] Google URL_DELETED ✘ ${url}:`, result.error)
        // Quota épuisé → inutile de continuer.
        if (result.quotaExceeded) break
      }
    }
  } else {
    console.warn('[MarkExpired] Google Indexing non configuré — skip URL_DELETED')
  }

  return NextResponse.json({
    deactivated: ids.length,
    googleIndexing: { sent: googleSent, failed: googleFailed, skippedNonIndexable: ids.length - indexableJobs.length },
    timestamp: new Date().toISOString(),
  })
}
