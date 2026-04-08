import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Best Paying Entry Level Jobs in 2026 | $50K to $120K Starting Salary',
  description: 'Seven entry-level careers that pay real money from day one. No years of dues paying required. Actual starting salaries, what the first year looks like, and live job listings for each role.',
  keywords: 'best paying entry level jobs 2026, highest paying entry level jobs, entry level jobs high salary, first job high pay, no experience jobs good salary, best starting salary careers',
  openGraph: {
    title: 'Best Paying Entry Level Jobs | 2026',
    description: 'Seven careers where year one compensation already beats the national median. Browse openings and apply.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Paying Entry Level Jobs 2026 | Up to $120K Starting',
    description: 'Skip the years of low pay. These seven roles offer strong compensation from the start.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/best-paying-entry-level-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Best Paying Entry Level Jobs in 2026',
  description: 'Seven highest-paying entry-level careers with live job listings for each role.',
  url: 'https://www.oh-my-job.com/best-paying-entry-level-jobs',
}

const topJobs = [
  {
    rank: 1,
    title: 'Software Developer',
    searchTerm: 'junior software developer',
    salary: '$80K to $120K',
    growth: '17%',
    paragraph: 'No other entry-level role pays this much this consistently across this many companies. The median starting salary for a new grad developer at a mid-size tech company sits around $85K, but the total compensation packages at large firms (base plus equity plus signing bonus) push first-year earnings past $150K in some cases. The reason the floor is so high is that a productive developer generates measurable revenue or cost savings from their first shipped feature, and companies price that value into the offer. The entry barrier has shifted away from where you went to school and toward what you can demonstrably build. A portfolio with two or three deployed projects, contributions to open-source code, or a strong performance in a technical interview carries more weight than the name on your diploma. The catch is that the junior market is more competitive than it was three years ago, so getting the first role requires more effort. But once you are in, the salary trajectory over the next five years is steeper than in any other entry-level profession outside of finance.',
  },
  {
    rank: 2,
    title: 'Registered Nurse',
    searchTerm: 'registered nurse entry level',
    salary: '$60K to $85K',
    growth: '6%',
    paragraph: 'Nursing is the only profession on this list where you can finish a two-year associate degree program on a Friday and have a job offer by Monday. The hiring pipeline is that direct. New grad RNs at urban hospitals start between $65K and $80K before shift differentials, and those who pick up night or weekend rotations push their first-year take-home past $85K without working overtime. What makes nursing unusual as an entry-level career is that the credential itself is the bottleneck, not the job search. Once you pass the NCLEX, you are employable in any state, in any city, immediately. The profession also has an internal escalator that few entry-level jobs can match: within two to three years you can specialize (ICU, ER, labor and delivery), and within five to seven years you can pursue an NP or CRNA track that doubles or triples your income. The floor is high and the ceiling is higher, which is a rare combination for a career you can enter before your 22nd birthday.',
  },
  {
    rank: 3,
    title: 'Financial Analyst',
    searchTerm: 'entry level financial analyst',
    salary: '$58K to $80K',
    growth: '9%',
    paragraph: 'Financial analyst is the default entry point into corporate finance, and the reason it pays better than most entry-level roles is that your output directly informs how a company allocates its money. You build budget models, forecast revenue, analyze variance between planned and actual spending, and present findings to people who make decisions based on your numbers. That proximity to capital allocation is what separates this role from other junior positions where your work is several layers removed from anything that affects the bottom line. The starting salary of $58K to $75K at most companies is respectable but not extraordinary. What makes the financial analyst path valuable is the acceleration that follows: a move into FP&A management, treasury, or corporate development within three to five years can push compensation to $120K to $180K. The CFA designation, which you can begin pursuing immediately after starting work, acts as a salary multiplier at every stage.',
  },
  {
    rank: 4,
    title: 'Sales Development Representative',
    searchTerm: 'sales development representative',
    salary: '$50K to $85K OTE',
    growth: '4%',
    paragraph: 'SDR is the entry-level role that nobody romanticizes and everybody who has done it credits as the foundation of their career. You cold call, cold email, and cold message prospects all day to book meetings for senior salespeople who then close the deals. The base salary is $45K to $55K at most SaaS companies, but on-target earnings (base plus commission) range from $65K to $85K, and top performers regularly exceed $90K in their first year. The reason this role appears on a "best paying" list despite its reputation is that it is the single fastest way to reach a six-figure sales career without any prior experience or a specific degree. Companies hire SDRs based on energy, coachability, and the ability to handle rejection, not credentials. The average tenure is 12 to 18 months before promotion to account executive, where OTE jumps to $120K to $200K. No other entry-level job offers that kind of income acceleration on that timeline.',
  },
  {
    rank: 5,
    title: 'Accountant',
    searchTerm: 'entry level accountant',
    salary: '$55K to $75K',
    growth: '6%',
    paragraph: 'Accounting does not generate the excitement that tech or sales roles do, and that is precisely why it remains one of the most reliably well-paying entry-level careers available. Every business, from a two-person startup to a Fortune 500 conglomerate, needs someone who understands debits, credits, tax obligations, and financial statements. The starting salary of $55K to $70K at most firms is competitive for a bachelor/s-level role, and the trajectory steepens quickly once you earn the CPA license, which most states require 150 credit hours to sit for. Public accounting firms (Big Four and regional) hire aggressively out of college and offer a built-in promotion ladder: staff to senior in two years, senior to manager in another two to three. Managers at mid-size firms earn $90K to $120K, and partners at public accounting firms earn $200K to $500K+. The profession is also unusually recession-proof because tax deadlines and audit requirements do not pause when the economy contracts.',
  },
  {
    rank: 6,
    title: 'IT Support Specialist',
    searchTerm: 'IT support specialist',
    salary: '$45K to $65K',
    growth: '6%',
    paragraph: 'IT support is the entry-level role that the rest of the tech industry is built on top of, and the people who treat it as a stepping stone rather than a dead end are the ones who earn the most from it. You troubleshoot hardware and software problems, manage user accounts, maintain network equipment, and keep systems running. The starting pay of $45K to $60K is modest by tech standards, but the role is accessible with just a CompTIA A+ certification (study time: 2 to 4 months, cost: under $700) and no degree. What makes this a "best paying" pick is not the starting salary but the optionality it creates. IT support exposes you to networking, cloud infrastructure, cybersecurity, and system administration, all of which are $80K to $130K career paths. The people who use their first year in support to earn a second certification (Network+, Security+, AWS Cloud Practitioner) consistently make the jump within 12 to 18 months. The entry point is low but the compounding is fast.',
  },
  {
    rank: 7,
    title: 'Marketing Coordinator',
    searchTerm: 'marketing coordinator',
    salary: '$45K to $63K',
    growth: '8%',
    paragraph: 'Marketing coordinator sits at the bottom of this list in terms of starting pay, but it earns its place because of how many high-paying career branches it feeds into. From this single entry point, you can move into content strategy ($80K to $110K), digital marketing management ($90K to $130K), product marketing ($100K to $140K), or brand management ($95K to $125K), all within three to five years depending on the company and your initiative. The day-to-day work is executing campaigns, coordinating with designers and copywriters, managing social media calendars, pulling performance analytics, and keeping project timelines on track. It is operational and unglamorous. But it teaches you how every marketing channel works at a tactical level, which is exactly the knowledge base that senior marketing roles require. Companies that hire coordinators at $50K are often willing to promote to manager at $80K within two years if you can show that your campaigns moved a number that mattered.',
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

export default async function BestPayingEntryLevelJobsPage() {
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
            Best Paying Entry Level Jobs in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Seven careers where year-one compensation already exceeds the national median, ranked not just by starting salary but by how quickly each role converts into a high-earning career. The best entry-level job is not the one that pays the most on day one. It is the one that puts you on the steepest trajectory. Each entry includes live listings.
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
            Oh My Job is an independent job search platform and is not affiliated with any employer, university, certification body, or organization listed on this page. Job listings are sourced from third-party APIs. Salary figures are estimates drawn from publicly available data and may not reflect specific offers. Entry-level definitions, degree requirements, and promotion timelines vary by employer. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}