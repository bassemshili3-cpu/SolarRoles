import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'Maryland Paycheck Calculator 2026 | State + County Tax Makes a Difference',
  description: 'Calculate your take-home pay in Maryland. State income tax plus mandatory county tax that varies by where you live. Enter your salary and see your real net pay.',
  keywords: 'maryland paycheck calculator, take home pay maryland, salary after taxes MD, maryland net pay 2026, montgomery county tax calculator',
  alternates: { canonical: 'https://www.oh-my-job.com/paycheck-calculator/maryland' },
}

export default function MarylandPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Maryland Paycheck Calculator</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Maryland is one of the only states where your county of residence directly changes your tax bill. Enter your salary to see the state-level impact.
        </p>
      </header>

      <PaycheckCalculator defaultState="MD" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">The County Tax That Nobody Warns You About</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Maryland is unique in that every county and Baltimore City levies its own income tax on top of the state rate, and it is not optional. The county rates range from 2.25% (Worcester County) to 3.20% (Howard, Montgomery, Prince George's, and several others). That means two Maryland residents earning identical salaries can have noticeably different take-home pay depending purely on which side of a county line they rent an apartment. If you are relocating to the DC suburbs, the difference between living in Montgomery County, Maryland versus Fairfax County, Virginia is not just a state tax comparison. It is a state-plus-county comparison that most online calculators collapse into a single number.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">The DC Commuter Equation</h2>
        <p className="text-gray-600 leading-relaxed">
          A large share of Maryland's workforce commutes into Washington, DC. Maryland taxes you based on where you live, not where you work, so your DC salary is taxed at Maryland state rates plus your county rate. DC does not tax Maryland residents on wages earned in the district (reciprocity agreement). The question most people face is whether to live in Maryland, Virginia, or DC itself. Maryland's combined state-plus-county burden runs higher than Virginia's for most income levels, but Maryland housing costs in the outer suburbs (Frederick, Hagerstown) are materially lower than Northern Virginia. The paycheck calculator gives you the Maryland tax piece. The commute time and housing cost are the variables that complete the picture.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Estimates based on 2025/2026 federal brackets and Maryland state income tax rates. Does not include county income taxes, which vary from 2.25% to 3.20%. Consult a tax professional for exact figures. Oh My Job is not affiliated with any government agency.
        </p>
      </footer>
    </div>
  )
}