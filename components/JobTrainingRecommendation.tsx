'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { JobTrainingRecommendation as Recommendation } from '@/lib/freeTraining'
import { trackTrainingEvent } from '@/lib/trainingAnalytics'

export default function JobTrainingRecommendation({ recommendation }: { recommendation: Recommendation }) {
  const linkText = recommendation.categoryId === 'general' ? 'explore free introductory courses'
    : recommendation.description.includes('take a free introductory course') ? 'take a free introductory course'
      : 'take a free course'
  const linkStart = recommendation.description.indexOf(linkText)
  const linkedText = linkStart >= 0 ? linkText : recommendation.description
  const element = useRef<HTMLElement>(null)
  const seen = useRef(false)
  useEffect(() => {
    if (!element.current || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5 || seen.current) return
      seen.current = true
      trackTrainingEvent('training_recommendation_impression', recommendation.categoryId, recommendation.eligibility)
      observer.disconnect()
    }, { threshold: 0.5 })
    observer.observe(element.current)
    return () => observer.disconnect()
  }, [recommendation.categoryId, recommendation.eligibility])

  return (
    <aside ref={element} aria-label="Free training resources" className="mt-8 rounded-xl border border-border bg-secondary/20 p-4 sm:p-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {linkStart >= 0 ? recommendation.description.slice(0, linkStart) : ''}
        <Link href={recommendation.href} className="font-medium underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        onClick={() => trackTrainingEvent('training_resource_click', recommendation.categoryId, recommendation.eligibility)}>
          {linkedText}
        </Link>
        {linkStart >= 0 ? recommendation.description.slice(linkStart + linkText.length) : ''}
      </p>
    </aside>
  )
}
