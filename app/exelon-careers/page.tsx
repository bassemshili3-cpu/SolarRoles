import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Zap, Shield, DollarSign, MapPin, CheckCircle, GraduationCap, Users, Award, Building, Leaf, HelpCircle, TrendingUp, Clock } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Exelon Careers | Energy Engineering & Operations Jobs',
  description: 'Exelon posts engineering, grid operations, and corporate openings across its U.S. energy network. Union roles with competitive benefits and salary listed.',
  keywords: 'exelon careers, exelon jobs, exelon employment, energy jobs, utility careers, exelon hiring, power plant jobs, electrical engineer jobs exelon',
  openGraph: {
    title: "Exelon Careers | 500+ Positions at America's Top Utility",
    description: 'Join Exelon, one of the largest utility companies in the U.S. Competitive pay, comprehensive benefits, and career advancement opportunities. Hundreds of positions available now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exelon Careers | Now Hiring Energy Professionals',
    description: 'Build your career with Exelon. Explore openings in engineering, operations, IT, and more. Top benefits and growth opportunities await.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/exelon-careers',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Exelon Careers',
  description: 'Find Exelon careers and job opportunities across the United States. Browse current openings in energy, utilities, engineering, and corporate roles.',
  url: 'https://www.oh-my-job.com/exelon-careers',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Exelon Careers',
    description: 'Current job listings at Exelon and its subsidiary companies',
  },
}

const jobCategories = [
  { title: 'Engineering', description: 'Electrical, mechanical, nuclear, and civil engineering positions', icon: Zap },
  { title: 'Operations and Maintenance', description: 'Power plant operations, field technicians, and maintenance crews', icon: Building },
  { title: 'Information Technology', description: 'Software development, cybersecurity, and IT infrastructure roles', icon: TrendingUp },
  { title: 'Customer Service', description: 'Customer support, account management, and billing specialists', icon: Users },
  { title: 'Finance and Accounting', description: 'Financial analysts, accountants, and business planning roles', icon: DollarSign },
  { title: 'Environmental and Safety', description: 'Environmental compliance, health and safety, and sustainability roles', icon: Leaf },
]

const benefits = [
  { benefit: 'Competitive Compensation', description: 'Industry leading salaries with annual performance bonuses' },
  { benefit: 'Comprehensive Healthcare', description: 'Medical, dental, and vision coverage for employees and families' },
  { benefit: 'Retirement Plans', description: '401k with company match and pension options' },
  { benefit: 'Paid Time Off', description: 'Generous vacation, holidays, and personal days' },
  { benefit: 'Tuition Reimbursement', description: 'Support for continuing education and professional development' },
  { benefit: 'Career Growth', description: 'Internal mobility programs and leadership development tracks' },
]

const serviceAreas = [
  { region: 'ComEd', location: 'Northern Illinois including Chicago', employees: '6,000+' },
  { region: 'PECO', location: 'Southeastern Pennsylvania including Philadelphia', employees: '2,500+' },
  { region: 'BGE', location: 'Central Maryland including Baltimore', employees: '3,000+' },
  { region: 'Pepco', location: 'Washington D.C. and Maryland suburbs', employees: '1,500+' },
  { region: 'Delmarva Power', location: 'Delaware and Eastern Shore of Maryland', employees: '1,000+' },
  { region: 'Atlantic City Electric', location: 'Southern New Jersey', employees: '1,000+' },
]

