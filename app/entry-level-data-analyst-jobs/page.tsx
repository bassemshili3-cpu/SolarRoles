import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { BarChart3, DollarSign, MapPin, CheckCircle, BookOpen, Users, Award, TrendingUp, FileText, Briefcase, Code, GraduationCap, Layers } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Immediate Openings for Entry Level Data Analysts | Apply Now',
  description: 'Hundreds of entry level data analyst jobs hiring right now across the U.S. No experience required for many roles. Learn SQL, Excel, Python on the job. Browse openings and launch your data career today!',
  keywords: 'entry level data analyst jobs, junior data analyst jobs, data analyst no experience, entry level data analyst positions, beginner data analyst jobs, data analyst hiring now, data analyst internship',
  openGraph: {
    title: 'Entry Level Data Analyst Jobs Hiring Now | Start Your Data Career',
    description: 'Companies urgently hiring entry level data analysts. No prior experience needed for many positions. Get your foot in the door and start building your analytics career today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Entry Level Data Analyst Jobs | Urgently Hiring',
    description: 'Entry level data analyst positions needed ASAP. Hundreds of openings for beginners across the United States. Apply in minutes and kickstart your career in data!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/entry-level-data-analyst-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Entry Level Data Analyst Jobs',
  description: 'Find entry level data analyst jobs hiring across the United States. Browse hundreds of beginner friendly positions in analytics, business intelligence, and data science.',
  url: 'https://www.oh-my-job.com/entry-level-data-analyst-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Entry Level Data Analyst Jobs',
    description: 'Current job listings for entry level and junior data analysts nationwide',
  },
}

const entryLevelRoles = [
  { title: 'Junior Data Analyst', description: 'Clean, organize, and analyze datasets to support business decisions using SQL, Excel, and visualization tools', icon: BarChart3 },
  { title: 'Business Intelligence Analyst', description: 'Build dashboards and reports that help leadership teams track KPIs and identify trends across departments', icon: TrendingUp },
  { title: 'Data Quality Analyst', description: 'Ensure accuracy and consistency of organizational data by auditing records, identifying errors, and improving data pipelines', icon: CheckCircle },
  { title: 'Marketing Data Analyst', description: 'Analyze campaign performance, customer behavior, and conversion metrics to optimize marketing strategies', icon: Users },
  { title: 'Healthcare Data Analyst', description: 'Work with patient records, clinical trial data, and insurance claims to improve healthcare outcomes and operational efficiency', icon: Briefcase },
  { title: 'Financial Data Analyst', description: 'Examine financial statements, market trends, and risk metrics to support investment and budgeting decisions', icon: DollarSign },
]

const technicalSkills = [
  { skill: 'SQL', level: 'Essential', description: 'The most requested skill in data analyst job postings. Used to query, filter, and manipulate data stored in relational databases' },
  { skill: 'Microsoft Excel', level: 'Essential', description: 'Advanced functions including VLOOKUP, pivot tables, conditional formatting, and data validation remain fundamental in every industry' },
  { skill: 'Python or R', level: 'Highly Valued', description: 'Programming languages used for data cleaning, statistical analysis, automation, and building predictive models' },
  { skill: 'Tableau or Power BI', level: 'Highly Valued', description: 'Data visualization platforms used to create interactive dashboards and present insights to non technical stakeholders' },
  { skill: 'Statistics and Probability', level: 'Essential', description: 'Foundational understanding of descriptive statistics, hypothesis testing, regression analysis, and probability distributions' },
  { skill: 'Data Cleaning and Wrangling', level: 'Essential', description: 'The ability to handle missing values, duplicate records, inconsistent formats, and transform raw data into usable datasets' },
]

const salaryByIndustry = [
  { industry: 'Technology', range: '$55,000 to $72,000', note: 'Highest starting salaries, especially in major tech hubs' },
  { industry: 'Finance and Banking', range: '$52,000 to $68,000', note: 'Strong demand for analysts who understand financial modeling' },
  { industry: 'Healthcare', range: '$48,000 to $63,000', note: 'Growing field driven by electronic health records and compliance requirements' },
  { industry: 'Retail and E Commerce', range: '$45,000 to $60,000', note: 'Focus on customer analytics, inventory optimization, and sales forecasting' },
  { industry: 'Government', range: '$42,000 to $58,000', note: 'According to the U.S. Office of Personnel Management, federal data positions follow the GS pay scale' },
  { industry: 'Nonprofit and Education', range: '$40,000 to $52,000', note: 'Lower salaries but often paired with strong benefits and mission driven work' },
]

