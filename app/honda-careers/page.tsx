import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Car, Shield, DollarSign, MapPin, CheckCircle, GraduationCap, Users, Award, Building, Wrench, HelpCircle, TrendingUp, Clock, Cog, Leaf } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Urgently Hiring Honda Careers | Apply Today',
  description: 'Discover 500+ Honda careers hiring now across the U.S. Join a top automotive manufacturer with competitive pay, excellent benefits, and career growth. Engineers, technicians, and professionals needed. Apply now!',
  keywords: 'honda careers, honda jobs, honda employment, automotive jobs, honda manufacturing jobs, honda engineering jobs, american honda jobs, honda dealership jobs',
  openGraph: {
    title: 'Honda Careers | Immediate Openings Available',
    description: 'Join Honda, one of the world\'s leading automotive manufacturers. Competitive salaries, comprehensive benefits, and innovation driven culture. Hundreds of positions available now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Honda Careers | Now Hiring Automotive Professionals',
    description: 'Build your career with Honda. Explore openings in manufacturing, engineering, sales, and more. Top benefits and growth opportunities await.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/honda-careers',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Honda Careers',
  description: 'Find Honda careers and job opportunities across the United States. Browse current openings in manufacturing, engineering, sales, and corporate roles.',
  url: 'https://www.oh-my-job.com/honda-careers',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Honda Careers',
    description: 'Current job listings at Honda and its facilities across North America',
  },
}

const jobCategories = [
  { title: 'Manufacturing and Production', description: 'Assembly line workers, quality technicians, and production supervisors', icon: Cog },
  { title: 'Engineering', description: 'Automotive, mechanical, electrical, and software engineering positions', icon: Wrench },
  { title: 'Research and Development', description: 'Innovation in vehicle design, safety systems, and electric vehicles', icon: TrendingUp },
  { title: 'Sales and Marketing', description: 'Regional sales, marketing specialists, and brand management roles', icon: Users },
  { title: 'Dealership Positions', description: 'Sales associates, service advisors, and technicians at Honda dealerships', icon: Car },
  { title: 'Corporate and Administrative', description: 'Finance, HR, IT, legal, and business operations roles', icon: Building },
]

const benefits = [
  { benefit: 'Competitive Compensation', description: 'Industry leading salaries with performance bonuses and profit sharing' },
  { benefit: 'Healthcare Coverage', description: 'Comprehensive medical, dental, and vision plans for employees and families' },
  { benefit: 'Retirement Benefits', description: '401(k) with company match and pension plan options' },
  { benefit: 'Vehicle Programs', description: 'Employee vehicle purchase and lease programs at discounted rates' },
  { benefit: 'Paid Time Off', description: 'Generous vacation, holidays, and personal days' },
  { benefit: 'Education Assistance', description: 'Tuition reimbursement and professional development programs' },
]

const usLocations = [
  { facility: 'Marysville Auto Plant', location: 'Marysville, Ohio', type: 'Vehicle Manufacturing', employees: '4,200+' },
  { facility: 'East Liberty Auto Plant', location: 'East Liberty, Ohio', type: 'Vehicle Manufacturing', employees: '2,400+' },
  { facility: 'Anna Engine Plant', location: 'Anna, Ohio', type: 'Engine Manufacturing', employees: '2,800+' },
  { facility: 'Lincoln Plant', location: 'Lincoln, Alabama', type: 'Vehicle Manufacturing', employees: '4,500+' },
  { facility: 'Indiana Auto Plant', location: 'Greensburg, Indiana', type: 'Vehicle Manufacturing', employees: '2,100+' },
  { facility: 'American Honda HQ', location: 'Torrance, California', type: 'Corporate Headquarters', employees: '3,000+' },
]

