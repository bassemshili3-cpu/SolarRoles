// lib/merged-search.ts
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { prisma } from '@/lib/prisma'

export async function getMergedJobCount(what: string, where: string, salary_min?: number) {
  const { count: adzunaCount } = await getCachedJobCount(what, where, salary_min)
  return { count: adzunaCount }
}

export async function searchMergedJobs(params: {
  what: string
  where: string
  results_per_page?: number
  page?: number
  salary_min?: number
}) {
  const { what, where, results_per_page = 30, page = 1, salary_min } = params

  // ── 1. Adzuna API (primary) ──
  const adzunaData = await searchJobs({
    what,
    where,
    results_per_page,
    page,
    salary_min,
  }).then((data: AdzunaSearchResult) => ({
    results: data.results.map(normalizeAdzuna),
    count: data.count || 0,
  })).catch((err: any) => {
    console.error('Adzuna error in merged search:', err.message)
    return { results: [] as any[], count: 0 }
  })

  // ── 2. Prisma (Jooble + Careerjet supplement) — only on page 1 ──
  let prismaJobs: any[] = []

  if (page === 1) {
    try {
      const keywords = what.split(/\s+/).filter(Boolean)
      const prismaWhere: any = {
        active: true,
        expiresAt: { gt: new Date() },
        source: { in: ['jooble', 'careerjet'] },
      }

      if (keywords.length > 0) {
        prismaWhere.AND = keywords.map((kw: string) => ({
          OR: [
            { title: { contains: kw, mode: 'insensitive' as const } },
            { company: { contains: kw, mode: 'insensitive' as const } },
          ],
        }))
      }

      if (where) {
        const locationCondition = {
          OR: [
            { location: { contains: where, mode: 'insensitive' as const } },
            { addressRegion: { contains: where, mode: 'insensitive' as const } },
          ],
        }
        if (prismaWhere.AND) {
          prismaWhere.AND.push(locationCondition)
        } else {
          prismaWhere.AND = [locationCondition]
        }
      }

      const dbJobs = await prisma.job.findMany({
        where: prismaWhere,
        orderBy: { fetchedAt: 'desc' },
        take: 10,
      })

      prismaJobs = dbJobs.map((job) => ({
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
      }))
    } catch (err: any) {
      console.error('Prisma error in merged search:', err.message)
    }
  }

  // ── 3. Deduplicate + merge ──
  const adzunaTitles = new Set(
    adzunaData.results.map((j: any) =>
      `${j.title?.toLowerCase().trim()}|${j.company?.toLowerCase().trim()}`
    )
  )

  const uniquePrismaJobs = prismaJobs.filter((j: any) => {
    const key = `${j.title?.toLowerCase().trim()}|${j.company?.toLowerCase().trim()}`
    return !adzunaTitles.has(key)
  })

  const merged = [...adzunaData.results]
  let insertIndex = 3

  for (const prismaJob of uniquePrismaJobs) {
    if (insertIndex <= merged.length) {
      merged.splice(insertIndex, 0, prismaJob)
      insertIndex += 5
    } else {
      merged.push(prismaJob)
    }
  }

  return {
    results: merged,
    count: adzunaData.count,
  }
}