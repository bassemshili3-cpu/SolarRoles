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
  TrendingUp,
  BarChart2,
  Users,
  FileText,
  Star,
  GraduationCap,
} from 'lucide-react'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Social Media Supervisor Jobs | Lead Content & Brand Teams',
  description:
    'Content strategy, team leadership, and brand engagement for social media supervisors — remote and on-site positions with salary expectations listed.',
  keywords:
    'social media supervisor jobs, social media supervisor hiring, social media manager supervisor, social media team lead, digital marketing supervisor, social media jobs US, social media supervisor remote',
  openGraph: {
    title: 'Social Media Supervisor Jobs | Digital Marketing Roles',
    description:
      'Immediate openings for Social Media Supervisors nationwide. Lead creative teams, build brand presence, and grow your career in digital marketing. High-demand roles with great pay. Apply now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Supervisor | Remote & On-Site Openings',
    description:
      'Brands urgently need Social Media Supervisors. Browse open roles across the US, including remote positions. Competitive pay and career growth. Apply today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/social-media-supervisor',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Social Media Supervisor Jobs',
  description:
    'Browse current Social Media Supervisor job openings across the United States. Full-time, part-time, and remote positions available in digital marketing and communications.',
  url: 'https://www.oh-my-job.com/social-media-supervisor',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Social Media Supervisor Jobs',
    description: 'Current Social Media Supervisor listings across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does a Social Media Supervisor do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Social Media Supervisor oversees a brand\'s presence across social platforms such as Instagram, LinkedIn, TikTok, Facebook, and X. Responsibilities typically include developing content strategies, managing a team of content creators or coordinators, monitoring performance analytics, engaging with online communities, and aligning social media efforts with broader marketing goals.',
      },
    },
    {
      '@type': 'Question',
      name: 'What qualifications are needed to become a Social Media Supervisor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most employers require a bachelor\'s degree in marketing, communications, journalism, or a related field. Hands-on experience managing social media accounts is essential, and supervisory or team leadership experience is often required. Proficiency with analytics tools such as Google Analytics, Meta Business Suite, and Sprout Social is commonly expected.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the average salary for a Social Media Supervisor in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to the U.S. Bureau of Labor Statistics, advertising, promotions, and marketing managers earn a median annual wage of approximately $138,730. Social Media Supervisors typically fall in a mid-range tier within this category, with salaries commonly ranging from $55,000 to $90,000 per year depending on industry, location, and company size.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Social Media Supervisor a remote-friendly role?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Social Media Supervisor is one of the most remote-compatible roles in the marketing field. Because the core work involves managing digital platforms, collaborating via online tools, and producing content, many employers offer fully remote or hybrid arrangements. Remote opportunities are especially prevalent in technology, e-commerce, media, and nonprofit sectors.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the career path for a Social Media Supervisor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Social Media Supervisor typically advances from roles such as Social Media Coordinator or Manager. From the supervisor level, common next steps include Social Media Director, Head of Digital Marketing, VP of Communications, or Chief Marketing Officer (CMO). Building a strong portfolio of measurable results is key to accelerating this progression.',
      },
    },
  ],
}

const responsibilities = [
  {
    title: 'Content Strategy Development',
    description: 'Define and own the editorial calendar across platforms, ensuring content aligns with brand voice and business objectives.',
    icon: FileText,
  },
  {
    title: 'Team Leadership',
    description: 'Supervise and mentor social media coordinators, copywriters, and designers to maintain consistent output and quality.',
    icon: Users,
  },
  {
    title: 'Analytics and Reporting',
    description: 'Track KPIs such as reach, engagement rate, follower growth, and conversions. Present performance insights to leadership.',
    icon: BarChart2,
  },
  {
    title: 'Community Management',
    description: 'Oversee audience interactions, respond to comments and messages, and manage brand reputation across all channels.',
    icon: Star,
  },
  {
    title: 'Paid Social Oversight',
    description: 'Collaborate with performance marketing teams on paid social campaigns, budget allocation, and A/B testing strategies.',
    icon: TrendingUp,
  },
  {
    title: 'Cross-Functional Collaboration',
    description: 'Partner with product, PR, customer success, and sales teams to ensure social media supports company-wide initiatives.',
    icon: Briefcase,
  },
]

