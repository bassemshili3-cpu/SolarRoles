import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, Clock, Users, TrendingUp, FileText, Award, Star } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Evening Jobs Hiring Now | Immediate Openings for Night Shift Workers',
  description: 'Evening jobs are urgently available across the US! Browse 1,000+ immediate openings in retail, healthcare, food service, security, and more. Perfect for students, parents, and anyone seeking extra income after hours. Apply today and start earning this week!',
  keywords: 'evening jobs, evening jobs near me, part time evening jobs, evening shift jobs, night jobs hiring now, evening work, jobs after 5pm, evening jobs hiring immediately',
  openGraph: {
    title: 'Evening Jobs Hiring Now | Urgent Openings Across the US',
    description: 'Find your perfect evening job today. 1,000+ urgent openings in healthcare, retail, food service, and more. Flexible hours after 5pm, competitive pay, immediate start. Apply now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evening Jobs | Urgently Hiring Nationwide',
    description: 'Urgent demand for evening workers across the US. Find part time and full time roles starting after 5pm. Great pay, flexible schedules, immediate openings.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/evening-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Evening Jobs',
  description: 'Find evening jobs hiring now across the United States. Browse immediate openings in healthcare, retail, food service, security, and customer service for evening and night shifts.',
  url: 'https://www.oh-my-job.com/evening-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Evening Job Opportunities',
    description: 'Current evening shift job listings across all industries and locations in the United States',
  },
}

const eveningJobTypes = [
  {
    title: 'Healthcare and Nursing',
    description: 'Hospitals and care facilities run around the clock. Evening shift RNs, CNAs, and patient care technicians are among the most in demand and best compensated evening workers',
    icon: Shield,
  },
  {
    title: 'Food Service and Restaurants',
    description: 'Servers, bartenders, line cooks, and delivery drivers are heavily recruited for dinner and late evening shifts at restaurants, bars, and food delivery platforms',
    icon: Star,
  },
  {
    title: 'Retail and Customer Service',
    description: 'Big box stores, supermarkets, and call centers regularly hire for closing shifts and evening customer support roles with consistent hours and benefits',
    icon: Briefcase,
  },
  {
    title: 'Security and Loss Prevention',
    description: 'Security officers, event security staff, and loss prevention associates are routinely needed for evening and overnight coverage at commercial properties',
    icon: Award,
  },
  {
    title: 'Warehouse and Logistics',
    description: 'Distribution centers and fulfillment warehouses operate multiple evening shifts, offering competitive hourly rates and overtime opportunities for sorters, packers, and forklift operators',
    icon: TrendingUp,
  },
  {
    title: 'Childcare and Tutoring',
    description: 'Evening childcare workers, after school program staff, and online tutors are in consistent demand from working families who need coverage during late afternoon and evening hours',
    icon: Users,
  },
]

const topSectors = [
  { sector: 'Healthcare', roles: 'RN, CNA, Patient Care Tech, Medical Assistant', shiftWindow: '3pm to 11pm / 7pm to 7am' },
  { sector: 'Food and Beverage', roles: 'Server, Bartender, Line Cook, Delivery Driver', shiftWindow: '4pm to midnight' },
  { sector: 'Retail', roles: 'Cashier, Stock Associate, Customer Service Rep', shiftWindow: '2pm to 10pm / closing shifts' },
  { sector: 'Warehouse and Logistics', roles: 'Order Picker, Forklift Operator, Shipping Associate', shiftWindow: '3pm to 11pm / 5pm to 1am' },
  { sector: 'Security', roles: 'Security Officer, Patrol Guard, Loss Prevention', shiftWindow: '4pm to midnight / overnight' },
  { sector: 'Customer Support', roles: 'Call Center Agent, Chat Support, Technical Support', shiftWindow: '5pm to 1am (often remote)' },
]

const salaryData = [
  { role: 'Evening Shift RN', low: '$35', high: '$58', median: '$44' },
  { role: 'Evening CNA', low: '$16', high: '$24', median: '$19' },
  { role: 'Restaurant Server', low: '$12', high: '$28', median: '$18' },
  { role: 'Warehouse Associate', low: '$15', high: '$22', median: '$18' },
  { role: 'Security Officer', low: '$14', high: '$22', median: '$17' },
  { role: 'Retail Associate (Evening)', low: '$13', high: '$20', median: '$16' },
]

