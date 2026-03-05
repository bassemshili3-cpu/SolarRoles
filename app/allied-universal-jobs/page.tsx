import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'

import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ShieldCheck, Users } from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'




    
      


export const metadata: Metadata = {
  title: 'Allied Universal Jobs Hiring Now | Security Positions Open Across the US',
  description: 'Allied Universal is actively hiring security professionals across the United States right now. Full-time, part-time, and armed officer positions available with benefits and paid training. Browse open roles and apply today before positions in your area are filled.',
  keywords: 'allied universal jobs, allied universal hiring, allied universal security jobs, allied universal careers, security officer jobs allied universal, allied universal job openings',
  openGraph: {
    title: 'Allied Universal Jobs Hiring Immediately | Security Positions Needed Now',
    description: 'Hundreds of Allied Universal security jobs are open across the US. Competitive pay, weekly pay options, and career advancement. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allied Universal Jobs | Security Officer Positions Hiring Now',
    description: 'Find Allied Universal jobs hiring immediately near you. Armed, unarmed, and supervisory security roles available in all 50 states.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/allied-universal-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Allied Universal Jobs',
  description: 'Find Allied Universal security jobs hiring now across the United States. Browse open positions in unarmed security, armed officer, supervisory, and corporate roles.',
  url: 'https://www.oh-my-job.com/allied-universal-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Allied Universal Jobs',
    description: 'Current Allied Universal job listings across the United States',
  },
}

const jobCategories = [
  {
    title: 'Unarmed Security Officer',
    description: 'The most common entry-level role at Allied Universal. Officers patrol assigned areas, monitor access points, and respond to incidents at commercial, residential, and government facilities.',
    icon: Shield,
  },
  {
    title: 'Armed Security Officer',
    description: 'Armed officers provide a higher level of protection at financial institutions, government buildings, and high-value asset locations. A valid firearms license is required and varies by state.',
    icon: ShieldCheck,
  },
  {
    title: 'Security Site Supervisor',
    description: 'Supervisors oversee a team of security officers at a single site, manage scheduling, conduct post orders briefings, and serve as the primary point of contact for the client.',
    icon: Users,
  },
  {
    title: 'Account Manager',
    description: 'Account managers are responsible for client relationships across multiple sites, ensuring service quality, contract compliance, and officer performance meet Allied Universal standards.',
    icon: Briefcase,
  },
  {
    title: 'Flex Officer',
    description: 'Flex officers fill in across multiple client sites as needed, offering maximum scheduling flexibility and the opportunity to quickly build experience across diverse environments.',
    icon: MapPin,
  },
  {
    title: 'Corporate and Administrative Roles',
    description: 'Allied Universal employs professionals in HR, finance, operations, IT, and legal functions at its regional offices and national headquarters to support field operations.',
    icon: TrendingUp,
  },
]

const hiringSteps = [
  {
    step: '1',
    title: 'Submit Your Online Application',
    description: 'Applications are submitted through the Allied Universal careers portal. The process typically requires a resume, contact information, and work authorization status. Most positions do not require prior security experience for entry-level roles.',
  },
  {
    step: '2',
    title: 'Pass a Background Check',
    description: 'According to the U.S. Department of Justice and applicable state laws, private security companies are required to conduct criminal background checks on all applicants. Certain convictions may disqualify candidates depending on state licensing requirements.',
  },
  {
    step: '3',
    title: 'Obtain Your State Security License',
    description: 'Most states require security officers to hold a valid state-issued security guard license or registration before beginning work. Allied Universal often assists new hires with the licensing process and may cover associated fees for qualified candidates.',
  },
  {
    step: '4',
    title: 'Complete Site-Specific Training',
    description: 'New officers complete both company-wide orientation and site-specific post orders training before their first assignment. Allied Universal provides this training, which covers emergency response, access control procedures, incident reporting, and customer service.',
  },
]

const salaryByRole = [
  { role: 'Unarmed Security Officer', salary: '$32,000 to $40,000' },
  { role: 'Armed Security Officer', salary: '$38,000 to $52,000' },
  { role: 'Site Supervisor', salary: '$42,000 to $58,000' },
  { role: 'Account Manager', salary: '$55,000 to $75,000' },
  { role: 'Flex Officer', salary: '$34,000 to $44,000' },
  { role: 'Corporate Roles', salary: '$50,000 to $90,000+' },
]

