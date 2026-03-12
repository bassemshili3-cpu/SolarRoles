import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, Heart, DollarSign, MapPin, CheckCircle, GraduationCap, Users, Award, Building, Stethoscope, HelpCircle, TrendingUp, Calendar, BookOpen, FileText } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Urgent Demand for School Nurse Professionals | Apply Now',
  description: 'Discover 500+ school nurse jobs hiring immediately across the U.S. Enjoy summers off, school schedules, and competitive benefits. RNs and LPNs needed. No nights or weekends. Apply today!',
  keywords: 'school nurse jobs, school nurse positions, school nursing careers, registered nurse school jobs, LPN school nurse, school health nurse, pediatric school nurse',
  openGraph: {
    title: 'School Nurse Jobs | Immediate Openings Available',
    description: 'Join school districts hiring nurses now. Enjoy school schedules, summers off, and rewarding work with students. Hundreds of positions available across the country!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'School Nurse Jobs | Now Hiring',
    description: 'Ready for a nursing career with work life balance? Find school nurse jobs near you. School hours, summers off, and great benefits await.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/school-nurse-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'School Nurse Jobs',
  description: 'Find school nurse jobs and careers across the United States. Browse current openings in public schools, private schools, and school districts.',
  url: 'https://www.oh-my-job.com/school-nurse-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available School Nurse Jobs',
    description: 'Current job listings for school nurses nationwide',
  },
}

const nurseTypes = [
  { title: 'Registered Nurse (RN)', description: 'Full scope nursing practice including health assessments, medication administration, and care coordination', icon: Stethoscope },
  { title: 'Licensed Practical Nurse (LPN)', description: 'Basic nursing care under RN supervision including first aid and medication assistance', icon: Heart },
  { title: 'School Health Aide', description: 'Assist school nurses with basic health tasks and student supervision', icon: Users },
  { title: 'District Nurse Supervisor', description: 'Oversee nursing staff across multiple schools and develop health policies', icon: Building },
  { title: 'Special Education Nurse', description: 'Provide specialized care for students with disabilities and complex health needs', icon: Award },
  { title: 'School Nurse Practitioner', description: 'Advanced practice nursing with diagnostic and prescriptive authority', icon: GraduationCap },
]

