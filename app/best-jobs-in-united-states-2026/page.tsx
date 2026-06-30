import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { Shield, DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
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
    paragraph: 'The United States adds roughly 10,000 people per day to the 65+ age bracket, and the country has been producing fewer primary care physicians per capita since the early 2010s. Nurse practitioners fill that vacuum. In the 27 states that now grant full practice authority, NPs run their own clinics, prescribe independently, and carry patient panels that look identical to a physician\'s. Psychiatric and acute care NPs in metropolitan areas are clearing $170K before bonuses. If you want the shortest path to six figures with the most structural job security available in any profession, this is it.',
  },
  {
    rank: 2,
    title: 'Software Engineer',
    searchTerm: 'software engineer',
    salary: '$110K to $180K+',
    growth: '17%',
    paragraph: 'The layoff headlines of 2023 and 2024 scared people away from this field at exactly the wrong moment. What those headlines described was a correction at companies that had hired speculatively during the zero-interest-rate era. That correction is over. Every company with a product or a database needs engineers, and AI tools have not replaced developers but raised the bar on what a single developer can ship. The engineers thriving in 2026 treat AI as a multiplier: they use copilots for boilerplate, then spend their own energy on architecture and system design. Entry-level hiring is tighter, meaning your first role requires more portfolio work than it did in 2021. But once you are in, the earning ceiling remains among the highest of any profession that does not require a medical or law degree.',
  },
  {
    rank: 3,
    title: 'Cybersecurity Analyst',
    searchTerm: 'cybersecurity analyst',
    salary: '$90K to $150K',
    growth: '29%',
    paragraph: 'Every major data breach you read about in the news is, functionally, a job posting. Each incident triggers an internal audit, a budget increase, and a headcount expansion at the affected company and at dozens of peers who realize they share the same vulnerability. Regulatory pressure compounds the effect: SEC disclosure rules, state privacy laws, and compliance frameworks like HIPAA and PCI-DSS all require dedicated security personnel. The field has a peculiar advantage for people willing to earn certifications: each credential you add (Security+, CISSP, cloud-specific certs) maps directly to a salary band that hiring managers reference when writing offers. Few careers make the return on a $400 exam fee this transparent.',
  },
  {
    rank: 4,
    title: 'Physical Therapist',
    searchTerm: 'physical therapist',
    salary: '$80K to $110K',
    growth: '14%',
    paragraph: 'Physical therapy lands on this list for a reason most rankings underweight: it is one of the very few high-paying healthcare careers where the work itself is consistently described as enjoyable by the people doing it. The baseline interaction, spending 30 to 60 minutes one-on-one with a patient who is actively trying to get better, is inherently more rewarding than the documentation-heavy, 15-minute-visit grind that defines much of primary care. The financial picture has shifted too. Direct-access laws in most states now let patients see a PT without a physician referral, opening the door to independent practice and cash-pay models that bypass insurance rates entirely. PTs who build niche practices around sports rehab, pelvic health, or performance optimization are setting their own rates in a way that was rare even five years ago.',
  },
  {
    rank: 5,
    title: 'Data Scientist',
    searchTerm: 'data scientist',
    salary: '$100K to $160K',
    growth: '36%',
    paragraph: 'The hype around data science has cooled since the "sexiest job" era, and that is actually good news for practitioners. The roles that remain are grounded in real business problems: build a model that predicts churn, design an experiment measuring revenue impact, or automate a decision pipeline that currently requires a human eyeballing a spreadsheet every morning. The generative AI wave has shifted the emphasis rather than eliminated the role. Data scientists who can evaluate, fine-tune, and deploy large language models are commanding premiums. Those who combine statistical rigor with clear communication, meaning they can explain to a VP why the model says what it says, remain the hardest hire in analytics and the closest to revenue of any technical role.',
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

export default async function BestJobsUS2026Page() {
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
            Top 5 Best Jobs in the United States in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Five careers selected for their earning ceiling over a full career, the structural forces driving demand, and their resistance to automation and economic cycles. Each entry includes live job listings you can browse and apply to directly.
          </p>
        </header>

        {/* ── JOB SECTIONS ── */}
        {topJobs.map((job, index) => {
          const { count, data } = jobResults[index]
          return (
            <section key={job.rank} id={`rank-${job.rank}`} className="mb-20 scroll-mt-8">

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
            Oh My Job is an independent job search platform and is not affiliated with any employer listed on this page. Job listings are sourced from third-party APIs. Salary and growth figures are estimates drawn from publicly available data and may not reflect specific offers. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}