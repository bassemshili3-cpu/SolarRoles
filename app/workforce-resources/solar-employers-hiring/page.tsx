import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Database, ShieldCheck } from 'lucide-react'
import { getWorkforceSnapshot } from '../_lib/workforceData'
import {
  MethodologyNote,
  ResourceFooter,
  ResourceHeader,
} from '../_components/ResourceShell'

export const revalidate = 86400

const CANONICAL_URL =
  'https://www.solarroles.com/workforce-resources/solar-employers-hiring'

export const metadata: Metadata = {
  title: 'Solar Employers Hiring Now: U.S. Employer Tracker | Solar Roles',
  description:
    'Track the organizations associated with the largest number of active solar job postings in the Solar Roles database, with staffing and recruiting firms identified separately.',
  alternates: { canonical: CANONICAL_URL },
}

function formatSnapshotDate(value: Date | null) {
  if (!value) return 'Unavailable'

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(value)
}

export default async function SolarEmployersHiringPage() {
  const data = await getWorkforceSnapshot()
  const employers = data.topEmployers.slice(0, 50)
  const topEmployer = employers[0]
  const snapshotDate = formatSnapshotDate(data.dataAsOf)

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <ResourceHeader
        eyebrow="Employer activity"
        title="Organizations posting solar jobs now"
        intro="The tracker ranks organizations by active posting records observed by Solar Roles, identifies staffing and recruiting organizations separately, and reports the states represented in each posting footprint. Placement teams can use these measures to identify advertisers with recent demand in the regions they serve."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">
            {data.employerCount.toLocaleString('en-US')}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            organizations in the current active snapshot
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">
            {topEmployer?.count.toLocaleString('en-US') ?? '—'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            active postings associated with the current #1 organization
          </p>
          {topEmployer && (
            <p className="mt-2 truncate text-xs font-medium text-gray-700" title={topEmployer.name}>
              {topEmployer.name}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">
            {topEmployer?.states.length ?? 0}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            states represented by the current #1 organization
          </p>
        </div>
      </section>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Market snapshot: {snapshotDate}. Solar Roles refreshes active-listing data daily.
      </p>

      <div className="mt-7">
        <MethodologyNote>
          Rank is based on active posting records and does not measure employer quality, company headcount or confirmed hiring. Staffing and recruiting organizations may advertise openings on behalf of client companies and are labeled separately below. Company names are normalized across obvious aliases, and exact duplicate destination URLs are collapsed before the employer ranking is calculated. Separate requisitions remain separate when the available data does not establish that they are the same job.
        </MethodologyNote>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <p className="text-sm leading-6 text-blue-950">
            <span className="font-semibold">Independent ranking.</span>{' '}
            Position is determined by observed posting volume. Sponsorship,
            paid placement and commercial relationships with Solar Roles have
            no role in the calculation.
          </p>
        </div>
      </div>

      {data.employerRankingDuplicateRowsRemoved > 0 && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
          <p className="text-sm leading-6 text-gray-700">
            <span className="font-semibold text-gray-950">
              Duplicate control:
            </span>{' '}
            {data.employerRankingDuplicateRowsRemoved.toLocaleString('en-US')}{' '}
            active records with an identical destination URL were collapsed in
            the current snapshot before organizations were ranked. This rule is
            intentionally conservative: matching titles or locations alone are
            not treated as proof that two requisitions are duplicates.
          </p>
        </div>
      )}

      <section className="mt-14">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-950">
              Top 50 by active postings
            </h2>
            <p className="text-sm text-gray-500">
              A current activity list for employer research and placement outreach.
            </p>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200">
          <div className="hidden grid-cols-[44px_1fr_.7fr_.9fr] gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-gray-500 md:grid">
            <span>Rank</span>
            <span>Organization</span>
            <span>Postings</span>
            <span>State footprint</span>
          </div>

          {employers.map((employer, index) => {
            const isStaffing = employer.organizationType === 'staffing-recruiting'

            return (
              <div
                key={employer.name}
                className={`grid gap-3 px-5 py-4 md:grid-cols-[44px_1fr_.7fr_.9fr] md:items-center ${
                  index % 2 ? 'bg-gray-50/70' : 'bg-white'
                }`}
              >
                <span className="text-sm font-bold text-gray-400">{index + 1}</span>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-950">{employer.name}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isStaffing
                          ? 'bg-violet-100 text-violet-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {isStaffing ? 'Staffing / recruiting' : 'Direct employer'}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    {employer.states.slice(0, 8).join(', ')}
                    {employer.states.length > 8 ? '…' : ''}
                  </p>
                </div>

                <p className="text-sm text-gray-700">
                  <span className="md:hidden">Postings: </span>
                  {employer.count.toLocaleString('en-US')}
                </p>

                <p className="text-sm text-gray-500">
                  <span className="md:hidden">State footprint: </span>
                  {employer.states.length} state
                  {employer.states.length === 1 ? '' : 's'}
                </p>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Organization type is a best-effort classification used to distinguish
          firms that recruit or staff on behalf of clients from organizations
          posting principally under their own employer identity. If a
          classification is incorrect, Solar Roles will review source-backed
          corrections.
        </p>
      </section>

      <section className="mt-14 rounded-3xl border border-gray-200 bg-gray-50 p-7">
        <h2 className="text-xl font-bold text-gray-950">
          Employer outreach should reflect program and regional fit
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
          Placement teams can compare each organization&apos;s state presence with
          the occupations taught by their program. National posting volume and
          local placement relevance are separate measures. A regional
          contractor with repeated beginner-friendly openings may warrant
          attention even when it ranks below a national advertiser. Staffing
          and recruiting firms form a separate channel because their posting
          footprint may represent several client employers.
        </p>
        <Link
          href="/workforce-resources/entry-level-solar-jobs"
          className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          See explicit entry-level hiring signals →
        </Link>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-950">
          Corrections and employer questions
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          If an organization believes its name has been merged incorrectly, its
          staffing status is misclassified, or duplicate posting records are
          affecting the count, contact Solar Roles with the relevant career-page
          or requisition links. We review verifiable data errors and update the
          tracker when a correction is supported by the source record. Factual
          inclusion in the activity tracker is not removed solely on request.
        </p>
        <a
          href="mailto:contact@solarroles.com?subject=Employer%20tracker%20correction"
          className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          contact@solarroles.com
        </a>
      </section>

      <ResourceFooter canonicalUrl={CANONICAL_URL} updatedAt={snapshotDate} />
    </main>
  )
}