const faqs = [
  {
    question: 'What is Allied Universal and how large is it as an employer?',
    answer: 'Allied Universal is one of the largest private security companies in the world and the largest in North America. The company employs over 800,000 people across the United States, Canada, and internationally, making it one of the top five largest private employers in the United States. Allied Universal provides security services to clients across commercial real estate, healthcare, education, government, and financial sectors.',
  },
  {
    question: 'Do I need a security license to apply for Allied Universal jobs?',
    answer: 'Most states require security officers to hold a valid state-issued security guard license or registration card before they can work in a private security capacity. Requirements vary significantly by state. According to the Bureau of Security and Investigative Services and equivalent state agencies, applicants must typically be at least 18 years old, pass a background check, and complete a state-approved training course. Allied Universal provides guidance on obtaining the required license and may sponsor licensing costs for qualified new hires.',
  },
  {
    question: 'Does Allied Universal offer benefits to security officers?',
    answer: 'Allied Universal offers a benefits package that includes medical, dental, and vision insurance for eligible employees, as well as a 401(k) retirement plan with company match, paid time off, and employee assistance programs. The company also offers weekly pay options and DailyPay access for qualifying employees, which allows workers to access earned wages before their scheduled payday.',
  },
  {
    question: 'What are the physical requirements for Allied Universal security officer positions?',
    answer: 'Security officer roles generally require the ability to stand and walk for extended periods, sometimes for an entire shift. Officers may be required to respond quickly to emergencies, which can involve running, climbing stairs, or restraining individuals in limited circumstances. Armed officer positions typically require the ability to qualify with a firearm on a periodic basis as defined by state licensing requirements and client contracts.',
  },
  {
    question: 'Can Allied Universal security officers advance into management roles?',
    answer: 'Yes. Allied Universal has a defined internal advancement structure. Many account managers, operations directors, and regional vice presidents began as field security officers. The company offers a Sector Presidency Program and other internal development initiatives that support promotion from within. According to Allied Universal corporate communications, a significant portion of its management team was promoted internally.',
  },
  {
    question: 'How does state licensing affect armed officer eligibility at Allied Universal?',
    answer: 'Armed security officer licensing is governed at the state level. According to the Law Enforcement Officers Safety Act (LEOSA) and applicable state statutes, candidates for armed roles must meet their state carry permit or security firearms permit requirements in addition to Allied Universal internal qualification standards. Some states such as California, Texas, and Florida have specific armed guard licensing pathways that applicants must complete before carrying on a client site.',
  },
]

const tips = [
  {
    title: 'Obtain Your State Guard Card Before Applying',
    description: 'Having your state security license already in hand when you apply significantly shortens your time to hire. Most state licensing processes take two to four weeks and involve a background check, fingerprinting, and a training course. Starting this process early gives you a competitive advantage over applicants who have not yet begun.',
  },
  {
    title: 'Highlight Customer Service Experience',
    description: 'Allied Universal emphasizes that security officers are often the first point of contact for visitors, tenants, and employees at client sites. Candidates who demonstrate strong interpersonal and communication skills in their application and interviews are consistently prioritized over those with security experience alone.',
  },
  {
    title: 'Be Open to Multiple Site Types',
    description: 'Indicating availability across multiple client verticals, including corporate, healthcare, retail, and government, significantly increases the number of positions you will be considered for and can accelerate your placement. Specialists who restrict themselves to a single industry are placed more slowly.',
  },
  {
    title: 'Ask About the DailyPay and Flex Pay Options',
    description: 'During your onboarding, ask specifically about the DailyPay program and weekly pay cycle options. These financial flexibility features are among the most valued benefits cited by Allied Universal field employees and can make a meaningful difference in your day-to-day financial planning.',
  },
]

const stateRequirements = [
  { state: 'California', note: 'BSIS Guard Card required; 8-hour training before assignment, 16 hours on-the-job training within first 30 days' },
  { state: 'Texas', note: 'Level II or Level III (armed) license from the Texas DPS required before starting work' },
  { state: 'Florida', note: 'Class D (unarmed) or Class G (armed) license from the Florida Department of Agriculture required' },
  { state: 'New York', note: 'Security Guard Registration through the DCJS required; 8-hour pre-assignment and 16-hour on-the-job training mandated' },
  { state: 'Illinois', note: 'PERC card from the Illinois Department of Financial and Professional Regulation required' },
  { state: 'Washington', note: 'Security Guard license from the Washington Department of Licensing required prior to employment' },
]

