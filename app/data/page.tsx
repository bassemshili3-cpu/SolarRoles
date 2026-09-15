import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  Gauge,
  GraduationCap,
  HardHat,
  MapPin,
  Newspaper,
  ShieldCheck,
  Zap,
} from 'lucide-react'

import { prisma } from '@/lib/prisma'
import { STATES, STATE_CODE_TO_NAME, stateToSlug } from '@/lib/usStates'
import { getSolarMarketData, type MetricValue } from '@/lib/solarMarketMetrics'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Live US Solar Hiring Data | Solar Roles',
  description:
    'Daily US solar hiring indicators from active employer job postings, including pay, posting age, credentials, market segments, state activity and workforce signals.',
  keywords:
    'US solar hiring data, solar jobs data, solar workforce data, solar salary data, solar hiring trends, solar jobs by state',
  alternates: { canonical: 'https://www.solarroles.com/data' },
  openGraph: {
    title: 'Live US Solar Hiring Data | Solar Roles',
    description:
      'A daily view of active US solar job postings, pay, credentials, market segments and workforce demand.',
    type: 'website',
    url: 'https://www.solarroles.com/data',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Solar Roles US Solar Hiring Data',
  description:
    'Daily indicators derived from active US solar job postings indexed by Solar Roles.',
  url: 'https://www.solarroles.com/data',
  creator: {
    '@type': 'Organization',
    name: 'Solar Roles',
    url: 'https://www.solarroles.com',
  },
  spatialCoverage: 'United States',
  temporalCoverage: '2026/..',
  measurementTechnique: 'Analysis of active employer job postings indexed by Solar Roles',
}

type SnapshotRow = {
  snapshotDate: Date
  totalJobs: number
  employerCount: number
  metrics: unknown
  activeJobIds?: unknown
  employerCounts?: unknown
  stateCounts?: unknown
}

type HistoryPoint = {
  date: Date
  value: number
  numerator?: number
  denominator?: number
}

type Change = {
  label: string
  tone: 'up' | 'down' | 'flat'
}

const REPORTS = [
  {
    href: '/data/remote-solar-jobs-travel-requirements',
    title: 'Remote solar jobs can still require 90% travel',
    description:
      'A review of remote-advertised roles found frequent travel and site-visit requirements behind the remote label.',
  },
  {
    href: '/data/solar-installer-salary-rent-report',
    title: 'Where solar installer pay goes furthest on rent',
    description:
      'A metro-by-metro comparison of installer pay and one-bedroom housing costs.',
  },
  {
    href: '/data/battery-storage-leads-segment-specific-solar-hiring',
    title: 'Battery storage leads segment-specific solar hiring',
    description:
      'A closer look at jobs that explicitly identify battery storage, utility-scale, residential or commercial markets.',
  },
]

function asMetricRecord(value: unknown): Record<string, MetricValue> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, MetricValue>
}

function asEmployerCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, number>
}

function asStateCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, number>
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

async function getHistory() {
  try {
    const delegate = (prisma as unknown as {
      marketSnapshot?: {
        findMany: (args: unknown) => Promise<SnapshotRow[]>
      }
    }).marketSnapshot

    if (!delegate) return []

    return await delegate.findMany({
      orderBy: { snapshotDate: 'asc' },
      take: 120,
      select: {
        snapshotDate: true,
        totalJobs: true,
        employerCount: true,
        metrics: true,
        activeJobIds: true,
        employerCounts: true,
        stateCounts: true,
      },
    })
  } catch (error) {
    console.warn('Solar market history unavailable:', error)
    return []
  }
}

function historyFor(rows: SnapshotRow[], key: string): HistoryPoint[] {
  return rows
    .map((row) => {
      if (key === 'totalJobs') return { date: new Date(row.snapshotDate), value: row.totalJobs }
      if (key === 'employerCount') return { date: new Date(row.snapshotDate), value: row.employerCount }

      const metric = asMetricRecord(row.metrics)[key]
      if (!metric || metric.value == null) return null

      return {
        date: new Date(row.snapshotDate),
        value: metric.value,
        numerator: metric.numerator,
        denominator: metric.denominator,
      }
    })
    .filter((point): point is HistoryPoint => point != null)
}

