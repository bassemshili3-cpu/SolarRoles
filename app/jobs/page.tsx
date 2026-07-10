'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import JobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcher from '@/components/AIJobMatcher'

type AIFilters = {
  title?: string
  location?: string
  remote?: boolean
  minSalary?: number
  keywords?: string[]
}

export default function JobsPage() {
  const searchParams = useSearchParams()

  const initialWhat      = searchParams.get('what')       || ''
  const initialWhere     = searchParams.get('where')      || ''
  const initialSalaryMin = searchParams.get('salary_min')
    ? Number(searchParams.get('salary_min'))
    : undefined

  const [aiFilters, setAiFilters]       = useState<AIFilters | null>(null)
  




  // Calculs des valeurs effectives une seule fois, réutilisés partout
  const effectiveWhat =
    aiFilters?.title ||
    (aiFilters?.keywords?.length ? aiFilters.keywords.join(' ') : initialWhat)

  const effectiveWhere = aiFilters?.location || initialWhere

  const effectiveSalaryMin =
    aiFilters?.minSalary !== undefined ? aiFilters.minSalary : initialSalaryMin

  // Cle stable basee sur les VALEURS, pas sur la reference de aiFilters :
  // le useEffect ne se redeclenche que si le resultat de la recherche change reellement
 




  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-80">
          <JobFilters />
        </aside>

        <div className="flex-1 min-w-0">
          


          <AIJobMatcher onFiltersChange={setAiFilters} />

          {/* JobList reads advanced filters (job_type, arrangement, etc.)
              directly from useSearchParams internally — no need to pass them */}
          <JobList
            what={effectiveWhat}
            where={effectiveWhere}
            salary_min={effectiveSalaryMin?.toString()}
          />
        </div>
      </div>
    </div>
  )
}