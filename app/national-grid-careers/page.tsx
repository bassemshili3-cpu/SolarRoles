import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, Clock, Users, TrendingUp, FileText, Award, Star, Zap } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Now Hiring: National Grid Careers | Urgent Need for Energy Professionals',
  description: 'National Grid is urgently hiring across the US! Explore 500+ career opportunities in electrical engineering, gas operations, field services, IT, and corporate roles. Competitive salaries, strong benefits, and union positions available. Apply today!',
  keywords: 'national grid careers, national grid jobs, national grid hiring, national grid employment, national grid engineer jobs, national grid lineman jobs, utility jobs national grid, national grid new york jobs',
  openGraph: {
    title: 'National Grid Careers | Urgently Hiring Energy Professionals Nationwide',
    description: 'Join National Grid today! Urgent openings for engineers, field technicians, gas operators, and corporate professionals. Excellent pay, union options, and career growth. Apply now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'National Grid Careers | Hiring Immediately',
    description: 'National Grid urgently needs energy professionals. Find engineering, operations, field service, and corporate roles. Strong salaries and benefits. Apply today!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/national-grid-careers',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'National Grid Careers and Jobs',
  description: 'Explore current National Grid career opportunities including engineering, field operations, gas services, IT, and corporate roles across New York, Massachusetts, and Rhode Island.',
  url: 'https://www.oh-my-job.com/national-grid-careers',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available National Grid Career Opportunities',
    description: 'Current job listings at National Grid across all departments and US locations',
  },
}

const careerPaths = [
  {
    title: 'Electrical Engineering',
    description: 'Design, maintain, and improve high voltage transmission and distribution infrastructure across the grid',
    icon: Zap,
  },
  {
    title: 'Gas Operations',
    description: 'Operate and maintain natural gas pipelines, pressure systems, and distribution networks safely and efficiently',
    icon: Shield,
  },
  {
    title: 'Field Service Technician',
    description: 'Install, inspect, and repair electrical and gas equipment at residential, commercial, and industrial sites',
    icon: Briefcase,
  },
  {
    title: 'IT and Digital Solutions',
    description: 'Build and support the technology platforms that power smart grid operations, data analytics, and cybersecurity',
    icon: Star,
  },
  {
    title: 'Corporate and Finance',
    description: 'Drive strategic planning, regulatory compliance, finance, HR, and communications across the organization',
    icon: TrendingUp,
  },
  {
    title: 'Environmental and Sustainability',
    description: 'Lead clean energy transition initiatives, environmental compliance, and carbon reduction programs',
    icon: CheckCircle,
  },
]

const benefitsEmployee = [
  { benefit: 'Competitive Base Salary', detail: 'Pay aligned with utility industry benchmarks and local cost of living' },
  { benefit: 'Comprehensive Health Coverage', detail: 'Medical, dental, and vision insurance for employees and dependents' },
  { benefit: 'Pension and Retirement Plans', detail: 'Defined benefit pension and 401k options with company contributions' },
  { benefit: 'Union Representation', detail: 'Many field and operations roles are represented by IBEW or other unions' },
  { benefit: 'Paid Time Off', detail: 'Generous vacation, sick leave, and paid holidays' },
  { benefit: 'Tuition Reimbursement', detail: 'Support for continuing education and professional development' },
  { benefit: 'Parental Leave', detail: 'Paid leave for new parents including adoption and foster care' },
  { benefit: 'Employee Assistance Program', detail: 'Mental health, financial counseling, and wellness resources' },
]

const salaryData = [
  { role: 'Electrical Engineer', low: '$75,000', high: '$120,000', median: '$95,000' },
  { role: 'Gas Technician', low: '$55,000', high: '$90,000', median: '$70,000' },
  { role: 'Field Service Technician', low: '$50,000', high: '$85,000', median: '$65,000' },
  { role: 'IT / Cybersecurity Analyst', low: '$80,000', high: '$130,000', median: '$100,000' },
  { role: 'Project Manager', low: '$85,000', high: '$140,000', median: '$110,000' },
  { role: 'Environmental Specialist', low: '$60,000', high: '$100,000', median: '$78,000' },
]

