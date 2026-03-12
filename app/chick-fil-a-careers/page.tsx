import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Heart, DollarSign, GraduationCap, CheckCircle, Users, Award, Coffee, Calendar, Star, HelpCircle } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Urgent: Chick-fil-A Careers Hiring Now | Apply Today',
  description: 'Discover 500+ Chick-fil-A careers hiring immediately near you. Join a company ranked #1 in customer satisfaction. Flexible schedules, scholarships, and growth opportunities. Apply in minutes!',
  keywords: 'chick-fil-a careers, chick-fil-a jobs, chick-fil-a hiring, work at chick-fil-a, chick-fil-a employment, chick-fil-a team member, chick-fil-a application',
  openGraph: {
    title: 'Chick-fil-A Careers | Immediate Openings Available',
    description: 'Join the Chick-fil-A team today. Competitive pay, flexible hours, scholarship opportunities, and a positive work environment. Hundreds of positions available now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chick-fil-A Careers | Now Hiring',
    description: 'Ready to join a top-rated employer? Find Chick-fil-A careers near you. Great benefits, growth opportunities, and a supportive team culture await.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/chick-fil-a-careers',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Chick-fil-A Careers',
  description: 'Find Chick-fil-A careers and job opportunities near you. Browse current openings for team members, shift leaders, and management positions.',
  url: 'https://www.oh-my-job.com/chick-fil-a-careers',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Chick-fil-A Careers',
    description: 'Current job listings at Chick-fil-A locations nationwide',
  },
}

const jobTypes = [
  { title: 'Team Member', description: 'Serve guests, prepare food, and maintain restaurant cleanliness', icon: Users },
  { title: 'Cashier', description: 'Handle transactions and provide excellent customer service at the counter', icon: DollarSign },
  { title: 'Kitchen Staff', description: 'Prepare menu items following Chick-fil-A quality standards', icon: Coffee },
  { title: 'Drive Thru Specialist', description: 'Ensure fast and friendly service for drive thru guests', icon: Clock },
  { title: 'Shift Leader', description: 'Supervise team members and manage daily operations', icon: Award },
  { title: 'Director or Manager', description: 'Lead restaurant operations and develop team members', icon: Briefcase },
]

const benefits = [
  { benefit: 'Flexible Scheduling', description: 'Work around school, family, or other commitments' },
  { benefit: 'Scholarship Opportunities', description: 'Access to the Remarkable Futures Scholarship program' },
  { benefit: 'Sundays Off', description: 'All Chick-fil-A restaurants are closed on Sundays' },
  { benefit: 'Free Meals', description: 'Complimentary meals during shifts at many locations' },
  { benefit: 'Leadership Development', description: 'Training programs to grow your career' },
  { benefit: 'Positive Work Environment', description: 'Join a team focused on care and respect' },
]

const applicationSteps = [
  { step: 'Find a Location', description: 'Search for Chick-fil-A restaurants hiring in your area' },
  { step: 'Submit Your Application', description: 'Complete the online application with your availability and experience' },
  { step: 'Interview Process', description: 'Participate in one or more interviews with the Operator or leadership team' },
  { step: 'Background Check', description: 'Complete any required screening processes' },
  { step: 'Onboarding and Training', description: 'Begin your journey with comprehensive training programs' },
]

const faqs = [
  {
    question: 'What is the minimum age to work at Chick-fil-A?',
    answer: 'According to the U.S. Department of Labor, federal law sets the minimum working age at 14 for non hazardous jobs. However, most Chick-fil-A locations prefer to hire team members who are at least 16 years old. Age requirements can vary by state and by individual franchise Operator, so it is best to check with your local restaurant.',
  },
  {
    question: 'Does Chick-fil-A offer scholarships to employees?',
    answer: 'Yes, Chick-fil-A offers the Remarkable Futures Scholarship program. Since 1973, Chick-fil-A has invested over $136 million in scholarships for team members. Eligible employees can receive scholarships ranging from $1,000 to $25,000 to pursue higher education.',
  },
  {
    question: 'What are the typical work hours at Chick-fil-A?',
    answer: 'Chick-fil-A restaurants typically operate Monday through Saturday, with hours varying by location: commonly 6:00 AM to 10:00 PM. All Chick-fil-A locations are closed on Sundays. Part time and full time positions are available with flexible scheduling options.',
  },
  {
    question: 'How much does Chick-fil-A pay?',
    answer: 'Pay rates vary by location and position. According to the U.S. Bureau of Labor Statistics, fast food workers earn a median hourly wage. Many Chick-fil-A locations offer competitive wages above the federal minimum wage of $7.25 per hour, with some locations paying $15 or more per hour depending on the role and local market.',
  },
  {
    question: 'What should I wear to a Chick-fil-A interview?',
    answer: 'Business casual attire is recommended for Chick-fil-A interviews. Clean, pressed clothing such as khakis or dress pants with a collared shirt demonstrates professionalism. Avoid overly casual items like ripped jeans, flip flops, or clothing with large logos.',
  },
  {
    question: 'Is previous experience required to work at Chick-fil-A?',
    answer: 'No, previous experience is not required for most entry level positions. Chick-fil-A is known for providing comprehensive training to all new team members. A positive attitude, willingness to learn, and commitment to customer service are valued more than prior work history.',
  },
]

