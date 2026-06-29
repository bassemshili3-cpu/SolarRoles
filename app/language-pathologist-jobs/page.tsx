import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, TrendingUp, Award, Stethoscope, GraduationCap, Building2 } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Speech-Language Pathologist Jobs | SLP Openings',
  description: 'Speech-language pathologist openings in schools, hospitals, and private practice. 15% projected job growth and a median salary above $95K.',
  keywords: 'language pathologist jobs, speech language pathologist jobs, SLP jobs, speech therapist jobs, CCC-SLP positions, language pathologist hiring, speech pathology careers',
  openGraph: {
    title: 'Speech-Language Pathologist Jobs | SLP Openings Nationwide',
    description: 'Thousands of language pathologist positions hiring now. Schools, hospitals, teletherapy. Competitive salaries and sign-on bonuses available.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SLP Jobs | Schools, Hospitals & Teletherapy Positions',
    description: 'High-demand SLP positions with competitive pay, flexible settings, and career growth. Browse and apply now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/language-pathologist-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Language Pathologist Jobs',
  description: 'Find language pathologist jobs hiring across the United States. Browse SLP positions in schools, hospitals, clinics, and teletherapy.',
  url: 'https://www.oh-my-job.com/language-pathologist-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Language Pathologist Positions',
    description: 'Current job listings for speech-language pathologists across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What qualifications do you need to work as a language pathologist?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A master\'s degree in speech-language pathology is the standard entry-level requirement. After completing the degree, candidates must pass the Praxis exam in speech-language pathology, obtain state licensure, and typically complete a clinical fellowship year of supervised practice before practicing independently.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do language pathologists earn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The median annual salary for speech-language pathologists was $95,410 as of May 2024, according to the Bureau of Labor Statistics. Pay varies significantly by state, setting, and experience level, with the top 25% earning over $107,000 annually.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the job market strong for language pathologists?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The BLS projects 15% employment growth from 2024 to 2034, well above the national average for all occupations. An aging population, expanded early intervention services, and growing awareness of communication disorders all contribute to sustained demand.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can language pathologists work remotely through teletherapy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Teletherapy has become a permanent service delivery model in the field. The Audiology and Speech-Language Pathology Interstate Compact allows licensed SLPs to practice across member states, expanding remote opportunities significantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a language pathologist in a school and one in a hospital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'School-based SLPs focus on communication skills that affect academic performance, working primarily with children under IEP or 504 plans. Medical SLPs treat a broader age range and address conditions such as swallowing disorders, voice pathology, cognitive-communication deficits from stroke or brain injury, and fluency disorders.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const settingComparison = [
  {
    setting: 'Public School District',
    caseload: '40 to 80+ students (varies by state)',
    schedule: 'School calendar with summers off',
    typicalPay: '$60,000 to $90,000',
    bestFor: 'SLPs who prefer working with children, want predictable hours, and value extended breaks. Pension and benefits packages in public schools are often stronger than private sector equivalents.',
    tradeOff: 'Caseloads can be very large. Paperwork for IEPs and compliance documentation consumes a significant portion of the workweek in most districts.',
  },
  {
    setting: 'Hospital / Acute Care',
    caseload: '6 to 10 patients per day',
    schedule: 'Year-round, may include weekends',
    typicalPay: '$75,000 to $105,000',
    bestFor: 'Clinicians who want medical complexity and variety. Stroke, TBI, head and neck cancer, and post-surgical swallowing cases provide a steep and rewarding learning curve.',
    tradeOff: 'Higher emotional intensity. Patient outcomes can be unpredictable, and the pace of discharge planning means treatment windows are short.',
  },
  {
    setting: 'Skilled Nursing / Rehab Facility',
    caseload: '8 to 12 patients per day',
    schedule: 'Year-round, primarily weekdays',
    typicalPay: '$70,000 to $95,000',
    bestFor: 'SLPs interested in geriatric populations, dysphagia management, and cognitive rehabilitation. These settings allow for longer-term therapeutic relationships than acute care.',
    tradeOff: 'Productivity expectations can be rigid. Some facilities tie compensation to billable minutes, which creates pressure to maintain a full schedule regardless of patient needs.',
  },
  {
    setting: 'Private Practice / Outpatient Clinic',
    caseload: 'Variable, often 5 to 8 clients per day',
    schedule: 'Flexible, set by practitioner',
    typicalPay: '$65,000 to $120,000+',
    bestFor: 'SLPs who want autonomy over their caseload, treatment approach, and schedule. Private practice allows specialization in niche areas like fluency, voice, or AAC.',
    tradeOff: 'Income depends on client volume. Business management responsibilities (billing, marketing, insurance credentialing) add overhead that salaried positions do not require.',
  },
  {
    setting: 'Teletherapy',
    caseload: 'Varies by contract, typically 5 to 8 sessions per day',
    schedule: 'Highly flexible, often remote',
    typicalPay: '$55,000 to $95,000',
    bestFor: 'SLPs who prioritize location independence and schedule control. The ASLP Interstate Compact is expanding multi-state practice options, making teletherapy increasingly viable as a primary career path.',
    tradeOff: 'Screen fatigue is real. Building therapeutic rapport virtually requires deliberate technique, and hands-on interventions (oral motor work, instrumental swallow assessments) are not possible remotely.',
  },
]

const credentialTimeline = [
  { phase: 'Undergraduate Foundation', duration: '4 years', description: 'A bachelor\'s degree in communication sciences and disorders (CSD) is the most direct path, though it is not required. Students from unrelated fields can enter graduate programs by completing prerequisite coursework, which typically adds 1 to 2 semesters.', icon: BookOpen },
  { phase: 'Master\'s Degree in SLP', duration: '2 to 3 years', description: 'The master\'s program includes coursework in anatomy, neurology, phonetics, language development, and clinical methods, along with 400+ hours of supervised clinical practicum across multiple settings and populations.', icon: GraduationCap },
  { phase: 'Clinical Fellowship Year (CFY)', duration: '36 weeks minimum', description: 'A period of mentored professional practice after graduation. The fellow carries a full caseload under the guidance of a CCC-SLP mentor who evaluates clinical competency across defined skill areas.', icon: Users },
  { phase: 'CCC-SLP Certification and State Licensure', duration: 'Concurrent with or following CFY', description: 'Passing the Praxis exam and completing the CFY qualifies you for the Certificate of Clinical Competence from ASHA. State licensure is a separate process with requirements that vary by jurisdiction but typically mirrors the ASHA pathway.', icon: Award },
]

const salaryByState = [
  { tier: 'Highest Paying States', states: 'California, New Jersey, Connecticut, New York, Massachusetts, District of Columbia', range: '$90,000 to $120,000+', context: 'Strong union representation in school districts and high cost of living drive these figures. Medical settings in metro areas within these states often exceed $110,000 for experienced SLPs.' },
  { tier: 'Above Average', states: 'Washington, Colorado, Oregon, Maryland, Virginia, Illinois', range: '$80,000 to $100,000', context: 'Growing healthcare infrastructure and competitive school district salaries. Several states in this tier are members of the ASLP Interstate Compact, enabling cross-border teletherapy practice.' },
  { tier: 'National Average Range', states: 'Texas, Florida, Ohio, Michigan, Pennsylvania, North Carolina, Arizona', range: '$70,000 to $90,000', context: 'High volume of open positions due to large populations. Lower cost of living means purchasing power often matches or exceeds higher-paying coastal states.' },
  { tier: 'Below Average (by nominal pay)', states: 'Mississippi, Arkansas, West Virginia, South Dakota, Montana', range: '$60,000 to $75,000', context: 'Significant shortages create leverage for negotiation. Loan repayment programs, sign-on bonuses, and relocation stipends are more common in these states specifically because they struggle to attract candidates.' },
]

const specializations = [
  {
    area: 'Pediatric Language Disorders',
    description: 'Assessment and intervention for children with delayed or disordered language development, including those with autism spectrum disorder, specific language impairment, and developmental delays. This is the largest employment category for SLPs working in school and early intervention settings.',
    demandLevel: 'Very High',
  },
  {
    area: 'Dysphagia (Swallowing Disorders)',
    description: 'Evaluation and treatment of swallowing difficulties across the lifespan. Requires competency in instrumental assessment tools such as videofluoroscopic swallow studies (VFSS) and fiberoptic endoscopic evaluation of swallowing (FEES). Medical settings rely heavily on SLPs with this expertise.',
    demandLevel: 'Very High',
  },
  {
    area: 'Fluency (Stuttering)',
    description: 'Working with individuals who stutter or have cluttering disorders. Despite the prevalence of fluency disorders, relatively few SLPs pursue deep specialization in this area, creating strong demand for those who do.',
    demandLevel: 'High',
  },
  {
    area: 'Voice and Resonance',
    description: 'Treatment of voice disorders caused by vocal nodules, paralysis, neurological conditions, or gender-affirming voice modification. Caseloads often overlap with ENT practices and performing arts communities.',
    demandLevel: 'Moderate to High',
  },
  {
    area: 'Augmentative and Alternative Communication (AAC)',
    description: 'Designing and implementing communication systems for individuals who cannot rely on natural speech. Involves high-tech devices, low-tech boards, and everything in between. Requires both clinical and technical proficiency.',
    demandLevel: 'High',
  },
  {
    area: 'Cognitive-Communication Rehabilitation',
    description: 'Addressing communication and cognitive deficits resulting from stroke, traumatic brain injury, or progressive neurological diseases. This specialization sits at the intersection of speech pathology and neuropsychology.',
    demandLevel: 'High',
  },
]

const caseloadRedFlags = [
  'Your assigned caseload exceeds the ASHA recommended maximum for your setting by more than 20%',
  'Documentation time is not built into your schedule, forcing you to complete IEPs and treatment notes outside of paid hours',
  'You are expected to provide services in areas outside your competence without training',
  'Productivity standards require 85%+ billable hours with no allowance for evaluation prep, meetings, or travel between sites',
  'The facility has not replaced departed SLPs and is distributing their caseloads among remaining staff without additional compensation',
  'Supervision for clinical fellows is informal, infrequent, or delegated to someone without CCC-SLP credentials',
  'You are told to prioritize billing targets over evidence-based treatment decisions',
  'Continuing education support is absent and professional development time is not included in your contract',
]

const negotiationLeveragePoints = [
  { item: 'Caseload Cap Guarantee', detail: 'Before signing a contract, ask whether there is a written caseload maximum. Verbal assurances that caseloads are "manageable" mean nothing when three SLPs resign mid-year and their students are redistributed. A cap in writing protects your practice quality and mental health.' },
  { item: 'Continuing Education Budget', detail: 'ASHA requires 30 continuing education hours per 3 year maintenance interval. Strong employers cover conference fees, online course subscriptions, and paid time to complete CEUs. This benefit is worth $1,000 to $3,000 per year and signals that the organization values professional growth.' },
  { item: 'Loan Repayment Programs', detail: 'Federal programs like the NHSC and state-specific loan forgiveness initiatives can eliminate $50,000 to $100,000 in student debt over 2 to 4 years of service in underserved areas. These are separate from employer-offered tuition assistance and can be stacked when both are available.' },
  { item: 'Supervision Stipend for Mentoring CFYs', detail: 'If you hold a CCC-SLP and are asked to mentor clinical fellows, negotiate compensation for that role. Supervision involves documentation, observation hours, and evaluation scoring that goes beyond your clinical caseload.' },
  { item: 'Multi-Site Travel Reimbursement', detail: 'School-based SLPs who serve multiple buildings should confirm mileage reimbursement rates, travel time compensation, and whether the commute between sites counts toward paid hours. These costs accumulate quickly and are often negotiable.' },
  { item: 'Teletherapy Flexibility Clause', detail: 'If the position is on-site, ask whether the employer offers a hybrid option for documentation days or for treating homebound clients. Even one remote day per week reduces commuting costs and often increases productivity.' },
]

const faqs = [
  {
    question: 'What qualifications do you need to work as a language pathologist?',
    answer: 'The standard entry requirement is a master\'s degree in speech-language pathology from a CAA-accredited program. After graduation, you complete a clinical fellowship year (approximately 36 weeks of supervised practice), pass the Praxis exam in speech-language pathology, and obtain state licensure. Many employers also expect or require the CCC-SLP credential from ASHA, which is earned by completing all of the above steps.',
  },
  {
    question: 'How much do language pathologists actually earn in 2026?',
    answer: 'The Bureau of Labor Statistics reports a median annual wage of $95,410 as of May 2024. The middle 50% of earners fall between approximately $75,000 and $108,000 depending on setting, geography, and experience. Travel SLP contracts and positions in high cost of living states can push total compensation above $120,000. School-based positions in lower-paying states may start closer to $60,000 but often include pension benefits and summer breaks that add significant non-cash value.',
  },
  {
    question: 'Which work setting pays the most for language pathologists?',
    answer: 'Hospital and acute care settings tend to offer the highest base salaries, followed by skilled nursing facilities. Private practice income has the widest range because it depends on client volume and business overhead. School districts generally pay less in nominal terms but offer pension plans, health benefits, and a 10 month work schedule that effectively raises the hourly rate when calculated against actual days worked.',
  },
  {
    question: 'Can you become an SLP without a communication disorders bachelor\'s degree?',
    answer: 'Yes. Graduate programs in speech-language pathology accept students from a wide range of undergraduate backgrounds including psychology, linguistics, education, and biology. If your bachelor\'s program did not include prerequisite courses in anatomy, phonetics, and language development, expect to take a semester or two of leveling coursework before or during the first year of your master\'s program.',
  },
  {
    question: 'What is the ASLP Interstate Compact and how does it affect job options?',
    answer: 'The Audiology and Speech-Language Pathology Interstate Compact is an agreement among participating states that allows licensed SLPs to practice across state lines without obtaining a separate license in each state. This is particularly relevant for teletherapy providers and travel SLPs. The compact continues to add member states, expanding the geographic range of opportunities for SLPs who hold a compact privilege.',
  },
  {
    question: 'Is there really a shortage of speech-language pathologists?',
    answer: 'Yes, particularly in school districts, rural healthcare facilities, and early intervention programs. ASHA has documented persistent vacancies across settings, and many states include SLPs on their shortage occupation lists. The combination of growing demand (aging population, expanded screening mandates, broader diagnostic criteria) and limited graduate program capacity means the gap is projected to widen before it narrows.',
  },
]

export default async function LanguagePathologistJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'language pathologist', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'language pathologist', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : 'Thousands of'} Language Pathologist Jobs Available Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="language pathologist" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'language pathologist'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── WORK SETTINGS COMPARED ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Language Pathologists Actually Work: Five Settings Compared</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The same credential opens the door to radically different daily experiences depending on where you practice. Caseload size, patient population, earning potential, and lifestyle all shift based on the setting you choose. Here is what each one looks like from the inside.
          </p>
          <div className="space-y-4">
            {settingComparison.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{item.setting}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.bestFor}</p>
                    <p className="text-sm text-amber-700">{item.tradeOff}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm lg:min-w-[340px]">
                    <div className="min-w-[100px]">
                      <p className="text-gray-500">Caseload</p>
                      <p className="font-medium text-gray-800">{item.caseload}</p>
                    </div>
                    <div className="min-w-[100px]">
                      <p className="text-gray-500">Schedule</p>
                      <p className="font-medium text-gray-800">{item.schedule}</p>
                    </div>
                    <div className="min-w-[120px]">
                      <p className="text-gray-500">Pay Range</p>
                      <p className="font-medium text-green-700">{item.typicalPay}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Pay ranges reflect national estimates for SLPs with CCC-SLP credentials. Actual compensation varies by geography, experience, and employer. Sources: BLS Occupational Employment and Wage Statistics (May 2024), ASHA workforce data.
          </p>
        </section>

        {/* ── CREDENTIAL PATHWAY ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Path to Becoming a Licensed Language Pathologist</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The credentialing process for speech-language pathologists is more structured than many healthcare professions. Every step is sequential, and skipping one is not an option. Understanding the full timeline before you start helps you plan finances, clinical placements, and career entry realistically.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {credentialTimeline.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">{item.duration}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.phase}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SPECIALIZATIONS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Six High Demand Specializations Within Speech-Language Pathology</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Language pathology is not a single job description. The scope of practice covers everything from helping a toddler form first words to restoring swallowing function after a stroke. Specializing in one area allows you to command higher rates, attract more focused referrals, and build expertise that general practitioners cannot replicate.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {specializations.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{item.area}</h3>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    item.demandLevel === 'Very High' ? 'bg-green-100 text-green-700' :
                    item.demandLevel === 'High' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{item.demandLevel} Demand</span>
                </div>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SALARY BY STATE TIER ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Language Pathologist Salary by State: What the Numbers Miss</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            State-level salary averages are useful starting points, but they obscure important details about benefits, cost of living, and negotiation leverage. A $70,000 salary in a state with acute shortages and a low cost of living can deliver more financial security than $100,000 in a saturated metro area with high housing costs.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {salaryByState.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{item.tier}</h3>
                <p className="text-green-700 font-bold text-lg mb-1">{item.range}</p>
                <p className="text-xs text-gray-500 mb-3">{item.states}</p>
                <p className="text-gray-600 text-sm">{item.context}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Ranges reflect base salary for SLPs with CCC-SLP credentials. Shift differentials, sign-on bonuses, and benefits are not included. Data compiled from BLS (May 2024), ASHA member surveys, and Glassdoor aggregate reports.
          </p>
        </section>

        {/* ── CASELOAD RED FLAGS ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Caseload and Workplace Red Flags Every SLP Should Recognize</h2>
                <p className="text-gray-700 mb-4">
                  Burnout among speech-language pathologists is well documented, and it rarely arrives suddenly. It builds through structural conditions that erode professional satisfaction over time. The following patterns indicate an employer or setting that may not support sustainable practice.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {caseloadRedFlags.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── NEGOTIATION ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <DollarSign className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Negotiate Beyond the Salary Number</h2>
              <p className="text-gray-700 mb-6">
                In a field with documented shortages, SLPs have more leverage than they typically exercise. The items below are frequently negotiable and can add thousands of dollars in annual value to a compensation package, even when the base salary appears fixed.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {negotiationLeveragePoints.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.item}</h3>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERSTATE COMPACT ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Interstate Compact: How It Changes Where You Can Work</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The Audiology and Speech-Language Pathology Interstate Compact (ASLP-IC) is one of the most significant regulatory developments in the profession in the past decade. For SLPs who want to practice across state lines, whether through teletherapy or travel assignments, the compact eliminates the need to hold a separate license in each state.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> What the Compact Enables
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  'Practice in any member state without applying for a separate license',
                  'Provide teletherapy to clients in other compact states from your home',
                  'Accept travel SLP contracts across state lines with minimal administrative friction',
                  'Maintain a single primary state license while holding compact privileges in multiple states',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> What to Keep in Mind
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  'Not all states are members yet. Verify compact status before accepting out-of-state work',
                  'You must hold an active, unrestricted license in your home state to access compact privileges',
                  'Some employer contracts still require state-specific licensure regardless of compact eligibility',
                  'Compact rules govern licensure, not scope of practice, which remains defined by each state individually',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Language Pathologist Jobs</h2>
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

        {/* ── DISCLAIMER ── */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or connected to any hospital, school district, health system, staffing agency, or employer listed on this page. Job listings are sourced from third-party APIs and partner networks. Salary figures are estimates based on publicly available data from the Bureau of Labor Statistics, ASHA, and aggregated job posting platforms and may not reflect specific offers. Licensing requirements, compact eligibility, and scope of practice rules vary by state. Verify all details directly with the hiring facility and your state licensing board before making employment decisions. This page is for informational purposes only and does not constitute career, legal, or financial advice.
          </p>
        </section>
      </div>
    </>
  )
}