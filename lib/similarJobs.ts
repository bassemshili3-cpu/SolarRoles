// lib/similarJobs.ts
import { prisma } from '@/lib/prisma'

export type SimilarJob = {
  id: string
  title: string
  company: string | null
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  postedAt: Date | null
}

const SELECT = {
  id: true,
  title: true,
  company: true,
  location: true,
  salaryMin: true,
  salaryMax: true,
  postedAt: true,
} as const

export async function getSimilarJobs(
  keywords: string[],
  addressRegion: string | null | undefined,
  excludeId: string,
  limit = 4
): Promise<SimilarJob[]> {
  if (!keywords.length) return []

  const titleOr = keywords.map((kw) => ({
    title: { contains: kw, mode: 'insensitive' as const },
  }))

  try {
    // 1. Priorité aux offres du même état
    const sameState = addressRegion
      ? await prisma.job.findMany({
          where: {
            active: true,
            addressRegion,
            id: { not: excludeId },
            OR: titleOr,
          },
          orderBy: { postedAt: 'desc' },
          take: limit,
          select: SELECT,
        })
      : []

    if (sameState.length >= limit) return sameState

    // 2. Complément national si pas assez de résultats
    const excludeIds = [excludeId, ...sameState.map((j) => j.id)]
    const rest = await prisma.job.findMany({
      where: {
        active: true,
        id: { notIn: excludeIds },
        OR: titleOr,
      },
      orderBy: { postedAt: 'desc' },
      take: limit - sameState.length,
      select: SELECT,
    })

    return [...sameState, ...rest]
  } catch (error: any) {
    console.error('getSimilarJobs error:', error.message)
    return []
  }
}