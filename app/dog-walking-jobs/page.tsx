import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import {
  Briefcase,
  DollarSign,
  CheckCircle,
  Shield,
  MapPin,
  Clock,
  Star,
  FileText,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Dog Walking Jobs | Flexible Pet Walker Openings Near You',
  description:
    'Pet walkers wanted across the U.S. Independent contractors and employed walkers welcome — hourly pay and schedule varies by employer.',
  keywords:
    'dog walking jobs, dog walker jobs, dog walking jobs near me, pet walker jobs, dog walking employment, professional dog walker, dog walking gigs, dog walker hiring',
  openGraph: {
    title: 'Dog Walking Jobs | Pet Walker Positions Near You',
    description:
      'Hundreds of dog walking jobs are open right now across the US. Flexible hours, great pay, and no experience required for many roles. Find your next dog walking job today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dog Walking Jobs | Flexible Schedules, No Degree Needed',
    description:
      'Love dogs? Get paid for it. Explore hundreds of dog walking jobs near you. Flexible schedules, no degree needed. Apply now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/dog-walking-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Dog Walking Jobs',
  description:
    'Browse current dog walking job openings across the United States. Flexible positions for animal lovers with competitive hourly pay.',
  url: 'https://www.oh-my-job.com/dog-walking-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Dog Walking Jobs',
    description: 'Current dog walking and pet care job listings across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you need a license or certification to be a dog walker in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'There is no federal licensing requirement to work as a dog walker in the United States. However, professional certifications such as those offered by the National Association of Professional Pet Sitters (NAPPS) or Pet Sitters International (PSI) can strengthen your credibility and help you earn more. Some cities or counties may require a business license if you operate independently.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do dog walkers earn per hour in the US?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to the U.S. Bureau of Labor Statistics, animal care and service workers earn a median hourly wage of around $14 to $17 per hour nationally. Independent dog walkers who set their own rates can earn between $15 and $30 per walk (typically 30 minutes), and experienced professionals in urban markets can earn $40,000 to $60,000 per year or more.',
      },
    },
    {
      '@type': 'Question',
      name: 'What skills are needed to become a professional dog walker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Professional dog walkers should have a genuine love for animals, physical stamina, reliability, and basic knowledge of dog behavior and body language. First aid training for pets is highly recommended. Strong time management and communication skills are also essential when managing multiple clients and their animals.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is dog walking a good job for flexible hours?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Dog walking is widely recognized as one of the most schedule-flexible jobs available. Most walks are needed during midday hours on weekdays, making it an ideal fit for students, parents, or anyone seeking part-time income. Independent contractors can choose their own clients and set their own availability.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do dog walkers need insurance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'While not legally required at the federal level, pet sitter and dog walker insurance is strongly recommended. According to Pet Sitters International, professional liability insurance protects dog walkers from costs related to accidents, injuries, or property damage that may occur during a walk. Many clients and platforms require proof of insurance before hiring.',
      },
    },
  ],
}

const jobTypes = [
  {
    title: 'Independent Dog Walker',
    description: 'Set your own rates and schedule. Build your own client base in your neighborhood or through pet care platforms.',
    icon: MapPin,
  },
  {
    title: 'Pet Care Company Employee',
    description: 'Join an established pet services company with a steady client roster, benefits, and set routes.',
    icon: Briefcase,
  },
  {
    title: 'App-Based Walker (Rover, Wag)',
    description: 'Work through on-demand platforms that connect dog walkers with pet owners in real time.',
    icon: TrendingUp,
  },
  {
    title: 'Dog Walker and Sitter Combo',
    description: 'Combine daily walks with overnight pet sitting for maximum earnings and year-round work.',
    icon: Star,
  },
  {
    title: 'Shelter or Rescue Volunteer Walker',
    description: 'Walk dogs at local shelters or rescue organizations, sometimes with stipends or paid opportunities.',
    icon: CheckCircle,
  },
  {
    title: 'Dog Daycare Assistant',
    description: 'Work at a dog daycare facility managing group walks, playtime, and supervised outdoor exercise sessions.',
    icon: Clock,
  },
]

