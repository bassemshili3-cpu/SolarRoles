import { getMergedJobCount } from '@/lib/merged-search'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const what = searchParams.get('what') || ''
  const where = searchParams.get('where') || ''
  const salary_min_str = searchParams.get('salary_min')
  const salary_min = salary_min_str ? Number(salary_min_str) : undefined

  try {
    const { count } = await getMergedJobCount(what, where, salary_min)
    return NextResponse.json({ count })
  } catch (err) {
    console.error('API /jobs-count error:', err)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}