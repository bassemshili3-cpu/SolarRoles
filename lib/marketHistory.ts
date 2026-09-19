export type HistoryPeriod = 7 | 30

export type ComparisonMode = 'percentage-points' | 'relative-percent' | 'absolute'

export type MarketHistoryPoint = {
  date: string
  value: number
  numerator?: number
  denominator?: number
}

export type HistoricalComparison = {
  point: MarketHistoryPoint
  delta: number
  tone: 'up' | 'down' | 'flat'
}

const DAY_MS = 86_400_000

export function utcDateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

function timestamp(value: string) {
  return new Date(`${utcDateKey(value)}T00:00:00.000Z`).getTime()
}

export function mergeCurrentHistoryPoint(
  points: MarketHistoryPoint[],
  current: Omit<MarketHistoryPoint, 'date'> | null,
  currentDate: string,
) {
  if (!current || !Number.isFinite(current.value)) return points

  const date = utcDateKey(currentDate)
  return [
    ...points.filter((point) => utcDateKey(point.date) !== date),
    { date, ...current },
  ].sort((a, b) => timestamp(a.date) - timestamp(b.date))
}

export function pointsForPeriod(points: MarketHistoryPoint[], period: HistoryPeriod, currentDate: string) {
  const end = timestamp(currentDate)
  const start = end - period * DAY_MS

  return points.filter((point) => {
    const time = timestamp(point.date)
    return time >= start && time <= end
  })
}

export function splitHistorySegments(points: MarketHistoryPoint[]) {
  const ordered = [...points].sort((a, b) => timestamp(a.date) - timestamp(b.date))
  const segments: MarketHistoryPoint[][] = []

  for (const point of ordered) {
    const segment = segments[segments.length - 1]
    const previous = segment?.[segment.length - 1]

    if (!previous || timestamp(point.date) - timestamp(previous.date) > DAY_MS * 1.5) {
      segments.push([point])
    } else {
      segment.push(point)
    }
  }

  return segments
}

export function findComparisonPoint(
  points: MarketHistoryPoint[],
  period: HistoryPeriod,
  currentDate: string,
) {
  const target = timestamp(currentDate) - period * DAY_MS
  let closest: MarketHistoryPoint | null = null
  let closestDistance = Number.POSITIVE_INFINITY

  for (const point of points) {
    const distance = Math.abs(timestamp(point.date) - target)
    if (distance < closestDistance) {
      closest = point
      closestDistance = distance
    }
  }

  return closest && closestDistance <= DAY_MS ? closest : null
}

export function compareHistory(
  currentValue: number | null | undefined,
  points: MarketHistoryPoint[],
  period: HistoryPeriod,
  currentDate: string,
  mode: ComparisonMode,
): HistoricalComparison | null {
  if (currentValue == null || !Number.isFinite(currentValue)) return null
  const point = findComparisonPoint(points, period, currentDate)
  if (!point) return null

  let delta: number
  if (mode === 'relative-percent') {
    if (point.value === 0) return null
    delta = ((currentValue - point.value) / Math.abs(point.value)) * 100
  } else {
    delta = currentValue - point.value
  }

  return {
    point,
    delta,
    tone: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
  }
}

export function observedDayCount(points: MarketHistoryPoint[], period: HistoryPeriod, currentDate: string) {
  return Math.min(
    period,
    new Set(pointsForPeriod(points, period, currentDate).map((point) => utcDateKey(point.date))).size,
  )
}
