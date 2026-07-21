// lib/employerJobStatus.ts
export type JobStatus = 'active' | 'paused' | 'expired'

export function deriveStatus(job: {
  expiresAt: Date
  pausedAt: Date | null
}): JobStatus {
  if (job.expiresAt < new Date()) return 'expired'
  if (job.pausedAt) return 'paused'
  return 'active'
}