const salaryData = [
  { type: 'Entry-Level Dog Walker', range: '$13 – $17/hr' },
  { type: 'Experienced Dog Walker', range: '$18 – $25/hr' },
  { type: 'Independent Contractor', range: '$15 – $35/walk' },
  { type: 'Dog Walker + Sitter', range: '$30,000 – $50,000/yr' },
  { type: 'Urban Market Professional', range: '$45,000 – $65,000/yr' },
  { type: 'Dog Daycare Staff', range: '$14 – $20/hr' },
]

const certifications = [
  {
    name: 'Pet First Aid & CPR',
    detail: 'Offered by the American Red Cross and various pet care organizations. Demonstrates emergency preparedness and is highly valued by clients.',
  },
  {
    name: 'NAPPS Certification',
    detail: 'The National Association of Professional Pet Sitters offers a Certified Professional Pet Sitter (CPPS) credential recognized across the industry.',
  },
  {
    name: 'PSI Certification',
    detail: 'Pet Sitters International provides the Certified Professional Pet Sitter exam, covering animal care, business practices, and client relations.',
  },
  {
    name: 'Dog Behavior Basics',
    detail: 'Courses in canine body language and basic behavior management help dog walkers handle multiple breeds safely and confidently.',
  },
]

const workHourPatterns = [
  { label: 'Part-Time', detail: 'Typically 10 to 20 hours per week, with morning and midday walks on weekdays' },
  { label: 'Full-Time', detail: 'Generally 30 to 40 hours per week across multiple clients and service types' },
  { label: 'Peak Hours', detail: 'Most in-demand between 11:00 AM and 2:00 PM on weekdays' },
  { label: 'Weekend Work', detail: 'Weekend walks are often in higher demand and can command premium rates' },
  { label: 'Holiday Season', detail: 'Demand spikes around major holidays when pet owners travel' },
]

const tips = [
  {
    title: 'Get Certified to Stand Out',
    description:
      'Earning a pet first aid certification or a credential from Pet Sitters International signals professionalism and builds immediate trust with potential clients and employers.',
  },
  {
    title: 'Build Your Online Presence',
    description:
      'Create a profile on platforms like Rover or Wag to start generating reviews and clients quickly. A strong digital reputation is one of the fastest ways to grow your dog walking income.',
  },
  {
    title: 'Consider Insurance from Day One',
    description:
      'Professional liability insurance protects you against accidents or injuries. Many clients will ask for proof of coverage, and it demonstrates that you take the job seriously.',
  },
  {
    title: 'Start Local and Expand Gradually',
    description:
      'Begin by offering services in your immediate neighborhood to minimize transit time and maximize the number of walks you can do per day. Referrals from satisfied clients will naturally grow your territory.',
  },
]

const faqs = [
  {
    question: 'Do you need a license or certification to be a dog walker in the United States?',
    answer:
      'There is no federal licensing requirement to work as a dog walker in the United States. However, professional certifications such as those offered by the National Association of Professional Pet Sitters (NAPPS) or Pet Sitters International (PSI) can strengthen your credibility and help you earn more. Some cities or counties may require a business license if you operate independently.',
  },
  {
    question: 'How much do dog walkers earn per hour in the US?',
    answer:
      'According to the U.S. Bureau of Labor Statistics, animal care and service workers earn a median hourly wage of around $14 to $17 per hour nationally. Independent dog walkers who set their own rates can earn between $15 and $30 per walk (typically 30 minutes), and experienced professionals in urban markets can earn $40,000 to $60,000 per year or more.',
  },
  {
    question: 'What skills are needed to become a professional dog walker?',
    answer:
      'Professional dog walkers should have a genuine love for animals, physical stamina, reliability, and basic knowledge of dog behavior and body language. First aid training for pets is highly recommended. Strong time management and communication skills are also essential when managing multiple clients and their animals.',
  },
  {
    question: 'Is dog walking a good job for flexible hours?',
    answer:
      'Yes. Dog walking is widely recognized as one of the most schedule-flexible jobs available. Most walks are needed during midday hours on weekdays, making it an ideal fit for students, parents, or anyone seeking part-time income. Independent contractors can choose their own clients and set their own availability.',
  },
  {
    question: 'Do dog walkers need insurance?',
    answer:
      'While not legally required at the federal level, pet sitter and dog walker insurance is strongly recommended. According to Pet Sitters International, professional liability insurance protects dog walkers from costs related to accidents, injuries, or property damage that may occur during a walk. Many clients and platforms require proof of insurance before hiring.',
  },
]

