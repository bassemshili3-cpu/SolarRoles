import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ShieldCheck, Heart } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Dental Assistant Jobs — Chairside, Ortho, Surgical & EFDA Openings Near You',
  description: 'Dental assistant openings at general practices, orthodontic offices, oral surgery centers, and DSOs. Filter by specialty, certification, and schedule.',
  keywords: 'dental assistant jobs, chairside dental assistant hiring, orthodontic assistant openings, oral surgery assistant positions, EFDA jobs, CDA certified dental assistant, dental assistant near me, dental assistant salary',
  openGraph: {
    title: 'Dental Assistant Jobs: General, Ortho, Surgery & Pediatric Roles | Oh My Job',
    description: 'Find dental assistant jobs that match your credentials and preferred specialty. Compare pay by state, review certification paths, and apply in minutes — openings at indie offices and DSO chains alike.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dental Assistant Jobs — Openings Across All Practice Types',
    description: 'Chairside, ortho, pedo, perio, or surgery — search dental assistant jobs by zip code, specialty, and schedule. Full-time, part-time, and temp positions available.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/dental-assistant-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Dental Assistant Jobs Board',
  description: 'Daily-refreshed feed of dental assistant jobs spanning general dentistry, orthodontics, oral surgery, pediatrics, periodontics, and corporate dental-service organizations across all fifty states.',
  url: 'https://www.oh-my-job.com/dental-assistant-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Active Dental Assistant Job Listings',
    description: 'Searchable directory of dental assistant jobs from entry-level trainee positions to Expanded Function Dental Assistant and lead clinical coordinator roles.',
  },
}

const workSettings = [
  {
    title: 'General / Family Dentistry',
    description: 'The broadest category of dental assistant jobs. You will four-hand assist during restorative procedures, expose and mount radiographs, pour impressions, sterilize instruments between patients, and manage the operatory turnover pace that keeps the schedule on time.',
    icon: Heart,
  },
  {
    title: 'Orthodontics',
    description: 'Fast-paced, high-volume clinics where you seat patients every 15-20 minutes for bracket bonding, archwire changes, and aligner check-ins. Orthodontic assistants develop speed and pattern recognition that few other settings teach — plus strong earning potential from production-based bonuses.',
    icon: ShieldCheck,
  },
  {
    title: 'Oral & Maxillofacial Surgery',
    description: 'Assist during impacted third-molar extractions, implant placements, bone grafts, and IV-sedation cases. Surgical assisting pays a premium over general chairside work and requires comfort with blood, sutures, and patient monitoring under sedation protocols.',
    icon: Briefcase,
  },
  {
    title: 'Pediatric Dentistry',
    description: 'Work exclusively with infants through adolescents — managing behavior in the chair, placing stainless-steel crowns on primary teeth, and communicating with anxious parents. Pediatric offices typically run shorter clinical days and offer the most family-friendly schedules in the field.',
    icon: MapPin,
  },
  {
    title: 'Periodontics',
    description: 'Support a periodontist through scaling-and-root-planing appointments, gingival-graft surgeries, and implant-maintenance visits. Perio assisting requires strong knowledge of probing depths, tissue types, and post-operative wound care — a niche that pays above the general median.',
    icon: Shield,
  },
  {
    title: 'Corporate DSO Networks',
    description: 'Chains like Aspen Dental, Heartland Dental, and Pacific Dental Services hire dental assistants at scale, offering standardized training modules, centralized benefits enrollment, and defined promotion tracks from assistant to lead to office manager — often faster than independent practices.',
    icon: TrendingUp,
  },
]

