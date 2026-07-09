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
  Users,
  MapPin,
} from 'lucide-react'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Planet Fitness Jobs | Trainer, Front Desk & Manager Roles',
  description:
    'Planet Fitness front desk, personal trainer, and team lead openings nationwide. Free gym membership included — flexible scheduling and promotion from within common.',
  keywords:
    'planet fitness jobs, planet fitness hiring, planet fitness careers, planet fitness front desk jobs, planet fitness personal trainer jobs, fitness jobs near me, gym jobs hiring now',
  openGraph: {
    title: 'Planet Fitness Jobs | Find a Role at Your Local Gym',
    description:
      'Find Planet Fitness jobs hiring immediately in your area. Entry-level to management roles at one of the largest gym chains in the U.S. Great perks and flexible scheduling. Start your application today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planet Fitness Jobs | Front Desk, Training & Management',
    description:
      'Planet Fitness locations hiring now near you. Front desk, fitness training, and management openings. Apply today and work somewhere you love.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/planet-fitness-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Planet Fitness Jobs',
  description:
    'Find Planet Fitness job openings hiring near you. Browse current positions for front desk staff, fitness trainers, and management roles across the United States.',
  url: 'https://www.oh-my-job.com/planet-fitness-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Planet Fitness Jobs',
    description: 'Current job listings at Planet Fitness locations across the United States',
  },
}

const fitnessRoles = [
  {
    title: 'Front Desk Associate',
    description:
      'Greet members, handle check-ins, answer phones, process membership sales, and maintain a clean and welcoming club environment. The most common entry-level role at fitness clubs.',
    icon: Users,
  },
  {
    title: 'Member Services Representative',
    description:
      'Support member retention by resolving billing inquiries, handling cancellations, and ensuring a positive experience for every person who walks through the door.',
    icon: Star,
  },
  {
    title: 'Fitness Trainer',
    description:
      'Lead group fitness instruction, conduct member orientations, and provide guidance on equipment use and exercise form. Certification is typically required.',
    icon: Award,
  },
  {
    title: 'Club Manager',
    description:
      'Oversee daily club operations, manage staff schedules, drive membership sales targets, and ensure compliance with company policies and safety standards.',
    icon: Briefcase,
  },
  {
    title: 'Assistant Manager',
    description:
      'Support the club manager in daily operations, staff training, and member satisfaction. A common stepping stone into full club management.',
    icon: TrendingUp,
  },
  {
    title: 'Maintenance and Facility Staff',
    description:
      'Keep the club clean, safe, and fully operational. Responsibilities include equipment upkeep, locker room maintenance, and general facility cleaning throughout the day.',
    icon: MapPin,
  },
]

const fitnessIndustryFacts = [
  {
    title: 'Fitness Industry Employment Growth',
    detail:
      'According to the U.S. Bureau of Labor Statistics, employment of fitness instructors and trainers is projected to grow 14 percent from 2022 to 2032, much faster than the average for all occupations, driven by growing awareness of the health benefits of exercise.',
  },
  {
    title: 'Gym Membership Trends',
    detail:
      'The U.S. fitness and gym industry employs hundreds of thousands of workers nationwide. The International Health, Racquet and Sportsclub Association (IHRSA) reports that the U.S. health club industry serves tens of millions of members annually, creating consistent demand for frontline staff.',
  },
  {
    title: 'Entry-Level Accessibility',
    detail:
      'Most front desk and member services roles at fitness clubs do not require prior industry experience. According to the BLS, many fitness workers are trained on the job, making gyms one of the most accessible employers for first time job seekers.',
  },
  {
    title: 'Flexible Scheduling',
    detail:
      'Fitness clubs typically operate from early morning to late night, seven days a week. According to the U.S. Department of Labor, this type of shift-based scheduling makes gym jobs particularly appealing to students, parents, and those seeking supplemental income.',
  },
]

const trainerCertifications = [
  {
    name: 'CPT — Certified Personal Trainer',
    body: 'National Academy of Sports Medicine (NASM)',
    notes: 'One of the most widely recognized personal trainer certifications in the U.S. Accepted by the majority of commercial gym chains.',
  },
  {
    name: 'ACE-CPT — ACE Certified Personal Trainer',
    body: 'American Council on Exercise (ACE)',
    notes: 'Accredited by the National Commission for Certifying Agencies (NCCA). Strongly preferred or required for fitness trainer roles at major gym operators.',
  },
  {
    name: 'CSCS — Certified Strength and Conditioning Specialist',
    body: 'National Strength and Conditioning Association (NSCA)',
    notes: 'Advanced certification for trainers working with athletic populations. Requires a bachelor\'s degree in a related field.',
  },
  {
    name: 'CPR/AED Certification',
    body: 'American Heart Association (AHA) or American Red Cross',
    notes: 'Required for all fitness floor and trainer roles. According to OSHA and most state health codes, staff interacting with gym members must hold a current CPR/AED certificate.',
  },
]