export default async function DogWalkingJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'dog walking', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'dog walking', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Dog Walking Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="dog walking" />
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
                what={params.what || 'dog walking'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Market Overview */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Dog Walking Job Market in the United States</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              According to the American Pet Products Association (APPA), Americans spent over $147 billion on their pets in 2023, with pet services including dog walking representing one of the fastest-growing segments. This sustained growth translates directly into strong and consistent demand for professional dog walkers across the country.
            </p>
            <p className="text-gray-700 mb-4">
              The U.S. Bureau of Labor Statistics projects employment of animal care and service workers to grow 19 percent from 2022 to 2032, much faster than the average for all occupations. Dog walkers and pet sitters fall within this category and are expected to benefit significantly from this trend as pet ownership continues to rise.
            </p>
            <p className="text-gray-700">
              Whether you are looking for a part-time gig, a full-time career, or a side income with flexible hours, dog walking offers one of the most accessible entry points into the growing pet care industry.
            </p>
          </div>
        </section>

        {/* Types of Dog Walking Jobs */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Dog Walking Jobs Available</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Dog walking encompasses a variety of employment arrangements, from independent gig work to salaried positions at established pet care companies. Here are the most common formats you will encounter when searching for dog walking work.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobTypes.map((job, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <job.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Typical Work Hours */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Typical Work Schedules for Dog Walkers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Dog walking schedules vary widely depending on whether you work independently or for a company. The following patterns reflect the most common arrangements in the US pet care market.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workHourPatterns.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Dog Walkers Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, animal care and service workers earn a median annual wage of approximately $31,600 as of the most recent national estimates. Dog walkers who build strong independent client bases in major metropolitan areas can significantly exceed this figure.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salaryData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center border border-green-100">
                  <p className="text-xl font-bold text-green-600 mb-1">{item.range}</p>
                  <p className="text-sm text-gray-600">{item.type}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Earnings vary based on location, number of clients, platform used, and experience level. Urban markets such as New York, Los Angeles, and Chicago tend to offer significantly higher rates than national averages.
            </p>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications That Help You Get Hired</h2>
              <p className="text-gray-700 mb-6">
                While no federal certification is required to work as a dog walker, earning professional credentials can significantly improve your chances of landing clients and commanding higher rates. The following are recognized across the US pet care industry.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                    <p className="text-gray-600 text-sm">{cert.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Safety Considerations */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Safety Essentials for Dog Walkers</h2>
                <p className="text-gray-700 mb-4">
                  The Occupational Safety and Health Administration (OSHA) recognizes animal handling as a category with specific workplace hazards. Being prepared reduces the risk of injury to both yourself and the animals in your care.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Always use a secure, properly fitted leash and harness',
                    'Never walk more dogs than you can safely control at once',
                    'Know basic dog first aid and CPR procedures',
                    'Carry emergency contact info for every pet you walk',
                    'Be aware of local leash laws and off-leash area rules',
                    'Avoid extreme weather conditions that could stress dogs',
                    'Use GPS tracking tools for added accountability',
                    'Have a plan for aggressive or reactive dog encounters',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Your First Dog Walking Job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Dog Walking Jobs</h2>
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
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only. Salary figures, certification requirements, and market data may vary by location and change over time. Always consult the U.S. Bureau of Labor Statistics at bls.gov, your local municipality, and relevant professional associations for the most current and applicable information regarding dog walking employment in your area.
          </p>
        </section>
      </div>
    </>
  )
}