import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, TrendingUp, DollarSign, Clock, Users, Target, Zap, Award, MapPin, CheckCircle, Smartphone, Package, BookOpen } from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent: DoorDash Careers & Jobs Hiring Now | 1000+ Positions Available',
  description: 'DoorDash is urgently hiring nationwide! Explore 1000+ career opportunities as a Dasher, in corporate roles, engineering, operations & more. Flexible schedules, competitive pay. Apply today and start earning immediately!',
  keywords: 'doordash careers, doordash jobs, dasher jobs, doordash hiring, work for doordash, doordash employment, doordash driver jobs, doordash corporate careers',
  openGraph: {
    title: 'Now Hiring: DoorDash Careers | Urgent Need for Dashers & Corporate Roles',
    description: 'Join DoorDash today! 1000+ urgent openings for Dashers, engineers, operations specialists & corporate teams. Flexible work, great pay, immediate start available.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoorDash Careers | Hiring Immediately Nationwide',
    description: 'DoorDash is urgently hiring! Find Dasher positions, corporate careers, and tech roles. Apply now and start your DoorDash journey today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/doordash-careers',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'DoorDash Careers and Jobs',
  description: 'Explore current DoorDash career opportunities including Dasher positions, corporate roles, engineering jobs, and operations positions across the United States.',
  url: 'https://www.oh-my-job.com/doordash-careers',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available DoorDash Career Opportunities',
    description: 'Current job listings at DoorDash across all departments and locations',
  },
}

const careerPaths = [
  { title: 'Dasher (Delivery Driver)', description: 'Deliver food and essentials with flexible hours and competitive pay', icon: Package },
  { title: 'Engineering & Technology', description: 'Build innovative solutions for logistics and food delivery', icon: Smartphone },
  { title: 'Corporate & Operations', description: 'Drive business strategy and operational excellence', icon: Briefcase },
  { title: 'Sales & Partnerships', description: 'Grow merchant relationships and expand market reach', icon: TrendingUp },
  { title: 'Marketing & Communications', description: 'Shape brand strategy and customer engagement', icon: Target },
  { title: 'Customer Support', description: 'Provide exceptional service to Dashers and customers', icon: Users },
]

const dasherBenefits = [
  { benefit: 'Flexible Schedule', detail: 'Work when you want, wherever you want' },
  { benefit: 'Weekly Pay', detail: 'Get paid weekly via direct deposit' },
  { benefit: 'Instant Pay Option', detail: 'Cash out earnings instantly with DasherDirect' },
  { benefit: 'Promotions & Bonuses', detail: 'Earn extra through Peak Pay and Challenges' },
  { benefit: 'Low Barrier to Entry', detail: 'Start earning with minimal requirements' },
]

const corporateBenefits = [
  { benefit: 'Comprehensive Health Coverage', detail: 'Medical, dental, vision, and mental health benefits' },
  { benefit: 'Equity Opportunities', detail: 'Restricted Stock Units (RSUs) for eligible employees' },
  { benefit: 'Flexible Work Environment', detail: 'Hybrid and remote work options available' },
  { benefit: 'Professional Development', detail: 'Learning stipends and career growth programs' },
  { benefit: 'Generous Time Off', detail: 'Paid vacation, sick leave, and parental leave' },
  { benefit: '401(k) Retirement Plan', detail: 'Company match to help you save for the future' },
]

const dasherRequirements = [
  'Be at least 18 years old (19+ in certain states)',
  'Have access to a vehicle, bike, or scooter',
  'Valid driver\'s license and insurance (for car delivery)',
  'Pass a background check',
  'Own a smartphone (iPhone or Android)',
  'Social Security number for tax purposes',
]

const faqs = [
  {
    question: 'How do I apply for a DoorDash Dasher position?',
    answer: 'To become a Dasher, visit the DoorDash website or download the Dasher app. The application process takes about 15 minutes and includes providing your basic information, completing a background check, and setting up direct deposit. According to DoorDash, most applicants can start dashing within a few days of approval.',
  },
  {
    question: 'What are the requirements to work as a Dasher?',
    answer: 'According to DoorDash\'s official requirements, you must be at least 18 years old (19+ in some states), have access to a vehicle or bike, possess a valid driver\'s license and insurance if using a car, and be able to pass a background check. You also need a smartphone to use the Dasher app.',
  },
  {
    question: 'How much can I earn as a DoorDash driver?',
    answer: 'Earnings vary based on location, time, and demand. According to DoorDash, Dashers earn base pay per delivery plus 100% of customer tips. During busy times, you can earn additional Peak Pay bonuses. Many Dashers report earning between $15 to $25 per hour, though actual earnings depend on multiple factors including your market and efficiency.',
  },
  {
    question: 'Does DoorDash offer corporate career opportunities?',
    answer: 'Yes, DoorDash offers a wide range of corporate positions at their headquarters in San Francisco and other offices nationwide. According to their careers page, they hire for roles in engineering, product management, operations, marketing, sales, finance, HR, and more. These positions typically include competitive salaries, equity compensation, and comprehensive benefits.',
  },
  {
    question: 'What is the hiring process for corporate roles at DoorDash?',
    answer: 'For corporate positions, the DoorDash hiring process typically includes submitting an online application, initial phone screening with a recruiter, technical or role specific interviews, team interviews, and a final decision. The entire process can take 2 to 4 weeks depending on the role and team.',
  },
  {
    question: 'Can I work as a Dasher part time?',
    answer: 'Absolutely. One of the main advantages of being a Dasher is the flexibility to work as much or as little as you want. You can dash part time around your existing schedule, making it ideal for students, parents, or anyone seeking supplemental income. There are no minimum hour requirements.',
  },
]

