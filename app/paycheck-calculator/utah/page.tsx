import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Utah Paycheck Calculator 2026 | Flat 4.65% Tax, See Your Take-Home Pay',
  description: 'Calculate your take-home pay in Utah. Flat 4.65% state income tax with a unique credit system. Enter your salary and see your net pay instantly.',
  keywords: 'utah paycheck calculator, take home pay utah, salary after taxes UT, utah net pay 2026, salt lake city paycheck calculator',
  alternates: { canonical: 'https://www.oh-my-job.com/paycheck-calculator/utah' },
}

export default function UtahPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Utah Paycheck Calculator</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Utah charges a flat 4.65% state income tax on all earned income. No brackets, no phase-ins. Enter your salary to see what reaches your bank account.
        </p>
      </header>

      <PaycheckCalculator defaultState="UT" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Tax You See Is the Tax You Pay</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Utah's income tax system is about as predictable as they come. Every dollar of earned income is taxed at 4.65%, and there are no local or city income taxes layered on top. No bracket surprises, no county add-ons, no hidden surcharges. A $70,000 salary generates roughly $3,255 in state tax. A $140,000 salary generates $6,510. You can do the multiplication in your head and be within rounding distance of the real number. That predictability has a practical benefit when you are comparing job offers: you do not need a tax accountant to estimate your take-home in Utah, just a calculator and thirty seconds.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">The Salt Lake Tech Corridor Paycheck</h2>
        <p className="text-gray-600 leading-relaxed">
          Utah's economy has quietly become one of the most dynamic in the country, driven by a tech sector concentrated along the I-15 corridor from Provo through Salt Lake City to Ogden. Companies like Qualtrics, Pluralsight, and Domo built their headquarters here, and a growing number of Bay Area firms have opened satellite offices to tap the talent pool. Salaries in Utah tech run 15% to 25% below San Francisco equivalents, but the combination of a 4.65% state tax (versus California's 9% to 13%), housing costs that are roughly half of the Bay Area's, and a commute measured in minutes rather than hours means the effective purchasing power of a $110,000 Utah salary can match or exceed a $160,000 California salary. That math is what is driving inbound migration and reshaping the Wasatch Front job market.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Estimates based on 2025/2026 federal brackets and the Utah flat income tax rate. Does not include pre-tax deductions or tax credits. Consult a tax professional for exact figures. Oh My Job is not affiliated with any government agency.
        </p>
      </footer>
    </div>
  )
}