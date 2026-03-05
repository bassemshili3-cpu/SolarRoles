import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, TrendingUp, Clock, Users, Award, MapPin, Star } from 'lucide-react'
import { getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Now Hiring: Part Time Jobs Near You | Apply Today',
  description: 'Find part time jobs hiring immediately across the United States. Flexible schedules, competitive pay, and openings in retail, food service, healthcare, and more. No degree required for many roles. Apply in minutes and start earning this week!',
  keywords: 'part time jobs, part time jobs near me, part time hiring now, part time work, flexible part time jobs, part time jobs for students, weekend part time jobs, evening part time jobs',
  openGraph: {
    title: 'Hiring Immediately: Part Time Jobs | Flexible Hours Across the US',
    description: 'Thousands of part time positions available now. Retail, hospitality, healthcare, and remote roles with flexible schedules. Great pay and no experience required for many openings. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgent Part Time Jobs Hiring Now | Start This Week',
    description: 'Browse part time jobs hiring immediately near you. Flexible hours, competitive pay, and opportunities across every industry. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/part-time-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Part Time Jobs',
  description: 'Find part time jobs hiring now across the United States. Browse flexible positions across retail, food service, healthcare, and more.',
  url: 'https://www.oh-my-job.com/part-time-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Part Time Jobs',
    description: 'Current part time job listings with immediate hiring needs',
  },
}

const topPartTimeRoles = [
  {
    title: 'Retail Sales Associate',
    description: 'Assist customers on the sales floor, manage stock, and process transactions. Weekend and evening shifts are widely available at major chains and local stores.',
  },
  {
    title: 'Food Service and Cashier',
    description: 'Take orders, prepare food, and handle payments at restaurants, cafes, and fast food locations. One of the highest volume part time hiring categories nationally.',
  },
  {
    title: 'Customer Service Representative',
    description: 'Handle inbound calls, chats, or emails for companies that offer part time and remote scheduling, including evenings and weekends.',
  },
  {
    title: 'Delivery Driver',
    description: 'Make on demand or scheduled deliveries for food, grocery, or package services. Set your own hours with app based platforms or apply for scheduled routes.',
  },
  {
    title: 'Healthcare Support Staff',
    description: 'Patient transport aides, medical scribes, and care assistants are in high demand across hospitals and clinics that operate outside standard business hours.',
  },
  {
    title: 'Tutor or Teaching Assistant',
    description: 'Work with students one on one or in small groups through schools, learning centers, or independent contracting. Highly flexible and often remote.',
  },
]

const jobOutlookData = [
  { label: 'Part Time Workers in the US', value: '27 million', detail: 'Americans employed part time as of 2024' },
  { label: 'Part Time Share of Workforce', value: '17%', detail: 'Of all employed persons work part time' },
  { label: 'Top Hiring Sector', value: 'Retail & Hospitality', detail: 'Consistently the largest part time employers nationwide' },
]

const workerProfiles = [
  {
    profile: 'Students',
    desc: 'Part time work allows students to earn income while managing academic schedules. According to the U.S. Bureau of Labor Statistics, a significant share of part time workers are enrolled in school.',
  },
  {
    profile: 'Parents and Caregivers',
    desc: 'Flexible scheduling makes part time roles ideal for parents managing childcare or family members providing elder care. Many employers specifically offer school hours or split shifts.',
  },
  {
    profile: 'Retirees',
    desc: 'The BLS reports steady growth in part time employment among workers aged 55 and older, who often seek engagement and supplemental income without full time commitments.',
  },
  {
    profile: 'Career Changers',
    desc: 'Part time work provides a low risk way to build experience in a new field while maintaining income from a current position during a professional transition.',
  },
]

const salaryData = [
  { role: 'Retail Salesperson', salary: '$15 to $20/hr', note: 'Median hourly, varies by state and employer' },
  { role: 'Food Service Worker', salary: '$13 to $18/hr', note: 'Plus tips at many establishments' },
  { role: 'Customer Service Rep', salary: '$17 to $22/hr', note: 'Higher for remote and specialized roles' },
]

