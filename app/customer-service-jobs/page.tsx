import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase,
  DollarSign,
  Star,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Shield,
  Clock,
  Award,
  TrendingUp,
  Headphones,
  Users,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Hiring Immediately: Customer Service Jobs | Apply Today',
  description:
    'Browse hundreds of customer service jobs hiring now near you. Full-time, part-time and remote openings at top companies. No degree required for many roles. Competitive pay and benefits. Apply in minutes!',
  keywords:
    'customer service jobs, customer service jobs near me, customer service representative jobs, remote customer service jobs, call center jobs, customer support jobs hiring now, entry level customer service jobs',
  openGraph: {
    title: 'Immediate Opening: Customer Service Jobs | Apply Now',
    description:
      'Find customer service jobs hiring immediately in your area and remotely. Entry-level to senior roles at leading companies. Great pay, benefits, and growth opportunities. Start your application today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgently Hiring: Customer Service Jobs | Find Yours Now',
    description:
      'Hundreds of customer service positions open right now. Remote and on-site options. No experience required for some roles. Apply today and get hired fast.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/customer-service-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Customer Service Jobs',
  description:
    'Find customer service jobs hiring near you. Browse hundreds of openings at call centers, retail companies, banks, tech firms, and more across the United States.',
  url: 'https://www.oh-my-job.com/customer-service-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Customer Service Jobs',
    description: 'Current customer service job listings across the United States',
  },
}

const customerServiceRoles = [
  {
    title: 'Customer Service Representative',
    description:
      'The most common entry point. Handle inbound inquiries, resolve issues, and assist customers via phone, email, or chat.',
    icon: Headphones,
  },
  {
    title: 'Call Center Agent',
    description:
      'Work in a dedicated call center environment, managing high volumes of inbound or outbound calls for a company or third-party client.',
    icon: Headphones,
  },
  {
    title: 'Remote Customer Support Specialist',
    description:
      'Provide customer assistance entirely from home. One of the fastest-growing job categories in the U.S., with flexible scheduling options.',
    icon: Briefcase,
  },
  {
    title: 'Technical Support Representative',
    description:
      'Help customers troubleshoot products or software. Often pays more than standard CSR roles and values technical aptitude over formal education.',
    icon: Award,
  },
  {
    title: 'Client Success Manager',
    description:
      'Focus on retaining and growing relationships with existing clients. A more senior role with higher compensation and business development responsibilities.',
    icon: TrendingUp,
  },
  {
    title: 'Retail Customer Service Associate',
    description:
      'Assist shoppers in-store, handle returns, manage complaints, and maintain a positive brand experience on the sales floor.',
    icon: Users,
  },
]

const keySkills = [
  {
    skill: 'Active Listening',
    detail:
      'Understanding what a customer truly needs, beyond what they say, is the foundation of effective service.',
  },
  {
    skill: 'Clear Communication',
    detail:
      'Both written and verbal clarity reduce misunderstandings, shorten resolution times, and improve customer satisfaction scores.',
  },
  {
    skill: 'Problem Solving',
    detail:
      'Employers look for candidates who can think on their feet and resolve issues without always escalating to a supervisor.',
  },
  {
    skill: 'Patience and Empathy',
    detail:
      'Handling frustrated or upset customers professionally is one of the most valued and tested competencies in any interview.',
  },
  {
    skill: 'CRM Software Proficiency',
    detail:
      'Familiarity with tools such as Salesforce, Zendesk, or HubSpot is increasingly expected, even at entry level.',
  },
  {
    skill: 'Multitasking',
    detail:
      'Managing simultaneous chats, open tickets, and phone calls without dropping quality is critical in high-volume environments.',
  },
]

const salaryData = [
  { label: 'Entry-Level Customer Service Rep', range: '$14 to $18/hr' },
  { label: 'Call Center Agent', range: '$15 to $20/hr' },
  { label: 'Remote Customer Support Specialist', range: '$16 to $22/hr' },
  { label: 'Technical Support Representative', range: '$18 to $28/hr' },
  { label: 'Client Success Manager', range: '$50,000 to $85,000/yr' },
  { label: 'Customer Service Team Lead', range: '$20 to $30/hr' },
]

