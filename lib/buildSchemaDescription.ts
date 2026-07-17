/**
 * buildSchemaDescription.ts
 *
 * Builds a JobPosting schema `description` from factual fields and (when
 * available) the real aggregator source description. NEVER generates filler
 * content — short and honest beats long and AI-flavored.
 */
import { formatJobDescription } from './formatJobDescription'

export interface JobSchemaInput {
  title: string
  company: string
  city: string
  state: string
  stateCode: string
  description: string      // raw from aggregator (may be short/truncated)
  salaryMin?: number
  salaryMax?: number
  employmentType?: string
  remote?: boolean
}

export function buildSchemaDescription(job: JobSchemaInput): string {
  const parts: string[] = []

  // 1. Factual header — always present, always honest
  const header: string[] = [`${job.title} position at ${job.company}`]
  if (job.city && job.stateCode) {
    header.push(`based in ${job.city}, ${job.stateCode}`)
  }
  if (job.remote) header.push('remote-eligible')
  if (job.employmentType) header.push(formatEmploymentType(job.employmentType))
  parts.push(capitalize(header.join(', ') + '.'))

  // 2. Compensation — only if real numbers available
  if (job.salaryMin && job.salaryMax) {
    if (job.salaryMin === job.salaryMax) {
      parts.push(`Salary: $${formatNum(job.salaryMin)} per year.`)
    } else {
      parts.push(`Salary range: $${formatNum(job.salaryMin)} to $${formatNum(job.salaryMax)} per year.`)
    }
  }

  // 3. Real content from the aggregator source — formatted, never generated
  if (job.description) {
    const formatted = stripHtml(formatJobDescription(job.description)).trim()
    if (formatted.length >= 80) {
      parts.push(formatted)
    }
  }

  return parts.join('\n\n')
}

function formatEmploymentType(type?: string): string {
  if (!type) return ''
  const map: Record<string, string> = {
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACTOR: 'contract',
    INTERN: 'internship',
  }
  return map[type] ?? type.toLowerCase().replace('_', '-')
}

function formatNum(n: number): string {
  return n.toLocaleString('en-US')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}