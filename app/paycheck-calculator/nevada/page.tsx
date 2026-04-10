import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Nevada Paycheck Calculator 2026 | No State Income Tax, Full Take-Home Pay',
  description: 'Calculate your take-home pay in Nevada. Zero state income tax means your paycheck only loses federal tax and FICA. Enter your salary and see the number.',
  keywords: 'nevada paycheck calculator, take home pay nevada, salary after taxes NV, las vegas paycheck calculator 2026, reno take home pay',
  alternates: { canonical: 'https://www.oh-my-job.com/paycheck-calculator/nevada' },
}

export default function NevadaPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nevada Paycheck Calculator</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Nevada does not tax your wages. Your paycheck faces only federal income tax, Social Security, and Medicare. Enter your salary to see exactly what you keep.
        </p>
      </header>

      <PaycheckCalculator defaultState="NV" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Real Reason So Many Californians Moved Here</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          The zero-income-tax headline is what gets people to look at Nevada. The housing math is what gets them to sign a lease. A remote worker earning $120,000 for a California-based company who relocates from Los Angeles to Las Vegas keeps an extra $6,000 to $8,000 per year from the state tax elimination alone. Layer on a rent drop from $2,600 to $1,500 per month for a comparable apartment, and the total annual savings approach $20,000 without changing jobs, employers, or daily routines. That calculation is why Clark County's population has grown faster than almost any metro in the country since 2020, and why Nevada's job market, particularly in healthcare, logistics, and hospitality, has expanded to serve the influx.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">No Income Tax Does Not Mean Low Cost</h2>
        <p className="text-gray-600 leading-relaxed">
          Nevada funds its government through sales tax (combined rates reaching 8.375% in Clark County), gaming revenue, and the commerce tax on businesses. You will not see any of this on your pay stub, but you will notice it every time you buy furniture, eat out, or shop for anything that is not groceries. Property taxes in Nevada are capped by law, which keeps housing costs predictable for homeowners but also limits school and infrastructure funding in ways that affect quality of life. The paycheck calculator shows the clear tax advantage on earned income. The question that comes after is whether the services and amenities available in your Nevada city match what you left behind, and that answer varies enormously between the Strip corridor and a suburb in Henderson.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Estimates based on 2025/2026 federal brackets. Nevada does not impose a state income tax on wages. Does not account for sales tax, property tax, or pre-tax deductions. Consult a tax professional for exact figures. Oh My Job is not affiliated with any government agency.
        </p>
      </footer>
    </div>
  )
}