const shiftDiffInfo = [
  {
    title: 'What Is a Shift Differential?',
    description: 'A shift differential is additional pay offered to workers who work outside standard daytime hours. According to the U.S. Bureau of Labor Statistics, many employers offer shift differentials of 5% to 15% or more above base pay for evening and overnight hours.',
  },
  {
    title: 'Who Offers the Best Differentials?',
    description: 'Healthcare employers consistently offer the highest shift differentials. Hospitals frequently pay evening and night shift nurses and techs an additional $2 to $8 per hour above their base rate, making evening shifts significantly more lucrative.',
  },
  {
    title: 'How to Negotiate Your Differential',
    description: 'Shift differentials are sometimes negotiable, particularly in healthcare and skilled trades. Research what comparable employers offer in your area using resources such as the BLS National Compensation Survey before accepting an offer.',
  },
]

const whoEvenjobs = [
  { profile: 'Students', reason: 'Keep days free for classes while earning income during evenings and weekends' },
  { profile: 'Parents', reason: 'Work after a partner returns home, reducing childcare costs and scheduling conflicts' },
  { profile: 'Second Job Seekers', reason: 'Supplement a day job income without schedule conflicts' },
  { profile: 'Healthcare Workers', reason: 'Higher pay through shift differentials and less administrative traffic during evening hours' },
  { profile: 'Recent Graduates', reason: 'Build work experience and income while continuing to job search during the day' },
]

const faqs = [
  {
    question: 'What hours count as an evening shift?',
    answer: 'While definitions vary by employer, the U.S. Bureau of Labor Statistics broadly defines evening shifts as those that begin between 2pm and midnight. Most commonly, evening shifts run from 3pm to 11pm or 4pm to midnight. Some employers classify any shift starting after 5pm as an evening shift for purposes of differential pay.',
  },
  {
    question: 'Do evening jobs pay more than day jobs?',
    answer: 'Often yes. According to the U.S. Bureau of Labor Statistics National Compensation Survey, a significant share of employers, particularly in healthcare, manufacturing, and hospitality, offer shift differentials for evening and overnight work. These can range from 5% to 20% above the daytime base rate, making evening shifts meaningfully higher paying for the same role.',
  },
  {
    question: 'What types of evening jobs are available for people without experience?',
    answer: 'Many entry level positions are concentrated in evening shifts. According to O*NET OnLine, managed by the U.S. Department of Labor, roles such as food service worker, retail associate, warehouse picker, security guard, and customer service representative are widely available for evening hours and typically require no formal education beyond a high school diploma or GED.',
  },
  {
    question: 'Are evening jobs good for students?',
    answer: 'Evening jobs are among the most popular choices for students at both high school and college levels. Because evening hours do not overlap with standard academic schedules, students can maintain full course loads while working consistently. The Fair Labor Standards Act (FLSA), as administered by the U.S. Department of Labor, sets specific rules on working hours for those under 18, including restrictions on late evening work during school periods.',
  },
  {
    question: 'Can I find remote evening jobs?',
    answer: 'Yes. Remote evening jobs are increasingly available, particularly in customer support, data entry, virtual assistance, content moderation, and online tutoring. According to the U.S. Department of Labor, remote work expanded substantially across all industries and has created a strong market for flexible, time shifted roles that workers can perform from home during evening hours.',
  },
  {
    question: 'What are the health considerations for evening shift workers?',
    answer: 'The National Institute for Occupational Safety and Health (NIOSH), part of the Centers for Disease Control and Prevention (CDC), notes that shift work, particularly work that spans late evening and overnight hours, can affect sleep patterns and long term health. Workers considering regular evening shifts are encouraged to maintain consistent sleep schedules, prioritize nutrition, and consult a healthcare provider if experiencing persistent fatigue.',
  },
]

const applicationTips = [
  {
    title: 'State Your Availability Clearly',
    description: 'Always specify your available evening hours in your application and resume. Employers hiring for shift coverage need to quickly match availability to open slots. Candidates who are explicit about being available evenings, weekends, or specific shift windows get filtered to the top faster.',
  },
  {
    title: 'Target Industries With Guaranteed Evening Demand',
    description: 'Healthcare, food service, retail, and logistics have structural evening staffing needs that do not fluctuate with season or economy. Focusing your search on these sectors ensures a consistent supply of evening openings and often includes benefits even for part time positions.',
  },
  {
    title: 'Ask About Shift Differentials Before Accepting',
    description: 'Many employers do not advertise shift differentials in job postings. Always ask during the interview what additional compensation is offered for evening or weekend work. According to BLS data, these differentials can add several thousand dollars annually to your compensation.',
  },
  {
    title: 'Consider Combining Part Time Evening Roles',
    description: 'Evening job seekers frequently stack two or three part time positions across different industries to build a full income. Retail, food delivery, and remote customer service roles are highly stackable because their schedules can be managed independently with minimal conflict.',
  },
]

