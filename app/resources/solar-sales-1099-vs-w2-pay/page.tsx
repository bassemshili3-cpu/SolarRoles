import type { Metadata } from 'next'
import Link from 'next/link'

// If Space Grotesk / Inter / IBM Plex Mono are already loaded in
// app/layout.tsx or app/resources/layout.tsx, remove this block and reuse
// the existing font variables instead of loading them a second time.
import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google'
const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Solar Sales: 1099 vs W2, Which Pays More | Solar Roles',
  description:
    'A straight comparison of 1099 commission-only and W2 base-plus-commission solar sales jobs: what each structure pays, and the risks to be aware of.',
  openGraph: {
    title: 'Solar Sales: 1099 vs W2, Which Pays More',
    description: 'Two pay structures, two different risks. Here is what each one really means.',
    url: 'https://solarroles.com/resources/solar-sales-1099-vs-w2-pay',
    type: 'article',
  },
}

function SunArc({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 140" fill="none" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 120 Q 600 -30 1200 120" stroke="url(#sr-arc-gradient-3)" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="sr-arc-gradient-3" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1A2E" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#F5B819" />
          <stop offset="100%" stopColor="#0B1A2E" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function SolarSales1099VsW2Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Solar Sales: 1099 vs W2, Which Pays More',
    author: { '@type': 'Person', name: 'Bassem Shili', url: 'https://solarroles.com/about/bassem-shili' },
    publisher: { '@type': 'Organization', name: 'Solar Roles', url: 'https://solarroles.com' },
    mainEntityOfPage: 'https://solarroles.com/resources/solar-sales-1099-vs-w2-pay',
  }

  return (
    <main
      className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen bg-[#FAF9F6]`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-8">
        <p
          className="text-xs font-medium tracking-[0.2em] uppercase text-[#0B1A2E]/50 mb-6"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Solar sales
        </p>
        <h1
          className="text-[2rem] sm:text-4xl font-medium tracking-tight leading-[1.15] text-[#0B1A2E] mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Solar sales: 1099 vs W2, which pays more ?
        </h1>
        <p className="text-lg text-[#5B6472] leading-relaxed max-w-xl">
          Two listings can advertise the same job title and land in completely different places. This resource will help you choose.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6">
        <SunArc className="w-full h-16 sm:h-20" />
      </div>

      <article className="max-w-2xl mx-auto px-6 py-16 space-y-14 text-[#0B1A2E]/80 text-lg leading-relaxed">
        {/* The short answer */}
        <section>
          <h2
            className="text-2xl font-medium tracking-tight text-[#0B1A2E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The short answer
          </h2>
          <p>
            At the same number of sales, a rep on pure 1099 commission will almost always out-earn the same rep on a W2 base-plus-commission plan. The company is not paying payroll tax, benefits, or a guaranteed base on the 1099 side, and most of that saved cost gets passed back into a higher commission rate.
          </p>
          <p className="mt-4">
          The real question is whether you can survive the months it takes to become good enough at solar sales for that higher commission rate to matter.
          </p>
        </section>

        {/* Two structures */}
        <section>
          <h2
            className="text-2xl font-medium tracking-tight text-[#0B1A2E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Two different structures
          </h2>
          <p>
            This is why one posting reads &ldquo;$100k&ndash;$200k+&rdquo; and another, for what looks like the same role, reads &ldquo;$35k&ndash;$40k base plus commission.&rdquo; They are describing two different risk arrangements, and the postings rarely say so directly. Scan a few live listings on our{' '}
            <Link href="/solar-sales-jobs" className="underline decoration-[#0B1A2E]/30 underline-offset-2 hover:decoration-[#0B1A2E] transition-colors">
              solar sales jobs
            </Link>{' '}
            page and you will spot the pattern immediately.
          </p>

          <div className="mt-8 border border-[#0B1A2E]/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-[#0B1A2E]/10">
              <div className="p-6">
                <p
                  className="text-xs font-medium tracking-[0.15em] uppercase text-[#0B1A2E]/50 mb-3"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  1099, commission only
                </p>
                <ul className="space-y-2 text-base text-[#5B6472]">
                  <li>No base pay, no floor</li>
                  <li>Higher commission per deal</li>
                  <li>You cover taxes and expenses</li>
                  <li>No benefits, no employer match</li>
                  <li>Income tracks output directly</li>
                </ul>
              </div>
              <div className="p-6">
                <p
                  className="text-xs font-medium tracking-[0.15em] uppercase text-[#0B1A2E]/50 mb-3"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  W2, base plus commission
                </p>
                <ul className="space-y-2 text-base text-[#5B6472]">
                  <li>Guaranteed base pay</li>
                  <li>Lower commission per deal</li>
                  <li>Taxes withheld automatically</li>
                  <li>Often includes benefits</li>
                  <li>Income floor, capped upside</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* The real risk */}
        <section>
          <h2
            className="text-2xl font-medium tracking-tight text-[#0B1A2E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The real risk: the ramp
          </h2>
          <p>
            Closing solar deals can be difficult the first month. Most reps need real time to learn the pitch, the objections, the permitting quirks in their territory, and their own close rate before commissions become reliable. On a pure 1099 plan, that ramp period pays close to nothing.
          </p>
          <p className="mt-4">
            The $100k&ndash;$200k+ number is real for reps who make it through the ramp. However, it says nothing about how many reps run out of savings before they get there, or how long that runway needs to be.
          </p>
          <p className="mt-4 text-[#0B1A2E] font-medium">
            Before taking a commission-only role, the real question that matters is &ldquo;how many months can I go without a paycheck while I get good at this.&rdquo;
          </p>
        </section>

        {/* Worked example */}
        <section>
          <h2
            className="text-2xl font-medium tracking-tight text-[#0B1A2E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            A simple way to think about it
          </h2>
          <p>
            Ignore the headline numbers for a moment and run your own math against two things: your monthly expenses, and how many months of them you have saved. If a 1099 offer would take three to four months before your first real commission lands, and you have less than that in savings, the higher ceiling does not help you.
          </p>
          <p className="mt-4">
            A W2 base does the opposite job. It is there to buy you the time to become good enough at the job that the commission side starts to matter.
          </p>
        </section>

        {/* Who fits where */}
        <section>
          <h2
            className="text-2xl font-medium tracking-tight text-[#0B1A2E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Which one fits you
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-[#0B1A2E] mb-1">1099 tends to make sense if</h3>
              <p className="text-base text-[#5B6472]">
                You already have several months of expenses saved & you have sold before (solar or otherwise) and have a sense of your own close rate. You would rather carry the full risk in exchange for the full upside.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-[#0B1A2E] mb-1">W2 tends to make sense if</h3>
              <p className="text-base text-[#5B6472]">
                You are new to sales or new to solar and your savings buffer is thin, or you need predictable income while you learn. The lower ceiling is the cost of a floor that keeps you in the job long enough to get good at it.
              </p>
            </div>
          </div>
        </section>

        {/* What to ask */}
        <section>
          <h2
            className="text-2xl font-medium tracking-tight text-[#0B1A2E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            What to ask before you sign
          </h2>
          <ul className="space-y-3 text-base text-[#5B6472] list-none">
            <li>What is the average time to a rep&rsquo;s first closed deal on this team</li>
            <li>What percentage of reps hired in the last year are still there after six months</li>
            <li>Is there a draw against commission, and how does it get paid back</li>
            <li>What exactly does the commission rate apply to, gross deal size or net after cancellations</li>
            <li>On W2 offers, how often does the base pay get reviewed or reduced as commissions grow</li>
          </ul>
          <p className="mt-6 text-sm text-[#5B6472]">
            Disclaimer: none of this is tax advice. Self-employment tax and quarterly estimated payments work differently on 1099 income, and it is worth a short conversation with a tax professional before you commit to a commission-only role.
          </p>
        </section>
      </article>
    </main>
  )
}