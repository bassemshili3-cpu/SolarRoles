// app/api/jobs/route.ts
import { searchAllJobs } from '@/lib/jobs'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1h

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const data = await searchAllJobs({
      what: searchParams.get('what') || '',
      where: searchParams.get('where') || '',
      page: Number(searchParams.get('page')) || 1,
      results_per_page: Number(searchParams.get('results_per_page')) || 30,
      salary_min: searchParams.get('salary_min') || undefined,
    })

    return Response.json(data)
  } catch (e) {
    console.error('API route error:', e)
    return Response.json({ results: [], count: 0, lensa_count: 0, adzuna_count: 0 }, { status: 500 })
  }
}