import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase, TrendingUp, Users, Target, BarChart2,
  Lightbulb, CheckCircle, AlertCircle, DollarSign, BookOpen
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Talent Acquisition Jobs | Recruiter & TA Specialist Roles',
  description: 'Sourcing specialist to VP of talent acquisition — full-funnel TA roles at startups, agencies, and enterprise companies. Remote-eligible and hybrid options noted.',
  keywords: 'talent acquisition jobs, talent acquisition specialist, talent acquisition manager, recruiting jobs, TA jobs, talent acquisition director, hiring now talent acquisition',
  openGraph: {
    title: 'Talent Acquisition Jobs | TA Specialist & Manager Roles',
    description: 'Companies are hiring talent acquisition professionals right now. Find your next TA role and apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Talent Acquisition Jobs | Sourcing to VP of TA',
    description: 'Browse hundreds of open talent acquisition roles across the U.S. From entry-level sourcing to VP of TA — find your match today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/talent-acquisition-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Talent Acquisition Jobs',
  description: 'Find talent acquisition job openings hiring now across the United States. Browse TA specialist, manager, and director roles.',
  url: 'https://www.oh-my-job.com/talent-acquisition-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Talent Acquisition Jobs',
    description: 'Current job listings for talent acquisition professionals in the U.S.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does a talent acquisition specialist do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A talent acquisition specialist manages the end-to-end hiring process for an organization. This includes sourcing candidates, screening resumes, conducting interviews, coordinating with hiring managers, and negotiating offers. Unlike a general recruiter, a TA specialist often focuses on long-term workforce planning and employer branding as well.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the average salary for a talent acquisition manager in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In 2026, talent acquisition managers in the United States earn between $85,000 and $130,000 annually depending on company size, industry, and location. Senior and director-level roles at tech firms or large enterprises frequently exceed $150,000 when total compensation is factored in.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is talent acquisition the same as HR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Talent acquisition is a subset of HR focused specifically on finding and hiring employees. HR encompasses a much broader scope including compensation, compliance, employee relations, and performance management. In larger organizations, TA operates as its own dedicated function with its own leadership.',
      },
    },
    {
      '@type': 'Question',
      name: 'What skills are employers looking for in talent acquisition roles in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Employers in 2026 prioritize proficiency with AI-assisted sourcing tools, data-driven hiring metrics, experience with skills-based hiring frameworks, and strong stakeholder communication. Familiarity with applicant tracking systems and a track record of reducing time-to-fill are also highly valued.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are talent acquisition jobs remote-friendly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. A large share of talent acquisition roles, particularly specialist and manager-level positions, have remained remote or hybrid since the post-pandemic normalization. Companies that operate across multiple states or globally often prefer TA professionals who can work independently from any location.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const taCareerLevels = [
  {
    level: 'Talent Acquisition Coordinator',
    experience: '0 to 2 years',
    focus: 'Scheduling interviews, maintaining ATS records, supporting sourcing pipelines, and handling candidate communications.',
    salary: '$45,000 to $62,000',
    growth: 'Entry point into the TA function; fast track to specialist roles within 18 to 24 months.',
  },
  {
    level: 'Talent Acquisition Specialist',
    experience: '2 to 5 years',
    focus: 'Owning full-cycle recruiting for specific departments or roles, building sourcing strategies, and partnering with hiring managers.',
    salary: '$65,000 to $90,000',
    growth: 'Core TA role. High volume of openings in tech, healthcare, and professional services.',
  },
  {
    level: 'Senior TA Specialist / Lead',
    experience: '5 to 8 years',
    focus: 'Managing complex or executive searches, mentoring junior recruiters, contributing to workforce planning discussions.',
    salary: '$90,000 to $115,000',
    growth: 'Bridge role between individual contributor and management. Increasingly valued as companies flatten structures.',
  },
  {
    level: 'Talent Acquisition Manager',
    experience: '6 to 10 years',
    focus: 'Leading a team of recruiters, owning TA metrics and SLAs, driving employer brand initiatives, and reporting to HR leadership.',
    salary: '$100,000 to $135,000',
    growth: 'High-demand title as organizations scale. Strong movement into HRBP and VP roles.',
  },
  {
    level: 'Director / Head of Talent Acquisition',
    experience: '10+ years',
    focus: 'Setting enterprise-wide hiring strategy, managing vendor relationships, owning TA technology stack decisions, and representing the function at the executive level.',
    salary: '$140,000 to $200,000+',
    growth: 'Seat at the leadership table. Common in companies with 500+ employees or aggressive headcount targets.',
  },
]