const industryBreakdown = [
  {
    industry: 'Retail and E-Commerce',
    notes: 'Highest volume of openings. Amazon, Walmart, and Target are among the largest hirers nationwide.',
  },
  {
    industry: 'Banking and Financial Services',
    notes: 'Often requires a background check. Competitive pay and strong benefits packages are common.',
  },
  {
    industry: 'Healthcare',
    notes:
      'Patient service and insurance support roles are growing rapidly. HIPAA awareness is a plus.',
  },
  {
    industry: 'Technology and SaaS',
    notes:
      'Technical support and customer success roles pay above average. Product knowledge training is typically provided.',
  },
  {
    industry: 'Telecommunications',
    notes:
      'High call volume environments with strong onboarding programs and clear opportunities for advancement.',
  },
]

const remoteWorkFacts = [
  'According to the U.S. Bureau of Labor Statistics, business support and customer service occupations are among the top categories for remote and hybrid work arrangements.',
  'A significant share of customer service job postings now list remote or work-from-home as an option, particularly in tech, insurance, and e-commerce sectors.',
  'Remote customer service roles typically require a reliable internet connection, a quiet workspace, and a personal computer meeting minimum specifications.',
  'The Equal Employment Opportunity Commission (EEOC) clarifies that remote workers hold the same workplace rights as on-site employees, including protections against discrimination and the right to reasonable accommodations.',
]

const faqs = [
  {
    question: 'What qualifications do I need to get a customer service job?',
    answer:
      'Most entry-level customer service positions require only a high school diploma or GED. According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employers typically value communication skills, a positive attitude, and basic computer literacy above formal education. Some industries, such as financial services or healthcare, may require additional background checks or sector-specific knowledge.',
  },
  {
    question: 'Are customer service jobs available remotely?',
    answer:
      'Yes. Remote customer service roles have expanded significantly. The BLS notes that business support occupations, which include customer service, rank among the most common work-from-home job categories in the U.S. Many employers provide equipment and paid training entirely online, making these roles accessible regardless of geographic location.',
  },
  {
    question: 'What is the average salary for a customer service representative?',
    answer:
      'According to the U.S. Bureau of Labor Statistics, the median annual wage for customer service representatives was approximately $37,780 in May 2023. Salaries vary based on industry, location, and experience. Technical support and client success roles in the technology sector tend to pay considerably more, often exceeding $60,000 per year.',
  },
  {
    question: 'What is the job outlook for customer service roles?',
    answer:
      'The BLS projects a modest decline in traditional call-center-style customer service roles due to automation. However, demand for skilled customer-facing professionals in healthcare, technology, and financial services remains strong. Workers who combine service skills with technical knowledge or industry specialization are well-positioned in the current labor market.',
  },
  {
    question: 'Can customer service experience lead to career advancement?',
    answer:
      'Absolutely. Customer service is a recognized gateway into roles such as team lead, operations manager, account executive, and sales representative. Many Fortune 500 companies actively promote from within their customer service departments. Skills gained in these roles, including communication, conflict resolution, and product knowledge, are directly transferable across industries.',
  },
  {
    question: 'Do customer service employees have protected rights under federal law?',
    answer:
      'Yes. According to the U.S. Department of Labor, all employees including customer service workers are protected by the Fair Labor Standards Act (FLSA), which governs minimum wage, overtime pay, and recordkeeping. The Equal Employment Opportunity Commission (EEOC) also prohibits workplace discrimination based on race, color, religion, sex, national origin, age, disability, or genetic information.',
  },
]

const tips = [
  {
    title: 'Tailor Your Resume to the Role',
    description:
      'Highlight measurable outcomes where possible, such as customer satisfaction scores, resolution rates, or volume of calls handled. Generic resumes are less competitive in high-applicant pools.',
  },
  {
    title: 'Prepare for Scenario-Based Interview Questions',
    description:
      'Most customer service interviews include situational questions such as "Tell me about a time you handled a difficult customer" Prepare two or three specific examples using the STAR method (Situation, Task, Action, Result).',
  },
  {
    title: 'Get Familiar with Common CRM Tools',
    description:
      'Free online tutorials for Salesforce, Zendesk, and Freshdesk are widely available. Even basic familiarity with these platforms can set your application apart from others at the same experience level.',
  },
  {
    title: 'Consider Industry Certifications',
    description:
      'Programs such as the Customer Service Institute of America (CSIA) certification or HDI Customer Service Representative certification can strengthen your profile, particularly when targeting technical support or enterprise roles.',
  },
]

