'use client'

import { useRouter } from 'next/navigation'
import AIJobMatcher from '@/components/AIJobMatcher'

type AIFilters = {
  title?: string
  location?: string
  remote?: boolean
  minSalary?: number
  keywords?: string[]
}

export default function AIJobMatcherWrapper() {
  const router = useRouter()

  return (
    <AIJobMatcher
      onFiltersChange={(filters: AIFilters | null) => {
        if (!filters) return

        const params = new URLSearchParams()
        if (filters.title)     params.set('what', filters.title)
        if (filters.location)  params.set('where', filters.location)
        if (filters.minSalary) params.set('salary_min', filters.minSalary.toString())
        if (filters.remote)    params.set('job_type', 'Remote')

        router.push(`/jobs?${params.toString()}`)
      }}
    />
  )
}