// app/api/jobs-all/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { buildJobWhere, parseJobWhereParams, type JobWhereParams } from '@/lib/job-where'

// Clé de cache basée sur les params bruts (stables), pas sur whereClause
// (qui contient un `new Date()` différent à chaque appel et casserait tout hit).
// Clé de cache basée sur les params bruts (stables), pas sur whereClause
// (qui contient un `new Date()` différent à chaque appel et casserait tout hit).
async function getCachedCount(params: JobWhereParams) {
  return unstable_cache(
    async () => {
      const whereClause = buildJobWhere(params)
      return prisma.job.count({ where: whereClause })
    },
    // La clé DOIT encoder les params : sinon toutes les combinaisons de filtres
    // partagent la même entrée de cache et se marchent dessus entre requêtes.
    ['jobs-count', JSON.stringify(params)],
    { revalidate: 120 }
  )()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page           = parseInt(searchParams.get('page')           || '1')
  const resultsPerPage = parseInt(searchParams.get('results_per_page') || '30')

  try {
    const params = parseJobWhereParams(searchParams)
    const whereClause = buildJobWhere(params)

    const [dbJobs, count] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        select: {
          id: true, title: true, company: true, location: true,
          addressRegion: true, url: true, applyUrl: true,
          salaryMin: true, salaryMax: true, salary: true,
          contractType: true, contractTime: true, source: true, postedAt: true,
        },
        orderBy: [
          { sourcePriority: 'asc' },
          { fetchedAt: 'desc' },
        ],
        skip: (page - 1) * resultsPerPage,
        take: resultsPerPage,
      }),
      getCachedCount(params),   // ← params bruts, pas whereClause
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