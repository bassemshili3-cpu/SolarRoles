import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
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
} from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Now Hiring Bartenders | Bartending Jobs Near You Updated Daily',
  description:
    'Hiring immediately for bartending jobs near you. Browse hundreds of openings at bars, restaurants, hotels and clubs. Competitive pay, flexible shifts, and tips. Apply today with no experience required at some locations!',
  keywords:
    'bartending jobs, bartender jobs near me, bartender hiring now, bartending jobs hiring immediately, bar jobs, nightclub bartender jobs, hotel bartender jobs, cocktail bartender jobs',
  openGraph: {
    title: 'Immediate Opening: Bartending Jobs | Apply Now',
    description:
      'Find bartending jobs hiring immediately in your area. Full-time, part-time and seasonal openings at top bars, restaurants and hotels. Start earning great tips today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgently Hiring Bartenders | Find Your Next Bar Job',
    description:
      'Hundreds of bartending jobs hiring now near you. Competitive hourly pay plus tips. Apply in minutes and land your next shift.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/bartending-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Bartending Jobs',
  description:
    'Find bartending jobs hiring near you. Browse hundreds of openings at bars, restaurants, hotels, and event venues across the United States.',
  url: 'https://www.oh-my-job.com/bartending-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Bartending Jobs',
    description: 'Current bartending job listings across the United States',
  },
}

const bartendingRoles = [
  {
    title: 'Bar Bartender',
    description: 'Craft cocktails and serve drinks in a dedicated bar or pub environment with a steady regular clientele.',
    icon: Briefcase,
  },
  {
    title: 'Restaurant Bartender',
    description: 'Manage the bar area of a restaurant, preparing drinks for both bar guests and table service.',
    icon: Briefcase,
  },
  {
    title: 'Hotel Bartender',
    description: 'Work in hotel lounges or rooftop bars, often with higher base pay and access to a diverse international clientele.',
    icon: Star,
  },
  {
    title: 'Nightclub Bartender',
    description: 'Serve high volumes of guests in a fast-paced nightclub setting, typically with strong tip potential.',
    icon: TrendingUp,
  },
  {
    title: 'Event and Catering Bartender',
    description: 'Work weddings, corporate events, and private parties on a flexible per-event basis.',
    icon: Award,
  },
  {
    title: 'Cruise Ship Bartender',
    description: 'Serve guests onboard cruise ships, often including accommodations and the chance to travel internationally.',
    icon: Star,
  },
]

const requiredCertifications = [
  {
    name: 'TIPS Certification',
    description:
      'Training for Intervention ProcedureS (TIPS) is one of the most recognized responsible alcohol service programs in the country. Many employers require or strongly prefer TIPS-certified bartenders.',
    source: 'tipsglobal.org',
  },
  {
    name: 'ServSafe Alcohol',
    description:
      'Offered by the National Restaurant Association, ServSafe Alcohol trains bartenders to recognize intoxication and handle difficult situations responsibly.',
    source: 'servsafe.com',
  },
  {
    name: 'State Liquor License / ABC Card',
    description:
      'Several states, including California, Nevada, and Utah, require bartenders to hold a state-issued alcohol beverage control (ABC) card or equivalent before serving alcohol legally.',
    source: 'State Alcohol Beverage Control Boards',
  },
  {
    name: 'Food Handler Card',
    description:
      'In many jurisdictions, anyone working in food and beverage service, including bartenders who prepare garnishes or food items, must hold a valid food handler certification.',
    source: 'State and local health departments',
  },
]

const salaryData = [
  { label: 'Entry-Level Bartender', range: '$11 to $15/hr + tips' },
  { label: 'Experienced Bartender', range: '$15 to $22/hr + tips' },
  { label: 'Hotel / Fine Dining Bartender', range: '$18 to $28/hr + tips' },
  { label: 'Nightclub Bartender', range: '$12 to $20/hr + significant tips' },
  { label: 'Event / Catering Bartender', range: '$18 to $35/hr (flat rate or tips)' },
]

const topSkills = [
  {
    skill: 'Cocktail Knowledge',
    detail: 'Familiarity with classic cocktails, spirits, wines, and beers is expected in most venues.',
  },
  {
    skill: 'Customer Service',
    detail: 'Bartenders are the face of the establishment. Strong communication and a welcoming attitude drive repeat business and tips.',
  },
  {
    skill: 'Speed and Multitasking',
    detail: 'High-volume environments require you to manage multiple orders simultaneously without sacrificing accuracy.',
  },
  {
    skill: 'Cash Handling',
    detail: 'Accurate handling of payments, making change, and operating POS systems is a daily responsibility.',
  },
  {
    skill: 'Responsible Service of Alcohol',
    detail: 'Recognizing signs of intoxication and refusing service when appropriate is both a legal and ethical duty.',
  },
  {
    skill: 'Upselling',
    detail: 'Suggesting premium spirits, specialty cocktails, or pairings increases revenue for the venue and tips for you.',
  },
]

