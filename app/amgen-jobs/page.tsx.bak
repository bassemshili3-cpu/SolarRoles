import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users, TrendingUp } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Amgen Jobs | Careers in Biotechnology, Research & Clinical Operations',
  description: 'Research, clinical, manufacturing, and commercial teams at Amgen shape how therapies reach patients worldwide. Open positions by site and function.',
  keywords: 'amgen jobs, amgen careers, biotech careers, research jobs amgen, clinical jobs amgen, biotechnology positions',
  openGraph: {
    title: 'Amgen Jobs | Biotechnology & Research Careers',
    description: 'Explore current amgen jobs and build your career in cutting-edge biotech roles. Competitive pay, benefits, and a chance to impact patient lives.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amgen Jobs | Biotechnology Careers Nationwide',
    description: 'Thousands of amgen jobs available in research, clinical trials, manufacturing, engineering, and corporate support. Apply today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/amgen-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Amgen Jobs',
  description: 'Comprehensive overview of amgen jobs hiring now across research, clinical, operational, and corporate roles with career advancement opportunities.',
  url: 'https://www.oh-my-job.com/amgen-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Amgen Jobs',
    description: 'Active listings for amgen jobs in research, clinical trials, manufacturing, engineering, and commercial roles.',
  },
}

const roleCategories = [
  {
    title: 'Scientific Research',
    description: "Amgen's labs aren't your typical academic setup. Think proteomics platforms, gene editing, and therapeutic targets most companies haven't touched yet. If you're coming from a university background, expect a faster pace and tighter timelines — most researchers say it's a good trade.",
    icon: BookOpen,
  },
  {
    title: 'Clinical Operations',
    description: "Multi-site trials, often international, with serious regulatory overhead. You need to know ICH-GCP cold and stay calm when an audit lands unexpectedly. Day-to-day means juggling medical teams, CROs, and health authorities — sometimes all at once.",
    icon: Shield,
  },
  {
    title: 'Manufacturing & Quality',
    description: "Biologics manufacturing isn't like assembling parts. These are living processes, sensitive to the smallest changes, and every deviation gets documented. QA at Amgen works shoulder-to-shoulder with production — not from a separate floor.",
    icon: Briefcase,
  },
  {
    title: 'Engineering & Technology',
    description: "Process automation, data science tools applied to research, GxP-compliant IT infrastructure — engineers here deal with constraints most industries don't have. It's demanding work, occasionally maddening, and almost never dull.",
    icon: Users,
  },
  {
    title: 'Commercial & Strategy',
    description: "Launching a biologic isn't like launching a consumer product. Commercial teams at Amgen work directly with medical affairs, market access, and payers. Regulatory context isn't background knowledge here — it's part of the job description.",
    icon: MapPin,
  },
  {
    title: 'Support & Corporate',
    description: "Finance, HR, legal, project management — support functions here operate inside a heavily regulated environment. The compliance requirements, international reporting, and risk management stakes are real. It's not a back-office role in a mid-size firm.",
    icon: TrendingUp,
  },
]

const salaryRanges = [
  { level: 'Median Scientific Role', amount: '$95,000+', source: 'Market data' },
  { level: 'Senior Research Lead', amount: '$140,000+', source: 'Industry averages' },
  { level: 'Entry Operational Role', amount: '$65,000', source: 'Biotech entry pay' },
]

