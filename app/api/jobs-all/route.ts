// app/api/jobs-all/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const what = searchParams.get('what') || ''
  const where = searchParams.get('where') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const resultsPerPage = parseInt(searchParams.get('results_per_page') || '30')
  const salaryMin = searchParams.get('salary_min')
    ? parseInt(searchParams.get('salary_min')!)
    : undefined

  try {
    // ── 1. Fetch Adzuna API (primary source) ──
    const adzunaPromise = searchJobs({
      what,
      where,
      results_per_page: resultsPerPage,
      page,
      salary_min: salaryMin,
    }).then((data) => ({
      results: data.results.map(normalizeAdzuna),
      count: data.count || 0,
    })).catch((err: any) => {
      console.error('Adzuna fetch error in jobs-all:', err.message)
      return { results: [] as any[], count: 0 }
    })

    // ── 2. Fetch Prisma (Jooble + Careerjet only) ──
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

    if (salaryMin) {
      const salaryCondition = { salaryMin: { gte: salaryMin } }
      if (prismaWhere.AND) {
        prismaWhere.AND.push(salaryCondition)
      } else {
        prismaWhere.AND = [salaryCondition]
      }
    }

    const prismaPromise = prisma.job.findMany({
      where: prismaWhere,
      orderBy: { fetchedAt: 'desc' },
      take: 10,
    }).then((jobs) =>
      jobs.map((job) => ({
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
    ).catch((err: any) => {
      console.error('Prisma fetch error in jobs-all:', err.message)
      return [] as any[]
    })

    // ── 3. Merge results ──
    const [adzunaData, prismaJobs] = await Promise.all([adzunaPromise, prismaPromise])

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

    return NextResponse.json({
      results: merged,
      count: adzunaData.count + uniquePrismaJobs.length,
    })
  } catch (error: any) {
    console.error('Jobs-all API error:', error.message)
    return NextResponse.json({ results: [], count: 0 }, { status: 500 })
  }
}