import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, TrendingUp, Users, Award, MapPin, Phone, Star } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Front Desk Jobs | Receptionist & Admin Openings Near You',
  description: 'Receptionist and front desk roles at hotels, clinics, gyms, and offices. Hourly pay and available shifts shown with every listing.',
  keywords: 'front desk jobs, front desk jobs near me, front desk hiring now, receptionist jobs, front desk agent jobs, hotel front desk jobs, medical front desk jobs, front desk clerk jobs',
  openGraph: {
    title: 'Front Desk Jobs | Hotels, Clinics, Gyms & Offices',
    description: 'Hundreds of front desk and receptionist positions available now. Hotels, medical offices, gyms, salons, and corporate offices actively recruiting. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Front Desk Jobs | Entry-Level to Experienced Roles',
    description: 'Browse front desk jobs hiring immediately near you. Entry level to experienced roles across multiple industries. Competitive pay and benefits. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/front-desk-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Front Desk Jobs',
  description: 'Find front desk jobs hiring now across the United States. Browse receptionist and front desk agent positions with immediate openings.',
  url: 'https://www.oh-my-job.com/front-desk-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Front Desk Jobs',
    description: 'Current front desk job listings with immediate hiring needs',
  },
}

const popularRoles = [
  {
    title: 'Hotel Front Desk Agent',
    description: 'Check guests in and out, manage reservations, handle payments, and serve as the primary point of contact throughout a guest\'s stay.',
  },
  {
    title: 'Medical Receptionist',
    description: 'Schedule patient appointments, verify insurance, collect copayments, and coordinate with clinical staff at hospitals, clinics, and private practices.',
  },
  {
    title: 'Corporate Receptionist',
    description: 'Greet visitors, manage a multi line phone system, handle mail and deliveries, and provide administrative support in an office environment.',
  },
  {
    title: 'Gym and Fitness Front Desk',
    description: 'Welcome members, process memberships and class bookings, answer questions about services, and maintain a clean and welcoming lobby area.',
  },
  {
    title: 'Dental or Veterinary Front Desk',
    description: 'Manage appointment scheduling, patient or client intake, billing and insurance coordination, and phone communications for specialty practices.',
  },
  {
    title: 'Salon and Spa Receptionist',
    description: 'Book appointments, manage stylist or therapist schedules, process retail transactions, and create a positive first impression for every client.',
  },
]

const jobOutlookData = [
  { label: 'Current Employment', value: '1.1 million', detail: 'Receptionists and information clerks nationwide' },
  { label: 'Annual Job Openings', value: '142,000', detail: 'Average openings per year from growth and turnover' },
  { label: 'Industries Hiring', value: '10+', detail: 'Healthcare, hospitality, fitness, legal, corporate, and more' },
]

const salaryData = [
  { role: 'Receptionist', salary: '$38,100', note: 'Median annual wage (May 2024, BLS)' },
  { role: 'Hotel Front Desk Agent', salary: '$37,400', note: 'Median annual wage (May 2024, BLS)' },
  { role: 'Medical Receptionist', salary: '$40,700', note: 'Median annual wage (May 2024, BLS)' },
]

const coreSkills = [
  { skill: 'Verbal Communication', desc: 'Clear and professional communication with visitors, callers, and colleagues is the foundation of every front desk role' },
  { skill: 'Multitasking', desc: 'Managing phone calls, walk in visitors, scheduling, and data entry simultaneously is a daily reality at most front desks' },
  { skill: 'Customer Service', desc: 'Handling complaints, providing accurate information, and creating positive first impressions require patience and empathy' },
  { skill: 'Computer Proficiency', desc: 'Most roles require proficiency with scheduling software, Microsoft Office or Google Workspace, and industry specific systems' },
  { skill: 'Attention to Detail', desc: 'Accurate data entry, appointment scheduling, and billing coordination require precision to avoid costly errors' },
  { skill: 'Discretion and Confidentiality', desc: 'Front desk staff regularly handle sensitive personal, medical, or financial information and must maintain strict confidentiality' },
]

