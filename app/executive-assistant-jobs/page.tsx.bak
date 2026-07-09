import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users, TrendingUp } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Executive Assistant Jobs | EA Roles Supporting C-Suite',
  description: 'C-suite support roles with remote, hybrid, and in-office options. Salary ranges and travel expectations described for each opportunity.',
  keywords: 'executive assistant jobs, executive assistant careers, executive assistant hiring now, administrative assistant jobs, high paying executive assistant jobs, executive support roles',
  openGraph: {
    title: 'Executive Assistant Jobs | 5,000+ EA Positions Open',
    description: 'Explore 5,000+ executive assistant positions available right now in the US. Top companies actively hiring. Competitive salaries and immediate start dates. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Executive Assistant Jobs | High-Paying EA Opportunities',
    description: 'Ready to support executives? Thousands of executive assistant jobs available immediately. High salaries and flexible opportunities. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/executive-assistant-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Executive Assistant Jobs',
  description: 'Find urgent executive assistant jobs hiring now across the United States. Browse high-level administrative support positions with immediate openings.',
  url: 'https://www.oh-my-job.com/executive-assistant-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Executive Assistant Jobs',
    description: 'Current executive assistant job listings with immediate hiring needs',
  },
}

const keyResponsibilities = [
  { title: 'Calendar Management', description: 'Schedule meetings, coordinate travel, and manage executive calendars efficiently' },
  { title: 'Correspondence & Communication', description: 'Draft emails, prepare reports, and handle confidential communications' },
  { title: 'Meeting Coordination', description: 'Organize board meetings, conferences, and events from start to finish' },
  { title: 'Research & Reporting', description: 'Conduct research, compile data, and prepare presentations for executives' },
  { title: 'Office Administration', description: 'Manage office supplies, vendor relations, and day-to-day operations' },
  { title: 'Project Support', description: 'Assist with special projects and ensure deadlines are met' },
]

const jobOutlookData = [
  { fact: 'Annual Openings', value: '358,300', details: 'Projected each year on average' },
  { fact: 'Current Employment', value: '3.45 million', details: 'Secretaries and administrative assistants nationwide' },
  { fact: 'Executive Roles', value: 'Hundreds of thousands', details: 'Require several years of experience' },
]

const salaryData = [
  { role: 'Executive Assistants', salary: '$73,680', note: 'Mean annual wage (2023 data)' },
  { role: 'General Administrative Assistants', salary: '$47,460', note: 'Median annual wage (May 2024)' },
]

const faqs = [
  {
    question: 'Do I need a degree for executive assistant jobs?',
    answer: 'According to the U.S. Bureau of Labor Statistics, most executive assistant positions require only a high school diploma or equivalent. However, many employers prefer candidates with an associate or bachelor\'s degree in business administration or a related field, plus several years of administrative experience.',
  },
  {
    question: 'What is the average salary for executive assistant jobs?',
    answer: 'The U.S. Bureau of Labor Statistics reports a mean annual wage of $73,680 for executive secretaries and executive administrative assistants as of May 2023. Salaries vary by location, industry, and experience, with top earners in professional services and technology often exceeding $100,000.',
  },
  {
    question: 'What skills are most important for executive assistants?',
    answer: 'The Bureau of Labor Statistics highlights strong organizational skills, communication, attention to detail, and proficiency with office software. Executive-level roles also require discretion with confidential information and the ability to manage multiple priorities under pressure.',
  },
  {
    question: 'Are executive assistant jobs available remotely?',
    answer: 'Yes. Many companies now offer fully remote or hybrid executive assistant positions. According to recent labor market data from the U.S. Department of Labor, remote administrative roles have grown significantly since 2020, especially in technology and professional services industries.',
  },
  {
    question: 'How do I stand out when applying for executive assistant jobs?',
    answer: 'The U.S. Bureau of Labor Statistics notes that employers value candidates with proven experience supporting C-level executives. Highlight software proficiency (Microsoft Office 365, Google Workspace), project management skills, and any certifications such as Certified Administrative Professional (CAP).',
  },
]

const applicationTips = [
  {
    title: 'Tailor Your Resume to the Role',
    description: 'Use exact keywords from the job description such as “calendar management”, “C-level support”, and “confidential correspondence” to pass applicant tracking systems.',
  },
  {
    title: 'Build a Professional Portfolio',
    description: 'Create a simple one-page website or PDF portfolio showcasing past projects, event coordination, and efficiency improvements you delivered for previous executives.',
  },
  {
    title: 'Network on LinkedIn',
    description: 'Connect with executive assistants and hiring managers at target companies. Many executive assistant roles are filled through referrals before they are publicly posted.',
  },
  {
    title: 'Prepare for Behavioral Interviews',
    description: 'Practice stories demonstrating discretion, multitasking, and problem-solving. Employers often ask how you have supported executives during high-pressure situations.',
  },
]

interface PageProps {
  searchParams: Promise<{
    what?: string
    where?: string
    salary_min?: string   // ← Correction : toujours string (ou undefined) dans Next.js
  }>
}

export default async function ExecutiveAssistantJobsPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Conversion sécurisée pour getCachedJobCount (qui attend un number)
  const salaryMinNumber = params.salary_min 
    ? parseInt(params.salary_min, 10) 
    : undefined

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'executive assistant', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'executive assistant', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Executive Assistant Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="executive assistant" />
          </aside>
          <div className="flex-1">

            {/* Count */}

            {/* AI Matcher */}
            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'executive assistant'}
                where={params.where || ''}
                salary_min={params.salary_min}   // ← reste en string (comme attendu par le composant)
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Executive Assistant Job Outlook</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, overall employment of secretaries and administrative assistants is projected to show little or no change from 2024 to 2034. However, about 358,300 openings are expected each year on average due to workers retiring or changing occupations.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {jobOutlookData.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.fact}</p>
                <p className="text-emerald-600 text-2xl font-medium">{item.value}</p>
                <p className="text-gray-600 text-sm mt-2">{item.details}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Secretaries and Administrative Assistants, updated August 2025
          </p>
        </section>

        {/* Key Responsibilities Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Executive Assistants Do</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, executive assistants provide high-level administrative support. They conduct research, prepare reports, handle information requests, and perform routine administrative functions such as preparing correspondence, receiving visitors, arranging conference calls, and scheduling meetings.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyResponsibilities.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Briefcase className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Information Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Executive Assistant Salaries</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The U.S. Bureau of Labor Statistics reports strong earning potential for experienced executive assistants, especially those supporting C-level executives in competitive industries.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {salaryData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">{item.salary}</p>
                  <p className="font-semibold text-gray-900">{item.role}</p>
                  <p className="text-sm text-gray-600">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023 & May 2024 data
            </p>
          </div>
        </section>

        {/* Qualifications Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements for Executive Assistant Jobs</h2>
              <p className="text-gray-700 mb-4">
                According to the U.S. Bureau of Labor Statistics, most positions require a high school diploma. Executive secretaries and executive administrative assistants typically need several years of related work experience. Strong computer skills and knowledge of office software are essential.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Typical Requirements</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>High school diploma or equivalent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Several years of administrative experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Proficiency in Microsoft Office and Google Workspace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Excellent communication and organizational skills</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Valuable Certifications</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Certified Administrative Professional (CAP)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Microsoft Office Specialist (MOS)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Project Management Professional (PMP)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Executive Assistant Jobs</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Executive Assistant Jobs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* General Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics. Job market conditions, salaries, and requirements can vary by location and employer. Always verify the latest details directly on bls.gov or with the specific employer before applying.
          </p>
        </section>
      </div>
    </>
  )
}