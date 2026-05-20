import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
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
  Zap,
  HardHat,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Electrician Jobs | Residential, Commercial & Industrial',
  description:
    'Electrician jobs hiring immediately across the United States. Apprentice to master electrician openings at top contractors, construction firms, and industrial employers. Excellent pay and benefits. Apply now!',
  keywords:
    'electrician jobs, electrician jobs near me, electrician hiring now, journeyman electrician jobs, master electrician jobs, apprentice electrician jobs, electrical contractor jobs, industrial electrician jobs',
  openGraph: {
    title: 'Electrician Jobs | Openings Near You in All 50 States',
    description:
      'Find electrician jobs hiring immediately in your area. Apprentice, journeyman, and master electrician positions available at leading contractors. Competitive wages and union opportunities. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Electrician Jobs | Union & Non-Union Positions Near You',
    description:
      'Hundreds of electrician jobs open right now. Residential, commercial, and industrial roles. Union and non-union. Apply today and start your next project.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/electrician-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Electrician Jobs',
  description:
    'Find electrician jobs hiring near you. Browse hundreds of openings for apprentice, journeyman, and master electricians across the United States.',
  url: 'https://www.oh-my-job.com/electrician-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Electrician Jobs',
    description: 'Current electrician job listings across the United States',
  },
}

const electricianRoles = [
  {
    title: 'Apprentice Electrician',
    description:
      'The entry point into the trade. Apprentices work under licensed journeymen, gaining hands-on experience while completing classroom training through a registered apprenticeship program.',
    icon: BookOpen,
  },
  {
    title: 'Journeyman Electrician',
    description:
      'A licensed electrician who has completed an apprenticeship and passed a state exam. Journeymen can work independently on most electrical installations and repairs.',
    icon: Zap,
  },
  {
    title: 'Master Electrician',
    description:
      'The highest license level. Master electricians can design electrical systems, pull permits, and supervise other electricians. Required to open an electrical contracting business in most states.',
    icon: Award,
  },
  {
    title: 'Residential Electrician',
    description:
      'Specializes in wiring, panel upgrades, and electrical repairs in single-family homes and multi-unit residential buildings.',
    icon: Briefcase,
  },
  {
    title: 'Commercial Electrician',
    description:
      'Installs and maintains electrical systems in office buildings, retail spaces, hospitals, and other commercial properties. Typically follows the National Electrical Code (NEC) strictly.',
    icon: HardHat,
  },
  {
    title: 'Industrial Electrician',
    description:
      'Works in manufacturing plants, warehouses, and industrial facilities. Involves high-voltage systems, PLCs, motors, and specialized industrial equipment.',
    icon: TrendingUp,
  },
]

const apprenticeshipFacts = [
  {
    title: 'Registered Apprenticeship Programs',
    detail:
      'According to the U.S. Department of Labor, registered electrician apprenticeships typically last 4 to 5 years and combine 8,000 or more hours of on-the-job training with 144 or more hours of technical instruction per year. Apprentices are paid from day one.',
  },
  {
    title: 'IBEW and NECA Programs',
    detail:
      'The International Brotherhood of Electrical Workers (IBEW) and the National Electrical Contractors Association (NECA) jointly sponsor some of the most respected apprenticeship programs in the country, available through local Joint Apprenticeship and Training Committees (JATCs).',
  },
  {
    title: 'Non-Union Apprenticeships',
    detail:
      'The Independent Electrical Contractors (IEC) association also sponsors registered apprenticeship programs for those who prefer to train outside the union structure. Both pathways lead to journeyman licensure.',
  },
  {
    title: 'Earn While You Learn',
    detail:
      'According to Apprenticeship.gov, the official website of the U.S. Government, apprentice electricians typically start at 40 to 50 percent of the journeyman wage scale and receive regular raises as they advance through their program.',
  },
]

const salaryData = [
  { label: 'Apprentice Electrician (Year 1)', range: '$18 to $24/hr' },
  { label: 'Apprentice Electrician (Year 4 to 5)', range: '$26 to $34/hr' },
  { label: 'Journeyman Electrician', range: '$30 to $50/hr' },
  { label: 'Master Electrician', range: '$40 to $65/hr' },
  { label: 'Industrial Electrician', range: '$35 to $60/hr' },
  { label: 'Electrical Foreman / Supervisor', range: '$50,000 to $95,000/yr' },
]

const licenseByState = [
  { state: 'California', body: 'Contractors State License Board (CSLB)', notes: 'C-10 Electrical Contractor license required to run a business. Journeyman certification issued separately.' },
  { state: 'Texas', body: 'Texas Department of Licensing and Regulation (TDLR)', notes: 'Apprentice, Journeyman, Master, and Electrical Contractor licenses all issued by TDLR.' },
  { state: 'Florida', body: 'Florida Department of Business and Professional Regulation (DBPR)', notes: 'Certified or Registered Electrical Contractor license required. Local journeyman licensing also common.' },
  { state: 'New York', body: 'New York Department of State (DOS)', notes: 'Licensing is primarily local. New York City, for example, requires a Master Electrician license to pull permits.' },
  { state: 'Illinois', body: 'Illinois Department of Public Health and local municipalities', notes: 'No statewide journeyman license. Licensing requirements set at the local level in most jurisdictions.' },
]