const benefitsOfPartTime = [
  { title: 'Schedule Flexibility', desc: 'Most part time positions offer morning, afternoon, evening, or weekend shifts, allowing workers to fit employment around school, family, or other commitments.' },
  { title: 'Benefits Eligibility', desc: 'According to the U.S. Department of Labor, part time employees may be eligible for certain benefits depending on hours worked and employer policy, including health insurance under the ACA for those working 30 or more hours per week.' },
  { title: 'Multiple Income Streams', desc: 'Part time work makes it easier to hold more than one position simultaneously, increasing total earnings and broadening professional experience across industries.' },
  { title: 'Path to Full Time', desc: 'Many employers use part time hiring as a pipeline for full time roles. Demonstrating reliability and performance in a part time capacity is one of the most effective ways to secure a permanent offer.' },
]

const yourRights = [
  {
    right: 'Minimum Wage',
    detail: 'According to the U.S. Department of Labor, part time workers are covered by the Fair Labor Standards Act and must be paid at least the federal minimum wage of $7.25 per hour. Most states have higher minimums that apply.',
  },
  {
    right: 'Overtime Pay',
    detail: 'Part time workers who exceed 40 hours in a single workweek are entitled to overtime pay at 1.5 times their regular rate under the FLSA, regardless of their part time status.',
  },
  {
    right: 'Safe Working Conditions',
    detail: 'According to the official website of the United States Government, OSHA protections apply to all workers regardless of whether they are employed full time or part time. Employers cannot reduce safety standards for part time staff.',
  },
  {
    right: 'Anti Discrimination Protections',
    detail: 'The U.S. Equal Employment Opportunity Commission confirms that federal anti discrimination laws, including Title VII of the Civil Rights Act, apply equally to part time and full time employees.',
  },
]

const applicationTips = [
  {
    title: 'Be Specific About Your Availability',
    description: 'Clearly state your available days and hours on your application and during interviews. Employers filling part time roles need to match shifts immediately. Vague availability slows down your hiring process.',
  },
  {
    title: 'Apply to Multiple Locations of the Same Chain',
    description: 'Large retailers, restaurant groups, and fitness chains with multiple nearby locations all post separately. Applying to several sites within your area dramatically increases your chances of a fast response.',
  },
  {
    title: 'Highlight Reliability Over Experience',
    description: 'Part time hiring managers prioritize candidates who will show up consistently. Reference past roles where you maintained attendance, met deadlines, or were recognized for dependability.',
  },
  {
    title: 'Consider Seasonal Openings',
    description: 'Retail, hospitality, and logistics companies ramp up part time hiring significantly during peak seasons. Applying early in Q4 or ahead of summer maximizes your chances of landing a role quickly.',
  },
]

const faqs = [
  {
    question: 'How many hours is considered part time in the United States?',
    answer: 'According to the U.S. Bureau of Labor Statistics, workers are classified as part time when they work fewer than 35 hours per week. The BLS distinguishes between workers who are part time for economic reasons, meaning they would prefer full time work, and those who are part time for non economic reasons such as school, caregiving, or personal preference. There is no single federal law that defines part time hours, and individual employers may set their own thresholds.',
  },
  {
    question: 'Do part time workers get benefits?',
    answer: 'Benefits eligibility for part time workers varies by employer and applicable law. Under the Affordable Care Act, employers with 50 or more full time equivalent employees are required to offer health coverage to employees working 30 or more hours per week. According to the U.S. Department of Labor, part time employees may also be eligible for employer sponsored retirement plans depending on the plan rules. Paid time off, dental, and vision benefits are offered to part time workers at some but not all employers.',
  },
  {
    question: 'Are part time workers protected by labor laws?',
    answer: 'Yes. According to the official website of the United States Government, the Fair Labor Standards Act covers all workers regardless of full time or part time status. Part time employees are entitled to federal minimum wage, overtime pay for hours worked beyond 40 in a week, and protections against illegal wage deductions. Federal anti discrimination and workplace safety laws also apply equally to part time and full time employees.',
  },
  {
    question: 'Can a part time job lead to a full time position?',
    answer: 'Yes, and this is a common path. Many employers use part time hiring as a low risk way to evaluate candidates before offering full time employment. According to labor market data from the U.S. Bureau of Labor Statistics, a meaningful share of workers transition from part time to full time roles within their first year of employment with the same organization, particularly in retail, healthcare, and food service.',
  },
  {
    question: 'What are the best part time jobs for students?',
    answer: 'According to the U.S. Bureau of Labor Statistics, the most common part time occupations for students include food service workers, retail sales associates, tutors, and customer service representatives. These roles frequently offer evening and weekend scheduling, which accommodates academic schedules. Campus employment through Federal Work Study programs, authorized under the Higher Education Act, is also a widely available part time option for enrolled students with demonstrated financial need.',
  },
  {
    question: 'Can I work two part time jobs at the same time?',
    answer: 'Yes. There is no federal law prohibiting an individual from holding multiple part time jobs simultaneously. However, workers should review any exclusivity or non compete clauses in their employment agreements, as some employers include restrictions on outside employment. Tax withholding should also be managed carefully when working multiple jobs, as having two or more employers may affect your total income tax liability. The IRS provides a withholding estimator tool at irs.gov to help workers adjust their W4 forms accordingly.',
  },
]

