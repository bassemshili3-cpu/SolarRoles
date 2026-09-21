import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, GitBranch } from 'lucide-react'
import { getWorkforceSnapshot } from '../_lib/workforceData'
import {
  MethodologyNote,
  ResourceFooter,
  ResourceHeader,
} from '../_components/ResourceShell'

export const revalidate = 86400

const CANONICAL_URL =
  'https://www.solarroles.com/workforce-resources/solar-career-pathways'

// Add these links when the corresponding Solar Roles resources are published.
const PROJECT_MANAGER_GUIDE_HREF: string | null = null
const SALES_COMMISSION_REPORT_HREF: string | null = null

const MIN_PATHWAY_SAMPLE_FOR_RATE = 20

export const metadata: Metadata = {
  title: 'Solar Career Pathways for Students & Training Programs | Solar Roles',
  description:
    'A workforce-planning view of common solar career pathways across installation, electrical, O&M, engineering, project delivery and sales.',
  alternates: { canonical: CANONICAL_URL },
}

type PathwayLink = {
  href: string
  label: string
}

type Pathway = {
  name: string
  stages: string[]
  note: string
  roleKey: string
  links: PathwayLink[]
  plannedGuide?: {
    href: string | null
    label: string
  }
}

const pathways: Pathway[] = [
  {
    name: 'Field installation',
    stages: [
      'Helper / apprentice',
      'PV installer',
      'Lead installer / foreman',
      'Superintendent / operations',
    ],
    note:
      'Crew experience commonly precedes responsibility for installation quality, site supervision and field operations.',
    roleKey: 'pv-installer',
    links: [
      {
        href: '/resources/how-to-become-a-solar-installer',
        label: 'Installer entry guide',
      },
      {
        href: '/resources/solar-installer-apprenticeship-programs',
        label: 'Apprenticeship routes',
      },
      {
        href: '/data/salaries/solar-photovoltaic-installer',
        label: 'Installer pay by state',
      },
    ],
  },
  {
    name: 'Electrical',
    stages: [
      'Electrical apprentice',
      'Solar electrician',
      'Journeyman / lead electrician',
      'Foreman / commissioning',
    ],
    note:
      'Licensing requirements vary by state and scope of work. General PV installation and regulated electrical work may follow different training and supervision requirements.',
    roleKey: 'electrician',
    links: [
      {
        href: '/resources/solar-installer-vs-electrician-texas',
        label: 'Texas licensing example',
      },
      {
        href: '/resources/solar-certifications-by-job-role',
        label: 'Credentials by role',
      },
      {
        href: '/data/salaries/solar-electrician',
        label: 'Electrician pay by state',
      },
    ],
  },
  {
    name: 'Operations & maintenance',
    stages: [
      'Field / service technician',
      'O&M technician',
      'Lead / regional technician',
      'Commissioning / asset operations',
    ],
    note:
      'Diagnostics, electrical troubleshooting and service coverage are central to this track. Assignments often span a service territory and multiple operating sites.',
    roleKey: 'technician',
    links: [
      {
        href: '/solar-technician-jobs',
        label: 'Live technician jobs',
      },
      {
        href: '/data/salaries/solar-technician',
        label: 'Technician pay by state',
      },
      {
        href: '/resources/solar-certifications-by-job-role',
        label: 'Credentials by role',
      },
    ],
  },
  {
    name: 'Design & engineering',
    stages: [
      'Drafter / designer',
      'Design or project engineer',
      'Senior / systems engineer',
      'PE / interconnection / engineering lead',
    ],
    note:
      'Transitions from technical or design work into engineering vary by employer. Degree and professional-engineer requirements become more common with stamping authority, grid responsibility and larger project scope.',
    roleKey: 'engineer',
    links: [
      {
        href: '/resources/solar-engineer-jobs',
        label: 'Engineering title map',
      },
      {
        href: '/data/salaries/solar-engineer',
        label: 'Engineer pay by state',
      },
      {
        href: '/solar-engineer-jobs',
        label: 'Live engineering jobs',
      },
    ],
  },
  {
    name: 'Project delivery',
    stages: [
      'Field coordinator / project engineer',
      'Assistant project manager',
      'Project manager',
      'Senior PM / program leadership',
    ],
    note:
      'Construction experience can support progression into scheduling, requests for information, budgeting, subcontractor coordination and client delivery.',
    roleKey: 'project-management',
    links: [
      {
        href: '/workforce-resources/solar-employers-hiring',
        label: 'Employers hiring now',
      },
      {
        href: '/workforce-resources/solar-job-market-by-state',
        label: 'Market by state',
      },
    ],
    plannedGuide: {
      href: PROJECT_MANAGER_GUIDE_HREF,
      label: 'Dedicated project-management entry guide',
    },
  },
  {
    name: 'Sales & customer acquisition',
    stages: [
      'Setter / canvasser',
      'Advisor / closer',
      'Senior rep / team lead',
      'Sales manager / regional leadership',
    ],
    note:
      'Pay structure, lead source, cancellation exposure and worker classification are material features of sales work and should be evaluated alongside formal credentials.',
    roleKey: 'sales',
    links: [
      {
        href: '/resources/solar-sales-1099-vs-w2-pay',
        label: '1099 vs W-2 guide',
      },
      {
        href: '/data/salaries/solar-sales-representative',
        label: 'Sales pay by state',
      },
      {
        href: '/solar-sales-jobs',
        label: 'Live sales jobs',
      },
    ],
    plannedGuide: {
      href: SALES_COMMISSION_REPORT_HREF,
      label: 'How solar sales commissions actually pay out',
    },
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

export default async function SolarCareerPathwaysPage() {
  const data = await getWorkforceSnapshot()
  const roleMap = new Map(data.roleStats.map((role) => [role.key, role]))
  const snapshotDate = formatSnapshotDate(data.dataAsOf)

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <ResourceHeader
        eyebrow="Career pathways"
        title="Six occupational pathways connect entry-level solar work to advanced roles"
        intro="The pathway maps cover installation, electrical work, operations and maintenance, engineering, project delivery and sales. Each map identifies a common title progression and links current openings to role-specific guidance and salary data."
      />

      <MethodologyNote>
        The sequences summarize recurring title and responsibility patterns. Advancement varies by employer, market segment, licensing status and experience. Counts are based on title matching among active Solar Roles postings and represent current posting activity, not occupational employment.
      </MethodologyNote>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm leading-6 text-gray-700">
          <span className="font-semibold text-gray-950">
            Pathway count definition:
          </span>{' '}
          pathway categories are not mutually exclusive. A posting such as
          “Project Engineer” can fit both engineering and project-delivery
          title patterns, so a single opening may be counted in more than one
          pathway. The six counts therefore cannot be summed to estimate total
          solar openings.
        </p>
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Live market snapshot: {snapshotDate}. Solar Roles refreshes the underlying
        active-listing data daily.
      </p>

      <section className="mt-12 space-y-5">
        {pathways.map((pathway) => {
          const role = roleMap.get(pathway.roleKey)
          const hasMeaningfulSample =
            role && role.count >= MIN_PATHWAY_SAMPLE_FOR_RATE
          const visibleLinks = [
            ...pathway.links,
            ...(pathway.plannedGuide?.href
              ? [
                  {
                    href: pathway.plannedGuide.href,
                    label: pathway.plannedGuide.label,
                  },
                ]
              : []),
          ]

          return (
            <article
              key={pathway.name}
              className="rounded-3xl border border-gray-200 bg-white p-6 md:p-7"
            >
              <div className="grid gap-7 md:grid-cols-[1.2fr_.8fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <GitBranch className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-950">
                        {pathway.name}
                      </h2>
                      {role && (
                        <p className="text-sm text-gray-500">
                          {role.count.toLocaleString('en-US')} title-matched
                          active {role.count === 1 ? 'opening' : 'openings'}
                          {!hasMeaningfulSample && role.count > 0
                            ? ' · small sample'
                            : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {pathway.stages.map((stage, index) => (
                      <div key={stage} className="flex items-center gap-2">
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800">
                          {stage}
                        </span>
                        {index < pathway.stages.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-sm leading-6 text-gray-600">
                    {pathway.note}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
                    Related data and guidance
                  </p>

                  <div className="mt-4 space-y-3">
                    {visibleLinks.map(({ href, label }) => (
                      <Link
                        key={`${pathway.name}-${href}-${label}`}
                        href={href}
                        className="flex items-center justify-between gap-4 text-sm font-medium text-gray-900 hover:text-blue-700"
                      >
                        <span>{label}</span>
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                    ))}
                  </div>

                  {pathway.plannedGuide && !pathway.plannedGuide.href && (
                    <p className="mt-4 border-t border-gray-200 pt-4 text-xs leading-5 text-gray-500">
                      Coverage note: a dedicated{' '}
                      {pathway.name === 'Project delivery'
                        ? 'project-management entry guide'
                        : 'commission-payout analysis'}
                      {' '}is not currently available. The links above provide
                      the closest published coverage.
                    </p>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="mt-14 rounded-3xl border border-blue-100 bg-blue-50 p-7">
        <h2 className="text-xl font-bold text-gray-950">
          Role-specific guidance and application steps
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
          The pathway maps provide an advising overview across occupational
          families. Detailed candidate guidance on installation,
          certifications, apprenticeships, engineering titles and sales
          classification remains in the linked Solar Roles resource library.
        </p>
        <Link
          href="/resources"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:text-blue-950"
        >
          Open the full career resources library{' '}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <ResourceFooter canonicalUrl={CANONICAL_URL} updatedAt={snapshotDate} />
    </main>
  )
}
