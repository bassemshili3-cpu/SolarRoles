import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase,
  DollarSign,
  CheckCircle,
  Users,
  GraduationCap,
  TrendingUp,
  Shield,
  Star,
  Building2,
  FileText,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Urgent: Chase Bank Jobs Available Now | Immediate Openings 2025',
  description:
    'Chase Bank is urgently hiring across the United States. Browse hundreds of immediate openings in banking, finance, customer service, and tech. Apply today and start your career at one of America\'s top employers.',
  keywords:
    'chase bank jobs, chase bank careers, JPMorgan Chase jobs, chase bank hiring, chase bank job openings, chase bank employment, chase bank positions, chase financial jobs',
  openGraph: {
    title: 'Immediate Openings at Chase Bank | Now Hiring Across the US',
    description:
      'Urgently hiring for Chase Bank positions nationwide. Roles in retail banking, wealth management, technology, and more. Competitive pay, full benefits. Apply now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chase Bank Jobs | Urgent Openings Available Now',
    description:
      'Chase Bank needs professionals now. Explore hundreds of open roles across the US and apply in minutes.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/chase-bank-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Chase Bank Jobs',
  description:
    'Browse current Chase Bank job openings across the United States. Positions in retail banking, finance, technology, and operations.',
  url: 'https://www.oh-my-job.com/chase-bank-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Chase Bank Jobs',
    description: 'Current job listings at JPMorgan Chase & Co. across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What types of jobs are available at Chase Bank?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chase Bank, a subsidiary of JPMorgan Chase & Co., offers a wide range of positions including retail banker, teller, branch manager, financial advisor, loan officer, software engineer, data analyst, compliance officer, and operations associate. Roles span across retail banking, commercial banking, investment banking, technology, and corporate functions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the hiring process at Chase Bank?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Chase Bank hiring process typically involves submitting an online application, a phone or video screening with a recruiter, one or more interviews with hiring managers, and a background check. For certain roles, candidates may complete assessments or case studies. The entire process can take between two and six weeks depending on the position.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the minimum qualifications to work at Chase Bank?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Minimum qualifications vary by role. Entry-level positions such as teller or retail banker typically require a high school diploma or GED and some customer service experience. Professional and management roles may require a bachelor\'s degree in finance, business, or a related field. Specialized positions in technology or compliance may require advanced degrees or certifications.',
      },
    },
    {
      '@type': 'Question',
      name: 'What benefits does Chase Bank offer its employees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'JPMorgan Chase offers a comprehensive benefits package including medical, dental, and vision insurance, a 401(k) with employer match, paid time off, parental leave, tuition reimbursement, employee banking benefits, wellness programs, and career development resources. Specific benefits vary by role, location, and employment status.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Chase Bank hire entry-level candidates with no banking experience?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Chase Bank regularly hires entry-level candidates for roles such as teller, customer service representative, and retail banker. These positions prioritize strong communication skills, reliability, and customer focus over prior banking experience. Chase also offers internship and apprenticeship programs for students and recent graduates through its formal talent programs.',
      },
    },
  ],
}

const jobCategories = [
  {
    title: 'Retail Banking',
    description: 'Teller, personal banker, and branch manager roles serving customers at Chase branches nationwide.',
    icon: Building2,
  },
  {
    title: 'Wealth & Investment Management',
    description: 'Financial advisor and private client banker roles helping clients grow and protect their assets.',
    icon: TrendingUp,
  },
  {
    title: 'Technology & Engineering',
    description: 'Software engineers, data scientists, cybersecurity analysts, and product managers driving digital banking.',
    icon: Shield,
  },
  {
    title: 'Operations & Support',
    description: 'Back-office, compliance, risk management, and administrative positions supporting Chase\'s global operations.',
    icon: Briefcase,
  },
  {
    title: 'Commercial & Corporate Banking',
    description: 'Relationship managers, credit analysts, and treasury associates working with business clients.',
    icon: DollarSign,
  },
  {
    title: 'Human Resources & Marketing',
    description: 'Corporate functions including recruiting, communications, brand management, and people operations.',
    icon: Users,
  },
]