const faqs = [
  {
    question: 'What qualifications are typically required for Amgen jobs?',
    answer: "It really depends on the role. A master's or PhD in life sciences opens more doors on the research side, but candidates with hands-on manufacturing or QA experience don't always need an advanced degree. What matters as much as the diploma is what you've actually done with it.",
  },
  {
    question: 'Why consider Amgen over other biotech companies?',
    answer: "A few concrete things stand out: Amgen funds its own research programs without relying on a single pipeline, which limits the kind of sudden layoffs you see elsewhere. Teams are relatively stable compared to a lot of biotech peers. And the therapeutic areas — oncology, rare diseases, cardiovascular — have real clinical visibility, not just promising early-stage data.",
  },
  {
    question: 'Is the hiring process competitive?',
    answer: "For scientific and clinical roles, yes. Applications often come from people leaving postdocs or CROs with five-plus years of experience. Engineering and manufacturing positions are more accessible if you have concrete results to show. A generic resume doesn't get far.",
  },
  {
    question: 'Does Amgen offer programs for students or recent graduates?',
    answer: "Yes — internships and early-career programs exist, particularly in R&D, quality, and regulatory affairs. They're structured programs, not busy work. Some do lead to full-time offers, though nothing is guaranteed going in.",
  },
  {
    question: 'How do I actually apply?',
    answer: "Through Amgen's official careers portal. Set up an account, apply to roles that genuinely match your background. Skip the copy-paste cover letter — recruiters notice. Lead with specific projects, outcomes, and numbers where you can.",
  },
  {
    question: 'What is the internal culture like?',
    answer: "People who've worked there describe a lot of process and a lot of meetings — it's a large company, not a startup. The flip side is that resources are real, project budgets exist, and strategy doesn't pivot every quarter. For certain profiles, that's exactly what they're looking for.",
  },
  {
    question: 'Is internal mobility actually possible?',
    answer: "It happens, and there are documented examples — people moving from bench roles into program management, or from commercial into market access. It doesn't happen passively though. You need to make your intentions visible and build relationships across teams.",
  },
]

const candidateTips = [
  {
    title: 'Read job postings differently',
    description: "Don't just scan for keywords that match your resume. Think about what problem the team is trying to solve by hiring for this role. Your application should address that directly — not just recap your experience in chronological order.",
  },
  {
    title: "Know the pipeline, not just the company",
    description: "Saying Amgen is a leading biotech isn't enough. Knowing which therapies are in late-stage trials, what recent clinical results looked like, which therapeutic areas they're expanding — that's what shows you did real homework before the interview.",
  },
  {
    title: 'Come with examples, not adjectives',
    description: '"Detail-oriented and results-driven" — everyone says that. "Reduced deviation rates by 18% on a production line over six months" — that gets remembered. Prepare three or four concrete situations and practice telling each one in under two minutes.',
  },
  {
    title: "Don't go quiet after applying",
    description: "Biotech hiring timelines run long — four to six weeks between application and first response is normal, sometimes longer. A polite follow-up after two weeks is fine. It signals genuine interest without crossing into pressure.",
  },
]

export default async function AmgenJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'Amgen jobs', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'Amgen jobs', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Amgen Jobs Hiring Nationwide</h1>
          <p className="text-gray-700">
            Amgen hires across a wide range of disciplines — molecular biology researchers, process engineers, clinical trial managers, regulatory affairs specialists, and commercial teams. The roles listed here cover all of these areas, across the US and internationally.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80"><JobFilters defaultWhat="Amgen jobs" /></aside>
          <div className="flex-1">
            {count > 0 && <p className="text-sm text-gray-500 mb-4"><span className="font-semibold text-gray-800">{count.toLocaleString('en-US')}</span> positions available</p>}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'Amgen jobs'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Briefcase className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Available Roles at Amgen</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Amgen positions don't all fit the "scientist in a lab coat" image. Hiring covers dozens of distinct job types, with varying entry points and career paths that frequently intersect across departments.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleCategories.map((cat, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg">
                <cat.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{cat.title}</h3>
                <p className="text-gray-600 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Salary Overview</h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            {salaryRanges.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">{item.amount}</p>
                <p className="font-semibold text-gray-900 text-sm mb-1">{item.level}</p>
                <p className="text-xs text-gray-500">{item.source}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><CheckCircle className="w-7 h-7 text-purple-600" /><h2 className="text-2xl font-bold text-gray-900">Tips for Applying</h2></div>
          <div className="grid md:grid-cols-2 gap-6">
            {candidateTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Shield className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2></div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> This page is informational. Verify job details, requirements, and benefits on the official Amgen careers portal before applying.
          </p>
        </section>
      </div>
    </>
  )
}