const certifications = [
  { name: 'Google Data Analytics Professional Certificate', provider: 'Google (via Coursera)', description: 'A widely recognized program designed specifically for beginners. According to Google, no prior experience is required and the certificate can be completed in under six months. Covers spreadsheets, SQL, R programming, Tableau, and data cleaning.' },
  { name: 'IBM Data Analyst Professional Certificate', provider: 'IBM (via Coursera)', description: 'Covers Excel, Python, SQL, and data visualization with hands on labs and a capstone project. Designed for learners with no prior data analysis experience.' },
  { name: 'CompTIA Data+', provider: 'CompTIA', description: 'A vendor neutral certification that validates skills in data concepts, environments, and data analytics. According to CompTIA, it is ideal for professionals beginning a career in data analysis.' },
  { name: 'Microsoft Certified: Power BI Data Analyst Associate', provider: 'Microsoft', description: 'Demonstrates proficiency in Power BI for data modeling, visualization, and report design. Recognized across industries that use the Microsoft ecosystem.' },
]

const educationPathways = [
  { path: 'Bachelor\'s Degree in a Related Field', timeline: '4 years', description: 'According to the Bureau of Labor Statistics, most data analyst positions require at least a bachelor\'s degree. Common majors include statistics, mathematics, computer science, economics, or information systems.' },
  { path: 'Coding Bootcamp', timeline: '3 to 6 months', description: 'Intensive programs that teach SQL, Python, data visualization, and analytics tools. Many bootcamps include career services and portfolio building to help graduates land entry level roles quickly.' },
  { path: 'Online Certificate Programs', timeline: '3 to 12 months', description: 'Self paced programs from providers like Google, IBM, and Meta offer structured learning paths that are increasingly accepted by employers as an alternative to traditional degrees.' },
  { path: 'Self Taught with Portfolio', timeline: 'Varies', description: 'Many hiring managers consider strong portfolios with real world projects as evidence of capability. Open datasets from sources like data.gov and Kaggle provide excellent practice material.' },
]

const topHiringCities = [
  { city: 'New York, NY', detail: 'The largest market for data analysts driven by finance, media, advertising, and healthcare industries' },
  { city: 'San Francisco, CA', detail: 'High concentration of tech companies offering competitive salaries and rapid career growth' },
  { city: 'Washington, D.C.', detail: 'Strong demand from federal agencies, consulting firms, and government contractors' },
  { city: 'Chicago, IL', detail: 'Diverse economy with analytics roles in finance, logistics, manufacturing, and food services' },
  { city: 'Austin, TX', detail: 'Rapidly growing tech hub with lower cost of living and increasing demand for data professionals' },
  { city: 'Atlanta, GA', detail: 'Emerging analytics market with major employers in healthcare, fintech, and logistics' },
]

const interviewTips = [
  { title: 'Practice SQL Challenges', description: 'Most entry level data analyst interviews include a SQL assessment. Practice on platforms like LeetCode, HackerRank, or Mode Analytics to strengthen your query writing skills.' },
  { title: 'Prepare a Portfolio Project', description: 'Walk interviewers through a complete data project from start to finish. Show how you collected, cleaned, analyzed, and visualized data to answer a specific business question.' },
  { title: 'Know Your Tools Inside Out', description: 'Be ready to demonstrate proficiency in Excel, a visualization tool like Tableau or Power BI, and at least one programming language. Hands on assessments are common.' },
  { title: 'Communicate Like a Business Partner', description: 'Hiring managers value candidates who can translate technical findings into clear business insights. Practice explaining your analysis results in plain, non technical language.' },
]

const faqs = [
  {
    question: 'Can I get an entry level data analyst job with no experience?',
    answer: 'Yes, many employers hire entry level data analysts with no prior professional experience. According to the Bureau of Labor Statistics, the demand for data analysts continues to outpace supply, which has led many companies to invest in training programs for new hires. Completing a recognized certificate program, building a portfolio of projects using public datasets, and demonstrating proficiency in SQL and Excel can help candidates without traditional work experience stand out.',
  },
  {
    question: 'What is the average salary for an entry level data analyst?',
    answer: 'According to the Bureau of Labor Statistics, the median annual wage for operations research analysts, a closely related occupation, was approximately $83,640. However, entry level positions typically start between $45,000 and $65,000 depending on geographic location, industry, and the candidate\'s educational background. Major metropolitan areas and the technology sector tend to offer higher starting salaries.',
  },
  {
    question: 'Do I need a degree to become a data analyst?',
    answer: 'While the Bureau of Labor Statistics reports that most data analyst positions list a bachelor\'s degree as a requirement, the industry is increasingly open to alternative credentials. Professional certificates from Google, IBM, and other recognized providers, combined with a strong portfolio, have become viable pathways into the field. Some employers explicitly state that they accept equivalent experience in lieu of a formal degree.',
  },
  {
    question: 'What is the job outlook for data analysts?',
    answer: 'According to the Bureau of Labor Statistics, employment of data scientists and mathematical science occupations is projected to grow much faster than average through 2032. The BLS specifically notes that the increasing volume of data generated by businesses, healthcare systems, and government agencies will drive demand for qualified analysts who can interpret and present actionable insights.',
  },
  {
    question: 'What is the difference between a data analyst and a data scientist?',
    answer: 'Data analysts primarily focus on interpreting existing data using SQL, Excel, and visualization tools to answer specific business questions and create reports. Data scientists typically require more advanced skills in machine learning, statistical modeling, and programming, and are expected to build predictive models and algorithms. Entry level data analyst roles generally require less technical depth and are considered a common stepping stone toward data science careers.',
  },
]

export default async function EntryLevelDataAnalystJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'entry level data analyst', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'entry level data analyst', where: params.where || '', results_per_page: 30, page: 1 })
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
            Entry Level Data Analyst Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="entry level data analyst" />
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
                what={params.what || 'entry level data analyst'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Entry Level Data Analyst Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Entry Level Data Analyst Positions</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Data analysis is one of the fastest growing career fields in the United States. According to the Bureau of Labor Statistics, virtually every industry now relies on data professionals to drive decision making. The following roles represent the most common entry points into the field for candidates starting their analytics career.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entryLevelRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Skills */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Technical Skills Employers Expect</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            While entry level positions are designed for candidates who are still building their expertise, most employers expect a baseline level of proficiency in certain tools and concepts. According to a workforce analysis by the U.S. Bureau of Labor Statistics, the following technical skills appear most frequently in data analyst job postings.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalSkills.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{item.skill}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.level === 'Essential' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.level}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary by Industry */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Entry Level Data Analyst Salaries by Industry</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics, data analyst salaries vary significantly depending on the industry, geographic location, and level of technical expertise. The following figures represent typical starting salary ranges for entry level data analysts across major sectors of the U.S. economy.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salaryByIndustry.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5">
                  <p className="font-semibold text-gray-900 mb-1">{item.industry}</p>
                  <p className="text-xl font-bold text-green-600 mb-2">{item.range}</p>
                  <p className="text-gray-500 text-sm">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate and reflect entry level positions.
            </p>
          </div>
        </section>

        {/* Education Pathways */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Qualify for Entry Level Data Analyst Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            There are multiple pathways into data analytics, and the field is increasingly accessible to candidates from diverse educational backgrounds. According to the Bureau of Labor Statistics, while a bachelor's degree remains the most common requirement, alternative credentials are gaining traction with employers nationwide.
          </p>
          <div className="space-y-4">
            {educationPathways.map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <span className="inline-flex items-center justify-center w-9 h-9 bg-indigo-100 text-indigo-700 font-bold rounded-full text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                    <p className="font-semibold text-gray-900">{item.path}</p>
                    <span className="text-sm text-indigo-600 font-medium">{item.timeline}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Certifications for Aspiring Data Analysts</h2>
              <p className="text-gray-700 mb-6">
                Professional certifications can help entry level candidates demonstrate their skills to employers, especially when they lack traditional work experience. According to the U.S. Department of Labor's CareerOneStop resource, industry recognized credentials are increasingly valued by hiring managers in data driven fields.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                    <p className="text-blue-600 text-xs font-medium mb-2">Provider: {cert.provider}</p>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Top Hiring Cities */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Cities Hiring Entry Level Data Analysts</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the Bureau of Labor Statistics, metropolitan areas with large concentrations of technology, finance, and healthcare employers consistently offer the highest number of data analyst openings. The following cities represent the strongest job markets for entry level candidates.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topHiringCities.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <p className="font-semibold text-gray-900">{item.city}</p>
                </div>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interview Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Ace Your Entry Level Data Analyst Interview</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {interviewTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Market Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Data Analyst Job Market Outlook</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics, the data analytics field is experiencing exceptional growth. The increasing reliance on data driven decision making across all sectors of the economy is creating sustained demand for qualified analysts, making this one of the most promising career paths for job seekers entering the workforce.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">+35%</p>
                <p className="text-sm text-gray-600">Projected growth for data scientist roles through 2032, among the fastest of all occupations according to the BLS</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">$83,640</p>
                <p className="text-sm text-gray-600">Median annual wage for operations research analysts, a closely related occupation, per the BLS</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">17,000+</p>
                <p className="text-sm text-gray-600">Estimated annual openings for data analysts and related roles driven by growth and workforce turnover</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Entry Level Data Analyst Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute professional, financial, or legal advice. Salary figures, job growth projections, and educational requirements are based on publicly available data and may vary by employer, geographic location, and individual qualifications. Always consult the U.S. Bureau of Labor Statistics at bls.gov and the relevant certification providers for the most current information. Job seekers should verify all position requirements directly with the hiring organization before applying.
          </p>
        </section>
      </div>
    </>
  )
}