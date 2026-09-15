import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, DollarSign } from 'lucide-react'
import { formatMoney, getWorkforceSnapshot } from '../_lib/workforceData'
import { MethodologyNote, ResourceHeader } from '../_components/ResourceShell'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Solar Pay by Role and State: Live Salary Explorer | Solar Roles',
  description:
    'Compare current listed pay across solar roles and open Solar Roles salary reports by state for installers, electricians, technicians, sales and engineers.',
  alternates: {
    canonical:
      'https://www.solarroles.com/workforce-resources/solar-salary-explorer',
  },
}

const MIN_SALARY_SAMPLE = 15

function isCommissionHeavyRole(role: { key: string; label: string }) {
  const value = `${role.key} ${role.label}`.toLowerCase()
  return value.includes('sales')
}

export default async function SolarSalaryExplorerPage() {
  const data = await getWorkforceSnapshot()

  const roles = data.roleStats
    .filter(
      (role) =>
        role.avgAnnualizedListedPay != null ||
        role.medianAnnualizedListedPay != null ||
        role.salaryHref
    )

  const snapshotDateIso = data.dataAsOf?.toISOString()
  const snapshotDateLabel = data.dataAsOf
    ? data.dataAsOf.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'Unavailable'

  const headlinePay =
    data.medianAnnualizedListedPay ?? data.avgAnnualizedListedPay

  const headlinePayLabel =
    data.medianAnnualizedListedPay != null
      ? 'median annualized listed pay in the usable salary sample'
      : 'average annualized midpoint in the usable salary sample'

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <ResourceHeader
        eyebrow="Salary explorer"
        title="Posted pay varies across solar occupations and state markets"
        intro="The table reports median and average annualized listed pay by job family, together with the number of usable salary observations. Role-specific reports provide state-level detail for occupations with published coverage."
      />

      <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
        <span>Data snapshot:</span>
        <time dateTime={snapshotDateIso} className="font-medium text-gray-700">
          {snapshotDateLabel}
        </time>
        <span aria-hidden="true">·</span>
        <span>Refreshed daily</span>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">
            {formatMoney(headlinePay)}
          </p>
          <p className="mt-2 text-sm leading-5 text-gray-500">
            {headlinePayLabel}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">
            {data.salarySample.toLocaleString('en-US')}
          </p>
          <p className="mt-2 text-sm leading-5 text-gray-500">
            active listings with usable listed compensation
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-4xl font-bold text-gray-950">
            {roles.filter((role) => role.salaryHref).length}
          </p>
          <p className="mt-2 text-sm leading-5 text-gray-500">
            role-specific state salary reports published
          </p>
        </div>
      </section>

      <div className="mt-7">
        <MethodologyNote>
          Hourly pay ranges are annualized at 2,080 hours for comparison,
          while clearly annual ranges are kept as listed. This conversion is
          a reporting convention and does not assume that every position
          provides 2,080 paid hours a year. Ambiguous values outside a
          $20,000–$600,000 annualized range are excluded. Role-level pay
          figures are not displayed when fewer than {MIN_SALARY_SAMPLE} usable
          salary observations are available. For commission-based positions,
          particularly sales roles, posted compensation may reflect
          on-target earnings, estimated total earnings or other incentive
          assumptions rather than guaranteed base pay.
        </MethodologyNote>
      </div>

      <section className="mt-14">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <DollarSign className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-950">
              Current listed pay by job family
            </h2>
            <p className="text-sm text-gray-500">
              Median, average and sample size are reported together for each
              job family.
            </p>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200">
          <div className="hidden grid-cols-[1.5fr_.55fr_.85fr_.85fr_.65fr] gap-4 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-500 md:grid">
            <span>Role</span>
            <span>Openings</span>
            <span>Median listed pay</span>
            <span>Avg. listed pay</span>
            <span>Salary sample</span>
          </div>

          {roles.map((role, index) => {
            const smallSample =
              role.salarySample > 0 &&
              role.salarySample < MIN_SALARY_SAMPLE

            const noSalarySample = role.salarySample === 0

            const showPay =
              role.salarySample >= MIN_SALARY_SAMPLE

            const commissionHeavy = isCommissionHeavyRole(role)

            return (
              <div
                key={role.key}
                className={`grid gap-4 px-5 py-5 md:grid-cols-[1.5fr_.55fr_.85fr_.85fr_.65fr] md:items-center ${
                  index % 2 ? 'bg-gray-50/60' : 'bg-white'
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-950">
                    {role.label}
                  </p>

                  {commissionHeavy && (
                    <div className="mt-2">
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Commission-based compensation common
                      </span>

                      <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
                        Listed pay may represent on-target or estimated total
                        earnings rather than guaranteed base salary.
                      </p>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    {role.salaryHref && (
                      <Link
                        href={role.salaryHref}
                        className="font-medium text-blue-700 hover:text-blue-900"
                      >
                        State salary report
                      </Link>
                    )}

                    {role.jobsHref && (
                      <Link
                        href={role.jobsHref}
                        className="font-medium text-gray-600 hover:text-gray-900"
                      >
                        Live jobs
                      </Link>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700">
                  <span className="md:hidden">Openings: </span>
                  {role.count.toLocaleString('en-US')}
                </p>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    <span className="md:hidden">Median listed pay: </span>
                    {showPay && role.medianAnnualizedListedPay != null
                      ? formatMoney(role.medianAnnualizedListedPay)
                      : '—'}
                  </p>

                  {smallSample && (
                    <p className="mt-1 text-xs text-amber-700">
                      Not shown — small sample
                    </p>
                  )}

                  {noSalarySample && (
                    <p className="mt-1 text-xs text-gray-500">
                      No usable pay sample
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    <span className="md:hidden">Average listed pay: </span>
                    {showPay && role.avgAnnualizedListedPay != null
                      ? formatMoney(role.avgAnnualizedListedPay)
                      : '—'}
                  </p>

                  {smallSample && (
                    <p className="mt-1 text-xs text-amber-700">
                      Not shown — small sample
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">
                    <span className="md:hidden">Salary sample: </span>
                    {role.salarySample.toLocaleString('en-US')}
                  </p>

                  {smallSample && (
                    <span className="mt-1.5 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Small sample
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 max-w-3xl text-xs leading-5 text-gray-500">
          Median and average figures use only listings with compensation that
          can be normalized to an annual amount. A listing may therefore
          appear in the openings count without appearing in the salary sample.
        </p>
      </section>

      <section className="mt-14 rounded-3xl border border-gray-200 bg-gray-50 p-7">
        <h2 className="text-xl font-bold text-gray-950">
          Interpreting salary data in career advising
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
          Career advising should pair the national job-family estimates with
          state data and the underlying posting. Advertised compensation can
          vary with experience, overtime, incentives, travel, per diem and
          licensing requirements. The distribution and sample size provide
          essential context for any reported median or average.
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
          Sales listings deserve additional caution. Compensation advertised
          for commission-based jobs may include projected commissions or
          on-target earnings that are not part of the guaranteed base salary.
        </p>

        <Link
          href="/data"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          Open the full Solar Roles data hub
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  )
}
