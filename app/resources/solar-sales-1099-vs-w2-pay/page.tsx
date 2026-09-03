import type { Metadata } from 'next'
import Link from 'next/link'
import { EditorialInfographic } from '@/components/EditorialInfographic'

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
          Two listings can advertise the same title and offer completely
          different deals. This guide explains how to choose between them.
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
            At the same sales volume, a rep on pure 1099 commission will
            almost always earn more than a rep on a W2 base-plus-commission
            plan. The company saves money on payroll tax, benefits and
            guaranteed pay. Much of that saving returns to the rep through a
            higher commission rate.
          </p>
          <p className="mt-4">
            The harder question is whether you can support yourself during the
            months it takes to make that higher rate matter.
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
            One posting may advertise &ldquo;$100k&ndash;$200k+.&rdquo; Another
            may offer &ldquo;$35k&ndash;$40k base plus commission&rdquo; for what
            appears to be the same role. The difference is who carries the
            financial risk, though job ads rarely say that directly. Scan a
            few live listings on our{' '}
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
                  <li>No base pay</li>
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

        <EditorialInfographic kind="sales-pay" />

        {/* The real risk */}
        <section>
          <h2
            className="text-2xl font-medium tracking-tight text-[#0B1A2E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The real risk: the ramp
          </h2>
          <p>
            Closing solar deals can be difficult in the first month. Most reps need time to learn the pitch and handle objections. They also need to understand permitting quirks in their territory and establish their own close rate. On a pure 1099 plan, that ramp period pays close to nothing.
          </p>
          <p className="mt-4">
            The $100k&ndash;$200k+ figure is attainable for reps who complete
            the ramp. It does not reveal how many new hires run out of savings
            first. Nor does it show how much financial runway they needed.
          </p>
          <p className="mt-4 text-[#0B1A2E] font-medium">
            Before accepting a commission-only role, ask: &ldquo;How many months
            can I manage without a reliable paycheck while I learn this
            job?&rdquo;
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
            Set the headline numbers aside. Calculate your monthly expenses
            and the number of months your savings can cover. A higher ceiling
            will not help if the first meaningful 1099 commission arrives
            after your savings are gone.
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
                You have several months of expenses saved and previous sales
                experience. You also have a realistic sense of your close
                rate. In return for carrying the financial risk, you keep more
                of the upside.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-[#0B1A2E] mb-1">W2 tends to make sense if</h3>
              <p className="text-base text-[#5B6472]">
                This route is usually a better fit if you are new to sales, new to solar, or short on savings. It also suits people who need predictable income while they learn. The lower ceiling is the cost of a floor that keeps you in the job long enough to get good at it.
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
            This is not tax advice. Self-employment tax and quarterly payments
            work differently for 1099 income. Speak with a tax professional
            before committing to a commission-only role.
          </p>
        </section>
      </article>
    </main>
  )
}
