// app/paycheck-calculator/california/page.tsx

import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'California Paycheck Calculator 2026 | See Your Real Take-Home Pay After CA Taxes',
  description: 'How much of your California salary do you actually keep? Enter your gross pay and see the net number after federal, CA state tax, SDI, and FICA. Free, instant, no signup.',
  keywords: 'california paycheck calculator, take home pay california, salary after taxes CA, california net pay calculator 2026, how much tax in california',
  alternates: {
    canonical: 'https://www.oh-my-job.com/paycheck-calculator/california',
  },
}

export default function CaliforniaPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          California Paycheck Calculator
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          California takes a bigger cut of your paycheck than almost anywhere else in the country. Use this calculator to see exactly how much reaches your bank account after federal, state, and payroll deductions.
        </p>
      </header>

      <PaycheckCalculator defaultState="CA" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The Hidden Line Item Most Calculators Miss</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Most paycheck tools model California's income tax and stop there. What they skip is SDI: State Disability Insurance. California withholds 1.1% of your gross wages (up to a cap that adjusts annually) for this program, and it comes out of your check automatically. On an $80,000 salary, that is an extra $880 per year that never shows up in the generic "California tax rate" figures you see quoted everywhere. It is not income tax, so it gets categorized differently in payroll systems, but it reduces your take-home pay just the same. When you are comparing a California offer against one in Texas or Florida, this is one of the line items that makes the gap wider than the headline state tax rate suggests.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">Why the Same Salary Feels Different in Sacramento and San Jose</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          California's income tax brackets apply uniformly across the state, but the experience of earning $120,000 in the Central Valley versus the Bay Area is not even remotely comparable. A one-bedroom apartment in San Jose averages $2,800 per month. The same unit in Sacramento runs closer to $1,500. After taxes, the San Jose version of that salary leaves you with roughly $7,200 per month in take-home pay, of which $2,800 goes to rent (39%). In Sacramento, the same net pay loses $1,500 to rent (21%). That 18-point difference in housing burden is the real number that determines whether a California salary feels comfortable or suffocating, and no tax calculator can model it for you. What this tool does give you is the post-tax figure so you can run your own rent math on top of it.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">The Franchise Tax Board Does Not Forget</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Something worth knowing if you are relocating to California or leaving: the state's tax authority (the Franchise Tax Board, or FTB) is among the most aggressive in the country when it comes to residency audits. If you move to a zero-tax state mid-year and California determines you maintained sufficient ties (a home you did not sell, a spouse who stayed, a California driver's license you did not surrender), they will tax your full-year income as if you never left. This matters for anyone evaluating a job move that involves a partial year in California. The safe assumption is that if you earn money while you are a California resident, California will tax it, and the burden of proving you left falls on you, not on the FTB.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">The Upside Nobody Quantifies</h2>
        <p className="text-gray-600 leading-relaxed">
          After reading all of that, you might wonder why anyone works in California at all. The answer is that employers in the state pay a premium specifically because they know the tax burden is high and the cost of living is steep. A software engineer who earns $160,000 in California and takes home $115,000 after taxes might look enviously at a $130,000 offer in Austin where the take-home is $105,000. But the California role is at a company that will put a brand name on their resume that the Austin company cannot match, and the next job after that one will pay $200,000 because of where they worked, not just what they did. The tax hit is real and this calculator shows it clearly. But for some careers, the California premium is not just a cost of living adjustment. It is an investment in career trajectory that compounds over time.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          This calculator provides estimates based on 2025/2026 federal and California state tax brackets. It does not account for SDI, local taxes, pre-tax deductions, or tax credits. Actual take-home pay may differ. Consult a qualified tax professional for precise calculations. Oh My Job is not affiliated with the IRS, the California Franchise Tax Board, or any government agency.
        </p>
      </footer>
    </div>
  )
}