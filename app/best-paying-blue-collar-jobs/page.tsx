import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
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
    paragraph: 'The economics behind this trade are almost absurd: a median above $106K, union backing in most markets, and a specialization so narrow that supply will never catch demand. The work involves installing, maintaining, and repairing elevator systems in commercial buildings, and the reason it pays what it does is straightforward. Elevators operate under strict safety codes, the liability exposure for building owners is enormous, and the systems blend hydraulics, electrical controls, and mechanical engineering in ways that take years to master. The 4-year union apprenticeship is the only way in, and once you complete it, you hold a credential that roughly 35,000 people in the entire country share. Emergency callback rates for nights and weekends push top earners past $150K in cities like New York, Chicago, and San Francisco.',
  },
  {
    rank: 2,
    title: 'Power Line Worker',
    searchTerm: 'lineman electrician',
    salary: '$70K to $130K',
    growth: '7%',
    paragraph: 'Linemen earn what they earn because the work is genuinely dangerous and not many people are willing to do it. You climb 60-foot poles, handle conductors carrying thousands of volts, and do it in weather that would shut down most job sites. Storm restoration crews, the linemen who travel to disaster zones after hurricanes to rebuild the grid, earn double or triple their normal rate during deployments, and a single storm season can add $30K to $50K to an annual paycheck. The standard path is a 3 to 4 year apprenticeship through an electrical utility or the IBEW. Grid modernization, renewable energy interconnection, and EV charging infrastructure are generating transmission projects that did not exist a decade ago, which is why the field is growing even as automation absorbs other sectors.',
  },
  {
    rank: 3,
    title: 'Construction Manager',
    searchTerm: 'construction manager',
    salary: '$75K to $150K+',
    growth: '8%',
    paragraph: 'This is the blue collar career with the highest ceiling because it sits at the transition point between working with your hands and managing the people who do. Construction managers coordinate trades, control budgets, enforce safety, and keep projects on schedule. The penalty for delays on a large commercial build is thousands of dollars per day, which is why companies pay the managers who prevent those delays accordingly. Most did not start in management. They started as carpenters, electricians, or plumbers, worked up to foreman, and moved into project oversight after accumulating enough field knowledge to understand what every trade on a job site actually does. That ground-level experience is a competitive advantage that a construction management degree alone cannot replicate. Owners of general contracting firms routinely earn $200K to $500K+.',
  },
  {
    rank: 4,
    title: 'Electrician',
    searchTerm: 'electrician',
    salary: '$60K to $100K+',
    growth: '11%',
    paragraph: 'A residential wireman and a data center electrician hold the same base license but occupy completely different economic tiers. The residential side pays $50K to $70K in most markets and offers steady, predictable work. The industrial and commercial side, especially roles involving high-voltage systems, programmable logic controllers, or renewable energy integration, pushes well past $100K. What separates the $60K electricians from the $120K electricians is not talent or work ethic. It is the decision to specialize in a segment where the stakes are high and the supply of qualified workers is thin. The 4 to 5 year apprenticeship pays you from day one, and the journeyman license that follows is portable across every state in the country.',
  },
  {
    rank: 5,
    title: 'Welder',
    searchTerm: 'welder',
    salary: '$45K to $120K+',
    growth: '5%',
    paragraph: 'The pay gap within welding is wider than in any other trade on this list, and understanding why is the key to making money in the field. A general shop welder fabricating brackets earns $40K to $55K. A pipeline welder certified in specialized processes (TIG, orbital, exotic alloys) traveling to remote sites earns $100K to $200K. Underwater welders working on offshore platforms occupy a separate tier where weekly pay can exceed $2,000 to $3,000. The variable is not years of experience; it is the type of certification you hold, the environments you are willing to work in, and your tolerance for travel. An AWS certification in a high-demand process combined with willingness to go where the work is can take a welder from $50K to six figures in under three years. No other trade offers that kind of income acceleration based purely on credential stacking.',
  },
  {
    rank: 6,
    title: 'Plumber',
    searchTerm: 'plumber',
    salary: '$55K to $105K',
    growth: '6%',
    paragraph: 'The detail that matters most about plumbing is not the median salary but the ownership math. A solo master plumber running a residential service truck in a mid-size metro can bill $150 to $250 per hour for emergency calls. After vehicle costs, insurance, and supplies, the take-home on a busy week exceeds what most salaried professionals earn in a month. The path takes 4 to 5 years of paid apprenticeship followed by a journeyman and eventually a master license, but the endpoint is a business you own outright with no franchise fees and minimal overhead. The demographic reality is stark: the average licensed plumber is over 55, and the retirement wave is hitting at the same time as Sun Belt construction demand is surging. Every plumber who retires without a replacement creates an opening that gets filled by higher prices for the plumbers who remain.',
  },
  {
    rank: 7,
    title: 'HVAC Technician',
    searchTerm: 'HVAC technician',
    salary: '$50K to $90K',
    growth: '9%',
    paragraph: 'HVAC sits lower on this list in terms of median salary but higher in terms of where the field is headed over the next decade. The heat pump transition is the single largest shift in residential mechanical systems since the adoption of central air conditioning, driven by state electrification mandates, federal tax credits, and consumer demand for efficiency. Technicians who already hold EPA 608 certification and add heat pump installation to their skill set are positioning themselves at the front of a wave that most of the existing HVAC workforce has not yet caught. Commercial HVAC specialists who manage building automation systems earn $80K to $100K, and the transition into facility management pushes compensation past $120K. The trade school path takes 6 months to 2 years, and the apprenticeship route pays you throughout.',
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

export default async function BestPayingBlueCollarJobsPage() {
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
            7 Best Paying Blue Collar Jobs in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Seven trades where the compensation rivals or exceeds most white collar careers, and where the path in does not require a college degree or a cent of student debt. Ranked by earning ceiling, not just median, because the gap between an average tradesperson and a specialized one is where the real money lives. Each entry includes live job listings.
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
            Oh My Job is an independent job search platform and is not affiliated with any employer, union, trade school, or organization listed on this page. Job listings are sourced from third-party APIs. Salary figures are estimates drawn from publicly available data and may not reflect specific offers. Apprenticeship availability, licensing requirements, and union membership rules vary by state and trade. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}