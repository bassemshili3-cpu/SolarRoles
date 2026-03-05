import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, TrendingUp, Users, Award, FileText, Heart, BookOpen } from 'lucide-react'
import { getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgently Hiring: Daycare Jobs Near You | Apply Today',
  description: 'Find daycare jobs hiring immediately across the United States. Childcare teacher, assistant, and director roles at top centers. Competitive pay, benefits, and a rewarding career working with children. Apply in minutes and start making a difference today!',
  keywords: 'daycare jobs, daycare jobs near me, daycare hiring now, childcare jobs, daycare teacher jobs, daycare assistant jobs, daycare director jobs, early childhood education jobs',
  openGraph: {
    title: 'Immediate Opening: Daycare Jobs Hiring Now | Oh My Job',
    description: 'Hundreds of daycare and childcare positions available now. Infant, toddler, and preschool roles at leading centers. Great pay and benefits. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Now Hiring: Daycare Jobs | Start Your Childcare Career Today',
    description: 'Ready to work with children? Browse daycare jobs hiring immediately near you. Full time, part time, and lead teacher openings available now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/daycare-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Daycare Jobs',
  description: 'Find daycare and childcare jobs hiring now across the United States. Browse teacher, assistant, and director positions with immediate openings.',
  url: 'https://www.oh-my-job.com/daycare-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Daycare Jobs',
    description: 'Current daycare job listings with immediate hiring needs',
  },
}

const popularRoles = [
  {
    title: 'Infant and Toddler Teacher',
    description: 'Provide nurturing care and developmentally appropriate activities for children ages six weeks to three years in a licensed childcare setting.',
  },
  {
    title: 'Preschool Teacher',
    description: 'Plan and implement curriculum for children ages three to five, supporting school readiness through play based and structured learning experiences.',
  },
  {
    title: 'Childcare Assistant',
    description: 'Support lead teachers with daily activities, meals, nap routines, and maintaining a safe and stimulating classroom environment.',
  },
  {
    title: 'Before and After School Care Counselor',
    description: 'Supervise school age children during before and after school programs, providing homework help, recreational activities, and a safe space.',
  },
  {
    title: 'Daycare Director',
    description: 'Oversee all aspects of center operations including staff management, licensing compliance, enrollment, budgeting, and family communication.',
  },
  {
    title: 'Special Needs Inclusion Aide',
    description: 'Provide individualized support to children with disabilities in inclusive daycare settings, collaborating with teachers and specialists.',
  },
]

const jobOutlookData = [
  { label: 'Projected Job Growth (2023 to 2033)', value: '6%', detail: 'As fast as average for all occupations' },
  { label: 'Annual Job Openings', value: '174,800', detail: 'Average openings per year from growth and turnover' },
  { label: 'Total Employment', value: '1.4 million', detail: 'Childcare workers employed nationwide' },
]

const salaryData = [
  { role: 'Childcare Worker', salary: '$31,800', note: 'Median annual wage (May 2024, BLS)' },
  { role: 'Preschool Teacher', salary: '$38,520', note: 'Median annual wage (May 2024, BLS)' },
  { role: 'Childcare Center Director', salary: '$52,440', note: 'Median annual wage (May 2024, BLS)' },
]

const requirements = [
  {
    title: 'Education Requirements',
    items: [
      'High school diploma or GED for most assistant roles',
      'Associate or bachelor\'s degree in Early Childhood Education preferred for lead teacher positions',
      'Child Development Associate (CDA) credential widely accepted',
      'Some states require specific coursework in child development',
    ],
  },
  {
    title: 'Certifications and Clearances',
    items: [
      'CPR and First Aid certification (required by most states)',
      'Federal and state background check clearance',
      'Child Abuse History Clearance',
      'Mandated Reporter training in most states',
    ],
  },
]

const stateRegulations = [
  { aspect: 'Licensing Authority', detail: 'Each state licenses daycare centers through its Department of Health, Education, or Social Services' },
  { aspect: 'Staff to Child Ratios', detail: 'Vary by age group and state. Federal Head Start requires 1:4 for infants, 1:5 for toddlers, and 1:10 for preschoolers' },
  { aspect: 'Minimum Age to Work', detail: 'Most states require daycare workers to be at least 16 to 18 years old, with lead teacher roles requiring adulthood' },
  { aspect: 'Ongoing Training', detail: 'Most states mandate annual continuing education hours to maintain employment in licensed childcare facilities' },
]

const applicationTips = [
  {
    title: 'Earn Your CDA Before You Apply',
    description: 'The Child Development Associate credential, issued by the Council for Professional Recognition, is recognized in all 50 states and signals readiness for a professional childcare career. Many employers will sponsor the cost for committed candidates.',
  },
  {
    title: 'Get CPR and First Aid Certified',
    description: 'Nearly every licensed daycare center in the United States requires current CPR and pediatric first aid certification. Completing this before applying removes a key hiring barrier and demonstrates your commitment to child safety.',
  },
  {
    title: 'Highlight Hands On Experience with Children',
    description: 'Babysitting, volunteering at a school, summer camp counseling, or coaching youth sports all count as relevant experience. Be specific about age groups and responsibilities to help hiring managers picture you in the role.',
  },
  {
    title: "Understand the Center's Philosophy",
    description: 'Daycare centers follow different educational approaches such as Montessori, Reggio Emilia, play based, or structured academic models. Researching and aligning your application with the center\'s stated philosophy significantly improves your chances.',
  },
]

