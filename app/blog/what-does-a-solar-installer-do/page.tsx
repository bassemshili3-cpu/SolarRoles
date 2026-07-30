import { Metadata } from 'next';
import {
  Wrench,
  Zap,
  ShieldCheck,
  Activity,
  Users,
  Sun,
  Home,
  Building2,
  Factory,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'What Does a Solar Installer Do? (Job Description & Daily Tasks)',
  description:
    'A solar installer mounts racking, sets panels, and wires the system on the roof or ground. Here’s what the job actually looks like day to day in 2026.',
  keywords: [
    'what does a solar installer do',
    'solar installer job description',
    'solar installer duties',
    'day in the life solar installer',
    'solar installation crew roles',
    'PV installer responsibilities',
    'solar installer skills',
  ],
  alternates: {
    canonical: 'https://www.solarroles.com/blog/what-does-a-solar-installer-do',
  },
  openGraph: {
    title: 'What Does a Solar Installer Do? (Job Description & Daily Tasks)',
    description:
      'A solar installer mounts racking, sets panels, and wires the system on the roof or ground. Here’s what the job actually looks like day to day in 2026.',
    url: 'https://www.solarroles.com/blog/what-does-a-solar-installer-do',
    siteName: 'Solar Roles',
    type: 'article',
    publishedTime: '2026-07-29T00:00:00.000Z',
    modifiedTime: '2026-07-29T00:00:00.000Z',
    authors: ['Solar Roles'],
    images: [
      {
        url: 'https://www.solarroles.com/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'What does a solar installer do?',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Does a Solar Installer Do? (Job Description & Daily Tasks)',
    description:
      'A solar installer mounts racking, sets panels, and wires the system. Here’s what the job looks like day to day in 2026.',
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'What Does a Solar Installer Actually Do?',
  description:
    'The core tasks, tools, and daily routine of a solar installer, from staging materials to wiring panels on residential, commercial, and utility-scale jobs.',
  datePublished: '2026-07-29T00:00:00.000Z',
  dateModified: '2026-07-29T00:00:00.000Z',
  author: {
    '@type': 'Organization',
    name: 'Solar Roles',
    url: 'https://www.solarroles.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Solar Roles',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.solarroles.com/logo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.solarroles.com/blog/what-does-a-solar-installer-do',
  },
};

const SCHEDULE = [
  { time: '6:30 AM', task: 'Load the truck with panels, racking, and tools' },
  { time: '7:30 AM', task: 'Arrive at the job site, check in with the lead' },
  { time: '8:00 AM', task: 'Stage materials and set up fall protection' },
  { time: '8:30 AM', task: 'Work the install in order: layout, racking, panels' },
  { time: '1:00 PM', task: 'Lunch break' },
  { time: '2:00 PM', task: 'Wiring, terminations, and connection testing' },
  { time: '4:30 PM', task: 'Cleanup and walk-through with the foreman' },
];

const SKILLS = [
  {
    icon: Wrench,
    title: 'Hand and power tools',
    description:
      'Drills, impact drivers, wrenches, and torque tools for racking and hardware.',
  },
  {
    icon: Zap,
    title: 'Electrical basics',
    description:
      'Reading wiring diagrams, using a multimeter, terminating connectors correctly.',
  },
  {
    icon: ShieldCheck,
    title: 'Roof and ladder safety',
    description:
      'Harnesses, anchor points, and comfort working at height in any weather.',
  },
  {
    icon: Activity,
    title: 'Physical stamina',
    description: 'Lifting and carrying panels and equipment for a full shift.',
  },
  {
    icon: Users,
    title: 'Teamwork',
    description:
      'Following a crew lead’s instructions and coordinating with teammates on timing.',
  },
];

const WORK_TYPES = [
  {
    icon: Home,
    label: 'Residential',
    sites: 'Houses and small rooftops',
    crew: '2–3 people',
    duration: '1–2 days per home',
    panels: '10–30 panels / day',
    travel: 'Local, home every night',
  },
  {
    icon: Building2,
    label: 'Commercial',
    sites: 'Warehouses, schools, offices',
    crew: '5–15 people',
    duration: '1–4 weeks per site',
    panels: '50–200 panels / day',
    travel: 'Regional, some overnights',
  },
  {
    icon: Factory,
    label: 'Utility-scale',
    sites: 'Ground-mount solar farms',
    crew: '20+ people',
    duration: 'Months per project',
    panels: 'Hundreds+ / day',
    travel: 'Often required, per diem',
  },
];

const TOC = [
  { id: 'core-tasks', num: '01', title: 'The core tasks' },
  { id: 'typical-day', num: '02', title: 'A typical day' },
  { id: 'tools-skills', num: '03', title: 'Tools and skills' },
  { id: 'work-types', num: '04', title: 'Three types of work' },
  { id: 'who-they-work-with', num: '05', title: 'Who they work with' },
  { id: 'find-jobs', num: '06', title: 'Where to find the jobs' },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="min-h-screen bg-white">
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-amber-50 via-white to-orange-50/60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_55%)]" />
          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900 backdrop-blur">
              <Sun className="h-3.5 w-3.5" />
              Career Guide
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              What Does a Solar Installer{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Actually
              </span>{' '}
              Do?
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
              The hands-on trade that puts panels on America&rsquo;s roofs,
              warehouses, and solar farms. Here&rsquo;s what a real day looks
              like in 2026.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              <span>Updated July 2026</span>
              <span aria-hidden>·</span>
              <span>7 min read</span>
              <span aria-hidden>·</span>
              <span>By Solar Roles</span>
            </div>
          </div>
        </header>

        {/* ─── Quick answer (TL;DR) ─────────────────────────────────────── */}
        <section className="mx-auto -mt-8 max-w-3xl px-4 sm:-mt-12">
          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-lg shadow-amber-100/50 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                <Sun className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                  The short version
                </h2>
                <p className="mt-2 text-base text-gray-800 sm:text-lg">
                  A solar installer mounts racking, sets panels, and wires the
                  system on roofs or ground mounts. It&rsquo;s a hands-on trade
                  with a clear daily routine: stage, mount, wire, test.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Table of contents ────────────────────────────────────────── */}
        <nav
          aria-label="Table of contents"
          className="mx-auto max-w-3xl px-4 py-12"
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            In this guide
          </h2>
          <ol className="grid gap-2 sm:grid-cols-2">
            {TOC.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50/50"
                >
                  <span className="font-mono text-xs text-gray-400 group-hover:text-amber-600">
                    {item.num}
                  </span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {item.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ─── Section 1: Core tasks ────────────────────────────────────── */}
        <div className="prose prose-neutral prose-lg mx-auto max-w-3xl px-4 prose-headings:scroll-mt-20 prose-headings:font-bold prose-h2:mt-2 prose-h2:text-3xl prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
          <section id="core-tasks">
            <h2>The core tasks</h2>
            <p>
              Most of the work falls into three stages. First, mounting the
              racking that holds the panels in place, whether that&rsquo;s
              rails bolted to a roof or a ground-mounted frame. Second,
              setting and securing the panels themselves. Third, running the
              wiring between panels, combiner boxes, and the inverter, then
              testing connections before the system goes live. On some crews
              you&rsquo;ll also handle conduit runs, grounding, and labeling
              for the inspector.
            </p>
          </section>
        </div>

        {/* ─── Section 2: Typical day ───────────────────────────────────── */}
        <div className="prose prose-neutral prose-lg mx-auto max-w-3xl px-4 prose-headings:scroll-mt-20 prose-headings:font-bold prose-h2:mt-16 prose-h2:text-3xl prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
          <section id="typical-day">
            <h2>A typical day</h2>
            <p>
              The day usually starts early, loading the truck with panels,
              racking, and tools before driving to the job site. Once there,
              the crew stages materials, sets up fall protection if it&rsquo;s
              a roof job, and works through the install in a set order:
              layout, racking, panels, wiring. A lead installer or foreman
              assigns tasks and checks the work as it goes. On residential
              jobs a crew of two or three can often finish a system in a day;
              commercial and utility-scale projects run over weeks or months
              with larger, rotating crews.
            </p>
          </section>
        </div>

        {/* Daily schedule timeline */}
        <section className="mx-auto my-10 max-w-3xl px-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Schedule on a residential job
            </h3>
            <ol className="relative space-y-5 border-l-2 border-amber-200 pl-8">
              {SCHEDULE.map((item) => (
                <li key={item.time} className="relative">
                  <span className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 ring-4 ring-white">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
                    <span className="font-mono text-sm font-semibold text-amber-700">
                      {item.time}
                    </span>
                    <span className="text-sm text-gray-700">{item.task}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Section 3: Tools and skills ──────────────────────────────── */}
        <div className="prose prose-neutral prose-lg mx-auto max-w-3xl px-4 prose-headings:scroll-mt-20 prose-headings:font-bold prose-h2:mt-16 prose-h2:text-3xl prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
          <section id="tools-skills">
            <h2>Tools and skills you actually use</h2>
            <p>
              The skills employers screen for on day one are practical, not
              academic. Here&rsquo;s what shows up on a real job site.
            </p>
          </section>
        </div>

        <section className="mx-auto mb-12 max-w-4xl px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((skill) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.title}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-amber-300 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 transition group-hover:bg-amber-100">
                    <Icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    {skill.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {skill.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Section 4: Work types ────────────────────────────────────── */}
        <div className="prose prose-neutral prose-lg mx-auto max-w-3xl px-4 prose-headings:scroll-mt-20 prose-headings:font-bold prose-h2:mt-16 prose-h2:text-3xl prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
          <section id="work-types">
            <h2>Residential, commercial, and utility-scale</h2>
            <p>
              The core skills carry over between all three, but the pace,
              crew size, and travel expectations differ quite a bit. Here&rsquo;s
              a side-by-side.
            </p>
          </section>
        </div>

        <section className="mx-auto mb-12 max-w-4xl px-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {WORK_TYPES.map((work) => {
              const Icon = work.icon;
              return (
                <div
                  key={work.label}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-amber-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                      <Icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {work.label}
                    </h3>
                  </div>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Sites</dt>
                      <dd className="text-right font-medium text-gray-900">
                        {work.sites}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Crew size</dt>
                      <dd className="text-right font-medium text-gray-900">
                        {work.crew}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Project length</dt>
                      <dd className="text-right font-medium text-gray-900">
                        {work.duration}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Daily panels</dt>
                      <dd className="text-right font-medium text-gray-900">
                        {work.panels}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Travel</dt>
                      <dd className="text-right font-medium text-gray-900">
                        {work.travel}
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Section 5: Who they work with ────────────────────────────── */}
        <div className="prose prose-neutral prose-lg mx-auto max-w-3xl px-4 prose-headings:scroll-mt-20 prose-headings:font-bold prose-h2:mt-16 prose-h2:text-3xl prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
          <section id="who-they-work-with">
            <h2>Who they work alongside</h2>
            <p>
              Installers rarely work alone. A crew lead or foreman manages
              sequencing and quality on site. A licensed electrician usually
              handles the final connection to the grid and any work that
              requires a license. A project manager coordinates permits,
              scheduling, and inspections behind the scenes. As an installer
              gains experience, moving into the crew lead role is the most
              common next step.
            </p>
          </section>
        </div>

        {/* ─── Section 6: Where to find jobs ────────────────────────────── */}
        <div className="prose prose-neutral prose-lg mx-auto max-w-3xl px-4 pb-12 prose-headings:scroll-mt-20 prose-headings:font-bold prose-h2:mt-16 prose-h2:text-3xl prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
          <section id="find-jobs">
            <h2>Where to actually find these jobs</h2>
            <p>
              Generic job boards mix installer postings in with sales and
              consultant roles that have nothing to do with hands-on work. If
              you want tools-in-hand installer jobs specifically, a board
              built just for that role, like{' '}
              <a href="https://www.solarroles.com">Solar Roles</a>, cuts out
              the noise and shows you only PV installer, electrician, and
              O&amp;M openings.
            </p>
            <p className="!mt-12 !text-base !text-gray-600">
              <em>
                It&rsquo;s physical work with a clear routine: stage, mount,
                wire, test. If that sounds like a fit, the skills above are
                the ones employers actually screen for.
              </em>
            </p>
          </section>
        </div>

        {/* ─── CTA card ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-20">
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-8 text-white shadow-xl sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.15),transparent_60%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                <Sun className="h-3.5 w-3.5" />
                Solar Roles
              </div>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Looking for installer jobs?
              </h2>
              <p className="mt-2 max-w-xl text-gray-300">
                Skip the sales and consultant noise. Solar Roles only shows
                hands-on PV installer, electrician, and O&amp;M openings.
              </p>
              <a
                href="https://www.solarroles.com"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-amber-300"
              >
                Browse open roles
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
