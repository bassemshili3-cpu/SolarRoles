import { searchJobs } from '@/lib/adzuna'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const what = searchParams.get('what') || ''
  const where = searchParams.get('where') || ''  // vide = nationwide
  const salary_min_str = searchParams.get('salary_min')

  const salary_min = salary_min_str ? Number(salary_min_str) : undefined

  try {
    const result = await searchJobs({
      what,
      where,
      ...(salary_min !== undefined && { salary_min }),
      results_per_page: 1,
    })

    return NextResponse.json({ count: result.count })
  } catch (err) {
    console.error('API /jobs-count error:', err)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}