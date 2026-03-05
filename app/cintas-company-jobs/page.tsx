import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, TrendingUp, Users, Award, MapPin, FileText } from 'lucide-react'
import { getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Hiring Immediately: Cintas Company Jobs | Apply Today',
  description: 'Browse Cintas Company jobs hiring now across the United States. Route drivers, service sales reps, production associates and more. Competitive pay, full benefits, and real career growth. Apply in minutes and join one of America\'s most admired companies!',
  keywords: 'cintas company jobs, cintas jobs, cintas careers, cintas hiring, cintas route driver jobs, cintas service sales representative, cintas production associate, cintas job openings',
  openGraph: {
    title: 'Immediate Opening: Cintas Company Jobs Hiring Now | Oh My Job',
    description: 'Cintas is actively recruiting across the US. Route service, sales, production, and management roles available now. Great pay, benefits, and advancement. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Now Hiring: Cintas Company Jobs | Competitive Pay & Benefits',
    description: 'Find Cintas job openings near you. Hundreds of positions in route service, sales, and operations hiring immediately. Start your application now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/cintas-company-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Cintas Company Jobs',
  description: 'Find Cintas Company jobs hiring now across the United States. Browse route service, sales, production, and corporate positions.',
  url: 'https://www.oh-my-job.com/cintas-company-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Cintas Company Jobs',
    description: 'Current Cintas job listings with immediate hiring needs',
  },
}

const popularRoles = [
  {
    title: 'Route Service Representative',
    description: 'Deliver and service uniform and facility products on an assigned route. Build customer relationships and ensure satisfaction on every stop.',
  },
  {
    title: 'Service Sales Representative',
    description: 'Grow an existing customer base by upselling products and services. A blend of account management and field sales with uncapped commission potential.',
  },
  {
    title: 'Production Associate',
    description: 'Work in a Cintas facility processing, sorting, and preparing garments and products for delivery to customers across multiple industries.',
  },
  {
    title: 'Management Trainee',
    description: 'Cintas\'s flagship development program places college graduates on a rotational track across operations, sales, and service management.',
  },
  {
    title: 'First Aid & Safety Specialist',
    description: 'Service customers\' first aid cabinets, AEDs, and safety equipment. A growing division with strong demand driven by OSHA compliance needs.',
  },
  {
    title: 'Office & Administrative Roles',
    description: 'Support branch operations in customer service, billing, HR coordination, and logistics across Cintas locations nationwide.',
  },
]

const benefitsData = [
  { benefit: 'Medical, Dental & Vision', detail: 'Comprehensive health coverage available from day one for eligible employees' },
  { benefit: '401(k) with Company Match', detail: 'Retirement savings plan with employer contributions to help build long term financial security' },
  { benefit: 'Paid Time Off', detail: 'Vacation, sick leave, and paid holidays for full time employees' },
  { benefit: 'Profit Sharing', detail: 'Eligible employees share in company performance through annual profit sharing distributions' },
  { benefit: 'Tuition Reimbursement', detail: 'Financial support for continuing education aligned with career development goals' },
  { benefit: 'Employee Stock Ownership', detail: 'Cintas offers stock purchase plans that allow employees to become shareholders in the company' },
]

const companyFacts = [
  { label: 'Founded', value: '1968', detail: 'Headquartered in Cincinnati, Ohio' },
  { label: 'Employees', value: '40,000+', detail: 'Team partners across North America' },
  { label: 'Locations', value: '480+', detail: 'Facilities and branches across the US and Canada' },
  { label: 'Fortune 500', value: 'Top 500', detail: 'Consistently ranked among America\'s most admired companies' },
]

const workCulture = [
  {
    title: 'Promote From Within',
    description: 'Cintas has a strong tradition of internal advancement. A large share of senior leadership and branch management started in entry level route or production roles.',
  },
  {
    title: 'Training and Development',
    description: 'New hires receive structured onboarding and role specific training. The Management Trainee program is considered one of the best in the services industry.',
  },
  {
    title: 'Safety First Culture',
    description: 'According to Cintas corporate communications, workplace safety is a core operating principle. The company maintains rigorous safety standards across all facilities and routes.',
  },
  {
    title: 'Community Involvement',
    description: 'Cintas partners regularly participate in local community service initiatives, disaster relief efforts, and charitable programs through the Cintas Foundation.',
  },
]

const faqs = [
  {
    question: 'What types of jobs are available at Cintas?',
    answer: 'Cintas hires across a wide range of functions including route service, sales, production, first aid and safety services, fire protection, facility services, and corporate support roles such as IT, finance, and human resources. The company serves over one million businesses in North America, which drives consistent demand across all departments.',
  },
  {
    question: 'Does Cintas require experience for entry level positions?',
    answer: 'Many Cintas entry level roles, including production associate and route service representative, do not require prior industry experience. According to Cintas recruitment materials, the company provides comprehensive training programs for new hires. A valid driver\'s license is typically required for route positions.',
  },
  {
    question: 'What is the salary range for Cintas employees?',
    answer: 'Compensation at Cintas varies by role and location. According to publicly available labor market data and employee reports, route service representatives typically earn between $45,000 and $65,000 annually including bonuses, while service sales representatives can earn significantly more through commission. Production associates generally start near or above the local minimum wage with opportunities for merit increases.',
  },
  {
    question: 'How does the Cintas Management Trainee program work?',
    answer: 'The Cintas Management Trainee program is a structured rotational development program designed for recent college graduates. Trainees rotate through operations, route service, sales, and administrative functions over approximately 16 to 18 months, culminating in a management placement. The program is highly competitive and recruits nationally from four year universities.',
  },
  {
    question: 'Does Cintas offer remote work options?',
    answer: 'Most Cintas operational roles, including route service, production, and field sales, require on site or on route presence. However, certain corporate and support functions, particularly in IT, finance, and human resources, may offer hybrid or remote arrangements depending on the position and location.',
  },
  {
    question: 'What does the Cintas hiring process look like?',
    answer: 'The Cintas hiring process typically involves an online application, a phone screening with a recruiter, one or more in person or video interviews, and a background check and drug screen. Route and production roles often include a facility tour. The process can move quickly, with some candidates receiving offers within one to two weeks of applying.',
  },
]

