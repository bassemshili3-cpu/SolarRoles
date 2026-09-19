'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import type { MetricValue } from '@/lib/solarMarketMetrics'
import {
  compareHistory,
  observedDayCount,
  pointsForPeriod,
  splitHistorySegments,
  utcDateKey,
  type ComparisonMode,
  type HistoryPeriod,
  type MarketHistoryPoint,
} from '@/lib/marketHistory'

const HistoryPeriodContext = createContext<{
  period: HistoryPeriod
  setPeriod: (period: HistoryPeriod) => void
} | null>(null)

function useHistoryPeriod() {
  const context = useContext(HistoryPeriodContext)
  if (!context) throw new Error('Market history controls must be inside MarketHistoryProvider')
  return context
}

export function MarketHistoryProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<HistoryPeriod>(7)
  const value = useMemo(() => ({ period, setPeriod }), [period])
  return <HistoryPeriodContext.Provider value={value}>{children}</HistoryPeriodContext.Provider>
}

export function HistoryPeriodSelector() {
  const { period, setPeriod } = useHistoryPeriod()

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-100/60">
      <div>
        <p className="text-sm font-semibold text-slate-900">Daily trend window</p>
        <p className="mt-0.5 text-xs text-slate-500">One selection controls every indicator below.</p>
      </div>
      <div className="inline-flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Daily trend window">
        {([7, 30] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={period === value}
            onClick={() => setPeriod(value)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              period === value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {value} days
          </button>
        ))}
      </div>
    </div>
  )
}

function formatMetric(metric: MetricValue | undefined) {
  if (!metric || metric.value == null) return '—'
  if (metric.unit === 'currency') return `$${Math.round(metric.value).toLocaleString('en-US')}`
  if (metric.unit === 'rate') return `${metric.value.toFixed(1)}%`
  if (metric.unit === 'days') return `${Math.round(metric.value)} days`
  return Math.round(metric.value).toLocaleString('en-US')
}

function formatPointValue(value: number, unit: MetricValue['unit']) {
  if (unit === 'currency') return `$${Math.round(value).toLocaleString('en-US')}`
  if (unit === 'rate') return `${value.toFixed(1)}%`
  if (unit === 'days') return `${Math.round(value)} days`
  return Math.round(value).toLocaleString('en-US')
}

function sampleLine(metric: MetricValue | undefined, noun = 'eligible openings') {
  if (!metric || metric.numerator == null || metric.denominator == null || metric.denominator <= 0) return null
  return `${metric.numerator.toLocaleString('en-US')} of ${metric.denominator.toLocaleString('en-US')} ${noun}`
}

