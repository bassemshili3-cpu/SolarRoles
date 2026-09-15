import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { STATE_CODE_TO_NAME } from '@/lib/usStates'
import { cleanCompanyName } from '@/app/workforce-resources/_lib/workforceData'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Solar Jobs Widget | Solar Roles',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  state?: string
  limit?: string
  entry?: string
}>

function money(min: number | null, max: number | null, period: string | null) {
  if (min == null || max == null) return 'Salary not listed'
  const label = period?.toUpperCase() === 'HOUR' ? '/hr' : period?.toUpperCase() === 'YEAR' ? '/yr' : ''
  const fmt = (value: number) => value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${Math.round(value)}`
  return `${fmt(min)}–${fmt(max)}${label}`
}

export default async function SolarJobsEmbedPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const state = (params.state ?? '').toUpperCase()
  const stateNames = STATE_CODE_TO_NAME as Record<string, string>
  const stateName = stateNames[state]
  const parsedLimit = Number(params.limit ?? '6')
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 10) : 6
  const entryOnly = params.entry === '1'

  const and: any[] = []
  if (state && stateName) {
    and.push({ OR: [{ addressRegion: state }, { addressRegion: stateName }] })
  }
  if (entryOnly) {
    and.push({
      OR: [
        { experienceLevel: { in: ['ENTRY_LEVEL', 'entry_level'] } },
        { description: { contains: 'entry-level', mode: 'insensitive' } },
        { description: { contains: 'entry level', mode: 'insensitive' } },
        { description: { contains: 'no experience required', mode: 'insensitive' } },
        { description: { contains: 'no experience necessary', mode: 'insensitive' } },
      ],
    })
  }

  const jobs = await prisma.job.findMany({
    where: { active: true, ...(and.length ? { AND: and } : {}) },
    select: {
      id: true,
      title: true,
      company: true,
      location: true,
      salaryMin: true,
      salaryMax: true,
      salaryPeriod: true,
      postedAt: true,
    },
    orderBy: [{ postedAt: 'desc' }, { updatedAt: 'desc' }],
    take: limit,
  })

  const browseHref = stateName ? `/jobs?where=${encodeURIComponent(stateName)}` : '/jobs'

  return (
    <main className="min-h-screen bg-white p-4 text-gray-950">
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Current openings</p>
          <h1 className="mt-1 text-lg font-bold">{entryOnly ? 'Entry-level solar jobs' : 'Solar jobs'}{stateName ? ` in ${stateName}` : ''}</h1>
        </div>

        <div className="divide-y divide-gray-100">
          {jobs.length ? jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} target="_blank" className="block px-5 py-4 hover:bg-blue-50/50">
              <h2 className="line-clamp-2 text-sm font-semibold text-gray-950">{job.title}</h2>
              <p className="mt-1 text-xs text-gray-500">{cleanCompanyName(job.company)} · {job.location || stateName || 'US'}</p>
              <p className="mt-2 text-xs font-medium text-gray-700">{money(job.salaryMin, job.salaryMax, job.salaryPeriod)}</p>
            </Link>
          )) : (
            <div className="px-5 py-8 text-sm text-gray-500">No matching openings are active right now.</div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4">
          <Link href={browseHref} target="_blank" className="text-xs font-semibold text-blue-700 hover:text-blue-900">Browse all matching jobs →</Link>
          <Link href="/" target="_blank" className="text-[11px] font-medium text-gray-400 hover:text-gray-700">Powered by Solar Roles</Link>
        </div>
      </div>
    </main>
  )
}