export default async function CustomerServiceJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'customer service', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'customer service', where: params.where || '', results_per_page: 30, page: 1 })
  .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
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
            Customer Service Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="customer service" />
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
                what={params.what || 'customer service'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Headphones className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Customer Service Jobs Available</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Customer service is one of the broadest employment categories in the United States. From entry-level call center roles to senior client success positions, the field offers opportunities across virtually every industry. Here is an overview of the most common types of customer service jobs you will find listed on this page.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerServiceRoles.map((role, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Customer Service Jobs Pay?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics (BLS), the median annual wage for customer service representatives was $37,780 in May 2023. Compensation varies widely depending on the industry, level of technical complexity, and whether the role is fully remote. The figures below reflect typical ranges observed across current U.S. job postings.
            </p>
            <div className="space-y-3">
              {salaryData.map((row, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded-xl px-5 py-4">
                  <span className="font-medium text-gray-800">{row.label}</span>
                  <span className="text-green-700 font-semibold text-sm">{row.range}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-5">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May 2023. Ranges are illustrative and vary by location, employer, and experience level.
            </p>
          </div>
        </section>

        {/* Key Skills */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Skills That Make You Stand Out as a Candidate</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, customer service representatives must possess strong communication and listening skills, be able to handle stressful situations calmly, and work well both under supervision and independently. The following competencies are consistently cited by employers in their job postings.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keySkills.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.skill}</p>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Industries Hiring */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Briefcase className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Industries Actively Hiring Customer Service Professionals</h2>
              <p className="text-gray-700 mb-6">
                Customer service roles exist across virtually every sector of the U.S. economy. According to the BLS, industries with the highest concentration of customer service workers include retail trade, insurance carriers, and business support services. The table below highlights key industries and what to expect when applying.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="text-left p-3 font-semibold text-gray-800 rounded-tl-lg">Industry</th>
                      <th className="text-left p-3 font-semibold text-gray-800 rounded-tr-lg">What to Expect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryBreakdown.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                        <td className="p-3 font-medium text-gray-900">{row.industry}</td>
                        <td className="p-3 text-gray-600">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS).
              </p>
            </div>
          </div>
        </section>

        {/* Remote Work Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Remote Customer Service Jobs: What You Need to Know</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Remote customer service positions are among the most accessible work-from-home opportunities in the U.S. labor market. Here is what current data and official sources say about working remotely in this field.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {remoteWorkFacts.map((fact, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-3 hover:shadow-md transition-shadow">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">{fact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Career Growth */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Can a Customer Service Job Take You?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Customer service is widely recognized as one of the most effective entry points into a professional career. Many of the skills developed in these roles, including negotiation, data entry, product expertise, and cross-functional collaboration, translate directly into higher-paying positions.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Team Lead or Supervisor', detail: 'Manage a group of CSRs, monitor performance metrics, and handle escalations.' },
              { title: 'Sales Representative', detail: 'Customer service experience is a recognized pipeline into inside and outside sales roles.' },
              { title: 'Operations Manager', detail: 'Oversee workflows, staffing, and service quality at a department or company level.' },
              { title: 'Account Manager', detail: 'Maintain and grow relationships with specific business accounts, typically with a higher salary ceiling.' },
            ].map((role, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-blue-700 mb-1">{role.title}</p>
                <p className="text-gray-600 text-sm">{role.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Getting Hired in Customer Service</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
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

        {/* Workers Rights Warning */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Know Your Rights as a Customer Service Worker</h2>
                <p className="text-gray-700 mb-4">
                  According to the U.S. Department of Labor and the Equal Employment Opportunity Commission (EEOC), all employees in the United States, including those in customer service roles, are protected by federal law. The following practices by employers are prohibited:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Paying below the applicable federal or state minimum wage',
                    'Denying overtime pay for hours worked over 40 per week (FLSA)',
                    'Discriminating in hiring or promotion based on race, sex, age, disability, or religion',
                    'Requiring unpaid off-the-clock work such as call wrap-up time',
                    'Misclassifying employees as independent contractors to avoid benefits',
                    'Retaliating against employees who file wage complaints with the DOL',
                    'Failing to provide legally required rest or meal breaks (varies by state)',
                    'Denying reasonable accommodations to employees with disabilities (ADA)',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Customer Service Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal or professional advice. Wage rates, labor laws, and remote work policies vary by state, employer, and role type. Always consult the U.S. Department of Labor at dol.gov, the Equal Employment Opportunity Commission at eeoc.gov, or your state labor department for the most current regulations applicable to your situation. Oh My Job is a job aggregation platform and is not responsible for the accuracy of individual job listings.
          </p>
        </section>
      </div>
    </>
  )
}