const salaryData = [
  { label: 'Front Desk Associate', range: '$13 to $17/hr' },
  { label: 'Member Services Representative', range: '$14 to $18/hr' },
  { label: 'Fitness Trainer', range: '$16 to $24/hr' },
  { label: 'Assistant Manager', range: '$18 to $25/hr' },
  { label: 'Club Manager', range: '$40,000 to $60,000/yr' },
  { label: 'Regional or District Manager', range: '$60,000 to $90,000/yr' },
]

const workplaceRights = [
  'According to the U.S. Department of Labor, all gym and fitness employees are covered by the Fair Labor Standards Act (FLSA), which requires payment of at least the applicable federal or state minimum wage for all hours worked.',
  'OSHA Standard 29 CFR 1910.151 requires employers, including fitness facilities, to have personnel trained in first aid and to maintain accessible emergency response equipment such as AED devices.',
  'The Equal Employment Opportunity Commission (EEOC) prohibits fitness employers from discriminating in hiring, promotion, or termination based on race, color, religion, sex, national origin, age, or disability.',
  'According to the U.S. Department of Labor Wage and Hour Division, employees who are required to wear a uniform may be entitled to uniform reimbursement if the cost causes their effective hourly wage to fall below the minimum wage.',
]

const faqs = [
  {
    question: 'What positions are typically available at fitness clubs like Planet Fitness?',
    answer:
      'Most fitness club locations hire for front desk associate, member services representative, fitness trainer, assistant manager, and club manager roles on a rolling basis. Maintenance and facility staff positions are also commonly available. Entry-level front desk and member services roles typically require no prior fitness industry experience and provide on-the-job training.',
  },
  {
    question: 'Do I need to be certified to work as a fitness trainer at a gym?',
    answer:
      'Most commercial gym operators require fitness trainers to hold a nationally recognized personal trainer certification such as the NASM CPT or ACE CPT. According to the National Commission for Certifying Agencies (NCCA), accredited certifications ensure that trainers meet a standardized baseline of knowledge in exercise science and client safety. A current CPR/AED certification from the American Heart Association or American Red Cross is also typically required for all floor-facing fitness roles.',
  },
  {
    question: 'What is the minimum age to work at a fitness club?',
    answer:
      'Most fitness club positions require applicants to be at least 18 years old due to the nature of member interactions and facility safety responsibilities. According to the U.S. Department of Labor, 16 and 17 year olds may be employed in non-hazardous occupations, but many gym chains set 18 as their internal minimum age requirement. Always check the specific job posting for age requirements before applying.',
  },
  {
    question: 'What are the typical working hours for gym jobs?',
    answer:
      'Fitness clubs typically operate 24 hours a day or from very early in the morning to late at night, seven days a week. This creates shift availability across early morning, daytime, evening, and overnight hours. According to the U.S. Department of Labor, this kind of scheduling flexibility makes fitness club employment particularly accessible for students, parents, and those balancing multiple jobs.',
  },
  {
    question: 'What are the perks of working at a fitness club?',
    answer:
      'Common employee benefits at fitness clubs include complimentary or discounted gym memberships, flexible scheduling, paid training, and opportunities for advancement into management. Some larger chains also offer health insurance, 401(k) plans, and tuition assistance for full-time employees. Benefits vary by location and employment status.',
  },
  {
    question: 'Do gym employees have rights regarding tipped wages or commissions?',
    answer:
      'According to the U.S. Department of Labor, fitness trainers who earn commissions on personal training packages are still entitled to receive at least the applicable minimum wage for all hours worked. If commissions do not bring total compensation up to the minimum wage threshold, the employer must make up the difference. Sales commissions are legal but cannot substitute for minimum wage compliance under the FLSA.',
  },
]

const tips = [
  {
    title: 'Get CPR/AED Certified Before You Apply',
    description:
      'A current CPR and AED certification from the American Heart Association or American Red Cross is required for most gym floor and trainer roles. Completing it before you apply signals readiness and removes a common pre-hire barrier.',
  },
  {
    title: 'Apply Directly at Your Local Club',
    description:
      'Many fitness club locations, including franchised gym chains, hire at the club level. Visiting in person during a slower period, such as mid-morning on a weekday, and introducing yourself to the manager can give your application a personal edge.',
  },
  {
    title: 'Highlight Customer Service Experience',
    description:
      'Front desk and member services roles are fundamentally customer service positions. Any prior experience in retail, food service, hospitality, or reception is directly transferable and should be highlighted prominently on your resume.',
  },
  {
    title: 'Be Clear About Your Schedule Availability',
    description:
      'Fitness clubs need coverage across early morning, evening, and weekend shifts. Being upfront about full availability, especially for early or late shifts, significantly increases your chances of being hired quickly.',
  },
]

