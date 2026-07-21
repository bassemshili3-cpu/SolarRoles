// app/api/cron/mark-expired-jobs/route.ts
// ─── Désactive les jobs expirés + notifie explicitement les moteurs ──────────
// Ne supprime PAS en DB immédiatement : passe juste active=false, pour
// laisser le temps à Google/Bing de traiter la désindexation avant le
// hard-delete définitif (voir purge-expired-jobs, cron séparé).

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


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
    select: { id: true },
  })

  if (toDeactivate.length === 0) {
    return NextResponse.json({ message: 'Rien à désactiver', timestamp: new Date().toISOString() })
  }

  const ids = toDeactivate.map((j) => j.id)
  const urls = ids.map((id) => `https://www.oh-my-job.com/jobs/${id}`)

  // ─── Notifier AVANT ou APRÈS le flag ? Après — pour que le prochain
  // crawl de Google tombe déjà sur un contenu cohérent avec le statut "supprimé" ───
  await prisma.job.updateMany({
    where: { id: { in: ids } },
    data: { active: false },
  })


  return NextResponse.json({
    deactivated: ids.length,
    timestamp: new Date().toISOString(),
  })
}