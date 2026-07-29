import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'What Does a Solar Installer Do? (Job Description & Daily Tasks)',
  description:
    'A solar installer mounts racking, sets panels, and wires the system on the roof or ground. Here\u2019s what the job actually looks like day to day in 2026.',
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
      'A solar installer mounts racking, sets panels, and wires the system on the roof or ground. Here\u2019s what the job actually looks like day to day in 2026.',
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
      'A solar installer mounts racking, sets panels, and wires the system. Here\u2019s what the job looks like day to day in 2026.',
  },
}

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
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="mx-auto max-w-2xl px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What Does a Solar Installer Actually Do?
          </h1>
          <p className="mt-3 text-sm text-gray-500">Updated July 2026</p>
        </header>

        <div className="prose prose-neutral max-w-none">
          <p>
            Short answer: a solar installer puts panels on a roof or ground
            mount, connects them to racking and wiring, and gets the system
            ready for an electrician or inspector to sign off. It&rsquo;s a
            hands-on trade, not a desk job.
          </p>

          <h2>The core tasks</h2>
          <p>
            Most of the work falls into three stages. First, mounting the
            racking that holds the panels in place, whether that&rsquo;s
            rails bolted to a roof or a ground-mounted frame. Second, setting
            and securing the panels themselves. Third, running the wiring
            between panels, combiner boxes, and the inverter, then testing
            connections before the system goes live. On some crews you&rsquo;ll
            also handle conduit runs, grounding, and labeling for the
            inspector.
          </p>

          <h2>A typical day</h2>
          <p>
            The day usually starts early, loading the truck with panels,
            racking, and tools before driving to the job site. Once
            there, the crew stages materials, sets up fall protection if
            it&rsquo;s a roof job, and works through the install in a set
            order: layout, racking, panels, wiring. A lead installer or
            foreman assigns tasks and checks the work as it goes. On
            residential jobs a crew of two or three can often finish a
            system in a day; commercial and utility-scale projects run over
            weeks or months with larger, rotating crews.
          </p>

          <h2>Tools and skills you use</h2>
          <ul>
            <li>
              <strong>Hand and power tools:</strong> drills, impact drivers,
              wrenches, and torque tools for racking and hardware
            </li>
            <li>
              <strong>Electrical basics:</strong> reading wiring diagrams,
              using a multimeter, terminating connectors correctly
            </li>
            <li>
              <strong>Roof and ladder safety:</strong> harnesses, anchor
              points, and comfort working at height in all weather
            </li>
            <li>
              <strong>Physical stamina:</strong> lifting and carrying panels
              and equipment for a full shift
            </li>
            <li>
              <strong>Teamwork:</strong> following a crew lead&rsquo;s
              instructions and coordinating with teammates on timing
            </li>
          </ul>

          <h2>Residential, commercial, and utility-scale work</h2>
          <p>
            Residential installers work on rooftops, usually in small crews,
            moving between multiple homes in a week. Commercial installers
            handle larger rooftop or carport systems on warehouses, schools,
            and office buildings, often over several days per site.
            Utility-scale installers work on ground-mount solar farms,
            sometimes for months at a stretch, with more standardized racking
            and higher daily panel counts. The core skills carry over between
            all three, but the pace, crew size, and travel expectations
            differ quite a bit.
          </p>

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

          <h2>Where to actually find these jobs</h2>
          <p>
            Generic job boards mix installer postings in with sales and
            consultant roles that have nothing to do with hands-on work. If
            you want tools-in-hand installer jobs specifically, a board built
            just for that role, like{' '}
            <a href="https://www.solarroles.com">Solar Roles</a>, cuts out
            the noise and shows you only PV installer, electrician, and O&amp;M
            openings.
          </p>

          <p>
            It&rsquo;s physical work with a clear routine: stage, mount, wire,
            test. If that sounds like a fit, the skills above are the ones
            employers actually screen for.
          </p>
        </div>
      </article>
    </>
  )
}