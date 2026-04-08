import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

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
    paragraph: 'Your entire job is to take something complicated and make it understandable. That is it. No emergency calls at 2 AM, no quarterly targets that determine whether you keep your position, no managing a team of people with competing egos. You sit down, read how a system works, and write documentation that helps someone else use it without losing their mind. The work is project-based with clear deliverables, which means you know exactly what "done" looks like before you start. Most technical writing roles are fully remote, and the industry has quietly absorbed the layoff talent from tech companies, pushing salaries upward. Senior technical writers at SaaS companies and cloud platforms earn $90K to $110K, and the ones who specialize in API documentation or developer experience command even more. The skill you need is not technical expertise. It is the ability to explain things clearly, which is rarer than it should be.',
  },
  {
    rank: 2,
    title: 'Actuary',
    searchTerm: 'actuary',
    salary: '$80K to $160K',
    growth: '23%',
    paragraph: 'Actuaries consistently appear on every "low stress, high pay" list because the structural design of the career eliminates most of the things that make other jobs miserable. There are no surprise deadlines because insurance reserve calculations follow a fixed annual cycle. There is no ambiguity about how to advance because each exam you pass triggers an automatic raise that is written into your employment contract. There is no pressure to "prove your value" subjectively because your work is mathematical and verifiable. Employers give you hundreds of hours of paid study time per year and cover the cost of exam materials. The median salary exceeds $120K and the profession is growing at 23%, making it one of the only careers where high compensation, job security, and a genuine 40-hour week coexist without contradiction. The trade-off is that the exam sequence takes 5 to 7 years to complete, which filters out anyone who is not comfortable with delayed gratification.',
  },
  {
    rank: 3,
    title: 'UX Designer',
    searchTerm: 'UX designer',
    salary: '$75K to $120K',
    growth: '16%',
    paragraph: 'UX design landed on this list because the daily work consists of structured creative problem solving with no life-or-death consequences. You research how people interact with a product, sketch out better ways to organize screens and flows, test those ideas with real users, and iterate based on feedback. The output is tangible (wireframes, prototypes, design systems), the collaboration happens over Slack and Figma rather than in high-stakes boardrooms, and most roles operate on sprint cycles that give you a clear rhythm to your week. Remote and hybrid arrangements are the norm rather than the exception. The entry path does not require a degree: a strong portfolio built through a 3 to 6 month certification program (Google UX Certificate, Coursera, Designlab) is enough to land interviews. What keeps the role "easy" relative to its pay is the absence of on-call rotations, revenue quotas, or the kind of open-ended ambiguity that makes managerial roles draining.',
  },
  {
    rank: 4,
    title: 'Dental Hygienist',
    searchTerm: 'dental hygienist',
    salary: '$65K to $95K',
    growth: '7%',
    paragraph: 'The math on dental hygiene is difficult to beat for anyone who values predictability. Two years of school, a licensing exam, and you enter a career that pays $80K on average with a schedule that almost never deviates from Monday through Friday, 8 to 5. No nights. No weekends in most practices. No on-call. The reason this makes the "easy" list is not that the clinical work is mindless (it requires precision and patient management) but that the emotional and logistical complexity is remarkably low compared to every other healthcare role at a similar pay level. You perform cleanings, take radiographs, educate patients, and move on to the next appointment. There are no insurance pre-authorization battles, no 30-page compliance documents, no three-hour team meetings about workflow optimization. Temping is also lucrative: fill-in hygienists who work through staffing agencies can earn $45 to $60 per hour by picking up shifts at practices that are short-staffed.',
  },
  {
    rank: 5,
    title: 'Data Analyst',
    searchTerm: 'data analyst',
    salary: '$60K to $95K',
    growth: '23%',
    paragraph: 'Once you learn SQL, Excel at an advanced level, and one visualization tool (Tableau, Power BI, or Looker), the daily work becomes a loop of pulling data, spotting patterns, and presenting findings to people who need them to make decisions. It is puzzle solving with spreadsheets, and it carries none of the pressure that comes with roles where your output is subjective or your performance is measured by revenue. The reason data analysis feels easy to the people who are good at it is that the problems are bounded: someone gives you a question, you query a database, you find an answer, you build a chart. There is a beginning and an end. Remote work is standard, the growth rate is among the highest of any white-collar profession, and the role serves as a stepping stone to data science, product analytics, or business intelligence management if you eventually want to push your ceiling higher. A Google Data Analytics certificate or a similar program can get you interview-ready in under 6 months.',
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

export default async function BestPayingEasyJobsPage() {
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
            Best Paying Easy Jobs in the US
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            "Easy" does not mean unskilled. It means the ratio of compensation to daily stress is unusually favorable. These five careers pay well, operate on predictable schedules, and do not require you to sacrifice your evenings, your weekends, or your mental health to stay employed. Each includes live openings you can apply to directly.
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
            Oh My Job is an independent job search platform and is not affiliated with any employer, certification provider, or organization listed on this page. Job listings are sourced from third-party APIs. Salary figures are estimates drawn from publicly available data and may not reflect specific offers. Stress levels and work-life balance vary by employer and individual role. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}