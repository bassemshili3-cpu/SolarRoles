/**
 * extractSalary.ts
 *
 * Extracts salary information from job title and description
 * when structured salary fields are not provided by the API.
 */

type SalaryResult = {
  display: string
  min?: number
  max?: number
  raw: string
  period: 'hour' | 'week' | 'month' | 'year'
}

/**
 * Try to extract salary from text (title + description).
 * Returns null if no salary pattern is found.
 */
export function extractSalaryFromText(
  title: string,
  description: string
): SalaryResult | null {
  const text = `${title} ||| ${stripHtml(description)}`

  return matchRange(text) || matchSingle(text) || null
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// ─── Range: $X – $Y ─────────────────────────────────────────────────────────

function matchRange(text: string): SalaryResult | null {
  // Match $X - $Y with flexible gap before period word
  // Captures: (amount1) (separator) (amount2) (up to 5 words after for context)
  const rangeRegex =
    /\$\s*([\d,]+(?:\.\d{1,2})?)\s*([kK])?\s*(?:[-–—]|to)\s*\$?\s*([\d,]+(?:\.\d{1,2})?)\s*([kK])?\s*(.{0,40})/gi

  let bestMatch: SalaryResult | null = null

  let match: RegExpExecArray | null
  while ((match = rangeRegex.exec(text)) !== null) {
    let low = parseNum(match[1])
    let high = parseNum(match[3])
    const context = match[5] || ''

    // Handle k suffix
    if (match[2] || /^\s*k\b/i.test(context)) {
      if (low < 1000) low *= 1000
      if (high < 1000) high *= 1000
    }
    if (match[4]) {
      if (high < 1000) high *= 1000
    }

    // Skip garbage: both values 0 or unreasonable
    if (low <= 0 || high <= 0) continue
    if (high < low) continue

    // Skip "per mile" / CPM — not a salary
    if (/(?:per\s+mile|cents?\s+per\s+mile|cpm)/i.test(context)) continue

    // Detect period from context after the numbers
    const period = detectPeriodFromContext(context, low, high)

    const { annualMin, annualMax } = annualize(low, high, period)

    const result: SalaryResult = {
      display: formatRange(low, high, period),
      min: annualMin,
      max: annualMax,
      raw: match[0].trim(),
      period,
    }

    // Prefer matches from the title (before |||)
    if (match.index < text.indexOf('|||')) return result

    // Otherwise keep the first reasonable match
    if (!bestMatch) bestMatch = result
  }

  return bestMatch
}

// ─── Single: $X/hr, $X per hour ─────────────────────────────────────────────

function matchSingle(text: string): SalaryResult | null {
  const singleRegex =
    /\$\s*([\d,]+(?:\.\d{1,2})?)\s*([kK])?\s*(.{0,30})/gi

  let match: RegExpExecArray | null
  while ((match = singleRegex.exec(text)) !== null) {
    let val = parseNum(match[1])
    const context = match[3] || ''

    if (match[2]) {
      if (val < 1000) val *= 1000
    }

    if (val <= 0) continue
    if (/(?:per\s+mile|cpm)/i.test(context)) continue

    // Only match if context explicitly has a period word
    const explicitPeriod = extractExplicitPeriod(context)
    if (!explicitPeriod) continue

    const { annualMin, annualMax } = annualize(val, val, explicitPeriod)

    return {
      display: formatSingle(val, explicitPeriod),
      min: annualMin,
      max: annualMax,
      raw: match[0].trim(),
      period: explicitPeriod,
    }
  }

  return null
}

// ─── Period detection ────────────────────────────────────────────────────────

/**
 * Look at the text following the dollar amount(s) for period indicators.
 * Allows intervening words like "total weekly avg" or "gross per week".
 */
function detectPeriodFromContext(
  context: string,
  low: number,
  high: number
): 'hour' | 'week' | 'month' | 'year' {
  const c = context.toLowerCase()

  // Explicit period words (within the context window)
  if (/\b(?:per\s+hour|hourly|\/\s*hr|\/\s*hour|an\s+hour)\b/.test(c)) return 'hour'
  if (/\b(?:per\s+week|weekly|\/\s*wk|\/\s*week|a\s+week)\b/.test(c)) return 'week'
  if (/\b(?:per\s+month|monthly|\/\s*mo|\/\s*month|a\s+month)\b/.test(c)) return 'month'
  if (/\b(?:per\s+year|yearly|annually|annual|\/\s*yr|\/\s*year|a\s+year)\b/.test(c)) return 'year'

  // Infer from value range
  return inferPeriodFromValue(low, high)
}

function extractExplicitPeriod(context: string): 'hour' | 'week' | 'month' | 'year' | null {
  const c = context.toLowerCase()
  if (/\b(?:per\s+hour|hourly|\/\s*hr|\/\s*hour)\b/.test(c)) return 'hour'
  if (/\b(?:per\s+week|weekly|\/\s*wk|\/\s*week)\b/.test(c)) return 'week'
  if (/\b(?:per\s+month|monthly|\/\s*mo|\/\s*month)\b/.test(c)) return 'month'
  if (/\b(?:per\s+year|yearly|annually|annual|\/\s*yr|\/\s*year)\b/.test(c)) return 'year'
  return null
}

function inferPeriodFromValue(low: number, high: number): 'hour' | 'week' | 'month' | 'year' {
  const avg = (low + high) / 2
  if (avg <= 150) return 'hour'
  if (avg <= 6000) return 'week'
  if (avg <= 25000) return 'month'
  return 'year'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseNum(s: string): number {
  return parseFloat(s.replace(/,/g, ''))
}

function annualize(
  min: number,
  max: number,
  period: 'hour' | 'week' | 'month' | 'year'
): { annualMin: number; annualMax: number } {
  const multipliers = { hour: 2080, week: 52, month: 12, year: 1 }
  const m = multipliers[period]
  return {
    annualMin: Math.round(min * m),
    annualMax: Math.round(max * m),
  }
}

function formatRange(low: number, high: number, period: 'hour' | 'week' | 'month' | 'year'): string {
  const labels = { hour: '/hr', week: '/week', month: '/month', year: '/year' }
  return `$${fmtNum(low)} – $${fmtNum(high)}${labels[period]}`
}

function formatSingle(val: number, period: 'hour' | 'week' | 'month' | 'year'): string {
  const labels = { hour: '/hr', week: '/week', month: '/month', year: '/year' }
  return `$${fmtNum(val)}${labels[period]}`
}

function fmtNum(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US')
  if (n % 1 !== 0) return n.toFixed(2)
  return n.toString()
}