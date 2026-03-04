// app/page.tsx
'use client'

import SearchHero from '@/components/SearchHero'
import JobListings from '@/components/InfiniteJobList'
import { Code2, Palette, DollarSign, Settings, BarChart2, TrendingUp, Heart, Briefcase, Search, Zap, ShieldCheck, TrendingUp as TrendUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

const categories = [
  {
    label: 'Engineering',
    icon: Code2,
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    what: 'software engineer',
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    label: 'Design',
    icon: Palette,
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    what: 'designer',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    label: 'Sales',
    icon: DollarSign,
    bg: 'bg-green-100',
    text: 'text-green-700',
    what: 'sales',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    label: 'Operations',
    icon: Settings,
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    what: 'operations',
    image: 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    label: 'Finance',
    icon: BarChart2,
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    what: 'finance',
    image: 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    label: 'Marketing',
    icon: TrendingUp,
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    what: 'marketing',
    image: 'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    label: 'Healthcare',
    icon: Heart,
    bg: 'bg-red-100',
    text: 'text-red-700',
    what: 'healthcare',
    image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    label: 'Legal',
    icon: Briefcase,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    what: 'legal',
    image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
]

function CategoryCard({ label, icon: Icon, bg, text, what, image }: (typeof categories)[0]) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/jobs?what=${encodeURIComponent(what)}`)}
      className={`${bg} relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4 items-start hover:scale-105 hover:shadow-lg transition-all cursor-pointer h-32`}
    >
      <img src={image} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex flex-col gap-3 items-start">
        <Icon className="text-white drop-shadow" size={24} />
        <span className="text-sm font-bold text-white drop-shadow">{label}</span>
      </div>
    </button>
  )
}

const stats = [
  { value: '6M+', label: 'Active job listings' },
  { value: '50K+', label: 'Partner companies' },
  { value: '200k+', label: 'Job seekers helped' },
  { value: '50', label: 'States covered' },
]

const features = [
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Our algorithm surfaces the most relevant opportunities based on your skills, experience, and location no noise, just the right jobs.',
  },
  {
    icon: DollarSign,
    title: 'Salary Transparency',
    description: 'Every listing includes salary ranges so you can apply with confidence and negotiate from a position of knowledge.',
  },
  {
    icon: Zap,
    title: 'Instant Applications',
    description: 'Apply to hundreds of companies in seconds with your saved profile.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    description: 'Every job posting is verified and updated in real time.',
  },
]

export default function Home() {
  const router = useRouter()

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white pt-24 pb-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-7xl font-bold tracking-tighter mb-6">
            Your next big opportunity<br />is one click away
          </h1>
         
          <SearchHero />
        </div>
      </div>

      {/* ── WHY OH MY JOB ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-extrabold text-[#1a2340]">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Headline */}
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-3">Why Oh My Job</p>
            <h2 className="text-4xl font-bold text-[#1a2340] mb-4">
              The smarter way to find<br />your next role in the US
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We aggregate millions of listings from top employers across every state and put salary data front and center so you can focus on what matters
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl p-8 flex gap-5 items-start shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon className="text-indigo-600" size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a2340] mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="py-12 text-center text-sm text-muted-foreground border-t border-gray-100">
        Trusted by 50,000+ companies in the USA
      </div>

      {/* Browse Categories Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-3">Explore by field</p>
          <h2 className="text-4xl font-bold text-[#1a2340] mb-4">Browse top job categories</h2>
          <p className="text-muted-foreground mb-12">
            From software engineering to creative design, find opportunities
            <br />across every industry.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {categories.slice(0, 4).map((cat) => (
              <CategoryCard key={cat.label} {...cat} />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {categories.slice(4).map((cat) => (
              <CategoryCard key={cat.label} {...cat} />
            ))}
          </div>

          <button
            onClick={() => router.push('/jobs')}
            className="border border-[#1a2340] text-[#1a2340] rounded-full px-6 py-2 text-sm font-medium hover:bg-[#1a2340] hover:text-white transition-colors"
          >
            View all categories
          </button>
        </div>
      </section>
    </>
  )
}