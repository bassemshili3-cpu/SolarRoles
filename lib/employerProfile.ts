// lib/employerProfile.ts
import { prisma } from './prisma'

export type EmployerProfile = {
  totalOpenings: number
  states: { state: string; count: number }[]
  avgSalaryMin: number | null
  avgSalaryMax: number | null
}

const MIN_OPENINGS_TO_SHOW = 3 // pas de bloc pour un employeur avec 1-2 annonces

export async function getEmployerProfile(
  company: string,
  excludeJobId: string
): Promise<EmployerProfile | null> {
  if (!company) return null

  const [totalOpenings, stateGroups, salaryAgg] = await Promise.all([
    prisma.job.count({
      where: { active: true, company: { equals: company, mode: 'insensitive' } },
    }),
    prisma.job.groupBy({
      by: ['addressRegion'],
      where: {
        active: true,
        company: { equals: company, mode: 'insensitive' },
        addressRegion: { not: '' },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.job.aggregate({
      where: {
        active: true,
        company: { equals: company, mode: 'insensitive' },
        salaryMin: { not: null },
        salaryMax: { not: null },
      },
      _avg: { salaryMin: true, salaryMax: true },
    }),
  ])

  if (totalOpenings < MIN_OPENINGS_TO_SHOW) return null

  return {
    totalOpenings,
    states: stateGroups.map((g) => ({ state: g.addressRegion, count: g._count.id })),
    avgSalaryMin: salaryAgg._avg.salaryMin ? Math.round(salaryAgg._avg.salaryMin) : null,
    avgSalaryMax: salaryAgg._avg.salaryMax ? Math.round(salaryAgg._avg.salaryMax) : null,
  }
}