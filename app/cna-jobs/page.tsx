import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import {
  Briefcase,
  DollarSign,
  MapPin,
  CheckCircle,
  Heart,
  ShieldCheck,
  BookOpen,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'CNA Jobs | Certified Nursing Assistant Openings Near You',
  description: 'Certified Nursing Assistant openings in hospitals, nursing homes, and home health across all 50 states. Shift type and pay listed by location.',
  keywords: 'cna jobs, certified nursing assistant jobs, cna jobs near me, cna hiring now, cna positions, nursing assistant jobs, cna jobs hospital, cna jobs nursing home',
  openGraph: {
    title: 'CNA Jobs | Certified Nursing Assistant Openings',
    description: 'Certified Nursing Assistants are needed across the country. Search CNA positions by state, salary, and facility type.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CNA Jobs | Certified Nursing Assistant Positions Open Now',
    description: 'Find CNA jobs hiring today. Full-time, part-time, and per diem shifts in every state.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/cna-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'CNA Jobs',
  description: 'Find Certified Nursing Assistant jobs hiring now across the United States. Browse CNA positions in hospitals, nursing homes, and home health agencies.',
  url: 'https://www.oh-my-job.com/cna-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available CNA Jobs',
    description: 'Current Certified Nursing Assistant job listings across the United States',
  },
}

const workSettings = [
  {
    title: 'Hospitals',
    description: 'Hospital CNAs rotate between units that move fast and demand quick thinking. You might start a Monday in post-op recovery and finish the week floating to the ER. The learning curve is steep, but so is the experience you walk away with.',
    icon: Heart,
  },
  {
    title: 'Nursing Homes',
    description: 'Long-term care is where most CNAs build their foundation. The pace is steadier than a hospital, but the emotional weight is real. You get to know residents by name, by habit, by the way they take their coffee. That continuity is what keeps many CNAs in this setting for years.',
    icon: ShieldCheck,
  },
  {
    title: 'Home Health Agencies',
    description: 'Home health flips the dynamic. Instead of patients coming to you, you go to them. One patient per visit, no overhead pages, no shared rooms. The trade-off is independence balanced with isolation. If you thrive working autonomously, this setting fits.',
    icon: MapPin,
  },
  {
    title: 'Assisted Living',
    description: 'Assisted living sits between full independence and skilled nursing. Residents here need support with meals, medication reminders, and mobility, but most are cognitively present and socially active. The work feels less clinical and more relational.',
    icon: Briefcase,
  },
  {
    title: 'Rehabilitation Centers',
    description: 'Short-term rehab means short-term patients. Most are recovering from hip replacements, strokes, or cardiac events and will discharge within weeks. The energy is goal-oriented: every shift, you can measure progress in real time.',
    icon: TrendingUp,
  },
  {
    title: 'Hospice Care',
    description: 'Hospice CNAs provide care when cure is no longer the goal. The work is quiet, deliberate, and emotionally demanding. It is also, for many who do it, the most meaningful work they have ever done. Comfort replaces recovery as the metric that matters.',
    icon: Heart,
  },
]

const certificationSteps = [
  {
    step: '1',
    title: 'Enroll in a State-Approved Program',
    description: 'Every state sets its own training hour minimums, ranging from 75 hours (the federal floor) to over 175 in states like California and Maine. Programs run at community colleges, Red Cross chapters, and inside healthcare facilities themselves. Many nursing homes will train you for free if you commit to working there after certification.',
  },
  {
    step: '2',
    title: 'Pass the Two-Part Competency Exam',
    description: 'The exam has a written portion (or oral, depending on the state) and a hands-on skills test where a proctor watches you perform tasks like taking blood pressure, repositioning a patient, and performing hand hygiene. Most states use the NNAAP format. First-attempt pass rates typically sit around 85 to 90 percent for candidates who completed accredited programs.',
  },
  {
    step: '3',
    title: 'Get Added to Your State Registry',
    description: 'Once you pass, your name goes on your state Nurse Aide Registry. This is not optional. Any facility that accepts Medicare or Medicaid funding is legally required to verify your registry status before they can put you on the floor. The listing confirms your certification is active, your exam results, and whether any disciplinary findings exist.',
  },
  {
    step: '4',
    title: 'Renew Every Two Years',
    description: 'Certification lapses if you do not renew on time. Most states require proof that you worked at least eight paid hours as a CNA during the renewal window. Some states also require continuing education credits. If your certification does lapse, many states let you reinstate by retaking the skills exam rather than repeating the full training program.',
  },
]