const industries = [
  { name: 'Healthcare', detail: 'Hospitals, clinics, dental offices, and specialty practices hire large volumes of medical front desk staff year round' },
  { name: 'Hospitality', detail: 'Hotels, resorts, and extended stay properties maintain 24 hour front desk coverage requiring multiple shifts and positions' },
  { name: 'Corporate Offices', detail: 'Law firms, financial services, tech companies, and real estate firms rely on professional receptionists to manage client facing operations' },
  { name: 'Fitness and Wellness', detail: 'Gyms, yoga studios, spas, and physical therapy practices need front desk staff to manage memberships and bookings' },
  { name: 'Education', detail: 'Schools, colleges, and tutoring centers hire administrative front desk staff for student services and visitor management' },
  { name: 'Government and Nonprofits', detail: 'Public agencies and nonprofit organizations frequently post front desk and information clerk positions with competitive benefits' },
]

const careerPath = [
  { role: 'Front Desk Agent or Receptionist', timeframe: 'Starting out', description: 'Manage daily check ins, phone lines, scheduling, and visitor coordination while building knowledge of the organization and its systems' },
  { role: 'Senior Receptionist or Lead Agent', timeframe: '1 to 2 years', description: 'Train new staff, handle escalated issues, manage shift coverage, and take on additional administrative responsibilities' },
  { role: 'Office Coordinator or Front Desk Supervisor', timeframe: '2 to 4 years', description: 'Oversee front desk operations, manage vendor relationships, coordinate office logistics, and support management with reporting' },
  { role: 'Office Manager or Operations Manager', timeframe: '4 to 7 years', description: 'Lead full office administration, manage budgets, supervise a team, and serve as the operational backbone of the organization' },
]

const applicationTips = [
  {
    title: 'Tailor Your Resume for the Industry',
    description: 'A hotel front desk resume should emphasize PMS software experience and guest service metrics. A medical receptionist resume should highlight HIPAA knowledge and EHR systems like Epic or Athenahealth. Generic resumes are screened out quickly.',
  },
  {
    title: 'Demonstrate Phone and Software Skills',
    description: 'List specific systems you have used such as Opera, Mindbody, Salesforce, or Microsoft Outlook. Employers often include these as required keywords in their job postings and applicant tracking systems screen for them.',
  },
  {
    title: 'Prepare for a Practical Interview',
    description: 'Many front desk interviews include a role play scenario where you handle a difficult caller or check in a guest. Practice staying calm, speaking clearly, and asking clarifying questions. First impressions during the interview mirror the job itself.',
  },
  {
    title: 'Highlight Evening and Weekend Availability',
    description: 'Hotels, fitness centers, and urgent care clinics need front desk coverage outside of standard business hours. Candidates who offer flexible or non traditional availability move to the top of the stack quickly.',
  },
]