const hiringSteps = [
  {
    step: '1',
    title: 'Online Application',
    desc: 'Submit your resume and complete the application form on the National Grid careers portal',
  },
  {
    step: '2',
    title: 'Recruiter Screen',
    desc: 'A talent acquisition specialist reviews your profile and conducts a brief phone or video screening',
  },
  {
    step: '3',
    title: 'Technical or Behavioral Interview',
    desc: 'Role specific interview with the hiring manager and potentially a panel of team members',
  },
  {
    step: '4',
    title: 'Assessment or Background Check',
    desc: 'Some roles include a skills assessment, drug screening, or background verification',
  },
  {
    step: '5',
    title: 'Offer and Onboarding',
    desc: 'Receive your offer letter and complete pre employment steps before your start date',
  },
]

const energyContext = [
  {
    stat: '20 Million+',
    label: 'Customers Served',
    desc: 'National Grid serves over 20 million electricity and gas customers across New York, Massachusetts, and Rhode Island',
  },
  {
    stat: '$40 Billion+',
    label: 'Infrastructure Investment',
    desc: 'The company has committed to multi billion dollar capital investment in grid modernization and clean energy over the next decade',
  },
  {
    stat: '100% Clean',
    label: 'Net Zero Target',
    desc: 'National Grid has pledged to achieve net zero carbon emissions by 2050, driving strong demand for sustainability and engineering talent',
  },
]

const faqs = [
  {
    question: 'What types of jobs does National Grid offer?',
    answer: 'National Grid offers a broad range of positions across its US operations, including electrical and gas engineering, field service technician roles, IT and cybersecurity, project management, environmental compliance, finance, HR, and corporate strategy. Both union and non union positions are available across their New York, Massachusetts, and Rhode Island service territories.',
  },
  {
    question: 'Where does National Grid operate in the United States?',
    answer: 'According to publicly available information, National Grid operates in three US states: New York, Massachusetts, and Rhode Island. The company serves as a major electricity and gas distribution provider in these regions. Its US headquarters is located in Waltham, Massachusetts, with significant operations in Brooklyn and other parts of New York.',
  },
  {
    question: 'Are National Grid jobs unionized?',
    answer: 'Many field, technical, and operations roles at National Grid are represented by labor unions, including the International Brotherhood of Electrical Workers (IBEW) and the Utility Workers Union of America (UWUA). Union positions typically come with collectively bargained wages, benefits, and job protections. Non union positions are also available in corporate, managerial, and specialized technical functions.',
  },
  {
    question: 'What qualifications are needed for engineering roles at National Grid?',
    answer: 'Engineering positions at National Grid typically require a bachelor\'s degree in electrical engineering, mechanical engineering, or a related discipline. Professional Engineer (PE) licensure is preferred or required for senior roles. According to the U.S. Bureau of Labor Statistics, electrical engineers in the utilities sector are among the best compensated in the profession, reflecting the specialized nature of power grid work.',
  },
  {
    question: 'Does National Grid offer internships or early career programs?',
    answer: 'National Grid offers internship, co op, and graduate development programs designed to bring early career talent into the utility sector. These programs provide hands on experience in engineering, operations, IT, and business functions. Many participants are offered full time positions upon completion, making them a strong pathway into a long term National Grid career.',
  },
  {
    question: 'How long does the National Grid hiring process take?',
    answer: 'The timeline varies by role and department. For most positions, candidates can expect the process from application to offer to take between two and six weeks. Field and union roles may involve additional steps such as aptitude testing or union eligibility verification. Applicants are encouraged to apply early as demand for qualified utility professionals remains high.',
  },
]

