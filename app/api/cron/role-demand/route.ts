import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TRACKED_ROLES, TrackedRole } from '@/lib/data/trackedRoles'

export const maxDuration = 300 // 5 min — largement dans les clous du plan Pro (jusqu'à 800s dispo)

const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']
const CONCURRENCY = 5 // nombre de rôles traités en parallèle par lot

async function processRole(role: TrackedRole) {
  const OR = role.keywords.map((kw) => ({
    OR: [
      { title: { contains: kw, mode: 'insensitive' as const } },
      { description: { contains: kw, mode: 'insensitive' as const } },
    ],
  }))

  const grouped = await prisma.job.groupBy({
    by: ['addressRegion'],
    where: {
      active: true,
      expiresAt: { gt: new Date() },
      source: { in: ACTIVE_SOURCES },
      addressRegion: { not: '' },
      OR,
    },
    _count: { _all: true },
  })

  const rows = grouped
    .filter((g) => g.addressRegion)
    .map((g) => ({ state: g.addressRegion as string, count: g._count._all }))

  await prisma.$transaction([
    prisma.roleStateDemand.deleteMany({ where: { roleSlug: role.slug } }),
    prisma.roleStateDemand.createMany({
      data: rows.map((r) => ({ roleSlug: role.slug, state: r.state, count: r.count })),
    }),
  ])

  return { slug: role.slug, states: rows.length }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: { slug: string; states: number; error?: string }[] = []

  // Traite les rôles par lots de CONCURRENCY en parallèle plutôt qu'un par un
  // séquentiellement — divise le temps total par ~CONCURRENCY.
  for (let i = 0; i < TRACKED_ROLES.length; i += CONCURRENCY) {
    const batch = TRACKED_ROLES.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.allSettled(batch.map(processRole))

    batchResults.forEach((result, idx) => {
      const role = batch[idx]
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        console.error(`role-demand cron error for ${role.slug}:`, result.reason?.message)
        results.push({
          slug: role.slug,
          states: 0,
          error: String(result.reason?.message || result.reason),
        })
      }
    })
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}