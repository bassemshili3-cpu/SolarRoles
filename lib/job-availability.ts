/** Match the public listing policy without turning expired offers into 410s. */
export function isJobAvailable(
  job: { active: boolean; expiresAt: Date | string } | null,
  now = new Date(),
): boolean {
  return Boolean(job?.active && new Date(job.expiresAt).getTime() > now.getTime())
}