const interviewTips = [
  {
    title: 'Research the Company',
    description: 'Learn about Chick-fil-A values, history, and the unique Operator model. Understanding their commitment to service excellence will help you stand out.',
  },
  {
    title: 'Emphasize Customer Service',
    description: 'Chick-fil-A is renowned for exceptional customer service. Share examples of how you have helped others or gone above and beyond in past experiences.',
  },
  {
    title: 'Show Enthusiasm',
    description: 'Express genuine interest in joining the team. Chick-fil-A looks for candidates who bring positive energy and a willingness to contribute to team success.',
  },
  {
    title: 'Be Ready for Behavioral Questions',
    description: 'Prepare examples of teamwork, handling challenges, and providing great service. Use the STAR method (Situation, Task, Action, Result) to structure your answers.',
  },
]

export default async function ChickFilACareersPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'chick-fil-a', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'chick-fil-a', where: params.where || '', results_per_page: 30, page: 1 })
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
            Chick-fil-A Careers Available Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="chick-fil-a" />
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
                what={params.what || 'chick-fil-a'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Why Work at Chick-fil-A Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why Choose a Career at Chick-fil-A?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Chick-fil-A has consistently been recognized as one of the top employers in the quick service restaurant industry. According to the American Customer Satisfaction Index, Chick-fil-A has ranked number one in customer satisfaction among fast food restaurants for multiple consecutive years. This commitment to excellence extends to how they treat their team members.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.benefit}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Types Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Chick-fil-A Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Chick-fil-A restaurants offer a variety of positions to match different skills and career goals. Each Chick-fil-A location is independently owned and operated by a local Operator, which means each restaurant functions as a small business with opportunities for growth and advancement.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobTypes.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-red-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Process Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Apply for Chick-fil-A Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The application process for Chick-fil-A positions is straightforward. Because each restaurant is independently operated, hiring decisions are made by the local Operator. Here is what you can expect when applying:
          </p>
          <div className="space-y-4">
            {applicationSteps.map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 font-bold rounded-full text-lg flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.step}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scholarship Program Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <GraduationCap className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Remarkable Futures Scholarship Program</h2>
              <p className="text-gray-700 mb-4">
                One of the standout benefits of working at Chick-fil-A is access to the Remarkable Futures Scholarship program. Since its founding, Chick-fil-A has awarded over $136 million in scholarships to help team members pursue their educational goals.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-2">$136M+</p>
                  <p className="text-sm text-gray-600">Total Scholarships Awarded</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-2">$25,000</p>
                  <p className="text-sm text-gray-600">Leadership Scholarship Amount</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-2">Since 1973</p>
                  <p className="text-sm text-gray-600">Program Established</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-6">
                Eligible team members can apply for scholarships regardless of their field of study. The program demonstrates Chick-fil-A's commitment to investing in the futures of their employees beyond their time at the restaurant.
              </p>
            </div>
          </div>
        </section>

        {/* Interview Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Your Chick-fil-A Interview</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {interviewTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-yellow-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Age Requirements Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Age Requirements and Work Permits</h2>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              According to the U.S. Department of Labor, the Fair Labor Standards Act (FLSA) establishes 14 as the minimum age for most non agricultural employment. However, hiring practices at Chick-fil-A restaurants can vary:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">General Guidelines</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Most locations prefer applicants 16 years or older</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Some locations may hire 14 and 15 year olds for limited roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Management positions typically require applicants to be 18 or older</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Work Permit Requirements</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Minors under 16 may need work permits in most states</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Contact your school or state labor department for requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Federal law limits work hours for employees under 16</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pay and Compensation Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Chick-fil-A Pay and Compensation</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Compensation at Chick-fil-A varies by location, position, and experience. According to the U.S. Bureau of Labor Statistics, quick service restaurant wages have been rising across the industry. Many Chick-fil-A Operators offer competitive wages and additional perks to attract and retain team members.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$12 to $18</p>
                <p className="text-sm text-gray-600">Typical Hourly Range for Team Members</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$15 to $22</p>
                <p className="text-sm text-gray-600">Typical Hourly Range for Shift Leaders</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$45K to $70K</p>
                <p className="text-sm text-gray-600">Typical Annual Salary for Managers</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Pay rates vary significantly by location and market. These figures represent general ranges based on industry data. Actual compensation is determined by each independent Operator.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Chick-fil-A Careers</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is not affiliated with, endorsed by, or connected to Chick-fil-A, Inc. or any of its subsidiaries. Chick-fil-A is a registered trademark of CFA Properties, Inc. The information provided on this page is for general informational purposes only. Each Chick-fil-A restaurant is independently owned and operated by a franchised Operator, and employment terms, benefits, and pay rates may vary by location. For the most accurate and current information about employment opportunities, please contact your local Chick-fil-A restaurant directly or visit the official Chick-fil-A careers website.
          </p>
        </section>
      </div>
    </>
  )
}