const salaryByState = [
  { state: 'California', salary: '$42,000' },
  { state: 'New York', salary: '$39,000' },
  { state: 'Washington', salary: '$41,000' },
  { state: 'Massachusetts', salary: '$40,000' },
  { state: 'Texas', salary: '$31,000' },
  { state: 'Florida', salary: '$30,000' },
]

const faqs = [
  {
    question: 'How long does it take to become a CNA?',
    answer: 'The classroom and clinical portion takes between four and twelve weeks depending on your state and whether you attend full-time or part-time. After that, you need to schedule and pass the competency exam, which can add another one to three weeks depending on testing availability in your area. From enrollment to first paycheck, most people are working as a certified CNA within two to three months.',
  },
  {
    question: 'What does a typical CNA shift actually look like?',
    answer: 'You clock in, get your patient assignment, and hit the floor. The first round is usually vital signs and morning care: helping patients wash, dress, eat, and get positioned for the day. Between rounds, you are answering call lights, documenting intake and output, turning patients on schedule, and reporting anything unusual to the nurse on duty. The work is physical, repetitive, and unpredictable in equal measure. No two shifts are identical even when the routine is the same.',
  },
  {
    question: 'How much can I realistically expect to earn as a new CNA?',
    answer: 'Entry-level CNA pay clusters between $15 and $20 per hour in most of the country, with the coasts and major metros pushing above that. The federal median is roughly $38,200 annually. Night shift and weekend differentials are common and can add $2 to $5 per hour. Per diem and agency CNAs often earn 20 to 40 percent more per hour than their staff counterparts, though without benefits.',
  },
  {
    question: 'Can I transfer my CNA certification to another state?',
    answer: 'Most states allow it through a reciprocity process. You apply to the new state registry, provide proof of your current certification and good standing, and in many cases you can start working before the transfer is finalized. The main disqualifier is any substantiated finding on your record. A few states require additional steps like a background check or a short bridge course, but full retesting is rare.',
  },
  {
    question: 'Is it realistic to work as a CNA while in nursing school?',
    answer: 'It is one of the most common paths into nursing. Many LPN and RN programs are designed around the assumption that their students are working, which is why evening and weekend class schedules exist. Several hospital systems run tuition reimbursement programs specifically for CNAs pursuing nursing degrees. The clinical experience you gain as a CNA also gives you a meaningful edge over classmates who enter nursing school without patient care hours.',
  },
  {
    question: 'Are CNA jobs going to stay in demand?',
    answer: 'The short answer is yes. Federal projections put job growth for nursing assistants at roughly 4 percent through the early 2030s, but that number understates the actual hiring volume because it does not account for turnover. CNA turnover rates in long-term care run between 50 and 80 percent annually, which means facilities are perpetually recruiting even when overall employment levels are flat. An aging population adds structural demand on top of that churn.',
  },
]

const tips = [
  {
    title: 'Get Your BLS Card Before You Apply',
    description: 'Almost every employer requires current Basic Life Support certification on day one. Having it ready when you submit your application eliminates a delay that knocks other candidates out of the running. The American Heart Association BLS course takes one day and costs around $60.',
  },
  {
    title: 'Write a Resume That Sounds Like a Person, Not a Template',
    description: 'Hiring managers at care facilities read dozens of identical resumes every week. If yours opens with "compassionate and dedicated CNA seeking a rewarding opportunity," it is going straight to the bottom. Lead with something specific: a patient interaction, a skill you developed during clinicals, or the reason you chose this work in the first place.',
  },
  {
    title: 'Try Agency Work to Find the Right Fit',
    description: 'Staffing agencies let you work shifts at multiple facilities before committing to one. The hourly rate is usually higher than staff positions, and you get exposure to different care settings, management styles, and patient populations. Many CNAs use agency work as a paid audition before accepting a permanent role.',
  },
  {
    title: 'Ask About Free Training Programs',
    description: 'If you are not yet certified, do not pay for training out of pocket without checking alternatives first. Many nursing homes and hospital systems run employer-sponsored CNA programs that cover tuition, textbooks, and exam fees in exchange for a six-to-twelve-month work commitment after certification. The programs are competitive but widely available.',
  },
]

