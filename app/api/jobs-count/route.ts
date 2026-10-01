// app/api/jobs-count/route.ts
import { NextResponse } from 'next/server'
import { parseJobWhereParams } from '@/lib/job-where'
import { getCachedLandingJobCount } from '@/lib/landingJobTitle'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  try {
    const count = await getCachedLandingJobCount(parseJobWhereParams(searchParams))

    return NextResponse.json({ count })
  } catch (err: any) {
    console.error('API /jobs-count error:', err.message)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
