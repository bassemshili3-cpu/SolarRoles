import { NextRequest, NextResponse } from 'next/server'
import { searchCareerjetJobs, normalizeCareerjet } from '@/lib/careerjet'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const keywords = searchParams.get('keywords') || ''
  const location = searchParams.get('location') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('page_size') || '20')

  const userIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
  const userAgent = request.headers.get('user-agent') || ''

  try {
    const data = await searchCareerjetJobs({
      keywords,
      location,
      page,
      page_size: pageSize,
      user_ip: userIp,
      user_agent: userAgent,
    })

    const normalizedJobs = data.jobs.map(normalizeCareerjet)

    return NextResponse.json({
      results: normalizedJobs,
      count: data.hits,
      pages: data.pages,
    })
  } catch (error) {
    console.error('Careerjet API route error:', error)
    return NextResponse.json({ results: [], count: 0, pages: 0 }, { status: 500 })
  }
}