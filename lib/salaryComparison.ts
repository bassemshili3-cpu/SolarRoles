// lib/salaryComparison.ts

export type SalaryComparison = {
  direction: 'above' | 'below' | 'average'
  percentDiff: number // toujours positif, le sens est donné par `direction`
}

// En dessous de ce seuil, on considère que l'offre est "dans la moyenne"
// plutôt que d'afficher un +/-2% qui n'apporte rien.
const AVERAGE_THRESHOLD_PERCENT = 5

export function compareSalaryToMarket(
  jobSalaryMin: number | undefined,
  jobSalaryMax: number | undefined,
  marketAvgSalary: number | undefined
): SalaryComparison | null {
  if (!jobSalaryMin || !jobSalaryMax || !marketAvgSalary) return null

  const jobMidpoint = (jobSalaryMin + jobSalaryMax) / 2
  const diff = jobMidpoint - marketAvgSalary
  const percentDiff = Math.round((Math.abs(diff) / marketAvgSalary) * 100)

  if (percentDiff < AVERAGE_THRESHOLD_PERCENT) {
    return { direction: 'average', percentDiff }
  }

  return { direction: diff > 0 ? 'above' : 'below', percentDiff }
}