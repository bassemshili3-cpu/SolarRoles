import type { Metadata } from 'next'
import Link from 'next/link'
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google'

// If these fonts are already loaded in app/layout.tsx, remove this block
// and reuse your existing font variables instead — keeps this route in
// sync with /about automatically instead of loading fonts twice.
const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Bassem Shili | Founder, Solar Roles & Oh My Job',
  description:
    'Bassem Shili builds Solar Roles and Oh My Job — two U.S. job boards — end to end: product, code, SEO, and content. Bilingual EN/FR, working at the intersection of software and hiring.',
  openGraph: {
    title: 'Bassem Shili — Founder & Builder',
    description: 'Building Solar Roles and Oh My Job, end to end.',
    url: 'https://solarroles.com/about/bassem-shili',
    type: 'profile',
  },
}

/** Thin gradient arc — same signature mark used on /about, for continuity. */
function SunArc({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 140" fill="none" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 120 Q 600 -30 1200 120" stroke="url(#sr-arc-gradient-2)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="sr-arc-gradient-2" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1A2E" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#F5B819" />
          <stop offset="100%" stopColor="#0B1A2E" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const projects = [
  {
    name: 'Solar Roles',
    role: 'Founder — product, code, SEO',
    description:
      'A job board for the U.S. solar industry, aggregating listings across the trade and building the certification and career-path content the industry was missing.',
    tags: ['Next.js', 'Prisma', 'PostgreSQL', 'SEO'],
    href: 'https://solarroles.com',
  },
  {
    name: 'Oh My Job',
    role: 'Founder — product, code, SEO',
    description:
      'A U.S. job board aggregating listings from multiple ATS providers, with a direct employer-facing posting and applicant system built on top.',
    tags: ['Next.js', 'Prisma', 'PostgreSQL', 'Supabase'],
    href: 'https://oh-my-job.com',
  },
]

const capabilities = [
  {
    label: 'Product & engineering',
    detail:
      'Full-stack build and maintenance of both platforms — architecture, data pipelines, and the day-to-day fixes that keep a job board reliable at scale.',
  },
  {
    label: 'SEO & content',
    detail:
      'Search strategy, technical SEO, and long-form content built to hold up in both classic search.',
  },
  {
    label: 'Hiring',
    detail:
      'A recruitment background shapes how these platforms are built — closer to how candidates actually search, and what employers actually need to see.',
  },
]

export default function BassemShiliPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Bassem Shili',
    familyName: 'Shili',
    givenName: 'Bassem',
    birthDate: '2000-03-14',
    jobTitle: 'Founder & Full-Stack Developer',
    knowsLanguage: ['en', 'fr'],
    url: 'https://solarroles.com/about/bassem-shili',
    // Replace with real profiles when ready.
    sameAs: ['https://www.linkedin.com/in/YOUR-HANDLE', 'https://github.com/YOUR-HANDLE'],
    worksFor: [
      { '@type': 'Organization', name: 'Solar Roles', url: 'https://solarroles.com' },
      { '@type': 'Organization', name: 'Oh My Job', url: 'https://oh-my-job.com' },
    ],
  }

  return (
    <main
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen bg-[#FAF9F6]`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* Structured data only — birth date is not shown anywhere on the page. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-8">
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase text-[#0B1A2E]/50 mb-6"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Author profile
        </p>
        <div className="flex items-center gap-5 mb-6">
     <img
  src="/profile_pic.png"
  alt="Bassem Shili"
  width={82}
  height={82}
 className="rounded-2xl object-cover w-14 h-14,5 transition-opacity group-hover:opacity-80"
/>
         
          <h1
            className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight text-[#0B1A2E]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Bassem Shili
          </h1>
        </div>
        <p className="text-lg text-[#5B6472] leading-relaxed max-w-xl">
          I build Solar Roles and Oh My Job — two U.S. job boards: The technical part of the project. Bilingual, EN/FR.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6">
        <SunArc className="w-full h-16 sm:h-20" />
      </div>

      {/* Projects */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase text-[#0B1A2E]/50 mb-8"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Projects
        </p>
        <div className="space-y-10">
          {projects.map((project) => (
            <Link
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block border-t border-[#0B1A2E]/10 pt-8 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2">
                <h2
                  className="text-2xl font-medium tracking-tight text-[#0B1A2E] group-hover:text-[#0B1A2E]/70 transition-colors"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {project.name}
                </h2>
                <span
                  className="text-xs uppercase tracking-[0.15em] text-[#0B1A2E]/40"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {project.role}
                </span>
              </div>
              <p className="text-[#5B6472] leading-relaxed max-w-2xl mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#FDF3D8]/60 text-[#0B1A2E]/70"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-[#0B1A2E]/10">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p
            className="text-xs font-medium tracking-[0.2em] uppercase text-[#0B1A2E]/50 mb-8"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            How I work
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {capabilities.map((cap) => (
              <div key={cap.label}>
                <h3 className="font-medium text-[#0B1A2E] mb-2">{cap.label}</h3>
                <p className="text-sm text-[#5B6472] leading-relaxed">{cap.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-[#0B1A2E]/10">
        <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p
            className="text-xl text-[#0B1A2E] font-medium tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Get in touch
          </p>
          <div className="flex flex-wrap gap-3">
            {/* Replace with real destinations when ready. */}
            <Link
              href="mailto:bcito.pro@gmail.com"
              className="inline-flex items-center gap-2 bg-[#0B1A2E] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#0B1A2E]/90 transition-colors w-fit"
            >
              Email
            </Link>
            <Link
              href="https://www.linkedin.com/in/YOUR-HANDLE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#0B1A2E]/20 text-[#0B1A2E] text-sm font-medium px-6 py-3 rounded-full hover:bg-[#0B1A2E]/5 transition-colors w-fit"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}