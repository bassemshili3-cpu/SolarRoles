// app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { normalizeLensa, normalizeAdzuna } from '@/lib/jobs'
import { searchLensaJobs } from '@/lib/lensa'
import { getJobById } from '@/lib/adzuna'
import { prisma } from '@/lib/prisma'

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

      // 1. Try Prisma first (no API call)
      const dbJob = await prisma.job.findUnique({
        where: { id },
      })

      if (dbJob) {
        return NextResponse.json({
          id: dbJob.id,
          title: dbJob.title,
          company: dbJob.company,
          location: dbJob.location,
          description: dbJob.description,
          salary: dbJob.salary,
          salaryMin: dbJob.salaryMin,
          salaryMax: dbJob.salaryMax,
          url: dbJob.url,
          source: 'adzuna' as const,
          externalApplyUrl: dbJob.url || null,
          postedAt: dbJob.postedAt,
         
        })
      }

      // 2. Fallback to API only if not in DB
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

    // ========================
    // JOB JOOBLE
    // ========================
    if (id.startsWith('jooble-')) {
      const dbJob = await prisma.job.findUnique({
        where: { id },
      })

      if (dbJob) {
        return NextResponse.json({
          id: dbJob.id,
          title: dbJob.title,
          company: dbJob.company,
          location: dbJob.location,
          description: dbJob.description,
          salary: dbJob.salary,
          salaryMin: dbJob.salaryMin,
          salaryMax: dbJob.salaryMax,
          url: dbJob.url,
          source: 'jooble' as const,
          externalApplyUrl: dbJob.url || null,
          postedAt: dbJob.postedAt,
          
        })
      }

      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 })
  } catch (error) {
    console.error('Job detail API error:', error)
    return NextResponse.json({ error: 'Failed to fetch job details' }, { status: 500 })
  }
}