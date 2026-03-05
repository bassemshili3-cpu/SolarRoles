import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, TrendingUp, Star, Coffee, Award } from 'lucide-react'
import { getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Now Hiring: Barista Jobs Near You | Apply Today',
  description: 'Thousands of barista jobs hiring immediately across the United States. Top coffee chains and independent cafés actively recruiting. Competitive pay, flexible hours, and tips. Apply in minutes and start your coffee career today!',
  keywords: 'barista jobs, barista jobs near me, barista hiring now, coffee shop jobs, starbucks barista jobs, barista careers, part time barista jobs, barista job description',
  openGraph: {
    title: 'Immediate Opening: Barista Jobs Hiring Now | Oh My Job',
    description: 'Find barista jobs at top coffee shops near you. Hundreds of openings at Starbucks, Dunkin, independent cafés and more. Flexible schedules, tips, and benefits. Apply now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgently Hiring: Barista Jobs | Start This Week',
    description: 'Ready to craft great coffee? Browse barista jobs hiring immediately near you. Full time, part time, and seasonal openings available. Apply today!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/barista-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Barista Jobs',
  description: 'Find barista jobs hiring now across the United States. Browse coffee shop and café positions with immediate openings.',
  url: 'https://www.oh-my-job.com/barista-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Barista Jobs',
    description: 'Current barista job listings with immediate hiring needs',
  },
}

const baristaResponsibilities = [
  {
    title: 'Espresso & Beverage Preparation',
    description: 'Pull espresso shots, steam milk, and craft specialty drinks to recipe standards and customer specifications',
  },
  {
    title: 'Customer Service',
    description: 'Greet guests, take orders accurately, handle payments, and create a welcoming café experience',
  },
  {
    title: 'Cash Handling & POS',
    description: 'Process transactions, manage a cash drawer, and operate point of sale systems efficiently',
  },
  {
    title: 'Equipment Maintenance',
    description: 'Clean and calibrate espresso machines, grinders, and brewing equipment following safety protocols',
  },
  {
    title: 'Inventory & Stocking',
    description: 'Monitor supply levels, rotate stock, and communicate replenishment needs to supervisors',
  },
  {
    title: 'Food Safety Compliance',
    description: 'Follow FDA food handling guidelines, maintain cleanliness standards, and ensure proper temperature control',
  },
]

const salaryData = [
  {
    level: 'Entry Level Barista',
    salary: '$28,000',
    note: 'Median annual (plus tips)',
  },
  {
    level: 'Experienced Barista',
    salary: '$35,000',
    note: 'With tips at high volume locations',
  },
  {
    level: 'Lead Barista / Shift Supervisor',
    salary: '$42,000',
    note: 'Median for supervisory roles',
  },
]

const topEmployers = [
  { name: 'Starbucks', detail: 'Largest coffee chain in the US, hiring nationwide with full benefits for eligible partners' },
  { name: 'Dunkin\'', detail: 'Thousands of franchise locations across the country with flexible scheduling' },
  { name: 'Peet\'s Coffee', detail: 'Premium coffee retailer known for competitive pay and craft-focused training' },
  { name: 'Dutch Bros Coffee', detail: 'Fast-growing drive-through chain with strong tip culture and advancement opportunities' },
  { name: 'Independent Cafés', detail: 'Local coffee shops often offer more creative freedom and a tight-knit team environment' },
  { name: 'Hotel & Resort Cafés', detail: 'Hospitality barista roles often include benefits, higher base pay, and consistent hours' },
]

const careerPath = [
  { role: 'Barista', timeframe: 'Starting out', description: 'Craft beverages, build customer relationships, and master foundational coffee skills' },
  { role: 'Lead Barista', timeframe: '1 to 2 years', description: 'Train new team members, manage opening or closing procedures, and handle escalations' },
  { role: 'Shift Supervisor', timeframe: '2 to 3 years', description: 'Oversee daily operations, manage scheduling, and ensure quality and service standards' },
  { role: 'Assistant Manager', timeframe: '3 to 5 years', description: 'Support store profitability, mentor staff, and coordinate with district leadership' },
]

const certifications = [
  {
    name: 'Specialty Coffee Association (SCA) Barista Skills',
    desc: 'Industry recognized certification covering espresso extraction, milk technique, and sensory skills at Foundation, Intermediate, and Professional levels',
  },
  {
    name: 'ServSafe Food Handler Certification',
    desc: 'Issued by the National Restaurant Association, this certificate demonstrates knowledge of safe food handling practices required by most employers',
  },
  {
    name: 'Coffee Quality Institute (CQI) Q Grader',
    desc: 'Advanced credential for baristas pursuing specialty coffee careers, focusing on cupping and green coffee evaluation',
  },
]

