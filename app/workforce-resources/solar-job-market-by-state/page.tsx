import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPinned } from 'lucide-react'
import { getWorkforceSnapshot } from '../_lib/workforceData'
import {
  MethodologyNote,
  ResourceFooter,
  ResourceHeader,
  ResourceLink,
} from '../_components/ResourceShell'

export const revalidate = 86400

const CANONICAL_URL = 'https://www.solarroles.com/workforce-resources/solar-job-market-by-state'
const MIN_STATE_DETAIL_JOBS = 20

export const metadata: Metadata = {
  title: 'Solar Hiring by State: Live U.S. Job Market | Solar Roles',
  description: 'Compare active solar job listings and explicit entry-level openings across all 50 states, with detailed market pages where the current sample supports them.',
  alternates: { canonical: CANONICAL_URL },
}

function formatSnapshotDate(value: Date | null) {
  if (!value) return 'Unavailable'

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value)
}

export default async function SolarJobMarketByStatePage() {
  const data = await getWorkforceSnapshot()
  const states = data.states
  const snapshotDate = formatSnapshotDate(data.dataAsOf)

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <ResourceHeader
        eyebrow="State job markets"
        title="Where solar hiring is concentrated right now"
        intro="State totals show the geographic distribution of active solar postings and the subset that explicitly welcomes entry-level candidates. Detailed market pages add advertised employers, titles, compensation and employment types for states with sufficient coverage."
      />

      <p className="-mt-6 mb-10 text-sm text-gray-500">
        Data as of{' '}
        {data.dataAsOf ? (
          <time dateTime={data.dataAsOf.toISOString()} className="font-medium text-gray-700">
            {snapshotDate}
          </time>
        ) : (
          <span className="font-medium text-gray-700">{snapshotDate}</span>
        )}
        {' '}· Updated daily from the Solar Roles jobs database.
      </p>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Current market summary">
        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">{data.totalJobs.toLocaleString('en-US')}</p>
          <p className="mt-2 text-sm text-gray-500">active US listings</p>
        </div>
        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">{data.statesCovered}</p>
          <p className="mt-2 text-sm text-gray-500">states represented in the current snapshot</p>
        </div>
        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">{states[0]?.name ?? '—'}</p>
          <p className="mt-2 text-sm text-gray-500">largest current market by active listings</p>
        </div>
      </section>

      <div className="mt-7">
        <MethodologyNote>
          State names and two-letter abbreviations are normalized before counting, so “California” and “CA” form one market. The entry-level column includes only postings with explicit entry-level or no-experience language. All figures count postings; they are not estimates of employment or planned hires.
        </MethodologyNote>
      </div>

      <section className="mt-14">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <MapPinned className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-950">All 50 states</h2>
            <p className="text-sm text-gray-500">Active listings and the explicit entry-level subset, ranked by market size.</p>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200">
          <div className="hidden grid-cols-[44px_minmax(0,1fr)_120px_130px] gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid">
            <span>Rank</span>
            <span>State</span>
            <span className="text-right">Active</span>
            <span className="text-right">Entry-level</span>
          </div>

          {states.map((state, index) => {
            const hasDetailedPage = state.count >= MIN_STATE_DETAIL_JOBS
            const href = hasDetailedPage
              ? `/data/states/${state.slug}`
              : `/jobs?where=${encodeURIComponent(state.name)}`

            return (
              <div
                key={state.code}
                className={`grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0 sm:grid-cols-[44px_minmax(0,1fr)_120px_130px] ${index % 2 ? 'bg-gray-50/70' : 'bg-white'}`}
              >
                <span className="text-sm font-bold text-gray-400">{index + 1}</span>
                <div className="min-w-0">
                  <Link href={href} className="group inline-flex items-center gap-2 font-medium text-gray-950 hover:text-blue-700">
                    <span>{state.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-blue-700" />
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {state.code} · {hasDetailedPage ? 'Detailed state data' : 'Live jobs search'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{state.count.toLocaleString('en-US')}</p>
                  <p className="text-xs text-gray-400 sm:hidden">active</p>
                </div>
                <div className="col-start-2 text-left sm:col-start-auto sm:text-right">
                  <p className="font-semibold text-violet-700">{state.entryLevelCount.toLocaleString('en-US')}</p>
                  <p className="text-xs text-gray-400 sm:hidden">explicitly entry-level</p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Detailed state reports are published once a state has at least {MIN_STATE_DETAIL_JOBS} active postings. Smaller samples link to the corresponding live jobs search instead of an unavailable report.
        </p>
      </section>

      <section className="mt-14" aria-labelledby="next-question-heading">
        <h2 id="next-question-heading" className="text-2xl font-bold text-gray-950">State totals require occupational and entry-level context</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
          Program planning also depends on the occupations being advertised and the share of postings that identify an entry point for beginners. The companion analyses below apply those measures to the same active-job snapshot.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ResourceLink
            href="/workforce-resources/entry-level-solar-jobs"
            title="Entry-level posting analysis"
            description="See which states and employers explicitly advertise entry-level work or accept candidates without experience."
          />
          <ResourceLink
            href="/workforce-resources/solar-career-pathways"
            title="Career pathway reference"
            description="Translate advertised titles into installation, electrical, O&M, engineering, project delivery and sales pathways."
          />
        </div>
      </section>

      <section className="mt-14 rounded-3xl bg-gray-950 p-7 text-white">
        <h2 className="text-xl font-bold">Review advertised occupations before revising a program</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">
          Detailed state pages report leading employers, advertised titles, posted pay and employment types. The career-pathway reference supplies an occupational framework for interpreting those titles. A normalized state-level role-family distribution is not currently published.
        </p>
        <Link href="/workforce-resources/solar-career-pathways" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200">
          Open the career-pathways map <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <ResourceFooter canonicalUrl={CANONICAL_URL} updatedAt={snapshotDate} />
    </main>
  )
}
