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
    paragraph: 'Data centers, EV charging infrastructure, solar installations, and an aging residential grid all need electrical work. Every major investment trend of the 2020s touches this trade. The apprenticeship model pays you from day one. You graduate in four to five years with no debt and enter a licensed profession where demand outpaces supply in most metro areas. Master electricians who run their own shops in high-cost markets often clear $150,000. The real barrier is not intelligence or money. It is committing to a multi-year training track that few people consider, mostly because nobody markets it to them.',
  },
  {
    rank: 2,
    title: 'Cybersecurity Analyst',
    searchTerm: 'cybersecurity analyst',
    salary: '$75K to $130K',
    growth: '29%',
    paragraph: 'Cybersecurity offers one of the fastest paths from zero credentials to a six-figure salary in the US economy. A CompTIA Security+ certification takes three to six months of study and costs under $1,000. It qualifies you for junior SOC analyst roles starting between $65,000 and $85,000. Each additional certification, like CISSP, cloud security, or penetration testing, maps to a higher salary band. There are an estimated 4.7 million unfilled cybersecurity positions worldwide. That shortage means employers compete on speed, not selectivity. Many companies dropped degree requirements for security roles years ago simply because they ran out of degreed candidates.',
  },
  {
    rank: 3,
    title: 'Dental Hygienist',
    searchTerm: 'dental hygienist',
    salary: '$65K to $95K',
    growth: '7%',
    paragraph: 'Dental hygiene requires about two years of schooling and pays $80,000 on average. Scheduling is close to Monday through Friday, and burnout rates are lower than in most healthcare jobs. Pay stays high for a two-year credential because hygienists generate direct revenue every time they see a patient. Practices cannot bill for hygiene services without a licensed hygienist in the chair. That gives you leverage, whether you negotiate salary at a corporate dental chain or pick up shifts at independent offices. Part-time and temp work are common and pay well.',
  },
  {
    rank: 4,
    title: 'Web Developer',
    searchTerm: 'web developer',
    salary: '$60K to $110K',
    growth: '16%',
    paragraph: 'Web development was never degree-required, but the alternative paths have matured. Bootcamps that survived the 2023 shakeout now have verifiable placement data. Self-taught developers with a GitHub portfolio of real projects get interviewed at the same companies as CS graduates. AI copilots help entry-level developers more than they threaten them. They handle boilerplate, which lets a junior developer ship production-quality work faster. The entry market is crowded, though. Standing out means building things people actually use, not completing tutorials nobody will see.',
  },
  {
    rank: 5,
    title: 'HVAC Technician',
    searchTerm: 'HVAC technician',
    salary: '$50K to $80K',
    growth: '9%',
    paragraph: 'Every building has a heating and cooling system that will eventually break. When it does at 98 degrees outside, nobody tries to fix it themselves. That urgency is why HVAC technicians command premium rates for after-hours calls, which can push annual earnings well past the median. Trade school takes six months to two years, and most areas have more open apprenticeship slots than applicants. The emerging opportunity is heat pump installation. As states adopt electrification mandates and homeowners move away from gas furnaces, technicians trained on heat pumps are positioned for a decade of rising demand.',
  },
  {
    rank: 6,
    title: 'Commercial Truck Driver',
    searchTerm: 'truck driver',
    salary: '$50K to $85K',
    growth: '4%',
    paragraph: 'CDL training takes three to seven weeks, and many carriers cover the cost, sometimes with a sign-on bonus. That makes trucking the fastest path to employment on this list. The long-haul driver shortage has pushed starting pay above $55,000 at most national carriers. Specialized freight, like hazmat, oversized loads, or refrigerated goods, pays $75,000 to $100,000 or more. Autonomous trucking gets attention in the press, but regulatory, insurance, and last-mile complexity will keep human drivers necessary for long-haul routes for the foreseeable future. If sleeping in your own bed matters to you, look at regional and local delivery roles instead.',
  },
  {
    rank: 7,
    title: 'Plumber',
    searchTerm: 'plumber',
    salary: '$55K to $95K',
    growth: '6%',
    paragraph: 'The average licensed plumber in the US is over 55, and a wave of retirements is approaching just as construction demand stays steady. The apprenticeship takes four to five years and pays you throughout. Once you hold a journeyman or master license, you control your earning ceiling. Running your own residential service operation in a mid-size city can generate $120,000 to $200,000 in annual revenue with modest overhead. No amount of automation is going to snake a clogged drain or repipe a 1960s basement. The work is physical and sometimes unpleasant, but the job security is real.',
  },
  {
    rank: 8,
    title: 'Aircraft Mechanic',
    searchTerm: 'aircraft mechanic',
    salary: '$65K to $105K',
    growth: '6%',
    paragraph: 'Airlines sometimes cancel flights because they cannot certify an aircraft as safe to fly. Only licensed A&P mechanics can make that certification. FAA-approved training takes 18 to 24 months at an aviation maintenance school, and the credential is recognized worldwide. MRO facilities are hiring aggressively because the global fleet is expanding while the current mechanic workforce retires. Evening and night shift differentials at major carriers push total compensation past $100,000. Few other trades carry the same weight as keeping machines that fly at 500 mph in safe operating condition.',
  },
  {
    rank: 9,
    title: 'Wind Turbine Technician',
    searchTerm: 'wind turbine technician',
    salary: '$55K to $75K',
    growth: '60%',
    paragraph: 'This is the fastest-growing occupation tracked by the Bureau of Labor Statistics. A projected 60 percent growth means the field will nearly double in size within a decade. It is starting from a small base, which means shortages are already acute. Training takes six months to two years at a technical school, covering both electrical systems and mechanical components. The daily work involves climbing 300-foot towers to inspect and repair turbine nacelles, so comfort with heights is required. Pay starts lower than some other trades on this list, but the trajectory is steep. Demand is locked in by state renewable mandates and federal tax credits running through 2032.',
  },
  {
    rank: 10,
    title: 'Real Estate Agent',
    searchTerm: 'real estate agent',
    salary: '$50K to $120K+',
    growth: '3%',
    paragraph: 'The licensing exam requires one to three months of coursework depending on the state, and startup costs run under $2,000 in most markets. What makes real estate different from everything else on this list is the uncapped income. Agents who build a referral network and close consistently can earn $150,000 to $300,000 or more, with no credential beyond a state license. The 2024 NAR settlement restructured buyer commissions, and it has actually benefited skilled agents by making their advisory value more visible to clients. The trade-off is real: this is a commission-only career with no base salary, no benefits, and no guaranteed income. It rewards self-starters who can handle income variability.',
  },
]

export default async function BestJobsWithoutDegreePage() {
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
            Best Jobs Without a Degree in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Ten careers you can enter without a four-year college degree, selected for their earning potential over a full career, the cost and speed of the training required, and their durability in an economy being reshaped by AI. Each entry includes live job listings you can browse and apply to directly.
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
            Oh My Job is an independent job search platform and is not affiliated with any employer, trade school, certification body, or organization listed on this page. Job listings are sourced from third-party APIs. Salary and growth figures are estimates drawn from publicly available data and may not reflect specific offers. Training timelines and certification requirements vary by state and provider. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}