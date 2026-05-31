import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Oh My Job Free Paycheck Calculator 2026 | Estimate Your Take-Home Pay by State',
  description: 'Calculate your actual take-home pay after federal taxes, state taxes, Social Security, and Medicare. All 50 states supported. Updated for 2026 tax brackets. Free, instant, no signup.',
  keywords: 'paycheck calculator, take home pay calculator, salary after taxes, paycheck calculator by state, net pay calculator 2026, gross to net salary, biweekly paycheck calculator',
  openGraph: {
    title: 'Oh My Job Free Paycheck Calculator 2026 | Every State',
    description: 'Enter your salary, pick your state, see your real take-home pay. Federal + state taxes, Social Security, Medicare. Instant results.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oh My Job Free Paycheck Calculator 2026 | Instant Take-Home Pay Estimate',
    description: 'Free paycheck calculator for all 50 states. Gross to net in seconds.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/paycheck-calculator',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Paycheck Calculator',
  description: 'Free paycheck calculator that estimates take-home pay after federal and state taxes, Social Security, and Medicare for all 50 US states.',
  url: 'https://www.oh-my-job.com/paycheck-calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

export default function PaycheckCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-6 py-16">

        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Paycheck Calculator
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Enter your annual salary, choose your state and filing status, and see exactly how much lands in your bank account after federal income tax, state income tax, Social Security, and Medicare. Updated for 2026 tax brackets.
          </p>
        </header>

        <PaycheckCalculator />

        {/* ── SEO CONTENT ── */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How This Calculator Works</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            The salary you negotiate and the amount you actually deposit are two different numbers, and the gap between them is larger than most people expect. A $75,000 salary does not produce $75,000 in spending power. Depending on your state, your filing status, and your pre-tax deductions, the real number is closer to $55,000 to $60,000. This calculator shows you that gap before you accept an offer, not after your first pay stub arrives and you wonder where a third of your money went.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            The deductions applied here include federal income tax (calculated using 2025/2026 progressive brackets after the standard deduction), state income tax (using each state's effective rate), Social Security (6.2% on earnings up to $176,100), and Medicare (1.45% on all earnings, plus an additional 0.9% on income above $200,000 for single filers or $250,000 for married couples). The standard deduction is applied automatically based on your filing status.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">What This Calculator Does Not Include</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            This tool provides an estimate, not an exact payroll calculation. It does not account for local or city income taxes (relevant in places like New York City, Philadelphia, and parts of Ohio), pre-tax deductions like 401(k) contributions or health insurance premiums, tax credits such as the Earned Income Tax Credit or Child Tax Credit, itemized deductions that exceed the standard deduction, or any supplemental income. For precise payroll figures, consult a tax professional or your employer's HR department.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Why Your State Matters More Than You Think</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Nine states impose no income tax at all: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. A $100,000 salary in Texas produces roughly $5,000 to $7,000 more in annual take-home pay than the same salary in California or New York, before accounting for differences in cost of living. When comparing job offers across state lines, the paycheck calculator reveals whether a higher nominal salary actually translates into more money in your pocket or whether state taxes consume the difference.
          </p>
        </section>

        {/* ── DISCLAIMER ── */}
        <footer className="mt-16 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            This calculator provides estimates based on 2025/2026 federal tax brackets and simplified state income tax rates. It does not constitute tax, legal, or financial advice. Actual take-home pay may differ based on local taxes, pre-tax deductions, tax credits, and other factors. Consult a qualified tax professional for precise calculations. Oh My Job is not affiliated with the IRS or any state tax authority.
          </p>
        </footer>
      </div>
    </>
  )
}