function closestHistoricalPoint(points: HistoryPoint[], daysAgo: number) {
  if (!points.length) return null
  const target = Date.now() - daysAgo * 86_400_000

  return points.reduce<HistoryPoint | null>((best, point) => {
    const distance = Math.abs(point.date.getTime() - target)
    if (!best) return point
    return distance < Math.abs(best.date.getTime() - target) ? point : best
  }, null)
}

function changeLabel(current: MetricValue | undefined, points: HistoryPoint[], daysAgo: number): Change | null {
  if (!current || current.value == null || points.length < 2) return null
  const previous = closestHistoricalPoint(points, daysAgo)
  if (!previous || previous.value === 0) return null

  if (current.unit === 'rate') {
    const delta = current.value - previous.value
    const rounded = Math.abs(delta).toFixed(1)
    return {
      label: `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${rounded} pp vs ${daysAgo}d`,
      tone: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
    }
  }

  const delta = ((current.value - previous.value) / Math.abs(previous.value)) * 100
  return {
    label: `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${Math.abs(delta).toFixed(1)}% vs ${daysAgo}d`,
    tone: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
  }
}

function formatMetric(metric: MetricValue | undefined) {
  if (!metric || metric.value == null) return '—'
  if (metric.unit === 'currency') return `$${Math.round(metric.value).toLocaleString('en-US')}`
  if (metric.unit === 'rate') return `${metric.value.toFixed(1)}%`
  if (metric.unit === 'days') return `${Math.round(metric.value)} days`
  return Math.round(metric.value).toLocaleString('en-US')
}

function sampleLine(metric: MetricValue | undefined, noun = 'eligible openings') {
  if (!metric || metric.numerator == null || metric.denominator == null || metric.denominator <= 0) return null
  return `${metric.numerator.toLocaleString('en-US')} of ${metric.denominator.toLocaleString('en-US')} ${noun}`
}

