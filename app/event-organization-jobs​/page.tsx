import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Calendar, Clock, DollarSign, MapPin, CheckCircle, BookOpen, Users, Award, TrendingUp, FileText, Briefcase, Star } from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent Demand for Event Organization Professionals | Apply Now',
  description: 'Hundreds of event organization jobs hiring immediately across the U.S. Corporate events, weddings, conferences and festivals. From entry level to senior planner roles. Browse openings and apply in minutes!',
  keywords: 'event organization jobs, event planner jobs, event coordinator jobs, event management careers, event planning positions, corporate event jobs, wedding planner jobs, conference organizer jobs',
  openGraph: {
    title: 'Event Organization Jobs Hiring Now | Immediate Openings Nationwide',
    description: 'Companies urgently seeking event organization professionals. Plan corporate events, weddings, conferences and more. Find your dream role in the events industry today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event Organization Jobs | Urgently Hiring Nationwide',
    description: 'Event organization positions needed ASAP. From coordinators to senior planners, browse hundreds of openings across the United States. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/event-organization-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Event Organization Jobs',
  description: 'Find event organization jobs hiring across the United States. Browse hundreds of positions in corporate events, weddings, conferences, and festival planning.',
  url: 'https://www.oh-my-job.com/event-organization-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Event Organization Jobs',
    description: 'Current job listings for event planners, coordinators, and organizers nationwide',
  },
}

const eventJobTypes = [
  { title: 'Corporate Event Planner', description: 'Organize conferences, product launches, team retreats, and executive meetings for businesses of all sizes', icon: Briefcase },
  { title: 'Wedding and Social Event Coordinator', description: 'Plan and execute weddings, galas, fundraisers, and private celebrations from concept to completion', icon: Star },
  { title: 'Conference and Convention Organizer', description: 'Manage large scale industry conferences, trade shows, and professional conventions with thousands of attendees', icon: Users },
  { title: 'Festival and Concert Producer', description: 'Coordinate logistics, permits, vendors, and entertainment for music festivals, food fairs, and public events', icon: Calendar },
  { title: 'Nonprofit Event Fundraiser', description: 'Design and execute charity galas, donor events, and awareness campaigns that drive fundraising goals', icon: Award },
  { title: 'Virtual and Hybrid Event Specialist', description: 'Plan and manage online conferences, webinars, and hybrid experiences using digital event platforms', icon: TrendingUp },
]

const careerPathway = [
  { role: 'Event Assistant or Intern', salary: '$30,000 to $38,000', experience: '0 to 1 year', description: 'Support senior planners with logistics, vendor communication, and on site event setup' },
  { role: 'Event Coordinator', salary: '$40,000 to $52,000', experience: '1 to 3 years', description: 'Manage day to day planning tasks, coordinate vendors, and oversee event timelines independently' },
  { role: 'Event Planner or Manager', salary: '$52,000 to $70,000', experience: '3 to 7 years', description: 'Lead full event lifecycle from concept and budgeting through execution and post event analysis' },
  { role: 'Senior Event Director', salary: '$75,000 to $110,000+', experience: '8+ years', description: 'Oversee entire event departments, manage large budgets, and develop strategic event portfolios' },
]

const certifications = [
  { name: 'Certified Meeting Professional (CMP)', issuer: 'Events Industry Council', description: 'The most widely recognized certification in the events industry. According to the Events Industry Council, the CMP credential demonstrates mastery in 10 domains of event management including strategic planning, risk management, and financial management.' },
  { name: 'Certified Special Events Professional (CSEP)', issuer: 'International Live Events Association', description: 'Recognizes professionals who demonstrate expertise in all aspects of special event production. Requires a minimum of three years of professional experience in the events industry.' },
  { name: 'Certified Government Meeting Professional (CGMP)', issuer: 'Society of Government Meeting Professionals', description: 'Designed specifically for planners who organize government events. According to the SGMP, this certification validates knowledge of federal regulations that govern government meetings and travel.' },
  { name: 'Digital Event Strategist (DES)', issuer: 'Professional Convention Management Association', description: 'Focuses on the growing field of virtual and hybrid events, covering digital strategy, audience engagement, and technology platform selection.' },
]

