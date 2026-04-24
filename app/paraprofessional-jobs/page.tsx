import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, Clock, Users, TrendingUp, FileText, Award, Star, AlertTriangle } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Immediate Openings for Paraprofessional Jobs | Schools Hiring Now',
  description: 'Paraprofessional positions are urgently needed across the US! Browse 1,000+ openings in schools, special education, and healthcare settings. Competitive pay, meaningful work, and career growth. Apply today and make a difference in students\' lives!',
  keywords: 'paraprofessional jobs, paraprofessional positions, school paraprofessional jobs, special education paraprofessional, paraeducator jobs, teacher aide jobs, instructional assistant jobs, paraprofessional hiring',
  openGraph: {
    title: 'Immediate Openings for Paraprofessional Jobs | Districts Urgently Hiring',
    description: 'Schools and districts across the US urgently need paraprofessionals. 1,000+ openings in special education, general ed, and behavioral support. Competitive pay and benefits. Apply now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paraprofessional Jobs | Urgently Hiring Nationwide',
    description: 'Urgent demand for paraprofessionals in schools and healthcare across the US. Find your role, apply in minutes, and start making an impact.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/paraprofessional-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Paraprofessional Jobs',
  description: 'Find paraprofessional jobs hiring now across the United States. Browse openings in special education, general education, behavioral support, and healthcare paraprofessional roles.',
  url: 'https://www.oh-my-job.com/paraprofessional-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Paraprofessional Job Opportunities',
    description: 'Current paraprofessional job listings across schools, districts, and healthcare settings in the United States',
  },
}

const paraRoles = [
  {
    title: 'Special Education Paraprofessional',
    description: 'Provide one on one or small group support to students with disabilities under the direction of a special education teacher',
    icon: Star,
  },
  {
    title: 'Instructional Assistant',
    description: 'Support classroom teachers with instruction, lesson preparation, and student engagement in general education settings',
    icon: Briefcase,
  },
  {
    title: 'Behavioral Paraprofessional',
    description: 'Assist students with behavioral challenges by implementing individualized behavior intervention plans',
    icon: Shield,
  },
  {
    title: 'Early Childhood Paraprofessional',
    description: 'Support young learners in pre K and kindergarten programs, often within Head Start or Title I schools',
    icon: Users,
  },
  {
    title: 'Healthcare Paraprofessional',
    description: 'Work alongside licensed medical professionals in hospitals, clinics, or rehabilitation centers in a supportive capacity',
    icon: Award,
  },
  {
    title: 'Bilingual Paraprofessional',
    description: 'Provide language support and translation assistance to English language learners and their families',
    icon: CheckCircle,
  },
]

const federalRequirements = [
  {
    rule: 'High School Diploma or GED',
    detail: 'Required as a baseline qualification under the Every Student Succeeds Act (ESSA)',
  },
  {
    rule: '48 College Credit Hours',
    detail: 'One of the accepted pathways to meet the "highly qualified" standard under federal Title I guidelines',
  },
  {
    rule: "Associate's Degree or Higher",
    detail: 'Qualifies as meeting the paraprofessional competency standard per ESSA requirements',
  },
  {
    rule: 'Formal Assessment',
    detail: 'Passing a state or district approved assessment demonstrating knowledge and skills, as an alternative to college credits',
  },
  {
    rule: 'Background Check',
    detail: 'Required by all states for anyone working with minors in public school settings',
  },
]

const salaryData = [
  { role: 'Instructional Aide', low: '$13', high: '$20', median: '$16' },
  { role: 'Special Education Para', low: '$15', high: '$24', median: '$18' },
  { role: 'Behavioral Paraprofessional', low: '$16', high: '$26', median: '$20' },
  { role: 'Bilingual Paraprofessional', low: '$17', high: '$28', median: '$21' },
  { role: 'Healthcare Paraprofessional', low: '$15', high: '$25', median: '$19' },
]

