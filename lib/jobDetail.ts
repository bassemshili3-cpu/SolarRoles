// lib/jobDetail.ts
import { prisma } from '@/lib/prisma'
import { resolveJobSalary } from '@/lib/resolveJobSalary'
import { cache } from 'react'

export type JobDetail = {
  id: string
  title: string
  canonicalSlug?: string | null
  company?: string
  location?: string
  addressRegion?: string
  locationRegions?: string[]
  postalCode?: string
  salary?: string
  salaryPeriod?: string
  salary_min?: number
  salary_max?: number
  description?: string
   seoDescription?: string | null
  created?: string
  postedAt: string
  fetchedAt: string
  expiresAt: string
  contract_type?: string
  contract_time?: string
  source: string
  sourceUrl?: string
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
      canonicalSlug: dbJob.canonicalSlug,
      company: dbJob.company,
      location: dbJob.location,
      addressRegion: dbJob.addressRegion,
      locationRegions: dbJob.locationRegions,
      postalCode: dbJob.postalCode || undefined,
      description: dbJob.description,
      seoDescription: dbJob.seoDescription || null, // ← priorité au rewrite
      salary_min: dbJob.salaryMin || undefined,
      salary_max: dbJob.salaryMax || undefined,
      salary: dbJob.salary || undefined,
      salaryPeriod: dbJob.salaryPeriod || undefined,
      created: dbJob.postedAt?.toISOString(),
      postedAt: (dbJob.postedAt ?? dbJob.fetchedAt).toISOString(),
      fetchedAt: dbJob.fetchedAt.toISOString(),
      expiresAt: dbJob.expiresAt.toISOString(),
      source: dbJob.source,
      sourceUrl: dbJob.url,
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
  Object.assign(job, resolveJobSalary(job))
  return job
}
