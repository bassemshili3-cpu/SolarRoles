'use client'

import { useEffect, useState } from 'react'
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

  const initialWhat     = searchParams.get('what')       || ''
  const initialWhere    = searchParams.get('where')      || ''
  const initialSalaryMin = searchParams.get('salary_min')
    ? Number(searchParams.get('salary_min'))
    : undefined

  const [aiFilters, setAiFilters]     = useState<AIFilters | null>(null)
  const [jobCount, setJobCount]       = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(true)

  useEffect(() => {
    async function loadCount() {
      setLoadingCount(true)

      const query = new URLSearchParams(searchParams.toString())

      const effectiveWhat =
        aiFilters?.title ||
        (aiFilters?.keywords?.length ? aiFilters.keywords.join(' ') : initialWhat)

      const effectiveWhere    = aiFilters?.location || initialWhere
      const effectiveSalaryMin =
        aiFilters?.minSalary !== undefined ? aiFilters.minSalary : initialSalaryMin

      if (effectiveWhat)          query.set('what',       effectiveWhat)
      else                        query.delete('what')

      if (effectiveWhere)         query.set('where',      effectiveWhere)
      else                        query.delete('where')

      if (effectiveSalaryMin !== undefined) query.set('salary_min', String(effectiveSalaryMin))
      else                                  query.delete('salary_min')

      try {
        const res = await fetch(`/api/jobs-count?${query.toString()}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setJobCount(data.count ?? 0)
      } catch (err) {
        console.error('Error loading count:', err)
        setJobCount(0)
      } finally {
        setLoadingCount(false)
      }
    }

    loadCount()
  }, [initialWhat, initialWhere, initialSalaryMin, aiFilters, searchParams.toString()])

  const effectiveWhat =
    aiFilters?.title ||
    (aiFilters?.keywords?.length ? aiFilters.keywords.join(' ') : initialWhat)

  const effectiveWhere = aiFilters?.location || initialWhere

  const effectiveSalaryMin =
    aiFilters?.minSalary !== undefined
      ? String(aiFilters.minSalary)
      : initialSalaryMin !== undefined
        ? String(initialSalaryMin)
        : undefined

  const displayWhat =
    aiFilters?.title ||
    (aiFilters?.keywords?.length ? aiFilters.keywords.join(', ') : initialWhat)

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-80">
          <JobFilters />
        </aside>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-4">
            {loadingCount ? (
              'Loading number of positions...'
            ) : jobCount !== null && jobCount > 0 ? (
              <>
                <span className="font-semibold text-gray-800">
                  {jobCount.toLocaleString('en-US')}
                </span>{' '}
                positions available
                {displayWhat ? ` for "${displayWhat}"` : ''}
              </>
            ) : (
              'No positions found matching the criteria.'
            )}
          </p>

          <AIJobMatcher onFiltersChange={setAiFilters} />

          {/* JobList reads advanced filters (job_type, arrangement, etc.)
              directly from useSearchParams internally — no need to pass them */}
          <JobList
            what={effectiveWhat}
            where={effectiveWhere}
            salary_min={effectiveSalaryMin}
          />
        </div>
      </div>
    </div>
  )
}