import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeDollarSign,
  BookOpenCheck,
  Building2,
  GraduationCap,
  MapPinned,
  Route,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { getWorkforceSnapshot } from './_lib/workforceData'

export const revalidate = 86400

const CANONICAL_URL = 'https://www.solarroles.com/workforce-resources'

export const metadata: Metadata = {
  title:
    'Solar Workforce Resources for Educators & Career Programs | Solar Roles',
  description:
    'Live US solar hiring data, career pathways, licensing references, entry-level job trends, salary data and free tools for educators and workforce programs.',
  alternates: {
    canonical: CANONICAL_URL,
  },
}

const resources = [
  {
    href: '/workforce-resources/solar-job-market-by-state',
    title: 'Job Market by State',
    description:
      'Compare active solar listings and explicitly entry-level openings across all 50 states.',
    tag: 'Data tool',
    icon: MapPinned,
    iconStyle: 'bg-sky-100 text-sky-700 ring-sky-200',
    cardStyle: 'bg-sky-50/40',
  },
  {
    href: '/workforce-resources/entry-level-solar-jobs',
    title: 'Entry-Level Solar Hiring',
    description:
      'Identify the states, job families and employers currently advertising opportunities to beginners.',
    tag: 'Hiring data',
    icon: GraduationCap,
    iconStyle: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    cardStyle: 'bg-emerald-50/40',
  },
  {
    href: '/workforce-resources/solar-salary-explorer',
    title: 'Salary Explorer',
    description:
      'Compare current listed compensation by role, with median, average and salary-sample size shown together.',
    tag: 'Pay data',
    icon: BadgeDollarSign,
    iconStyle: 'bg-amber-100 text-amber-700 ring-amber-200',
    cardStyle: 'bg-amber-50/40',
  },
  {
    href: '/workforce-resources/solar-employers-hiring',
    title: 'Employers Hiring Now',
    description:
      'See which employers and recruiting organizations account for the largest number of active postings.',
    tag: 'Employer data',
    icon: Building2,
    iconStyle: 'bg-orange-100 text-orange-700 ring-orange-200',
    cardStyle: 'bg-orange-50/40',
  },
  {
    href: '/workforce-resources/solar-career-pathways',
    title: 'Career Pathways for Students',
    description:
      'Show how field, electrical, O&M, engineering, project and commercial roles connect over a solar career.',
    tag: 'Career guide',
    icon: Route,
    iconStyle: 'bg-violet-100 text-violet-700 ring-violet-200',
    cardStyle: 'bg-violet-50/35',
  },
  {
    href: '/workforce-resources/solar-apprenticeship-licensing',
    title: 'Apprenticeship & Licensing',
    description:
      'Connect state labor-market demand with apprenticeship resources and the authorities responsible for licensing.',
    tag: 'State reference',
    icon: ShieldCheck,
    iconStyle: 'bg-blue-100 text-blue-700 ring-blue-200',
    cardStyle: 'bg-blue-50/35',
  },
  {
    href: '/workforce-resources/solar-skills-certifications',
    title: 'Skills & Certifications',
    description:
      'Review the credentials, software and technical skills appearing in current solar job descriptions.',
    tag: 'Skills evidence',
    icon: Wrench,
    iconStyle: 'bg-rose-100 text-rose-700 ring-rose-200',
    cardStyle: 'bg-rose-50/35',
  },
  {
    href: '/workforce-resources/jobs-widget',
    title: 'Free Jobs Widget for Schools',
    description:
      'Add a live local solar jobs feed to a college, training-program or workforce website without maintaining a separate listings database.',
    tag: 'Free tool',
    icon: BookOpenCheck,
    iconStyle: 'bg-lime-100 text-lime-700 ring-lime-200',
    cardStyle: 'bg-lime-50/35',
  },
]

