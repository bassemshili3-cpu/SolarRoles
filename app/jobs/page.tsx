'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import InfiniteJobList from '@/components/InfiniteJobList'
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

  const initialWhat = searchParams.get('what') || ''
  const initialWhere = searchParams.get('where') || ''  // vide = nationwide US
  const initialSalaryMin = searchParams.get('salary_min')
    ? Number(searchParams.get('salary_min'))
    : undefined

  const [aiFilters, setAiFilters] = useState<AIFilters | null>(null)
  const [jobCount, setJobCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(true)

  useEffect(() => {
    async function loadCount() {
      setLoadingCount(true)

      const effectiveWhat =
        aiFilters?.title ||
        (aiFilters?.keywords?.length ? aiFilters.keywords.join(' ') : initialWhat)

      const effectiveWhere = aiFilters?.location || initialWhere

      const effectiveSalaryMin =
        aiFilters?.minSalary !== undefined
          ? aiFilters.minSalary
          : initialSalaryMin

      const query = new URLSearchParams({
        what: effectiveWhat,
        where: effectiveWhere,
      })

      if (effectiveSalaryMin !== undefined) {
        query.set('salary_min', String(effectiveSalaryMin))
      }

      const url = `/api/jobs-count?${query.toString()}`

      console.log('Fetching count via API route:', url)

      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        console.log('Count reçu:', data.count)
        setJobCount(data.count ?? 0)
      } catch (err) {
        console.error('Error loading count:', err)
        setJobCount(0)
      } finally {
        setLoadingCount(false)
      }
    }

    loadCount()
  }, [initialWhat, initialWhere, initialSalaryMin, aiFilters])

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
                  {jobCount.toLocaleString()}
                </span>{' '}
                positions available
                {displayWhat ? ` for "${displayWhat}"` : ''}
              </>
            ) : (
              'No positions found matching the criteria.'
            )}
          </p>

          {/* AI section juste ici */}
          <AIJobMatcher onFiltersChange={setAiFilters} />

         

          <InfiniteJobList
            what={
              aiFilters?.title ||
              (aiFilters?.keywords?.length ? aiFilters.keywords.join(' ') : initialWhat)
            }
            where={aiFilters?.location || initialWhere}
            salary_min={
              aiFilters?.minSalary !== undefined
                ? String(aiFilters.minSalary)
                : initialSalaryMin !== undefined
                  ? String(initialSalaryMin)
                  : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}