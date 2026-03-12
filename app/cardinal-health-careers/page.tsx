import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Heart, DollarSign, MapPin, CheckCircle, GraduationCap, Users, Award, Building, Truck, HelpCircle, TrendingUp, Shield, Package, Pill } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Urgent: Cardinal Health Careers Hiring Now | Apply Today',
  description: 'Discover 500+ Cardinal Health careers hiring immediately. Join a Fortune 500 healthcare leader with competitive pay, excellent benefits, and growth opportunities. Warehouse, pharmacy, IT, and corporate roles available. Apply now!',
  keywords: 'cardinal health careers, cardinal health jobs, cardinal health employment, pharmaceutical distribution jobs, healthcare logistics careers, cardinal health warehouse jobs, cardinal health pharmacy jobs',
  openGraph: {
    title: 'Cardinal Health Careers | Immediate Openings Available',
    description: 'Join Cardinal Health, a top healthcare services company. Competitive salaries, comprehensive benefits, and career advancement opportunities. Hundreds of positions available now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cardinal Health Careers | Now Hiring',
    description: 'Build your career with Cardinal Health. Explore openings in distribution, pharmacy, IT, and corporate roles. Top benefits and growth opportunities await.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/cardinal-health-careers',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Cardinal Health Careers',
  description: 'Find Cardinal Health careers and job opportunities across the United States. Browse current openings in distribution, pharmacy services, corporate, and technology roles.',
  url: 'https://www.oh-my-job.com/cardinal-health-careers',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Cardinal Health Careers',
    description: 'Current job listings at Cardinal Health facilities nationwide',
  },
}

const jobCategories = [
  { title: 'Distribution and Warehouse', description: 'Warehouse associates, forklift operators, shipping and receiving specialists', icon: Package },
  { title: 'Pharmacy Services', description: 'Pharmacists, pharmacy technicians, and clinical specialists', icon: Pill },
  { title: 'Supply Chain and Logistics', description: 'Supply chain analysts, logistics coordinators, and inventory managers', icon: Truck },
  { title: 'Information Technology', description: 'Software developers, data analysts, cybersecurity, and IT support', icon: TrendingUp },
  { title: 'Sales and Marketing', description: 'Account executives, sales representatives, and marketing specialists', icon: Users },
  { title: 'Corporate and Finance', description: 'Finance, HR, legal, compliance, and administrative roles', icon: Building },
]

const benefits = [
  { benefit: 'Comprehensive Healthcare', description: 'Medical, dental, and vision coverage for employees and families' },
  { benefit: 'Retirement Savings', description: '401k with company match and retirement planning resources' },
  { benefit: 'Paid Time Off', description: 'Generous vacation, holidays, and personal days' },
  { benefit: 'Tuition Assistance', description: 'Educational reimbursement for continuing education and degrees' },
  { benefit: 'Employee Wellness', description: 'Wellness programs, gym discounts, and mental health resources' },
  { benefit: 'Career Development', description: 'Training programs, mentorship, and internal mobility opportunities' },
]

const majorLocations = [
  { location: 'Dublin, Ohio', type: 'Corporate Headquarters', description: 'Global headquarters with corporate, IT, and leadership roles' },
  { location: 'La Vergne, Tennessee', type: 'Distribution Center', description: 'Major pharmaceutical distribution hub' },
  { location: 'Valencia, California', type: 'Distribution Center', description: 'West Coast distribution operations' },
  { location: 'Groveport, Ohio', type: 'Distribution Center', description: 'Central distribution facility' },
  { location: 'Denver, Colorado', type: 'Regional Office', description: 'Regional operations and specialty services' },
  { location: 'Various Nationwide', type: 'Field Positions', description: 'Sales, pharmacy, and field service roles across all 50 states' },
]

