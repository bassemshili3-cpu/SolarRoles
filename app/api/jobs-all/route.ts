// app/api/jobs-all/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildJobWhere, parseJobWhereParams } from '@/lib/job-where'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page           = parseInt(searchParams.get('page')           || '1')
  const resultsPerPage = parseInt(searchParams.get('results_per_page') || '30')

  try {
    const whereClause = buildJobWhere(parseJobWhereParams(searchParams))

    const [dbJobs, count] = await Promise.all([
  prisma.job.findMany({
    where: whereClause,
    select: {
      id: true, title: true, company: true, location: true,
      addressRegion: true, url: true, applyUrl: true,
      salaryMin: true, salaryMax: true, salary: true,
      contractType: true, contractTime: true, source: true, postedAt: true,
      // description volontairement exclu ici : trop lourd pour une liste,
      // à fetcher uniquement sur la page détail du job
    },
    orderBy: [
      { sourcePriority: 'asc' },
      { fetchedAt: 'desc' },
    ],
    skip: (page - 1) * resultsPerPage,
    take: resultsPerPage,
  }),
  prisma.job.count({ where: whereClause }),
])

    const results = dbJobs.map((job) => ({
      id:            job.id,
      title:         job.title,
      company:       job.company,
      location:      job.location,
      addressRegion: job.addressRegion,
      url:           job.url,
      applyUrl:      job.applyUrl,
      apply_url:     job.applyUrl,
      salary:        job.salary,
      salaryMin:     job.salaryMin,
      salaryMax:     job.salaryMax,
      salary_min:    job.salaryMin,
      salary_max:    job.salaryMax,
      contractType:  job.contractType,
      contractTime:  job.contractTime,
      source:        job.source,
      postedAt:      job.postedAt?.toISOString() || null,
      created:       job.postedAt?.toISOString() || null,
    }))

    return NextResponse.json({ results, count })
  } catch (error: any) {
    console.error('Jobs-all API error:', error.message)
    return NextResponse.json({ results: [], count: 0 }, { status: 500 })
  }
}