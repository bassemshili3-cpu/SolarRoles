import { searchJobs } from '@/lib/adzuna'
import { Suspense } from 'react'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import JobMap from '@/components/JobMap'

export default async function JobsPage({ searchParams }: any) {
  const params = await searchParams

  // Appel direct, léger (1 résultat suffit pour avoir le count)
  const { count } = await searchJobs({
    what: params.what || '',
    where: params.where || 'United States',
    ...(params.salary_min && { salary_min: params.salary_min }),
    results_per_page: 1,
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-80"><JobFilters /></aside>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-4">
            {count > 0
              ? <><span className="font-semibold text-gray-800">{count.toLocaleString()}</span> offres trouvées{params.what ? ` pour "${params.what}"` : ''}</>
              : 'Aucune offre trouvée.'
            }
          </p>
          <JobMap jobs={[]} />
          <Suspense fallback={<div>Loading jobs...</div>}>
            <InfiniteJobList
              what={params.what || ''}
              where={params.where || 'United States'}
              salary_min={params.salary_min}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}