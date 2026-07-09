// lib/employerProfile.ts
import { prisma } from './prisma'

export type EmployerProfile = {
  totalOpenings: number
  states: { state: string; count: number }[]
  singleState: string | null // rempli seulement si TOUTES les offres sont dans un seul état
  avgSalaryMin: number | null
  avgSalaryMax: number | null
}

const MIN_OPENINGS_TO_SHOW = 3 // pas de bloc pour un employeur avec 1-2 annonces

export async function getEmployerProfile(
  company: string,
  excludeJobId: string
): Promise<EmployerProfile | null> {
  if (!company) return null

  const baseWhere = {
    active: true,
    company: { equals: company, mode: 'insensitive' as const },
    id: { not: excludeJobId }, // ← fix : exclure l'offre actuelle du décompte
  }

  const [totalOpenings, stateGroups, salaryAgg] = await Promise.all([
    prisma.job.count({ where: baseWhere }),
    prisma.job.groupBy({
      by: ['addressRegion'],
      where: { ...baseWhere, addressRegion: { not: '' } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.job.aggregate({
      where: { ...baseWhere, salaryMin: { not: null }, salaryMax: { not: null } },
      _avg: { salaryMin: true, salaryMax: true },
    }),
  ])

  if (totalOpenings < MIN_OPENINGS_TO_SHOW) return null

  // "Une seule location" seulement si le groupe unique couvre 100% du total —
  // sinon ça veut dire que d'autres offres existent mais sans état identifié,
  // et on ne peut pas affirmer "toutes au même endroit" sans risquer une erreur.
  const singleState =
    stateGroups.length === 1 && stateGroups[0]._count.id === totalOpenings
      ? stateGroups[0].addressRegion
      : null

  return {
    totalOpenings,
    states: stateGroups.map((g) => ({ state: g.addressRegion, count: g._count.id })),
    singleState,
    avgSalaryMin: salaryAgg._avg.salaryMin ? Math.round(salaryAgg._avg.salaryMin) : null,
    avgSalaryMax: salaryAgg._avg.salaryMax ? Math.round(salaryAgg._avg.salaryMax) : null,
  }
}