// app/api/cron/role-demand/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TRACKED_ROLES } from '@/lib/data/trackedRoles'

export const maxDuration = 60 // à ajuster selon le nombre de rôles (voir note plus bas)

const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']

export async function GET(request: NextRequest) {
  // Vercel envoie automatiquement ce header quand il déclenche le cron,
  // à partir de la variable d'env CRON_SECRET que tu dois définir toi-même.
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: { slug: string; states: number; error?: string }[] = []

  for (const role of TRACKED_ROLES) {
    try {
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

      // Remplace intégralement les lignes existantes pour ce rôle : plus simple
      // et plus sûr qu'un upsert état par état vu le faible volume (~50 lignes max).
      await prisma.$transaction([
        prisma.roleStateDemand.deleteMany({ where: { roleSlug: role.slug } }),
        prisma.roleStateDemand.createMany({
          data: rows.map((r) => ({ roleSlug: role.slug, state: r.state, count: r.count })),
        }),
      ])

      results.push({ slug: role.slug, states: rows.length })
    } catch (err: any) {
      console.error(`role-demand cron error for ${role.slug}:`, err.message)
      results.push({ slug: role.slug, states: 0, error: err.message })
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}