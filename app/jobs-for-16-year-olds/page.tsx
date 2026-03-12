import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, DollarSign, CheckCircle, ShieldCheck, BookOpen, Users, TrendingUp, FileText, AlertTriangle } from 'lucide-react'
import { getCachedJobCount, searchJobs } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Jobs for 16 Year Olds Hiring Immediately | Start Working This Week',
  description: 'Hundreds of jobs for 16 year olds available right now near you. Retail, food service, and outdoor roles with flexible hours around school. No experience needed for most positions. Apply today before spots fill up.',
  keywords: 'jobs for 16 year olds, jobs hiring at 16, teen jobs 16, part time jobs 16 year old, jobs near me 16 year old, first job 16, youth employment, summer jobs for 16 year olds',
  openGraph: {
    title: 'Jobs for 16 Year Olds Hiring Now | Apply Today',
    description: 'Find urgent job openings for 16 year olds across the United States. Flexible hours, teen friendly employers, and no experience required for many roles. Start earning this week.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs for 16 Year Olds | Hiring Immediately Near You',
    description: 'Ready to land your first job at 16? Browse hundreds of openings with flexible schedules. Legal, safe, and paying from day one. Apply now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/jobs-for-16-year-olds',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Jobs for 16 Year Olds',
  description: 'Find legal jobs for 16 year olds hiring near you across the United States. Browse hundreds of teen friendly positions with flexible hours.',
  url: 'https://www.oh-my-job.com/jobs-for-16-year-olds',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Jobs for 16 Year Olds',
    description: 'Current job listings suitable for 16 year old workers across the United States',
  },
}

// ✅ FAQPage schema — active les rich snippets dépliables dans Google
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can a 16 year old legally work in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. According to the U.S. Department of Labor, 16 and 17 year olds may work in any non hazardous occupation for unlimited hours under federal law. Unlike younger teens, workers aged 16 and above are not subject to federal restrictions on daily or weekly working hours under the Fair Labor Standards Act (FLSA). However, individual states may set stricter rules, so always check your state labor department for local requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does a 16 year old need a work permit to get a job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Work permit requirements vary by state. According to the U.S. Department of Labor, there is no federal requirement for a work permit for 16 year olds, but many states do require an employment certificate or age verification document before a minor can begin working. Contact your school guidance counselor or your state labor department website to find out what is required in your area.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum wage for a 16 year old?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Under the Fair Labor Standards Act, most 16 year olds are entitled to the federal minimum wage of $7.25 per hour. However, the U.S. Department of Labor does allow a youth minimum wage of $4.25 per hour for the first 90 consecutive calendar days of employment with a new employer. Many states have set their own higher minimum wages that apply to all workers including teens. Check your state labor department for the current rate where you live.',
      },
    },
    {
      '@type': 'Question',
      name: 'What jobs are 16 year olds not allowed to do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Fair Labor Standards Act prohibits workers under 18 from employment in occupations declared hazardous by the Secretary of Labor. According to Child Labor Bulletin 101 published by the U.S. Department of Labor, prohibited occupations include operating many power driven machines, roofing work, excavation, working with explosives, logging, and driving motor vehicles as a primary job duty. A complete list of hazardous occupations is available at dol.gov.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a 16 year old work full time during summer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Under federal law, yes. The Fair Labor Standards Act does not restrict the number of hours 16 and 17 year olds may work, including during summer. Many teens choose to work full time hours during school vacation periods to save money. State laws may still apply, so check with your state labor department for any local restrictions on summer hours for minors.',
      },
    },
  ],
}