function Sparkline({ points }: { points: HistoryPoint[] }) {
  if (points.length < 2) {
    return (
      <div className="mt-4 flex h-12 items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 text-[11px] text-slate-400">
        Daily history will appear after snapshots begin collecting.
      </div>
    )
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const width = 260
  const height = 46
  const coordinates = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * width
    const y = height - ((point.value - min) / range) * (height - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-full" role="img" aria-label="Daily metric history">
        <polyline
          points={coordinates.join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          className="text-slate-700"
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{points[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{points[points.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  )
}

function ChangePill({ change }: { change: Change | null }) {
  if (!change) return <span className="text-xs text-slate-400">History building</span>

  const classes =
    change.tone === 'up'
      ? 'bg-emerald-50 text-emerald-700'
      : change.tone === 'down'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-slate-100 text-slate-600'

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes}`}>{change.label}</span>
}

function MetricCard({
  label,
  metric,
  points,
  note,
  denominatorLabel,
  compareDays = 30,
}: {
  label: string
  metric: MetricValue | undefined
  points: HistoryPoint[]
  note: string
  denominatorLabel?: string
  compareDays?: number
}) {
  const change = changeLabel(metric, points, compareDays)
  const sample = denominatorLabel ? sampleLine(metric, denominatorLabel) : sampleLine(metric)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{formatMetric(metric)}</p>
        </div>
        <ChangePill change={change} />
      </div>
      <Sparkline points={points} />
      <p className="mt-3 text-sm leading-5 text-slate-600">{note}</p>
      {sample ? <p className="mt-2 text-xs text-slate-400">{sample}</p> : null}
    </article>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  )
}

function metricValue(metrics: Record<string, MetricValue>, key: string) {
  return metrics[key]
}

function continuingEmployerChange(current: Record<string, number>, rows: SnapshotRow[], daysAgo: number) {
  if (!rows.length) return null
  const target = Date.now() - daysAgo * 86_400_000
  const row = rows.reduce<SnapshotRow | null>((best, candidate) => {
    if (!candidate.employerCounts) return best
    const distance = Math.abs(new Date(candidate.snapshotDate).getTime() - target)
    if (!best) return candidate
    return distance < Math.abs(new Date(best.snapshotDate).getTime() - target) ? candidate : best
  }, null)

  if (!row) return null
  const past = asEmployerCounts(row.employerCounts)
  const continuing = Object.keys(current).filter((company) => current[company] > 0 && (past[company] ?? 0) > 0)
  if (!continuing.length) return null

  const currentJobs = continuing.reduce((sum, company) => sum + current[company], 0)
  const pastJobs = continuing.reduce((sum, company) => sum + past[company], 0)
  if (!pastJobs) return null

  return {
    change: ((currentJobs - pastJobs) / pastJobs) * 100,
    employers: continuing.length,
    currentJobs,
    pastJobs,
  }
}


function previousSnapshot(rows: SnapshotRow[]) {
  if (!rows.length) return null
  const today = new Date()
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const older = rows.filter((row) => new Date(row.snapshotDate).getTime() < todayUtc)
  return older.length ? older[older.length - 1] : null
}

function postingFlow(currentIds: string[], rows: SnapshotRow[]) {
  const previous = previousSnapshot(rows)
  if (!previous) return null
  const pastIds = new Set(asStringArray(previous.activeJobIds))
  const currentSet = new Set(currentIds)
  if (!pastIds.size) return null

  let added = 0
  let removed = 0
  for (const id of currentSet) if (!pastIds.has(id)) added += 1
  for (const id of pastIds) if (!currentSet.has(id)) removed += 1

  return {
    added,
    removed,
    net: added - removed,
    date: new Date(previous.snapshotDate),
  }
}

function stateMomentum(current: Record<string, number>, rows: SnapshotRow[], daysAgo = 30) {
  if (!rows.length) return { rising: [], falling: [] }
  const target = Date.now() - daysAgo * 86_400_000
  const row = rows.reduce<SnapshotRow | null>((best, candidate) => {
    if (!candidate.stateCounts) return best
    const distance = Math.abs(new Date(candidate.snapshotDate).getTime() - target)
    if (!best) return candidate
    return distance < Math.abs(new Date(best.snapshotDate).getTime() - target) ? candidate : best
  }, null)
  if (!row) return { rising: [], falling: [] }

  const past = asStateCounts(row.stateCounts)
  const changes = Object.keys({ ...past, ...current })
    .map((code) => {
      const before = past[code] ?? 0
      const now = current[code] ?? 0
      if (before < 5 || before + now < 12) return null
      return {
        code,
        name: STATE_CODE_TO_NAME[code] ?? code,
        before,
        now,
        change: ((now - before) / before) * 100,
      }
    })
    .filter((row): row is { code: string; name: string; before: number; now: number; change: number } => row != null)

  return {
    rising: [...changes].filter((row) => row.change > 0).sort((a, b) => b.change - a.change).slice(0, 3),
    falling: [...changes].filter((row) => row.change < 0).sort((a, b) => a.change - b.change).slice(0, 3),
  }
}

export default async function DataPage() {
  const [market, history] = await Promise.all([getSolarMarketData(), getHistory()])
  const metrics = market.metrics

  const h = (key: string) => historyFor(history, key)
  const matched30 = continuingEmployerChange(market.employerCounts, history, 30)
  const flow = postingFlow(market.activeJobIds, history)
  const stateMoves = stateMomentum(market.stateCounts, history, 30)
  const top10EmployerJobs = market.topEmployers.reduce((sum, employer) => sum + employer.count, 0)
  const top10EmployerShare = market.totalJobs > 0 ? (top10EmployerJobs / market.totalJobs) * 100 : 0

  const lastUpdated = market.lastUpdated
    ? market.lastUpdated.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : 'latest database refresh'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <header className="border-b border-slate-200 pb-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Updated daily</span>
            <span>United States</span>
            <span aria-hidden="true">·</span>
            <span>Active employer postings</span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Live US Solar Hiring Data
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            A daily read on advertised solar hiring: openings, pay, posting age, credentials, market segments and the workforce signals showing where demand is moving.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <span>Latest refresh: {lastUpdated}</span>
            <a href="#methodology" className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950">
              Methodology
            </a>
            <a href="#research" className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950">
              Research archive
            </a>
          </div>
        </header>

        <section className="py-12" id="market-pulse">
          <SectionHeading
            eyebrow="Market pulse"
            title="What the hiring market looks like now"
            description="Headline indicators are calculated from active postings in the Solar Roles index. Historical comparisons use daily snapshots when available."
            icon={<Activity className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Active openings"
              metric={metricValue(metrics, 'totalJobs')}
              points={h('totalJobs')}
              note="Open US solar roles currently indexed by Solar Roles."
            />
            <MetricCard
              label="Employers hiring"
              metric={metricValue(metrics, 'employerCount')}
              points={h('employerCount')}
              note="Distinct employers with at least one active opening."
            />
            <MetricCard
              label="Median listed pay"
              metric={metricValue(metrics, 'medianSalary')}
              points={h('medianSalary')}
              note="Annualized midpoint of usable posted pay ranges; hourly rates are converted to a 2,080-hour year."
              denominatorLabel="active postings have usable pay data"
            />
            <MetricCard
              label="Salary disclosure"
              metric={metricValue(metrics, 'salaryDisclosureRate')}
              points={h('salaryDisclosureRate')}
              note="Share of active postings with a usable compensation range after normalization."
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="New in the last 7 days"
              metric={metricValue(metrics, 'new7Days')}
              points={h('new7Days')}
              note="Active postings whose advertised posted date falls within the last seven days."
            />
            <MetricCard
              label="Entry-level signal"
              metric={metricValue(metrics, 'entryLevelRate')}
              points={h('entryLevelRate')}
              note="Share of active postings tagged entry-level or explicitly open to candidates with no experience."
            />
            <MetricCard
              label="Bachelor's degree mentioned"
              metric={metricValue(metrics, 'degreeRequirementRate')}
              points={h('degreeRequirementRate')}
              note="Share of active postings explicitly mentioning a bachelor's or comparable four-year degree requirement."
            />
            <MetricCard
              label="Remote-labeled openings"
              metric={metricValue(metrics, 'remoteRate')}
              points={h('remoteRate')}
              note="Share of active openings whose title or location is explicitly labeled remote."
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-900">Observed posting flow</p>
              {flow ? (
                <>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">+{flow.added.toLocaleString('en-US')}</p>
                      <p className="text-xs text-slate-500">new IDs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-rose-700">−{flow.removed.toLocaleString('en-US')}</p>
                      <p className="text-xs text-slate-500">no longer active</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${flow.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {flow.net >= 0 ? '+' : '−'}{Math.abs(flow.net).toLocaleString('en-US')}
                      </p>
                      <p className="text-xs text-slate-500">net</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Compared with the prior stored daily snapshot ({flow.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}). This is observed index churn, not a measure of hires or layoffs.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Posting additions and removals will appear after two daily snapshots are stored.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <p className="text-sm font-bold text-slate-900">Coverage-adjusted view</p>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                Raw listing totals can move when Solar Roles adds new employers or sources. The continuing-employer comparison isolates companies that had active listings on both dates, giving reporters a second read on hiring intensity.
              </p>
            </div>
            <div className="mt-4 shrink-0 sm:mt-0 sm:text-right">
              {matched30 ? (
                <>
                  <p className={`text-2xl font-bold ${matched30.change >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {matched30.change >= 0 ? '+' : '−'}{Math.abs(matched30.change).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500">30d · {matched30.employers} continuing employers</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-slate-400">Building history</p>
                  <p className="text-xs text-slate-500">Available after daily snapshots accumulate</p>
                </>
              )}
            </div>
          </div>
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="market-mix">
          <SectionHeading
            eyebrow="Market mix"
            title="Where advertised solar demand is concentrated"
            description="Segment shares use postings whose specialty is explicitly classified as battery storage, utility-scale, residential or commercial solar. Unclassified postings are excluded from this denominator."
            icon={<Gauge className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Battery storage"
              metric={metricValue(metrics, 'storageShare')}
              points={h('storageShare')}
              note="Share of segment-classified postings tagged for battery storage."
              denominatorLabel="segment-classified openings"
              compareDays={90}
            />
            <MetricCard
              label="Utility-scale solar"
              metric={metricValue(metrics, 'utilityShare')}
              points={h('utilityShare')}
              note="Share of segment-classified postings tagged for utility-scale solar."
              denominatorLabel="segment-classified openings"
              compareDays={90}
            />
            <MetricCard
              label="Residential solar"
              metric={metricValue(metrics, 'residentialShare')}
              points={h('residentialShare')}
              note="Share of segment-classified postings tagged for residential solar."
              denominatorLabel="segment-classified openings"
              compareDays={90}
            />
            <MetricCard
              label="Commercial solar"
              metric={metricValue(metrics, 'commercialShare')}
              points={h('commercialShare')}
              note="Share of segment-classified postings tagged for commercial solar."
              denominatorLabel="segment-classified openings"
              compareDays={90}
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-slate-950">Current segment mix</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {market.segmentMix.map((segment) => (
                <div key={segment.segment} className="grid grid-cols-[1fr_auto_auto] items-center gap-5 px-5 py-3.5 text-sm">
                  <span className="font-medium text-slate-800">{segment.segment}</span>
                  <span className="text-slate-500">{segment.count.toLocaleString('en-US')} jobs</span>
                  <span className="w-16 text-right font-semibold text-slate-900">{segment.share.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="workforce-pressure">
          <SectionHeading
            eyebrow="Workforce pressure"
            title="Credentials, electrical skills and hard-to-fill signals"
            description="These indicators use role-specific denominators. Credential rates are not divided by the entire database when the requirement is only relevant to a technical or field workforce."
            icon={<HardHat className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Median posting age"
              metric={metricValue(metrics, 'medianPostingAgeDays')}
              points={h('medianPostingAgeDays')}
              note="Median age of active postings with a usable posted date. This measures advertised age, not time-to-hire."
            />
            <MetricCard
              label="Still advertised after 60 days"
              metric={metricValue(metrics, 'aged60Rate')}
              points={h('aged60Rate')}
              note="Share of active postings with a posted date that are at least 60 days old."
            />
            <MetricCard
              label="NABCEP mentioned"
              metric={metricValue(metrics, 'nabcepRate')}
              points={h('nabcepRate')}
              note="NABCEP references as a share of relevant technical openings, not all solar jobs."
              denominatorLabel="relevant technical openings"
            />
            <MetricCard
              label="OSHA 10/30 mentioned"
              metric={metricValue(metrics, 'oshaRate')}
              points={h('oshaRate')}
              note="OSHA 10 or OSHA 30 references among field and construction roles."
              denominatorLabel="field and construction openings"
            />
            <MetricCard
              label="Electrical license signal"
              metric={metricValue(metrics, 'electricalLicenseRate')}
              points={h('electricalLicenseRate')}
              note="Journeyman, master electrician or electrical-license language among electrically relevant roles."
              denominatorLabel="electrically relevant openings"
            />
            <MetricCard
              label="Grid / high-voltage skills"
              metric={metricValue(metrics, 'gridSkillsRate')}
              points={h('gridSkillsRate')}
              note="SCADA, substation, interconnection, medium/high voltage, switchgear or relay language among technical roles."
              denominatorLabel="technical openings"
            />
          </div>

          <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-slate-950">Posting age and pay by job family</h3>
              <p className="mt-1 text-xs text-slate-500">Useful for comparing the parts of the workforce that stay advertised longest.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Job family</th>
                    <th className="px-5 py-3 text-right font-semibold">Openings</th>
                    <th className="px-5 py-3 text-right font-semibold">Share</th>
                    <th className="px-5 py-3 text-right font-semibold">Median posting age</th>
                    <th className="px-5 py-3 text-right font-semibold">Median listed pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {market.roleBreakdown.map((row) => (
                    <tr key={row.role}>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{row.role}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{row.count.toLocaleString('en-US')}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{row.share.toFixed(1)}%</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{row.medianPostingAgeDays == null ? '—' : `${Math.round(row.medianPostingAgeDays)} days`}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{row.medianSalary == null ? '—' : `$${Math.round(row.medianSalary).toLocaleString('en-US')}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="pay-conditions">
          <SectionHeading
            eyebrow="Pay & conditions"
            title="What employers disclose — and what field jobs ask workers to absorb"
            description="Pay statistics use normalized annual compensation. Travel and incentive measures are calculated within field-oriented roles so changes in office hiring do not mechanically move the rate."
            icon={<CircleDollarSign className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="25th percentile pay"
              metric={metricValue(metrics, 'salaryP25')}
              points={h('salaryP25')}
              note="Lower quartile of normalized posted pay among listings with usable compensation data."
            />
            <MetricCard
              label="75th percentile pay"
              metric={metricValue(metrics, 'salaryP75')}
              points={h('salaryP75')}
              note="Upper quartile of normalized posted pay among listings with usable compensation data."
            />
            <MetricCard
              label="Travel mentioned"
              metric={metricValue(metrics, 'travelRate')}
              points={h('travelRate')}
              note="Share of field-oriented openings that mention travel in the posting."
              denominatorLabel="field-oriented openings"
            />
            <MetricCard
              label="Per diem offered"
              metric={metricValue(metrics, 'perDiemRate')}
              points={h('perDiemRate')}
              note="Share of field-oriented openings that explicitly mention per diem."
              denominatorLabel="field-oriented openings"
            />
            <MetricCard
              label="Relocation offered"
              metric={metricValue(metrics, 'relocationRate')}
              points={h('relocationRate')}
              note="Share of field-oriented openings that explicitly offer relocation assistance or a relocation package."
              denominatorLabel="field-oriented openings"
            />
            <MetricCard
              label="Sign-on bonus"
              metric={metricValue(metrics, 'signOnBonusRate')}
              points={h('signOnBonusRate')}
              note="Share of field-oriented openings that explicitly advertise a sign-on or signing bonus."
              denominatorLabel="field-oriented openings"
            />
            <MetricCard
              label="1099 / contractor signal in sales"
              metric={metricValue(metrics, 'sales1099Rate')}
              points={h('sales1099Rate')}
              note="Contractor or 1099 language as a share of postings classified as sales roles."
              denominatorLabel="sales openings"
            />
            <MetricCard
              label="Commission-only sales"
              metric={metricValue(metrics, 'commissionOnlyRate')}
              points={h('commissionOnlyRate')}
              note="Share of sales postings that explicitly describe the role as commission-only or 100% commission."
              denominatorLabel="sales openings"
            />
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="structural-signals">
          <SectionHeading
            eyebrow="Structural signals"
            title="Signals of a changing solar workforce"
            description="These measures are designed to catch shifts that can precede annual workforce reports: operations hiring, manufacturing demand, apprenticeships and policy-linked language."
            icon={<Zap className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="O&M / field-service share"
              metric={metricValue(metrics, 'omShareTechnical')}
              points={h('omShareTechnical')}
              note="Operations, maintenance, field-service and asset-management roles as a share of technical openings."
              denominatorLabel="technical openings"
              compareDays={90}
            />
            <MetricCard
              label="Manufacturing share"
              metric={metricValue(metrics, 'manufacturingShare')}
              points={h('manufacturingShare')}
              note="Conservatively classified manufacturing and production titles as a share of active openings."
              compareDays={90}
            />
            <MetricCard
              label="Apprenticeship signal"
              metric={metricValue(metrics, 'apprenticeshipRate')}
              points={h('apprenticeshipRate')}
              note="Apprentice or apprenticeship language among technical openings."
              denominatorLabel="technical openings"
              compareDays={90}
            />
            <MetricCard
              label="Policy-linked labor terms"
              metric={metricValue(metrics, 'policySignalRate')}
              points={h('policySignalRate')}
              note="Prevailing wage, Davis-Bacon, project labor agreement or registered-apprenticeship language among technical roles."
              denominatorLabel="technical openings"
              compareDays={90}
            />
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="geography">
          <SectionHeading
            eyebrow="Geography"
            title="Where employers are advertising the most solar work"
            description="State totals are normalized so two-letter codes and full state names are combined before ranking."
            icon={<MapPin className="h-5 w-5" />}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-bold text-slate-950">Top hiring states</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {market.topStates.map((state, index) => (
                  <div key={state.code} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-xs font-bold text-slate-400">{index + 1}</span>
                      <Link href={`/data/states/${stateToSlug(state.name)}`} className="font-medium text-slate-900 hover:text-blue-700">
                        {state.name}
                      </Link>
                    </div>
                    <span className="text-sm text-slate-500">{state.count.toLocaleString('en-US')} openings</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-bold text-slate-950">Largest active hiring footprints</h3>
                <p className="mt-1 text-xs text-slate-500">The top 10 employers account for {top10EmployerShare.toFixed(1)}% of current indexed openings.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {market.topEmployers.map((employer, index) => (
                  <div key={employer.company} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-5 shrink-0 text-xs font-bold text-slate-400">{index + 1}</span>
                      <span className="truncate font-medium text-slate-900">{employer.company}</span>
                    </div>
                    <span className="shrink-0 text-sm text-slate-500">{employer.count.toLocaleString('en-US')} openings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">30-day state momentum</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">Observed change in indexed openings. States with very small starting counts are excluded; this view is not coverage-adjusted.</p>
              </div>
              <span className="text-xs font-medium text-slate-400">Requires 30 days of snapshots</span>
            </div>

            {stateMoves.rising.length || stateMoves.falling.length ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Fastest rising</p>
                  <div className="mt-2 space-y-2">
                    {stateMoves.rising.map((row) => (
                      <div key={row.code} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm">
                        <span className="font-medium text-slate-800">{row.name}</span>
                        <span className="font-bold text-emerald-700">+{row.change.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-rose-700">Fastest falling</p>
                  <div className="mt-2 space-y-2">
                    {stateMoves.falling.map((row) => (
                      <div key={row.code} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm">
                        <span className="font-medium text-slate-800">{row.name}</span>
                        <span className="font-bold text-rose-700">−{Math.abs(row.change).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">State momentum will populate after enough daily history is available.</p>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-900">Browse every state</h3>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {Object.keys(STATES).map((name) => (
                <Link
                  key={name}
                  href={`/data/states/${stateToSlug(name)}`}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="reporter-notes">
          <SectionHeading
            eyebrow="For reporters"
            title="How to cite and interpret the numbers"
            description="Solar Roles tracks advertised labor demand, not total employment. The distinction matters when comparing this page with surveys, payroll data or annual workforce counts."
            icon={<Newspaper className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-900">Suggested attribution</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                “According to Solar Roles’ analysis of active US solar job postings…”
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-900">Counts vs. shares</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Counts describe the size of the indexed market. Credential and work-condition indicators use relevant-role denominators so changes in the mix of jobs do not automatically move the rate.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-900">Historical changes</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Percentage-point changes are used for shares. Listing-count changes should be read alongside the continuing-employer comparison because source coverage can expand over time.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="research">
          <SectionHeading
            eyebrow="Solar Roles research"
            title="Original reporting built from the job-posting database"
            description="Longer analyses test specific questions that are not visible from the headline dashboard alone."
            icon={<BarChart3 className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-3">
            {REPORTS.map((report) => (
              <Link key={report.href} href={report.href} className="group rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:border-amber-300 hover:bg-amber-100/70">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-700">Data report</p>
                <h3 className="mt-3 font-bold leading-6 text-slate-950">{report.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{report.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-amber-800">
                  Read report <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="resources">
          <div className="grid gap-5 md:grid-cols-2">
            <Link href="/workforce-resources" className="group rounded-2xl border border-blue-200 bg-blue-50 p-6 transition hover:border-blue-300 hover:bg-blue-100/70">
              <div className="flex items-center gap-3 text-blue-800">
                <GraduationCap className="h-5 w-5" />
                <p className="text-xs font-bold uppercase tracking-[0.12em]">Educators & workforce programs</p>
              </div>
              <h2 className="mt-3 text-xl font-bold text-slate-950">Use the data for career planning</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Entry-level hiring, career pathways, state licensing references, employer activity and a free live-jobs widget.
              </p>
            </Link>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3 text-slate-700">
                <BriefcaseBusiness className="h-5 w-5" />
                <p className="text-xs font-bold uppercase tracking-[0.12em]">Salary reports</p>
              </div>
              <h2 className="mt-3 text-xl font-bold text-slate-950">Pay by solar occupation</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explore compensation pages for installers, electricians, sales representatives, engineers and technicians.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['Solar Installer', '/data/salaries/solar-photovoltaic-installer'],
                  ['Solar Electrician', '/data/salaries/solar-electrician'],
                  ['Solar Sales', '/data/salaries/solar-sales-representative'],
                  ['Solar Engineer', '/data/salaries/solar-engineer'],
                ].map(([label, href]) => (
                  <Link key={href} href={href} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-12" id="methodology">
          <SectionHeading
            eyebrow="Methodology"
            title="What this dataset measures"
            description="The page is designed as a current indicator of advertised hiring demand. It is not a census of employment and should not be used as an estimate of the number of people working in solar."
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <div className="grid gap-5 text-sm leading-6 text-slate-600 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="font-bold text-slate-900">Coverage</p>
              <p className="mt-2">
                Solar Roles indexes active US openings from employer recruiting systems and career sources in its database. Counts can change when employers add or remove jobs and when source coverage changes.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="font-bold text-slate-900">Ratios</p>
              <p className="mt-2">
                Rates use a denominator matched to the question. For example, NABCEP is measured within relevant technical roles, while OSHA language is measured within field and construction roles.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="font-bold text-slate-900">Pay</p>
              <p className="mt-2">
                Posted ranges are converted to annual equivalents where possible. Hourly pay assumes 2,080 hours per year; weekly pay uses 52 weeks. Values outside $20,000–$600,000 after annualization are excluded from pay statistics.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="font-bold text-slate-900">Posting age</p>
              <p className="mt-2">
                Posting age is the number of days since the advertised posted date for jobs still active in the index. It should not be interpreted as time-to-fill because an employer may refresh, pause or close a posting for reasons unrelated to a hire.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 md:col-span-2">
              <p className="font-bold text-slate-900">Historical comparisons</p>
              <p className="mt-2">
                Daily snapshots retain numerator, denominator and value for each rate. Shares are compared in percentage points. A continuing-employer view is shown separately from raw listing totals to reduce the effect of expanding source coverage; it includes employers with active postings on both comparison dates and should be read as a hiring-intensity measure for that continuing group.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Figures update daily and may be revised as job records are refreshed, deduplicated or reclassified. Use the date shown at the top of the page when citing a snapshot.
          </p>
        </section>
      </main>
    </>
  )
}
