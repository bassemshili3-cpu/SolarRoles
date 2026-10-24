import { textBaseSalary, salaryPeriod } from './ats/salaryFields'
import { htmlText } from './ats/sourceFields'

export type JobPostingBaseSalary = {
  '@type': 'MonetaryAmount'
  currency: 'USD'
  value: { '@type': 'QuantitativeValue'; unitText: string; value?: number; minValue?: number; maxValue?: number }
}
type SalaryInput = {
  source: string; salary?: string | null; salary_min?: number | null; salary_max?: number | null
  salaryPeriod?: string | null; compensationType?: string | null; description?: string | null
}
const sources = new Set(['employer', 'jazzhr', 'breezy', 'workable', 'lever', 'ashby', 'smartrecruiters', 'jobvite', 'greenhouse', 'pinpoint', 'workday', 'rippling', 'successfactors', 'oraclecloud', 'ukg', 'icims', 'adp', 'paylocity', 'paycom', 'hrmdirect', 'saashr', 'bamboohr', 'custom-scrape', 'qcells', 'first-party-careers'])
const factors: Record<string, number> = { HOUR: 2080, DAY: 260, WEEK: 52, MONTH: 12, YEAR: 1 }
const estimate = /\best(?:imated|imate|imation)?\.?\b|market average|salary benchmark|salary estimate|~|\b(?:CAD|AUD|NZD|SGD|HKD|EUR|GBP)\b|[€£]|CA\$|C\$/i
const variable = /\b(?:OTE|on.target earnings|earning potential|total (?:compensation|earnings)|commission|bonus|sign.on|per diem|reimbursement|allowance)\b/i

function schema(low: number | undefined, high: number | undefined, unitText: string): JobPostingBaseSalary | undefined {
  if (low !== undefined && (!Number.isFinite(low) || low <= 0) || high !== undefined && (!Number.isFinite(high) || high <= 0)) return
  if (low === undefined && high === undefined || low !== undefined && high !== undefined && high < low) return
  const round = (n: number) => Math.round(n * 100) / 100
  return { '@type': 'MonetaryAmount', currency: 'USD', value: {
    '@type': 'QuantitativeValue', unitText,
    ...(low !== undefined && low === high ? { value: round(low) } : {
      ...(low !== undefined ? { minValue: round(low) } : {}), ...(high !== undefined ? { maxValue: round(high) } : {}),
    }),
  } }
}