const faqs = [
  {
    question: 'What is Cardinal Health?',
    answer: 'Cardinal Health is one of the largest healthcare services companies in the United States. According to the Fortune 500 list, Cardinal Health ranks among the top 20 largest U.S. companies by revenue. The company distributes pharmaceuticals and medical products to hospitals, pharmacies, and healthcare facilities across the country, serving over 90% of U.S. hospitals.',
  },
  {
    question: 'What qualifications do I need to work at Cardinal Health?',
    answer: 'Qualifications vary by position. Warehouse and distribution roles typically require a high school diploma or GED. According to the U.S. Bureau of Labor Statistics, pharmacy technician positions may require certification depending on state requirements. Professional roles in IT, finance, and management generally require bachelor\'s degrees or relevant experience.',
  },
  {
    question: 'Does Cardinal Health offer remote work opportunities?',
    answer: 'Yes, Cardinal Health offers remote and hybrid work arrangements for certain positions, particularly in corporate, IT, and professional roles. Distribution, warehouse, and pharmacy positions typically require on site presence due to the nature of the work. Work arrangements vary by role and business needs.',
  },
  {
    question: 'What is the hiring process at Cardinal Health?',
    answer: 'The typical hiring process includes an online application, phone screening with a recruiter, interviews with hiring managers, and for some roles, skills assessments or panel interviews. Background checks and drug screening are required for all positions, with additional requirements for roles handling controlled substances as mandated by the Drug Enforcement Administration (DEA).',
  },
  {
    question: 'Does Cardinal Health provide training for new employees?',
    answer: 'Yes, Cardinal Health provides comprehensive training for all new employees. Warehouse associates receive safety and equipment training, pharmacy technicians receive specialized pharmaceutical handling training, and professional employees participate in onboarding programs. Ongoing training and development opportunities are available throughout employment.',
  },
  {
    question: 'Are there opportunities for advancement at Cardinal Health?',
    answer: 'Cardinal Health emphasizes internal mobility and career development. Many leadership positions are filled from within the company. Employees have access to training programs, mentorship opportunities, and internal job postings. The company\'s size and diverse operations create pathways for career growth across multiple functions.',
  },
]

const careerPaths = [
  {
    title: 'Warehouse Operations Path',
    description: 'Start as a warehouse associate and advance to lead, supervisor, and operations manager positions. Distribution center leadership roles offer competitive salaries and comprehensive benefits.',
  },
  {
    title: 'Pharmacy Career Path',
    description: 'Begin as a pharmacy technician and progress to senior technician, lead roles, or pursue pharmacist licensure. Specialty pharmacy and clinical roles offer advanced opportunities.',
  },
  {
    title: 'Corporate Professional Path',
    description: 'Join in finance, HR, marketing, or other corporate functions and grow into senior specialist, manager, and director positions. Cross functional moves are encouraged.',
  },
  {
    title: 'Technology Career Path',
    description: 'Start as a developer, analyst, or IT specialist and advance to senior technical roles, architect positions, or technology leadership.',
  },
]

const industryStats = [
  { stat: 'Fortune 15', label: 'Company Ranking' },
  { stat: '$200B+', label: 'Annual Revenue' },
  { stat: '46,000+', label: 'Employees Worldwide' },
  { stat: '90%', label: 'U.S. Hospitals Served' },
]

const workEnvironment = [
  { environment: 'Distribution Centers', description: 'Climate controlled facilities with modern equipment and safety protocols', icon: Package },
  { environment: 'Corporate Offices', description: 'Modern workspaces with collaborative areas and amenities', icon: Building },
  { environment: 'Pharmacy Locations', description: 'State licensed pharmacy facilities with clinical environments', icon: Pill },
  { environment: 'Field Positions', description: 'Remote and travel roles serving customers across regions', icon: MapPin },
]