const hiringSteps = [
  {
    step: 'Search & Apply Online',
    detail: 'Browse open positions and submit your application directly through the Chase careers portal or via aggregator sites like this one.',
  },
  {
    step: 'Recruiter Screening',
    detail: 'A Chase recruiter will review your profile and may reach out for a brief phone or video call to discuss your background and the role.',
  },
  {
    step: 'Interviews',
    detail: 'Expect one to three rounds of interviews, which may include behavioral questions, role-specific scenarios, or technical assessments depending on the position.',
  },
  {
    step: 'Background Check & Offer',
    detail: 'Upon a successful interview, Chase will conduct a background check before extending a formal offer. Offers typically include salary, benefits details, and a start date.',
  },
]

const salaryRanges = [
  { role: 'Bank Teller', range: '$17 – $22/hr' },
  { role: 'Personal Banker', range: '$45,000 – $65,000/yr' },
  { role: 'Branch Manager', range: '$75,000 – $110,000/yr' },
  { role: 'Financial Advisor', range: '$70,000 – $130,000/yr' },
  { role: 'Software Engineer', range: '$110,000 – $180,000/yr' },
  { role: 'Data Analyst', range: '$65,000 – $100,000/yr' },
]

const benefits = [
  'Medical, dental, and vision insurance',
  '401(k) plan with employer matching contributions',
  'Generous paid time off and holidays',
  'Paid parental and family leave',
  'Tuition reimbursement up to $5,250 per year',
  'Employee banking and home loan benefits',
  'Wellness programs and gym reimbursements',
  'Career development and mentorship programs',
]

const tips = [
  {
    title: 'Tailor Your Resume to the Role',
    description:
      'Highlight relevant skills such as customer service, cash handling, financial analysis, or technical expertise depending on the position you are targeting at Chase.',
  },
  {
    title: 'Research JPMorgan Chase Before Your Interview',
    description:
      'Familiarize yourself with Chase\'s core values, recent news, and business lines. Demonstrating genuine interest in the company is a key differentiator in competitive interviews.',
  },
  {
    title: 'Prepare for Behavioral Questions',
    description:
      'Chase recruiters often use the STAR method (Situation, Task, Action, Result) to evaluate candidates. Prepare concrete examples from your past experience that demonstrate problem solving, leadership, and client focus.',
  },
  {
    title: 'Leverage Chase\'s Talent Programs',
    description:
      'If you are a student or recent graduate, explore Chase\'s internship, analyst, and associate programs. These structured paths are designed to accelerate career development within JPMorgan Chase.',
  },
]

const faqs = [
  {
    question: 'What types of jobs are available at Chase Bank?',
    answer:
      'Chase Bank, a subsidiary of JPMorgan Chase & Co., offers a wide range of positions including retail banker, teller, branch manager, financial advisor, loan officer, software engineer, data analyst, compliance officer, and operations associate. Roles span across retail banking, commercial banking, investment banking, technology, and corporate functions.',
  },
  {
    question: 'What is the hiring process at Chase Bank?',
    answer:
      'The Chase Bank hiring process typically involves submitting an online application, a phone or video screening with a recruiter, one or more interviews with hiring managers, and a background check. For certain roles, candidates may complete assessments or case studies. The entire process can take between two and six weeks depending on the position.',
  },
  {
    question: 'What are the minimum qualifications to work at Chase Bank?',
    answer:
      'Minimum qualifications vary by role. Entry-level positions such as teller or retail banker typically require a high school diploma or GED and some customer service experience. Professional and management roles may require a bachelor\'s degree in finance, business, or a related field. Specialized positions in technology or compliance may require advanced degrees or certifications.',
  },
  {
    question: 'What benefits does Chase Bank offer its employees?',
    answer:
      'JPMorgan Chase offers a comprehensive benefits package including medical, dental, and vision insurance, a 401(k) with employer match, paid time off, parental leave, tuition reimbursement, employee banking benefits, wellness programs, and career development resources. Specific benefits vary by role, location, and employment status.',
  },
  {
    question: 'Does Chase Bank hire entry-level candidates with no banking experience?',
    answer:
      'Yes, Chase Bank regularly hires entry-level candidates for roles such as teller, customer service representative, and retail banker. These positions prioritize strong communication skills, reliability, and customer focus over prior banking experience. Chase also offers internship and apprenticeship programs for students and recent graduates through its formal talent programs.',
  },
]