/** Employer pay disclosures with a named salary field, not arbitrary dollar amounts. */
function disclosedSalary(text: string): JobPostingBaseSalary | undefined {
  // Some legacy descriptions contain JSON-escaped whitespace/dashes as text.
  const clean = htmlText(text.replace(/\\u(?:00a0|0020)/gi, ' ').replace(/\\u201[34]/gi, '-'))
    // A disclosure can put its label after the amount.
    .replace(/(\$\s*\d[\d,]*(?:\.\d{1,2})?\s*[-\u2013\u2014]\s*\$?\s*\d[\d,]*(?:\.\d{1,2})?)\s+(Individual Compensation)\b/gi, '$2: $1 $2')
    .replace(/\bexpected salary for this position,?\s*(?:at commencement of employment,?\s*)?is between\s*(\$[\d,.]+)\s+and\s*(\$[\d,.]+)/gi, 'Salary Range: $1 - $2')
    .replace(/\bPay:\s*(\$[\d,.]+\s*[-\u2013\u2014]\s*\$[\d,.]+)\s*(?=The pay listed is the salary range)/gi, 'Salary Range: $1 ')
    .replace(/USD\s*\$/gi, '$')
    .replace(/\/per\s+(hour|year|month|week|day)\b/gi, '/$1')
  const candidates: JobPostingBaseSalary[] = []
  const pattern = /\b(compensation range|pay range|base compensation|hiring range|hiring salary range of|salary hiring range|salary commensurate with experience|pay equity(?: statement)?|starting salary\s*\/\s*wage for this opportunity|(?:annual |hourly )?base salary(?: range)?(?: for this (?:role|position)(?: is)?| of| ranges from)?|typical base compensation for [^.;:$]{1,90}? role is between|salary(?: range(?: for this (?:role|position)(?: is)?)?)?|individual compensation)\s*[:\-]?\s*(?:USD\s*)?\$\s*(\d[\d,]*(?:\.\d{1,2})?)\s*([kK])?\s*(?:[-\u2013\u2014]|to)\s*(?:USD\s*|\$\s*)?(\d[\d,]*(?:\.\d{1,2})?)\s*([kK])?/gi
  for (const match of clean.matchAll(pattern)) {
    const before = clean.slice(Math.max(0, match.index! - 100), match.index!)
    const after = clean.slice(match.index! + match[0].length, match.index! + match[0].length + 180)
    const clause = before.split(/[.;!?]\s+/).at(-1) || ''
    // Variable pay in a later benefits sentence does not invalidate a distinct base.
    if (estimate.test(clause + match[0] + after.slice(0, 40))
      || /\b(?:OTE|on.target earnings|total compensation|total earnings|earning potential|commission.only|including (?:bonus|commission))\b/i.test(clause)
      || /\btotal\s*$/i.test(clause)
      || /\b(?:bonus|commission|reimbursement|per diem|allowance|sign.on)\s*$/i.test(clause)
      || /\b(?:previous|prior|former|historical|expected|desired)\s*$/i.test(clause)
      || /^\s*(?:\+|including\b|includes\b|(?:in\s+)?(?:OTE|on.target earnings|total compensation|total earnings|commission|bonus)\b)/i.test(after)
      || /^\s*(?:or\b|[-\u2013\u2014]|to\s+\$|minimum\b|maximum\b|or more\b|and up\b)/i.test(after)
      || /\b(?:up to|at least|minimum|maximum|from)\s*$/i.test(clause)) continue
    if (/project.based|contract rates|piece.rate|estimate based on market data/i.test(after)) continue
    let low = Number(match[2].replace(/,/g, '')) * (match[3] ? 1000 : 1)
    const high = Number(match[4].replace(/,/g, '')) * (match[5] ? 1000 : 1)
    if (match[5] && !match[3] && low < 1000) low *= 1000
    const suffix = after.match(/^\s*(?:(?:USD|US)\s*)?(?:(?:\/|per|an?|each)\s*)?(hour(?:ly)?|hr|year(?:ly)?|yr|annual(?:ly)?|month(?:ly)?|mo|week(?:ly)?|wk|day|daily)\b/i)
    const frequency = after.match(/^\s*(?:Pay Frequency|Pay Rate Type|Salary Basis)\s*:\s*(Hourly|Salary|Annual(?:ly)?|Yearly|Monthly|Weekly|Daily)\b/i)?.[1]
    let period = suffix ? salaryPeriod(suffix[1]) : salaryPeriod(frequency || '') || salaryPeriod(match[1])
    // US employer disclosure convention when no frequency is written. These are
    // inferred units, bounded to avoid confusing weekly/monthly or implausible pay.
    if (!period && low >= 20000 && high <= 600000) period = 'YEAR'
    if (!period && /starting salary\s*\/\s*wage|base salary range/i.test(match[1]) && low >= 10 && high <= 300) period = 'HOUR'
    if (!period) continue
    const value = schema(low, high, period)
    if (value) candidates.push(value)
  }
  const unique = [...new Map(candidates.map(value => [JSON.stringify(value), value])).values()]
  return unique.length === 1 ? unique[0] : undefined
}

function explicitTextSalary(text: string, salaryLabel: boolean): JobPostingBaseSalary | undefined {
  // Selecting one state/level needs job-specific evidence. A frequency attached
  // only to the first band must not make it the sole candidate by accident.
  if (!salaryLabel && /\b(?:by state|by jurisdiction|by job level)\b/i.test(text)
    && [...text.matchAll(/\$\s*\d[\d,.]*\s*[-\u2013\u2014]\s*\$?\s*\d/gi)].length > 1) return
  // Employer/ATS salary fields can put the currency after native amounts. Match
  // the entire label, so an OTE suffix or an alternative range is never ignored.
  if (salaryLabel) {
    const native = htmlText(text).match(/^(\d[\d,]*(?:\.\d{1,2})?)\s*[-\u2013\u2014]\s*(\d[\d,]*(?:\.\d{1,2})?)\s+USD\s*\/\s*(hour|hr|year|yr|day|week|month)\s*$/i)
    if (native) return schema(Number(native[1].replace(/,/g, '')), Number(native[2].replace(/,/g, '')), salaryPeriod(native[3])!)
  }
  const disclosure = disclosedSalary(text)
  if (disclosure) return disclosure
  if (estimate.test(text)) return
  // The shared legacy range parser accepts a bare period suffix. Remove earning
  // potential ranges first so it cannot promote sales projections to base pay.
  const baseText = htmlText(text).replace(/(?:USD\s*|\$\s*)(\d[\d,]*(?:\.\d{1,2})?\s*[kK]?)\s*(?:[-\u2013\u2014]|to)\s*(?:USD\s*|\$\s*)?(\d[\d,]*(?:\.\d{1,2})?\s*[kK]?)/gi,
    (match, _low, _high, offset: number, full: string) => {
      const clause = full.slice(Math.max(0, offset - 150), offset).split(/[.;!?]\s+/).at(-1) || ''
      return /\b(?:earning potential|on.target earnings|total compensation|total earnings)\b/i.test(clause) ? '' : match
    })
  const range = textBaseSalary(baseText, salaryLabel)
  if (range) return schema(range.salaryMin / factors[range.salaryPeriod], range.salaryMax / factors[range.salaryPeriod], range.salaryPeriod)
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const matches: JobPostingBaseSalary[] = []
  const fixed = /(?:USD\s*|\$\s*)(\d[\d,]*(?:\.\d{1,2})?)\s*([kK])?\s*(?:(?:\/|per|an?|each)\s*)?(hour(?:ly)?|hr|year(?:ly)?|yr|annual(?:ly)?|month(?:ly)?|mo|week(?:ly)?|wk|day|daily)\b/gi
  for (const match of clean.matchAll(fixed)) {
    const before = clean.slice(Math.max(0, match.index! - 100), match.index!).split(/[.;!?]\s+/).at(-1) || ''
    const after = clean.slice(match.index! + match[0].length, match.index! + match[0].length + 35)
    if (variable.test(before) || /^\s*(?:in\s+)?(?:bonus|commission|OTE|per diem)/i.test(after)) continue
    if (!salaryLabel && !/\b(?:salary|base pay|pay rate|hourly rate|wage|compensation)\b/i.test(before)) continue
    // A suffix of a range or an open-ended bound is not a fixed salary.
    if (/(?:[-–—]|\bto)\s*$/i.test(before) || /\b(?:from|up to|starting at|at least|minimum|maximum)\b/i.test(before)
      || /^\s*(?:minimum|maximum|or more|and up|\+)/i.test(after)) continue
    const amount = Number(match[1].replace(/,/g, '')) * (match[2] ? 1000 : 1)
    const period = salaryPeriod(match[3])
    if (period) { const value = schema(amount, amount, period); if (value) matches.push(value) }
  }
  const unique = [...new Map(matches.map(value => [JSON.stringify(value), value])).values()]
  return unique.length === 1 ? unique[0] : undefined
}

