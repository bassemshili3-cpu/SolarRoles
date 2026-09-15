import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, ArrowRight } from 'lucide-react'
import { getWorkforceSnapshot } from '../_lib/workforceData'
import {
  MethodologyNote,
  ResourceHeader,
  ResourceLink,
} from '../_components/ResourceShell'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'What Solar Employers Ask For: Skills & Credentials | Solar Roles',
  description:
    'Live job-posting evidence on solar credentials and technical skills for curriculum planning and career advising.',
  alternates: {
    canonical:
      'https://www.solarroles.com/workforce-resources/solar-skills-certifications',
  },
}

const MIN_SIGNAL_COUNT = 10
const CLASSIFIER_REVIEW_DATE = '2026-09-15'

export default async function SolarSkillsCertificationsPage() {
  const data = await getWorkforceSnapshot()

  const maxCount = Math.max(
    ...data.skillStats.map((skill) => skill.count),
    1
  )

  const updatedAtIso = data.dataAsOf?.toISOString()
  const updatedAtLabel = data.dataAsOf
    ? data.dataAsOf.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'Unavailable'

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <ResourceHeader
        eyebrow="Skills & credentials"
        title="Employer postings document demand for 18 solar skills and credentials"
        intro="The tracker counts explicit mentions of selected credentials, licenses, software and technical skills in active Solar Roles job titles and descriptions. These posting signals can inform curriculum review when considered with state licensing rules and local occupational demand."
      />

      <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
        <span>Updated</span>
        <time
          dateTime={updatedAtIso}
          className="font-medium text-gray-700"
        >
          {updatedAtLabel}
        </time>
        <span aria-hidden="true">·</span>
        <span>Refreshed daily</span>
        <span aria-hidden="true">·</span>
        <span>
          Classifier spot-check:{' '}
          <time dateTime={CLASSIFIER_REVIEW_DATE} className="font-medium text-gray-700">
            Sep. 15, 2026
          </time>
        </span>
      </div>

      <div className="mt-7">
        <MethodologyNote>
          These counts measure explicit text mentions in job titles and descriptions.
          They do not measure how many workers hold a credential, whether a
          credential is legally required, or whether every mention represents
          a formal hiring requirement. A term may appear as a required skill,
          preferred experience or technology used in the work. A single
          posting can also mention several tracked items. The counts report
          posting frequency. Requirements should be confirmed in the
          underlying job description, role guide or state authority.
        </MethodologyNote>
      </div>

      <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-6" aria-labelledby="classifier-check-heading">
        <h2 id="classifier-check-heading" className="text-lg font-bold text-gray-950">
          How matches are checked
        </h2>
        <div className="mt-3 max-w-4xl space-y-3 text-sm leading-6 text-gray-700">
          <p>
            Detection rules are manually spot-checked against matched job postings before publication. The latest review, completed September 15, 2026, examined 174 deduplicated matches across 18 tracked terms, with no more than one posting per employer in each term sample.
          </p>
          <p>
            Three non-job-context matches were identified in the initial review and used to tighten the BESS and electrical-journeyman rules. A fresh 20-posting follow-up check of those revised rules found no additional false positives.
          </p>
          <p>
            This is a precision spot-check, not a manual review of every listing. A match means the term appears in job-relevant context — including qualifications, responsibilities, tools, training or project scope — and does not by itself mean that the credential or skill is mandatory.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <Award className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-950">
              Current job-posting signals
            </h2>
            <p className="text-sm text-gray-500">
              Based on {data.totalJobs.toLocaleString('en-US')} active
              listings.
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-3xl border border-gray-200 bg-white p-6">
          <div className="space-y-6">
            {data.skillStats.map((skill) => {
              const limitedSignal =
                skill.count > 0 && skill.count < MIN_SIGNAL_COUNT

              const width =
                skill.count > 0
                  ? Math.min(
                      100,
                      (skill.count / maxCount) * 100
                    )
                  : 0

              return (
                <div key={skill.label}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {skill.label}
                        </p>

                        {limitedSignal && (
                          <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                            Limited signal
                          </span>
                        )}
                      </div>

                      <Link
                        href={skill.href}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
                      >
                        Related Solar Roles resource
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-950">
                        {skill.count.toLocaleString('en-US')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {skill.count === 1 ? 'listing' : 'listings'}
                      </p>
                    </div>
                  </div>

                  {!limitedSignal && skill.count > 0 ? (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  ) : (
                    <div className="mt-3 h-2 rounded-full bg-gray-100" />
                  )}

                  {limitedSignal && (
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Fewer than {MIN_SIGNAL_COUNT} active listings contain
                      this tracked term, so no comparison bar is shown.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-xs leading-5 text-gray-500">
          Bar lengths compare raw mention counts within the tracked set. They
          do not represent the share of employers requiring a skill.
        </p>
      </section>

      <section className="mt-14 rounded-3xl border border-gray-200 bg-gray-50 p-7">
        <h2 className="text-xl font-bold text-gray-950">
          The tracker covers 18 defined terms
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
          Each item has a defined text-matching rule in the current classifier.
          The set is selective and does not constitute an exhaustive inventory
          of employer requirements. Unlisted credentials, software packages
          and technical skills may still appear in solar job postings.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {data.skillStats.map((skill) => (
            <span
              key={skill.label}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700"
            >
              {skill.label}
            </span>
          ))}
        </div>

        <p className="mt-5 max-w-3xl text-xs leading-5 text-gray-500">
          Text matching identifies the presence of a tracked term. It does not
          by itself distinguish between a required qualification, a preferred
          qualification, prior experience or a technology referenced in the
          description of the work.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-gray-950">
          Legal requirements, employer demand and curriculum relevance require separate evidence
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-5">
            <p className="text-sm font-bold text-gray-950">
              Legal requirement
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              State electrical, contractor and licensing rules may make a
              credential mandatory for particular types of work.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5">
            <p className="text-sm font-bold text-gray-950">
              Employer demand
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Job-description frequency provides evidence of current employer
              demand, including qualifications that are preferred rather than
              mandatory.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5">
            <p className="text-sm font-bold text-gray-950">
              Curriculum relevance
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Program decisions depend on the occupations served and the local
              labor market. No single industry-wide checklist establishes
              curriculum relevance.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <ResourceLink
          href="/resources/solar-certifications-by-job-role"
          title="Certifications by job role"
          description="Separate legally required credentials from qualifications employers commonly request or prefer."
        />

        <ResourceLink
          href="/certifications"
          title="Solar Roles certifications library"
          description="Review NABCEP, OSHA and other credentials that may appear in solar job descriptions."
        />

        <ResourceLink
          href="/workforce-resources/solar-apprenticeship-licensing"
          title="Licensing & apprenticeship by state"
          description="Identify the state authority responsible for verifying the license named in a job posting."
        />

        <ResourceLink
          href="/resources/solar-engineer-jobs"
          title="Engineering software & title map"
          description="Review requirements associated with design, engineering and BESS roles."
        />
      </section>
    </main>
  )
}