const faqs = [
  {
    question: 'What is American Honda Motor Company?',
    answer: 'American Honda Motor Company is the U.S. subsidiary of Honda Motor Company, Ltd. According to the company, Honda has been producing vehicles in America since 1982 and has invested over $22 billion in its North American operations. Honda manufactures automobiles, motorcycles, power equipment, and engines at facilities across the United States.',
  },
  {
    question: 'What qualifications do I need to work at Honda?',
    answer: 'Qualifications vary by position. According to the U.S. Bureau of Labor Statistics, automotive manufacturing positions typically require a high school diploma or equivalent, while engineering and technical roles require relevant degrees. Many production roles provide on the job training, and Honda is known for its comprehensive training programs.',
  },
  {
    question: 'Does Honda offer internships and co op programs?',
    answer: 'Yes, Honda offers various internship and cooperative education programs for students. These programs are available in engineering, business, IT, and other fields. Participants gain hands on experience while working on real projects alongside Honda associates.',
  },
  {
    question: 'What is the hiring process at Honda manufacturing plants?',
    answer: 'The typical hiring process includes an online application, skills assessment tests, interviews with HR and hiring managers, background checks, and drug screening. According to the U.S. Department of Transportation, positions involving commercial driving or safety sensitive work require additional screenings.',
  },
  {
    question: 'Are Honda manufacturing jobs union positions?',
    answer: 'Honda manufacturing plants in the United States have traditionally operated without union representation. According to the National Labor Relations Board, employees have the right to organize, but Honda facilities have remained non union while offering competitive wages and benefits comparable to unionized plants.',
  },
  {
    question: 'Does Honda offer relocation assistance?',
    answer: 'Honda provides relocation assistance for certain positions, particularly for professional, engineering, and management roles. The specifics of relocation packages vary based on the position level and business needs. Details are typically discussed during the offer process.',
  },
]

const careerPaths = [
  {
    title: 'Production Associate Path',
    description: 'Start as a production associate and advance to team leader, group leader, and production management. Honda promotes heavily from within and values associate development.',
  },
  {
    title: 'Engineering Career Path',
    description: 'Begin as an associate engineer and progress to senior engineer, principal engineer, and engineering management. Opportunities span vehicle development, powertrain, and manufacturing engineering.',
  },
  {
    title: 'Technician Career Path',
    description: 'Enter as a maintenance or quality technician and work toward specialist, senior technician, and supervisory roles. Certifications and training programs support advancement.',
  },
  {
    title: 'Sales and Dealership Path',
    description: 'Start at a Honda dealership and grow into sales management, service management, or pursue opportunities at American Honda corporate offices.',
  },
]

const hondaValues = [
  { value: 'The Power of Dreams', description: 'Honda encourages associates to dream big and pursue innovative solutions' },
  { value: 'Respect for the Individual', description: 'Every associate is valued and empowered to contribute ideas' },
  { value: 'Challenging Spirit', description: 'Continuous improvement and taking on new challenges are core principles' },
  { value: 'Quality in All Aspects', description: 'Commitment to excellence in products, processes, and relationships' },
]