const jobSectors = [
  {
    title: 'Retail & Grocery',
    description: 'Cashier, stock associate, and bagging roles at supermarkets, pharmacies, and clothing stores. One of the most accessible entry points for 16 year olds with no prior experience.',
    icon: Briefcase,
  },
  {
    title: 'Food Service',
    description: 'Crew member, host, and prep kitchen positions at fast food chains, cafes, and family restaurants offering flexible scheduling around school days.',
    icon: Users,
  },
  {
    title: 'Outdoor & Recreation',
    description: 'Lifeguard, camp counselor, park attendant, and lawn care roles that are ideal for active teens who prefer working outside during spring and summer.',
    icon: TrendingUp,
  },
  {
    title: 'Tutoring & Education',
    description: 'Peer tutoring, after school program support, and reading assistant roles that build your resume while making a positive impact on younger students.',
    icon: BookOpen,
  },
  {
    title: 'Office Support',
    description: 'Data entry, filing, and front desk assistant positions at small businesses and local offices that offer valuable administrative experience early in your career.',
    icon: FileText,
  },
  {
    title: 'Customer Service',
    description: 'Call center, front of house, and membership desk roles at gyms, cinemas, and service businesses that develop communication skills employers value.',
    icon: CheckCircle,
  },
]

const workingHours = [
  { rule: 'School Days', hours: 'No federal hour limit for 16 and 17 year olds' },
  { rule: 'Non School Days', hours: 'No federal hour limit for 16 and 17 year olds' },
  { rule: 'State Restrictions', hours: 'Many states cap hours during school weeks' },
  { rule: 'Earliest Start Time', hours: 'Varies by state, typically 6:00 AM or 7:00 AM' },
  { rule: 'Latest End Time', hours: 'Varies by state, typically 10:00 PM or 11:00 PM' },
  { rule: 'Hazardous Work', hours: 'Prohibited in all occupations declared hazardous by federal law' },
]

const prohibitedJobs = [
  'Operating power driven hoisting equipment',
  'Roofing work and work on or about a roof',
  'Excavation and trenching operations',
  'Wrecking, demolition, and shipbreaking',
  'Manufacturing explosives or working with radioactive substances',
  'Coal or other mining occupations',
  'Logging and sawmill operations',
  'Driving a motor vehicle as a primary job duty',
]

const faqs = [
  {
    question: 'Can a 16 year old legally work in the United States?',
    answer: 'Yes. According to the U.S. Department of Labor, 16 and 17 year olds may work in any non hazardous occupation for unlimited hours under federal law. Unlike younger teens, workers aged 16 and above are not subject to federal restrictions on daily or weekly working hours under the Fair Labor Standards Act (FLSA). However, individual states may set stricter rules, so always check your state labor department for local requirements.',
  },
  {
    question: 'Does a 16 year old need a work permit to get a job?',
    answer: 'Work permit requirements vary by state. According to the U.S. Department of Labor, there is no federal requirement for a work permit for 16 year olds, but many states do require an employment certificate or age verification document before a minor can begin working. Contact your school guidance counselor or your state labor department website to find out what is required in your area.',
  },
  {
    question: 'What is the minimum wage for a 16 year old?',
    answer: 'Under the Fair Labor Standards Act, most 16 year olds are entitled to the federal minimum wage of $7.25 per hour. However, the U.S. Department of Labor does allow a youth minimum wage of $4.25 per hour for the first 90 consecutive calendar days of employment with a new employer. Many states have set their own higher minimum wages that apply to all workers including teens. Check your state labor department for the current rate where you live.',
  },
  {
    question: 'What jobs are 16 year olds not allowed to do?',
    answer: 'The Fair Labor Standards Act prohibits workers under 18 from employment in occupations declared hazardous by the Secretary of Labor. According to Child Labor Bulletin 101 published by the U.S. Department of Labor, prohibited occupations include operating many power driven machines, roofing work, excavation, working with explosives, logging, and driving motor vehicles as a primary job duty. A complete list of hazardous occupations is available at dol.gov.',
  },
  {
    question: 'Can a 16 year old work full time during summer?',
    answer: 'Under federal law, yes. The Fair Labor Standards Act does not restrict the number of hours 16 and 17 year olds may work, including during summer. Many teens choose to work full time hours during school vacation periods to save money. State laws may still apply, so check with your state labor department for any local restrictions on summer hours for minors.',
  },
]

