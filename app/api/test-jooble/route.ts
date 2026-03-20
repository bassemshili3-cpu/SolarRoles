// app/api/test-jooble/route.ts

import { NextResponse } from 'next/server'
import { searchJooble } from '@/lib/jooble'

export async function GET() {
  try {
    const result = await searchJooble({
      keywords: 'developer',
      location: 'New York',
      resultsOnPage: 5,
    })

    return NextResponse.json({
      success: true,
      totalCount: result.totalCount,
      jobsReturned: result.jobs.length,
      firstJob: result.jobs[0] || null,
    })
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message,
    }, { status: 500 })
  }
}