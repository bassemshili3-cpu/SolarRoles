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
    retry: 1, // Retry only once on failure
  })

  const totalPages = data?.count ? Math.ceil(data.count / 30) : 1

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  // Error state - juste afficher les jobs si erreur (comme avant)
  if (isError) {
    // Si erreur, on affiche quand même les jobs s'il y en a en cache
    if (data?.results) {
      // Afficher les données en cache
    } else {
      // Afficher un message d'erreur simple
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
      <div className="grid gap-6">
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