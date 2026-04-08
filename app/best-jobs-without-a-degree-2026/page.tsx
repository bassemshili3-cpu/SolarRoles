import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { Shield, DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Best Jobs Without a Degree in 2026 | 10 Careers That Pay $55K to $130K+',
  description: 'The 10 best jobs you can get without a four-year degree in 2026. Trades, tech, healthcare, and more. Real salary data, honest entry paths, and live job listings for each role.',
  keywords: 'best jobs without a degree 2026, high paying jobs no degree, careers without college, jobs no degree needed, trade jobs 2026, no degree careers USA',
  openGraph: {
    title: 'Best Jobs Without a Degree in 2026',
    description: '10 careers paying $55K to $130K+ that do not require a bachelor\'s degree. Browse live openings.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Jobs Without a Degree | 2026 Edition',
    description: 'Skip the student debt. These 10 careers pay well, grow fast, and hire on skills. Live listings included.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/best-jobs-without-a-degree-2026',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Best Jobs Without a Degree in 2026',
  description: 'Ten high-paying careers accessible without a four-year college degree, with live job listings for each.',
  url: 'https://www.oh-my-job.com/best-jobs-without-a-degree-2026',
}

const topJobs = [
  {
    rank: 1,
    title: 'Electrician',
    searchTerm: 'electrician',
    salary: '$60K to $100K+',
    growth: '11%',
    paragraph: 'Data centers, EV charging infrastructure, solar panel installations, and an aging residential grid that needs constant repair. Every major investment trend of the 2020s runs through the electrical trade. The apprenticeship model lets you earn a paycheck from day one, graduate after 4 to 5 years with zero debt, and enter a licensed profession where demand outstrips supply in virtually every metro area. Master electricians who run their own shops in high-cost markets routinely clear $150K. The barrier is not intelligence or money. It is the willingness to commit to a multi-year training track that most people never consider because nobody marketed it to them.',
  },
  {
    rank: 2,
    title: 'Cybersecurity Analyst',
    searchTerm: 'cybersecurity analyst',
    salary: '$75K to $130K',
    growth: '29%',
    paragraph: 'The fastest path from zero credentials to a six-figure salary that currently exists in the American economy. A CompTIA Security+ certification takes 3 to 6 months of focused study and costs under $1,000. It qualifies you for junior SOC analyst roles starting between $65K and $85K. From there, each additional certification (CISSP, cloud security, penetration testing) maps directly to a higher salary band. The 4.7 million unfilled cybersecurity positions globally mean employers compete on speed, not selectivity. Many companies have formally dropped degree requirements for security roles because they ran out of degreed candidates years ago.',
  },
  {
    rank: 3,
    title: 'Dental Hygienist',
    searchTerm: 'dental hygienist',
    salary: '$65K to $95K',
    growth: '7%',
    paragraph: 'Two years of schooling for a career that pays $80K on average, offers near-universal Monday-to-Friday scheduling, and has a burnout rate that most healthcare workers would envy. The reason the pay is high for a two-year credential is that hygienists generate direct revenue for the practice every time they seat a patient, and practices cannot bill for hygiene services without a licensed hygienist in the chair. That economic reality gives you leverage whether you are negotiating salary at a corporate dental chain or picking up shifts at independent offices. Part-time and temping arrangements are common and well-compensated.',
  },
  {
    rank: 4,
    title: 'Web Developer',
    searchTerm: 'web developer',
    salary: '$60K to $110K',
    growth: '16%',
    paragraph: 'What has changed about web development is not that it became degree-optional (it always was) but that the alternative pathways matured. Bootcamps that survived the 2023 shakeout have verifiable placement data. Self-taught developers with a GitHub portfolio of real projects get interviewed at the same companies as CS graduates. AI copilots actually help entry-level developers more than they threaten them: they handle boilerplate, which means a junior can ship production-quality work faster. The catch is that the entry market is crowded, so standing out requires building things people actually use rather than completing tutorials nobody will ever see.',
  },
  {
    rank: 5,
    title: 'HVAC Technician',
    searchTerm: 'HVAC technician',
    salary: '$50K to $80K',
    growth: '9%',
    paragraph: 'Every building in the country has a heating and cooling system that will eventually break, and when it does, nobody Googles "how to fix it myself" when it is 98 degrees outside. That emergency dynamic is why HVAC technicians command premium rates for after-hours calls that can push annual earnings well past the median. Trade school takes 6 months to 2 years, and most areas have more open apprenticeship slots than applicants. The emerging opportunity is in heat pump installation: as states adopt electrification mandates and homeowners shift away from gas furnaces, technicians trained on heat pump systems are positioned for a decade of accelerating demand.',
  },
  {
    rank: 6,
    title: 'Commercial Truck Driver',
    searchTerm: 'truck driver',
    salary: '$50K to $85K',
    growth: '4%',
    paragraph: 'CDL training takes 3 to 7 weeks and many carriers cover it entirely, sometimes with a sign-on bonus attached. That makes trucking the fastest zero-to-employed pipeline on this list. The long-haul driver shortage has pushed starting pay above $55K at most national carriers, and specialized freight (hazmat, oversized loads, refrigerated goods) commands $75K to $100K+. Autonomous trucking gets press, but regulatory, insurance, and last-mile complexity will keep human drivers necessary for long-haul routes through the foreseeable future. Look closely at regional and local delivery roles if sleeping in your own bed matters to you.',
  },
  {
    rank: 7,
    title: 'Plumber',
    searchTerm: 'plumber',
    salary: '$55K to $95K',
    growth: '6%',
    paragraph: 'The average licensed plumber in the U.S. is over 55 years old, which means a wave of retirements is about to collide with steady construction demand. The apprenticeship takes 4 to 5 years and pays you throughout. Once you hold a journeyman or master license, you control your earning ceiling: running your own residential service operation in a mid-size city can generate $120K to $200K in annual revenue with modest overhead. No amount of AI or automation is going to snake a clogged drain or repipe a 1960s basement. The work is physical and sometimes unpleasant, but the job security is absolute.',
  },
  {
    rank: 8,
    title: 'Aircraft Mechanic',
    searchTerm: 'aircraft mechanic',
    salary: '$65K to $105K',
    growth: '6%',
    paragraph: 'Airlines cancel flights not because of weather but because they cannot certify that the aircraft is safe to fly, and the only people authorized to make that certification are licensed A&P mechanics. FAA-approved training takes 18 to 24 months at an aviation maintenance school, and the credential is recognized worldwide. MRO facilities are hiring aggressively because the global fleet is expanding while the existing mechanic workforce retires. Evening and night shift differentials at major carriers push total compensation past $100K, and the professional gravity of keeping machines that fly at 500 mph in safe operating condition is difficult to find in any other trade.',
  },
  {
    rank: 9,
    title: 'Wind Turbine Technician',
    searchTerm: 'wind turbine technician',
    salary: '$55K to $75K',
    growth: '60%',
    paragraph: 'The single fastest-growing occupation tracked by the Bureau of Labor Statistics. Sixty percent projected growth means the field will nearly double in size within a decade, and it is starting from a small base, which translates into acute shortages right now. Training takes 6 months to 2 years at a technical school covering both electrical systems and mechanical components. The daily work involves climbing 300-foot towers to inspect and repair turbine nacelles, so comfort at height is a non-negotiable prerequisite. Pay starts lower than some other trades here, but the trajectory is steep because demand is structurally locked in by state renewable mandates and federal tax credits running through 2032.',
  },
  {
    rank: 10,
    title: 'Real Estate Agent',
    searchTerm: 'real estate agent',
    salary: '$50K to $120K+',
    growth: '3%',
    paragraph: 'The licensing exam takes 1 to 3 months of coursework depending on the state, and the startup cost is under $2,000 in most markets. What makes real estate unique on this list is the uncapped income ceiling: agents who build a referral network and close consistently earn $150K to $300K+ without any credential beyond a state license. The post-NAR settlement changes in 2024 restructured buyer commissions, which has actually benefited skilled agents by making their advisory value more visible to clients. The trade-off is that this is a commission-only career with no base salary, no benefits, and no guaranteed income. It rewards self-starters who handle financial variability well.',
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

export default async function BestJobsWithoutDegreePage() {
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
            Best Jobs Without a Degree in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Ten careers you can enter without a four-year college degree, selected for their earning potential over a full career, the cost and speed of the training required, and their durability in an economy being reshaped by AI. Each entry includes live job listings you can browse and apply to directly.
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
            Oh My Job is an independent job search platform and is not affiliated with any employer, trade school, certification body, or organization listed on this page. Job listings are sourced from third-party APIs. Salary and growth figures are estimates drawn from publicly available data and may not reflect specific offers. Training timelines and certification requirements vary by state and provider. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}