const legalRequirements = [
  { state: 'California', minAge: 21, notes: 'Must hold a valid RBS (Responsible Beverage Service) certificate.' },
  { state: 'Nevada', minAge: 21, notes: 'Work cards issued by local sheriff or police department required.' },
  { state: 'Texas', minAge: 18, notes: 'TABC certification required before serving alcohol in licensed establishments.' },
  { state: 'New York', minAge: 18, notes: 'No state certification required, but employer-based training is common.' },
  { state: 'Florida', minAge: 18, notes: 'No mandatory state certification; local jurisdictions may have additional rules.' },
]

const faqs = [
  {
    question: 'What is the minimum age to work as a bartender in the United States?',
    answer:
      'The minimum age to serve alcohol varies by state. According to the National Conference of State Legislatures (NCSL), most states allow 18-year-olds to serve alcohol in licensed establishments, while states such as California, Nevada, and Utah require bartenders to be at least 21. Always check your state Alcohol Beverage Control (ABC) board for current requirements before applying.',
  },
  {
    question: 'Do I need a bartending license or certification to get hired?',
    answer:
      'Federal law does not mandate a national bartending license. However, many states and employers require responsible alcohol service training such as TIPS or ServSafe Alcohol certification. Some states, including California, require a state-issued Responsible Beverage Service (RBS) certificate. Check with your state liquor control authority for local requirements.',
  },
  {
    question: 'How much do bartenders make in tips?',
    answer:
      'According to the U.S. Bureau of Labor Statistics (BLS), the median annual wage for bartenders was approximately $31,390 in 2023, but total compensation including tips can be significantly higher. In busy urban venues and nightclubs, experienced bartenders commonly earn $50,000 or more per year once tips are factored in. Tips vary greatly depending on the type of establishment, location, and shift.',
  },
  {
    question: 'Do I need prior bartending experience to get hired?',
    answer:
      'Not necessarily. Many establishments are willing to hire and train candidates who demonstrate enthusiasm, strong customer service skills, and a willingness to learn. Starting as a barback (bar assistant) is a common entry point that leads directly to bartending roles. Completing a bartending course or obtaining a TIPS certification can also make your application more competitive.',
  },
  {
    question: 'What are the typical working hours for a bartender?',
    answer:
      'Bartending is primarily an evening and weekend profession. Most shifts run from late afternoon through the early hours of the morning, particularly in nightclubs and bars. Restaurant bartenders may also work lunch shifts. The flexibility of part-time and full-time shift options makes bartending a popular choice for students and those seeking supplemental income.',
  },
  {
    question: 'Are bartenders considered tipped employees under federal law?',
    answer:
      'Yes. According to the U.S. Department of Labor, under the Fair Labor Standards Act (FLSA), employers may pay tipped employees a lower cash wage of $2.13 per hour, provided that tips bring total compensation up to at least the federal minimum wage of $7.25 per hour. Many states have established higher tipped minimum wages. If tips do not bring earnings up to the applicable minimum wage, the employer must make up the difference.',
  },
]

const tips = [
  {
    title: 'Get Certified Before You Apply',
    description:
      'Complete a TIPS or ServSafe Alcohol certification before sending your first application. It signals professionalism and is required or preferred by most serious employers.',
  },
  {
    title: 'Start as a Barback',
    description:
      'If you have no experience, applying for a barback position is the most direct path into bartending. You will learn the workflow, earn the trust of the team, and move up quickly.',
  },
  {
    title: 'Know Your Classic Cocktails',
    description:
      'Memorizing the most common cocktails, such as an Old Fashioned, Margarita, Manhattan, and Mojito, before your interview demonstrates genuine interest and gives you a head start.',
  },
  {
    title: 'Highlight Transferable Service Experience',
    description:
      'Experience as a server, cashier, or any customer-facing role is directly relevant. Emphasize your ability to stay calm under pressure, handle cash, and provide excellent service.',
  },
]