const applicationTips = [
  {
    title: 'Tailor Your Resume to the Utility Sector',
    description: 'Highlight any experience with electrical systems, gas infrastructure, SCADA platforms, power distribution, or energy regulation. Even adjacent experience in construction, HVAC, or industrial maintenance is valued by National Grid recruiters.',
  },
  {
    title: 'Obtain Relevant Certifications',
    description: 'Credentials such as a Professional Engineer (PE) license, OSHA 30 certification, or industry specific training from programs recognized by the Department of Energy can significantly strengthen your application for technical and field roles.',
  },
  {
    title: 'Research National Grid\'s Clean Energy Strategy',
    description: 'National Grid has publicly committed to ambitious net zero and grid modernization goals. Demonstrating knowledge of these initiatives and how your skills support the clean energy transition shows genuine alignment with the company\'s direction.',
  },
  {
    title: 'Prepare for Competency Based Interviews',
    description: 'National Grid typically uses structured behavioral interviews. Prepare examples using the STAR method (Situation, Task, Action, Result) that demonstrate safety awareness, teamwork, problem solving, and customer focus.',
  },
]

export default async function NationalGridCareersPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'national Grid', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'national Grid', where: params.where || '', results_per_page: 30, page: 1 })
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
            National Grid Careers and Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="national grid" />
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
                what={params.what || 'national grid'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Career Paths */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Paths at National Grid</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            National Grid offers careers that sit at the intersection of critical infrastructure and the clean energy transition. According to the U.S. Department of Energy, the electric power sector is projected to require hundreds of thousands of additional skilled workers over the next decade to support grid modernization and decarbonization efforts, making utility employers like National Grid among the most stable and in demand in the country.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerPaths.map((career, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <career.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{career.title}</h3>
                <p className="text-gray-600 text-sm">{career.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Energy Sector Context */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Why National Grid Careers Matter</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Department of Energy's workforce reports, the utility sector faces a significant talent gap as experienced workers retire and infrastructure investment accelerates. National Grid's scale and long term commitments make it one of the most consequential employers in the US energy landscape.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {energyContext.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-blue-600 mb-2">{item.stat}</p>
                <p className="font-semibold text-gray-900 mb-2">{item.label}</p>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Data */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">National Grid Salaries by Role</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, utility sector employees are among the highest paid workers in both technical and operations fields. The following figures reflect approximate compensation ranges for common National Grid career areas based on BLS data and industry benchmarks.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Role</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">Low End</th>
                  <th className="text-center px-6 py-4 font-semibold text-green-700">Median</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">High End</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.role}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.low}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{row.median}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate annual salary ranges and may vary by location, experience, and union agreement.
          </p>
        </section>

        {/* Employee Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Benefits of Working at National Grid</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            National Grid is recognized as a major employer in the US utility sector, offering a comprehensive total rewards package designed to attract and retain skilled professionals in a competitive market. Benefits typically include a combination of the following for eligible employees.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {benefitsEmployee.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-0.5">{item.benefit}</p>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hiring Process */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">The National Grid Hiring Process</h2>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-8">
              Understanding the hiring process helps you prepare and move through each stage with confidence. Here is a general overview of what to expect when applying to National Grid positions.
            </p>
            <div className="grid md:grid-cols-5 gap-4">
              {hiringSteps.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Applying to National Grid Careers</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-rose-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 text-rose-700 font-bold rounded-full text-sm mb-4">
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
            <Users className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About National Grid Careers</h2>
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

        {/* Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl mb-4">
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or sponsored by National Grid plc or any of its subsidiaries. All company names, logos, and trademarks are the property of their respective owners. The information provided on this page is for general informational purposes only and is based on publicly available sources. Salary data is sourced from the U.S. Bureau of Labor Statistics and may not reflect actual National Grid compensation. For the most current and accurate information about National Grid careers, please visit the official National Grid careers website.
          </p>
          <p className="text-sm text-gray-500 max-w-4xl">
            Job listings displayed on this page are aggregated from third party sources and may include positions from National Grid as well as related opportunities from other employers in the utility and energy sector. Always verify job details and requirements directly with the employer before applying.
          </p>
        </section>
      </div>
    </>
  )
}