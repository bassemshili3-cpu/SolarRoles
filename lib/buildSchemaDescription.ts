/**

 * buildSchemaDescription.ts

 *

 * Builds a JobPosting schema `description` from factual fields and (when

 * available) the real aggregator source description. NEVER generates filler

 * content — short and honest beats long and AI-flavored.

 *

 * Key principles:

 *   - Use real content when we have it (formatted source description)

 *   - Never rotate through templated intros ("Day-to-day..." etc.)

 *   - Never add market context filler ("labor market remains active...")

 *   - Never add generic CTAs ("Qualified candidates... can apply directly")

 *   - If source is short/truncated, return a short honest description

 *

 * Versioning: bump BUILD_VERSION when logic changes meaningfully so the

 * migration script can re-process incrementally.

 */

import { formatJobDescription } from './formatJobDescription'


export const BUILD_VERSION = 2


export interface JobSchemaInput {

  title: string

  company: string

  city: string

  state: string           // e.g. "California"

  stateCode: string       // e.g. "CA"

  description: string     // raw from aggregator (may be short/truncated)

  salaryMin?: number

  salaryMax?: number

  employmentType?: string // "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN"

  remote?: boolean

}


const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {

  FULL_TIME: 'full-time',

  PART_TIME: 'part-time',

  CONTRACTOR: 'contract',

  INTERN: 'internship',

  TEMPORARY: 'temporary',

}


/**

 * Returns a plain-text description string for the JSON-LD `description` field.

 * Output is short, factual, and uses the real source content when available.

 */

export function buildSchemaDescription(job: JobSchemaInput): string {

  const parts: string[] = [buildFactualHeader(job)]


  const comp = buildCompensationLine(job)

  if (comp) parts.push(comp)


  const content = buildContentBlock(job)

  if (content) parts.push(content)


  return parts.join('\n\n')

}


function buildFactualHeader(job: JobSchemaInput): string {

  const tokens: string[] = [`${job.title} position at ${job.company}`]


  if (job.city && job.stateCode) {

    tokens.push(`based in ${job.city}, ${job.stateCode}`)

  }


  const typeLabel = job.employmentType ? EMPLOYMENT_TYPE_LABELS[job.employmentType] : ''

  if (typeLabel) tokens.push(typeLabel)

  if (job.remote) tokens.push('remote-eligible')


  return capitalize(tokens.join(', ') + '.')

}


function buildCompensationLine(job: JobSchemaInput): string | null {

  if (!job.salaryMin || !job.salaryMax) return null


  if (job.salaryMin === job.salaryMax) {

    return `Salary: $${formatNum(job.salaryMin)} per year.`

  }


  return `Salary range: $${formatNum(job.salaryMin)} to $${formatNum(job.salaryMax)} per year.`

}


function buildContentBlock(job: JobSchemaInput): string | null {

  if (!job.description) return null


  const formatted = stripHtml(formatJobDescription(job.description)).trim()

  if (formatted.length < 80) return null


  return formatted

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

    .replace(/<\/li>/gi, '\n')

    .replace(/<[^>]*>/g, '')

    .replace(/&nbsp;/g, ' ')

    .replace(/&amp;/g, '&')

    .replace(/&lt;/g, '<')

    .replace(/&gt;/g, '>')

    .replace(/&#\d+;/g, '')

    .replace(/\s+/g, ' ')

    .trim()

}