export default async function AlliedUniversalJobsPage({ searchParams }: any) {
  const params = await searchParams
  

 const { count } = await getCachedJobCount(
  params.what || 'Allied Universal',
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
            Allied Universal Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="allied universal" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}

             {/* Client wrapper isolé — pas de use client sur la page */}
                        <AIJobMatcherWrapper />
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'allied universal'}
                where={params.where || ''}
                salary_min={params.salary_min}
              />
            </Suspense>

            
          </div>
          
        </div>

        {/* Job Categories */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Roles Available at Allied Universal</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            As one of the largest private employers in the United States with over 800,000 employees, Allied Universal hires across a wide range of security and professional functions. Whether you are looking for your first security job or a management career in the industry, there is a role suited to your background.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((cat, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <cat.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{cat.title}</h3>
                <p className="text-gray-600 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Get Hired */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Get Hired at Allied Universal</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Allied Universal has one of the most active hiring pipelines in the private security industry. The process from application to first shift typically takes one to three weeks, depending on your state licensing status and background check processing time.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {hiringSteps.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm mb-4">
                  {item.step}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Allied Universal Employees Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for security guards and gaming surveillance officers was $36,520 in May 2023. Allied Universal pay rates vary by role, location, client contract, and whether the position is armed or unarmed. The company frequently pays above the BLS median in major metropolitan areas due to competitive market conditions.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$36,520</p>
                <p className="text-sm text-gray-600">BLS Median for Security Guards (2023)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$17.56</p>
                <p className="text-sm text-gray-600">Median Hourly Rate Nationally</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$58,000+</p>
                <p className="text-sm text-gray-600">Armed and Supervisory Roles</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Estimated Pay Range by Role at Allied Universal</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByRole.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.role}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023. Allied Universal pay ranges are estimates based on publicly reported compensation data and vary by location, contract, and experience.
            </p>
          </div>
        </section>
       

        {/* State Licensing Requirements */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">State Security Guard Licensing Requirements</h2>
                <p className="text-gray-700 mb-6">
                  Security guard licensing in the United States is regulated at the state level. According to the U.S. Department of Labor and individual state regulatory agencies, most states require private security officers to obtain a state-issued license or registration card before beginning paid employment. The requirements and timelines vary significantly from state to state.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {stateRequirements.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-1">{item.state}</p>
                      <p className="text-gray-600 text-sm">{item.note}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Requirements listed are summaries only. Always verify current requirements directly with your state licensing authority before applying.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Growth at Allied Universal</h2>
                <p className="text-gray-700 mb-4">
                  Allied Universal promotes a promote-from-within culture across its U.S. operations. The company's scale means that advancement opportunities are consistently available at every level, from field officer to regional director. Many of its senior operations leaders began as security officers on a single client site.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 flex-wrap">
                  {['Security Officer', 'Lead Officer', 'Site Supervisor', 'Account Manager', 'Operations Manager', 'Regional Director'].map((level, index, arr) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="bg-white border border-blue-200 rounded-lg px-4 py-2 text-sm font-semibold text-blue-700">
                        {level}
                      </div>
                      {index < arr.length - 1 && (
                        <span className="text-blue-400 font-bold hidden sm:block">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shift Types */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Allied Universal Shift Types and Scheduling</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Allied Universal operates client sites on a 24 hour, 7 day a week basis, which means security officer positions are available across all shift types. The scheduling flexibility is one of the most frequently cited benefits of working at the company.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { shift: 'Day Shift', time: '6:00 AM to 2:00 PM', note: 'Most common at corporate campuses and retail sites' },
              { shift: 'Afternoon Shift', time: '2:00 PM to 10:00 PM', note: 'Shift differential pay applies at many client locations' },
              { shift: 'Night Shift', time: '10:00 PM to 6:00 AM', note: 'Higher differential pay; common in industrial and logistics sites' },
              { shift: 'Flex and Per Diem', time: 'Variable by site need', note: 'Higher base pay; deployed across multiple client sites' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.shift}</p>
                <p className="text-blue-600 text-sm font-medium mb-2">{item.time}</p>
                <p className="text-gray-500 text-xs">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Getting Hired at Allied Universal Quickly</h2>
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

        {/* FAQ */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Allied Universal Jobs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
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

        {/* Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The salary figures, employment information, and licensing requirements provided on this page are for general informational purposes only and do not constitute legal or career advice. Allied Universal is an independent company and this page is not affiliated with or endorsed by Allied Universal Security Services. Security guard licensing requirements vary by state. Always consult your state security licensing authority, the U.S. Bureau of Labor Statistics at bls.gov, and the U.S. Department of Labor at dol.gov for the most current and applicable information. Job availability and compensation are subject to change.
          </p>
        </section>
      </div>
    </>
  )
}