// lib/roleDemandByState.ts
// Agrège le nombre d'offres actives par état pour un ensemble de mots-clés
// de métier (typiquement getRoleKeywords(roleMatch)). Alimente la choropleth
// RoleDemandMap affichée sur les pages de détail job.
//
// Logique OU entre mots-clés (contrairement à merged-search.ts qui fait un ET
// mot par mot sur une recherche libre) : ici les mots-clés sont des synonymes
// d'un même métier (ex: "cna", "certified nursing assistant", "patient care
// assistant"), donc un job compte dès qu'IL MATCHE AU MOINS UN synonyme.

import { prisma } from '@/lib/prisma'

const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']

export type StateDemand = { state: string; count: number }

export async function getRoleDemandByState(keywords: string[]): Promise<StateDemand[]> {
  if (keywords.length === 0) return []

  try {
    const OR = keywords.map((kw) => ({
      OR: [
        { title: { contains: kw, mode: 'insensitive' as const } },
        { description: { contains: kw, mode: 'insensitive' as const } },
      ],
    }))

    const whereClause = {
      active: true,
      expiresAt: { gt: new Date() },
      source: { in: ACTIVE_SOURCES },
      addressRegion: { not: '' },
      OR,
    }

    const grouped = await prisma.job.groupBy({
      by: ['addressRegion'],
      where: whereClause,
      _count: { _all: true },
    })

    return grouped
      .filter((g) => g.addressRegion)
      .map((g) => ({ state: g.addressRegion as string, count: g._count._all }))
  } catch (err: any) {
    console.error('getRoleDemandByState error:', err.message)
    return []
  }
}