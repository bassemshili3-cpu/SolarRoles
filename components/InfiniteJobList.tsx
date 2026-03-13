'use client'

import { useQuery } from '@tanstack/react-query'
import JobCard from './JobCard'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Bell, Check } from 'lucide-react'

interface JobListProps {
  what: string
  where: string
  salary_min?: string
  initialData?: { results: any[]; count: number } // ← données SSR pour Googlebot
}

export default function JobList({ what, where, salary_min, initialData }: JobListProps) {
  const [page, setPage] = useState(1)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [frequency, setFrequency] = useState<'weekly' | 'twice'>('weekly')

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
    // ← Page 1 : on utilise les données SSR directement, pas de fetch client
    // Page 2+ : fetch client normal
    initialData: page === 1 && initialData ? initialData : undefined,
    retry: 1,
  })

  const totalPages = data?.count ? Math.ceil(data.count / 30) : 1
  const jobType = resolvedWhat ? `${resolvedWhat} ` : ''

  // Loading state — ne s'affiche pas sur page 1 grâce à initialData
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
  if (isError && !data?.results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Unable to load jobs. Please try again.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Jobs */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {(data?.results || []).map((job: any) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Pagination */}
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

      {/* Newsletter */}
      <div className="mt-16 bg-white border border-gray-200 shadow-sm text-gray-900 rounded-3xl p-10">
        <div className="flex items-center gap-5 mb-8">
          <Bell className="w-12 h-10 flex-shrink-0 text-gray-900" />
          <div>
            <h3 className="text-xl font-bold tracking-tight text-gray-900">
              Get the newest {jobType}jobs in your inbox 📧
            </h3>
            <p className="text-gray-400 mt-1">Weekly updates delivered straight to you.</p>
          </div>
        </div>

        {/* Fréquence */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setFrequency('weekly')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              frequency === 'weekly'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFrequency('twice')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              frequency === 'twice'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2x / Week
          </button>
          <div className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 flex items-center gap-2">
            All jobs <span className="text-xs opacity-70">⌄</span>
          </div>
          <div className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 flex items-center gap-2">
            All locations <span className="text-xs opacity-70">⌄</span>
          </div>
          <div className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 flex items-center gap-2">
            All categories <span className="text-xs opacity-70">⌄</span>
          </div>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!email) return
            const res = await fetch('/api/alerts/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                frequency,
                what: resolvedWhat,
                where: resolvedWhere,
                salaryMin: salary_min,
              }),
            })
            if (res.ok) {
              setSubscribed(true)
            } else {
              alert("Error subscribing. Please try again.")
            }
          }}
          className="flex gap-1"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-gray-50 border border-gray-200 focus:border-emerald-400 rounded-md px-2 py-3 text-xs text-gray-700 placeholder:text-gray-300 outline-none"
          />
          <button
            type="submit"
            className="bg-emerald-400 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded-md flex items-center gap-1 text-xs transition-all active:scale-95"
          >
            Subscribe
            <Check className="w-3 h-3" />
          </button>
        </form>

        {subscribed && (
          <p className="mt-4 text-emerald-400 flex items-center gap-2 text-sm font-medium">
            ✅ Thanks! you are now subscribed.
          </p>
        )}
      </div>
    </div>
  )
}