const salaryData = [
  { level: 'Entry-Level Supervisor', range: '$52,000 – $65,000/yr' },
  { level: 'Mid-Level Supervisor', range: '$65,000 – $85,000/yr' },
  { level: 'Senior Supervisor', range: '$85,000 – $100,000/yr' },
  { level: 'Agency or Tech Sector', range: '$90,000 – $115,000/yr' },
  { level: 'Remote Roles', range: '$60,000 – $95,000/yr' },
  { level: 'New York or LA Market', range: '$80,000 – $120,000/yr' },
]

const tools = [
  {
    category: 'Social Scheduling',
    examples: 'Hootsuite, Buffer, Sprout Social, Later',
  },
  {
    category: 'Analytics Platforms',
    examples: 'Google Analytics, Meta Business Suite, TikTok Analytics, LinkedIn Insights',
  },
  {
    category: 'Content Creation',
    examples: 'Canva, Adobe Creative Suite, CapCut, Figma',
  },
  {
    category: 'Project Management',
    examples: 'Asana, Monday.com, Trello, Notion',
  },
  {
    category: 'Listening and Monitoring',
    examples: 'Brandwatch, Mention, Talkwalker, Meltwater',
  },
  {
    category: 'Paid Social',
    examples: 'Meta Ads Manager, LinkedIn Campaign Manager, TikTok Ads',
  },
]

const qualifications = [
  "Bachelor's degree in marketing, communications, or a related discipline",
  '3 to 5 years of social media management experience',
  'Proven track record of growing brand accounts and driving engagement',
  'Experience supervising or mentoring junior team members',
  'Strong understanding of platform algorithms and best practices',
  'Proficiency with analytics and reporting tools',
  'Excellent writing, editing, and visual storytelling skills',
  'Ability to manage multiple projects and deadlines simultaneously',
]

const tips = [
  {
    title: 'Build a Results-Driven Portfolio',
    description:
      'Showcase specific campaigns you managed with measurable outcomes: follower growth percentages, engagement rate improvements, or conversion lifts. Numbers speak louder than job titles in this field.',
  },
  {
    title: 'Earn Platform Certifications',
    description:
      'Meta Blueprint, Google Digital Marketing certifications, and HubSpot Social Media Certification are widely recognized credentials that demonstrate up-to-date platform expertise to hiring managers.',
  },
  {
    title: 'Demonstrate Leadership Experience',
    description:
      'Supervisor roles require team management skills. Highlight any experience leading projects, onboarding freelancers, or mentoring junior colleagues, even in an informal capacity.',
  },
  {
    title: 'Stay Current on Platform Trends',
    description:
      'Social media evolves rapidly. Candidates who can speak confidently about short-form video trends, algorithm changes, and emerging platforms stand out significantly in interviews.',
  },
]

const faqs = [
  {
    question: 'What does a Social Media Supervisor do?',
    answer:
      'A Social Media Supervisor oversees a brand\'s presence across social platforms such as Instagram, LinkedIn, TikTok, Facebook, and X. Responsibilities typically include developing content strategies, managing a team of content creators or coordinators, monitoring performance analytics, engaging with online communities, and aligning social media efforts with broader marketing goals.',
  },
  {
    question: 'What qualifications are needed to become a Social Media Supervisor?',
    answer:
      'Most employers require a bachelor\'s degree in marketing, communications, journalism, or a related field. Hands-on experience managing social media accounts is essential, and supervisory or team leadership experience is often required. Proficiency with analytics tools such as Google Analytics, Meta Business Suite, and Sprout Social is commonly expected.',
  },
  {
    question: 'What is the average salary for a Social Media Supervisor in the United States?',
    answer:
      'According to the U.S. Bureau of Labor Statistics, advertising, promotions, and marketing managers earn a median annual wage of approximately $138,730. Social Media Supervisors typically fall in a mid-range tier within this category, with salaries commonly ranging from $55,000 to $90,000 per year depending on industry, location, and company size.',
  },
  {
    question: 'Is Social Media Supervisor a remote-friendly role?',
    answer:
      'Yes. Social Media Supervisor is one of the most remote-compatible roles in the marketing field. Because the core work involves managing digital platforms, collaborating via online tools, and producing content, many employers offer fully remote or hybrid arrangements. Remote opportunities are especially prevalent in technology, e-commerce, media, and nonprofit sectors.',
  },
  {
    question: 'What is the career path for a Social Media Supervisor?',
    answer:
      'A Social Media Supervisor typically advances from roles such as Social Media Coordinator or Manager. From the supervisor level, common next steps include Social Media Director, Head of Digital Marketing, VP of Communications, or Chief Marketing Officer (CMO). Building a strong portfolio of measurable results is key to accelerating this progression.',
  },
]

