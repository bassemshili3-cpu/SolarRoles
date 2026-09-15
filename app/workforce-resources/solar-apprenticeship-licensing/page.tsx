import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, MapPin, ShieldCheck } from 'lucide-react'
import { getWorkforceSnapshot } from '../_lib/workforceData'
import {
  MethodologyNote,
  ResourceFooter,
  ResourceHeader,
  ResourceLink,
} from '../_components/ResourceShell'

export const revalidate = 86400

const CANONICAL_URL =
  'https://www.solarroles.com/workforce-resources/solar-apprenticeship-licensing'

// Maintenance: re-check every external URL and the wording below at least once per quarter.
// Next planned manual review after this revision: December 2026.
const LINKS_LAST_CHECKED = 'September 15, 2026'
const LINK_REVIEW_CADENCE = 'quarterly'

export const metadata: Metadata = {
  title: 'Solar Apprenticeship & Licensing by State | Solar Roles',
  description:
    'Current state hiring context and authoritative sources for verifying electrical licensing, contractor licensing and Registered Apprenticeship pathways.',
  alternates: { canonical: CANONICAL_URL },
}

const authoritativeTools = [
  {
    name: 'CareerOneStop License Finder',
    href: 'https://www.careeronestop.org/Toolkit/Training/find-licenses.aspx',
    authority: 'U.S. Department of Labor-sponsored',
    note:
      'Use the License Finder to identify occupational licenses and the state agency that issues them. It is most useful for individual trade and occupation requirements.',
  },
  {
    name: 'Apprenticeship.gov Job Finder',
    href: 'https://www.apprenticeship.gov/apprenticeship-job-finder',
    authority: 'U.S. Department of Labor',
    note:
      'Search current apprenticeship opportunities and registered partners by occupation and location. Apprenticeship status should be checked separately from occupational or contractor licensing.',
  },
  {
    name: 'NASCLA contractor licensing reference',
    href: 'https://www.nascla.org/consumer-reference-library',
    authority: 'Association of state contractor licensing agencies',
    note:
      'NASCLA’s 2026 Contractor’s State Licensing Information Directory covers contractor-licensing requirements across U.S. jurisdictions. The searchable digital edition is member-only; a print edition is sold separately.',
  },
  {
    name: 'IREC Solar Licensing Database',
    href: 'https://irecusa.org/solar-licensing-database/',
    authority: 'Solar-specific reference',
    note:
      'Useful for solar-specific orientation across states. IREC lists the database as last updated in December 2022 and advises users to confirm current requirements with the relevant state or local licensing board.',
  },
]

function formatSnapshotDate(value: Date | null) {
  if (!value) return 'Unavailable'

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  }).format(value)
}

export default async function SolarApprenticeshipLicensingPage() {
  const data = await getWorkforceSnapshot()
  const statesAlphabetical = [...data.states].sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  const snapshotDate = formatSnapshotDate(data.dataAsOf)

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <ResourceHeader
        eyebrow="Apprenticeship & licensing"
        title="State authorities determine solar licensing and apprenticeship requirements"
        intro="Electrical licensing, contractor licensing and apprenticeship structures vary by jurisdiction and by role. Solar Roles pairs current state hiring counts with federal, state and industry sources used to verify the pathway that applies to a student or worker."
      />

      <MethodologyNote>
        State rules may distinguish among employees, apprentices, journeypersons, electrical contractors and supervising license holders. Hiring counts provide market context. The issuing state or local authority determines the current requirements for a particular person and scope of work.
      </MethodologyNote>

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm leading-6 text-amber-950">
          <span className="font-semibold">Informational resource.</span> Licensing and apprenticeship requirements change, and local rules may add another layer. Confirm current requirements with the relevant state or local agency before advising a student or making a licensing decision. This material does not constitute legal advice.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-950">
          Authoritative verification tools
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-gray-600">
          No single national database answers every licensing question. A reliable check usually separates three issues: the individual occupational license, the contractor or business license, and the status of an apprenticeship program. The sources below cover those questions from different angles.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {authoritativeTools.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-gray-200 p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    {tool.authority}
                  </p>
                  <h3 className="mt-2 font-semibold text-gray-950">{tool.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {tool.note}
                  </p>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-gray-400 transition group-hover:text-blue-700" />
              </div>
            </a>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          External reference links last checked: {LINKS_LAST_CHECKED}. Review cadence: {LINK_REVIEW_CADENCE}.
        </p>
      </section>

      <section className="mt-14">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-950">
              50-state market context
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
              The index reports current employer demand by state. Regulatory complexity is assessed separately through the licensing and apprenticeship sources above.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {statesAlphabetical.map((state) => (
            <Link
              key={state.code}
              href={`/data/states/${state.slug}`}
              className="group rounded-2xl border border-gray-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/40"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-950">{state.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {state.count.toLocaleString('en-US')} current active listings
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 group-hover:bg-white">
                  {state.code}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Market snapshot: {snapshotDate}. Counts reflect active listings indexed by Solar Roles and should not be read as estimates of total solar employment in a state.
        </p>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <ResourceLink
          href="/resources/solar-installer-vs-electrician-texas"
          title="Texas: installer work vs electrical licensing"
          description="A worked example showing why a solar job title and the legal authority to perform electrical work are separate questions."
        />
        <ResourceLink
          href="/resources/solar-installer-apprenticeship-programs"
          title="How solar apprenticeships are structured"
          description="Compare employer-run training, Registered Apprenticeship and electrical-track programs already covered by Solar Roles."
        />
        <ResourceLink
          href="/resources/how-to-get-a-solar-apprenticeship"
          title="How students actually apply"
          description="Application, testing, ranking and program-search steps for candidates ready to pursue an apprenticeship."
        />
        <ResourceLink
          href="/resources/solar-certifications-by-job-role"
          title="Where NABCEP and OSHA fit"
          description="Separate voluntary credentials and employer preferences from state-issued occupational or contractor licenses."
        />
      </section>

      <section className="mt-14 rounded-3xl bg-gray-950 p-7 text-white">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-blue-300" />
          <div>
            <h2 className="text-xl font-bold">For program staff</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">
              If a course states that training hours count toward an electrician credential, document the exact credential, the required supervision, the jurisdiction and the agency that recognizes those hours. Solar work experience, apprenticeship participation and electrical-license credit can overlap, but they are not interchangeable.
            </p>
          </div>
        </div>
      </section>

      <ResourceFooter
        canonicalUrl={CANONICAL_URL}
        updatedAt={snapshotDate}
      />
    </main>
  )
}
