// app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function formatJob(dbJob: NonNullable<Awaited<ReturnType<typeof prisma.job.findUnique>>>) {
  return {
    id: dbJob.id,
    title: dbJob.title,
    company: dbJob.company,
    location: dbJob.location,
    addressRegion: dbJob.addressRegion,
    description: dbJob.description,
    salary: dbJob.salary,
    salaryMin: dbJob.salaryMin,
    salaryMax: dbJob.salaryMax,
    contractType: dbJob.contractType,
    contractTime: dbJob.contractTime,
    url: dbJob.url,
    applyUrl: dbJob.applyUrl,
    source: dbJob.source,
    externalApplyUrl: dbJob.applyUrl || dbJob.url || null,
    postedAt: dbJob.postedAt,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const dbJob = await prisma.job.findUnique({
      where: { id },
    })

    if (!dbJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(formatJob(dbJob))
  } catch (error) {
    console.error('Job detail API error:', error)
    return NextResponse.json({ error: 'Failed to fetch job details' }, { status: 500 })
  }
}