/** Called on immutable source fields BEFORE display salary resolution/estimates. */
export function buildJobPostingBaseSalary(job: SalaryInput): JobPostingBaseSalary | undefined {
  if (!sources.has(job.source) || job.compensationType === 'COMMISSION_ONLY') return
  const label = job.salary || ''
  // A guaranteed fixed base can be stated in a separate sentence from sales
  // commissions. Do not treat the commission sentence as part of its amount.
  const fixedBase = htmlText(label).match(/^Base salary is\s*\$(\d[\d,]*(?:\.\d{1,2})?)\s*([kK])?\s*\.\s*Commission\b/i)
  if (fixedBase && !estimate.test(label)) {
    const amount = Number(fixedBase[1].replace(/,/g, '')) * (fixedBase[2] ? 1000 : 1)
    if (amount >= 20000 && amount <= 600000) return schema(amount, amount, 'YEAR')
  }
  if (estimate.test(label) || variable.test(label) && !(job.compensationType === 'BASE_COMMISSION' && /\bbase\b|\+\s*commission/i.test(label))) return
  const period = salaryPeriod(job.salaryPeriod || '') || salaryPeriod(label)
  const low = job.salary_min ?? undefined, high = job.salary_max ?? undefined
  // Legacy rows mix native and annualized numeric fields. An explicit employer
  // label has unambiguous units and takes precedence over those numeric fields.
  const explicit = explicitTextSalary(label, true)
  if (explicit && /^\s*[\d,.]+\s*[-\u2013\u2014]\s*[\d,.]+\s+USD\s*\//i.test(label)) {
    const value = explicit.value
    // A native ATS field is evidence, but a contradictory salary disclosure in
    // the same offer needs review instead of silently choosing one version.
    const disclosed = htmlText(job.description || '').matchAll(/\bsalary(?: range)?\s*:\s*\$\s*(\d[\d,]*(?:\.\d{1,2})?)\s*[-\u2013\u2014]\s*\$?\s*(\d[\d,]*(?:\.\d{1,2})?)/gi)
    for (const match of disclosed) {
      if (Number(match[1].replace(/,/g, '')) !== (value.minValue ?? value.value)
        || Number(match[2].replace(/,/g, '')) !== (value.maxValue ?? value.value)) return
    }
  }
  if (explicit) return explicit
  if (period && (low !== undefined || high !== undefined)) {
    if (period !== 'YEAR' && job.source !== 'employer' && Math.min(low ?? Infinity, high ?? Infinity) < 20000) {
      // Native-looking legacy amounts need textual evidence; never divide them
      // as if they had already been annualized.
      return explicitTextSalary(job.description || '', false)
    }
    // Ingestion stores annualized numeric amounts for both ATS and employer jobs.
    return schema(low === undefined ? undefined : low / factors[period], high === undefined ? undefined : high / factors[period], period)
  }
  return explicitTextSalary(job.description || '', false)
}
