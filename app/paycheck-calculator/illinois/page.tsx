import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Illinois Paycheck Calculator 2026 | Take-Home Pay After IL Flat Tax',
  description: 'Calculate your take-home pay in Illinois. Flat 4.95% state tax on every dollar. Enter your salary and see your net pay instantly. Free, no signup.',
  keywords: 'illinois paycheck calculator, take home pay illinois, salary after taxes IL, illinois net pay 2026',
  alternates: { canonical: 'https://www.oh-my-job.com/paycheck-calculator/illinois' },
}

export default function IllinoisPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Illinois Paycheck Calculator</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Illinois charges a flat 4.95% income tax. No brackets, no phase-outs, no guessing. Enter your salary to see exactly what you keep.
        </p>
      </header>

      <PaycheckCalculator defaultState="IL" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What the Flat Rate Actually Means for Your Paycheck</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Illinois is one of a handful of states that taxes every dollar of income at the same rate regardless of how much you earn. A teacher making $52,000 and a surgeon making $400,000 both pay 4.95% to Springfield. The simplicity is appealing on paper, but the practical effect is that lower earners carry a proportionally heavier burden than they would in a state with progressive brackets where the first $10,000 or $20,000 is taxed at near zero. If you are comparing an Illinois offer against one in a progressive-tax state, the flat rate might save you money at higher incomes but cost you at lower ones.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">The Chicago Factor</h2>
        <p className="text-gray-600 leading-relaxed">
          Illinois does not have a city income tax, but living in Chicago introduces costs that function the same way. Cook County's sales tax pushes the combined rate above 10% in most transactions, property taxes in the city and surrounding suburbs are among the highest in the nation, and the commuter who drives pays tolls on practically every highway. None of these show up in a paycheck calculator, but they all reduce the purchasing power of your take-home number. Downstate Illinois, by contrast, operates on a meaningfully lower cost basis while facing the same flat income tax rate, which is why the same $75,000 salary feels tight in Lincoln Park and comfortable in Springfield.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Estimates based on 2025/2026 federal brackets and the Illinois flat income tax rate. Does not include local taxes, property taxes, or pre-tax deductions. Consult a tax professional for exact figures. Oh My Job is not affiliated with any government agency.
        </p>
      </footer>
    </div>
  )
}