const tips = [
  {
    title: 'Confirm Your State Work Permit Requirements',
    description: 'Even though federal law does not mandate a work permit for 16 year olds, many states still require one. Visit your school office or your state labor department website before you apply to avoid delays after receiving a job offer.',
  },
  {
    title: 'Lead With What You Have',
    description: 'Without formal work experience, your school activities, volunteer roles, sports teams, and community involvement are exactly what employers want to see. Highlight leadership, reliability, and commitment wherever you find them.',
  },
  {
    title: 'Target Employers Who Regularly Hire Teens',
    description: 'Grocery chains, fast food restaurants, retail stores, and recreation centers consistently hire 16 year olds and often have structured onboarding for first time workers. Starting here builds experience that opens doors to better roles.',
  },
  {
    title: 'Know Your Rights Before You Start',
    description: 'According to the U.S. Department of Labor, every worker regardless of age is entitled to receive at least the applicable minimum wage, work in a safe environment, and be protected from discrimination. Knowing your rights before day one gives you confidence and protects you from exploitation.',
  },
]

export default async function JobsFor16YearOldsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'jobs for 16 year olds', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'jobs for 16 year olds', where: params.where || '', results_per_page: 30, page: 1 }),
])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ✅ FAQPage schema — active les rich snippets dépliables dans Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Jobs for 16 Year Olds Available Across the United States
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
          </p>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="Jobs for 16 year olds" />
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
                what={params.what || 'Jobs for 16 year olds'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Sectors */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Jobs 16 Year Olds Can Apply For</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            At 16, you gain access to significantly more employment options than younger teens. According to the U.S. Department of Labor, 16 and 17 year olds may work in any non hazardous occupation without federal hour restrictions, making a wide range of industries open to you.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobSectors.map((sector, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <sector.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{sector.title}</h3>
                <p className="text-gray-600 text-sm">{sector.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Working Hours */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Working Hour Rules for 16 Year Olds</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Department of Labor, the Fair Labor Standards Act does not set federal hour limits for workers aged 16 and 17. However, individual states have the authority to impose their own restrictions. Always check your state labor department for the rules that apply where you live.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workingHours.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.rule}</p>
                <p className="text-gray-600 text-sm">{item.hours}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Department of Labor, Wage and Hour Division, Child Labor Provisions of the Fair Labor Standards Act (FLSA)
          </p>
        </section>

        {/* Prohibited Jobs */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Jobs 16 Year Olds Are Not Allowed to Do</h2>
                <p className="text-gray-700 mb-4">
                  According to Child Labor Bulletin 101 published by the U.S. Department of Labor, workers under 18 are prohibited from employment in occupations declared hazardous by the Secretary of Labor. These restrictions apply regardless of parental consent or employer request.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {prohibitedJobs.map((item, index) => (
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

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Can a 16 Year Old Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Department of Labor, the federal minimum wage is $7.25 per hour. Employers may pay a youth minimum wage of $4.25 per hour during the first 90 consecutive calendar days of a new job. Many states have higher rates that apply to all workers, meaning your actual hourly wage may be significantly more depending on your location.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$7.25</p>
                <p className="text-sm text-gray-600">Federal Minimum Wage</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$4.25</p>
                <p className="text-sm text-gray-600">Youth Rate (First 90 Days)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$17+</p>
                <p className="text-sm text-gray-600">Some State Minimums</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Minimum wage rates vary significantly by state and city. Check your state labor department for the current rate applicable in your area.
            </p>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Land Your First Job at 16</h2>
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

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Jobs for 16 Year Olds</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal advice. Youth labor laws vary by state and some states impose stricter requirements than federal law. Always consult the U.S. Department of Labor at dol.gov or your state labor department for current regulations applicable to minor workers in your area. Parents and guardians are encouraged to review all employment conditions before a minor begins work.
          </p>
        </section>
      </div>
    </>
  )
}