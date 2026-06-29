import { searchAllJobs } from '@/lib/jobs'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

function splitParam(v: string | null): string[] {
  return v ? v.split(',').map(s => s.trim()).filter(Boolean) : []
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const data = await searchAllJobs({
      what: searchParams.get('what') || '',
      where: searchParams.get('where') || '',
      page: Number(searchParams.get('page')) || 1,
      results_per_page: Number(searchParams.get('results_per_page')) || 30,
      salary_min: searchParams.get('salary_min') || undefined,
      postedWithin: searchParams.get('posted_within') ? Number(searchParams.get('posted_within')) : undefined,
      jobTypes: splitParam(searchParams.get('job_type')),
      arrangements: splitParam(searchParams.get('arrangement')),
      experience: searchParams.get('experience') || '',
      education: searchParams.get('education') || '',
      companySizes: splitParam(searchParams.get('company_size')),
      benefits: splitParam(searchParams.get('benefits')),
      easyApply: searchParams.get('easy_apply') === 'true',
      visaSponsorship: searchParams.get('visa_sponsorship') === 'true',
    })

    return Response.json(data)
  } catch (e) {
    console.error('API route error:', e)
    return Response.json({ results: [], count: 0, lensa_count: 0, adzuna_count: 0 }, { status: 500 })
  }
}