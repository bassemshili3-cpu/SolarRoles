// lib/merged-search.ts
// Adzuna partnership paused — using Jooble, Lensa, and Careerjet from Prisma
import { prisma } from '@/lib/prisma'

const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']

export async function getMergedJobCount(
  what: string | string[],
  where: string,
  salary_min?: number,
) {
  try {
    const whereClause = buildPrismaWhere(what, where, salary_min)
    const count = await prisma.job.count({ where: whereClause })
    return { count }
  } catch (err: any) {
    console.error('Prisma count error:', err.message)
    return { count: 0 }
  }
}

export async function searchMergedJobs(params: {
  what: string | string[]
  where: string
  results_per_page?: number
  page?: number
  salary_min?: number
}) {
  const { what, where, results_per_page = 30, page = 1, salary_min } = params

  try {
    const whereClause = buildPrismaWhere(what, where, salary_min)

    const [dbJobs, count] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        orderBy: [
  { sourcePriority: 'asc' },
  { fetchedAt: 'desc' },
],
        skip: (page - 1) * results_per_page,
        take: results_per_page,
      }),
      prisma.job.count({ where: whereClause }),
    ])

    const results = dbJobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      addressRegion: job.addressRegion,
      description: job.description,
      url: job.url,
      applyUrl: job.applyUrl,
      apply_url: job.applyUrl,
      salary: job.salary,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      contractType: job.contractType,
      contractTime: job.contractTime,
      source: job.source,
      postedAt: job.postedAt?.toISOString() || null,
      created: job.postedAt?.toISOString() || null,
    }))

    return { results, count }
  } catch (err: any) {
    console.error('Prisma error in merged search:', err.message)
    return { results: [], count: 0 }
  }
}

// ── Shared where clause builder ──
function buildPrismaWhere(
  what: string | string[],
  where: string,
  salary_min?: number,
) {
  const whereClause: any = {
    active: true,
    expiresAt: { gt: new Date() },
    source: { in: ACTIVE_SOURCES },
  }

  if (what) {
    // Normalize input: a string becomes a one-phrase array, an array stays as is
    const phrases = Array.isArray(what)
      ? what.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      : [what]

    // Build a per-phrase condition: within a phrase, all keywords must match (AND)
    // Between fields (title, company, description), an OR is kept from the original logic
    const phraseConditions = phrases
      .map((phrase) => {
        const keywords = phrase.split(/\s+/).filter(Boolean)
        if (keywords.length === 0) return null

        return {
          AND: keywords.map((kw: string) => ({
            OR: [
              { title: { contains: kw, mode: 'insensitive' as const } },
              { company: { contains: kw, mode: 'insensitive' as const } },
              { description: { contains: kw, mode: 'insensitive' as const } },
            ],
          })),
        }
      })
      .filter((c): c is { AND: any[] } => c !== null)

    if (phraseConditions.length === 1) {
      // Single phrase: flatten into top-level AND for full backward compatibility
      whereClause.AND = phraseConditions[0].AND
    } else if (phraseConditions.length > 1) {
      // Multiple phrases: any phrase can match (OR between phrases)
      whereClause.AND = [{ OR: phraseConditions }]
    }
  }

  if (where) {
    const locationCondition = {
      OR: [
        { location: { contains: where, mode: 'insensitive' as const } },
        { addressRegion: { contains: where, mode: 'insensitive' as const } },
      ],
    }
    if (whereClause.AND) {
      whereClause.AND.push(locationCondition)
    } else {
      whereClause.AND = [locationCondition]
    }
  }

  if (salary_min) {
    const salaryCondition = { salaryMin: { gte: salary_min } }
    if (whereClause.AND) {
      whereClause.AND.push(salaryCondition)
    } else {
      whereClause.AND = [salaryCondition]
    }
  }

  return whereClause
}