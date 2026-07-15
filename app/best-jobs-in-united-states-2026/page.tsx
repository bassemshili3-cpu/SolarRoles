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
  title: 'Top 5 Best Jobs in the United States in 2026 | Browse Live Openings',
  description: 'The 5 careers worth pursuing in 2026, picked for pay ceiling, hiring momentum, and long-term staying power. Real job listings included for each role. No fluff, just data.',
  keywords: 'best jobs 2026, top jobs in america, best careers 2026, highest demand jobs USA, top paying careers united states 2026',
  openGraph: {
    title: 'Top 5 Best Jobs in the United States in 2026',
    description: 'Five careers with the strongest combination of salary, demand, and durability. Browse openings and apply.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top 5 Best Jobs in the US | 2026 Edition',
    description: 'Data-driven picks with live job listings. Research and apply in one place.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/best-jobs-in-united-states-2026',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Top 5 Best Jobs in the United States in 2026',
  description: 'Five highest-value careers in America for 2026 with live job listings for each.',
  url: 'https://www.oh-my-job.com/best-jobs-in-united-states-2026',
}

const topJobs = [
  {
    rank: 1,
    title: 'Nurse Practitioner',
    searchTerm: 'nurse practitioner',
    salary: '$120K to $160K',
    growth: '40%',
    paragraph: 'The United States adds about 10,000 people to the 65+ age bracket every day. At the same time, the country has trained fewer primary care physicians per capita since the early 2010s. Nurse practitioners are filling that gap. In the 27 states that grant full practice authority, NPs run their own clinics, prescribe independently, and manage patient panels similar to a physician\'s. Psychiatric and acute care NPs in major metro areas often clear $170,000 before bonuses. Few paths offer a faster route to six figures with this level of job security.',
  },
  {
    rank: 2,
    title: 'Software Engineer',
    searchTerm: 'software engineer',
    salary: '$110K to $180K+',
    growth: '17%',
    paragraph: 'The layoff headlines from 2023 and 2024 scared people away from this field at the wrong moment. Those layoffs mostly hit companies that had overhired during the zero-interest-rate years. That correction is over. Every company with a product or a database still needs engineers. AI tools have not replaced developers. They have raised the bar for what one developer can ship. Engineers who do well in 2026 use AI as a multiplier: copilots handle boilerplate, and developers spend their time on architecture and system design. Entry-level hiring is tighter than it was in 2021, so a stronger portfolio is now expected. Once you land a role, the earning ceiling remains among the highest of any career that does not require a medical or law degree.',
  },
  {
    rank: 3,
    title: 'Cybersecurity Analyst',
    searchTerm: 'cybersecurity analyst',
    salary: '$90K to $150K',
    growth: '29%',
    paragraph: 'Every major data breach in the news creates job openings. Each incident triggers an internal audit, a budget increase, and new hiring, both at the company involved and at peers who realize they share the same vulnerability. Regulatory pressure adds to the demand. SEC disclosure rules, state privacy laws, and frameworks like HIPAA and PCI-DSS all require dedicated security staff. Certifications pay off directly in this field. Security+, CISSP, and cloud-specific certifications each map to a salary band that hiring managers reference when writing offers. Few careers turn a $400 exam fee into a clear salary increase this reliably.',
  },
  {
    rank: 4,
    title: 'Physical Therapist',
    searchTerm: 'physical therapist',
    salary: '$80K to $110K',
    growth: '14%',
    paragraph: 'Physical therapy stands out for a reason most rankings skip: people who do the job consistently describe it as enjoyable. A typical session means 30 to 60 minutes one-on-one with a patient who is actively working to improve. That is a different experience than the documentation-heavy, 15-minute visits common in primary care. The financial picture has improved too. Most states now allow direct access, so patients can see a PT without a physician referral. This has opened the door to independent practice and cash-pay models that skip insurance rates entirely. PTs who build a niche in sports rehab, pelvic health, or performance training are setting their own rates more often than they could five years ago.',
  },
  {
    rank: 5,
    title: 'Data Scientist',
    searchTerm: 'data scientist',
    salary: '$100K to $160K',
    growth: '36%',
    paragraph: 'The hype around data science has cooled since its "sexiest job" era, and that is good news for people in the field. The roles that remain focus on real business problems: building a churn model, designing an experiment to measure revenue impact, or automating a decision that currently takes someone checking a spreadsheet every morning. Generative AI has shifted the role rather than replaced it. Data scientists who can evaluate, fine-tune, and deploy large language models are earning a premium. Those who pair statistical rigor with clear communication, meaning they can explain to a VP why the model produced a given result, remain the hardest people to hire in analytics and the closest to revenue of any technical role.',
  },
]

export default async function BestJobsUS2026Page() {
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
            Top 5 Best Jobs in the United States in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Five careers selected for their earning ceiling over a full career, the structural forces driving demand, and their resistance to automation and economic cycles. Each entry includes live job listings you can browse and apply to directly.
          </p>
        </header>

        {/* ── Job sections ── */}
        {topJobs.map((job, index) => {
          const { data } = jobResults[index]
          return (
            <section key={job.rank} id={`rank-${job.rank}`} className="mb-16 scroll-mt-8">

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
            Oh My Job is an independent job search platform and is not affiliated with any employer listed on this page. Job listings are sourced from third-party APIs. Salary and growth figures are estimates drawn from publicly available data and may not reflect specific offers. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}