const nECFacts = [
  'The National Electrical Code (NEC), published by the National Fire Protection Association (NFPA), is adopted by all 50 states and governs electrical installation standards across the country.',
  'According to the NFPA, the NEC is updated every three years. Electricians are expected to work in compliance with whichever edition their jurisdiction has adopted.',
  'OSHA Standard 29 CFR 1910.303 establishes federal safety requirements for electrical installations in general industry, including proper wiring, guarding of live parts, and working clearances.',
  'According to the U.S. Bureau of Labor Statistics, electricians had a fatal injury rate of 6.0 per 100,000 full-time equivalent workers in 2022, underscoring the importance of safety compliance and proper training.',
]

const faqs = [
  {
    question: 'What license do I need to work as an electrician in the United States?',
    answer:
      'Licensing requirements vary by state and, in some cases, by city. According to the U.S. Department of Labor, most states require electricians to be licensed at the journeyman or master level to work independently or supervise others. To become a journeyman, you typically must complete a registered apprenticeship program and pass a state licensing exam. Contact your state licensing board for the exact requirements in your jurisdiction.',
  },
  {
    question: 'How do I become an electrician apprentice?',
    answer:
      'According to Apprenticeship.gov, the official U.S. Government resource for registered apprenticeships, you can apply to a Joint Apprenticeship and Training Committee (JATC) sponsored by the IBEW and NECA, or to an Independent Electrical Contractors (IEC) program. Applicants typically need a high school diploma or GED, must be at least 18 years old, and may need to pass an aptitude test. You can search for registered programs directly at apprenticeship.gov.',
  },
  {
    question: 'How much does a journeyman electrician earn?',
    answer:
      'According to the U.S. Bureau of Labor Statistics, the median annual wage for electricians was $61,590 in May 2023, with the top 10 percent earning more than $100,000 per year. Union journeymen in major metropolitan areas often earn significantly more. Wages also vary by specialty, with industrial electricians and those working in the oil and gas sector typically earning the highest rates.',
  },
  {
    question: 'What is the job outlook for electricians?',
    answer:
      'The job outlook for electricians is strong. According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of electricians is projected to grow 11 percent from 2022 to 2032, much faster than the average for all occupations. Growth is driven by construction activity, the expansion of renewable energy infrastructure such as solar and EV charging, and the need to upgrade aging electrical systems nationwide.',
  },
  {
    question: 'What is the difference between a union and non-union electrician job?',
    answer:
      'Union electricians are members of a labor union, most commonly the International Brotherhood of Electrical Workers (IBEW). Union jobs typically offer collectively bargained wages, health insurance, pension plans, and access to structured apprenticeship programs. Non-union electricians may work for independent contractors and can negotiate their own terms. Both career paths lead to journeyman and master licensure.',
  },
  {
    question: 'Are electricians required to follow specific safety standards?',
    answer:
      'Yes. According to the U.S. Department of Labor Occupational Safety and Health Administration (OSHA), electricians must comply with federal safety regulations including OSHA Standard 29 CFR 1910 for general industry and 29 CFR 1926 for construction. All electrical work must also conform to the National Electrical Code (NEC) as adopted by the relevant state or municipality. Employers are legally required to provide appropriate personal protective equipment (PPE) and safety training.',
  },
]

const tips = [
  {
    title: 'Apply to a Registered Apprenticeship Program',
    description:
      'The structured path into the trade is through a registered apprenticeship. Visit apprenticeship.gov to find IBEW, NECA, or IEC programs near you. Applications typically open once or twice a year.',
  },
  {
    title: 'Earn Your OSHA 10 or OSHA 30 Card',
    description:
      'Completing an OSHA 10-hour or 30-hour construction safety course demonstrates safety awareness and is required or strongly preferred by many electrical contractors before your first day on site.',
  },
  {
    title: 'Know the NEC Basics Before Your Interview',
    description:
      'Familiarity with the National Electrical Code signals genuine interest in the trade. You do not need to memorize it, but understanding its structure and key articles gives you a clear edge over other applicants.',
  },
  {
    title: 'Highlight Any Relevant Technical Experience',
    description:
      'Experience with low-voltage systems, HVAC controls, home improvement projects, or military electronics training is directly relevant. List it clearly on your resume even if you have not held a formal electrician title.',
  },
]

