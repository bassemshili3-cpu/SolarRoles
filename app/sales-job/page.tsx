import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import {
  Briefcase,
  DollarSign,
  CheckCircle,
  Shield,
  TrendingUp,
  Star,
  Users,
  FileText,
  GraduationCap,
  BarChart2,
} from 'lucide-react'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Sales Jobs | Inside, Outside & B2B Sales Openings',
  description:
    'Inside, outside, and B2B roles with uncapped commissions alongside a base salary. Territory and quota expectations vary by employer.',
  keywords:
    'sales jobs, sales job openings, sales careers, sales representative jobs, inside sales jobs, outside sales jobs, sales jobs near me, sales hiring, B2B sales jobs',
  openGraph: {
    title: 'Sales Jobs | Uncapped Commission & Remote Options',
    description:
      'Immediate sales job openings in every industry. Base salary plus commission, remote options, and fast career progression. Top earners make $100K+. Apply now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sales Jobs | Top Earners Make $100K+ in Sales',
    description:
      'Sales roles are open right now across the US. Competitive pay, uncapped commissions, and growth opportunities. Find your next sales job and apply today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/sales-job',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Sales Jobs',
  description:
    'Browse current sales job openings across the United States. Inside sales, outside sales, account executive, and business development roles available now.',
  url: 'https://www.oh-my-job.com/sales-job',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Sales Jobs',
    description: 'Current sales job listings across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the job outlook for sales professionals in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to the U.S. Bureau of Labor Statistics, employment of sales representatives in wholesale and manufacturing is projected to remain stable, with over 1.8 million workers employed in the field nationally. Across all sales occupations, the BLS reports that demand is driven by continued business expansion, e-commerce growth, and the need for companies to generate revenue in competitive markets.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the average salary for a sales job in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, the median annual wage for sales representatives in wholesale and manufacturing was $65,420. However, total compensation in sales varies significantly based on commission structures. Top performers in technology, pharmaceutical, and financial services sales can earn well over $100,000 per year in total compensation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do sales jobs require a college degree?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Requirements vary by industry and employer. Many entry-level sales roles do not require a college degree, prioritizing strong communication skills, drive, and coachability over formal education. Technical sales roles in fields such as medical devices, software, or engineering often prefer candidates with a relevant bachelor\'s degree. According to BLS data, sales representatives in technical fields are more likely to hold a four-year degree than those in retail or general sales.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between inside sales and outside sales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Inside sales professionals work primarily from an office or remotely, engaging prospects via phone, email, and video calls. Outside sales representatives meet clients in person, traveling to prospects or client sites. According to industry research, inside sales roles have grown substantially in recent years due to advances in sales technology and a shift toward remote buying processes, particularly in B2B markets.',
      },
    },
    {
      '@type': 'Question',
      name: 'What skills do employers look for in sales job candidates?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Employers consistently prioritize communication and persuasion skills, resilience and persistence, active listening, time management, and the ability to learn product or industry knowledge quickly. CRM proficiency, particularly Salesforce or HubSpot, is increasingly listed as a required or preferred skill in sales job postings across all industries.',
      },
    },
  ],
}

const salesRoles = [
  {
    title: 'Sales Development Representative',
    description: 'Entry-level role focused on prospecting, qualifying leads, and booking meetings for account executives. A common starting point in tech and B2B sales.',
    icon: TrendingUp,
  },
  {
    title: 'Account Executive',
    description: 'Manages the full sales cycle from outreach to close. Responsible for hitting quota and building long-term client relationships.',
    icon: Briefcase,
  },
  {
    title: 'Account Manager',
    description: 'Focuses on retaining and growing existing accounts through upsells, renewals, and relationship management.',
    icon: Users,
  },
  {
    title: 'Outside Sales Representative',
    description: 'Meets clients in person, manages a geographic territory, and builds relationships through face-to-face engagement.',
    icon: Star,
  },
  {
    title: 'Sales Manager',
    description: 'Leads a team of sales reps, sets quotas, coaches performance, and reports on pipeline activity to senior leadership.',
    icon: BarChart2,
  },
  {
    title: 'Business Development Manager',
    description: 'Identifies new market opportunities, builds strategic partnerships, and drives revenue growth beyond the existing customer base.',
    icon: GraduationCap,
  },
]