const certificationSteps = [
  {
    step: '1',
    title: 'Choose Your Entry Path: Formal Program or On-the-Job Training',
    description: 'About half of US states allow dental assistants to enter the field through supervised on-the-job training at a dental office — no prior schooling required. The other half mandate completion of a CODA-accredited program (typically 9-11 months at a community college or vocational school) before you can perform clinical duties. Check your state dental board first — it determines which path is legally available to you.',
  },
  {
    step: '2',
    title: 'Satisfy Your State\'s Registration or Licensure Rules',
    description: 'State requirements fall on a wide spectrum. Some states issue a license after you pass a state-specific exam; others require only registration with the dental board; and a handful let you work under direct dentist supervision with no credential at all. The DANB website maintains a 50-state comparison chart that shows exactly which permits and exams your state demands before you can take X-rays, polish teeth, or place sealants.',
  },
  {
    step: '3',
    title: 'Earn Your Radiography Authorization',
    description: 'Nearly every state that allows dental assistants to expose radiographs requires proof of competency — either through a state-administered exam or by passing the DANB Radiation Health and Safety (RHS) component. Getting your X-ray permit before you apply removes the single most common hiring delay, because no office can put you chairside until you are legally cleared to shoot films.',
  },
  {
    step: '4',
    title: 'Pursue the National CDA Credential',
    description: 'The Certified Dental Assistant (CDA) credential — earned by passing DANB\'s Infection Control, Radiation Health and Safety, and General Chairside exams — is the strongest resume differentiator in dental assisting. It is not required in every state, but holding it consistently correlates with higher starting wages, more interview callbacks, and faster advancement to lead-assistant or EFDA roles.',
  },
]

const salaryByState = [
  { state: 'Alaska', salary: '$55,000' },
  { state: 'Minnesota', salary: '$51,000' },
  { state: 'Washington', salary: '$50,000' },
  { state: 'Massachusetts', salary: '$49,000' },
  { state: 'California', salary: '$48,000' },
  { state: 'Florida', salary: '$37,000' },
]

const expandedFunctions = [
  'Coronal polishing after a dentist-completed prophylaxis',
  'Placing and finishing pit-and-fissure sealants on pediatric patients',
  'Seating and removing rubber dams for isolation',
  'Taking final alginate or PVS impressions under dentist supervision',
  'Removing post-operative sutures after dentist evaluation',
  'Applying topical anesthetic to tissue before an injection',
  'Placing and carving temporary restorations between appointments',
  'Conducting electric and thermal pulp-vitality tests',
]

const faqs = [
  {
    question: 'Do I need a license to work dental assistant jobs in my state?',
    answer: 'It depends entirely on where you live. Roughly half of US states require dental assistants to hold a state-issued license or registration before performing any clinical task; the other half permit you to work under direct dentist supervision without one — though you may still need specific permits for radiography or expanded functions. The fastest way to check is DANB\'s state-by-state requirements page at danb.org, which maps every permit, exam, and credential each state demands.',
  },
  {
    question: 'How long does it take to become a dental assistant from zero experience?',
    answer: 'If your state allows on-the-job training, you can be working chairside within weeks of being hired — learning while you earn. If your state requires a CODA-accredited program, expect 9 to 11 months for a certificate or diploma, or two years for an associate degree. Either way, dental assisting is one of the fastest paths into a clinical healthcare role, with no bachelor\'s degree required at any level.',
  },
  {
    question: 'What is the real earning potential for dental assistant jobs?',
    answer: 'The BLS national median sits at roughly $46,500 per year ($22.40/hr), but that number masks wide variation. Oral-surgery and orthodontic assistants routinely earn $50K-$60K because the procedures they support generate higher revenue for the practice. Expanded Function Dental Assistants (EFDAs) command an additional $3-$6/hr premium in states that authorize the designation. Geography matters too — Alaska, Minnesota, and Washington top the pay charts, while southeastern states tend to fall below the median.',
  },
  {
    question: 'Are dental assistant jobs expected to grow?',
    answer: 'Yes. The BLS projects 7% employment growth from 2022 to 2032 — faster than the all-occupations average — with about 60,400 openings per year. Three forces are driving demand: an aging population that needs more restorative and prosthetic work, an expansion of preventive-care awareness pushing more patients into routine visits, and the rapid growth of corporate DSO networks that are opening new offices in underserved markets.',
  },
  {
    question: 'What exactly is an EFDA and why does it pay more?',
    answer: 'An Expanded Function Dental Assistant is authorized by their state to perform clinical procedures beyond the standard scope — things like placing composite restorations, taking final impressions, or applying sealants independently. Because EFDAs free up the dentist to start the next procedure sooner, they directly increase chair-time revenue for the practice. That productivity boost is why offices pay EFDAs $3-$6/hr more than standard assistants, and why EFDA-qualified candidates are among the most sought-after hires in the field.',
  },
  {
    question: 'Can working as a dental assistant lead to dental hygiene or dental school?',
    answer: 'Absolutely, and it is one of the most common stepping-stone paths in oral healthcare. Many community-college dental-hygiene programs award credit for prior assisting coursework and clinical hours, shortening the two-year program timeline. A smaller but growing number of dental assistants go on to earn a DDS or DMD — and admissions committees consistently view chairside experience as a strong differentiator in applications because it proves you already understand the clinical environment.',
  },
]