const faqs = [
  {
    question: 'What qualifications do I need to work at a daycare?',
    answer: 'According to the U.S. Bureau of Labor Statistics, most childcare worker positions require a high school diploma or equivalent. However, requirements vary significantly by state and by role. Lead teacher and director positions increasingly require a Child Development Associate credential, an associate degree, or a bachelor\'s degree in early childhood education. All workers must typically pass a background check and obtain CPR and First Aid certification.',
  },
  {
    question: 'How much do daycare workers make per hour?',
    answer: 'The U.S. Bureau of Labor Statistics reports a median annual wage of $31,800 for childcare workers as of May 2024, which translates to approximately $15.29 per hour. Preschool teachers earn a median of $38,520 annually. Wages vary considerably by state, employer type, and credentials. Public school affiliated preschool programs and Head Start centers generally offer higher compensation than private centers.',
  },
  {
    question: 'Are daycare workers considered mandatory reporters?',
    answer: 'Yes. According to the U.S. Department of Health and Human Services, childcare workers are designated mandatory reporters of child abuse and neglect in all 50 states. This means that employees who have reasonable cause to believe a child is being abused or neglected are legally required to report that suspicion to the appropriate state child protective services agency. Most states require mandatory reporter training as a condition of employment.',
  },
  {
    question: 'What is the job outlook for daycare workers?',
    answer: 'The U.S. Bureau of Labor Statistics projects employment of childcare workers to grow 6 percent from 2023 to 2033, about as fast as the average for all occupations. About 174,800 openings are projected each year on average, largely due to the need to replace workers who transfer to other occupations or exit the labor force. Demand is driven by the continued need for working parents to secure safe, licensed childcare.',
  },
  {
    question: 'Do daycare centers drug test employees?',
    answer: 'Many licensed daycare centers and childcare organizations conduct pre employment drug screening as part of the background clearance process. Requirements vary by employer and state regulation. Centers receiving federal Head Start or child care subsidy funding are often subject to stricter background and drug screening standards under federal guidelines.',
  },
  {
    question: 'Can I work at a daycare without a degree?',
    answer: 'Yes. Many entry level daycare assistant and aide positions require only a high school diploma or GED. According to the Bureau of Labor Statistics, on the job training is common for childcare workers. However, advancing to lead teacher or director roles typically requires additional education or credentials such as the Child Development Associate, an associate degree, or a state specific certification in early childhood education.',
  },
]

export default async function DaycareJobsPage({ searchParams }: any) {
  const params = await searchParams

  const { count } = await getCachedJobCount(
    params.what || 'daycare jobs',
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
            Daycare Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
           <JobFilters defaultWhat="daycare jobs" />
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
                what={params.what || 'daycare jobs'}
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
            <h2 className="text-2xl font-bold text-gray-900">Daycare Job Outlook in the United States</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, employment of childcare workers is projected to grow 6 percent from 2023 to 2033. With over 174,800 openings expected annually and strong demand driven by working families, daycare remains one of the most consistently hiring sectors in the US economy.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Childcare Workers, updated 2024
          </p>
        </section>

        {/* Popular Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-7 h-7 text-rose-500" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Daycare Jobs Available</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Daycare and childcare centers hire for a wide range of roles depending on the age groups they serve and the size of their operation. The positions below represent the most commonly available openings across licensed centers nationwide.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Users className="w-10 h-10 text-rose-400 mb-4" />
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
            <h2 className="text-2xl font-bold text-gray-900">Daycare Worker Salaries</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The U.S. Bureau of Labor Statistics tracks compensation for childcare and early education roles separately. Pay varies significantly by role, credentials, employer type, and state. Public school programs, Head Start centers, and large national childcare chains generally offer higher wages and more comprehensive benefits than small private centers.
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

        {/* Requirements */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements for Daycare Jobs</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {requirements.map((section, i) => (
                  <div key={i} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* State Regulations */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Daycare Licensing and Regulations</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the official website of the United States Government at childcare.gov, childcare centers must be licensed by the state in which they operate. Licensing requirements govern staff qualifications, health and safety standards, and child to staff ratios. Understanding these regulations is essential for anyone pursuing a career in licensed childcare.
          </p>
          <div className="space-y-3">
            {stateRegulations.map((item, i) => (
              <div key={i} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex-shrink-0 w-2 rounded-full bg-indigo-200 self-stretch" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{item.aspect}</p>
                  <p className="text-gray-600 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Department of Health and Human Services, Office of Child Care, childcare.gov
          </p>
        </section>

        {/* Certifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Credentials That Advance Your Daycare Career</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Child Development Associate (CDA)',
                org: 'Council for Professional Recognition',
                desc: 'The most widely recognized entry level credential in early childhood education. Accepted in all 50 states and often required for lead teacher roles at licensed centers.',
              },
              {
                name: 'Associate Degree in Early Childhood Education',
                org: 'Accredited Community Colleges',
                desc: 'A two year degree covering child development, curriculum planning, family engagement, and classroom management. Qualifies graduates for lead teacher and program coordinator roles.',
              },
              {
                name: 'Director Credential',
                org: 'State Child Care Agencies',
                desc: 'Most states offer a tiered Director Credential or Director\'s License required to manage a licensed childcare center. Requirements vary by state and typically include experience and coursework in administration.',
              },
            ].map((cert, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <BookOpen className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                <p className="text-xs text-amber-600 font-medium mb-2">{cert.org}</p>
                <p className="text-gray-600 text-sm">{cert.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Daycare Job</h2>
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
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Daycare Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics, the U.S. Department of Health and Human Services, and publicly available state licensing resources. Childcare regulations, salary figures, and credential requirements vary by state and employer. Always verify current requirements with your state child care licensing agency or the hiring employer before applying.
          </p>
        </section>

      </div>
    </>
  )
}