const topEmployers = [
  { name: 'Public School Districts', type: 'K12 Education', positions: 'Instructional Aide, Special Ed Para, Title I Support' },
  { name: 'Charter School Networks', type: 'K12 Education', positions: 'Paraprofessional, Behavioral Technician, Classroom Assistant' },
  { name: 'Head Start Programs', type: 'Early Childhood', positions: 'Early Childhood Para, Family Support Worker, Classroom Aide' },
  { name: 'ABA Therapy Clinics', type: 'Behavioral Health', positions: 'Behavior Technician, RBT, Paraprofessional Therapist' },
  { name: 'Hospitals and Rehab Centers', type: 'Healthcare', positions: 'Patient Care Tech, Therapy Aide, Healthcare Para' },
  { name: 'Private Special Ed Schools', type: 'Special Education', positions: 'Residential Paraprofessional, Life Skills Assistant' },
]

const certifications = [
  {
    name: 'Registered Behavior Technician: RBT',
    issuer: 'Behavior Analyst Certification Board: BACB',
    description: 'A widely recognized entry level credential for paraprofessionals working in ABA therapy and behavioral support roles. Required by many employers in the behavioral health and special education fields.',
  },
  {
    name: 'ParaPro Assessment',
    issuer: 'Educational Testing Service: ETS',
    description: 'Accepted by many states and school districts as proof of competency for Title I paraprofessionals. Covers reading, writing, mathematics, and the application of skills in the classroom.',
  },
  {
    name: 'Special Education Paraprofessional Certificate',
    issuer: 'State Departments of Education: SDE, varies by state',
    description: 'Many states offer their own paraprofessional certification programs. These credentials are often required or preferred for positions in public special education classrooms.',
  },
  {
    name: 'CPR and First Aid Certification',
    issuer: 'American Red Cross / American Heart Association',
    description: 'Frequently required by school districts and healthcare employers for paraprofessionals who work directly with students or patients who may have medical needs.',
  },
]

const faqs = [
  {
    question: 'What is a paraprofessional?',
    answer: 'A paraprofessional is a trained aide who supports licensed professionals such as teachers, therapists, or medical providers. In education, paraprofessionals are also called paraeducators, teacher aides, or instructional assistants. According to the U.S. Department of Education, paraprofessionals in Title I schools must meet specific qualification standards under the Every Student Succeeds Act (ESSA) to ensure quality support for students.',
  },
  {
    question: 'What qualifications do I need to become a paraprofessional?',
    answer: "According to the U.S. Department of Education, paraprofessionals working in Title I programs must hold a high school diploma or GED, and demonstrate competency either by completing at least two years of college study, holding an associate's degree or higher, or passing a rigorous state or local academic assessment. Requirements vary by state and school district, so checking with your local district is recommended.",
  },
  {
    question: 'How much do paraprofessionals earn?',
    answer: 'According to the U.S. Bureau of Labor Statistics, the median annual wage for teacher assistants was approximately $30,000 to $35,000 per year, with hourly rates typically ranging from $13 to $24 depending on the role, location, and school district. Bilingual and behavioral paraprofessionals often earn higher wages due to specialized skills.',
  },
  {
    question: 'Do paraprofessionals work full time or part time?',
    answer: 'Both options exist. Many school based paraprofessional positions are part time, aligned with school hours and calendars. However, full time positions are available, particularly in special education, behavioral health, and healthcare settings. Full time roles often include benefits such as health insurance and retirement contributions.',
  },
  {
    question: 'Can a paraprofessional advance to become a teacher?',
    answer: 'Yes. Many teachers began their careers as paraprofessionals. According to the U.S. Department of Education, paraprofessional experience is highly valued during teacher preparation programs and the hiring process. Several states offer alternative certification pathways specifically designed for working paraprofessionals who want to earn their teaching license while remaining employed.',
  },
  {
    question: 'Are paraprofessional jobs in demand?',
    answer: 'Yes. According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of teacher assistants is projected to grow steadily, driven by increasing student enrollment, expansion of special education services, and the growing recognition of the impact paraprofessionals have on student outcomes. Districts across the country report ongoing shortages of qualified paraprofessionals.',
  },
]

const applicationTips = [
  {
    title: 'Highlight Experience Working With Children or Vulnerable Populations',
    description: 'Any prior experience in childcare, tutoring, coaching, volunteering, or caregiving strengthens your application significantly. Employers look for candidates who are patient, empathetic, and comfortable in support roles.',
  },
  {
    title: 'Obtain the ParaPro Assessment or State Equivalent',
    description: 'Earning a recognized competency credential before applying can set you apart from other candidates. Many districts list it as preferred or required for Title I positions. Contact ETS or your state Department of Education for testing information.',
  },
  {
    title: 'Emphasize Flexibility and Teamwork',
    description: 'Paraprofessionals must adapt to diverse students, varying schedules, and different classroom environments. Demonstrating flexibility, a collaborative mindset, and willingness to follow the lead of supervising teachers and clinicians is essential.',
  },
  {
    title: 'Apply Directly to School Districts',
    description: 'Many districts post paraprofessional openings on their own websites in addition to job boards. Submitting a direct application to your local district human resources office can give your candidacy an advantage and connect you with multiple openings at once.',
  },
]

