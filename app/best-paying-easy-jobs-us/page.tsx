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
  title: 'Best Paying Easy Jobs in the US in 2026 | High Salary, Low Burnout',
  description: 'Five well-paying careers that won\'t destroy your mental health. Predictable hours, manageable workloads, real salaries from $70K to $130K. Browse live openings for each role.',
  keywords: 'best paying easy jobs, low stress high paying jobs, easy jobs that pay well, low stress careers 2026, high salary low stress, best work life balance jobs USA',
  openGraph: {
    title: 'Best Paying Easy Jobs in the US | 2026',
    description: 'Five careers where the pay is strong and the stress is not. Browse openings and apply.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Paying Easy Jobs in the US | 2026 Edition',
    description: 'High salary does not have to mean high burnout. Five careers that prove it, with live job listings.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/best-paying-easy-jobs-us',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Best Paying Easy Jobs in the US',
  description: 'Five high-paying careers with manageable stress and strong work-life balance, with live job listings.',
  url: 'https://www.oh-my-job.com/best-paying-easy-jobs-us',
}

const topJobs = [
  {
    rank: 1,
    title: 'Technical Writer',
    searchTerm: 'technical writer',
    salary: '$65K to $100K',
    growth: '4%',
    paragraph: 'A technical writer takes something complicated and makes it understandable. There are no emergency calls at 2 AM, no quarterly targets tied to your job, and no team of competing egos to manage. You read how a system works, then write documentation that helps someone use it without getting lost. The work is project-based with clear deliverables, so you know what "done" looks like before you start. Most technical writing roles are fully remote. The field has also absorbed talent from tech layoffs, which has pushed salaries upward. Senior technical writers at SaaS companies and cloud platforms earn $90,000 to $110,000, and those who specialize in API documentation or developer experience earn more. The core skill is not technical expertise. It is the ability to explain things clearly, which is rarer than it should be.',
  },
  {
    rank: 2,
    title: 'Actuary',
    searchTerm: 'actuary',
    salary: '$80K to $160K',
    growth: '23%',
    paragraph: 'Actuaries appear on almost every low-stress, high-pay list, and the structure of the career explains why. Insurance reserve calculations follow a fixed annual cycle, so there are few surprise deadlines. Passing each exam triggers an automatic raise written into your contract, so advancement is not ambiguous. The work is mathematical and verifiable, which removes the pressure to prove your value subjectively. Employers give you hundreds of paid study hours per year and cover exam material costs. The median salary exceeds $120,000, and the field is growing at 23 percent. Few careers combine high pay, strong job security, and a real 40-hour week this consistently. The trade-off is time: the exam sequence takes five to seven years to complete, which filters out anyone uncomfortable with delayed gratification.',
  },
  {
    rank: 3,
    title: 'UX Designer',
    searchTerm: 'UX designer',
    salary: '$75K to $120K',
    growth: '16%',
    paragraph: 'UX design makes this list because the daily work is structured creative problem solving with low stakes. You research how people use a product, sketch better ways to organize screens and flows, test ideas with real users, and iterate on feedback. The output is tangible: wireframes, prototypes, design systems. Collaboration happens over Slack and Figma rather than in high-stakes meetings, and most roles run on sprint cycles that give your week a clear rhythm. Remote and hybrid setups are standard. You do not need a degree to break in. A strong portfolio built through a three to six month certification program, like the Google UX Certificate, Coursera, or Designlab, is enough to land interviews. What keeps the role manageable relative to its pay is the absence of on-call rotations, revenue quotas, or the open-ended ambiguity that makes many managerial roles draining.',
  },
  {
    rank: 4,
    title: 'Dental Hygienist',
    searchTerm: 'dental hygienist',
    salary: '$65K to $95K',
    growth: '7%',
    paragraph: 'Dental hygiene is hard to beat for anyone who values predictability. Two years of school and a licensing exam lead to a career that pays $80,000 on average, on a schedule that rarely deviates from Monday through Friday, 8 to 5. No nights. No weekends in most practices. No on-call. The clinical work itself requires precision and patient management, so it is not mindless. What lands this role on the easy list is how low the emotional and logistical complexity stays compared to other healthcare jobs at a similar pay level. You perform cleanings, take radiographs, educate patients, and move to the next appointment. There are no insurance pre-authorization battles, no lengthy compliance documents, no long meetings about workflow. Temp work pays well too: fill-in hygienists booked through staffing agencies can earn $45 to $60 an hour covering shifts at short-staffed practices.',
  },
  {
    rank: 5,
    title: 'Data Analyst',
    searchTerm: 'data analyst',
    salary: '$60K to $95K',
    growth: '23%',
    paragraph: 'Once you know SQL, advanced Excel, and one visualization tool like Tableau, Power BI, or Looker, the daily work becomes a loop: pull data, spot patterns, present findings to people who need them to make decisions. It is puzzle-solving with spreadsheets, without the pressure that comes with subjective output or revenue-based performance reviews. The work feels manageable because the problems are bounded. Someone asks a question, you query a database, you find an answer, you build a chart. There is a clear beginning and end. Remote work is standard, and the growth rate is among the highest of any white-collar profession. The role also serves as a stepping stone into data science, product analytics, or business intelligence management if you want to raise your ceiling later. A Google Data Analytics certificate or similar program can get you interview-ready in under six months.',
  },
]

export default async function BestPayingEasyJobsPage() {
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
            Best Paying Easy Jobs in the US
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            "Easy" does not mean unskilled. It means the ratio of compensation to daily stress is unusually favorable. These five careers pay well, run on predictable schedules, and do not require you to sacrifice your evenings, weekends, or mental health to stay employed. Each includes live openings you can apply to directly.
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
            Oh My Job is an independent job search platform and is not affiliated with any employer, certification provider, or organization listed on this page. Job listings are sourced from third-party APIs. Salary figures are estimates drawn from publicly available data and may not reflect specific offers. Stress levels and work-life balance vary by employer and individual role. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}