// app/api/jobs-all/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { parseJobWhereParams } from '@/lib/job-where'
import { getCachedJobsPage } from '@/lib/jobsQuery'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page           = parseInt(searchParams.get('page')            || '1')
  const resultsPerPage = parseInt(searchParams.get('results_per_page') || '30')

  try {
    const params = parseJobWhereParams(searchParams)
    const data = await getCachedJobsPage(params, page, resultsPerPage)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Jobs-all API error:', error.message)
    return NextResponse.json({ results: [], count: 0 }, { status: 500 })
  }
}