const keySkills = [
  { skill: 'Budget Management', description: 'Track expenses, negotiate vendor contracts, and deliver events within financial targets while maximizing value' },
  { skill: 'Vendor and Venue Coordination', description: 'Source, evaluate, and manage relationships with caterers, venues, AV providers, decorators, and entertainment' },
  { skill: 'Project Timeline Management', description: 'Create detailed timelines and production schedules, ensuring all deliverables are met from planning through post event' },
  { skill: 'Crisis Management', description: 'Anticipate potential issues and respond quickly to last minute changes, weather disruptions, or logistical challenges' },
  { skill: 'Client Communication', description: 'Translate client visions into actionable plans, provide regular updates, and manage expectations throughout the process' },
  { skill: 'Marketing and Promotion', description: 'Develop event branding, coordinate marketing campaigns, and drive attendance through social media and outreach strategies' },
]

const topHiringIndustries = [
  { industry: 'Hospitality and Hotels', detail: 'Major hotel chains and resort groups employ large teams of in house event planners for weddings, conferences, and banquets' },
  { industry: 'Corporate and Tech', detail: 'Technology companies and Fortune 500 corporations regularly hire event professionals for product launches, summits, and internal events' },
  { industry: 'Nonprofit Organizations', detail: 'Charities and foundations seek dedicated event fundraisers to plan galas, auctions, and donor appreciation events year round' },
  { industry: 'Government and Public Sector', detail: 'According to the U.S. Office of Personnel Management, federal and state agencies hire event coordinators for public ceremonies, hearings, and official gatherings' },
  { industry: 'Entertainment and Media', detail: 'Studios, networks, and production companies need event professionals for premieres, press tours, award shows, and promotional events' },
  { industry: 'Convention and Visitors Bureaus', detail: 'City and regional tourism boards employ event specialists to attract and manage large conventions and trade shows' },
]

const dayInTheLife = [
  { time: '8:00 AM', task: 'Review event timeline, confirm vendor deliveries, and brief the team on the day\'s priorities' },
  { time: '9:30 AM', task: 'Client meeting to finalize event details, walk through the venue layout, and approve design elements' },
  { time: '11:00 AM', task: 'Negotiate contracts with caterers and AV providers, review proposals, and update the event budget' },
  { time: '1:00 PM', task: 'Conduct a site visit at an upcoming venue to assess capacity, accessibility, and technical capabilities' },
  { time: '3:00 PM', task: 'Coordinate with the marketing team on promotional materials, invitations, and social media campaigns' },
  { time: '5:00 PM', task: 'Wrap up administrative tasks, send progress reports to clients, and prepare materials for the next day' },
]

const faqs = [
  {
    question: 'What education do I need for an event organization career?',
    answer: 'According to the Bureau of Labor Statistics, most event planner positions require at least a bachelor\'s degree. Common fields of study include hospitality management, communications, public relations, marketing, or business administration. However, many professionals enter the field through related experience in catering, hotel management, or nonprofit work. Some employers value industry certifications such as the CMP (Certified Meeting Professional) as highly as formal education.',
  },
  {
    question: 'How much do event organizers earn in the United States?',
    answer: 'According to the Bureau of Labor Statistics Occupational Outlook Handbook, the median annual wage for meeting, convention, and event planners was approximately $56,920 as of the most recent data. The lowest 10 percent earned less than $33,120 and the highest 10 percent earned more than $100,890. Salaries vary significantly based on geographic location, industry, level of experience, and whether the planner works independently or for a large organization.',
  },
  {
    question: 'Is event planning a growing career field?',
    answer: 'Yes. According to the Bureau of Labor Statistics, employment of meeting, convention, and event planners is projected to grow 8 percent from 2022 to 2032, which is faster than the average for all occupations. The BLS estimates about 17,400 openings each year over the decade, driven by continued demand for professionally organized corporate events, conferences, and social gatherings.',
  },
  {
    question: 'Do I need a license to be an event planner?',
    answer: 'There is no federal license required to work as an event planner in the United States. However, depending on the type of events you organize, you may need local business permits, liability insurance, or specific vendor permits. According to the U.S. Small Business Administration, independent event planners should check with their city or county clerk\'s office for any local business licensing requirements.',
  },
  {
    question: 'What is the difference between an event coordinator and an event planner?',
    answer: 'While the titles are often used interchangeably, there is generally a distinction in scope. An event coordinator typically handles logistics and execution details such as scheduling, vendor communication, and on site management. An event planner usually takes on a broader strategic role including concept development, budgeting, client consultation, and overall creative direction. Senior positions such as Event Director or VP of Events encompass both functions plus team leadership.',
  },
]

