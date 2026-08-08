import type { Metadata } from 'next'
import Link from 'next/link'
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google'

// If Space Grotesk / Inter / Plex Mono are already loaded in app/layout.tsx,
// remove this block and swap the className usages below for your existing
// font variables — no need to load the same fonts twice on one route.
const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'About | Solar Roles',
  description:
    'Solar Roles started in 2026 to make sense of one of the fastest-growing corners of the U.S. labor market. Here is why it exists, and who builds it.',
  openGraph: {
    title: 'About Solar Roles',
    description: 'Why Solar Roles exists, and who builds it.',
    url: 'https://solarroles.com/about',
    type: 'website',
  },
}

/** Thin gradient arc — the page's one signature mark. Used once, deliberately. */
function SunArc({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 140"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 120 Q 600 -30 1200 120"
        stroke="url(#sr-arc-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="sr-arc-gradient" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1A2E" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#F5B819" />
          <stop offset="100%" stopColor="#0B1A2E" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function AboutPage() {
  return (
    <main className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen bg-[#FAF9F6]`} style={{ fontFamily: 'var(--font-body)' }}>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-8">
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase text-[#0B1A2E]/50 mb-6"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          About Solar Roles
        </p>
        <h1
          className="text-[2.25rem] sm:text-5xl font-medium tracking-tight leading-[1.1] text-[#0B1A2E] mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Solar is growing faster than the systems built to hire for it.
        </h1>
        <p className="text-lg text-[#5B6472] leading-relaxed max-w-xl">
          Solar Roles exists to make sense of one of the fastest-moving corners of the U.S. labor market.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6">
        <SunArc className="w-full h-16 sm:h-20" />
      </div>

      {/* Origin */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="space-y-6 text-[#0B1A2E]/80 text-lg leading-relaxed">
          <p>
            Solar Roles started in 2026, out of a simple observation: the U.S. solar industry is expanding quickly, but the tools for understanding it haven&rsquo;t kept up.
          </p>
          <p>
            Energy demand keeps climbing, and regulation shifts by the quarter. The industry offers more career paths and certifications than most people outside it. Our goal is to help Job seekers, who are often times left to piece it together on their own.
          </p>
        </div>
      </section>

      {/* Bio */}
      <section className="border-t border-[#0B1A2E]/10">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p
            className="text-xs font-medium tracking-[0.2em] uppercase text-[#0B1A2E]/50 mb-8"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Who builds it
          </p>
          <div className="grid sm:grid-cols-[160px_1fr] gap-8 sm:gap-12 items-start">
            <Link href="/about/bassem-shili" className="flex-shrink-0 group">
            <img
             src="/profile_pic.png" alt=" Bassem SHILI, founder of Solar Roles" width={160} height={160}
                      className="w-full h-full object-contain"
                       style={{ transform: 'scale(0.85)' }} />
               </Link>     
            
   <div className="space-y-5 text-[#5B6472] text-base leading-relaxed">
              <p>
               The vision of Bassem SHILI, the founder of Solar Roles:
            </p>
              <p>
                My background spans software development, web design, and recruitment, which puts me somewhere between the technology side and the hiring side of the labor market. I use that mix to build the tools and resources on this site, meant to help candidates understand solar careers, certifications, employers, and the jobs available to them across the U.S.
              </p>
              <p>
                I like to present Solar Roles as an ongoing effort to document and make sense of a workforce that&rsquo;s changing fast. Shaped by technology, employment, and the energy transition, three things I expect to matter more in the years ahead.
              </p>
            </div>
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
            Looking for solar work?
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-[#0B1A2E] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#0B1A2E]/90 transition-colors w-fit"
          >
            Browse open roles
          </Link>
        </div>
      </section>
    </main>
  )
}