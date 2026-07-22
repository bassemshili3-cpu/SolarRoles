// lib/jobDetail.ts
import { prisma } from '@/lib/prisma'
import { extractSalaryFromText } from '@/lib/extractSalary'
import { cache } from 'react'

export type JobDetail = {
  id: string
  title: string
  company?: string
  location?: string
  addressRegion?: string
  salary?: string
  salary_min?: number
  salary_max?: number
  description?: string
  created?: string
  postedAt: string
  fetchedAt: string
  expiresAt: string
  contract_type?: string
  contract_time?: string
  source: 'lensa' | 'adzuna' | 'jooble' | 'careerjet' | 'employer'
  externalApplyUrl?: string | null
  apply_url?: string
  headerImage?: string | null
}


export const getJobDetail = cache(async (id: string): Promise<JobDetail | null> => {
  try {
    const dbJob = await prisma.job.findUnique({ where: { id } })
    if (!dbJob || !dbJob.active) return null

    return {
      id: dbJob.id,
      title: dbJob.title,
      company: dbJob.company,
      location: dbJob.location,
      addressRegion: dbJob.addressRegion,
      description: dbJob.description,
      salary_min: dbJob.salaryMin || undefined,
      salary_max: dbJob.salaryMax || undefined,
      salary: dbJob.salary || undefined,
      created: dbJob.postedAt?.toISOString(),
      postedAt: (dbJob.postedAt ?? dbJob.fetchedAt).toISOString(),
      fetchedAt: dbJob.fetchedAt.toISOString(),
      expiresAt: dbJob.expiresAt.toISOString(),
      source: dbJob.source as 'adzuna' | 'lensa' | 'jooble' | 'careerjet' | 'employer',
      externalApplyUrl: dbJob.applyUrl,
      apply_url: dbJob.applyUrl,
      contract_type: dbJob.contractType || undefined,
      contract_time: dbJob.contractTime || undefined,
      headerImage: dbJob.headerImage,
    }
  } catch (error: any) {
    console.error('DB error:', error.message)
    return null
  }
})

export function getJobDetailWithSalary(job: JobDetail): JobDetail {
  const hasRealSalary = job.salary_min && job.salary_max && job.salary_min !== job.salary_max

  if (hasRealSalary) {
    if (!job.salary) {
      job.salary = `$${job.salary_min!.toLocaleString('en-US')} - $${job.salary_max!.toLocaleString('en-US')}/year`
    }
    return job
  }

  const extracted = extractSalaryFromText(job.title, job.description || '')
  if (extracted) {
    job.salary = extracted.display
    job.salary_min = extracted.min
    job.salary_max = extracted.max
  } else if (job.salary_min && job.salary_min === job.salary_max) {
    job.salary = `~$${job.salary_min.toLocaleString('en-US')}/year (est.)`
  }

  return job
  
}

