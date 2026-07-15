import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react'
// import { getLandingPageJobs } from '@/lib/landing-jobs' // ⚠️ à activer une fois la signature confirmée
import { getJobs } from '@/lib/getJobs'

async function fetchJobData (searchTerm: string) {
  const { results, count } = await getJobs({ what: searchTerm, resultsPerPage: 20, page: 1 })
  return { count, data: { results, count } }
}

export const revalidate = 3600

export const metadata: Metadata = {
  title: '7 Best Paying Blue Collar Jobs in 2026 | $60K to $150K Without a Desk',
  description: 'Seven blue collar careers paying $60K to $150K+ in 2026. No cubicle, no college debt, real demand. Apprenticeship paths, salary breakdowns, and live job listings for every role.',
  keywords: 'best paying blue collar jobs, highest paying trades 2026, blue collar jobs six figures, skilled trades salary, trade jobs no degree, best trade careers USA',
  openGraph: {
    title: '7 Best Paying Blue Collar Jobs | 2026',
    description: 'Six-figure trades. No degree required. Browse live openings for the seven highest-paying blue collar careers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Paying Blue Collar Jobs 2026 | Up to $150K+',
    description: 'Seven trades where the pay outpaces most office jobs. Live listings included.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/best-paying-blue-collar-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '7 Best Paying Blue Collar Jobs in 2026',
  description: 'Seven highest-paying blue collar careers in the United States with live job listings.',
  url: 'https://www.oh-my-job.com/best-paying-blue-collar-jobs',
}

const topJobs = [
  {
    rank: 1,
    title: 'Elevator Mechanic',
    searchTerm: 'elevator mechanic',
    salary: '$80K to $150K',
    growth: '5%',
    paragraph: 'Elevator mechanics install, maintain, and repair elevator systems in commercial buildings. The median salary is above $106,000. Entry into the trade requires a four-year union apprenticeship. Strict safety codes and high liability for building owners keep wages elevated. The specialization is narrow. Only about 35,000 people hold this credential nationwide. Emergency and weekend callback work pushes top earners past $150,000 in cities like New York, Chicago, and San Francisco.',
  },
  {
    rank: 2,
    title: 'Power Line Worker',
    searchTerm: 'lineman electrician',
    salary: '$70K to $130K',
    growth: '7%',
    paragraph: 'Linemen work on live power lines carrying thousands of volts, often 60 feet in the air. The job is dangerous and the pay reflects that. Storm restoration crews travel to disaster zones to rebuild the grid after hurricanes. These deployments pay double or triple the normal rate. A single storm season can add $30,000 to $50,000 to an annual paycheck. Most linemen enter the trade through a three to four year apprenticeship with a utility company or the IBEW. Grid modernization, renewable energy interconnection, and EV charging infrastructure are creating new transmission projects and keeping demand high.',
  },
  {
    rank: 3,
    title: 'Construction Manager',
    searchTerm: 'construction manager',
    salary: '$75K to $150K+',
    growth: '8%',
    paragraph: 'Construction managers coordinate trades, control budgets, and keep projects on schedule. Project delays cost thousands of dollars per day on large commercial builds, so companies pay well to avoid them. Most construction managers do not start in management. They begin as carpenters, electricians, or plumbers, move up to foreman, and transition into oversight once they understand every trade on a job site. That field experience gives them an edge a construction management degree alone cannot provide. Owners of general contracting firms can earn $200,000 to $500,000 or more.',
  },
  {
    rank: 4,
    title: 'Electrician',
    searchTerm: 'electrician',
    salary: '$60K to $100K+',
    growth: '11%',
    paragraph: 'Electrician pay varies widely by specialization. Residential wiremen earn $50,000 to $70,000 in most markets. Industrial and commercial electricians, especially those working with high-voltage systems, programmable logic controllers, or renewable energy integration, often earn well past $100,000. The difference is not talent or work ethic. It comes down to specializing in higher-stakes segments where qualified workers are scarce. The four to five year apprenticeship pays from day one. The journeyman license that follows is valid in every state.',
  },
  {
    rank: 5,
    title: 'Welder',
    searchTerm: 'welder',
    salary: '$45K to $120K+',
    growth: '5%',
    paragraph: 'Welding has one of the widest pay ranges of any trade. A general shop welder fabricating brackets earns $40,000 to $55,000. A pipeline welder certified in specialized processes like TIG or orbital welding, willing to travel to remote sites, can earn $100,000 to $200,000. Underwater welders on offshore platforms can clear $2,000 to $3,000 a week. Pay depends less on years of experience and more on certification type, work environment, and willingness to travel. An AWS certification in a high-demand process can take a welder from $50,000 to six figures in under three years.',
  },
  {
    rank: 6,
    title: 'Plumber',
    searchTerm: 'plumber',
    salary: '$55K to $105K',
    growth: '6%',
    paragraph: 'Plumbing pay depends heavily on ownership. A solo master plumber running a residential service truck can bill $150 to $250 an hour for emergency calls. After vehicle costs, insurance, and supplies, a busy week can outearn what many salaried professionals make in a month. The path takes four to five years of paid apprenticeship, followed by a journeyman license and eventually a master license. The result is a business with no franchise fees and low overhead. The average licensed plumber is over 55. As they retire, especially with Sun Belt construction demand rising, the plumbers who remain can charge more.',
  },
  {
    rank: 7,
    title: 'HVAC Technician',
    searchTerm: 'HVAC technician',
    salary: '$50K to $90K',
    growth: '9%',
    paragraph: 'HVAC technicians have a lower median salary than most trades on this list, but strong momentum. The shift to heat pumps is the biggest change in residential mechanical systems since the rise of central air conditioning. State electrification mandates, federal tax credits, and consumer demand for efficiency are driving that shift. Technicians who hold an EPA 608 certification and add heat pump installation to their skill set are ahead of most of the current workforce. Commercial HVAC specialists who manage building automation systems earn $80,000 to $100,000. Moving into facility management can push pay past $120,000. Training takes six months to two years, and apprenticeships pay throughout.',
  },
]



export default async function BestPayingBlueCollarJobsPage() {
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
            7 Best Paying Blue Collar Jobs in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Seven trades where pay rivals or beats most office jobs, with no degree and no student debt required. Ranked by earning ceiling, not just the median. Each entry includes live job listings.
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

        <footer className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Oh My Job is an independent job search platform and is not affiliated with any employer, union, trade school, or organization listed on this page. Job listings are sourced from third-party APIs. Salary figures are estimates drawn from publicly available data and may not reflect specific offers. Apprenticeship availability, licensing requirements, and union membership rules vary by state and trade. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}