export default async function PlanetFitnessJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'planet fitness', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'planet fitness', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Planet Fitness Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="planet fitness" />
          </aside>
          <div className="flex-1">

            

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'planet fitness'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Fitness Club Jobs Available</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Fitness clubs hire across a range of roles, from entry-level front desk positions that require no prior industry experience to certified personal trainer and management opportunities with strong career progression. Here is an overview of the most commonly available positions at gym locations across the country.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fitnessRoles.map((role, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Fitness Club Employees Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median annual wage for fitness instructors and trainers was $46,480 in May 2023. Front desk and member services roles are typically paid hourly and represent accessible entry points into the fitness industry. The ranges below reflect typical rates observed across current gym job postings in the United States.
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
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May 2023. Ranges are illustrative and vary by location, role, and employer.
            </p>
          </div>
        </section>

        {/* Trainer Certifications */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications Required or Preferred for Fitness Roles</h2>
              <p className="text-gray-700 mb-6">
                Fitness trainer positions at commercial gyms typically require a nationally accredited personal training certification and a current CPR/AED credential. The following are the most widely recognized and employer-accepted certifications in the U.S. fitness industry.
              </p>
              <div className="grid md:grid-cols-2 gap-5">
                {trainerCertifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                    <p className="text-amber-700 text-xs font-medium mb-2">{cert.body}</p>
                    <p className="text-gray-600 text-sm">{cert.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Industry Facts */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Fitness Industry Job Market: What the Data Says</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The fitness and wellness sector is one of the consistently growing segments of the U.S. service economy. Here is what official data and industry sources say about working in this field.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {fitnessIndustryFacts.map((fact, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  {fact.title}
                </h3>
                <p className="text-gray-600 text-sm pl-7">{fact.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Career Growth */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth in the Fitness Industry</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            A gym job is often an entry point into a broader career in fitness, wellness, or operations management. Many club managers and regional directors began their careers at the front desk. The skills developed, including customer service, sales, team leadership, and facility management, are directly transferable across the hospitality and services sector.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Club Manager', detail: 'Lead a full gym location, manage staff, and drive membership growth.' },
              { title: 'Regional Manager', detail: 'Oversee multiple club locations across a geographic territory.' },
              { title: 'Personal Training Director', detail: 'Manage the personal training department, trainer schedules, and client programming.' },
              { title: 'Corporate or Franchise Operations', detail: 'Transition into support roles at the corporate or franchise ownership level.' },
            ].map((role, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-blue-700 mb-1">{role.title}</p>
                <p className="text-gray-600 text-sm">{role.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workplace Rights */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Know Your Rights as a Fitness Club Employee</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Like all U.S. employees, gym and fitness club workers are protected by federal labor law. Here is what official sources say about your rights in this type of workplace.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {workplaceRights.map((fact, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-3 hover:shadow-md transition-shadow">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">{fact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What to Watch Out For */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Red Flags to Watch For When Accepting a Gym Job</h2>
                <p className="text-gray-700 mb-4">
                  According to the U.S. Department of Labor Wage and Hour Division, some employers in the fitness industry have been cited for wage and hour violations. Be aware of the following practices that may indicate non-compliance with federal or state labor law:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Being asked to work off the clock before or after your scheduled shift',
                    'Having tips, commissions, or bonus pay used to offset your base hourly wage below minimum wage',
                    'Being misclassified as an independent contractor when your work is fully directed by the employer',
                    'Not receiving overtime pay for hours worked beyond 40 in a workweek',
                    'Being required to purchase a uniform or equipment that reduces effective pay below minimum wage',
                    'No written offer letter or employment agreement outlining pay rate and schedule',
                    'Being pressured to waive meal or rest breaks required under your state labor law',
                    'Trainer commissions withheld without a written commission plan or pay stub documentation',
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
            <BookOpen className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Getting Hired at a Fitness Club</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Fitness Club Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal or professional advice. Wage rates, certification requirements, and workplace regulations vary by state, employer, and role type. Always consult the U.S. Department of Labor at dol.gov, the Equal Employment Opportunity Commission at eeoc.gov, and your state labor department for the most current regulations applicable to your situation. Oh My Job is a job aggregation platform and is not responsible for the accuracy of individual job listings. Oh My Job is not affiliated with, endorsed by, or connected to Planet Fitness or any of its franchise operators in any way. Planet Fitness is a registered trademark of Planet Fitness, Inc.
          </p>
        </section>
      </div>
    </>
  )
}