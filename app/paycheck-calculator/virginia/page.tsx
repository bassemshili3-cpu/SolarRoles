import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Virginia Paycheck Calculator 2026 | Take-Home Pay After VA State Tax',
  description: 'Calculate your take-home pay in Virginia. Moderate state tax, no local income tax for most residents, strong federal job market. Enter your salary and see your net pay.',
  keywords: 'virginia paycheck calculator, take home pay virginia, salary after taxes VA, virginia net pay 2026, northern virginia paycheck calculator',
  alternates: { canonical: 'https://www.oh-my-job.com/paycheck-calculator/virginia' },
}

export default function VirginiaPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Virginia Paycheck Calculator</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Virginia's top rate kicks in at just $17,001 of taxable income, which means almost everyone pays the same effective rate. Enter your salary to see what you take home.
        </p>
      </header>

      <PaycheckCalculator defaultState="VA" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">A Top Rate That Hits Almost Immediately</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Virginia has four tax brackets, but the structure is functionally flat for anyone earning a normal salary. The top rate of 5.75% applies to all taxable income above $17,000, which means a first-year analyst and a senior executive pay the same marginal rate on virtually all of their earnings. The lower brackets (2%, 3%, 5%) apply to such small amounts of income that they barely move the effective rate. In practice, if you earn $60,000 or more, your Virginia effective rate will land between 5.2% and 5.5% every time. There are no surprises, no cliffs, and no planning required. You can estimate your state tax by multiplying your gross salary by 0.053 and you will be within a few hundred dollars of the real number.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">The NoVA Premium</h2>
        <p className="text-gray-600 leading-relaxed">
          Northern Virginia (Arlington, Fairfax, Loudoun, Prince William) functions as an extension of the DC economy, and salaries in the region reflect that. Federal contractors, consulting firms, and tech companies in the Dulles Corridor pay 10% to 25% above national averages for the same roles. The Virginia state tax on those inflated salaries is moderate compared to what you would pay on the Maryland or DC side of the river, which is why NoVA has become the default landing zone for high-income DC commuters. The trade-off is traffic and housing costs that have nothing to do with the rest of Virginia. A $95,000 salary in Richmond affords a genuinely different lifestyle than $95,000 in McLean, despite the identical state tax treatment.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Estimates based on 2025/2026 federal brackets and Virginia state income tax rates. Does not include pre-tax deductions or tax credits. Consult a tax professional for exact figures. Oh My Job is not affiliated with any government agency.
        </p>
      </footer>
    </div>
  )
}