export default async function EventOrganizationJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'event organization', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'event organization', where: params.where || '', results_per_page: 30, page: 1 }),
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
            Event Organization Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="event organization" />
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
                what={params.what || 'event organization'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Event Organization Jobs */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Event Organization Positions</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The event organization industry encompasses a wide variety of roles, from intimate social gatherings to large scale international conferences. According to the Bureau of Labor Statistics, the category of meeting, convention, and event planners includes professionals working across virtually every industry sector in the United States.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventJobTypes.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Career Pathway and Salary */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Event Organization Career Pathway and Salaries</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics, the median annual wage for meeting, convention, and event planners was approximately $56,920. Salaries increase significantly with experience, specialization, and industry. The following pathway illustrates typical career progression and earnings in event organization.
            </p>
            <div className="space-y-4">
              {careerPathway.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <span className="inline-flex items-center justify-center w-9 h-9 bg-green-100 text-green-700 font-bold rounded-full text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                      <p className="font-semibold text-gray-900">{item.role}</p>
                      <p className="text-lg font-bold text-green-600">{item.salary}</p>
                    </div>
                    <p className="text-gray-500 text-xs mb-1">{item.experience} of experience</p>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Meeting, Convention, and Event Planners
            </p>
          </div>
        </section>

        {/* Industry Certifications */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Certifications for Event Organizers</h2>
              <p className="text-gray-700 mb-6">
                While not legally required, professional certifications can significantly boost your credibility and earning potential in the event organization field. According to the Events Industry Council, certified professionals report higher salaries and faster career advancement compared to their non certified peers.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                    <p className="text-blue-600 text-xs font-medium mb-2">Issued by: {cert.issuer}</p>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Key Skills */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Essential Skills Employers Look For</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Event organization requires a unique combination of creative vision and operational precision. According to the National Association for Catering and Events (NACE), the following competencies are consistently ranked among the most sought after skills by employers hiring event professionals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keySkills.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.skill}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top Hiring Industries */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Industries Hiring Event Organizers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Event organization professionals are in demand across nearly every sector of the economy. According to the Bureau of Labor Statistics, the industries employing the most meeting, convention, and event planners include religious, civic, and professional organizations, followed by accommodation, government, and corporate sectors.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topHiringIndustries.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  <p className="font-semibold text-gray-900">{item.industry}</p>
                </div>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* A Day in the Life */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">A Day in the Life of an Event Organizer</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            No two days are exactly the same in event organization, but here is a typical schedule that illustrates the variety of tasks an event planner handles on a regular working day.
          </p>
          <div className="space-y-3">
            {dayInTheLife.map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <span className="inline-flex items-center justify-center px-3 py-1 bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-sm flex-shrink-0 min-w-[80px] text-center">
                  {item.time}
                </span>
                <p className="text-gray-700 text-sm">{item.task}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Market Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Event Organization Job Market Outlook</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics, the outlook for event organization professionals is positive. The post pandemic recovery has accelerated demand for in person and hybrid events, and businesses are investing more than ever in professionally managed gatherings to strengthen client relationships, brand awareness, and employee engagement.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">+8%</p>
                <p className="text-sm text-gray-600">Projected job growth from 2022 to 2032, faster than the national average for all occupations</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">17,400</p>
                <p className="text-sm text-gray-600">Estimated annual job openings due to growth and the need to replace workers who change careers or retire</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">$936B</p>
                <p className="text-sm text-gray-600">Total economic output of the U.S. events industry, according to the Events Industry Council</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Sources: U.S. Bureau of Labor Statistics and the Events Industry Council Economic Significance Study
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Event Organization Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute professional or legal advice. Salary figures, job growth projections, and certification requirements are based on publicly available data and may vary by location, employer, and individual circumstances. Always consult the U.S. Bureau of Labor Statistics at bls.gov and the relevant professional associations for the most current information. Job seekers should verify all position requirements directly with the hiring organization before applying.
          </p>
        </section>
      </div>
    </>
  )
}