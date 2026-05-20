import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, TrendingUp, ShieldCheck, Heart } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Dignity Health Jobs Hiring Now | Clinical and Non-Clinical Positions Across the US',
  description: 'Dignity Health fills nursing, allied health, IT, and admin positions across hospitals and medical foundations. Browse by department and location.',
  keywords: 'dignity health jobs, dignity health careers, dignity health hiring, nurse jobs dignity health, hospital jobs dignity health, administrative jobs dignity health',
  openGraph: {
    title: 'Dignity Health Jobs Hiring Immediately | Clinical and Non-Clinical Roles',
    description: 'Dignity Health is actively hiring in California, Arizona, Nevada, and beyond. Join a mission-driven healthcare system with strong benefits.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dignity Health Jobs | Apply Now',
    description: 'Find Dignity Health jobs hiring now. Nursing, allied health, IT, and administrative positions available across multiple hospitals and medical centers.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/dignity-health-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Dignity Health Jobs',
  description: 'Browse current Dignity Health job openings across clinical, administrative, and support roles in hospitals, medical foundations, and care centers.',
  url: 'https://www.oh-my-job.com/dignity-health-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Dignity Health Jobs',
    description: 'Job listings for Dignity Health in multiple states and disciplines',
  },
}

const jobCategories = [
  {
    title: 'Registered Nursing',
    description: "RN openings across ICU, ED, telemetry, L&D, oncology, med-surg. Nursing is consistently the highest-demand category at most facilities.",
    icon: Heart,
  },
  {
    title: 'Allied Health and Clinical Support',
    description: "Respiratory therapy, radiology, sonography, surgical tech, PT, and lab technician roles are open across hospitals and outpatient centers.",
    icon: ShieldCheck,
  },
  {
    title: 'Physician and Advanced Practice',
    description: "Medical Foundation roles for MDs, NPs, and PAs in primary care and specialty practices, with administrative support.",
    icon: Briefcase,
  },
  {
    title: 'Healthcare Administration',
    description: "Patient access, medical coding, HIM, and department coordination roles support operations system-wide.",
    icon: FileText,
  },
  {
    title: 'Information Technology and Systems',
    description: "IT roles include clinical informatics, Epic implementation, cybersecurity, data analytics, and infrastructure, both on-site and remote.",
    icon: TrendingUp,
  },
  {
    title: 'Environmental Services and Support',
    description: "Dietary, EVS, patient transport, sterile processing, and facilities maintenance roles with stable employment and benefits.",
    icon: MapPin,
  },
]

const hiringSteps = [
  {
    step: '1',
    title: 'Apply Directly via CommonSpirit Health Portal',
    description: "All Dignity Health hiring is through the CommonSpirit Health careers portal. Build your profile there and set job alerts to receive notifications immediately.",
  },
  {
    step: '2',
    title: 'Verify Licenses and Credentials',
    description: "Ensure all clinical licenses, certifications, and education credentials are current to avoid delays in the hiring process.",
  },
  {
    step: '3',
    title: 'Background and Health Screening',
    description: "Candidates undergo background checks, drug tests, and immunization verification before starting patient-facing work.",
  },
  {
    step: '4',
    title: 'New Employee Orientation and Department Onboarding',
    description: "Orientation covers mission, values, compliance, and safety. Clinical staff complete unit-based competency validation and preceptorship programs.",
  },
]

const salaryByRole = [
  { role: 'Registered Nurse', salary: '$80,000 to $130,000' },
  { role: 'Respiratory Therapist', salary: '$65,000 to $90,000' },
  { role: 'Radiologic Technologist', salary: '$62,000 to $88,000' },
  { role: 'Physical Therapist', salary: '$78,000 to $105,000' },
  { role: 'Medical Laboratory Tech', salary: '$55,000 to $78,000' },
  { role: 'Physician Assistant', salary: '$115,000 to $155,000' },
]

const facilities = [
  { name: 'California', note: "Over 30 hospitals including St. Mary's Medical Center, Mercy General, and Northridge Hospital Medical Center." },
  { name: 'Arizona', note: "Includes Chandler Regional, Mercy Gilbert, and St. Joseph's Hospital and Medical Center." },
  { name: 'Nevada', note: "St. Rose Dominican Hospitals in Henderson and Las Vegas are major hiring centers." },
  { name: 'Pacific Northwest & Mountain West', note: "Hospitals in Washington, Montana, Idaho, and Alaska including St. Patrick and Providence St. Joseph Medical Center." },
]

const faqs = [
  {
    question: 'Is Dignity Health part of CommonSpirit Health?',
    answer: "They merged in 2019. Dignity Health facilities keep their brand, but HR, payroll, benefits, and hiring are managed through CommonSpirit Health.",
  },
  {
    question: 'COVID-19 vaccination requirements?',
    answer: "Requirements vary by state and facility. Check the CommonSpirit Health careers portal for the most current policy.",
  },
  {
    question: 'Benefits offered?',
    answer: "Medical, dental, vision, 403(b) matching, PTO, tuition reimbursement, and employee assistance programs. Eligible nonprofit employees may qualify for Public Service Loan Forgiveness.",
  },
  {
    question: 'PSLF eligibility?',
    answer: "Many Dignity Health nonprofit facilities qualify. Verify your employer's status and meet federal requirements.",
  },
  {
    question: 'Are travel nurses accepted?',
    answer: "Yes, via third-party staffing agencies under CommonSpirit vendor agreements.",
  },
  {
    question: 'Work culture?',
    answer: "Varies by facility and unit. Mission-driven culture is strong in some departments; staffing and management quality differs across hospitals.",
  },
]

const tips = [
  { title: 'Apply Directly', description: "Submitting through the CommonSpirit portal ensures correct routing and recruiter visibility." },
  { title: 'Demonstrate Mission Alignment', description: "Highlight volunteer work, patient advocacy, or relevant experiences in your application." },
  { title: 'Verify License Reciprocity', description: "Check state licensure requirements before applying out-of-state to avoid delays." },
  { title: 'Set Up Job Alerts', description: "Saved searches on the portal ensure timely application to newly posted positions." },
]

export default async function DignityHealthJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'dignity health', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'dignity health', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Dignity Health Jobs Available Across the United States</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80"><JobFilters defaultWhat="dignity health" /></aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'dignity health'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}