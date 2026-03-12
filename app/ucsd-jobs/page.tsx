import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, Award } from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent UCSD Jobs Hiring Now | University of California San Diego Careers',
  description: 'Hundreds of UCSD jobs are hiring immediately at the University of California, San Diego. Campus, research, administrative, and student positions with excellent benefits and competitive pay. Apply today before positions fill up!',
  keywords: 'ucsd jobs, university of california san diego jobs, ucsd careers, ucsd employment, jobs at ucsd, uc san diego hiring, ucsd staff jobs, ucsd student jobs',
  openGraph: {
    title: 'Urgent UCSD Jobs Hiring Now | Apply at University of California San Diego',
    description: 'Discover hundreds of open UCSD jobs right now. From research roles to campus operations and student employment. Competitive salaries, full benefits, and career growth at one of America’s top public universities.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UCSD Jobs Hiring Now | University of California San Diego',
    description: 'Hundreds of positions open at UC San Diego. Great pay, benefits, and the chance to work at a world-class research university. Apply in minutes.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/ucsd-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'UCSD Jobs',
  description: 'Find current job openings at the University of California, San Diego. Campus, research, administrative, and student positions available now.',
  url: 'https://www.oh-my-job.com/ucsd-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available UCSD Jobs',
    description: 'Current job listings at University of California San Diego',
  },
}

const jobCategories = [
  {
    title: 'Research Assistant & Lab Positions',
    description: 'Support groundbreaking research in biology, medicine, engineering, and ocean sciences at one of the top public research universities in the nation.',
    icon: Award,
  },
  {
    title: 'Administrative & Staff Roles',
    description: 'Work in university operations, finance, human resources, student services, and campus management across all UCSD departments.',
    icon: Briefcase,
  },
  {
    title: 'Student Employment & Work-Study',
    description: 'On-campus jobs for current UCSD students including library assistants, tutoring, dining services, and research support.',
    icon: Users,
  },
  {
    title: 'Facilities & Campus Operations',
    description: 'Roles in maintenance, security, transportation, housing, and grounds keeping that keep the UCSD campus running smoothly.',
    icon: MapPin,
  },
  {
    title: 'Healthcare & Clinical Positions',
    description: 'Jobs at UC San Diego Health including medical assistants, administrative support, and research coordinators at the world-renowned medical center.',
    icon: Shield,
  },
  {
    title: 'Information Technology & Data Roles',
    description: 'Support UCSD’s advanced computing infrastructure, data science initiatives, and digital transformation projects.',
    icon: Clock,
  },
]

const benefits = [
  {
    title: 'Comprehensive Health Coverage',
    description: 'Medical, dental, and vision plans for employees and eligible family members through the University of California system.',
  },
  {
    title: 'Retirement & Pension Plans',
    description: 'Generous 401(k) matching and defined benefit pension options available to UCSD employees.',
  },
  {
    title: 'Paid Time Off & Holidays',
    description: 'Competitive vacation, sick leave, and university holidays including winter closure.',
  },
  {
    title: 'Tuition Reduction Program',
    description: 'Significant tuition discounts for employees and their dependents at all University of California campuses.',
  },
]

const faqs = [
  {
    question: 'How do I apply for UCSD jobs?',
    answer: 'According to the official UC San Diego careers website, all open positions are posted on the UCSD employment portal. Applications are submitted online through the UC Recruit system. Most positions require a resume, cover letter, and sometimes references or transcripts.',
  },
  {
    question: 'Does UCSD hire international students?',
    answer: 'Yes, according to the University of California policy and U.S. immigration regulations, UCSD hires qualified international students who have the legal right to work in the United States. On-campus student employment is available to F-1 visa holders under specific CPT or OPT guidelines.',
  },
  {
    question: 'What is the average salary at UCSD?',
    answer: 'According to the University of California’s official salary database and the U.S. Bureau of Labor Statistics, salaries at UC San Diego vary by role and experience. Administrative staff typically earn between $55,000 and $85,000 annually, while research and specialized positions often range from $70,000 to over $120,000.',
  },
  {
    question: 'Are student jobs at UCSD considered work-study?',
    answer: 'The University of California, San Diego participates in the Federal Work-Study Program. Eligible students can find part-time on-campus jobs through the UCSD Financial Aid Office. These positions help students gain experience while offsetting educational costs.',
  },
  {
    question: 'Does UCSD offer career advancement opportunities?',
    answer: 'Yes. According to the UCSD Human Resources website, the university promotes internal mobility and professional development. Many staff members advance from entry-level roles to supervisory and leadership positions within the University of California system.',
  },
]

const tips = [
  {
    title: 'Tailor Your Application to UCSD Values',
    description: 'Highlight experience that aligns with UCSD’s mission of research excellence, diversity, and public service. The university specifically looks for candidates who demonstrate collaboration and innovation.',
  },
  {
    title: 'Use the Official UCSD Careers Portal',
    description: 'Always apply through the official UC San Diego employment site. External job boards may not reflect the most current openings or UCSD-specific requirements.',
  },
  {
    title: 'Prepare for the UC Recruit System',
    description: 'The UC system uses a standardized application platform. Have your resume, work history, and references ready in a digital format before starting the application.',
  },
  {
    title: 'Check for Student Employment Opportunities',
    description: 'Current UCSD students should also explore Handshake and the UCSD Career Center for on-campus jobs and internships.',
  },
]

export default async function UCSDJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'University of California, San Diego', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'University of California, San Diego', where: params.where || '', results_per_page: 30, page: 1 }),
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
            Urgent UCSD Jobs Hiring Now at University of California San Diego
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="University of California, San Diego" />
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
                what={params.what || 'University of California, San Diego'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Jobs at UCSD */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Jobs Available at UCSD</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The University of California, San Diego offers a wide range of career opportunities across campus, research facilities, and UC San Diego Health. According to the official UCSD Human Resources website, positions span academic support, administrative services, technical roles, and student employment.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits of Working at UCSD */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why Work at UCSD</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the University of California system, employees at UC San Diego enjoy one of the most comprehensive benefits packages in higher education.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Apply */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Apply for UCSD Jobs</h2>
              <p className="text-gray-700 mb-6">
                According to the official UC San Diego careers portal, all applications are submitted through the UC Recruit system. The process is straightforward and designed to be accessible for both internal and external candidates.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="font-bold text-blue-600 w-6">1</div>
                  <div>Create an account on the UCSD employment portal</div>
                </div>
                <div className="flex gap-4">
                  <div className="font-bold text-blue-600 w-6">2</div>
                  <div>Search for open positions using keywords like “UCSD” or department name</div>
                </div>
                <div className="flex gap-4">
                  <div className="font-bold text-blue-600 w-6">3</div>
                  <div>Submit your resume, cover letter, and any required documents</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a UCSD Job</h2>
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
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About UCSD Jobs</h2>
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
            <strong>Disclaimer:</strong> This page is for informational purposes only and is not affiliated with or endorsed by the University of California, San Diego. Job availability, salaries, and application processes are subject to change. Always refer to the official UCSD careers website at jobs.ucsd.edu or contact UCSD Human Resources for the most current information.
          </p>
        </section>
      </div>
    </>
  )
}