export default async function HondaCareersPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'honda', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'honda', where: params.where || '', results_per_page: 30, page: 1 })
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
            Honda Careers Available Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="honda" />
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
                what={params.what || 'honda'}
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
            <Car className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">About Honda in America</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Honda has been a major employer in the United States for over four decades. According to company data, Honda employs more than 30,000 associates across its U.S. operations and has invested over $22 billion in North America. The company manufactures automobiles, motorcycles, ATVs, power equipment, and aircraft engines at facilities primarily located in Ohio, Alabama, Indiana, North Carolina, and South Carolina.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { stat: '30,000+', label: 'U.S. Associates' },
              { stat: '$22B+', label: 'U.S. Investment' },
              { stat: '12', label: 'Manufacturing Facilities' },
              { stat: 'Since 1982', label: 'U.S. Production' },
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-red-600 mb-1">{item.stat}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Categories Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Honda Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Honda offers diverse career opportunities across multiple disciplines. According to the U.S. Bureau of Labor Statistics, the automotive industry provides stable employment with competitive wages. Whether you are interested in manufacturing, engineering, sales, or corporate roles, Honda has positions that match your skills and career goals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((category, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <category.icon className="w-10 h-10 text-red-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* U.S. Locations Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Honda Facilities in the United States</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Honda operates multiple manufacturing plants and facilities across the United States. Ohio serves as Honda's largest concentration of operations, with additional major facilities in Alabama, Indiana, and California. Each facility offers unique career opportunities based on its operations.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usLocations.map((facility, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 text-lg mb-1">{facility.facility}</p>
                <p className="text-gray-600 text-sm mb-1">{facility.location}</p>
                <p className="text-blue-600 text-sm mb-2">{facility.type}</p>
                <p className="text-gray-500 text-sm">{facility.employees} associates</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Honda Employee Benefits</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Honda is committed to providing comprehensive benefits that support associates and their families. According to the U.S. Bureau of Labor Statistics, automotive manufacturers typically offer above average benefits packages. Honda's benefits are designed to promote financial security, health, and work life balance.
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

        {/* Honda Philosophy Section */}
        <section className="mt-20 bg-red-50 border border-red-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Honda Philosophy and Culture</h2>
              <p className="text-gray-700 mb-6">
                Honda's corporate culture is built on a unique philosophy that emphasizes respect for individuals and the power of dreams. This philosophy guides how Honda operates and how associates are treated throughout their careers.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {hondaValues.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.value}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Career Paths Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth at Honda</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Honda invests in associate development through training programs, mentorship, and clear career progression paths. The company is known for promoting from within and providing opportunities for associates to grow their careers.
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

        {/* Electric and Future Technology Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Honda's Future: Electric and Sustainable Careers</h2>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Honda is investing heavily in electric vehicle technology and sustainability. According to company announcements, Honda plans to achieve carbon neutrality by 2050 and is expanding its electric vehicle lineup. This creates new career opportunities in emerging technologies.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Battery Technology</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Battery cell development engineers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Battery pack manufacturing technicians</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Energy storage system specialists</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Electric Powertrain</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Electric motor engineers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Power electronics specialists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>EV systems integration engineers</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Connected Vehicles</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Software developers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Autonomous driving engineers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Cybersecurity specialists</span>
                  </li>
                </ul>
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
              Educational requirements at Honda vary by position. According to the U.S. Bureau of Labor Statistics, automotive industry jobs span a wide range of educational backgrounds, from high school diplomas to advanced engineering degrees.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Production Positions</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>High school diploma or GED</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Ability to work rotating shifts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Physical ability to stand and lift</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Technical Positions</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Associate degree or technical certification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Relevant industry experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Specialized skills (welding, electrical, etc.)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Engineering Positions</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Bachelor's degree in engineering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Professional engineering license (preferred)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>CAD and simulation software proficiency</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Honda Salary and Compensation</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, automotive manufacturing workers earn competitive wages compared to other industries. Honda is known for offering salaries that are competitive with or exceed industry standards. The following ranges represent typical compensation across different role levels.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$40K to $60K</p>
                <p className="text-sm text-gray-600">Production Associates</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$55K to $85K</p>
                <p className="text-sm text-gray-600">Skilled Technicians</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$75K to $120K</p>
                <p className="text-sm text-gray-600">Engineers</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$100K+</p>
                <p className="text-sm text-gray-600">Management and Senior Roles</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Salaries vary by location, experience, and specific role. These figures are estimates based on industry data and may not reflect current Honda compensation packages. Production associates often earn additional income through overtime and shift differentials.
            </p>
          </div>
        </section>

        {/* Application Process Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Apply for Honda Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The application process at Honda is designed to identify candidates who align with the company's philosophy and possess the skills needed for success. Here is what you can expect when applying:
          </p>
          <div className="space-y-4">
            {[
              { step: 'Search and Apply Online', description: 'Browse available positions and submit your application with resume and relevant information' },
              { step: 'Initial Screening', description: 'Recruiters review applications and contact qualified candidates for phone or video interviews' },
              { step: 'Assessments and Testing', description: 'Complete aptitude tests, skills assessments, or technical evaluations as required for the position' },
              { step: 'On Site Interviews', description: 'Meet with hiring managers and team members to discuss your qualifications and fit with Honda culture' },
              { step: 'Background and Drug Screening', description: 'Complete required background checks and drug tests in compliance with federal and state regulations' },
              { step: 'Offer and Onboarding', description: 'Receive your offer letter and begin the comprehensive onboarding process at your Honda facility' },
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Honda Careers</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is not affiliated with, endorsed by, or connected to American Honda Motor Company, Inc., Honda Motor Company, Ltd., or any Honda dealership. Honda and all related marks are registered trademarks of Honda Motor Company, Ltd. The information provided on this page is for general informational purposes only. Salary ranges, benefits, and job requirements may vary and are subject to change. For the most accurate and current information about employment opportunities, please visit the official Honda careers website or contact the company directly.
          </p>
        </section>
      </div>
    </>
  )
}