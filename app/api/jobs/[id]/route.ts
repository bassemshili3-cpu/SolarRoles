import { NextRequest, NextResponse } from 'next/server'
import { normalizeLensa, normalizeAdzuna } from '@/lib/jobs'
import { searchLensaJobs } from '@/lib/lensa'
import { getJobById } from '@/lib/adzuna'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Job Lensa
    if (id.startsWith('lensa-')) {
      const originalId = id.replace('lensa-', '')
      const lensaData = await searchLensaJobs({ limit: 180 })
      const job = lensaData.job_adverts?.find(j => j.unique_id === originalId)
      if (job) return NextResponse.json(normalizeLensa(job))
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Job Adzuna
    if (id.startsWith('adzuna-')) {
      const originalId = id.replace('adzuna-', '')
      const job = await getJobById(originalId)
      if (job) return NextResponse.json(normalizeAdzuna(job))
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })

  } catch (error) {
    console.error('Job detail error:', error)
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }
}