export default async function SocialMediaSupervisorPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'social media supervisor', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'social media supervisor', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Social Media Supervisor Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="social media supervisor" />
          </aside>
          <div className="flex-1">

            

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'social media supervisor'}
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
            <h2 className="text-2xl font-bold text-gray-900">Why Social Media Supervisors Are in High Demand</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              According to the U.S. Bureau of Labor Statistics, employment of advertising, promotions, and marketing managers is projected to grow 6 percent from 2022 to 2032, faster than the average for all occupations. Social media roles, and in particular supervisory positions, are among the fastest-growing segments within this category as organizations accelerate their digital-first strategies.
            </p>
            <p className="text-gray-700 mb-4">
              The rise of short-form video, influencer marketing, and social commerce has dramatically increased the complexity of managing a brand's social presence. Companies now require dedicated supervisors who can lead teams, manage multi-platform strategies, and translate social performance into measurable business outcomes.
            </p>
            <p className="text-gray-700">
              From startups to Fortune 500 companies, demand for skilled Social Media Supervisors spans every industry including retail, healthcare, technology, entertainment, and nonprofits, creating a strong and diverse job market across the country.
            </p>
          </div>
        </section>

        {/* Core Responsibilities */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Core Responsibilities of a Social Media Supervisor</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Social Media Supervisors operate at the intersection of strategy, creativity, and data. The following responsibilities reflect what employers across the US most commonly expect from candidates in this role.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {responsibilities.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <item.icon className="w-10 h-10 text-blue-600 mb-4" />
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
            <h2 className="text-2xl font-bold text-gray-900">Social Media Supervisor Salary Ranges in the US</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, marketing and advertising managers earn a median annual wage of $138,730, with the bottom 10 percent earning below $68,000. Social Media Supervisors typically sit at a mid-management level, with compensation reflecting experience, industry, and geographic market.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salaryData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center border border-green-100">
                  <p className="text-xl font-bold text-green-600 mb-1">{item.range}</p>
                  <p className="text-sm text-gray-600">{item.level}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Salary estimates vary based on employer size, industry sector, and location. Roles in major metro areas and technology companies tend to offer above-average compensation.
            </p>
          </div>
        </section>

        {/* Tools & Platforms */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <BarChart2 className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tools Every Social Media Supervisor Should Master</h2>
              <p className="text-gray-700 mb-6">
                Proficiency with the right tools is a key differentiator for Social Media Supervisor candidates. Employers across industries consistently list the following platforms and software categories in job requirements.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {tools.map((tool, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{tool.category}</h3>
                    <p className="text-gray-600 text-sm">{tool.examples}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Qualifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Typical Qualifications Employers Look For</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Based on a review of Social Media Supervisor job postings across major US employers, the following qualifications appear most consistently in hiring requirements.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {qualifications.map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips to Land a Social Media Supervisor Role</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Social Media Supervisor Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only. Salary figures, qualification requirements, and job market projections may vary by employer, industry, and location. Always consult the U.S. Bureau of Labor Statistics at bls.gov and individual job postings for the most current and applicable information.
          </p>
        </section>
      </div>
    </>
  )
}