const faqs = [
  {
    question: 'What qualifications do I need to become a barista?',
    answer: 'According to the U.S. Bureau of Labor Statistics, most barista and food and beverage serving positions require no formal educational credential. A high school diploma is typically preferred, and most employers provide on the job training. Certification from organizations such as the Specialty Coffee Association can strengthen your application but is rarely required for entry level roles.',
  },
  {
    question: 'How much do baristas make per hour?',
    answer: 'The U.S. Bureau of Labor Statistics reports a median hourly wage of approximately $14.00 for baristas and related coffee service workers, as of the most recent Occupational Employment and Wage Statistics survey. Actual earnings vary by employer, location, and experience. Tip income can significantly increase total compensation, particularly at high volume or specialty coffee establishments.',
  },
  {
    question: 'Is barista work physically demanding?',
    answer: 'Yes. According to the Occupational Information Network (O*NET) maintained by the U.S. Department of Labor, barista work involves standing for extended periods, repetitive arm movements, lifting supplies up to 50 pounds, and working in a fast paced environment. Proper ergonomics and footwear are important for long term comfort.',
  },
  {
    question: 'Do baristas receive benefits?',
    answer: 'Benefits vary by employer and employment status. Large chains such as Starbucks offer comprehensive benefits packages to eligible employees, including health insurance, retirement savings plans, and tuition reimbursement. Part time roles and independent café positions may offer fewer formal benefits, though tip income and flexible scheduling are common perks.',
  },
  {
    question: 'What is the job outlook for baristas in the United States?',
    answer: 'The U.S. Bureau of Labor Statistics projects that employment of food and beverage serving workers, the broader category that includes baristas, will grow by approximately 7 percent from 2023 to 2033, faster than the average for all occupations. The specialty and third wave coffee movement continues to drive demand for skilled baristas at independent cafés and premium chains.',
  },
]

const applicationTips = [
  {
    title: 'Highlight Customer Service Experience',
    description: 'Employers prioritize candidates who can create positive guest experiences. Any prior role in retail, hospitality, or food service is directly relevant and should be featured prominently on your resume.',
  },
  {
    title: 'Get Food Handler Certified Before You Apply',
    description: 'Obtaining a ServSafe Food Handler certificate takes only a few hours online and signals to employers that you are serious, prepared, and ready to work from day one.',
  },
  {
    title: 'Research the Coffee Menu',
    description: 'Before your interview, familiarize yourself with the drinks on the menu. Demonstrating genuine interest in coffee and the ability to learn products quickly sets you apart from other candidates.',
  },
  {
    title: 'Emphasize Availability and Reliability',
    description: 'Café managers value dependability above almost everything else. Clearly communicate your availability, especially for early morning, weekend, and holiday shifts, which are hardest to fill.',
  },
]

export default async function BaristaJobsPage({ searchParams }: any) {
  const params = await searchParams

  const { count } = await getCachedJobCount(
    params.what || 'barista',
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
            Barista Jobs Available Now Across the United States
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
                what={params.what || 'barista'}
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
            <h2 className="text-2xl font-bold text-gray-900">Barista Job Outlook</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, employment of food and beverage serving workers is projected to grow 7 percent from 2023 to 2033, faster than the average for all occupations. The continued expansion of specialty coffee culture and the resilience of café concepts are driving sustained demand for skilled baristas nationwide.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Job Growth (2023 to 2033)', value: '7%', detail: 'Faster than average for all occupations' },
              { label: 'Annual Job Openings', value: '470,000+', detail: 'Food and beverage serving roles per year' },
              { label: 'Specialty Coffee Market', value: '$50B+', detail: 'US market size driving barista demand' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                <p className="text-emerald-600 text-2xl font-medium">{item.value}</p>
                <p className="text-gray-500 text-sm mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Food and Beverage Serving Workers, updated 2024
          </p>
        </section>

        {/* What Baristas Do */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Coffee className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Does a Barista Do?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to O*NET OnLine, maintained by the U.S. Department of Labor, baristas prepare and serve hot or cold beverages such as coffee, espresso drinks, blended coffees, and teas. They also check temperatures of refrigerators and coffeemakers, clean brewing equipment, and take customer orders and payments.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baristaResponsibilities.map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Coffee className="w-10 h-10 text-amber-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Barista Salaries in the United States</h2>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The U.S. Bureau of Labor Statistics reports a median hourly wage of approximately $14.00 for baristas. Total compensation is often higher when tips are factored in, particularly at specialty coffee shops and high traffic urban locations. Many large employers also offer paid training, tuition assistance, and health benefits for qualifying employees.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {salaryData.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-amber-600 mb-1">{item.salary}</p>
                  <p className="font-semibold text-gray-900 text-sm">{item.level}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024 data
            </p>
          </div>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Top Employers Hiring Baristas</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Barista positions are available across a wide range of employers, from global coffee chains to independent neighborhood cafés. Each offers a different work environment, culture, and compensation structure.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topEmployers.map((emp, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-2">{emp.name}</p>
                <p className="text-gray-600 text-sm">{emp.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications That Boost Your Barista Career</h2>
              <p className="text-gray-700 mb-6">
                While most barista jobs do not require formal certification, obtaining recognized credentials demonstrates commitment and can accelerate your path to higher paying and supervisory roles.
              </p>
              <div className="space-y-4">
                {certifications.map((cert, i) => (
                  <div key={i} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                    <p className="text-gray-600 text-sm">{cert.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Career Path */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Barista Career Progression</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            A barista position is often a stepping stone to a rewarding long term career in coffee, hospitality, or food service management. Many current café managers and district leaders started behind the espresso bar.
          </p>
          <div className="relative">
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-indigo-100 hidden md:block" />
            <div className="space-y-4">
              {careerPath.map((step, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm z-10">
                    {i + 1}
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 flex-1 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{step.role}</h3>
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{step.timeframe}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Barista Job</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Barista Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics, O*NET OnLine, and the U.S. Department of Labor. Salary figures, job growth projections, and employer details are subject to change. Always verify current requirements and compensation directly with the employer before applying.
          </p>
        </section>

      </div>
    </>
  )
}