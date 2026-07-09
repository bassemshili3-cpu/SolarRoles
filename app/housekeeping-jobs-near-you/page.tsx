import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Star, Shield, Clock, Users, TrendingUp, FileText, Award } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Housekeeping Jobs Near You | Hotels, Hospitals & Homes',
  description: 'Hotel, resort, hospital, and private household housekeeping roles with no degree required. Hourly rates and morning or evening shift options included.',
  keywords: 'housekeeping jobs near me, housekeeping jobs, hotel housekeeping jobs, housekeeper hiring now, housekeeping positions near you, maid jobs near me, housekeeping employment',
  openGraph: {
    title: 'Housekeeping Jobs | Competitive Pay & Flexible Shifts',
    description: 'Housekeeping positions needed ASAP across the US. Hotels, hospitals, resorts and private employers are hiring now. Competitive wages, immediate start. Find your housekeeping job today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Housekeeping Jobs | Hotels, Resorts & Private Homes',
    description: 'Urgent openings for housekeeping professionals near you. Hotels, hospitals & private homes hiring immediately. Apply in minutes!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/housekeeping-jobs-near-you',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Housekeeping Jobs Near You',
  description: 'Find housekeeping jobs hiring near you. Browse hundreds of immediate openings at hotels, hospitals, resorts, and private homes across the United States.',
  url: 'https://www.oh-my-job.com/housekeeping-jobs-near-you',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Housekeeping Job Opportunities',
    description: 'Current housekeeping job listings across all settings and locations in the United States',
  },
}

const housekeepingRoles = [
  {
    title: 'Hotel Housekeeper',
    description: 'Clean and prepare guest rooms, common areas, and amenities at hotels and resorts',
    icon: Star,
  },
  {
    title: 'Hospital Environmental Services',
    description: 'Maintain sanitation standards in clinical and patient areas of healthcare facilities',
    icon: Shield,
  },
  {
    title: 'Private Household Cleaner',
    description: 'Provide personalized cleaning and domestic services in private homes',
    icon: CheckCircle,
  },
  {
    title: 'Residential Cleaning Technician',
    description: 'Work with professional cleaning companies servicing residential properties',
    icon: Briefcase,
  },
  {
    title: 'Executive Housekeeper',
    description: 'Supervise housekeeping teams and manage cleaning operations at large facilities',
    icon: Award,
  },
  {
    title: 'Laundry & Linen Attendant',
    description: 'Handle washing, drying, folding, and distribution of linens in hotels or care facilities',
    icon: Clock,
  },
]

const topEmployers = [
  { name: 'Marriott International', type: 'Hotel Chain', positions: 'Room Attendant, Laundry Attendant, Housekeeping Supervisor' },
  { name: 'Hilton Hotels & Resorts', type: 'Hotel Chain', positions: 'Housekeeper, Turn Down Attendant, Public Area Cleaner' },
  { name: 'Hyatt Hotels', type: 'Hotel Chain', positions: 'Room Attendant, Housekeeping Inspector, Linen Runner' },
  { name: 'HCA Healthcare', type: 'Healthcare', positions: 'Environmental Services Tech, EVS Aide, Custodial Worker' },
  { name: 'Molly Maid', type: 'Cleaning Service', positions: 'Residential Cleaner, Team Lead, Franchise Specialist' },
  { name: 'ARAMARK', type: 'Facilities Services', positions: 'Housekeeper, Floor Technician, Custodial Supervisor' },
]

const keyDuties = [
  'Clean and sanitize guest rooms, bathrooms, and common areas',
  'Make beds, change linens, and replenish room supplies',
  'Vacuum, mop, dust, and polish surfaces throughout the facility',
  'Report maintenance issues and damaged items to supervisors',
  'Follow health, safety, and sanitation protocols at all times',
  'Manage cleaning supply inventory and equipment care',
  'Respond to special cleaning requests from guests or residents',
  'Complete checklists and documentation for quality assurance',
]