export default async function CnaJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'certified nursing assistant', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'certified nursing assistant', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            CNA Jobs Open Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="certified nursing assistant" />
          </aside>
          <div className="flex-1">

            

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'certified nursing assistant'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* Work Settings */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where CNAs Work Across the United States</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Healthcare runs on CNAs. They are the most hands-on role in every care setting, and the environment they work in shapes their daily experience more than almost any other variable in the job. The same certification opens doors to radically different workdays depending on where you choose to use it.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workSettings.map((setting, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <setting.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{setting.title}</h3>
                <p className="text-gray-600 text-sm">{setting.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certification Pathway */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Become a Certified Nursing Assistant</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Becoming a CNA is one of the fastest ways to enter the healthcare workforce with a recognized credential. The process is regulated at the state level but follows a consistent pattern across the country. Most people complete the full pathway, from enrollment to registry listing, in under three months.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {certificationSteps.map((item, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Do CNAs Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              CNA pay varies more by geography and facility type than by experience level. A CNA working nights in a Bay Area hospital can out-earn a five-year veteran doing day shifts in rural Florida by $15,000 or more. The national median sits around $38,200 per year based on the most recent federal wage data, but that number hides enormous variation. Government-run facilities and metropolitan hospitals consistently pay at the top of the range, while smaller assisted living communities and rural nursing homes tend to fall below the median. Night and weekend differentials can add $2 to $5 per hour on top of base pay.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$38,200</p>
                <p className="text-sm text-gray-600">National Median Annual Wage</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$18.37</p>
                <p className="text-sm text-gray-600">Median Hourly Rate</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$49,000+</p>
                <p className="text-sm text-gray-600">Top 10% of Earners</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Average CNA Salary by State</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByState.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.state}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Wage data reflects the most recent figures published by the Bureau of Labor Statistics. State-level estimates are rounded approximations and will vary by employer, shift differential, and years of experience.
            </p>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">CNA as a Stepping Stone in Nursing</h2>
                <p className="text-gray-700 mb-4">
                  CNA is the most common starting point for people who eventually become licensed nurses. The clinical hours you accumulate on the job count as real-world patient care experience, which nursing school admissions committees weigh heavily. Many hospital systems and long-term care employers offer tuition assistance specifically for CNAs enrolled in LPN or RN programs, and some will adjust your work schedule around your class hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  {['CNA', 'LPN / LVN', 'RN (ADN or BSN)', 'RN Specialist / NP'].map((level, index, arr) => (
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

        {/* Work Hours & Shifts */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">CNA Shift Types and Scheduling</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            One reason CNA work fits such a wide range of lifestyles is the scheduling variety. Day, evening, night, and per diem shifts exist at nearly every facility type, and many employers let you lock in a consistent schedule rather than rotating. The shift you work affects your pay, your workload, and the kind of care you provide.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { shift: 'Day Shift', time: '7:00 AM to 3:00 PM', note: 'Most common in nursing homes and rehab centers' },
              { shift: 'Evening Shift', time: '3:00 PM to 11:00 PM', note: 'Often includes a shift differential premium' },
              { shift: 'Night Shift', time: '11:00 PM to 7:00 AM', note: 'Higher differential pay; quieter environment' },
              { shift: 'Per Diem', time: 'Flexible / as needed', note: 'Higher hourly rate; choose your own schedule' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.shift}</p>
                <p className="text-blue-600 text-sm font-medium mb-2">{item.time}</p>
                <p className="text-gray-500 text-xs">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Registry Warning */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding the Nurse Aide Registry</h2>
                <p className="text-gray-700 mb-4">
                  Your Nurse Aide Registry listing is your professional record. Every facility that participates in Medicare or Medicaid must verify it before bringing you on board. Keeping your registry status current and clean is not a bureaucratic formality. It is the single document that determines whether you can work.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">What the Registry Tracks</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Active certification status and expiration date',
                        'Training program completed and test results',
                        'Substantiated findings of abuse or neglect',
                        'Employment history within certified facilities',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">How to Maintain Good Standing</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Renew your certification before it expires (every 2 years in most states)',
                        'Work at least 8 hours as a paid CNA during each renewal period',
                        'Complete any required continuing education for your state',
                        'Notify your state registry if your name or address changes',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a CNA Job Quickly</h2>
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
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About CNA Jobs</h2>
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
            <strong>Disclaimer:</strong> The information on this page is for general reference only and does not constitute legal, medical, or career advice. Certification requirements, wage ranges, and scope of practice rules differ by state and employer. Consult your state Nurse Aide Registry and the Bureau of Labor Statistics for the most current data applicable to your situation.
          </p>
        </section>
      </div>
    </>
  )
}