export default async function CardinalHealthCareersPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'cardinal health', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'cardinal health', where: params.where || '', results_per_page: 30, page: 1 })
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
            Cardinal Health Careers Available Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="cardinal health" />
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
                what={params.what || 'cardinal health'}
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
            <Heart className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">About Cardinal Health</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cardinal Health is a global healthcare services company that improves the cost effectiveness of healthcare. According to Fortune magazine, Cardinal Health ranks among the top 15 largest U.S. corporations by revenue. The company provides pharmaceutical and medical products distribution, as well as consulting and data services to healthcare facilities. Cardinal Health serves over 90% of hospitals in the United States and employs more than 46,000 people worldwide.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {industryStats.map((item, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">Types of Cardinal Health Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cardinal Health offers diverse career opportunities across multiple functions. According to the U.S. Bureau of Labor Statistics, healthcare support and logistics occupations continue to show strong growth. Whether you are interested in warehouse operations, pharmacy services, technology, or corporate roles, Cardinal Health has positions to match your skills.
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

        {/* Work Environments Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Cardinal Health Work Environments</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cardinal Health employees work in a variety of settings depending on their role. The company maintains high standards for safety and workplace quality across all facilities.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workEnvironment.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <item.icon className="w-8 h-8 text-purple-600 mb-3" />
                <p className="font-semibold text-gray-900 mb-1">{item.environment}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Locations Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Cardinal Health Locations</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cardinal Health operates facilities across the United States, with the corporate headquarters located in Dublin, Ohio. The company maintains distribution centers, regional offices, and pharmacy locations nationwide.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {majorLocations.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 text-lg mb-1">{item.location}</p>
                <p className="text-red-600 font-medium text-sm mb-2">{item.type}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Cardinal Health Employee Benefits</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cardinal Health offers a comprehensive benefits package designed to support employees and their families. According to industry surveys, healthcare companies typically provide above average benefits. Cardinal Health's offerings include:
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
            <h2 className="text-2xl font-bold text-gray-900">Career Growth at Cardinal Health</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cardinal Health emphasizes career development and internal mobility. The company's size and diverse operations create multiple pathways for advancement across different functions and locations.
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

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <GraduationCap className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Education and Requirements</h2>
              <p className="text-gray-700 mb-6">
                Requirements at Cardinal Health vary by position and function. According to the U.S. Bureau of Labor Statistics, healthcare logistics and pharmacy roles have specific qualification standards. Here are typical requirements by role type:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Warehouse and Distribution</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>High school diploma or GED</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Ability to lift up to 50 pounds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Forklift certification (provided)</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Pharmacy Positions</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>State pharmacy technician license</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>PTCB or ExCPT certification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>PharmD for pharmacist roles</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Professional Roles</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Bachelor's degree (typically required)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Relevant industry experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Professional certifications (role specific)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance and Safety Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Compliance and Safety Standards</h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              As a pharmaceutical distributor, Cardinal Health operates under strict regulatory requirements. According to the U.S. Drug Enforcement Administration (DEA) and Food and Drug Administration (FDA), companies handling controlled substances and pharmaceuticals must maintain rigorous compliance standards.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Regulatory Compliance</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>DEA licensing for controlled substance handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>FDA Good Distribution Practice compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>State Board of Pharmacy regulations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>HIPAA privacy and security standards</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Employee Requirements</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Background checks for all positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Drug screening (pre employment and random)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Annual compliance training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Safety certifications for warehouse roles</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Cardinal Health Salary Information</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, healthcare support and logistics workers earn competitive wages. Cardinal Health offers salaries that reflect experience, education, and job responsibilities. The following ranges represent typical compensation across different role levels.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$35K to $50K</p>
                <p className="text-sm text-gray-600">Warehouse Associates</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$40K to $60K</p>
                <p className="text-sm text-gray-600">Pharmacy Technicians</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$70K to $120K</p>
                <p className="text-sm text-gray-600">Professional Roles</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$120K+</p>
                <p className="text-sm text-gray-600">Pharmacists and Managers</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Salaries vary by location, experience, and specific role. These figures are estimates based on industry data and may not reflect current Cardinal Health compensation packages. Additional benefits and bonuses may significantly increase total compensation.
            </p>
          </div>
        </section>

        {/* Application Process Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Apply for Cardinal Health Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The application process at Cardinal Health is designed to identify qualified candidates who align with the company's values and meet regulatory requirements. Here is what you can expect:
          </p>
          <div className="space-y-4">
            {[
              { step: 'Search and Apply Online', description: 'Browse available positions and submit your application with resume and relevant credentials' },
              { step: 'Initial Screening', description: 'Recruiters review applications and contact qualified candidates for phone or video interviews' },
              { step: 'Interviews', description: 'Meet with hiring managers and team members to discuss your qualifications and experience' },
              { step: 'Skills Assessment', description: 'Complete any required assessments or tests relevant to the position' },
              { step: 'Background and Drug Screening', description: 'Complete comprehensive background checks and drug tests as required by federal regulations' },
              { step: 'Offer and Onboarding', description: 'Receive your offer letter and begin the onboarding process with compliance training' },
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Cardinal Health Careers</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is not affiliated with, endorsed by, or connected to Cardinal Health, Inc. or any of its subsidiaries. Cardinal Health is a registered trademark of Cardinal Health, Inc. The information provided on this page is for general informational purposes only. Salary ranges, benefits, and job requirements may vary and are subject to change. For the most accurate and current information about employment opportunities, please visit the official Cardinal Health careers website or contact the company directly.
          </p>
        </section>
      </div>
    </>
  )
}