export default async function WorkforceResourcesPage() {
  const data = await getWorkforceSnapshot()

  const topState = data.topStates[0]

  const dataAsOf = data.dataAsOf
    ? data.dataAsOf.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'Unavailable'

  const widgetState = topState?.code ?? 'CA'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Solar Workforce Resources for Educators & Career Programs',
    description:
      'Live US solar hiring data and workforce tools for educators, training providers and career programs.',
    url: CANONICAL_URL,
    dateModified: data.dataAsOf?.toISOString(),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-[#FBFAF6] text-[#46515C]">
        {/* Hero */}
        <section className="border-b border-[#E8E3D8] border-t-4 border-[#E8B84A] bg-[#FFFDF8]">
          <div className="mx-auto max-w-7xl px-6 py-14 md:py-20 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-start lg:gap-20">
              <header>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B5672C]">
                  Solar Roles · Workforce Resources
                </p>

                <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.025em] text-[#303A43] sm:text-5xl md:text-[3.6rem]">
                  Current solar hiring data for the people preparing the
                  workforce.
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5E6973]">
                  A public resource center for community colleges, workforce
                  boards, apprenticeship programs and career counselors.
                  Compare hiring demand, explain career pathways and connect
                  students with the requirements employers are publishing now.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/workforce-resources/solar-job-market-by-state"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#DCAA35] bg-[#F2CA62] px-5 py-3 text-sm font-semibold text-[#55451E] transition hover:bg-[#EFC04A]"
                  >
                    Explore the current market
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/data#methodology"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#D8D4C9] bg-white px-5 py-3 text-sm font-semibold text-[#56616B] transition hover:border-[#C8A64D] hover:bg-[#FFFCF2]"
                  >
                    Review the methodology
                  </Link>
                </div>

                <p className="mt-5 text-sm leading-6 text-[#7A827F]">
                  Based on active indexed job postings. Market signals should
                  not be interpreted as estimates of total employment.
                </p>
              </header>

              {/* Snapshot */}
              <aside
                className="rounded-2xl border border-[#E2DED3] bg-white p-6 shadow-[0_12px_35px_rgba(80,70,45,0.05)] md:p-8"
                aria-label="Current solar workforce snapshot"
              >
                <div className="flex items-start justify-between gap-5 border-b border-[#ECE8DE] pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B5672C]">
                      Current snapshot
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#69737B]">
                      Active US solar job postings currently indexed by Solar
                      Roles.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-[#F5F2E9] px-3 py-1 text-[11px] font-semibold text-[#697068]">
                    Live data
                  </span>
                </div>

                <dl className="mt-2 grid grid-cols-2">
                  <div className="border-b border-r border-[#ECE8DE] py-6 pr-5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#818882]">
                      Active listings
                    </dt>

                    <dd className="mt-2 font-serif text-3xl font-semibold text-[#36414A]">
                      {data.totalJobs.toLocaleString('en-US')}
                    </dd>
                  </div>

                  <div className="border-b border-[#ECE8DE] py-6 pl-5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#818882]">
                      Employers
                    </dt>

                    <dd className="mt-2 font-serif text-3xl font-semibold text-[#36414A]">
                      {data.employerCount.toLocaleString('en-US')}
                    </dd>
                  </div>

                  <div className="border-r border-[#ECE8DE] py-6 pr-5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#818882]">
                      Entry-level
                    </dt>

                    <dd className="mt-2 font-serif text-3xl font-semibold text-[#36414A]">
                      {data.entryLevelCount.toLocaleString('en-US')}
                    </dd>
                  </div>

                  <div className="py-6 pl-5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#818882]">
                      States
                    </dt>

                    <dd className="mt-2 font-serif text-3xl font-semibold text-[#36414A]">
                      {data.statesCovered}
                    </dd>
                  </div>
                </dl>

                <div className="border-t border-[#ECE8DE] pt-5">
                  <p className="text-xs leading-5 text-[#78817D]">
                    Data as of{' '}
                    <time
                      dateTime={data.dataAsOf?.toISOString()}
                      className="font-semibold text-[#56615F]"
                    >
                      {dataAsOf}
                    </time>
                    . Refreshed daily.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Resource library */}
        <section
          className="mx-auto max-w-7xl px-6 py-12 md:py-16"
          aria-labelledby="resources-heading"
        >
          <div className="border-b border-[#E2DED4] pb-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF0BF] text-[#B56C23]">
                    <BookOpenCheck className="h-5 w-5" />
                  </span>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B5672C]">
                    Workforce resource library
                  </p>
                </div>

                <h2
                  id="resources-heading"
                  className="mt-4 font-serif text-2xl font-semibold tracking-[-0.015em] text-[#3A454E] md:text-3xl"
                >
                  Find the resource for your workforce question.
                </h2>
              </div>

              <p className="max-w-xl text-sm leading-6 text-[#6F797F] md:text-right">
                Eight public resources covering hiring demand, pay, career
                pathways, licensing, skills and live opportunities.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {resources.map((resource) => {
              const Icon = resource.icon

              return (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className={`group flex min-h-[218px] flex-col rounded-2xl border border-[#E1DDD3] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D8C58B] hover:shadow-[0_12px_30px_rgba(72,65,45,0.07)] ${resource.cardStyle}`}
                >
                  <div className="flex items-start justify-between gap-5">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${resource.iconStyle}`}
                    >
                      <Icon className="h-7 w-7" strokeWidth={1.8} />
                    </div>

                    <span className="rounded-full border border-white/80 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#747C78] shadow-[0_1px_2px_rgba(60,55,40,0.03)]">
                      {resource.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 font-serif text-[1.35rem] font-semibold leading-snug text-[#3B464E]">
                    {resource.title}
                  </h3>

                  <p className="mt-2.5 flex-1 text-sm leading-6 text-[#707A80]">
                    {resource.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
                    <span className="text-sm font-semibold text-[#A96128]">
                      Open resource
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#B66A25] shadow-[0_1px_3px_rgba(60,55,40,0.05)] transition-transform group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Jobs widget */}
        <section className="mx-auto max-w-7xl px-6 pb-16 md:pb-20">
          <div
            className="overflow-hidden rounded-2xl border border-[#E5D7A5] bg-[#FFF8DF]"
            aria-labelledby="widget-heading"
          >
            <div className="grid lg:grid-cols-[.82fr_1.18fr]">
              <div className="p-7 md:p-10 lg:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#A66A27]">
                  Free tool for educators
                </p>

                <h2
                  id="widget-heading"
                  className="mt-4 max-w-lg font-serif text-3xl font-semibold leading-tight text-[#3D4748] md:text-4xl"
                >
                  Put current local solar openings on your program&apos;s
                  website.
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-[#66716F]">
                  The Solar Roles widget automatically updates as openings
                  enter and leave the database. Schools and workforce programs
                  can publish a local feed without maintaining a separate jobs
                  list.
                </p>

                <p className="mt-4 text-sm leading-6 text-[#7A827C]">
                  No account or subscription is required for the standard
                  embed.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/workforce-resources/jobs-widget"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#D6A93A] bg-[#F0C85E] px-5 py-3 text-sm font-semibold text-[#56461F] transition hover:bg-[#EABC49]"
                  >
                    Configure the widget
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center rounded-lg border border-[#DED5B9] bg-white/70 px-5 py-3 text-sm font-semibold text-[#67706D] transition hover:bg-white"
                  >
                    Request a custom feed
                  </Link>
                </div>
              </div>

              <div className="border-t border-[#E6D9AF] bg-[#FFFEFA] p-4 sm:p-6 lg:border-l lg:border-t-0">
                <div className="overflow-hidden rounded-xl border border-[#E2DED3] bg-white shadow-[0_8px_24px_rgba(75,65,40,0.05)]">
                  <div className="flex items-center justify-between gap-4 border-b border-[#ECE8DE] px-4 py-3">
                    <span className="text-xs font-semibold text-[#667078]">
                      Entry-level jobs in {topState?.name ?? 'California'}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                      Live preview
                    </span>
                  </div>

                  <iframe
                    src={`/embed/solar-jobs?state=${widgetState}&limit=4&entry=1`}
                    title={`Preview of entry-level solar jobs in ${
                      topState?.name ?? 'California'
                    }`}
                    className="h-[510px] w-full bg-white"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust and methodology */}
        <section className="border-t border-[#E5E0D5] bg-[#F4F2EB]">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
            <div className="rounded-2xl border border-[#E0DCD1] bg-white p-7 md:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#B5672C]">
                Use and attribution
              </p>

              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#3A454E]">
                Citation and reuse information
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-[#707980]">
                Educators, researchers and workforce organizations may cite
                this hub or any individual resource. Citations to current
                figures should include the visible snapshot date and a link to
                the page containing the methodology.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/data#methodology"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DCD7CB] px-4 py-3 text-sm font-semibold text-[#626D73] transition hover:border-[#D5AD4C] hover:bg-[#FFFDF6]"
                >
                  Review the methodology
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DCD7CB] px-4 py-3 text-sm font-semibold text-[#626D73] transition hover:border-[#D5AD4C] hover:bg-[#FFFDF6]"
                >
                  Discuss a workforce partnership
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-[#E0DCD1] bg-[#FFFEFA] p-7 md:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#A9783D]">
                Methodology at a glance
              </p>

              <dl className="mt-6 divide-y divide-[#E8E4DB] text-sm">
                <div className="grid grid-cols-[112px_1fr] gap-4 py-4 first:pt-0">
                  <dt className="font-semibold text-[#505C62]">
                    Population
                  </dt>

                  <dd className="leading-6 text-[#737C82]">
                    Active indexed job postings
                  </dd>
                </div>

                <div className="grid grid-cols-[112px_1fr] gap-4 py-4">
                  <dt className="font-semibold text-[#505C62]">
                    Coverage
                  </dt>

                  <dd className="leading-6 text-[#737C82]">
                    {data.statesCovered} states represented in this snapshot
                  </dd>
                </div>

                <div className="grid grid-cols-[112px_1fr] gap-4 py-4">
                  <dt className="font-semibold text-[#505C62]">
                    Updated
                  </dt>

                  <dd className="leading-6 text-[#737C82]">
                    {dataAsOf}
                  </dd>
                </div>

                <div className="grid grid-cols-[112px_1fr] gap-4 py-4 last:pb-0">
                  <dt className="font-semibold text-[#505C62]">
                    Boundary
                  </dt>

                  <dd className="leading-6 text-[#737C82]">
                    One posting may represent more than one planned hire
                  </dd>
                </div>
              </dl>

              <Link
                href="/data#methodology"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#B5672C]"
              >
                Full data notes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </section>
      </main>
    </>
  )
}