export default async function ElectricianJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'electrician', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'electrician', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Electrician Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="electrician" />
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
                what={params.what || 'electrician'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Electrician Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Electrician Jobs Available</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The electrical trade encompasses a wide range of specialties and license levels. Whether you are just starting out as an apprentice or are a licensed master electrician looking for your next opportunity, the listings on this page cover the full spectrum of roles currently available across the country.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {electricianRoles.map((role, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Electricians Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median annual wage for electricians was $61,590 in May 2023, with the top 10 percent of earners taking home more than $100,000 per year. Union wages in major metro markets and specialized industrial sectors often push total compensation even higher. The ranges below reflect typical rates seen across current U.S. job postings.
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
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May 2023. Ranges are illustrative and vary by location, union status, employer, and experience level.
            </p>
          </div>
        </section>

        {/* Apprenticeship Section */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Become an Electrician: Apprenticeships Explained</h2>
              <p className="text-gray-700 mb-6">
                According to Apprenticeship.gov, the official U.S. Government resource for registered apprenticeship programs, the electrical trade offers one of the most accessible and well-compensated apprenticeship pathways in the skilled trades. Here is what you need to know before applying.
              </p>
              <div className="grid md:grid-cols-2 gap-5">
                {apprenticeshipFacts.map((fact, index) => (
                  <div key={index} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      {fact.title}
                    </h3>
                    <p className="text-gray-600 text-sm pl-7">{fact.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Licensing by State */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Electrician Licensing Requirements by State</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Electrician licensing is regulated at the state level in the United States, and requirements differ significantly from one jurisdiction to another. According to the National Electrical Contractors Association (NECA), most states issue at minimum an apprentice, journeyman, and master electrician license, but the exam content, experience hours, and renewal rules vary. The table below summarizes key states.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold text-gray-800 rounded-tl-lg">State</th>
                  <th className="text-left p-3 font-semibold text-gray-800">Licensing Body</th>
                  <th className="text-left p-3 font-semibold text-gray-800 rounded-tr-lg">Key Notes</th>
                </tr>
              </thead>
              <tbody>
                {licenseByState.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900">{row.state}</td>
                    <td className="p-3 text-gray-700">{row.body}</td>
                    <td className="p-3 text-gray-600">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Source: Individual state licensing boards and the National Electrical Contractors Association (NECA). Always verify current requirements directly with your state authority before applying for a license.
          </p>
        </section>

        {/* Safety and Code Compliance */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HardHat className="w-7 h-7 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Safety Standards and Code Compliance Every Electrician Must Know</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Electrical work is one of the most regulated skilled trades in the United States. Understanding the core standards that govern your work is not just a legal requirement but a professional obligation that protects you, your coworkers, and the public.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {nECFacts.map((fact, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-3 hover:shadow-md transition-shadow">
                <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">{fact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Electrician Job Outlook: Why Now Is a Great Time to Apply</h2>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of electricians is projected to grow 11 percent from 2022 to 2032, much faster than the average for all occupations. About 73,500 openings for electricians are projected each year on average over the decade.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">11%</p>
                <p className="text-sm text-gray-600">Projected Job Growth (2022 to 2032)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">73,500</p>
                <p className="text-sm text-gray-600">Average Annual Job Openings</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$61,590</p>
                <p className="text-sm text-gray-600">Median Annual Wage (BLS, May 2023)</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-5">
              Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Electricians. Growth is driven by construction activity, renewable energy expansion, and EV infrastructure buildout.
            </p>
          </div>
        </section>

        {/* Prohibited / Safety Warning */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Working Without a License: What You Need to Know</h2>
                <p className="text-gray-700 mb-4">
                  According to the National Conference of State Legislatures (NCSL) and individual state contractor licensing boards, performing electrical work without the required license or permit is illegal in most U.S. jurisdictions and can result in serious consequences. The following actions are prohibited or restricted in most states:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Performing electrical work without a valid journeyman or master license where required',
                    'Pulling electrical permits without a licensed master electrician or contractor on record',
                    'Undertaking work that exceeds the scope of your current license classification',
                    'Operating an electrical contracting business without the required contractor license',
                    'Installing electrical systems that do not comply with the adopted edition of the NEC',
                    'Ignoring OSHA lockout/tagout (LOTO) procedures when working on energized systems',
                    'Failing to obtain required inspections and sign-offs from the local authority having jurisdiction (AHJ)',
                    'Misrepresenting license status on a job application or contractor bid',
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

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Your Next Electrician Job</h2>
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
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Electrician Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal or professional advice. Electrician licensing requirements, wage rates, and safety regulations vary by state, municipality, and employer. Always consult your state licensing board, the U.S. Department of Labor at dol.gov, OSHA at osha.gov, and the National Fire Protection Association at nfpa.org for the most current and applicable standards. Oh My Job is a job aggregation platform and is not responsible for the accuracy of individual job listings.
          </p>
        </section>
      </div>
    </>
  )
}