const benefits = [
  { benefit: 'School Schedule Hours', description: 'Work during school hours with no nights, weekends, or holidays' },
  { benefit: 'Summers Off', description: 'Enjoy summer breaks and school vacation periods' },
  { benefit: 'Retirement Benefits', description: 'Access to state pension plans and retirement systems' },
  { benefit: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
  { benefit: 'Job Security', description: 'Stable employment with strong demand for school nurses' },
  { benefit: 'Rewarding Work', description: 'Make a positive impact on children\'s health and well being' },
]

const requirements = [
  { requirement: 'Nursing License', description: 'Active RN or LPN license in your state of practice' },
  { requirement: 'Education', description: 'Associate or Bachelor\'s degree in nursing (BSN preferred for some positions)' },
  { requirement: 'CPR Certification', description: 'Current Basic Life Support (BLS) or CPR certification' },
  { requirement: 'Background Check', description: 'Clear criminal background check and fingerprinting' },
  { requirement: 'School Nurse Certification', description: 'Some states require additional school nurse certification' },
  { requirement: 'Pediatric Experience', description: 'Experience working with children is preferred but not always required' },
]

const dailyDuties = [
  'Administering medications and treatments to students',
  'Providing first aid and emergency care',
  'Conducting health screenings (vision, hearing, scoliosis)',
  'Managing chronic conditions like diabetes and asthma',
  'Developing Individualized Healthcare Plans (IHPs)',
  'Communicating with parents, teachers, and healthcare providers',
  'Maintaining student health records and documentation',
  'Teaching health education to students and staff',
]

const faqs = [
  {
    question: 'What qualifications do I need to become a school nurse?',
    answer: 'According to the National Association of School Nurses (NASN), most school nurse positions require a valid nursing license (RN or LPN). Many states require a Bachelor of Science in Nursing (BSN), and some states mandate additional school nurse certification. Requirements vary by state, so check with your state board of nursing and department of education.',
  },
  {
    question: 'How much do school nurses earn?',
    answer: 'According to the U.S. Bureau of Labor Statistics, registered nurses earn a median annual wage of approximately $81,220 as of 2023. School nurse salaries vary by location, experience, and school district. Many school nurses also receive additional compensation through benefits packages that include health insurance and pension plans.',
  },
  {
    question: 'Do school nurses work during summer break?',
    answer: 'Most school nurses follow the academic calendar and do not work during summer break. However, some districts offer optional summer school nursing positions or extended school year programs. Some school nurses choose to work per diem or in other healthcare settings during the summer months.',
  },
  {
    question: 'What is the nurse to student ratio in schools?',
    answer: 'The National Association of School Nurses recommends a ratio of one school nurse for every 750 healthy students. For student populations with complex health needs, lower ratios are recommended. According to NASN data, actual ratios vary significantly by state and district, with some schools sharing nurses across multiple buildings.',
  },
  {
    question: 'Is there a shortage of school nurses?',
    answer: 'Yes, according to the National Association of School Nurses and various state reports, there is a significant shortage of school nurses nationwide. Many schools do not have a full time nurse on staff. This shortage creates strong job opportunities for qualified nursing professionals interested in school health.',
  },
  {
    question: 'Can LPNs work as school nurses?',
    answer: 'LPN eligibility for school nurse positions varies by state. According to state nursing board regulations, some states allow LPNs to work as school nurses under RN supervision, while others require school nurses to hold RN licensure. Check your state\'s specific requirements through your state board of nursing.',
  },
]

const certificationSteps = [
  {
    title: 'Complete Nursing Education',
    description: 'Earn an Associate Degree in Nursing (ADN) or Bachelor of Science in Nursing (BSN). Many school districts prefer or require a BSN.',
  },
  {
    title: 'Pass the NCLEX Examination',
    description: 'Successfully pass the National Council Licensure Examination (NCLEX-RN or NCLEX-PN) to obtain your nursing license.',
  },
  {
    title: 'Obtain State Nursing License',
    description: 'Apply for licensure through your state board of nursing. Ensure your license is active and in good standing.',
  },
  {
    title: 'Get School Nurse Certification',
    description: 'If required in your state, complete school nurse certification through your state department of education or approved program.',
  },
  {
    title: 'Complete Background Check',
    description: 'All school employees must pass criminal background checks and fingerprinting as required by state law.',
  },
]

const workSettings = [
  { setting: 'Public Elementary Schools', description: 'Serve students in kindergarten through 5th or 6th grade', students: 'Ages 5 to 11' },
  { setting: 'Public Middle Schools', description: 'Work with pre teens and early adolescents', students: 'Ages 11 to 14' },
  { setting: 'Public High Schools', description: 'Provide care for teenagers with diverse health needs', students: 'Ages 14 to 18' },
  { setting: 'Private and Charter Schools', description: 'Serve students in independent educational settings', students: 'Various ages' },
  { setting: 'School District Office', description: 'Oversee health services across multiple schools', students: 'Administrative' },
  { setting: 'Special Education Programs', description: 'Provide specialized nursing for students with disabilities', students: 'Various ages' },
]

export default async function SchoolNurseJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'school nurse', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'school nurse', where: params.where || '', results_per_page: 30, page: 1 })
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
            School Nurse Jobs Available Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="school nurse" />
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
                what={params.what || 'school nurse'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Overview Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-7 h-7 text-pink-600" />
            <h2 className="text-2xl font-bold text-gray-900">About School Nursing Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            School nurses play a vital role in student health and academic success. According to the National Association of School Nurses (NASN), school nurses support student learning by addressing health barriers and providing direct healthcare services in educational settings. With a growing focus on student wellness and a nationwide shortage of school nurses, this career path offers excellent opportunities for nursing professionals seeking work life balance.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { stat: '95,000+', label: 'School Nurses in the U.S.' },
              { stat: '130,000+', label: 'Public and Private Schools' },
              { stat: '750:1', label: 'Recommended Student Ratio' },
              { stat: 'High Demand', label: 'Job Market Outlook' },
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-pink-50 to-white border border-pink-200 rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-pink-600 mb-1">{item.stat}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Types of School Nurse Positions */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of School Nurse Positions</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            School nursing encompasses a variety of roles depending on licensure level, experience, and school setting. According to the U.S. Bureau of Labor Statistics, nursing roles in educational settings continue to expand as schools recognize the importance of on site healthcare professionals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nurseTypes.map((type, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <type.icon className="w-10 h-10 text-pink-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Work Settings Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">School Nurse Work Settings</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            School nurses work in a variety of educational environments, from elementary schools to high schools and beyond. Each setting presents unique challenges and rewards based on the age and needs of the student population.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workSettings.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 text-lg mb-1">{item.setting}</p>
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                <p className="text-pink-600 text-sm font-medium">{item.students}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Benefits of Being a School Nurse</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            School nursing offers unique advantages that attract nurses seeking better work life balance. Unlike hospital nursing, school nurses typically enjoy predictable schedules, holidays off, and summer breaks while still making a meaningful impact on patient care.
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

        {/* Daily Duties Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Heart className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Do School Nurses Do?</h2>
              <p className="text-gray-700 mb-6">
                According to the National Association of School Nurses, school nurses perform a wide range of clinical and administrative duties to support student health. A typical day may include the following responsibilities:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {dailyDuties.map((duty, index) => (
                  <div key={index} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{duty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">School Nurse Requirements</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Requirements to become a school nurse vary by state. According to state boards of nursing and departments of education, most positions require nursing licensure plus additional qualifications specific to working in educational settings.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requirements.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.requirement}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certification Path Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Become a School Nurse</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The path to becoming a school nurse involves nursing education, licensure, and often additional certification. According to the National Board for Certification of School Nurses (NBCSN), specialized certification demonstrates expertise in school health nursing practice.
          </p>
          <div className="space-y-4">
            {certificationSteps.map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 font-bold rounded-full text-lg flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Information Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">School Nurse Salary Information</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, registered nurses earn competitive salaries with strong job security. School nurse salaries vary by location, experience, education level, and school district. Many school nurses also receive comprehensive benefits packages that add significant value to total compensation.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$50K to $65K</p>
                <p className="text-sm text-gray-600">Entry Level School Nurse</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$60K to $80K</p>
                <p className="text-sm text-gray-600">Experienced School Nurse</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$75K to $95K</p>
                <p className="text-sm text-gray-600">Lead or Supervisor Nurse</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$85K+</p>
                <p className="text-sm text-gray-600">District Nurse Director</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Salaries vary significantly by geographic location, with urban and high cost of living areas typically offering higher wages. Many school districts also provide additional compensation for advanced degrees or certifications.
            </p>
          </div>
        </section>

        {/* Work Schedule Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">School Nurse Work Schedule</h2>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              One of the most attractive aspects of school nursing is the predictable schedule that aligns with the academic calendar. Unlike hospital nurses who work rotating shifts, school nurses typically enjoy regular daytime hours.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Typical Hours</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Monday through Friday schedule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>7:00 AM to 3:30 PM (varies by school)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>No nights, weekends, or holidays</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Time Off</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Summer break (typically 8 to 10 weeks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Winter and spring breaks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Federal and state holidays</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Contract Options</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>10 month academic year contracts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>12 month year round positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Per diem and substitute roles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Career Growth Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">School Nurse Career Advancement</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            School nursing offers opportunities for professional growth and leadership. Experienced school nurses can advance into supervisory, administrative, or specialized roles within school districts.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Clinical Advancement',
                description: 'Progress from staff nurse to lead nurse, then to school nurse supervisor overseeing nursing services for multiple schools within a district.',
              },
              {
                title: 'Administrative Path',
                description: 'Move into district health services director roles, managing budgets, policies, and nursing staff across an entire school system.',
              },
              {
                title: 'Specialized Practice',
                description: 'Focus on areas like special education nursing, mental health coordination, or chronic disease management programs.',
              },
              {
                title: 'Education and Training',
                description: 'Transition into nursing education roles, training new school nurses or teaching health curriculum to students.',
              },
            ].map((path, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{path.title}</h3>
                <p className="text-gray-600 text-sm">{path.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About School Nurse Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute professional or legal advice. School nurse requirements, salaries, and job duties vary by state and school district. Always verify specific requirements with your state board of nursing, state department of education, and prospective employers. Salary data is based on national averages and may not reflect compensation in all areas.
          </p>
        </section>
      </div>
    </>
  )
}