export default async function EveningJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'evening jobs', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'evening jobs', where: params.where || '', results_per_page: 30, page: 1 })
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
            Evening Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="evening jobs" />
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
                what={params.what || 'evening jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Evening Jobs */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Evening Jobs Hiring Now</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, evening and shift work is prevalent across a wide range of industries that require extended or round the clock operations. Whether you are looking for part time supplemental income or a full time career with a non traditional schedule, evening positions exist at every skill level and pay grade.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eveningJobTypes.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top Sectors and Shift Windows */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Sectors for Evening Work and Typical Shift Hours</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Evening shift availability varies significantly by industry. The following breakdown reflects the most common evening employment sectors in the United States based on data from the U.S. Bureau of Labor Statistics American Time Use Survey and Occupational Employment Statistics.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Sector</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Common Evening Roles</th>
                  <th className="text-left px-6 py-4 font-semibold text-indigo-700">Typical Shift Window</th>
                </tr>
              </thead>
              <tbody>
                {topSectors.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.sector}</td>
                    <td className="px-6 py-4 text-gray-600">{row.roles}</td>
                    <td className="px-6 py-4 text-indigo-700 font-medium">{row.shiftWindow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Source: U.S. Bureau of Labor Statistics, American Time Use Survey and Occupational Employment Statistics program.
          </p>
        </section>

        {/* Salary Data */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Evening Job Pay Rates by Role</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program, hourly pay for evening positions varies by industry, skill level, and whether a shift differential applies. The figures below reflect base hourly rates and do not include potential differentials which can add $1 to $8 per hour depending on the employer.
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
                    <td className="px-6 py-4 text-center text-gray-600">{row.low}/hr</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{row.median}/hr</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.high}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are base hourly rates and do not include shift differentials which are common for evening and overnight positions.
          </p>
        </section>

        {/* Shift Differential Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Understanding Evening Shift Differentials</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            One of the most significant financial advantages of evening work is the shift differential. According to the U.S. Bureau of Labor Statistics National Compensation Survey, shift differentials are a widespread practice that directly increases your hourly take home pay for working outside standard business hours.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {shiftDiffInfo.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who Evening Jobs Are For */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Who Benefits Most From Evening Jobs?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Evening jobs attract a wide range of workers for different reasons. Understanding who these roles are best suited for helps you evaluate whether an evening schedule aligns with your lifestyle and goals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whoEvenjobs.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">{item.profile}</p>
                    <p className="text-gray-600 text-sm">{item.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Finding and Landing an Evening Job</h2>
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

        {/* Rights for Evening Workers */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights as an Evening or Shift Worker</h2>
                <p className="text-gray-700 mb-4">
                  According to the U.S. Department of Labor, all workers regardless of shift are entitled to the same federal labor protections under the Fair Labor Standards Act (FLSA). This includes the right to minimum wage, overtime pay for hours worked beyond 40 in a week, and safe working conditions as defined by the Occupational Safety and Health Administration (OSHA).
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Federal Protections Apply to All Shifts</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Federal minimum wage of $7.25/hr or applicable state rate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Overtime at 1.5x base rate for hours over 40 per week</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Safe and hazard free work environment under OSHA standards</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Minors and Evening Shift Restrictions</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Workers under 16 may not work past 7pm on school nights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>During summer (June 1 through Labor Day), under 16s may work until 9pm</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Workers aged 16 and 17 are not restricted by federal law but state rules may apply</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Source: U.S. Department of Labor, Fair Labor Standards Act; Wage and Hour Division, Child Labor Provisions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Evening Jobs</h2>
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

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The salary figures, shift data, and employment information cited on this page are sourced from publicly available reports by the U.S. Bureau of Labor Statistics, the U.S. Department of Labor, O*NET OnLine, and the National Institute for Occupational Safety and Health (NIOSH). Actual wages and shift availability may vary by location, employer, and individual role. Oh My Job is an independent job search platform and aggregates listings from third party sources. Always verify job details, compensation, and working conditions directly with the employer before applying.
          </p>
        </section>
      </div>
    </>
  )
}