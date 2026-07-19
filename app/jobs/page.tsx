// app/jobs/page.tsx
import { getCachedJobsPage } from '@/lib/jobsQuery'
import { parseJobWhereParams } from '@/lib/job-where'
import JobsPageClient from './JobsPageClient'

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