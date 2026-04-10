import { Metadata } from 'next'
import PaycheckCalculator from '@/components/PaycheckCalculator'

export const metadata: Metadata = {
  title: 'New York Paycheck Calculator 2026 | State + NYC Tax = See What You Keep',
  description: 'Calculate your take-home pay in New York. If you live in NYC, a city tax stacks on top of the state rate. Enter your salary and see the real number.',
  keywords: 'new york paycheck calculator, take home pay new york, salary after taxes NY, NYC paycheck calculator 2026, new york city income tax',
  alternates: { canonical: 'https://www.oh-my-job.com/paycheck-calculator/new-york' },
}

export default function NewYorkPaycheckCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">New York Paycheck Calculator</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          New York has one of the heaviest tax stacks in the country, especially if you live within the five boroughs. Enter your salary to see the damage.
        </p>
      </header>

      <PaycheckCalculator defaultState="NY" />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Two Different Tax Realities Under One State Name</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          A $100,000 salary in Buffalo and a $100,000 salary in Brooklyn are taxed at meaningfully different rates even though both are "New York." The state income tax applies everywhere and tops out at 10.9% for high earners. But residents of New York City face an additional city income tax that ranges from 3.078% to 3.876% depending on income. That city layer does not exist in Albany, Rochester, Syracuse, or anywhere else in the state. The result is that a New Yorker living in Manhattan can face a combined state-plus-city marginal rate above 14% before federal taxes even enter the picture. If you are evaluating a job offer in the city, the question is not "what is New York's tax rate" but "what is NYC's tax rate," and the answer is substantially higher than the state number alone.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-12">The Jersey Commute Math</h2>
        <p className="text-gray-600 leading-relaxed">
          A significant number of people who work in Manhattan live in New Jersey specifically to avoid the NYC income tax. New Jersey's state rate is not low (topping out at 10.75%), but it does not stack a city tax on top, and property taxes, while high in Jersey, buy substantially more square footage than anything in the five boroughs. The trade-off is a commute that adds 45 to 90 minutes each way and a monthly transit pass or tunnel toll. Whether that exchange is worth it depends entirely on your salary level: at $80,000 the city tax costs you roughly $2,700 per year, which barely justifies the commute. At $200,000 the gap widens to $7,000+, which starts to fund a meaningful lifestyle upgrade across the Hudson.
        </p>
      </section>

      <footer className="mt-16 border-t border-gray-200 pt-8">
        <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
          Estimates based on 2025/2026 federal brackets and New York State income tax rates. Does not include New York City income tax, Yonkers surcharge, or pre-tax deductions. NYC residents should add 3% to 3.9% to the state figure. Consult a tax professional for exact figures.
        </p>
      </footer>
    </div>
  )
}