const tips = [
  {
    title: 'Get Your X-Ray Permit Before You Apply',
    description: 'No dental office can let you expose radiographs without state authorization, and most cannot afford to wait weeks for you to complete the requirement after hiring. Walking in with your RHS exam passed or your state radiography card in hand eliminates the biggest bottleneck in the onboarding process — and gives you an edge over every applicant who plans to "get it done later."',
  },
  {
    title: 'Put Infection-Control Fluency Front and Center',
    description: 'Dental hiring managers rank sterilization and cross-contamination-prevention knowledge above almost every other skill. Mention OSHA Bloodborne Pathogens compliance and CDC dental infection-control guidelines by name on your resume — it signals that you can be trusted with instrument processing and operatory turnover from day one without constant supervision.',
  },
  {
    title: 'Earn the CDA Even If Your State Does Not Require It',
    description: 'The national CDA credential is a verified stamp of competency that travels with you across state lines. DANB\'s own survey data shows CDA holders receive more interview invitations and higher starting offers than uncredentialed peers applying to the same openings. In a competitive metro market, it is often the tiebreaker.',
  },
  {
    title: 'Apply to DSO Chains and Independent Offices in Parallel',
    description: 'Corporate dental groups (Aspen, Heartland, Pacific Dental, Western Dental) maintain centralized recruiting teams that process applications faster than most solo-doctor practices. Submitting to both channels simultaneously doubles your active pipeline and shortens the time from application to first paycheck — especially useful if you are relocating or re-entering the workforce.',
  },
]