export default async function ChaseBankJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'chase bank', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'chase bank', where: params.where || '', results_per_page: 30, page: 1 })
  .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Chase Bank Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="chase bank" />
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
                what={params.what || 'chase bank'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* About Chase as Employer */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">About Chase Bank as an Employer</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              Chase Bank is the consumer and commercial banking division of JPMorgan Chase & Co., one of the largest financial institutions in the world. According to the Fortune 500, JPMorgan Chase consistently ranks among the top employers in the United States, with over 300,000 employees globally and a presence in more than 100 markets.
            </p>
            <p className="text-gray-700 mb-4">
              With nearly 5,000 branches and 16,000 ATMs across the country, Chase operates one of the most expansive retail banking networks in the US. The company serves millions of consumers, small businesses, and large corporations, creating a continuous demand for talent across virtually every professional discipline.
            </p>
            <p className="text-gray-700">
              According to the U.S. Bureau of Labor Statistics, employment in the financial activities sector is projected to grow steadily through 2032, making institutions like Chase Bank a stable and attractive long-term career destination.
            </p>
          </div>
        </section>

        {/* Job Categories */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Roles Available at Chase Bank</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            JPMorgan Chase recruits across a broad spectrum of disciplines. Whether you are early in your career or an experienced professional, Chase offers roles that match a wide range of backgrounds and skill sets.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((cat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <cat.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{cat.title}</h3>
                <p className="text-gray-600 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Ranges */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Chase Bank Salary Ranges by Role</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Compensation at Chase Bank varies by position, location, and experience level. The following figures are representative estimates based on publicly available data from sources such as the U.S. Bureau of Labor Statistics Occupational Outlook Handbook and aggregated salary reports.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salaryRanges.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center border border-green-100">
                  <p className="text-xl font-bold text-green-600 mb-1">{item.range}</p>
                  <p className="text-sm text-gray-600">{item.role}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Salary figures are estimates and may vary based on location, experience, and internal leveling. Consult individual job postings for compensation details specific to each opening.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Star className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Employee Benefits at JPMorgan Chase</h2>
              <p className="text-gray-700 mb-6">
                JPMorgan Chase is known for offering a competitive and comprehensive benefits package to its employees. According to the company's publicly available careers documentation, full-time employees are eligible for a wide range of health, financial, and lifestyle benefits.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Hiring Process */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How the Chase Bank Hiring Process Works</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Understanding the recruitment process in advance can significantly improve your chances of success. Here is a general overview of what to expect when applying for a position at Chase Bank.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {hiringSteps.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.step}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qualifications Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Qualifications Chase Bank Looks For</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to publicly available job postings and Chase's official careers page, the company evaluates candidates across several dimensions depending on the role. While hard skills vary by department, certain core attributes are valued company-wide.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">For Entry-Level Positions</h3>
                <ul className="space-y-3 text-gray-600 text-sm">
                  {[
                    'High school diploma or equivalent (GED)',
                    'Strong customer service and communication skills',
                    'Ability to handle cash and numerical data accurately',
                    'Reliability and punctuality',
                    'Basic computer literacy',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">For Professional & Management Roles</h3>
                <ul className="space-y-3 text-gray-600 text-sm">
                  {[
                    "Bachelor's degree in finance, business, or a related field",
                    'Relevant industry certifications (Series 6, 7, 63, CFP, CFA, etc.)',
                    'Proven experience in banking, finance, or client-facing roles',
                    'Leadership and team management capabilities',
                    'Analytical and strategic thinking skills',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips to Land a Job at Chase Bank</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 font-bold rounded-full text-sm mb-4">
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Chase Bank Jobs</h2>
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
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10 space-y-4">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only. Salary figures, hiring processes, and qualification requirements may change at any time. Always refer to official job postings and JPMorgan Chase's careers portal for the most accurate and current information.
          </p>
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Affiliation notice:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or in any way officially connected to JPMorgan Chase & Co. or Chase Bank. All trademarks and brand names belong to their respective owners.
          </p>
        </section>
      </div>
    </>
  )
}