import { extractSalaryFromText } from './extractSalary'

type SalaryJob = {
  title: string
  description?: string | null
  salary?: string | null
  salary_min?: number | null
  salary_max?: number | null
}

export function resolveJobSalary(job: SalaryJob) {
  const { salary_min, salary_max } = job

  if (salary_min && salary_max && salary_min !== salary_max) {
    return {
      salary: job.salary || `$${salary_min.toLocaleString('en-US')} - $${salary_max.toLocaleString('en-US')}/year`,
      salary_min,
      salary_max,
    }
  }

  const extracted = extractSalaryFromText(job.title, job.description || '')
  if (extracted) {
    return { salary: extracted.display, salary_min: extracted.min, salary_max: extracted.max }
  }

  return {
    salary: salary_min && salary_min === salary_max
      ? `~$${salary_min.toLocaleString('en-US')}/year (est.)`
      : job.salary || undefined,
    salary_min: salary_min || undefined,
    salary_max: salary_max || undefined,
  }
}
