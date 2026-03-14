import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, Heart, Award, TrendingUp, Building2, GraduationCap, Microscope } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Urgent: Assisted Reproductive Technology Jobs Available Now | Apply Today',
  description: 'Explore 500+ assisted reproductive technology jobs hiring immediately. IVF specialists, embryologists, fertility nurses and more. Top clinics are urgently hiring ART professionals. Apply now!',
  keywords: 'assisted reproductive technology jobs, ART jobs, IVF jobs, embryologist jobs, fertility clinic jobs, reproductive endocrinology jobs, fertility nurse jobs, ART career',
  openGraph: {
    title: 'Assisted Reproductive Technology Jobs | Urgent Need for ART Professionals',
    description: 'Top fertility clinics and hospitals are urgently hiring ART professionals. Find embryologist, IVF coordinator, fertility nurse and reproductive technology positions. Apply in minutes!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assisted Reproductive Technology Jobs | Hiring Now',
    description: 'Urgent demand for ART professionals. Browse hundreds of assisted reproductive technology positions at leading fertility clinics. No wait, apply today!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/assisted-reproductive-technology-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Assisted Reproductive Technology Jobs',
  description: 'Find assisted reproductive technology jobs hiring now. Browse hundreds of ART positions at fertility clinics, hospitals, and research centers across the United States.',
  url: 'https://www.oh-my-job.com/assisted-reproductive-technology-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Assisted Reproductive Technology Jobs',
    description: 'Current job listings in the assisted reproductive technology field',
  },
}

const artRoles = [
  { title: 'Embryologist', description: 'Handle oocyte retrieval, fertilization procedures, and embryo culture in IVF laboratories', icon: Microscope },
  { title: 'IVF Coordinator', description: 'Manage patient treatment cycles, scheduling, and communication between clinical teams', icon: Users },
  { title: 'Fertility Nurse', description: 'Provide direct patient care including injections, monitoring, and emotional support', icon: Heart },
  { title: 'Reproductive Endocrinologist', description: 'Diagnose and treat infertility through advanced medical and surgical interventions', icon: GraduationCap },
  { title: 'Andrologist', description: 'Specialize in sperm analysis, processing, and male fertility laboratory procedures', icon: Microscope },
  { title: 'ART Laboratory Director', description: 'Oversee daily lab operations, quality assurance, and regulatory compliance', icon: Building2 },
]

const certifications = [
  { name: 'ELD: Embryology Laboratory Director', issuer: 'American Board of Bioanalysis ABB', description: 'Required for directing ART laboratories in many states' },
  { name: 'TS: Technical Supervisor', issuer: 'American Board of Bioanalysis ABB', description: 'Validates competence in high complexity embryology testing' },
  { name: 'HCLD: High Complexity Laboratory Director', issuer: 'American Board of Bioanalysis ABB   ', description: 'Advanced credential for overseeing high complexity clinical labs' },
  { name: 'Certified Reproductive Endocrinology Nurse', issuer: 'Oncology Nursing Certification Corporation', description: 'Specialty certification for nurses working in reproductive medicine' },
]

const salaryRanges = [
  { role: 'Embryologist: Entry Level', range: '$55,000 – $75,000', note: 'Typically requires a bachelor\'s degree in biology or related field' },
  { role: 'Senior Embryologist', range: '$80,000 – $120,000', note: 'Usually requires 5+ years of IVF lab experience' },
  { role: 'IVF Coordinator / Nurse', range: '$60,000 – $90,000', note: 'Registered nurse licensure typically required' },
  { role: 'Andrologist', range: '$50,000 – $80,000', note: 'Bachelor\'s degree and laboratory training required' },
  { role: 'ART Laboratory Director', range: '$110,000 – $170,000', note: 'Doctoral degree and HCLD certification commonly expected' },
  { role: 'Reproductive Endocrinologist', range: '$250,000 – $450,000+', note: 'Medical degree plus fellowship in reproductive endocrinology' },
]

const industryStats = [
  { stat: '2.3%', label: 'Of all U.S. infants born via ART in 2021', source: 'CDC ART Surveillance Report' },
  { stat: '413,776', label: 'ART cycles performed in the U.S. in 2021', source: 'CDC National ART Surveillance System' },
  { stat: '560+', label: 'Fertility clinics reporting to CDC nationwide', source: 'CDC Fertility Clinic Success Rates Report' },
  { stat: '21%', label: 'Projected growth in medical laboratory roles through 2032', source: 'Bureau of Labor Statistics' },
]