const skillsIn2026 = [
  {
    skill: 'AI-Augmented Sourcing',
    why: 'Recruiters who can direct and evaluate AI sourcing tools outperform those who rely on manual search alone. Employers are not replacing TA professionals with AI — they are promoting the ones who can leverage it.',
  },
  {
    skill: 'Skills-Based Hiring Design',
    why: 'The shift away from degree requirements accelerated in 2024 and 2025. TA professionals who can redesign job requirements around demonstrated skills rather than credentials are in active demand across government, tech, and healthcare.',
  },
  {
    skill: 'Data Fluency and Hiring Metrics',
    why: 'TA is increasingly expected to own metrics such as time-to-fill, source-of-hire attribution, offer acceptance rate, and quality-of-hire. The ability to pull and interpret this data — and connect it to business outcomes — separates mid-tier from high-tier candidates.',
  },
  {
    skill: 'Employer Brand Management',
    why: 'In a tight labor market, how a company presents itself to candidates matters as much as the role itself. TA professionals who have built or refreshed an employer value proposition (EVP) are consistently prioritized at the manager and director level.',
  },
  {
    skill: 'Candidate Experience Architecture',
    why: 'With application drop-off rates rising, organizations want TA professionals who have redesigned application flows, reduced friction, and built feedback loops into the process — not just filled reqs.',
  },
]

const taVsRecruitingTable = [
  {
    dimension: 'Time horizon',
    talentAcquisition: 'Long-term and strategic — aligned to workforce plans and business growth projections',
    recruiting: 'Immediate — focused on filling open requisitions as quickly as possible',
  },
  {
    dimension: 'Scope',
    talentAcquisition: 'Includes employer branding, talent pipeline building, and market intelligence',
    recruiting: 'Primarily candidate sourcing, screening, and placement',
  },
  {
    dimension: 'Stakeholder relationship',
    talentAcquisition: 'Partners with business leaders on headcount planning and future skill needs',
    recruiting: 'Works with hiring managers on active, approved job openings',
  },
  {
    dimension: 'Typical environment',
    talentAcquisition: 'In-house, within larger organizations with a dedicated people function',
    recruiting: 'In-house or agency, often in volume-hiring environments',
  },
  {
    dimension: 'Success metric',
    talentAcquisition: 'Quality of hire, retention rate, time-to-productivity, pipeline health',
    recruiting: 'Time-to-fill, offer acceptance rate, number of placements',
  },
]

const industryHiringTrends = [
  {
    industry: 'Technology',
    signal: 'After two years of contraction, mid-market and enterprise tech companies resumed structured TA hiring in late 2025. AI product teams and infrastructure divisions are driving the bulk of new headcount, requiring TA specialists with technical fluency.',
    icon: TrendingUp,
  },
  {
    industry: 'Healthcare and Life Sciences',
    signal: 'Clinical and non-clinical TA roles remain among the highest-volume openings in the U.S. The talent shortage in nursing and allied health has pushed organizations to staff dedicated clinical TA teams separate from corporate recruiting.',
    icon: Users,
  },
  {
    industry: 'Financial Services',
    signal: 'Banks and fintech firms are rebuilding TA capacity after 2023 and 2024 freezes. Risk and compliance functions are driving targeted hiring, and TA professionals with financial sector experience command notable premiums.',
    icon: BarChart2,
  },
  {
    industry: 'Government and Public Sector',
    signal: 'Federal modernization initiatives and state-level workforce expansions have created a sustained pipeline of TA and HR transformation roles. Skills-based hiring mandates at the federal level have created specific demand for practitioners who have experience redesigning job requirements.',
    icon: Target,
  },
  {
    industry: 'Retail and Consumer Goods',
    signal: 'High-volume seasonal and permanent TA roles remain steady, with a growing emphasis on technology-enabled sourcing. Companies running distributed hiring across hundreds of locations are investing in centralized TA operations teams.',
    icon: Briefcase,
  },
]

