import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'

async function fetchJobData (searchTerm: string) {
  const { results, count } = await getJobs({ what: searchTerm, resultsPerPage: 20, page: 1 })
  return { count, data: { results, count } }
}

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Best Paying Jobs in Finance in 2026 | $100K to $500K+ Career Paths',
  description: 'The 6 highest-paying finance careers in 2026 ranked by total compensation, not just base salary. From first-year analyst to managing director. Real numbers, honest trade-offs, live openings.',
  keywords: 'best paying finance jobs 2026, highest paying finance careers, investment banking salary, private equity salary, finance jobs USA, financial analyst salary 2026',
  openGraph: {
    title: 'Best Paying Jobs in Finance | 2026 Salary Guide',
    description: 'Six finance careers ranked by real compensation. Browse openings and apply directly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Paying Finance Jobs 2026 | $100K to $500K+',
    description: 'Total comp breakdowns for the six most lucrative finance career paths. Live job listings included.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/best-paying-jobs-in-finance-2026',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Best Paying Jobs in Finance in 2026',
  description: 'Six highest-paying finance careers in 2026 with salary data and live job listings.',
  url: 'https://www.oh-my-job.com/best-paying-jobs-in-finance-2026',
}

const topJobs = [
  {
    rank: 1,
    title: 'Investment Banking Analyst',
    searchTerm: 'investment banking analyst',
    salary: '$170K to $250K total comp',
    growth: '7%',
    paragraph: 'The entry ticket to the highest-paying corner of finance is also one of the most demanding jobs a 22-year-old can take. First-year analysts at bulge bracket firms earn $110,000 to $120,000 in base salary. The year-end bonus pushes total compensation to $170,000 to $200,000, a package no other entry-level job in any industry matches. The work is financial modeling, pitch decks, due diligence, and client presentations, often running past midnight. The real value is not the paycheck itself but what it unlocks. Two years in IB is the prerequisite for nearly every high-paying exit in finance, from private equity to hedge funds to corporate development. Those who reach VP or MD level earn $500,000 to $2 million or more. Those who leave after two years still carry a credential that opens doors for the rest of their career.',
  },
  {
    rank: 2,
    title: 'Private Equity Associate',
    searchTerm: 'private equity',
    salary: '$250K to $400K total comp',
    growth: '10%',
    paragraph: 'Private equity is where the money in finance ultimately concentrates, and associate is the first rung on that ladder. Total compensation at mega-funds like Blackstone, KKR, and Apollo ranges from $300,000 to $400,000 once you add base, bonus, and co-invest. Middle-market firms pay $200,000 to $300,000. The work shifts from banking\'s execution grind toward investment judgment. You evaluate whether to buy a company, model how to improve its operations, and monitor portfolio companies after acquisition. The funnel is narrow. PE firms hire almost exclusively from top investment banking programs, and recruiting starts early, often while analysts are still in their first year. Carry, the profit share from fund returns, is where the largest money lives. It only kicks in at the principal and partner level, after six to ten years.',
  },
  {
    rank: 3,
    title: 'Quantitative Analyst',
    searchTerm: 'quantitative analyst',
    salary: '$150K to $350K+',
    growth: '9%',
    paragraph: 'Quant roles sit where mathematics meets real money, and the pay reflects how scarce the skill set is. Firms like Citadel, Two Sigma, Jane Street, and DE Shaw pay first-year quants $200,000 to $300,000 in total compensation, rivaling what investment banks pay their MDs. The work involves building statistical models that price derivatives, identify arbitrage, manage portfolio risk, or execute trades at microsecond speed. A PhD in mathematics, physics, or computer science is the typical entry credential. Some firms hire strong candidates with a master\'s degree and a track record in competitive programming or published research. The career is intellectually demanding in a way few other finance roles match. It is also unusually meritocratic: your models either make money or they do not, and that clarity attracts people who find traditional finance\'s politics exhausting.',
  },
  {
    rank: 4,
    title: 'Financial Analyst',
    searchTerm: 'financial analyst',
    salary: '$65K to $120K',
    growth: '9%',
    paragraph: 'This is the broadest entry point into finance, and the one where most people actually land. Financial analysts work inside corporations, banks, insurance companies, and government agencies. They build budgets, forecast revenue, evaluate capital expenditures, and turn spreadsheets into decisions executives act on. Starting salaries run $60,000 to $75,000 at most companies, but the ceiling depends on the path you choose from there. An analyst at a Fortune 500 company who moves into FP&A management can reach $150,000 to $200,000. One who pivots into investment banking or PE will move faster. The CFA charter, which takes most people two to four years across three exams, remains the most cost-effective credential for signaling seriousness to finance employers. Unlike an MBA, it costs under $5,000 total and does not require leaving your job.',
  },
  {
    rank: 5,
    title: 'Actuary',
    searchTerm: 'actuary',
    salary: '$80K to $160K',
    growth: '23%',
    paragraph: 'Actuaries price uncertainty, and the insurance, pension, and healthcare industries cannot function without them. The profession flies under the radar compared to banking or PE, but the numbers are strong: median pay exceeds $120,000, work-life balance is among the best in finance, and the 23 percent projected growth rate is the fastest on this list. The barrier to entry is not a degree requirement but an exam sequence that takes most people five to seven years to complete while working full-time. Each exam you pass triggers an automatic raise, typically 10 to 15 percent, so salary climbs in predictable, contractual steps rather than through a subjective bonus cycle. Employers pay for study materials and give you hundreds of paid study hours per year. If you have quantitative ability but want none of the lifestyle sacrifices banking demands, this is the finance career few people talk about.',
  },
  {
    rank: 6,
    title: 'Financial Advisor',
    searchTerm: 'financial advisor',
    salary: '$60K to $200K+',
    growth: '13%',
    paragraph: 'Financial advising is the only role on this list where your income is uncapped from day one and where you can build a business that earns while you sleep. Advisors managing $50 million to $100 million in client assets at an independent RIA typically earn $200,000 to $400,000. Those managing $200 million or more enter a tier where the practice itself becomes a sellable asset worth seven figures. The early years are hard, since you are building a book of business from nothing, and attrition in the first three years is steep. Advisors who survive the ramp-up end up with a recurring-revenue practice, control over their own schedule, and a direct relationship with every client. The shift toward fee-only fiduciary advising has also improved the profession\'s reputation. Clients increasingly seek advisors who charge a transparent percentage of assets rather than commissions on product sales, and that trend favors independents over wirehouse brokers.',
  },
]

