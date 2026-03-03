// app/api/jobs/route.ts
import { searchJobs } from '@/lib/adzuna'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 10800 // 3 hours

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = Object.fromEntries(searchParams)
    
    const data = await searchJobs(params)
    return Response.json(data)
  } catch (e) {
    console.error('API route error:', e)
    return Response.json({ results: [], count: 0 }, { status: 500 })
  }
}