const faqs = [
  {
    question: 'What qualifications do I need for a front desk job?',
    answer: 'According to the U.S. Bureau of Labor Statistics, most receptionist and front desk positions require a high school diploma or equivalent. Employers typically provide on the job training for software and procedures. Some industries such as healthcare or law may prefer candidates with relevant coursework or certifications, but entry level positions across most sectors are accessible without a college degree.',
  },
  {
    question: 'How much do front desk workers make per hour?',
    answer: 'The U.S. Bureau of Labor Statistics reports a median annual wage of $38,100 for receptionists and information clerks as of May 2024, equating to approximately $18.32 per hour. Hotel front desk agents earn a median of $37,400 annually. Wages vary by industry, location, and employer size, with healthcare and legal front desk roles generally paying above the median.',
  },
  {
    question: 'Is front desk work physically demanding?',
    answer: 'According to O*NET OnLine, maintained by the U.S. Department of Labor, receptionist and front desk work is primarily sedentary, involving extended periods of sitting at a workstation. Some roles, particularly in hotels and fitness centers, require standing for prolonged periods. The work is predominantly mental and interpersonal, involving sustained attention, multitasking, and communication under busy conditions.',
  },
  {
    question: 'What software do front desk workers need to know?',
    answer: 'Requirements vary by industry. Hotel front desk agents frequently use property management systems such as Opera, OnQ, or Cloudbeds. Medical receptionists work with electronic health record platforms like Epic, Cerner, or Athenahealth. Corporate receptionists typically use Microsoft Office 365, Google Workspace, and visitor management systems. Proficiency with multi line phone systems is universally expected.',
  },
  {
    question: 'Are there remote front desk jobs?',
    answer: 'Virtual receptionist roles do exist and have grown since 2020. According to the U.S. Department of Labor, information clerk and receptionist duties can be performed remotely when organizations have the infrastructure to route calls and manage digital visitor systems. Virtual front desk positions are common in answering services, healthcare triage, and customer support centers, though most traditional front desk roles remain on site.',
  },
  {
    question: 'What is the difference between a receptionist and a front desk agent?',
    answer: 'The titles are often used interchangeably, but context matters. According to the Bureau of Labor Statistics, receptionists typically work in professional or business settings such as offices, clinics, and law firms, with a focus on answering phones, greeting visitors, and supporting administrative tasks. Front desk agents, by contrast, are most commonly associated with the hospitality industry, where they manage guest arrivals, room assignments, billing, and customer service throughout a stay.',
  },
]

export default async function FrontDeskJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'front desk jobs', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'front desk jobs', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Front Desk Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="front desk jobs" />
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
                what={params.what || 'front desk jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Front Desk Job Outlook</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, about 142,000 receptionist and information clerk openings are projected each year on average through 2033, largely driven by the need to replace workers who transfer to other occupations. Front desk roles remain among the most consistently available positions in the United States across healthcare, hospitality, and corporate sectors.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Receptionists and Information Clerks, updated 2024
          </p>
        </section>

        {/* Popular Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Front Desk Jobs Available</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Front desk positions exist across virtually every industry. While the core responsibilities overlap, each sector brings specific software, regulations, and customer interaction styles. Understanding the differences helps you target the right roles and stand out to employers.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Briefcase className="w-10 h-10 text-blue-500 mb-4" />
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
            <h2 className="text-2xl font-bold text-gray-900">Front Desk Salaries in the United States</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The U.S. Bureau of Labor Statistics reports median wages for front desk and receptionist roles ranging from $37,000 to $41,000 annually depending on industry. Healthcare settings consistently pay above the general receptionist median due to the added complexity of insurance verification and medical records management.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {salaryData.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">{item.salary}</p>
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

        {/* Core Skills */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Key Skills Employers Look For</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to O*NET OnLine, maintained by the U.S. Department of Labor, the most important abilities for receptionist and front desk roles include oral communication, active listening, service orientation, and information ordering. Candidates who can demonstrate these skills clearly during the hiring process consistently outperform others.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreSkills.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{item.skill}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Industries Hiring */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Industries Hiring Front Desk Workers</h2>
              <p className="text-gray-600 mb-6">
                Front desk roles are among the most cross industry positions in the labor market. The following sectors represent the highest volume of current openings based on available job posting data.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {industries.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Career Path */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Front Desk Career Progression</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            A front desk position is a well established entry point into office administration, operations, and management. Many professionals who start at the front desk build their way to senior administrative and operational leadership roles within three to seven years.
          </p>
          <div className="space-y-4">
            {careerPath.map((step, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
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
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Front Desk Job</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Front Desk Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics and O*NET OnLine. Salary figures, job growth projections, and skill requirements are subject to change. Always verify current compensation and requirements directly with the hiring employer before applying.
          </p>
        </section>

      </div>
    </>
  )
}