const salaryData = [
  { role: 'Sales Development Rep (SDR)', range: '$45,000 – $65,000/yr' },
  { role: 'Account Executive', range: '$65,000 – $120,000/yr' },
  { role: 'Account Manager', range: '$60,000 – $95,000/yr' },
  { role: 'Outside Sales Rep', range: '$55,000 – $100,000/yr' },
  { role: 'Sales Manager', range: '$85,000 – $140,000/yr' },
  { role: 'Enterprise / Tech Sales', range: '$100,000 – $200,000+/yr' },
]

const topIndustries = [
  {
    name: 'Technology and SaaS',
    detail: 'One of the highest-paying sectors for sales. Software companies offer strong base salaries, uncapped commissions, and equity packages for top performers.',
  },
  {
    name: 'Healthcare and Medical Devices',
    detail: 'Medical device and pharmaceutical sales roles require industry knowledge but offer strong compensation, company cars, and stable long-term demand.',
  },
  {
    name: 'Financial Services',
    detail: 'Insurance, investment, and banking sales roles offer performance-based earnings with strong institutional training programs.',
  },
  {
    name: 'Real Estate',
    detail: 'Commission-driven with high earning potential. According to the National Association of Realtors, the US has over 1.5 million licensed real estate agents.',
  },
  {
    name: 'Retail and Consumer Goods',
    detail: 'Entry-level sales roles are widely available in retail with clear advancement paths into buyer, category manager, or regional sales roles.',
  },
  {
    name: 'Manufacturing and Distribution',
    detail: 'According to BLS data, wholesale and manufacturing sales employs over 1.8 million workers nationally, offering steady demand and travel-based roles.',
  },
]

const crmTools = [
  { tool: 'Salesforce', detail: 'The most widely used CRM globally. Proficiency is listed in a majority of B2B sales job postings.' },
  { tool: 'HubSpot', detail: 'Popular in SMB and startup environments. Widely used for inbound sales and marketing alignment.' },
  { tool: 'LinkedIn Sales Navigator', detail: 'Standard tool for B2B prospecting and social selling, especially in SDR and AE roles.' },
  { tool: 'Outreach / Salesloft', detail: 'Sales engagement platforms used to manage cadences, calls, and email sequences at scale.' },
]

const tips = [
  {
    title: 'Quantify Your Results on Your Resume',
    description:
      'Sales is a results-driven field. Hiring managers respond to specific metrics: quota attainment percentage, revenue generated, number of deals closed, or average deal size. Replace vague descriptions with hard numbers wherever possible.',
  },
  {
    title: 'Learn at Least One Major CRM',
    description:
      'Salesforce proficiency is listed in the majority of B2B sales job postings. Completing free Salesforce Trailhead modules or a HubSpot Sales certification before interviews demonstrates initiative and technical readiness.',
  },
  {
    title: 'Target Industries with High Earning Potential',
    description:
      'Technology, medical devices, and financial services offer the highest total compensation in sales. If you have transferable skills, pursuing these sectors early significantly increases your long-term earning trajectory.',
  },
  {
    title: 'Prepare a Strong 30-60-90 Day Plan',
    description:
      'Many sales hiring managers ask candidates how they would approach the first 90 days. A well-structured ramp plan covering learning, prospecting, and pipeline building demonstrates strategic thinking and genuine commitment to the role.',
  },
]