const faqs = [
  {
    question: 'What is Exelon and what do they do?',
    answer: 'Exelon is one of the largest utility companies in the United States. According to the U.S. Energy Information Administration, Exelon operates through several subsidiary utility companies that deliver electricity and natural gas to approximately 10 million customers across Illinois, Pennsylvania, Maryland, Delaware, New Jersey, and Washington D.C.',
  },
  {
    question: 'What qualifications do I need to work at Exelon?',
    answer: 'Qualifications vary by position. Entry level roles may require a high school diploma or GED, while technical and engineering positions typically require relevant degrees or certifications. According to the U.S. Bureau of Labor Statistics, electrical power line installers and repairers usually need a high school diploma and complete apprenticeships, while engineers need at least a bachelor\'s degree.',
  },
  {
    question: 'Does Exelon offer internships or entry level programs?',
    answer: 'Yes, Exelon offers various internship and development programs for students and recent graduates. These include summer internships, co op programs, and rotational development programs designed to build the next generation of energy professionals.',
  },
  {
    question: 'What is the hiring process at Exelon?',
    answer: 'The typical hiring process includes an online application, phone screening, technical assessments for certain roles, interviews with hiring managers and team members, background checks, and drug screening. For safety sensitive positions, additional screenings may be required as mandated by the U.S. Department of Transportation and Nuclear Regulatory Commission.',
  },
  {
    question: 'Are there union positions at Exelon?',
    answer: 'Yes, many positions at Exelon and its subsidiary utilities are represented by labor unions. According to the U.S. Bureau of Labor Statistics, utility workers have higher rates of union membership compared to the national average. Union positions often include field technicians, lineworkers, and plant operators.',
  },
  {
    question: 'Does Exelon offer remote work opportunities?',
    answer: 'Exelon offers hybrid and remote work arrangements for certain corporate and administrative positions. Field operations, plant operations, and customer facing roles typically require on site presence. Work arrangements vary by position and business needs.',
  },
]

const careerPaths = [
  {
    title: 'Lineworker Career Path',
    description: 'Start as an apprentice and progress to journeyman lineworker, then to crew leader and supervisor positions. Lineworkers are essential for maintaining the electrical grid.',
  },
  {
    title: 'Engineering Career Path',
    description: 'Begin as an associate engineer and advance to senior engineer, principal engineer, and engineering management roles. Opportunities exist across multiple engineering disciplines.',
  },
  {
    title: 'Operations Career Path',
    description: 'Enter as an operations technician and work toward shift supervisor, operations manager, and plant leadership positions through training and certifications.',
  },
  {
    title: 'Corporate Career Path',
    description: 'Join in finance, HR, IT, or legal functions and grow into leadership roles. Cross functional opportunities allow for diverse career experiences.',
  },
]

const industryStats = [
  { stat: '10 Million+', label: 'Customers Served' },
  { stat: '19,000+', label: 'Employees Nationwide' },
  { stat: '6 Utilities', label: 'Operating Companies' },
  { stat: '$38B+', label: 'Annual Revenue' },
]