const applicationTips = [
  {
    title: 'Tailor Your Resume to the Division',
    description: 'Cintas has multiple business divisions. Highlight logistics and customer service experience for route roles, and quota attainment metrics for sales positions. Generic resumes perform poorly in applicant tracking systems.',
  },
  {
    title: 'Research Cintas Business Lines',
    description: 'Understanding that Cintas operates across uniforms, facility services, first aid, fire protection, and document management shows genuine interest and helps you ask informed questions during interviews.',
  },
  {
    title: 'Emphasize Reliability and Work Ethic',
    description: 'Cintas culture places a premium on dependability, accountability, and customer focus. Be prepared to give concrete examples of showing up consistently and going above and beyond in past roles.',
  },
  {
    title: 'Apply to Multiple Locations',
    description: 'With over 480 facilities nationwide, Cintas often has openings at multiple branches in the same metro area. Applying to several nearby locations increases your chances of a faster response.',
  },
]

export default async function CintasCompanyJobsPage({ searchParams }: any) {
  const params = await searchParams

  const { count } = await getCachedJobCount(
    params.what || 'cintas company',
    params.where || '',
    params.salary_min
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Cintas Company Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="cintas company" />
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
                what={params.what || 'cintas company'}
                where={params.where || ''}
                salary_min={params.salary_min}
              />
            </Suspense>
          </div>
        </div>

        {/* Company Overview */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">About Cintas Corporation</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cintas Corporation is one of the largest providers of corporate identity uniforms, facility services, and safety supplies in North America. Founded in 1968 and headquartered in Cincinnati, Ohio, the company serves over one million businesses ranging from small local shops to Fortune 500 corporations. Cintas is consistently ranked among Fortune magazine's most admired companies and is a component of the S&P 500 index.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {companyFacts.map((fact, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow text-center">
                <p className="text-blue-600 text-2xl font-bold mb-1">{fact.value}</p>
                <p className="font-semibold text-gray-900 text-sm">{fact.label}</p>
                <p className="text-gray-500 text-xs mt-1">{fact.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Most In Demand Cintas Job Roles</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cintas recruits year round across multiple divisions. The roles below represent the highest volume hiring categories based on current labor market activity and publicly available Cintas recruitment data.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Briefcase className="w-10 h-10 text-indigo-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Cintas Employee Benefits</h2>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Cintas offers a competitive total compensation package to eligible employees. Benefits vary by employment status, role, and tenure, and are subject to plan terms. The following reflects commonly reported benefits across Cintas positions.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefitsData.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.benefit}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Salary */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Cintas Salary Ranges by Role</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-900 border-b border-gray-200">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-900 border-b border-gray-200">Typical Range</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-900 border-b border-gray-200">Pay Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Production Associate', '$30,000 to $40,000', 'Hourly'],
                  ['Route Service Representative', '$45,000 to $65,000', 'Hourly + Bonus'],
                  ['Service Sales Representative', '$55,000 to $90,000+', 'Base + Commission'],
                  ['First Aid & Safety Specialist', '$45,000 to $60,000', 'Hourly + Bonus'],
                  ['Management Trainee', '$50,000 to $60,000', 'Salary'],
                  ['Branch Manager', '$80,000 to $120,000+', 'Salary + Bonus'],
                ].map(([role, range, type], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-5 py-3 font-medium text-gray-900">{role}</td>
                    <td className="px-5 py-3 text-green-700 font-semibold">{range}</td>
                    <td className="px-5 py-3 text-gray-500">{type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Salary estimates are based on publicly available labor market data and employee reported figures. Actual compensation varies by location, experience, and role. Source: U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics and labor market aggregators, 2024.
          </p>
        </section>

        {/* Work Culture */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Users className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Working at Cintas: Culture and Values</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {workCulture.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Locations */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-rose-500" />
            <h2 className="text-2xl font-bold text-gray-900">Where Does Cintas Hire?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            With more than 480 facilities across the United States and Canada, Cintas has a presence in virtually every major metro area. The company hires in both dense urban markets and smaller cities where local businesses rely on uniform and facility services.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
              'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'Dallas, TX',
              'San Diego, CA', 'Jacksonville, FL', 'Austin, TX', 'Columbus, OH',
            ].map((city, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-center text-sm text-gray-700 hover:border-blue-300 transition-colors">
                {city}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            These represent a sample of active hiring markets. Use the job search above to find current openings near your location.
          </p>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Getting Hired at Cintas</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Cintas Jobs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
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
        <section className="mt-20 border-t border-gray-200 pt-10 space-y-3">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only. Salary ranges, benefits details, and hiring process descriptions are based on publicly available labor market data and do not constitute a guarantee of employment terms. Always verify current compensation and requirements directly with Cintas or the hiring employer before applying.
          </p>
          <p className="text-sm text-gray-500 max-w-4xl">
            Oh My Job is not affiliated with, endorsed by, or in any way officially connected to Cintas Corporation. All company names, trademarks, and logos are the property of their respective owners. Job listings displayed on this page are sourced from third party job board partners.
          </p>
        </section>

      </div>
    </>
  )
}