import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CircleDollarSign,
  Factory,
  Gauge,
  HardHat,
  Newspaper,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  Wrench,
} from 'lucide-react'

import { prisma } from '@/lib/prisma'
import { getSolarMarketData, type MetricValue } from '@/lib/solarMarketMetrics'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'US Solar Hiring Indicators & Workforce Data | Solar Roles',
  description:
    'Daily US solar hiring indicators for reporters and researchers: hiring volume, employer participation, segment momentum, build-to-operate shifts, industrial skills, training gaps, pay transparency, employer concentration and entry barriers.',
  keywords:
    'US solar hiring data, solar workforce data, solar jobs data, solar hiring trends, solar labor market, solar workforce trends, solar salary transparency, battery storage jobs, utility solar jobs',
  alternates: { canonical: 'https://www.solarroles.com/data' },
  openGraph: {
    title: 'US Solar Hiring Indicators & Workforce Data | Solar Roles',
    description:
      'A daily, reporter-focused view of the structural signals moving the US solar hiring market.',
    type: 'website',
    url: 'https://www.solarroles.com/data',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Solar Roles US Solar Hiring Indicators',
  description:
    'Daily indicators derived from active US solar job postings, covering hiring volume, employer participation, market segments, workforce skills, training signals, pay transparency, hiring concentration and entry barriers.',
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

const HEADLINE_LINKS = [
  ['1', 'Hiring pulse', '#hiring-pulse'],
  ['2', 'Segment momentum', '#segment-momentum'],
  ['3', 'Build → operate', '#build-operate'],
  ['4', 'Industrial skills', '#industrial-skills'],
  ['5', 'Training gap', '#training-gap'],
  ['6', 'Pay transparency', '#pay-transparency'],
  ['7', 'Concentration', '#hiring-concentration'],
  ['8', 'Entry barriers', '#entry-barriers'],
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
      take: 180,
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

function stateBreadthHistory(rows: SnapshotRow[]): HistoryPoint[] {
  return rows
    .map((row) => {
      const stateCounts = asStateCounts(row.stateCounts)
      if (!Object.keys(stateCounts).length) return null

      return {
        date: new Date(row.snapshotDate),
        value: Object.values(stateCounts).filter((count) => count > 0).length,
      }
    })
    .filter((point): point is HistoryPoint => point != null)
}

function employerShareMetric(employerCounts: Record<string, number>, totalJobs: number, topN: number): MetricValue {
  const numerator = Object.values(employerCounts)
    .filter((count) => count > 0)
    .sort((a, b) => b - a)
    .slice(0, topN)
    .reduce((sum, count) => sum + count, 0)

  return {
    value: totalJobs > 0 ? (numerator / totalJobs) * 100 : 0,
    unit: 'rate',
    numerator,
    denominator: totalJobs,
  } as MetricValue
}

function employerShareHistory(rows: SnapshotRow[], topN: number): HistoryPoint[] {
  return rows
    .map<HistoryPoint | null>((row) => {
      const employerCounts = asEmployerCounts(row.employerCounts)
      if (!Object.keys(employerCounts).length || row.totalJobs <= 0) return null

      const numerator = Object.values(employerCounts)
        .filter((count) => count > 0)
        .sort((a, b) => b - a)
        .slice(0, topN)
        .reduce((sum, count) => sum + count, 0)

      return {
        date: new Date(row.snapshotDate),
        value: (numerator / row.totalJobs) * 100,
        numerator,
        denominator: row.totalJobs,
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

  const values = points.map((point) => point.value)
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
  compact = false,
}: {
  label: string
  metric: MetricValue | undefined
  points: HistoryPoint[]
  note: string
  denominatorLabel?: string
  compareDays?: number
  compact?: boolean
}) {
  const change = changeLabel(metric, points, compareDays)
  const sample = denominatorLabel ? sampleLine(metric, denominatorLabel) : sampleLine(metric)

  return (
    <article className={`rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100/60 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className={`${compact ? 'mt-1.5 text-2xl' : 'mt-2 text-3xl'} font-bold tracking-tight text-slate-950`}>
            {formatMetric(metric)}
          </p>
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
  number,
  eyebrow,
  title,
  description,
  icon,
}: {
  number?: string
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
        <div className="flex flex-wrap items-center gap-2">
          {number ? (
            <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              Signal {number}
            </span>
          ) : null}
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{eyebrow}</p>
        </div>
        <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  )
}

function metricValue(metrics: Record<string, MetricValue>, key: string) {
  return metrics[key]
}

function definitionBox(title: string, body: string) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
      <span className="font-semibold text-slate-900">{title}: </span>
      {body}
    </div>
  )
}

export default async function DataPage() {
  const [market, history] = await Promise.all([getSolarMarketData(), getHistory()])
  const metrics = market.metrics
  const h = (key: string) => historyFor(history, key)

  const statesWithDemand = Object.values(market.stateCounts).filter((count) => count > 0).length
  const stateBreadthMetric = {
    value: statesWithDemand,
    unit: 'count',
  } as MetricValue

  const top10Share = employerShareMetric(market.employerCounts, market.totalJobs, 10)
  const top25Share = employerShareMetric(market.employerCounts, market.totalJobs, 25)

  const lastUpdated = market.lastUpdated
    ? market.lastUpdated.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
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
            <span aria-hidden="true">·</span>
            <span>Reporter-focused indicators</span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            US Solar Hiring Indicators
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            A daily read on the structure of advertised solar hiring — who is hiring, which segments are gaining share,
            whether demand is shifting from build to operate, which industrial skills are spreading, and where entry
            barriers or training gaps are appearing.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
            <span>Latest refresh: {lastUpdated}</span>
            <a href="#reporter-notes" className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950">
              Reporter notes
            </a>
            <a href="#methodology" className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950">
              Methodology
            </a>
            <a href="#research" className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950">
              Research archive
            </a>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Current snapshot</p>
            <p className="mt-2 text-base leading-7 text-slate-800">
              Solar Roles currently tracks <strong>{market.totalJobs.toLocaleString('en-US')}</strong> active US solar openings across{' '}
              <strong>{market.employerCount.toLocaleString('en-US')}</strong> employers and <strong>{statesWithDemand}</strong> states with active demand.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              These are advertised openings in the Solar Roles index, not employment, hires, layoffs or a census of every solar job in the United States.
            </p>
          </div>

          <nav className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Headline solar hiring indicators">
            {HEADLINE_LINKS.map(([number, label, href]) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">{number}</span>
                {label}
              </a>
            ))}
          </nav>
        </header>

        <section className="py-12" id="hiring-pulse">
          <SectionHeading
            number="1"
            eyebrow="Solar hiring pulse"
            title="Volume, participation and geographic breadth"
            description="The fastest read on whether advertised solar hiring is expanding broadly or being driven by a narrower set of employers or locations."
            icon={<Activity className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Active openings · volume"
              metric={metricValue(metrics, 'totalJobs')}
              points={h('totalJobs')}
              note="Active US solar job postings currently indexed by Solar Roles."
            />
            <MetricCard
              label="Employers hiring · participation"
              metric={metricValue(metrics, 'employerCount')}
              points={h('employerCount')}
              note="Distinct employers with at least one active indexed opening."
            />
            <MetricCard
              label="States with demand · breadth"
              metric={stateBreadthMetric}
              points={stateBreadthHistory(history)}
              note="Number of US states represented by at least one active indexed opening."
            />
          </div>

          {definitionBox(
            'Reporter read',
            'Volume can rise simply because one large employer posts heavily. Reading openings alongside employer participation and geographic breadth helps distinguish broad-based expansion from a concentrated posting surge.'
          )}
        </section>

        <section className="border-t border-slate-200 py-12" id="segment-momentum">
          <SectionHeading
            number="2"
            eyebrow="Segment momentum"
            title="Residential, C&I, utility-scale and BESS hiring mix"
            description="Segment shares show where explicitly classified solar demand is gaining or losing weight. The denominator excludes postings that cannot be assigned confidently to one of these market segments."
            icon={<Gauge className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Residential"
              metric={metricValue(metrics, 'residentialShare')}
              points={h('residentialShare')}
              note="Share of segment-classified openings tied to residential solar."
              denominatorLabel="segment-classified openings"
              compareDays={90}
            />
            <MetricCard
              label="C&I"
              metric={metricValue(metrics, 'ciShare')}
              points={h('ciShare')}
              note="Share of segment-classified openings tied to commercial and industrial solar."
              denominatorLabel="segment-classified openings"
              compareDays={90}
            />
            <MetricCard
              label="Utility-scale"
              metric={metricValue(metrics, 'utilityShare')}
              points={h('utilityShare')}
              note="Share of segment-classified openings tied to utility-scale solar."
              denominatorLabel="segment-classified openings"
              compareDays={90}
            />
            <MetricCard
              label="BESS / storage"
              metric={metricValue(metrics, 'storageShare')}
              points={h('storageShare')}
              note="Share of segment-classified openings tied explicitly to battery energy storage."
              denominatorLabel="segment-classified openings"
              compareDays={90}
            />
          </div>

          {definitionBox(
            'Interpretation',
            'These are shares of classified hiring demand, not estimates of installed capacity or project pipeline. A segment can gain share because its own postings rise, because another segment falls, or both.'
          )}
        </section>

        <section className="border-t border-slate-200 py-12" id="build-operate">
          <SectionHeading
            number="3"
            eyebrow="Build → operate hiring shift"
            title="Is the workforce mix moving from construction toward operations?"
            description="This pair separates technical roles focused on building and commissioning projects from roles focused on operating, maintaining and servicing installed assets."
            icon={<Wrench className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Build / construction share"
              metric={metricValue(metrics, 'buildShareTechnical')}
              points={h('buildShareTechnical')}
              note="Construction, installation, EPC, commissioning and project-delivery roles as a share of technical openings."
              denominatorLabel="technical openings"
              compareDays={90}
            />
            <MetricCard
              label="Operate / O&M share"
              metric={metricValue(metrics, 'omShareTechnical')}
              points={h('omShareTechnical')}
              note="Operations, maintenance, field-service and asset-management roles as a share of technical openings."
              denominatorLabel="technical openings"
              compareDays={90}
            />
          </div>

          {definitionBox(
            'Why it matters',
            'A sustained rise in operate/O&M share alongside a falling build share can signal a maturing installed base or a shift in employer needs. It should not be read as a direct measure of construction activity.'
          )}
        </section>

        <section className="border-t border-slate-200 py-12" id="industrial-skills">
          <SectionHeading
            number="4"
            eyebrow="Industrial skill penetration"
            title="Storage and grid / high-voltage skills inside solar hiring"
            description="These rates track how often industrial power-system capabilities appear inside technical solar roles rather than measuring market-segment labels alone."
            icon={<Factory className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Storage skill penetration"
              metric={metricValue(metrics, 'storageSkillsRate')}
              points={h('storageSkillsRate')}
              note="Share of technical openings mentioning battery, BESS, energy storage, PCS, EMS or closely related storage-system work."
              denominatorLabel="technical openings"
              compareDays={90}
            />
            <MetricCard
              label="Grid / high-voltage penetration"
              metric={metricValue(metrics, 'gridSkillsRate')}
              points={h('gridSkillsRate')}
              note="Share of technical openings mentioning SCADA, substations, interconnection, medium/high voltage, switchgear, relays or related grid skills."
              denominatorLabel="technical openings"
              compareDays={90}
            />
          </div>

          {definitionBox(
            'Reporter read',
            'Unlike the segment mix above, this block asks whether storage and grid capabilities are spreading across technical solar jobs — including roles that may not be classified primarily as BESS or utility-scale.'
          )}
        </section>

        <section className="border-t border-slate-200 py-12" id="training-gap">
          <SectionHeading
            number="5"
            eyebrow="Advertised training gap"
            title="How often employers ask for readiness without advertising a training path"
            description="Training signals are most useful when read against experience and credential demands. This block is designed to surface a gap between the skills employers request and the training pathways they advertise."
            icon={<HardHat className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Advertised training gap"
              metric={metricValue(metrics, 'trainingGapRate')}
              points={h('trainingGapRate')}
              note="Share of entry-accessible technical/field openings that ask for prior experience or a trade credential without mentioning employer-provided training or apprenticeship."
              denominatorLabel="entry-accessible technical/field openings"
              compareDays={90}
            />
            <MetricCard
              label="Employer training mentioned"
              metric={metricValue(metrics, 'trainingMentionRate')}
              points={h('trainingMentionRate')}
              note="Share of entry-accessible technical/field openings that explicitly mention employer-provided training, paid training or structured on-the-job training."
              denominatorLabel="entry-accessible technical/field openings"
              compareDays={90}
            />
            <MetricCard
              label="Apprenticeship mentioned"
              metric={metricValue(metrics, 'apprenticeshipRate')}
              points={h('apprenticeshipRate')}
              note="Share of technical openings that explicitly mention an apprentice role, apprenticeship or registered apprenticeship."
              denominatorLabel="technical openings"
              compareDays={90}
            />
          </div>

          {definitionBox(
            'Caution',
            'A missing training mention does not prove that an employer offers no training. This indicator measures what employers choose to advertise to candidates.'
          )}
        </section>

        <section className="border-t border-slate-200 py-12" id="pay-transparency">
          <SectionHeading
            number="6"
            eyebrow="Pay transparency + range width"
            title="How much compensation information employers disclose"
            description="The transparency rate measures whether usable pay is disclosed. Range width measures how broad the advertised compensation band is after normalization to an annual equivalent."
            icon={<CircleDollarSign className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Pay disclosure rate"
              metric={metricValue(metrics, 'salaryDisclosureRate')}
              points={h('salaryDisclosureRate')}
              note="Share of active postings with a usable compensation range after normalization."
              denominatorLabel="active openings"
              compareDays={90}
            />
            <MetricCard
              label="Median advertised range width"
              metric={metricValue(metrics, 'medianSalaryRangeWidth')}
              points={h('medianSalaryRangeWidth')}
              note="Median difference between normalized annual minimum and maximum pay among postings with a usable range."
              denominatorLabel="postings with usable pay ranges"
              compareDays={90}
            />
          </div>

          {definitionBox(
            'Interpretation',
            'A wider range can reflect genuine seniority flexibility, variable compensation or less precise pay communication. It should not automatically be treated as worse transparency.'
          )}
        </section>

        <section className="border-t border-slate-200 py-12" id="hiring-concentration">
          <SectionHeading
            number="7"
            eyebrow="Hiring concentration"
            title="How much of indexed demand comes from the largest employers"
            description="Employer concentration helps separate a broad hiring cycle from a market being moved by a small number of very active recruiters."
            icon={<Building2 className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Top 10 employer share"
              metric={top10Share}
              points={employerShareHistory(history, 10)}
              note="Share of all active indexed openings posted by the 10 employers with the largest current hiring footprints."
              denominatorLabel="active openings"
              compareDays={30}
            />
            <MetricCard
              label="Top 25 employer share"
              metric={top25Share}
              points={employerShareHistory(history, 25)}
              note="Share of all active indexed openings posted by the 25 employers with the largest current hiring footprints."
              denominatorLabel="active openings"
              compareDays={30}
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-950">Largest active hiring footprints</h3>
                <p className="mt-1 text-xs text-slate-500">Useful context when a concentration measure moves sharply.</p>
              </div>
              <span className="text-xs font-medium text-slate-400">Current snapshot</span>
            </div>
            <div className="divide-y divide-slate-100">
              {market.topEmployers.map((employer, index) => (
                <div key={employer.company} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5 text-sm">
                  <span className="w-5 text-xs font-bold text-slate-400">{index + 1}</span>
                  <span className="truncate font-medium text-slate-900">{employer.company}</span>
                  <span className="text-slate-500">{employer.count.toLocaleString('en-US')} openings</span>
                </div>
              ))}
            </div>
          </div>

          {definitionBox(
            'Coverage note',
            'Concentration is especially sensitive to source coverage. Read large historical moves alongside any expansion in the employers or recruiting systems indexed by Solar Roles.'
          )}
        </section>

        <section className="border-t border-slate-200 py-12" id="entry-barriers">
          <SectionHeading
            number="8"
            eyebrow="Entry barrier signals"
            title="Experience, degree requirements and entry-level contradictions"
            description="These indicators track what employers advertise as barriers to entry and whether postings labeled as entry-level still ask candidates to arrive with prior experience."
            icon={<UsersRound className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Prior experience required"
              metric={metricValue(metrics, 'experienceRequirementRate')}
              points={h('experienceRequirementRate')}
              note="Share of active openings explicitly asking for prior professional, trade or role-specific experience."
              denominatorLabel="active openings"
              compareDays={90}
            />
            <MetricCard
              label="Bachelor's degree mentioned"
              metric={metricValue(metrics, 'degreeRequirementRate')}
              points={h('degreeRequirementRate')}
              note="Share of active openings explicitly mentioning a bachelor's or comparable four-year degree requirement."
              denominatorLabel="active openings"
              compareDays={90}
            />
            <MetricCard
              label="Entry-level signal"
              metric={metricValue(metrics, 'entryLevelRate')}
              points={h('entryLevelRate')}
              note="Share of active postings tagged entry-level or explicitly open to candidates with little or no prior experience."
              denominatorLabel="active openings"
              compareDays={90}
            />
            <MetricCard
              label="Entry-level contradiction"
              metric={metricValue(metrics, 'entryLevelContradictionRate')}
              points={h('entryLevelContradictionRate')}
              note="Share of entry-level-labeled openings that also explicitly ask for prior experience."
              denominatorLabel="entry-level-labeled openings"
              compareDays={90}
            />
          </div>

          {definitionBox(
            'Interpretation',
            'These are advertised requirements, not verified screening behavior. A requirement can also be written as preferred rather than mandatory, so your classifier should keep required and preferred language separate where possible.'
          )}
        </section>

        <section className="border-t border-slate-200 py-10" id="secondary-indicators">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-slate-700">
                <TrendingUp className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-[0.14em]">Secondary indicator</p>
              </div>
              <h2 className="mt-2 text-lg font-bold text-slate-950">Sign-on bonus mention rate</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Kept as a supporting tightness signal rather than a headline measure. It captures explicit sign-on or signing-bonus language in field-oriented openings.
              </p>
            </div>
            <div className="mt-5 min-w-[210px] sm:mt-0">
              <MetricCard
                label="Sign-on bonus"
                metric={metricValue(metrics, 'signOnBonusRate')}
                points={h('signOnBonusRate')}
                note="Explicit bonus mentions among field-oriented openings."
                denominatorLabel="field-oriented openings"
                compareDays={90}
                compact
              />
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="reporter-notes">
          <SectionHeading
            eyebrow="For reporters"
            title="How to cite and interpret the numbers"
            description="Solar Roles tracks advertised labor demand. The measures are designed to identify changes in employer behavior before slower annual workforce reports are available, but they are not a substitute for employment or payroll statistics."
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
              <p className="text-sm font-bold text-slate-900">Use the denominator</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Segment, skill, training and entry-barrier rates use question-specific denominators. Cite the denominator when comparing a rate with another source.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-900">Prefer trends to one-day moves</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Daily postings are noisy. Structural indicators are generally more useful over 30- or 90-day windows than as single-day changes.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-900">Snapshot citation</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              As of {lastUpdated}, Solar Roles indexed {market.totalJobs.toLocaleString('en-US')} active US solar openings across{' '}
              {market.employerCount.toLocaleString('en-US')} employers. Figures may be revised as records are refreshed, deduplicated or reclassified.
            </p>
          </div>
        </section>

        <section className="border-t border-slate-200 py-12" id="methodology">
          <SectionHeading
            eyebrow="Methodology"
            title="What this dataset measures"
            description="This page is a current indicator of advertised solar labor demand, not a census of employment. Metric definitions are intentionally narrow so reporters can reproduce the denominator and understand what a change means."
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
              <p className="font-bold text-slate-900">Role-specific denominators</p>
              <p className="mt-2">
                Rates are calculated only within the population relevant to the question — for example, grid/HV skills within technical roles and entry-level contradictions within entry-level-labeled openings.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="font-bold text-slate-900">Pay normalization</p>
              <p className="mt-2">
                Posted ranges are converted to annual equivalents where possible. Hourly pay assumes 2,080 hours per year and weekly pay uses 52 weeks. Implausible annualized values should remain excluded before calculating transparency or range-width statistics.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="font-bold text-slate-900">Text-derived signals</p>
              <p className="mt-2">
                Skill, training, experience and credential indicators measure explicit language in titles, descriptions and structured fields. A missing mention should not be interpreted as proof that a condition or benefit does not exist.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 md:col-span-2">
              <p className="font-bold text-slate-900">Historical comparisons</p>
              <p className="mt-2">
                Daily snapshots retain numerator, denominator and value for each rate. Shares are compared in percentage points. Reporter-facing trend claims should use the date shown on the page and should distinguish a change in the indexed hiring market from a change in total solar employment.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-12" id="research">
          <SectionHeading
            eyebrow="Solar Roles research"
            title="Original reports built from the job-posting database"
            description="Longer analyses sit below the live indicators so the data page remains a reference dashboard first and a research archive second."
            icon={<BarChart3 className="h-5 w-5" />}
          />

          <div className="grid gap-4 md:grid-cols-3">
            {REPORTS.map((report) => (
              <Link
                key={report.href}
                href={report.href}
                className="group rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:border-amber-300 hover:bg-amber-100/70"
              >
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-700">Data report</p>
                <h3 className="mt-3 font-bold leading-6 text-slate-950">{report.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{report.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-amber-800">
                  Read report <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Figures update daily and may be revised as job records are refreshed, deduplicated or reclassified. Use the date shown at the top of the page when citing a snapshot.
          </p>
        </section>
      </main>
    </>
  )
}