function comparisonLabel(delta: number, mode: ComparisonMode, date: string) {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : ''
  const amount = Math.abs(delta)
  const formatted = mode === 'percentage-points'
    ? `${amount.toFixed(1)} pp`
    : mode === 'relative-percent'
      ? `${amount.toFixed(1)}%`
      : Math.round(amount).toLocaleString('en-US')
  const dateLabel = new Date(`${utcDateKey(date)}T00:00:00.000Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return `${sign}${formatted} vs ${dateLabel}`
}

function Sparkline({
  points,
  period,
  currentDate,
  unit,
}: {
  points: MarketHistoryPoint[]
  period: HistoryPeriod
  currentDate: string
  unit: MetricValue['unit']
}) {
  const [activePoint, setActivePoint] = useState<MarketHistoryPoint | null>(null)
  const visible = pointsForPeriod(points, period, currentDate)
  if (visible.length < 2) {
    return (
      <div className="mt-4 flex h-12 items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 text-[11px] text-slate-400">
        Daily history is collecting.
      </div>
    )
  }

  const values = visible.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const width = 260
  const height = 46
  const end = new Date(`${utcDateKey(currentDate)}T00:00:00.000Z`).getTime()
  const start = end - period * 86_400_000
  const x = (point: MarketHistoryPoint) => ((new Date(`${utcDateKey(point.date)}T00:00:00.000Z`).getTime() - start) / (end - start)) * width
  const y = (point: MarketHistoryPoint) => height - ((point.value - min) / range) * (height - 8) - 4
  const label = (point: MarketHistoryPoint) => {
    const date = new Date(`${utcDateKey(point.date)}T00:00:00.000Z`).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    })
    const sample = point.numerator != null && point.denominator != null
      ? `; ${point.numerator.toLocaleString('en-US')} of ${point.denominator.toLocaleString('en-US')}`
      : ''
    return `${date}: ${formatPointValue(point.value, unit)}${sample}`
  }

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-full overflow-visible" role="img" aria-label={`${period}-day daily metric history`}>
        {splitHistorySegments(visible).map((segment, index) => (
          segment.length > 1 ? (
            <polyline
              key={`${segment[0].date}-${index}`}
              points={segment.map((point) => `${x(point).toFixed(1)},${y(point).toFixed(1)}`).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="text-slate-700"
            />
          ) : null
        ))}
        {visible.map((point) => (
          <circle
            key={point.date}
            cx={x(point)}
            cy={y(point)}
            r="3"
            fill="currentColor"
            className="text-slate-700 outline-none focus:text-emerald-600"
            tabIndex={0}
            role="img"
            aria-label={label(point)}
            onMouseEnter={() => setActivePoint(point)}
            onMouseLeave={() => setActivePoint(null)}
            onFocus={() => setActivePoint(point)}
            onBlur={() => setActivePoint(null)}
          >
            <title>{label(point)}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{new Date(`${visible[0].date}T00:00:00.000Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
        <span>{new Date(`${visible[visible.length - 1].date}T00:00:00.000Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
      </div>
      <p className="mt-1 min-h-4 text-[10px] text-slate-500" aria-live="polite">
        {activePoint ? label(activePoint) : 'Hover or focus a point for its daily value.'}
      </p>
    </div>
  )
}

export function MetricCard({
  label,
  metric,
  points,
  note,
  denominatorLabel,
  comparisonMode,
  currentDate,
  compact = false,
}: {
  label: string
  metric: MetricValue | undefined
  points: MarketHistoryPoint[]
  note: string
  denominatorLabel?: string
  comparisonMode: ComparisonMode
  currentDate: string
  compact?: boolean
}) {
  const { period } = useHistoryPeriod()
  const comparison = compareHistory(metric?.value, points, period, currentDate, comparisonMode)
  const sample = denominatorLabel ? sampleLine(metric, denominatorLabel) : sampleLine(metric)
  const observed = observedDayCount(points, period, currentDate)
  const toneClasses = comparison?.tone === 'up'
    ? 'bg-emerald-50 text-emerald-700'
    : comparison?.tone === 'down'
      ? 'bg-rose-50 text-rose-700'
      : 'bg-slate-100 text-slate-600'

  return (
    <article className={`rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100/60 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className={`${compact ? 'mt-1.5 text-2xl' : 'mt-2 text-3xl'} font-bold tracking-tight text-slate-950`}>
            {formatMetric(metric)}
          </p>
        </div>
        {comparison ? (
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${toneClasses}`}>
            {comparisonLabel(comparison.delta, comparisonMode, comparison.point.date)}
          </span>
        ) : (
          <span className="text-right text-xs text-slate-400">{observed} of {period} days collected</span>
        )}
      </div>
      <Sparkline points={points} period={period} currentDate={currentDate} unit={metric?.unit ?? 'count'} />
      <p className="mt-3 text-sm leading-5 text-slate-600">{note}</p>
      {sample ? <p className="mt-2 text-xs text-slate-400">Current base: {sample}</p> : null}
      {comparison?.point.denominator != null && denominatorLabel ? (
        <p className="mt-1 text-xs text-slate-400">
          Comparison base: {comparison.point.denominator.toLocaleString('en-US')} {denominatorLabel}
        </p>
      ) : null}
    </article>
  )
}