const faqs = [
  {
    question: 'What is assisted reproductive technology ART?',
    answer: 'According to the Centers for Disease Control and Prevention CDC, assisted reproductive technology includes all fertility treatments in which either eggs or embryos are handled outside the body. The most common form of ART is in vitro fertilization (IVF), which involves extracting eggs, fertilizing them in a laboratory, and transferring the resulting embryo into the patient\'s uterus. Other procedures include intracytoplasmic sperm injection (ICSI), assisted hatching, and frozen embryo transfers.',
  },
  {
    question: 'What education is needed to work in assisted reproductive technology?',
    answer: 'Education requirements vary by role. Embryologists typically need at least a bachelor\'s degree in biology, biochemistry, or a related life science, though many employers prefer a master\'s degree. IVF nurses require a registered nurse (RN) license and often pursue specialty certifications. Reproductive endocrinologists must complete medical school followed by an obstetrics and gynecology residency and a fellowship in reproductive endocrinology and infertility. The American Board of Bioanalysis offers professional certifications for laboratory personnel.',
  },
  {
    question: 'Are ART clinics regulated in the United States?',
    answer: 'Yes. According to the official CDC website, the Fertility Clinic Success Rate and Certification Act of 1992 requires all clinics performing ART procedures to report data annually to the CDC. Additionally, ART laboratories must comply with the Clinical Laboratory Improvement Amendments (CLIA) administered by the Centers for Medicare and Medicaid Services (CMS). Individual states may impose additional licensing and inspection requirements.',
  },
  {
    question: 'Is the assisted reproductive technology field growing?',
    answer: 'The ART industry has experienced consistent growth. According to the CDC, the number of ART cycles performed in the United States has increased significantly over the past two decades. The Bureau of Labor Statistics projects that employment in clinical laboratory technology and related fields will grow much faster than average through 2032. Rising demand for fertility services, advances in treatment options, and broader insurance coverage mandates continue to drive hiring in this sector.',
  },
  {
    question: 'What skills are most valued in ART positions?',
    answer: 'Employers in the ART field commonly seek candidates with strong attention to detail, proficiency in laboratory techniques, excellent communication skills, and the ability to work under pressure. For clinical roles, empathy and patient centered care are essential. Technical positions require hands on experience with micromanipulation tools, cryopreservation systems, and strict adherence to quality control protocols. Familiarity with FDA regulations and CLIA compliance is highly valued.',
  },
  {
    question: 'Do ART professionals need a license to practice?',
    answer: 'Licensing requirements depend on the specific role and the state. Nurses must hold active RN or advanced practice licensure in their state. Physicians must be board certified and hold a valid medical license. For embryologists and laboratory staff, while there is no universal federal license, the Clinical Laboratory Improvement Amendments (CLIA) require laboratories to employ personnel who meet specific education and training qualifications. Several states also require additional lab personnel licensure.',
  },
]

const tips = [
  {
    title: 'Earn Relevant Certifications',
    description: 'Pursue credentials from the American Board of Bioanalysis or specialty nursing boards. Certified professionals are often prioritized by top fertility clinics during the hiring process.',
  },
  {
    title: 'Gain Hands On Lab Experience',
    description: 'Seek internships or research assistant positions in IVF or reproductive biology labs. Direct experience with embryo culture, cryopreservation, or semen analysis sets candidates apart.',
  },
  {
    title: 'Join Professional Organizations',
    description: 'Becoming a member of organizations like the American Society for Reproductive Medicine ASRM or the Society for Assisted Reproductive Technology SART provides networking, job boards, and continuing education.',
  },
  {
    title: 'Stay Current with Regulations',
    description: 'Familiarize yourself with FDA tissue handling requirements, CLIA laboratory standards, and state specific fertility clinic regulations. Employers value candidates who understand compliance frameworks.',
  },
]

export default async function AssistedReproductiveTechnologyJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'Assisted Reproductive Technology', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'Assisted Reproductive Technology', where: params.where || '', results_per_page: 30, page: 1 })
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
            Assisted Reproductive Technology Jobs Available Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="assisted reproductive technology" />
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
                what={params.what || 'assisted reproductive technology'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Industry Growth Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Assisted Reproductive Technology Industry at a Glance</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The assisted reproductive technology sector continues to expand rapidly across the United States. According to the Centers for Disease Control and Prevention (CDC), the number of ART cycles performed each year has grown steadily, driving strong demand for qualified professionals at every level.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {industryStats.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-blue-600 mb-2">{item.stat}</p>
                <p className="text-gray-700 text-sm mb-2">{item.label}</p>
                <p className="text-gray-400 text-xs">{item.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Types of ART Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Common Assisted Reproductive Technology Roles</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The ART field encompasses a broad range of clinical, laboratory, and administrative positions. According to the Society for Assisted Reproductive Technology (SART), fertility clinics rely on multidisciplinary teams to deliver patient care. Below are some of the most in demand roles in the industry.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Expectations */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Salary Expectations in Assisted Reproductive Technology</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Compensation in the ART field varies widely depending on role, experience, geographic location, and employer type. The following ranges reflect typical annual salaries reported across the United States. According to the Bureau of Labor Statistics, clinical laboratory and healthcare occupations have seen above average wage growth in recent years.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salaryRanges.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.role}</p>
                <p className="text-2xl font-bold text-green-600 mb-2">{item.range}</p>
                <p className="text-gray-500 text-sm">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Note: Salaries vary based on location, facility type, and individual qualifications. Metropolitan areas and large academic medical centers typically offer higher compensation.
          </p>
        </section>

        {/* Certifications Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Certifications for ART Professionals</h2>
              <p className="text-gray-700 mb-6">
                Professional certifications demonstrate expertise and are often required or strongly preferred by employers. According to the Clinical Laboratory Improvement Amendments (CLIA) administered by the Centers for Medicare and Medicaid Services, laboratory personnel must meet defined qualification standards. The following certifications are among the most recognized in the ART field.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                    <p className="text-blue-600 text-sm mb-2">{cert.issuer}</p>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Regulatory Framework */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Regulatory Framework Governing ART in the United States</h2>
                <p className="text-gray-700 mb-4">
                  Assisted reproductive technology is regulated at both the federal and state level. Professionals entering this field should understand the key regulatory bodies and legislation that shape clinic operations and hiring requirements.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Federal Oversight</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>CDC collects and publishes annual ART success rate data under the Fertility Clinic Success Rate and Certification Act of 1992</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>FDA regulates human cells, tissues, and cellular and tissue based products (HCT/Ps) used in ART procedures</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>CMS enforces laboratory quality standards through the Clinical Laboratory Improvement Amendments (CLIA)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Professional Standards</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>The American Society for Reproductive Medicine (ASRM) publishes clinical practice guidelines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>The College of American Pathologists (CAP) offers voluntary laboratory accreditation for reproductive labs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>The Joint Commission accredits ambulatory surgery centers where many ART procedures take place</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing an Assisted Reproductive Technology Job</h2>
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

        {/* Work Settings Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where ART Professionals Work</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Assisted reproductive technology professionals are employed across a variety of settings. According to the CDC, more than 560 fertility clinics currently report ART data nationwide, and this number continues to grow. Understanding the different work environments can help job seekers identify the best fit for their career goals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { setting: 'Private Fertility Clinics', detail: 'The most common employer for ART professionals, ranging from small single physician practices to large multi location groups' },
              { setting: 'Academic Medical Centers', detail: 'University affiliated hospitals that combine clinical care with research and training programs in reproductive medicine' },
              { setting: 'Hospital Based Fertility Programs', detail: 'Reproductive medicine departments within larger hospital systems that offer ART alongside general OB/GYN services' },
              { setting: 'Cryopreservation and Tissue Banks', detail: 'Facilities specializing in the storage and management of eggs, sperm, embryos, and reproductive tissue' },
              { setting: 'Pharmaceutical and Biotech Companies', detail: 'Companies developing fertility medications, culture media, and laboratory equipment for the ART industry' },
              { setting: 'Research Institutions', detail: 'Organizations conducting studies on embryo development, genetic screening, and advanced reproductive techniques' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-2">{item.setting}</p>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Assisted Reproductive Technology Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal, medical, or career advice. Licensing requirements, salary ranges, and regulatory standards vary by state and are subject to change. Always consult the official websites of the U.S. Centers for Disease Control and Prevention (cdc.gov), the U.S. Food and Drug Administration (fda.gov), and the Bureau of Labor Statistics (bls.gov) for the most current data. Job seekers should verify all position requirements, certifications, and employment conditions directly with prospective employers.
          </p>
        </section>
      </div>
    </>
  )
}