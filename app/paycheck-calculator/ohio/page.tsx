import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Ohio Paycheck Calculator 2026 | Take-Home Pay After OH State & City Taxes',
  description: 'Calculate your take-home pay in Ohio. State tax plus city income tax in most metros. Enter your salary and see your actual net pay. Free and instant.',
  keywords: 'ohio paycheck calculator, take home pay ohio, salary after taxes OH, ohio net pay 2026, columbus paycheck calculator',
  alternates: { canonical: 'https://www.oh-my-job.com/paycheck-calculator/ohio' },
}

export default function OhioPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ohio Paycheck Calculator</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Ohio layers a state income tax with city-level income taxes in most metro areas. Enter your salary to see what lands in your account.
        </p>
      </header>

      <PaycheckCalculator defaultState="OH" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Tax That Surprises People Who Move Here</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Ohio's state income tax rate is moderate and recently got simpler after the legislature flattened the brackets. But the part that catches newcomers off guard is the municipal income tax. Columbus charges 2.5%. Cleveland charges 2.5%. Cincinnati charges 1.8%. These are not small numbers, and they come on top of the state rate. If you work in one city and live in another, Ohio has a credit system that partially offsets the double hit, but "partially" is doing heavy lifting in that sentence. The net effect is that your actual combined income tax burden in an Ohio metro can land between 6% and 7%, which is higher than it looks when you only Google "Ohio state tax rate."
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Why Ohio Salaries Are Better Than They Look</h2>
        <p className="text-gray-600 leading-relaxed">
          The flip side of the tax picture is that Ohio's cost of living absorbs the damage. Median rent in Columbus sits around $1,200 for a one-bedroom. In Cleveland it is closer to $1,000. A household earning $85,000 in Ohio retains more discretionary income after taxes, housing, and groceries than one earning $110,000 in a coastal metro where the state tax is lower but a one-bedroom apartment costs $2,400. The paycheck calculator shows the tax piece. The housing market is what completes the comparison.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Estimates based on 2025/2026 federal brackets and Ohio state income tax rates. Does not include municipal/city income taxes, school district taxes, or pre-tax deductions. Consult a tax professional for exact figures. Oh My Job is not affiliated with any government agency.
        </p>
      </footer>
    </div>
  )
}