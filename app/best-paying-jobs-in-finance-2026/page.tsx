import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

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
    paragraph: 'The entry ticket to the highest-paying corner of finance is also one of the most punishing jobs a 22-year-old can take. First-year analysts at bulge bracket firms pull in $110K to $120K in base salary, but the year-end bonus pushes total compensation to $170K to $200K, a package that no other entry-level profession in any industry can match. The work is financial modeling, pitch decks, due diligence, and client presentations, executed on a schedule that regularly extends past midnight. The real value of the role is not the paycheck itself but what it unlocks: two years in IB is the prerequisite for virtually every high-paying exit in finance, from private equity to hedge funds to corporate development. People who survive the analyst years and make it to VP or MD level earn $500K to $2M+. People who leave after two years carry a credential that opens doors for the rest of their career.',
  },
  {
    rank: 2,
    title: 'Private Equity Associate',
    searchTerm: 'private equity',
    salary: '$250K to $400K total comp',
    growth: '10%',
    paragraph: 'Private equity is where the money in finance ultimately concentrates, and the associate role is the first rung on that ladder. Total compensation at mega-funds (Blackstone, KKR, Apollo) ranges from $300K to $400K when you add base, bonus, and co-invest. At middle-market firms, $200K to $300K is standard. The work shifts from the execution grind of banking toward investment judgment: you evaluate whether to buy a company, model how to improve its operations, and monitor portfolio companies post-acquisition. The catch that compensation articles rarely mention is how narrow the funnel is. PE firms hire almost exclusively from top investment banking programs, and the recruiting cycle starts absurdly early, often while analysts are still in their first year on the job. The carry (profit sharing from fund returns) is where the life-changing money lives, but it only kicks in at the principal and partner level after 6 to 10 years.',
  },
  {
    rank: 3,
    title: 'Quantitative Analyst',
    searchTerm: 'quantitative analyst',
    salary: '$150K to $350K+',
    growth: '9%',
    paragraph: 'Quant roles sit at the intersection where pure mathematics meets real money, and the compensation reflects that scarcity. Firms like Citadel, Two Sigma, Jane Street, and DE Shaw pay first-year quants $200K to $300K in total comp, rivaling or exceeding what investment banks offer their MDs. The work involves building statistical models that price derivatives, identify arbitrage, manage portfolio risk, or execute trades at microsecond speed. A PhD in mathematics, physics, or computer science is the typical entry credential, though some firms hire exceptional candidates with a master/s degree and a track record of competitive programming or published research. The career is intellectually demanding in a way that no other finance role matches, but it is also unusually meritocratic: your models either make money or they do not, and that clarity is what attracts people who find the politics of traditional finance exhausting.',
  },
  {
    rank: 4,
    title: 'Financial Analyst',
    searchTerm: 'financial analyst',
    salary: '$65K to $120K',
    growth: '9%',
    paragraph: 'This is the broadest entry point into finance and the one that the largest number of people will actually land. Financial analysts work inside corporations, banks, insurance companies, and government agencies, building budgets, forecasting revenue, evaluating capital expenditures, and translating spreadsheets into decisions that executives act on. Starting salaries range from $60K to $75K at most companies, but the ceiling depends entirely on the path you choose from here. An analyst at a Fortune 500 company who moves into FP&A management can reach $150K to $200K. One who pivots into investment banking or PE will accelerate faster. The CFA charter, which takes most people 2 to 4 years to complete across three exams, remains the single most cost-effective credential for signaling seriousness to finance employers. Unlike an MBA, it costs under $5,000 total and does not require you to leave your job.',
  },
  {
    rank: 5,
    title: 'Actuary',
    searchTerm: 'actuary',
    salary: '$80K to $160K',
    growth: '23%',
    paragraph: 'Actuaries are the people who put a price on uncertainty, and the insurance, pension, and healthcare industries cannot function without them. The profession flies under the radar compared to banking or PE, but the economics are quietly excellent: median pay exceeds $120K, the work-life balance is among the best in finance, and the 23% projected growth rate is the fastest of any role on this list. The barrier to entry is not a degree requirement but an exam sequence that takes most people 5 to 7 years to complete while working full-time. Each exam you pass triggers an automatic raise (typically 10% to 15%), which means your salary climbs in predictable, contractual steps rather than depending on a subjective bonus cycle. Employers pay for your study materials and give you hundreds of hours of paid study time per year. If you have quantitative ability but want none of the lifestyle sacrifices that banking demands, this is the finance career nobody is marketing to you.',
  },
  {
    rank: 6,
    title: 'Financial Advisor',
    searchTerm: 'financial advisor',
    salary: '$60K to $200K+',
    growth: '13%',
    paragraph: 'Financial advising is the only role on this list where your income is uncapped from day one and where you can build a business that generates revenue while you sleep. Advisors managing $50M to $100M in client assets at an independent RIA typically earn $200K to $400K, and those managing $200M+ enter a tier where the practice itself becomes a sellable asset worth seven figures. The early years are difficult because you are essentially building a book of business from nothing, and the attrition rate in the first three years is brutal. But the people who survive the ramp-up period end up with a recurring-revenue practice, control over their own schedule, and a direct relationship with every client. The shift toward fee-only fiduciary advising has also cleaned up the profession/s reputation: clients increasingly seek advisors who charge a transparent percentage of assets rather than earning commissions on product sales, and that trend favors independents over wirehouse brokers.',
  },
]

async function fetchJobData(searchTerm: string) {
  const [{ count }, data] = await Promise.all([
    getCachedJobCount(searchTerm, '', undefined),
    searchJobs({ what: searchTerm, where: '', results_per_page: 20, page: 1 })
      .then((d: AdzunaSearchResult) => ({ ...d, results: d.results.map(normalizeAdzuna) })),
  ])
  return { count, data }
}

export default async function BestPayingFinanceJobsPage() {
  const jobResults = await Promise.all(
    topJobs.map(job => fetchJobData(job.searchTerm))
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* ── CENTERED INTRO ── */}
        <header className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
            Best Paying Jobs in Finance in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Six finance careers ranked by total compensation, not headline base salary. Each includes the numbers people actually take home, the trade-offs those numbers come with, and live job listings you can apply to directly.
          </p>
        </header>

        {/* ── JOB SECTIONS ── */}
        {topJobs.map((job, index) => {
          const { count, data } = jobResults[index]
          return (
            <section key={job.rank} className="mb-20 scroll-mt-8">

              {/* Title Row */}
              <div className="flex items-start gap-4 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-xl text-lg flex-shrink-0">
                  {job.rank}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                    <span className="flex items-center gap-1 text-green-700 font-medium">
                      <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> {job.growth} projected growth
                    </span>
                  </div>
                </div>
              </div>

              {/* Paragraph */}
              <p className="text-gray-600 leading-relaxed mb-6">
                {job.paragraph}
              </p>

              {/* Scrollable Job Board Embed */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    {job.title} openings
                  </span>
                  {count > 0 && (
                    <span className="text-xs text-gray-500">
                      {count.toLocaleString()} positions
                    </span>
                  )}
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

        {/* ── DISCLAIMER ── */}
        <footer className="mt-10 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Oh My Job is an independent job search platform and is not affiliated with any bank, investment firm, insurance company, or employer listed on this page. Job listings are sourced from third-party APIs. Salary figures represent total compensation estimates (base + bonus + carry where applicable) drawn from publicly available data and may not reflect specific offers. Licensing, certification, and experience requirements vary by role and employer. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}