const faqs = [
  {
    question: 'What does a talent acquisition specialist do?',
    answer: 'A talent acquisition specialist manages the end-to-end hiring process for an organization. This includes sourcing candidates, screening resumes, conducting interviews, coordinating with hiring managers, and negotiating offers. Unlike a general recruiter, a TA specialist often focuses on long-term workforce planning and employer branding in parallel with day-to-day hiring activity.',
  },
  {
    question: 'What is the average salary for a talent acquisition manager in 2026?',
    answer: 'Talent acquisition managers in the United States are earning between $85,000 and $130,000 annually in 2026, depending on company size, industry, and geography. Senior and director-level roles at technology firms or large enterprises frequently exceed $150,000 when total compensation including bonus and equity is included.',
  },
  {
    question: 'Is talent acquisition the same as HR?',
    answer: 'Talent acquisition is a subset of HR focused specifically on finding and hiring employees. HR covers a much broader scope including compensation, compliance, employee relations, and performance management. In larger organizations, TA operates as its own dedicated function with its own leadership, headcount, and budget.',
  },
  {
    question: 'What skills are employers prioritizing in TA hires in 2026?',
    answer: 'Employers in 2026 consistently prioritize proficiency with AI-assisted sourcing tools, data-driven hiring metrics, experience with skills-based hiring frameworks, and strong stakeholder communication. Familiarity with modern applicant tracking systems and a documented track record of reducing time-to-fill without sacrificing quality are also highly valued.',
  },
  {
    question: 'Are talent acquisition jobs remote-friendly?',
    answer: 'Yes. A substantial share of talent acquisition roles — particularly specialist and manager-level positions — remain remote or hybrid. Companies that operate across multiple states or globally often prefer TA professionals who work independently from any location, making this one of the more remote-accessible functions within HR.',
  },
  {
    question: 'How is AI changing the talent acquisition profession in 2026?',
    answer: 'AI is reshaping the sourcing and screening layers of the TA workflow significantly. Automated matching, outreach sequencing, and resume analysis have reduced administrative load, but the strategic and relational elements of the role — stakeholder alignment, candidate experience, offer negotiation, and workforce planning — remain firmly human. The net result has been a flight to quality: organizations are hiring fewer, more senior TA professionals rather than large junior teams.',
  },
]

