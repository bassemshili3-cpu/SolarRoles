import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Michigan Paycheck Calculator 2026 | Take-Home Pay After MI Flat Tax',
  description: 'Calculate your take-home pay in Michigan. Flat 4.25% state rate plus local taxes in some cities. Enter your salary and see your net pay instantly.',
  keywords: 'michigan paycheck calculator, take home pay michigan, salary after taxes MI, michigan net pay 2026, detroit paycheck calculator',
  alternates: { canonical: 'https://www.oh-my-job.com/paycheck-calculator/michigan' },
}

export default function MichiganPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Michigan Paycheck Calculator</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Michigan applies a flat 4.25% income tax statewide. Some cities add their own layer. Enter your salary to see your take-home number.
        </p>
      </header>

      <PaycheckCalculator defaultState="MI" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Simple Rate, Not-So-Simple If You Work in Detroit</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Michigan's flat rate makes the state-level calculation straightforward: multiply your taxable income by 0.0425 and you are done. Where it gets less predictable is at the city level. Detroit imposes its own income tax of 2.4% on residents and 1.2% on non-residents who work in the city. Grand Rapids, Lansing, Flint, and about two dozen other municipalities also charge local income taxes ranging from 0.5% to 2%. If your job is in one of these cities, the extra layer turns Michigan's effective rate from "reasonable" to "noticeable" fast. Ask about city taxes before you sign a lease, not after.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">The Midwest Paycheck Advantage</h2>
        <p className="text-gray-600 leading-relaxed">
          Michigan's appeal in a paycheck comparison is less about the tax rate and more about what the take-home pay buys. The median home price statewide hovers around $235,000, which is roughly what a one-bedroom condo costs in most coastal cities. A dual-income household earning $130,000 combined can own a three-bedroom house, fund retirement accounts, and still have room in the budget, a lifestyle that requires $200,000+ in most parts of the Northeast or West Coast. The calculator gives you the tax picture. The real question is what you plan to do with the net number, and Michigan makes that net number stretch further than the coasts will.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Estimates based on 2025/2026 federal brackets and the Michigan flat income tax rate. Does not include city income taxes or pre-tax deductions. Consult a tax professional for exact figures. Oh My Job is not affiliated with any government agency.
        </p>
      </footer>
    </div>
  )
}