const applicationTips = [
  {
    title: 'Complete Your Profile Thoroughly',
    description: 'Whether applying for a Dasher or corporate position, ensure all information is accurate and complete. For corporate roles, highlight relevant experience and skills that align with DoorDash\'s mission and values.',
  },
  {
    title: 'Understand DoorDash\'s Mission',
    description: 'Research DoorDash\'s values and goals. The company emphasizes empowering local economies and creating opportunities. Demonstrating knowledge of their mission can strengthen your application.',
  },
  {
    title: 'Prepare for the Background Check',
    description: 'For Dasher positions, ensure you meet all requirements and have necessary documents ready. Background checks typically review driving history and criminal records from the past seven years.',
  },
  {
    title: 'Showcase Relevant Skills',
    description: 'For corporate roles, emphasize skills like problem solving, data analysis, customer focus, and innovation. DoorDash values candidates who can contribute to their fast paced, tech driven environment.',
  },
]

export default async function DoorDashCareersPage({ searchParams }: any) {
  const params = await searchParams

  const { count } = await getCachedJobCount(
    params.what || 'doordash careers',
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
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            DoorDash Careers and Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="doordash careers" />
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
                what={params.what || 'doordash careers'}
                where={params.where || ''}
                salary_min={params.salary_min}
              />
            </Suspense>
          </div>
        </div>

        {/* Career Paths at DoorDash */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Paths at DoorDash</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            DoorDash offers diverse career opportunities ranging from flexible delivery work to high impact corporate roles. Whether you are looking for part time income or a full time career in tech, operations, or business, DoorDash provides paths for growth and development.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerPaths.map((career, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <career.icon className="w-10 h-10 text-red-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{career.title}</h3>
                <p className="text-gray-600 text-sm">{career.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dasher Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Benefits of Being a DoorDash Dasher</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to DoorDash, Dashers enjoy the freedom to be their own boss while earning competitive pay. The platform is designed to provide flexibility and financial opportunity with minimal barriers to entry.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dasherBenefits.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.benefit}</p>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Corporate Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Corporate Employee Benefits at DoorDash</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            DoorDash provides comprehensive benefits for corporate employees, demonstrating their commitment to employee wellbeing and professional growth. According to their careers page, full time employees receive a competitive total compensation package.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {corporateBenefits.map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">{item.benefit}</p>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dasher Requirements */}
        <section className="mt-20">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements to Become a DoorDash Dasher</h2>
                <p className="text-gray-700 mb-4">
                  According to DoorDash official requirements, becoming a Dasher is straightforward. Here is what you need to get started delivering with DoorDash:
                </p>
                <ul className="space-y-2">
                  {dasherRequirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  Note: Requirements may vary slightly by city or state. Some markets allow delivery by bike or scooter without a driver license.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Potential */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">DoorDash Earnings and Compensation</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$15-$25</p>
                <p className="text-sm text-gray-600">Average Hourly Earnings for Dashers</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">100%</p>
                <p className="text-sm text-gray-600">Keep All Tips from Customers</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">Weekly</p>
                <p className="text-sm text-gray-600">Fast Pay Direct Deposit</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              According to DoorDash, Dasher earnings consist of base pay for each delivery, 100% of customer tips, and potential promotions like Peak Pay during busy times. Actual earnings vary by location, time of day, and individual efficiency.
            </p>
            <p className="text-gray-700">
              For corporate positions, DoorDash offers competitive salaries that align with industry standards in the tech sector. Many roles also include equity compensation through Restricted Stock Units (RSUs), annual bonuses, and comprehensive benefits packages.
            </p>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Applying to DoorDash Careers</h2>
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

        {/* Work Flexibility */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Flexible Work Options at DoorDash</h2>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              DoorDash understands the importance of work life balance. For Dashers, you have complete control over your schedule with no minimum hours or commitments. For corporate employees, DoorDash offers flexible work arrangements to support productivity and personal wellbeing.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">For Dashers</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Work anytime: mornings, evenings, or weekends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Choose your delivery zone and preferred areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Accept or decline deliveries at your discretion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Pause and resume dashing as needed</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">For Corporate Employees</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Hybrid work models combining office and remote</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Fully remote positions available for many roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Flexible hours to accommodate personal needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Generous PTO and leave policies</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About DoorDash Careers</h2>
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

        {/* Growth Opportunities */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth and Development at DoorDash</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              DoorDash is committed to employee development and career advancement. According to their corporate culture statements, they invest in their people through various programs and opportunities for growth.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Learning & Development</h3>
                <p className="text-gray-600 text-sm">Access to courses, workshops, and learning stipends</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Internal Mobility</h3>
                <p className="text-gray-600 text-sm">Opportunities to move between teams and roles</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Mentorship Programs</h3>
                <p className="text-gray-600 text-sm">Connect with experienced professionals for guidance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Company Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl mb-4">
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or sponsored by DoorDash, Inc. All company names, logos, and trademarks are the property of their respective owners. The information provided on this page is for general informational purposes only and is based on publicly available sources. Job listings, requirements, benefits, and compensation details may change without notice. For the most current and accurate information about DoorDash careers, please visit the official DoorDash careers website.
          </p>
          <p className="text-sm text-gray-500 max-w-4xl">
            The job postings displayed on this page are aggregated from various sources and may include positions from DoorDash as well as related opportunities from other employers. Always verify job details, requirements, and benefits directly with the employer before applying.
          </p>
        </section>
      </div>
    </>
  )
}