const MIN_ANNUAL_PAY = 20_000
const MAX_ANNUAL_PAY = 600_000

const PERIODS = {
  HOUR: { multiplier: 2_080, suffix: '/hr' },
  DAY: { multiplier: 260, suffix: '/day' },
  WEEK: { multiplier: 52, suffix: '/week' },
  MONTH: { multiplier: 12, suffix: '/month' },
  YEAR: { multiplier: 1, suffix: '/year' },
} as const

function periodInfo(raw: string | null) {
  const period = raw?.trim().toUpperCase() ?? ''
  if (/^(HOUR|HR|HOURLY)$/.test(period)) return PERIODS.HOUR
  if (/^(DAY|DAILY)$/.test(period)) return PERIODS.DAY
  if (/^(WEEK|WK|WEEKLY)$/.test(period)) return PERIODS.WEEK
  if (/^(MONTH|MO|MONTHLY)$/.test(period)) return PERIODS.MONTH
  if (/^(YEAR|YR|ANNUAL|ANNUALLY|YEARLY)$/.test(period)) return PERIODS.YEAR
  return null
}

function amount(value: number) {
  return value >= 10_000
    ? `$${Math.round(value / 1_000)}k`
    : `$${value.toLocaleString('en-US')}`
}

export function formatWidgetSalary(
  min: number | null,
  max: number | null,
  period: string | null
) {
  if (min == null || max == null) return 'Salary not listed'
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) {
    return 'Pay not shown'
  }

  const info = periodInfo(period)
  // A missing unit is treated as annual only for the sanity check, never as
  // proof that the employer stated an annual rate.
  const multiplier = info?.multiplier ?? 1
  if (min * multiplier < MIN_ANNUAL_PAY || max * multiplier > MAX_ANNUAL_PAY) {
    return 'Pay not shown'
  }

  const suffix = info?.suffix ?? ' (period unspecified)'
  if (min === max) return `${amount(min)}${suffix}`

  let low = amount(min)
  let high = amount(max)
  if (low === high) {
    low = `$${min.toLocaleString('en-US')}`
    high = `$${max.toLocaleString('en-US')}`
  }
  return `${low}–${high}${suffix}`
}