export default async function BartendingJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'Bartending', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'Bartending', where: params.where || '', results_per_page: 30, page: 1 })
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
            Bartending Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="bartending" />
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
                what={params.what || 'bartending'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Bartending Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Bartending Jobs Available</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Bartending is far from a one-size-fits-all profession. From high-energy nightclubs to elegant hotel lounges, the type of establishment shapes your entire experience, schedule, and earning potential. Here is an overview of the most common bartending roles you will find posted on this page.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bartendingRoles.map((role, index) => (
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

        {/* Minimum Age and Legal Requirements */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Minimum Age to Bartend by State</h2>
              <p className="text-gray-700 mb-6">
                According to the National Conference of State Legislatures (NCSL), the legal age to serve alcohol in a licensed establishment varies significantly across the United States. Some states permit 18-year-olds to bartend, while others require workers to be at least 21. The following table highlights key states. Always verify current requirements with your state Alcohol Beverage Control (ABC) board before applying.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="text-left p-3 font-semibold text-gray-800 rounded-tl-lg">State</th>
                      <th className="text-left p-3 font-semibold text-gray-800">Minimum Age</th>
                      <th className="text-left p-3 font-semibold text-gray-800 rounded-tr-lg">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {legalRequirements.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                        <td className="p-3 font-medium text-gray-900">{row.state}</td>
                        <td className="p-3 text-gray-700">{row.minAge}</td>
                        <td className="p-3 text-gray-600">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Source: National Conference of State Legislatures (NCSL) and individual state Alcohol Beverage Control boards.
              </p>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Certifications That Will Get You Hired Faster</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            While no single national bartending license is required by federal law, several certifications are widely recognized across the industry and expected by employers. Holding one or more of the following credentials gives your application a measurable advantage.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {requiredCertifications.map((cert, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-gray-900 text-lg">{cert.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">{cert.description}</p>
                <p className="text-xs text-gray-400">Source: {cert.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Key Skills Employers Look for in a Bartender</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Beyond knowing how to mix a drink, today's bartending employers are looking for a specific combination of technical and interpersonal abilities. According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, bartenders need strong communication skills, the ability to work under pressure, and a solid understanding of responsible alcohol service.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSkills.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.skill}</p>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Bartenders Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics (BLS), the median annual wage for bartenders was $31,390 in May 2023, with the top 10 percent earning more than $56,000. These figures do not fully reflect total compensation, as bartenders in busy venues frequently earn substantial tips that push total income significantly higher.
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
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May 2023. Salary ranges are illustrative and vary by location, establishment type, and experience level.
            </p>
          </div>
        </section>

        {/* Prohibited Conduct Warning */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Obligations Every Bartender Must Know</h2>
                <p className="text-gray-700 mb-4">
                  According to the official websites of state Alcohol Beverage Control boards and the U.S. Department of Justice, bartenders who violate responsible alcohol service laws can face personal fines, loss of their certification, and in serious cases, criminal liability. The following practices are strictly prohibited in all licensed establishments:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Serving alcohol to anyone under the age of 21',
                    'Serving a visibly intoxicated individual',
                    'Allowing a minor to remain in an adults-only area unaccompanied',
                    'Accepting an expired or fraudulent ID',
                    'Serving alcohol outside of state-mandated hours',
                    'Providing free alcohol as an incentive without proper authorization',
                    'Allowing customers to leave with open containers (varies by state)',
                    'Operating without a valid liquor license on the premises',
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

        {/* Career Growth Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth in Bartending</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Bartending is not simply an entry-level position. According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of bartenders is projected to grow 5 percent from 2022 to 2032, faster than the average for all occupations. Experienced bartenders commonly advance into the following roles:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Head Bartender', detail: 'Lead a team, manage bar inventory, and train new staff.' },
              { title: 'Bar Manager', detail: 'Oversee operations, staffing, ordering, and profitability.' },
              { title: 'Beverage Director', detail: 'Curate the drink menu for an entire restaurant group or hotel.' },
              { title: 'Bar Owner', detail: 'Many successful bar owners started behind the stick.' },
            ].map((role, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-blue-700 mb-1">{role.title}</p>
                <p className="text-gray-600 text-sm">{role.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Your First Bartending Job</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Bartending Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal advice. Alcohol service laws, minimum age requirements, and certification obligations vary by state and locality. Always consult your state Alcohol Beverage Control (ABC) board, the U.S. Department of Labor at dol.gov, or a qualified legal professional for guidance specific to your situation. Oh My Job is a job aggregation platform and is not responsible for the accuracy of individual job listings.
          </p>
        </section>
      </div>
    </>
  )
}