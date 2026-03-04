'use client'

import AIJobMatcher from '@/components/AIJobMatcher'

type AIFilters = {
  title?: string
  location?: string
  remote?: boolean
  minSalary?: number
  keywords?: string[]
}

export default function AIJobMatcherWrapper() {
  return (
    <AIJobMatcher
      onFiltersChange={(filters: AIFilters | null) => {
        console.log('AI filters detected:', filters)
      }}
    />
  )
}