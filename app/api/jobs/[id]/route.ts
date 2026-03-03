// app/api/jobs/[id]/route.ts
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
    // ========================
    // JOB LENSA
    // ========================
    if (id.startsWith('lensa-')) {
      const originalId = id.replace('lensa-', '')
      const lensaData = await searchLensaJobs({ limit: 180 })

      const job = lensaData.job_adverts?.find(j => j.unique_id === originalId)

      if (!job) {
        return NextResponse.json({ error: 'Job Lensa not found' }, { status: 404 })
      }

      return NextResponse.json({
        ...normalizeLensa(job),
        source: 'lensa' as const,
      })
    }

    // ========================
    // JOB ADZUNA
    // ========================
    if (id.startsWith('adzuna-')) {
      const originalId = id.replace('adzuna-', '')
      const job = await getJobById(originalId)

      if (!job) {
        return NextResponse.json({ error: 'Job Adzuna not found' }, { status: 404 })
      }

      return NextResponse.json({
        ...normalizeAdzuna(job),
        source: 'adzuna' as const,
        externalApplyUrl: job.redirect_url || null,
      })
    }

    return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 })
  } catch (error) {
    console.error('Job detail API error:', error)
    return NextResponse.json({ error: 'Failed to fetch job details' }, { status: 500 })
  }
}