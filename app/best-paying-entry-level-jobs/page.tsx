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
    paragraph: 'No other entry-level role pays this much this consistently across this many companies. The median starting salary for a new grad developer at a mid-size tech company is around $85,000. Total compensation at large firms, including equity and signing bonus, can push first-year earnings past $150,000. Pay stays high because a productive developer generates measurable revenue or cost savings from their first shipped feature, and companies price that value into the offer. The entry barrier has shifted from where you went to school to what you can demonstrably build. A portfolio with two or three deployed projects, open-source contributions, or a strong technical interview carries more weight than your diploma. The junior market is more competitive than it was three years ago, so landing the first role takes more effort. Once you are in, the salary trajectory over the next five years is steeper than almost any other entry-level path outside finance.',
  },
  {
    rank: 2,
    title: 'Registered Nurse',
    searchTerm: 'registered nurse entry level',
    salary: '$60K to $85K',
    growth: '6%',
    paragraph: 'Nursing is the only career on this list where you can finish a two-year associate degree on a Friday and have a job offer by Monday. The hiring pipeline is that direct. New grad RNs at urban hospitals start between $65,000 and $80,000 before shift differentials. Those who pick up night or weekend rotations can push first-year take-home past $85,000 without overtime. What makes nursing unusual is that the credential itself is the bottleneck, not the job search. Once you pass the NCLEX, you are employable in any state, in any city, immediately. The profession also has an internal escalator that few entry-level jobs match. Within two to three years you can specialize in ICU, ER, or labor and delivery. Within five to seven years you can pursue an NP or CRNA track that doubles or triples your income. The floor is high and the ceiling is higher, a rare combination for a career you can start before your 22nd birthday.',
  },
  {
    rank: 3,
    title: 'Financial Analyst',
    searchTerm: 'entry level financial analyst',
    salary: '$58K to $80K',
    growth: '9%',
    paragraph: 'Financial analyst is the default entry point into corporate finance, and it pays better than most entry-level roles because your output directly shapes how a company spends money. You build budget models, forecast revenue, analyze variance between planned and actual spending, and present findings to people who make decisions based on your numbers. That proximity to capital allocation sets this role apart from junior positions further removed from the bottom line. Starting salary runs $58,000 to $75,000 at most companies, solid but not extraordinary. What makes this path valuable is the acceleration that follows. A move into FP&A management, treasury, or corporate development within three to five years can push compensation to $120,000 to $180,000. The CFA designation, which you can start pursuing right after you begin work, adds a salary multiplier at every stage.',
  },
  {
    rank: 4,
    title: 'Sales Development Representative',
    searchTerm: 'sales development representative',
    salary: '$50K to $85K OTE',
    growth: '4%',
    paragraph: 'SDR is the entry-level role nobody romanticizes, and the one that most people who have done it credit as the foundation of their career. You cold call, cold email, and cold message prospects all day to book meetings for senior salespeople who close the deals. Base salary runs $45,000 to $55,000 at most SaaS companies, but on-target earnings, base plus commission, range from $65,000 to $85,000. Top performers regularly clear $90,000 in their first year. This role makes a "best paying" list despite its reputation because it is the fastest way to reach a six-figure sales career without prior experience or a specific degree. Companies hire SDRs for energy, coachability, and the ability to handle rejection, not credentials. Average tenure runs 12 to 18 months before promotion to account executive, where OTE jumps to $120,000 to $200,000. No other entry-level job offers that kind of income acceleration on that timeline.',
  },
  {
    rank: 5,
    title: 'Accountant',
    searchTerm: 'entry level accountant',
    salary: '$55K to $75K',
    growth: '6%',
    paragraph: 'Accounting does not generate the excitement of tech or sales roles, and that is exactly why it remains one of the most reliably well-paying entry-level careers available. Every business, from a two-person startup to a Fortune 500 company, needs someone who understands debits, credits, tax obligations, and financial statements. Starting salary runs $55,000 to $70,000 at most firms, competitive for a bachelor\'s-level role. The trajectory steepens once you earn the CPA license, which most states require 150 credit hours to sit for. Public accounting firms, including the Big Four and regional firms, hire aggressively out of college and offer a built-in promotion ladder: staff to senior in two years, senior to manager in another two to three. Managers at mid-size firms earn $90,000 to $120,000, and partners at public accounting firms earn $200,000 to $500,000 or more. The profession is also unusually recession-proof, since tax deadlines and audit requirements do not pause when the economy contracts.',
  },
  {
    rank: 6,
    title: 'IT Support Specialist',
    searchTerm: 'IT support specialist',
    salary: '$45K to $65K',
    growth: '6%',
    paragraph: 'IT support is the entry-level role the rest of the tech industry is built on, and the people who treat it as a stepping stone rather than a dead end earn the most from it. You troubleshoot hardware and software problems, manage user accounts, maintain network equipment, and keep systems running. Starting pay of $45,000 to $60,000 is modest by tech standards, but the role only requires a CompTIA A+ certification, which takes two to four months of study and costs under $700, with no degree needed. What makes this a "best paying" pick is not the starting salary but the optionality it creates. IT support exposes you to networking, cloud infrastructure, cybersecurity, and system administration, all of which lead to $80,000 to $130,000 career paths. People who use their first year in support to earn a second certification, like Network+, Security+, or AWS Cloud Practitioner, consistently make the jump within 12 to 18 months. The entry point is low, but the compounding is fast.',
  },
  {
    rank: 7,
    title: 'Marketing Coordinator',
    searchTerm: 'marketing coordinator',
    salary: '$45K to $63K',
    growth: '8%',
    paragraph: 'Marketing coordinator sits at the bottom of this list for starting pay, but it earns its place for how many high-paying career branches it feeds into. From this single entry point, you can move into content strategy ($80,000 to $110,000), digital marketing management ($90,000 to $130,000), product marketing ($100,000 to $140,000), or brand management ($95,000 to $125,000), often within three to five years depending on the company and your own initiative. Day-to-day work means executing campaigns, coordinating with designers and copywriters, managing social media calendars, pulling performance analytics, and keeping project timelines on track. It is operational and unglamorous. But it teaches you how every marketing channel works at a tactical level, which is exactly the knowledge senior marketing roles require. Companies that hire coordinators at $50,000 are often willing to promote to manager at $80,000 within two years if your campaigns move a number that matters.',
  },
]

export default async function BestPayingEntryLevelJobsPage() {
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
            Best Paying Entry Level Jobs in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Seven careers where year-one compensation already exceeds the national median, ranked not just by starting salary but by how quickly each role converts into a high-earning career. The best entry-level job is not the one that pays the most on day one. It is the one that puts you on the steepest trajectory. Each entry includes live listings.
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
            Oh My Job is an independent job search platform and is not affiliated with any employer, university, certification body, or organization listed on this page. Job listings are sourced from third-party APIs. Salary figures are estimates drawn from publicly available data and may not reflect specific offers. Entry-level definitions, degree requirements, and promotion timelines vary by employer. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}