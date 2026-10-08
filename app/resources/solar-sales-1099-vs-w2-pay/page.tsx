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
  title: 'Solar Sales: 1099 vs W2, Which Pays More ? | Solar Roles',
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
    dateModified: '2026-10-08',
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
            The commission rate is only part of the offer
          </h2>
          <p>
            A higher commission percentage does not establish higher take-home pay. The result also depends on which deals qualify, cancellations, lead charges and the expenses the rep pays. Compare written compensation plans at the same completed-sales volume, including any guaranteed base and benefits.
          </p>
          <p>
            A signed customer contract may not produce an immediately payable commission. The plan should distinguish when commission is earned from when payment is due, whether at financing approval, installation, permission to operate or another defined milestone.
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
                  <li>Commission rate and calculation depend on the agreement</li>
                  <li>You cover taxes and expenses</li>
                  <li>No benefits, no employer match</li>
                  <li>Payment depends on eligible deals and contract milestones</li>
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
                  <li>Commission terms vary; employee status does not set the rate</li>
                  <li>Taxes withheld automatically</li>
                  <li>Often includes benefits</li>
                  <li>Check whether the plan has a cap or a recoverable draw</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <p>W-2 and 1099 describe employment-tax reporting, not universal pay plans. A W-2 sales job can be commission-based; an advertised &quot;base&quot; may instead be a draw recoverable from future commissions. The <a href="https://www.irs.gov/taxtopics/tc762" target="_blank" rel="noopener noreferrer">IRS classification guidance</a> considers control and the working relationship, not the label on the contract alone. State labor-law tests can differ.</p>

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
          <p>
            An advertised earnings range does not disclose how many new reps reached it or how long payment took. Ask for the elapsed time from a qualifying sale to actual commission payment, not just the time to the first signed deal.
          </p>
          <p>
            Cancellations can erase an unpaid commission or trigger a chargeback of money already advanced. Read the clawback window, triggers and collection method, including what happens if the customer cancels for reasons outside the rep&apos;s control or the rep leaves the company. Ask for a worked example showing the original payment and any later deduction.
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
            Calculate monthly living costs and add work expenses the company does not reimburse. Separately identify purchased leads, appointments supplied by the company, and time spent generating your own prospects. Lead-purchase charges can reduce a commission even when the prospect never becomes a completed installation.
          </p>
          <p>
            Mileage, phone service, software, travel and insurance can also reduce the value of an offer. For self-employment, the <a href="https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" target="_blank" rel="noopener noreferrer">IRS tax guidance</a> explains income tax, self-employment tax and estimated payments. Gross 1099 receipts are not the same as spendable income; the amount to reserve depends on the individual&apos;s tax situation.
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
              <p>
            An established contractor who generates business independently may accept variable compensation if the net margin and payment terms work. That judgment needs actual lead costs and cancellation experience, not only an advertised commission rate.
          </p>
            </div>
            <div>
              <h3 className="font-medium text-[#0B1A2E] mb-1">W2 tends to make sense if</h3>
              <p>
            A genuine base salary can help a new rep manage the learning period. Check benefits eligibility, reimbursement and the commission plan as well. W-2 status alone does not promise a base, and it does not impose a ceiling on commissions.
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
            <li>What amount is the commission calculated on, when is it earned and payable, and which cancellations can trigger a clawback</li>
            <li>Which lead charges and work expenses are deducted or reimbursed, and what happens to earned commissions when employment ends</li>
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
