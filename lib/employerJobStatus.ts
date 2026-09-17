// lib/employerJobStatus.ts
export type JobStatus = 'active' | 'paused' | 'expired' | 'draft'

export function deriveStatus(job: {
  expiresAt: Date
  pausedAt: Date | null
  active: boolean
  paymentStatus?: string
}): JobStatus {
  if (job.paymentStatus === 'pending' || job.paymentStatus === 'failed') return 'draft'
  if (job.expiresAt < new Date()) return 'expired'
  if (job.pausedAt || !job.active) return 'paused'
  return 'active'
}
