import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Solar Roles Free Paycheck Calculator 2026 | Estimate Your Take-Home Pay by State',
  description: 'Calculate your actual take-home pay after federal taxes, state taxes, Social Security, and Medicare. All 50 states supported. Updated for 2026 tax brackets. Free, instant, no signup — built for solar industry job seekers.',
  keywords: 'paycheck calculator, solar industry salary calculator, take home pay calculator, salary after taxes, paycheck calculator by state, net pay calculator 2026, gross to net salary, solar jobs pay',
  openGraph: {
    title: 'Solar Roles Free Paycheck Calculator 2026 | Every State',
    description: 'Enter your salary, pick your state, see your real take-home pay. Federal + state taxes, Social Security, Medicare. Instant results.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Roles Free Paycheck Calculator 2026 | Instant Take-Home Pay Estimate',
    description: 'Free paycheck calculator for all 50 states. Gross to net in seconds — made for solar industry professionals.',
  },
  alternates: {
    canonical: 'https://www.solarroles.com/paycheck-calculator',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Paycheck Calculator',
  description: 'Free paycheck calculator that estimates take-home pay after federal and state taxes, Social Security, and Medicare for all 50 US states.',
  url: 'https://www.solarroles.com/paycheck-calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How accurate is this paycheck calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It gives a close estimate based on 2025/2026 federal tax brackets and state effective tax rates. It does not include local city taxes, pre-tax deductions like 401(k) or health insurance, or tax credits, so your actual pay stub may differ slightly.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does this calculator include commission or per-diem pay for solar sales and field roles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The calculator works from a fixed annual salary. Commission, bonuses, overtime, and per-diem or travel stipends are not included, since these vary too much from one employer to another.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which states have no income tax for solar workers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming do not tax wage income. A solar job in one of these states can produce noticeably higher take-home pay than the same salary elsewhere.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does a NABCEP certification affect my take-home pay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A NABCEP certification does not change how taxes are calculated, but it often leads to a higher gross salary offer. Run your certified and non-certified offers through the calculator separately to compare the real difference in take-home pay.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use this calculator to compare two solar job offers in different states?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Enter each offer with its own state and filing status, then compare the take-home pay results side by side instead of comparing the gross salaries. This is the most reliable way to see which offer actually pays more.',
      },
    },
  ],
}

export default function PaycheckCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="max-w-5xl mx-auto px-6 py-16">

        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Paycheck Calculator
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Enter your annual salary, choose your state and filing status, and see exactly how much lands in your bank account after federal income tax, state income tax, Social Security, and Medicare. Updated for 2026 tax brackets — built for solar installers, project managers, sales reps, and engineers comparing offers across the solar industry.
          </p>
        </header>

        <PaycheckCalculator />

        {/* ── SEO CONTENT ── */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How This Calculator Works</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            The salary you negotiate and the amount you actually deposit are two different numbers. A $75,000 salary does not produce $75,000 in spending power. Depending on your state, your filing status, and your pre-tax deductions, the real number is often closer to $55,000 to $60,000. If you are weighing a solar installer role in Arizona against a project management position in Massachusetts, this calculator shows you that gap before you accept an offer.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            The deductions applied here include federal income tax, calculated using 2025/2026 progressive brackets after the standard deduction. They also include state income tax using each state's effective rate, Social Security at 6.2% on earnings up to $176,100, and Medicare at 1.45% on all earnings, with an additional 0.9% on income above $200,000 for single filers or $250,000 for married couples. The standard deduction is applied automatically based on your filing status.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">What This Calculator Does Not Include</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            This tool provides an estimate, not an exact payroll calculation. It does not account for local or city income taxes, which apply in places like New York City, Philadelphia, and parts of Ohio. It also skips pre-tax deductions like 401(k) contributions or health insurance premiums, tax credits such as the Earned Income Tax Credit or Child Tax Credit, and itemized deductions that exceed the standard deduction. Field-based solar roles often come with per-diem or travel stipends, and sales roles often run on commission. None of that supplemental income is factored in here. For precise payroll figures, consult a tax professional or your employer's HR department.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Why Your State Matters More Than You Think</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Nine states impose no income tax at all: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. A $100,000 salary in Texas produces roughly $5,000 to $7,000 more in annual take-home pay than the same salary in California or New York, before accounting for differences in cost of living. This matters a lot in solar. The industry's biggest hiring markets, including California, Texas, Florida, Arizona, and New York, span both high-tax and no-tax states. When you compare solar job offers across state lines on Solar Roles, this calculator shows whether a higher nominal salary actually puts more money in your pocket or whether state taxes eat up the difference.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Typical Solar Industry Salaries</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Pay in solar varies widely by role and experience. Solar installers and field technicians typically earn between $40,000 and $65,000 a year, often with overtime during peak installation season. Solar sales consultants usually work on a base plus commission, and total pay commonly lands between $60,000 and $150,000 depending on close rates and territory. Project managers and site supervisors tend to earn $70,000 to $110,000. Design and PV systems engineers often start around $75,000 and can pass $120,000 with several years of experience. Roles that require a NABCEP certification, such as PV Installation Professional or PV Design Specialist, generally command a premium over uncertified positions, since certification signals a verified level of technical skill to employers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Using This Calculator to Compare Solar Job Offers</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            When two offers look close on paper, the state they are based in can decide which one actually pays more. Run each offer through the calculator with the correct state and filing status, then compare the take-home figures side by side rather than the gross salaries. This is especially useful for commercial solar roles that involve relocation or multi-state travel, where the same job title can carry a different effective tax rate depending on where the paycheck is issued.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is this paycheck calculator?</h3>
            <p className="text-gray-600 leading-relaxed">
              It gives a close estimate based on 2025/2026 federal tax brackets and state effective tax rates. It does not include local city taxes, pre-tax deductions like 401(k) or health insurance, or tax credits, so your actual pay stub may differ slightly.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Does this calculator include commission or per-diem pay for solar sales and field roles?</h3>
            <p className="text-gray-600 leading-relaxed">
              No. The calculator works from a fixed annual salary. Commission, bonuses, overtime, and per-diem or travel stipends are not included, since these vary too much from one employer to another.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Which states have no income tax for solar workers?</h3>
            <p className="text-gray-600 leading-relaxed">
              Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming do not tax wage income. A solar job in one of these states can produce noticeably higher take-home pay than the same salary elsewhere.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Does a NABCEP certification affect my take-home pay?</h3>
            <p className="text-gray-600 leading-relaxed">
              A NABCEP certification does not change how taxes are calculated, but it often leads to a higher gross salary offer. Run your certified and non-certified offers through the calculator separately to compare the real difference in take-home pay.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this calculator to compare two solar job offers in different states?</h3>
            <p className="text-gray-600 leading-relaxed">
              Yes. Enter each offer with its own state and filing status, then compare the take-home pay results side by side instead of comparing the gross salaries. This is the most reliable way to see which offer actually pays more.
            </p>
          </div>
        </section>

        {/* ── DISCLAIMER ── */}
        <footer className="mt-16 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            This calculator provides estimates based on 2025/2026 federal tax brackets and simplified state income tax rates. It does not constitute tax, legal, or financial advice. Actual take-home pay may differ based on local taxes, pre-tax deductions, tax credits, and other factors. Consult a qualified tax professional for precise calculations. Solar Roles is not affiliated with the IRS or any state tax authority.
          </p>
        </footer>
      </div>
    </>
  )
}