export default async function BestPayingFinanceJobsPage() {
  const jobResults = await Promise.all(
    topJobs.map(job => fetchJobData(job.searchTerm))
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* ── Intro ── */}
        <header className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">2026 Ranking</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2340] mb-5 tracking-tight">
            Best Paying Jobs in Finance in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Six finance careers ranked by total compensation, not headline base salary. Each includes the numbers people actually take home, the trade-offs those numbers come with, and live job listings you can apply to directly.
          </p>
        </header>

        {/* ── Job sections ── */}
        {topJobs.map((job, index) => {
          const { data } = jobResults[index]
          return (
            <section key={job.rank} className="mb-16 scroll-mt-8">

              <div className="flex items-start gap-4 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-lg flex-shrink-0">
                  {job.rank}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-[#1a2340]">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                    <span className="flex items-center gap-1 text-teal-700 font-medium">
                      <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> {job.growth} projected growth
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {job.paragraph}
              </p>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-100">
                  <span className="text-sm font-semibold text-[#1a2340] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    {job.title} openings
                  </span>
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  <Suspense fallback={<div className="animate-pulse bg-gray-100 h-48" />}>
                    <InfiniteJobList
                      what={job.searchTerm}
                      where=""
                      salary_min={undefined}
                      initialData={data}
                    />
                  </Suspense>
                </div>
              </div>
            </section>
          )
        })}

        {/* ── Disclaimer ── */}
        <footer className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Oh My Job is an independent job search platform and is not affiliated with any bank, investment firm, insurance company, or employer listed on this page. Job listings are sourced from third-party APIs. Salary figures represent total compensation estimates (base + bonus + carry where applicable) drawn from publicly available data and may not reflect specific offers. Licensing, certification, and experience requirements vary by role and employer. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}