export default async function DentalAssistantJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'dental assistant', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'dental assistant', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Dental Assistant Jobs — General, Ortho, Surgery & Pediatric Openings Nationwide
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="dental assistant" />
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
                what={params.what || 'dental assistant'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Work Settings */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Six Practice Types That Hire for Dental Assistant Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The term "dental assistant" covers a surprisingly wide range of clinical environments, and the day-to-day experience varies dramatically depending on which one you choose. An assistant in a high-volume ortho clinic seats a new patient every 15 minutes; an oral-surgery assistant monitors IV sedation and suctions blood during impactions. Understanding these differences before you apply ensures you target the setting where your temperament and skill level fit — and where the pay structure matches your financial goals.
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
            <h2 className="text-2xl font-bold text-gray-900">How to Qualify for Dental Assistant Jobs — Step by Step</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Dental assisting is one of the fastest entries into clinical healthcare — you can go from zero experience to working chairside in under a year in most states, and in just weeks in states that allow on-the-job training. The catch is that requirements are set state by state, so the first thing you need to do is check your state dental board. Once you know the rules, follow this four-step progression from entry to nationally certified.
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
            <h2 className="text-2xl font-bold text-gray-900">What Dental Assistant Jobs Pay — National and by State</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Dental-assistant pay is shaped by three variables: specialty (oral surgery and ortho pay the most), credentials (CDA and EFDA holders earn a measurable premium), and geography (cost-of-living drives wide state-to-state gaps). The BLS national median is a useful starting point, but the range between the 25th and 90th percentile spans nearly $25,000 — so always check the specific posting for the practice's actual rate before benchmarking your expectations.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$46,540</p>
                <p className="text-sm text-gray-600">National Median (BLS May 2023)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$22.37/hr</p>
                <p className="text-sm text-gray-600">Median Hourly Equivalent</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$60K+</p>
                <p className="text-sm text-gray-600">Top Decile (Surgery, EFDA, High-COL States)</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Highest-Paying States for Dental Assistant Jobs</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByState.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.state}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023 release. Figures reflect base wages; overtime, production bonuses, and benefits value are not included.
            </p>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Where Dental Assistant Jobs Lead Over a Career</h2>
                <p className="text-gray-700 mb-4">
                  Dental assisting is both a stable career in its own right and one of the most common launch pads into higher-paying oral-health roles. Many practicing dental hygienists, office managers, and even dentists started by handing instruments chairside. The progression below shows the typical rungs — each one unlocks higher pay, more autonomy, and broader clinical scope.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 flex-wrap">
                  {['Dental Assistant', 'CDA (Certified)', 'EFDA (Expanded Function)', 'Dental Hygienist', 'Office Manager', 'DDS / DMD'].map((level, index, arr) => (
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

        {/* Expanded Functions */}
        <section className="mt-20">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">EFDA: The Highest-Paying Tier of Dental Assistant Jobs</h2>
                <p className="text-gray-700 mb-6">
                  Expanded Function Dental Assistants are authorized by their state to perform clinical procedures that a standard assistant cannot — tasks that would otherwise require the dentist's hands. Because an EFDA effectively doubles the operatory's throughput (the dentist starts the next patient while the EFDA finishes the current one), practices pay a significant premium — typically $3-$6/hr above the base chairside rate. Not every state offers an EFDA pathway, so confirm availability with your state dental board. Where it exists, the authorized functions typically include:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {expandedFunctions.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Scope varies by state. Always verify your authorized functions through your state dental board before performing any procedure beyond standard-assistant scope.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OSHA / Infection Control */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Infection Control & OSHA Rules Every Dental Assistant Must Know</h2>
                <p className="text-gray-700 mb-4">
                  Dental assistants face routine occupational exposure to blood, saliva, and aerosols — which places them squarely under federal OSHA Bloodborne Pathogens regulation (29 CFR 1910.1030) and CDC infection-control guidelines for dental settings. Understanding these rules is not optional: they dictate how you handle instruments, protect yourself, and manage operatory turnover between patients. Here is what the two regulatory frameworks require in practice.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">What Your Employer Must Provide (OSHA)</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Annual Bloodborne Pathogens training — completed on paid time before exposure risk begins',
                        'A written Exposure Control Plan reviewed and updated every 12 months',
                        'Hepatitis B vaccination series offered free within 10 business days of your start date',
                        'Gloves, masks, face shields, and gowns provided at no cost for every clinical session',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">What You Must Follow Daily (CDC Guidelines)</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Standard precautions applied to every patient — regardless of known infection status',
                        'Hand hygiene performed before gloving and immediately after glove removal for each patient',
                        'All reusable instruments run through a validated steam-autoclave cycle with biological monitoring',
                        'Single-use items (needles, suction tips, prophy angles) discarded after one patient — never reprocessed',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
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

        {/* Shift Types */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Schedule Options Across Dental Assistant Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            One of the underappreciated perks of dental assistant jobs is schedule variety. Most general practices close by 5 PM and never operate on Sundays, giving you evenings and at least one weekend day off — a rarity in healthcare. DSOs and urgent-dental clinics extend hours to capture after-work patient demand, which creates evening and Saturday shifts with premium pay. And if you prefer variety over routine, temp agencies place dental assistants on a per-diem basis at different offices each week.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { shift: 'Standard Full-Time', time: 'Mon–Fri, 7:30 AM – 5 PM', note: 'The norm at most solo-doctor and small-group practices' },
              { shift: 'Part-Time', time: '2–4 days per week', note: 'Common when a practice shares assistants across doctors\' schedules' },
              { shift: 'Extended / Weekend', time: 'Evenings and Saturdays', note: 'Typical at DSO chains and urgent-care dental clinics — often pays a shift premium' },
              { shift: 'Temp / Per Diem', time: 'Varies by assignment', note: 'Placed through dental staffing agencies; highest hourly rate, no guaranteed hours' },
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
            <h2 className="text-2xl font-bold text-gray-900">Four Moves That Get You Hired Faster for Dental Assistant Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Dental offices hire quickly once they decide on a candidate — but the screening stage filters out a surprising number of applicants for preventable reasons. These four steps address the most common disqualifiers and put you ahead of the pack.
          </p>
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
            <h2 className="text-2xl font-bold text-gray-900">Dental Assistant Jobs — Questions Applicants Ask Most</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Whether you are weighing a career change into dental assisting or already credentialed and comparing offers, these six questions cover the practical ground that matters most before you apply.
          </p>
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
            <strong>Disclaimer:</strong> Salary figures, employment projections, and regulatory details on this page are compiled from the U.S. Bureau of Labor Statistics (Occupational Employment & Wage Statistics, Occupational Outlook Handbook), the Dental Assisting National Board (danb.org), the American Dental Association (ada.org), OSHA (osha.gov), and CDC dental infection-control publications. Licensing requirements, scope of practice, and wage rates for dental assistant jobs vary by state and employer. Always verify current rules with your state dental board and confirm compensation details directly with the hiring practice before accepting an offer.
          </p>
        </section>
      </div>
    </>
  )
}