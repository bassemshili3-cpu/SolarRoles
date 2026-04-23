// app/api/jobs-all/route.ts
// Adzuna paused — serving Jooble, Lensa, and Careerjet from Prisma
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']

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
    const whereClause: any = {
      active: true,
      expiresAt: { gt: new Date() },
      source: { in: ACTIVE_SOURCES },
    }

    if (what) {
      const keywords = what.split(/\s+/).filter(Boolean)
      if (keywords.length > 0) {
        whereClause.AND = keywords.map((kw: string) => ({
          OR: [
            { title: { contains: kw, mode: 'insensitive' as const } },
            { company: { contains: kw, mode: 'insensitive' as const } },
            { description: { contains: kw, mode: 'insensitive' as const } },
          ],
        }))
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

    if (salaryMin) {
      const salaryCondition = { salaryMin: { gte: salaryMin } }
      if (whereClause.AND) {
        whereClause.AND.push(salaryCondition)
      } else {
        whereClause.AND = [salaryCondition]
      }
    }

    const [dbJobs, count] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        orderBy: { fetchedAt: 'desc' },
        skip: (page - 1) * resultsPerPage,
        take: resultsPerPage,
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

    return NextResponse.json({ results, count })
  } catch (error: any) {
    console.error('Jobs-all API error:', error.message)
    return NextResponse.json({ results: [], count: 0 }, { status: 500 })
  }
}