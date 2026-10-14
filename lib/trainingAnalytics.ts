'use client'

import { track } from '@vercel/analytics'
import type { TrainingCategoryId, TrainingEligibility } from './freeTraining'

export function trackTrainingEvent(event: 'training_recommendation_impression' | 'training_resource_click' | 'training_course_click', category: TrainingCategoryId | 'general', eligibility?: TrainingEligibility) {
  try {
    // Never include candidate data, job descriptions, company names or query strings.
    track(event, { occupation_category: category, ...(eligibility ? { experience_signal: eligibility, page_kind: 'job-detail' } : { page_kind: 'free-training' }) })
  } catch {
    // Analytics must never block navigation or applications.
  }
}