const salaryData = [
  { role: 'Hotel Housekeeper', low: '$11', high: '$17', median: '$14' },
  { role: 'Hospital EVS Technician', low: '$13', high: '$20', median: '$16' },
  { role: 'Private Housekeeper', low: '$14', high: '$22', median: '$17' },
  { role: 'Executive Housekeeper', low: '$18', high: '$35', median: '$25' },
]

const certifications = [
  {
    name: 'Certified Hospitality Housekeeping Executive: CHHE',
    issuer: 'American Hotel & Lodging Educational Institute: AHLEI',
    description: 'The gold standard credential for housekeeping supervisors and managers in the hospitality industry.',
  },
  {
    name: 'OSHA 10 General Industry',
    issuer: 'Occupational Safety and Health Administration',
    description: 'Covers workplace hazard recognition and safe practices, highly valued by commercial and healthcare housekeeping employers.',
  },
  {
    name: 'Registered Executive Housekeeper: REH',
    issuer: 'International Executive Housekeepers Association: IEHA',
    description: 'Professional designation for experienced housekeeping managers demonstrating advanced knowledge and leadership.',
  },
]

const faqs = [
  {
    question: 'What qualifications do I need for a housekeeping job?',
    answer: 'Most entry level housekeeping positions require no formal education beyond a high school diploma or equivalent. Employers typically provide on the job training. Key qualities include attention to detail, physical stamina, reliability, and the ability to follow cleaning protocols. Some healthcare settings may require background checks and basic certifications in bloodborne pathogen safety.',
  },
  {
    question: 'How much do housekeeping jobs pay per hour?',
    answer: 'According to the U.S. Bureau of Labor Statistics, the median hourly wage for maids and housekeeping cleaners was approximately $14 to $16 per hour nationally. Hotel housekeepers often earn $11 to $17 per hour, while private housekeepers and hospital environmental services technicians can earn $13 to $22 per hour depending on location, experience, and employer.',
  },
  {
    question: 'Are housekeeping jobs physically demanding?',
    answer: 'Yes, housekeeping is physically active work. According to the Occupational Information Network: O*NET, managed by the U.S. Department of Labor, housekeeping roles typically involve bending, lifting items up to 25 to 50 pounds, standing for extended periods, and repetitive movements. Many employers offer ergonomic training and proper equipment to minimize injury risk.',
  },
  {
    question: 'What is the difference between a housekeeper and a maid?',
    answer: 'The terms are often used interchangeably, but in professional settings a housekeeper typically refers to someone employed by hotels, hospitals, or large facilities with defined cleaning protocols and supervisory structures. A maid or domestic worker usually refers to someone working in a private home. Both roles focus on maintaining cleanliness but differ in work environment and scope of duties.',
  },
  {
    question: 'Do housekeeping jobs offer benefits?',
    answer: 'Benefits vary by employer and employment type. Full time housekeeping positions at major hotel chains, hospitals, and facilities management companies often include health insurance, paid time off, retirement plans, and employee discounts. Part time and contract positions may offer fewer benefits. According to the U.S. Department of Labor, workers in this sector have increasingly accessed benefits through union agreements, particularly in the hospitality industry.',
  },
  {
    question: 'Can I advance my career in housekeeping?',
    answer: 'Absolutely. Many housekeeping professionals progress from room attendant to housekeeping supervisor, then to executive housekeeper or director of housekeeping. Large hotel brands and healthcare systems actively promote from within. Obtaining certifications such as the Certified Hospitality Housekeeping Executive (CHHE) from the American Hotel and Lodging Educational Institute can significantly accelerate career growth.',
  },
]

const applicationTips = [
  {
    title: 'Highlight Physical Fitness and Reliability',
    description: 'Employers prioritize dependable candidates with good attendance records. Emphasize your work ethic, physical ability, and punctuality on your application and during interviews.',
  },
  {
    title: 'Mention Cleaning Product Knowledge',
    description: 'List any experience with commercial cleaning chemicals, floor care equipment, or sanitation standards. Knowledge of OSHA guidelines or bloodborne pathogen safety is a strong differentiator for healthcare roles.',
  },
  {
    title: 'Be Flexible With Shift Availability',
    description: 'Housekeeping roles often require early morning, evening, or weekend availability. Indicating flexibility in your schedule significantly increases your chances of being selected for an interview.',
  },
  {
    title: 'Get a Certification to Stand Out',
    description: 'Even a basic OSHA 10 certification or a housekeeping training course from a community college can set you apart. According to the American Hotel and Lodging Educational Institute, certified candidates are prioritized for supervisory roles.',
  },
]

export default async function HousekeepingJobsNearYouPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'housekeeping jobs', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'housekeeping jobs', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Housekeeping Jobs Near You Available Now 
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="housekeeping jobs" />
          </aside>
          <div className="flex-1">

            

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'housekeeping jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Housekeeping Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Housekeeping Jobs Near You</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, the maids and housekeeping cleaners occupation employs hundreds of thousands of workers across diverse settings in the United States. Whether you prefer the pace of a hotel, the stability of a healthcare facility, or the personal touch of private homes, there is a housekeeping role suited to your strengths.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {housekeepingRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Duties */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Duties in Housekeeping Jobs</h2>
                <p className="text-gray-700 mb-5">
                  According to O*NET OnLine, managed by the U.S. Department of Labor, the following tasks are central to housekeeping occupations across all work settings. Understanding these responsibilities helps you present yourself as a strong candidate.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {keyDuties.map((duty, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{duty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Salary Data */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Housekeeping Job Salaries and Pay Rates</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program, pay for housekeeping and cleaning workers varies by setting, experience, and region. The following figures reflect national estimates for common housekeeping positions.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate national averages and may vary by location and employer.
          </p>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Employers Hiring Housekeeping Staff</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Housekeeping professionals are in high demand across a wide range of industries. The following employers are among the largest and most active recruiters of housekeeping talent across the United States.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {topEmployers.map((employer, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">{employer.name}</p>
                    <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">{employer.type}</span>
                    <p className="text-gray-600 text-sm">{employer.positions}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Certifications That Boost Your Housekeeping Career</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            While most entry level housekeeping positions require no formal credentials, earning a recognized certification can significantly improve your earning potential and career advancement. The following credentials are respected by employers across the hospitality and healthcare sectors.
          </p>
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-0.5">{cert.name}</p>
                    <p className="text-xs text-amber-700 font-medium mb-2">Issued by: {cert.issuer}</p>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Work Environment & Physical Demands */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Work Environment and Physical Requirements</h2>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Department of Labor's O*NET program, housekeeping roles are classified as medium to heavy physical work. Candidates should be prepared for an active work environment. Understanding these demands upfront helps ensure a long and sustainable career in the field.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Physical Demands</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Standing and walking for extended periods (6 to 8 hours per shift)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Lifting and carrying items weighing up to 25 to 50 pounds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Bending, kneeling, and reaching in various positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Repetitive motions such as scrubbing, sweeping, and mopping</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Work Settings</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Hotels, resorts, and bed and breakfast properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Hospitals, nursing homes, and assisted living facilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Private residences and vacation rental properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Office buildings, schools, and government facilities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Career Growth */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth in Housekeeping</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of maids and housekeeping cleaners is projected to remain steady, with consistent demand driven by the hospitality and healthcare sectors. Advancement opportunities are real and achievable for motivated workers.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Room Attendant', desc: 'Entry level cleaning and room preparation' },
                { step: '2', title: 'Senior Housekeeper', desc: 'Lead shifts and train new staff members' },
                { step: '3', title: 'Housekeeping Supervisor', desc: 'Oversee teams and ensure quality standards' },
                { step: '4', title: 'Executive Housekeeper', desc: 'Direct all housekeeping operations and budgets' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Housekeeping Job Near You</h2>
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

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Housekeeping Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures and employment data cited on this page are sourced from publicly available reports by the U.S. Bureau of Labor Statistics and the U.S. Department of Labor. Actual wages and job availability may vary by location, employer, and experience level. Oh My Job is an independent job search platform and aggregates listings from third party sources. Always verify job details, pay rates, and requirements directly with the employer before applying.
          </p>
        </section>
      </div>
    </>
  )
}