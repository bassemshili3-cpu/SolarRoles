import { NextRequest, NextResponse } from 'next/server'
import { fetchWhatJobs } from '@/lib/whatjobs'

export const dynamic = 'force-dynamic'

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  const candidate = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim()
  return candidate && /^[0-9a-f:.]+$/i.test(candidate) ? candidate : null
}

export async function GET(request: NextRequest) {
  const publisher = process.env.WHATJOBS_PUBLISHER_ID
  if (!publisher) {
    return NextResponse.json({ error: 'WhatJobs is not configured.' }, { status: 503 })
  }

  const userIp = getClientIp(request)
  if (!userIp) {
    return NextResponse.json({ error: 'Unable to determine client IP.' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get('page') || '1', 10)

  try {
    const data = await fetchWhatJobs({
      publisher,
      userIp,
      userAgent: request.headers.get('user-agent') || undefined,
      keyword: searchParams.get('keyword') || 'solar',
      location: searchParams.get('location') || undefined,
      page: Number.isFinite(page) ? page : 1,
      // Curated landing pages can apply a strict title rule client-side.
      // Fetch a wider set, then display at most six matching cards.
      limit: 30,
    })

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('[whatjobs] feed request failed', error)
    return NextResponse.json({ error: 'WhatJobs feed is temporarily unavailable.' }, { status: 502 })
  }
}