const faqs = [
  {
    question: 'What is the job outlook for sales professionals in the United States?',
    answer:
      'According to the U.S. Bureau of Labor Statistics, employment of sales representatives in wholesale and manufacturing is projected to remain stable, with over 1.8 million workers employed in the field nationally. Across all sales occupations, the BLS reports that demand is driven by continued business expansion, e-commerce growth, and the need for companies to generate revenue in competitive markets.',
  },
  {
    question: 'What is the average salary for a sales job in the United States?',
    answer:
      'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, the median annual wage for sales representatives in wholesale and manufacturing was $65,420. However, total compensation in sales varies significantly based on commission structures. Top performers in technology, pharmaceutical, and financial services sales can earn well over $100,000 per year in total compensation.',
  },
  {
    question: 'Do sales jobs require a college degree?',
    answer:
      'Requirements vary by industry and employer. Many entry-level sales roles do not require a college degree, prioritizing strong communication skills, drive, and coachability over formal education. Technical sales roles in fields such as medical devices, software, or engineering often prefer candidates with a relevant bachelor\'s degree. According to BLS data, sales representatives in technical fields are more likely to hold a four-year degree than those in retail or general sales.',
  },
  {
    question: 'What is the difference between inside sales and outside sales?',
    answer:
      'Inside sales professionals work primarily from an office or remotely, engaging prospects via phone, email, and video calls. Outside sales representatives meet clients in person, traveling to prospects or client sites. According to industry research, inside sales roles have grown substantially in recent years due to advances in sales technology and a shift toward remote buying processes, particularly in B2B markets.',
  },
  {
    question: 'What skills do employers look for in sales job candidates?',
    answer:
      'Employers consistently prioritize communication and persuasion skills, resilience and persistence, active listening, time management, and the ability to learn product or industry knowledge quickly. CRM proficiency, particularly Salesforce or HubSpot, is increasingly listed as a required or preferred skill in sales job postings across all industries.',
  },
]

export default async function SalesJobPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'sales', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'sales', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Sales Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="sales" />
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
                what={params.what || 'sales'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Market Overview */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why Sales Jobs Are in High Demand Across the US</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              According to the U.S. Bureau of Labor Statistics, sales and related occupations employ over 14 million Americans, making it one of the largest occupational groups in the country. Every business that generates revenue relies on sales professionals, creating structural and permanent demand across virtually every industry and market segment.
            </p>
            <p className="text-gray-700 mb-4">
              The shift toward subscription-based business models, the growth of SaaS companies, and expanding e-commerce channels have all accelerated demand for skilled sales talent. Companies are actively competing for professionals who can prospect effectively, manage complex sales cycles, and build long-term client relationships.
            </p>
            <p className="text-gray-700">
              Sales is also one of the few career paths where performance directly determines income, with no ceiling on earnings for top performers. Whether you are entering the workforce or advancing your career, the current market offers immediate opportunities with strong compensation potential.
            </p>
          </div>
        </section>

        {/* Sales Role Types */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Sales Jobs Available Right Now</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Sales careers span a wide range of roles, seniority levels, and industries. The following positions represent the most commonly available titles across US job postings.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salesRoles.map((role, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Sales Job Salary Ranges in the United States</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, the median annual wage for sales representatives in wholesale and manufacturing was $65,420. Total on-target earnings (OTE) in sales roles are typically higher, as commission and bonuses are added on top of a base salary. The figures below represent estimated total compensation ranges by role type.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salaryData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center border border-green-100">
                  <p className="text-xl font-bold text-green-600 mb-1">{item.range}</p>
                  <p className="text-sm text-gray-600">{item.role}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Total compensation includes base salary plus commissions and bonuses. Figures vary by industry, company size, and individual performance. Source: U.S. Bureau of Labor Statistics and aggregated market data.
            </p>
          </div>
        </section>

        {/* Top Industries */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <BarChart2 className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Industries Hiring Sales Professionals</h2>
              <p className="text-gray-700 mb-6">
                Sales jobs exist in every sector, but certain industries offer particularly strong compensation, stability, and career growth. According to U.S. Bureau of Labor Statistics data, the following fields account for a large share of total sales employment and consistently post the highest volumes of open roles.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {topIndustries.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CRM Tools */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Sales Tools Employers Expect You to Know</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Modern sales roles increasingly require proficiency with CRM and sales engagement platforms. Familiarity with the tools below will strengthen your application and reduce your ramp time in a new role.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {crmTools.map((item, index) => (
                <div key={index} className="flex items-start gap-3 border border-gray-200 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.tool}</p>
                    <p className="text-gray-600 text-sm mt-1">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips to Land a Sales Job and Accelerate Your Career</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
              >
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Sales Jobs</h2>
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
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only. Salary figures, job market projections, and qualification requirements may vary by employer, industry, and location. Always consult the U.S. Bureau of Labor Statistics at bls.gov and individual job postings for the most current and applicable information.
          </p>
        </section>
      </div>
    </>
  )
}