export default async function PartTimeJobsPage({ searchParams }: any) {
  const params = await searchParams

  const { count } = await getCachedJobCount(
    params.what || 'part time',
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
            Part Time Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters />
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
                what={params.what || 'part time'}
                where={params.where || ''}
                salary_min={params.salary_min}
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Part Time Work in the United States</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, approximately 27 million Americans work part time, representing about 17 percent of the total employed workforce. Part time employment has grown steadily across service sectors, driven by employer demand for scheduling flexibility and a workforce that increasingly values work life balance.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {jobOutlookData.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                <p className="text-emerald-600 text-2xl font-medium">{item.value}</p>
                <p className="text-gray-500 text-sm mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Current Population Survey, 2024
          </p>
        </section>

        {/* Top Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Most In Demand Part Time Job Types</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Part time openings are available across virtually every sector of the economy. The roles below consistently represent the highest volume of part time job postings in the United States based on current labor market data.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPartTimeRoles.map((role, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Star className="w-10 h-10 text-blue-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Part Time Workers Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Department of Labor, all covered nonexempt workers including part time employees are entitled to a minimum wage of at least $7.25 per hour under the Fair Labor Standards Act. Most states have established higher minimum wages. Many part time jobs in service and healthcare sectors now start well above the federal floor due to competitive local labor markets.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {salaryData.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-green-600 mb-1">{item.salary}</p>
                  <p className="font-semibold text-gray-900 text-sm">{item.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024 data
            </p>
          </div>
        </section>

        {/* Who Works Part Time */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Who Works Part Time?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, part time employment spans all age groups and demographics. The flexibility it offers serves distinctly different needs depending on where workers are in their lives and careers.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {workerProfiles.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.profile}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits of Part Time */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Advantages of Part Time Employment</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {benefitsOfPartTime.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Your Rights as a Part Time Worker</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Federal labor law extends meaningful protections to part time workers. According to the official website of the United States Government, part time status does not reduce your core workplace rights under the Fair Labor Standards Act, OSHA, or federal anti discrimination statutes.
          </p>
          <div className="space-y-3">
            {yourRights.map((item, i) => (
              <div key={i} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex-shrink-0 w-2 rounded-full bg-rose-200 self-stretch" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{item.right}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Department of Labor, Wage and Hour Division; U.S. Equal Employment Opportunity Commission; OSHA.gov
          </p>
        </section>

        {/* Shift Options */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Common Part Time Shift Structures</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Part time schedules vary widely by employer and sector. Understanding common shift structures helps you identify roles that fit your availability before applying.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { shift: 'Morning Shifts', hours: '6:00 AM to 12:00 PM', example: 'Retail opening, café, school aide' },
              { shift: 'Afternoon Shifts', hours: '12:00 PM to 6:00 PM', example: 'Customer service, food service, admin' },
              { shift: 'Evening Shifts', hours: '4:00 PM to 10:00 PM', example: 'Restaurant, gym, delivery' },
              { shift: 'Weekend Only', hours: 'Saturday and Sunday', example: 'Retail, events, hospitality' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.shift}</p>
                <p className="text-amber-600 text-sm font-medium mb-2">{item.hours}</p>
                <p className="text-gray-500 text-xs">{item.example}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Part Time Job Fast</h2>
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
            <MapPin className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Part Time Jobs</h2>
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
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics, the U.S. Department of Labor, the IRS, and the U.S. Equal Employment Opportunity Commission. Wage rates, labor law protections, and benefit eligibility rules are subject to change and vary by state and employer. Always verify current requirements with the relevant federal or state agency or with your employer before making employment decisions.
          </p>
        </section>

      </div>
    </>
  )
}