// app/jobs/page.tsx
import { Metadata } from 'next'
import { getCachedJobsPage } from '@/lib/jobsQuery'
import { parseJobWhereParams } from '@/lib/job-where'
import JobsPageClient from './JobsPageClient'

export const metadata: Metadata = {
  title: 'Search Solar Roles Jobs in The US | Filter by Salary, Type & Experience | Solar Roles',
  description:
    'Browse thousands of solar photovoltaic installer positions in the US across all 50 states, updated daily.',
}

// Aligné avec le revalidate de getCachedJobsPage — inutile de garder le HTML
// plus frais que les données qu'il contient.
export const revalidate = 60

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams

  // Reconstruit un URLSearchParams pour réutiliser parseJobWhereParams tel quel
  // (même logique que côté /api/jobs-all, donc mêmes résultats garantis).
  const spEntries: string[][] = Object.entries(sp).flatMap(([key, value]) => {
    if (value === undefined) return []
    return Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
  })
  const urlSearchParams = new URLSearchParams(spEntries)

  const initialWhat = urlSearchParams.get('what') || ''
  const initialWhere = urlSearchParams.get('where') || ''
  const initialSalaryMin = urlSearchParams.get('salary_min')
    ? Number(urlSearchParams.get('salary_min'))
    : undefined

  const params = parseJobWhereParams(urlSearchParams)
  const initialData = await getCachedJobsPage(params, 1, 30)

  return (
    <JobsPageClient
      initialWhat={initialWhat}
      initialWhere={initialWhere}
      initialSalaryMin={initialSalaryMin}
      initialData={initialData}
    />
  )
}