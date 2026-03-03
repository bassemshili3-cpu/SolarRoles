'use client'

import { useQuery } from '@tanstack/react-query'
import JobCard from './JobCard'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function JobList({ what, where, salary_min }: { what: string; where: string; salary_min?: string }) {
  const [page, setPage] = useState(1)
  const resolvedWhat = what || ''
  const resolvedWhere = where || ''

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs', resolvedWhat, resolvedWhere, salary_min, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        what: resolvedWhat,
        where: resolvedWhere,
        page: page.toString(),
        results_per_page: '30',
      })
      if (salary_min) params.set('salary_min', salary_min)
      const res = await fetch(`/api/jobs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch jobs')
      return res.json()
    },
    retry: 1,
  })

  const totalPages = data?.count ? Math.ceil(data.count / 30) : 1

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    if (data?.results) {
      // on continue et on affiche les jobs en cache ci-dessous
    } else {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Unable to load jobs. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      )
    }
  }

  return (
    <div>
      {/* ← ICI LA MAGIE */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {(data?.results || []).map((job: any) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-10">
        <Button
          variant="outline"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          ← Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages}
        >
          Next →
        </Button>
      </div>
    </div>
  )
}