import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { getWorkforceSnapshot } from '../_lib/workforceData'
import {
  MethodologyNote,
  ResourceFooter,
  ResourceHeader,
  ResourceLink,
} from '../_components/ResourceShell'

export const revalidate = 86400

const MIN_ROLE_RATE_SAMPLE = 20
const MIN_STATE_EMPLOYERS_FOR_UNFLAGGED_RANKING = 3
const CONCENTRATION_SHARE_THRESHOLD = 60

// Keep this null until the paid-training report is live. Once published, replace
// null with its route (for example: '/data/solar-training-signals-by-role').
const TRAINING_REPORT_HREF: string | null = null

const CANONICAL_URL = 'https://www.solarroles.com/workforce-resources/entry-level-solar-jobs'

export const metadata: Metadata = {
  title: 'Entry-Level Solar Hiring Data by State and Role | Solar Roles',
  description:
    'A daily snapshot of US solar postings that explicitly use entry-level or no-experience language, with state, employer and role breakdowns for workforce programs.',
  alternates: { canonical: CANONICAL_URL },
}

function formatSnapshotDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export default async function EntryLevelSolarJobsPage() {
  const data = await getWorkforceSnapshot()
  const snapshotDate = data.dataAsOf
    ? formatSnapshotDate(data.dataAsOf)
    : 'No active-job refresh available'

  const entryStates = [...data.states]
    .filter((state) => state.entryLevelCount > 0)
    .sort((a, b) => b.entryLevelCount - a.entryLevelCount)
    .slice(0, 12)

  const roleRows = [...data.roleStats]
    .filter((role) => role.entryLevelCount > 0)
    .sort((a, b) => b.entryLevelCount - a.entryLevelCount)

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <ResourceHeader
        eyebrow="Entry-level hiring"
        title={`${data.entryLevelCount.toLocaleString('en-US')} active solar postings explicitly identify an entry point`}
        intro="The measure includes active US postings tagged as entry-level or stating that prior experience is unnecessary. State, employer and occupational tables show where that language appears in the current snapshot; postings that are silent about experience remain outside the measure."
      />

      <div className="-mt-6 mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
        <span>
          Snapshot date:{' '}
          <time dateTime={data.dataAsOf?.toISOString()} className="font-medium text-gray-700">
            {snapshotDate}
          </time>
        </span>
        <span aria-hidden="true" className="hidden text-gray-300 sm:inline">•</span>
        <span>Refreshed daily</span>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">{data.entryLevelCount.toLocaleString('en-US')}</p>
          <p className="mt-2 text-sm text-gray-500">active listings with explicit entry-level wording</p>
        </div>
        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">{data.entryLevelPct.toFixed(1)}%</p>
          <p className="mt-2 text-sm text-gray-500">of all active Solar Roles listings</p>
        </div>
        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">{entryStates.length ? entryStates[0].name : '—'}</p>
          <p className="mt-2 text-sm text-gray-500">state with the most explicit entry-level postings</p>
        </div>
      </section>

      <div className="mt-7 space-y-4">
        <MethodologyNote>
          <strong className="font-semibold text-gray-900">Explicit entry-level accessibility</strong> is defined by an entry-level tag or the phrases “entry-level,” “entry level,” “no experience required,” and “no experience necessary.” The headline total excludes postings that may accept beginners but provide no such evidence.
        </MethodologyNote>

        <MethodologyNote>
          <strong className="font-semibold text-gray-900">Paid training is reported as a separate access measure.</strong> Its narrower definition requires an explicit offer of paid training. Entry-level wording alone does not establish that training is provided, so the two measures have different numerators and should be cited separately.
          {TRAINING_REPORT_HREF && (
            <>
              {' '}
              <Link href={TRAINING_REPORT_HREF} className="font-medium text-blue-700 hover:text-blue-900">
                See the full analysis of solar training signals by role.
              </Link>
            </>
          )}
        </MethodologyNote>
      </div>

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold text-gray-950">States with the most explicit entry-level postings</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Rankings use posting counts, not employer-weighted counts. Distinct-employer totals are shown to make concentrated hiring campaigns visible.
          </p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
            {entryStates.map((state, index) => {
              const concentrated =
                state.entryLevelCount >= 10 &&
                (state.entryLevelEmployerCount < MIN_STATE_EMPLOYERS_FOR_UNFLAGGED_RANKING ||
                  state.entryLevelTopEmployerShare >= CONCENTRATION_SHARE_THRESHOLD)

              return (
                <Link
                  key={state.code}
                  href={`/data/states/${state.slug}`}
                  className={`block px-5 py-4 hover:bg-blue-50 ${index % 2 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 w-6 shrink-0 text-sm font-bold text-gray-400">{index + 1}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-900">{state.name}</span>
                          {concentrated && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                              concentrated sample
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {state.entryLevelEmployerCount.toLocaleString('en-US')} distinct {state.entryLevelEmployerCount === 1 ? 'employer' : 'employers'}
                          {concentrated && state.entryLevelTopEmployerName
                            ? ` · ${state.entryLevelTopEmployerName} accounts for ${state.entryLevelTopEmployerCount} of ${state.entryLevelCount}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm text-gray-500">{state.entryLevelCount} openings</span>
                  </div>
                </Link>
              )
            })}
          </div>

          <p className="mt-3 text-xs leading-5 text-gray-400">
            A high posting count can reflect a broad local market or a single employer advertising the same type of role at scale. The employer count is provided so those cases are not treated as equivalent.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-950">Roles with visible entry points for beginners</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Rates are published only when at least {MIN_ROLE_RATE_SAMPLE} matching openings are in the current sample.
          </p>

          <div className="mt-5 space-y-3">
            {roleRows.map((role) => {
              const canPublishRate = role.count >= MIN_ROLE_RATE_SAMPLE
              const rate = role.count > 0 ? (role.entryLevelCount / role.count) * 100 : 0

              return (
                <div key={role.key} className="rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-semibold text-gray-950">{role.label}</h3>
                    <span className="text-sm font-semibold text-blue-700">
                      {role.entryLevelCount} entry-level {role.entryLevelCount === 1 ? 'opening' : 'openings'}
                    </span>
                  </div>

                  {canPublishRate ? (
                    <p className="mt-2 text-sm text-gray-500">
                      {rate.toFixed(0)}% of {role.count.toLocaleString('en-US')} matching current openings use explicit entry-level language.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      {role.entryLevelCount} of {role.count.toLocaleString('en-US')} matching current {role.count === 1 ? 'opening uses' : 'openings use'} explicit entry-level language. Sample too small for a meaningful rate.
                    </p>
                  )}

                  {role.jobsHref && (
                    <Link
                      href={role.jobsHref}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
                    >
                      Browse matching jobs <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-950">Evidence for program planning and student advising</h2>
            <p className="text-sm text-gray-500">Current posting data is accompanied by candidate, apprenticeship and credential references.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ResourceLink
            href="/solar-jobs-no-experience"
            title="Live no-experience jobs"
            description="Send students to current openings that explicitly advertise a beginner-friendly entry point."
          />
          <ResourceLink
            href="/resources/how-to-become-a-solar-installer"
            title="Installer entry guide"
            description="Step-by-step guidance for candidates preparing and applying for solar installer work."
          />
          <ResourceLink
            href="/resources/solar-installer-apprenticeship-programs"
            title="Paid apprenticeship routes"
            description="Compare direct hiring with structured earn-while-you-learn pathways."
          />
          <ResourceLink
            href="/workforce-resources/solar-skills-certifications"
            title="Skills employers ask for"
            description="See which credentials and technical requirements appear most often in current job descriptions."
          />
        </div>
      </section>

      <ResourceFooter
        canonicalUrl={CANONICAL_URL}
        updatedAt={snapshotDate}
        contactEmail="contact@solarroles.com"
      />
    </main>
  )
}