export default async function TalentAcquisitionJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'talent acquisition', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'talent acquisition', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Talent Acquisition Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="talent acquisition" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'talent acquisition'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* ── CAREER LEVELS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Talent Acquisition Career Ladder in 2026</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Talent acquisition has developed into a mature professional discipline with a distinct career progression. Each level carries a different scope, compensation band, and expectation profile. Understanding where you sit — and what the next step requires — is the most practical way to target your job search.
          </p>
          <div className="space-y-4">
            {taCareerLevels.map((level, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{level.level}</h3>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                    <DollarSign className="w-4 h-4" /> {level.salary}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-medium text-gray-700">Experience:</span> {level.experience}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium text-gray-700">Core focus:</span> {level.focus}
                </p>
                <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{level.growth}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TA vs RECRUITING ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Talent Acquisition vs. Recruiting: What the Distinction Actually Means for Your Job Search</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The terms are used interchangeably by many employers, but they reflect meaningfully different scopes of work. If you are targeting the right roles, understanding the distinction will help you filter job titles more effectively and tailor your application materials to what the role is genuinely asking for.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 w-1/4">Dimension</th>
                  <th className="text-left p-4 font-semibold text-purple-700">Talent Acquisition</th>
                  <th className="text-left p-4 font-semibold text-blue-700">Recruiting</th>
                </tr>
              </thead>
              <tbody>
                {taVsRecruitingTable.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 font-medium text-gray-700">{row.dimension}</td>
                    <td className="p-4 text-gray-600">{row.talentAcquisition}</td>
                    <td className="p-4 text-gray-600">{row.recruiting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            In practice, many postings blend both. The title alone does not determine the actual scope — reading the responsibilities section carefully is still the most reliable way to assess fit.
          </p>
        </section>

        {/* ── SKILLS IN 2026 ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Five Skills That Are Moving Talent Acquisition Candidates to the Top of the List in 2026</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The TA function has been under pressure to demonstrate business impact rather than operational output. The professionals who are landing offers — and the faster offers — are the ones who can connect their daily work to outcomes that matter to finance, operations, and the executive team. These are the capabilities that are driving that shift.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skillsIn2026.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-amber-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{item.skill}</h3>
                <p className="text-gray-600 text-sm">{item.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── INDUSTRY TRENDS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Talent Acquisition Hiring Is Concentrated Right Now</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            TA job openings are not evenly distributed across industries. The sectors below are driving the largest share of current postings, each for distinct structural reasons. Knowing where demand is concentrated allows you to focus your search and tailor your positioning to the hiring context of each sector.
          </p>
          <div className="space-y-4">
            {industryHiringTrends.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.industry}</h3>
                  <p className="text-gray-600 text-sm">{item.signal}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW AI IS CHANGING TA ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What AI Has Actually Done to the Talent Acquisition Profession</h2>
              <p className="text-gray-700 mb-4">
                The prediction that AI would eliminate recruiting functions has not materialized. What has happened instead is a consolidation of the profession toward higher-leverage work. Organizations that deployed AI sourcing and screening tools found that they reduced coordinator-level tasks significantly, which led to two outcomes: fewer entry-level TA hires overall, and a sharper premium on experienced practitioners who can manage the strategic layer.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {[
                  {
                    heading: 'What AI has taken over',
                    points: [
                      'Initial resume parsing and matching',
                      'Outbound candidate outreach sequencing',
                      'Interview scheduling and calendar coordination',
                      'Basic job description generation from templates',
                    ],
                    color: 'bg-white border-blue-100',
                  },
                  {
                    heading: 'What remains human',
                    points: [
                      'Stakeholder alignment and hiring manager advisory',
                      'Offer strategy and candidate negotiation',
                      'Employer brand narrative and EVP development',
                      'Workforce planning and pipeline strategy',
                    ],
                    color: 'bg-white border-blue-100',
                  },
                  {
                    heading: 'The net effect on hiring',
                    points: [
                      'Smaller TA teams with higher average seniority',
                      'Greater emphasis on business partnership skills',
                      'Higher compensation at mid and senior levels',
                      'AI tool proficiency as a baseline expectation',
                    ],
                    color: 'bg-white border-blue-100',
                  },
                ].map((col, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${col.color}`}>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">{col.heading}</h3>
                    <ul className="space-y-2">
                      {col.points.map((point, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT TO INCLUDE ON YOUR TA RESUME ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-7 h-7 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">What Hiring Managers Are Scanning for on a Talent Acquisition Resume</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            TA hiring managers read resumes differently than other functions do. They are screening for the same qualities they use to evaluate candidates in their own work. Vague impact statements and generic responsibilities do not move the needle. These are the elements that do.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                title: 'Quantified hiring outcomes',
                detail: 'Numbers tell the story faster than adjectives. Time-to-fill averages, requisition volume managed, offer acceptance rates, and cost-per-hire reductions are the metrics that validate impact. If you do not know your numbers, pulling them before your search begins is time well spent.',
              },
              {
                title: 'ATS and tooling specifics',
                detail: 'Name the systems you have used. Greenhouse, Lever, Workday, iCIMS, and similar platforms signal operational fluency. Listing AI sourcing tools like Findem, SeekOut, or LinkedIn Recruiter with context on how you used them is increasingly expected at the specialist level and above.',
              },
              {
                title: 'The scope of what you owned',
                detail: 'The difference between "supported recruiting" and "owned full-cycle recruiting for the engineering organization" is significant. Be explicit about what you were accountable for, not just what you participated in. Hiring managers want to see ownership, not collaboration on someone else\'s work.',
              },
              {
                title: 'Evidence of strategic work',
                detail: 'Anything beyond filling requisitions — building a sourcing strategy, launching an internship program, redesigning the interview process, developing an employer brand campaign — belongs on the resume with concrete outcomes attached. These are the items that differentiate mid-level candidates from one another.',
              },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Talent Acquisition Jobs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        
      </div>
    </>
  )
}