export default async function ParaprofessionalJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'paraprofessional jobs', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'paraprofessional jobs', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Paraprofessional Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="paraprofessional jobs" />
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
                what={params.what || 'paraprofessional jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Paraprofessional Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Paraprofessional Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Department of Education, paraprofessionals serve in a wide variety of instructional and support roles across public schools, private institutions, and healthcare settings. The demand for qualified paraprofessionals continues to grow as districts expand special education services and student support programs nationwide.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paraRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Federal Qualification Requirements */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Federal Qualification Requirements for Paraprofessionals</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Department of Education, paraprofessionals employed in Title I programs must meet specific qualification standards established by the Every Student Succeeds Act (ESSA). These requirements ensure that students in federally funded schools receive support from competent, trained professionals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {federalRequirements.map((item, index) => (
              <div key={index} className="bg-white border border-indigo-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.rule}</p>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Source: U.S. Department of Education, Every Student Succeeds Act (ESSA), Title I Paraprofessional Requirements
          </p>
        </section>

        {/* Salary Data */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Paraprofessional Salaries and Pay Rates</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program, pay for paraprofessionals varies depending on specialization, location, and employer type. The following figures reflect approximate national ranges for common paraprofessional roles.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate national averages and may vary by state, district, and experience level.
          </p>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Who Hires Paraprofessionals?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Paraprofessionals are employed across education, behavioral health, and healthcare. The following sectors represent the largest and most consistent employers of paraprofessional talent across the United States.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {topEmployers.map((employer, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{employer.name}</p>
                <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">{employer.type}</span>
                <p className="text-gray-600 text-sm">{employer.positions}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Credentials That Strengthen Your Paraprofessional Application</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            While a high school diploma is the baseline requirement for most paraprofessional positions, earning additional credentials demonstrates commitment and can lead to higher pay and more specialized roles. The following certifications are widely recognized by school districts and healthcare employers.
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

        {/* Career Progression */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth for Paraprofessionals</h2>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, the paraprofessional field offers meaningful pathways for career advancement. Many paraprofessionals use their classroom experience as a springboard into teaching, school counseling, behavioral therapy, or educational administration.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Entry Level Para', desc: 'Classroom aide or one on one student support' },
                { step: '2', title: 'Senior Paraprofessional', desc: 'Lead small groups, mentor new aides' },
                { step: '3', title: 'Lead Paraeducator', desc: 'Coordinate para teams and student caseloads' },
                { step: '4', title: 'Teacher or Specialist', desc: 'Advance into licensed teaching or therapy roles' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IDEA Legal Note */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Paraprofessionals and the IDEA</h2>
                <p className="text-gray-700 mb-4">
                  According to the Individuals with Disabilities Education Act (IDEA), as published by the U.S. Department of Education, paraprofessionals who are appropriately trained and supervised may assist in the delivery of special education and related services. This means that paraprofessionals play a legally recognized and critical role in supporting students with Individualized Education Programs (IEPs).
                </p>
                <p className="text-gray-700">
                  Schools receiving federal IDEA funding are required to ensure that paraprofessionals supporting students with disabilities are adequately trained for their specific responsibilities. This creates strong, consistent demand for qualified paraprofessionals in public schools nationwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Paraprofessional Job</h2>
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
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Paraprofessional Jobs</h2>
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
            <strong>Disclaimer:</strong> The qualification standards, salary data, and employment projections cited on this page are sourced from publicly available reports by the U.S. Department of Education, the U.S. Department of Labor, and the U.S. Bureau of Labor Statistics. Requirements for paraprofessional positions vary by state, school district, and employer. Always verify specific qualifications and job details directly with the hiring organization before applying. Oh My Job is an independent job search platform and aggregates listings from third party sources.
          </p>
        </section>
      </div>
    </>
  )
}