export default async function ExelonCareersPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'exelon careers', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'exelon careers', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Exelon Careers Available Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="exelon" />
          </aside>
          <div className="flex-1">

            
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'exelon careers'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Company Overview Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">About Exelon Corporation</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Exelon Corporation is one of the nation's largest energy companies, operating through six fully regulated transmission and distribution utilities. According to the U.S. Energy Information Administration, Exelon's utilities deliver electricity and natural gas to approximately 10 million customers across a service territory spanning multiple states. The company is headquartered in Chicago, Illinois, and plays a critical role in America's energy infrastructure.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {industryStats.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-blue-600 mb-1">{item.stat}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Categories Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Exelon Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Exelon offers diverse career opportunities across multiple disciplines. According to the U.S. Bureau of Labor Statistics, the utilities sector provides stable employment with competitive wages and benefits. Whether you are an engineer, technician, IT professional, or business specialist, Exelon has roles that match your skills and career goals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((category, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <category.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Service Areas Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Exelon Service Areas and Locations</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Exelon operates through six regulated utility companies serving customers across the Mid Atlantic and Midwest regions. Each utility offers career opportunities in its respective service territory. According to company reports, Exelon employs over 19,000 people across its operations.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceAreas.map((area, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 text-lg mb-1">{area.region}</p>
                <p className="text-gray-600 text-sm mb-2">{area.location}</p>
                <p className="text-blue-600 text-sm font-medium">{area.employees} employees</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Exelon Employee Benefits</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Exelon is committed to providing comprehensive benefits that support employees and their families. According to the U.S. Bureau of Labor Statistics, utility companies typically offer above average benefits packages compared to other industries. Exelon's benefits are designed to promote financial security, health, and work life balance.
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

        {/* Career Paths Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth at Exelon</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Exelon invests in employee development through training programs, mentorship, and clear career progression paths. According to industry data, utility companies offer strong career stability and advancement opportunities for dedicated employees.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {careerPaths.map((path, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{path.title}</h3>
                <p className="text-gray-600 text-sm">{path.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety and Training Section */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Safety and Training Standards</h2>
              <p className="text-gray-700 mb-4">
                Safety is a core value at Exelon. According to the Occupational Safety and Health Administration (OSHA), utility workers face unique hazards including electrical exposure, heights, and confined spaces. Exelon maintains rigorous safety training programs that meet or exceed federal requirements.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Safety Training Programs</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>OSHA compliance training for all field employees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Electrical safety certification programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Emergency response and first aid training</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Ongoing safety refresher courses</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Certifications and Licenses</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>CDL licensing support for eligible positions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Professional engineering license assistance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Industry specific technical certifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Leadership development programs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Education Requirements Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Education and Qualification Requirements</h2>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Educational requirements at Exelon vary by position. According to the U.S. Bureau of Labor Statistics, utility jobs span a wide range of educational backgrounds, from trade certifications to advanced degrees.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Entry Level Positions</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>High school diploma or GED</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Valid driver's license</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Willingness to learn on the job</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Technical Positions</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Associate degree or trade certification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Apprenticeship completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Relevant industry experience</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Professional Positions</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Bachelor's degree in relevant field</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Professional licenses (PE, CPA, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Industry certifications</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Salary Information Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Exelon Salary and Compensation</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, utility workers earn competitive wages compared to other industries. Exelon offers salaries that reflect experience, education, and job responsibilities. The following ranges represent typical compensation across different role levels.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$45K to $65K</p>
                <p className="text-sm text-gray-600">Entry Level Positions</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$65K to $95K</p>
                <p className="text-sm text-gray-600">Skilled Technicians</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$80K to $130K</p>
                <p className="text-sm text-gray-600">Engineers and Specialists</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$120K+</p>
                <p className="text-sm text-gray-600">Management and Senior Roles</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Salaries vary by location, experience, and specific role. These figures are estimates based on industry data and may not reflect current Exelon compensation packages. Union positions may have different pay structures.
            </p>
          </div>
        </section>

        {/* Application Process Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Apply for Exelon Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The application process at Exelon is designed to identify candidates who align with the company's values and possess the skills needed for success. Here is what you can expect when applying:
          </p>
          <div className="space-y-4">
            {[
              { step: 'Search and Apply Online', description: 'Browse available positions and submit your application with resume and cover letter' },
              { step: 'Initial Screening', description: 'Recruiters review applications and contact qualified candidates for phone interviews' },
              { step: 'Assessments and Testing', description: 'Complete technical assessments, aptitude tests, or job specific evaluations as required' },
              { step: 'In Person Interviews', description: 'Meet with hiring managers and team members to discuss your qualifications and fit' },
              { step: 'Background and Drug Screening', description: 'Complete required background checks and drug tests as mandated by federal regulations' },
              { step: 'Offer and Onboarding', description: 'Receive your offer letter and begin the onboarding process with your new team' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-700 font-bold rounded-full text-lg flex-shrink-0">
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

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Exelon Careers</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is not affiliated with, endorsed by, or connected to Exelon Corporation or any of its subsidiary companies including ComEd, PECO, BGE, Pepco, Delmarva Power, or Atlantic City Electric. Exelon and its subsidiary names are registered trademarks of Exelon Corporation. The information provided on this page is for general informational purposes only. Salary ranges, benefits, and job requirements may vary and are subject to change. For the most accurate and current information about employment opportunities, please visit the official Exelon careers website or contact the company directly.
          </p>
        </section>
      </div>
    </>
  )
}