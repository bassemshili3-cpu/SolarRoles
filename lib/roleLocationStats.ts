import { prisma } from '@/lib/prisma'
import { STATES } from '@/lib/usStates'
import { SALARY_MIN_THRESHOLD, SALARY_MAX_THRESHOLD } from '@/lib/salaryBounds'

const MIN_LISTINGS_FOR_STAT = 5 // pas de stat affichée si trop peu de données

export type RoleLocationStat = {
  avgSalary: number
  count: number
}

export async function getRoleLocationStats(
  roleKeywords: string[],
  stateName: string,
  includeDescription = false // true pour les catégories matchInDescription (ex: FIFO)
): Promise<RoleLocationStat | null> {
  const stateCode = STATES[stateName]

  const keywordOr = roleKeywords.flatMap((kw) =>
    includeDescription
      ? [
          { title: { contains: kw, mode: 'insensitive' as const } },
          { description: { contains: kw, mode: 'insensitive' as const } },
        ]
      : [{ title: { contains: kw, mode: 'insensitive' as const } }]
  )

  const result = await prisma.job.aggregate({
    where: {
      active: true,
      AND: [
        { OR: keywordOr },
        {
          OR: [
            { addressRegion: stateName },
            ...(stateCode ? [{ addressRegion: stateCode }] : []),
          ],
        },
      ],
      salaryMin: { gte: SALARY_MIN_THRESHOLD, lte: SALARY_MAX_THRESHOLD },
      salaryMax: { gte: SALARY_MIN_THRESHOLD, lte: SALARY_MAX_THRESHOLD },
    },
    _avg: { salaryMin: true, salaryMax: true },
    _count: { id: true },
  })

  const count = result._count.id
  if (count < MIN_LISTINGS_FOR_STAT) return null

  const { salaryMin, salaryMax } = result._avg
  if (salaryMin == null || salaryMax == null) return null

  return {
    avgSalary: Math.round((salaryMin + salaryMax) / 2),
    count,
  }
}