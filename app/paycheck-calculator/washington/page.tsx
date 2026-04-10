import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Washington State Paycheck Calculator 2026 | No Income Tax, But Read This',
  description: 'Calculate your take-home pay in Washington State. Zero income tax on wages, but a capital gains tax exists. Enter your salary and see what you keep. Free and instant.',
  keywords: 'washington state paycheck calculator, take home pay washington, salary after taxes WA, washington no income tax 2026, seattle paycheck calculator',
  alternates: { canonical: 'https://www.oh-my-job.com/paycheck-calculator/washington' },
}

export default function WashingtonPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Washington State Paycheck Calculator</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Washington collects zero state income tax on wages. Your paycheck only faces federal tax and FICA. Enter your salary to see the result.
        </p>
      </header>

      <PaycheckCalculator defaultState="WA" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Zero Income Tax Does Not Mean Zero State Tax</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Your paycheck is untouched by the state, and this calculator reflects that accurately. But Washington recovers the revenue through other channels that do not show up in payroll. The combined sales tax in Seattle reaches 10.25%, which means every dollar you spend on non-grocery purchases loses a dime to the state and county before you get anything in return. Property taxes are moderate statewide but elevated in King County. And since 2022, Washington imposes a 7% tax on capital gains above $270,000, so if your compensation includes stock grants or you sell investments, the "no income tax" label becomes partially misleading. For W-2 employees earning a straight salary, though, the take-home advantage over a state like California or New York is real and significant.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Seattle Pay vs. Spokane Pay</h2>
        <p className="text-gray-600 leading-relaxed">
          The absence of state income tax makes Washington attractive on paper, but the Seattle metro has its own gravity. Tech salaries in the Puget Sound area are among the highest in the country ($140K to $200K+ for mid-level engineers), and the take-home on those numbers is genuinely impressive because the state does not skim anything. The catch is that Seattle rents absorb a chunk of the advantage: a one-bedroom in Capitol Hill or Ballard runs $2,000 to $2,500. Move east to Spokane or the Tri-Cities, and the same tax advantage applies to a salary that is 30% lower but paired with rent that is 50% lower. The calculator handles the tax side. The rest depends on which Washington you are moving to.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Estimates based on 2025/2026 federal brackets. Washington State does not impose an income tax on wages. Does not account for sales tax, property tax, capital gains tax, or pre-tax deductions. Consult a tax professional for exact figures. Oh My Job is not affiliated with any government agency.
        </p>
      </footer>
    </div>
  )
}