import type { Metadata } from 'next'
import SearchHero from '@/components/SearchHero'
import NewsletterForm from '@/components/NewsletterForm'
import { BLOG_ARTICLES } from '@/lib/blog-articles'
import Link from 'next/link'
import {
  DollarSign, Search, Zap, ShieldCheck,
  Code2, Palette, BarChart2, Settings, TrendingUp, Heart, Briefcase,
  Award, Globe, Users, ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Oh My Job | US Job Board with Salary Ranges & Smart Filters',
  description:
    'Search 400 000+ US job listings updated daily, with salaries shown upfront. Filter by title, location, job type, and experience level. No account is required.',
}

// ── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { value: '400k+', label: 'Active listings' },
  { value: '$78K', label: 'Median salary shown' },
  { value: '50',   label: 'States covered' },
 
]

const strengths = [
  {
    icon: DollarSign,
    title: 'Salary on every listing',
    body: 'No "competitive salary" guessing games. Every job on Oh My Job displays a pay range before you click so you apply with numbers in hand.',
  },
  {
    icon: Search,
    title: 'No account required',
    body: 'Browse freely. Search like you would Google and create a profile only when you decide it makes sense.',
  },
  {
    icon: Zap,
    title: 'Multi-source in real time',
    body: 'We pull from multiple job feeds across all 50 states and deduplicate in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'AI-assisted matching',
    body: 'Our matching layer surfaces roles that fit your actual skills and situation.',
  },
]

const credentialFeatures = [
  { icon: Award,  label: 'Verified skill assessments' },
  { icon: Globe,  label: 'Open credential standards' },
  { icon: ShieldCheck, label: 'Anti-fraud verification' },
  { icon: Users,  label: 'Portable across employers' },
]

const categories = [
  { label: 'Engineering',  icon: Code2,      bg: 'bg-blue-600',   what: 'software engineer', image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Design',       icon: Palette,    bg: 'bg-pink-600',   what: 'designer',          image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Sales',        icon: DollarSign, bg: 'bg-green-600',  what: 'sales',             image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Operations',   icon: Settings,   bg: 'bg-orange-600', what: 'operations',        image: 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Finance',      icon: BarChart2,  bg: 'bg-purple-600', what: 'finance',           image: 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Marketing',    icon: TrendingUp, bg: 'bg-yellow-600', what: 'marketing',         image: 'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Healthcare',   icon: Heart,      bg: 'bg-red-600',    what: 'healthcare',        image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Legal',        icon: Briefcase,  bg: 'bg-slate-600',  what: 'legal',             image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400' },
]

const CATEGORY_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  'Career Advice':    { bg: '#EEF2FF', color: '#2B4ACB' },
  'Interview Tips':   { bg: '#F0FDF4', color: '#16A34A' },
  'Salary Insights':  { bg: '#FFF7ED', color: '#C2410C' },
  'Remote Work':      { bg: '#F0F9FF', color: '#0369A1' },
  'Tech Jobs':        { bg: '#FAF5FF', color: '#7C3AED' },
  'Industry Trends':  { bg: '#FDF2F8', color: '#BE185D' },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const recentArticles = BLOG_ARTICLES.slice(0, 3)
  

  return (
    
    <>
    
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white pt-24 pb-36">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-blue-200 text-sm font-semibold tracking-widest uppercase mb-4">
            Smart job search across all 50 states
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Your next opportunity<br />is one click away
          </h1>
          
          <SearchHero />
        </div>
      </section>

      {/* ── Stats ── */}
<section className="bg-white border-b border-gray-100">
  <div className="max-w-5xl mx-auto px-6 py-12 flex flex-wrap justify-center gap-x-12 gap-y-8">
    {stats.map(({ value, label }) => (
      <div key={label} className="text-center min-w-[100px]">
        <p className="text-4xl font-extrabold text-[#1a2340] tracking-tight">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    ))}
  </div>
</section>

      {/* ── Vision ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-4">Our take</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2340] leading-tight mb-8 tracking-tight">
            Getting a first job shouldn't require having had a first job.
          </h2>
          <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
           
            <p>
              Oh My Job is a job board built on a different premise. Because the best hire isn't always the most experienced one, but rather the most capable one. 
              And the only way to find that person is to actually look at what they can do.
            </p>
          </div>
          <div className="mt-10 flex gap-4 flex-wrap">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-[#1a2340] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#1a2340]/90 transition-colors"
            >
              Browse open roles <ArrowRight size={16} />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold text-sm hover:border-[#1a2340] hover:text-[#1a2340] transition-colors"
            >
              Career resources
            </Link>
          </div>
        </div>
      </section>

      {/* ── Platform strengths ── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">Why Oh My Job</p>
            <h2 className="text-4xl font-bold text-[#1a2340] tracking-tight mb-3">
              Built to get out of your way
            </h2>
            
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {strengths.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-5 items-start p-7 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon className="text-indigo-600" size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a2340] mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Skills & Credentials ── */}
      <section className="bg-[#1a2340] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4">Where we're headed</p>
              <h2 className="text-4xl font-bold text-white leading-tight mb-6 tracking-tight">
                Your skills matters.
              </h2>
              <p className="text-gray-400 leading-relaxed mb-5">
                A résumé tells people what you've done and we want employers to see what you can actually do. 
                That means real skill assessments, verifiable credentials, and badges that carry weight over time, regardless of where you apply next.
              </p>
              <p className="text-gray-400 leading-relaxed mb-10">
                We're building a credential layer for Oh My Job aligned with open industry standards, so what you prove here belongs to you and follows you.
                 Our team is currently actively working on integrations with the leading digital credential platforms, and will share details as partnerships are confirmed.
              </p>
              <p className="text-indigo-300 text-sm font-medium">
                Credential partnerships in progress. More soon.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {credentialFeatures.map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Icon className="text-indigo-300" size={20} />
                  </div>
                  <p className="text-white text-sm font-semibold leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For who ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">Who it's for</p>
            <h2 className="text-4xl font-bold text-[#1a2340] tracking-tight">Two sides, one goal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Candidates */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                <Users className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1a2340] mb-3">If you're starting out or switching lanes</h3>
              <p className="text-gray-500 leading-relaxed mb-5">
                Fresh grad, career changer, or someone returning to the workforce after a break. We believe in your potential and the skills you bring.
                The old hiring process just wasn't designed to see them. Oh My Job gives you the tools to show what you're actually capable of.
              </p>
              <Link href="/jobs" className="text-indigo-600 font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Find your role <ArrowRight size={15} />
              </Link>
            </div>

            {/* Employers */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-5">
                <Briefcase className="text-teal-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1a2340] mb-3">If you're hiring and tired of screening the same profiles</h3>
              <p className="text-gray-500 leading-relaxed mb-5">
                The best candidate for your role might not have the most polished résumé. Posting on Oh My Job connects you with people who've actively proven their skills.
                Oh My job saves you time filtering and find better fits. 
              </p>
              <a href="mailto:contact@oh-my-job.com" className="text-teal-600 font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Talk to us <ArrowRight size={15} />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── Browse categories ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">Explore by field</p>
            <h2 className="text-4xl font-bold text-[#1a2340] tracking-tight mb-3">Browse top job categories</h2>
            <p className="text-gray-500">From software engineering to healthcare, find opportunities across every industry.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {categories.map(({ label, icon: Icon, bg, what, image }) => (
              <a
                key={label}
                href={`/jobs?what=${encodeURIComponent(what)}`}
                className={`relative overflow-hidden rounded-2xl h-32 flex flex-col items-start p-5 group`}
              >
                <img src={image} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
                <div className={`absolute inset-0 ${bg} opacity-75 group-hover:opacity-85 transition-opacity`} />
                <div className="relative z-10 flex flex-col gap-2.5">
                  <Icon className="text-white drop-shadow" size={22} />
                  <span className="text-sm font-bold text-white drop-shadow">{label}</span>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-4">
            <a
              href="/jobs"
              className="border border-[#1a2340] text-[#1a2340] rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-[#1a2340] hover:text-white transition-colors inline-block"
            >
              View all jobs
            </a>
          </div>
        </div>
      </section>

      {/* ── Blog preview ── */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-2">Career resources</p>
              <h2 className="text-3xl font-bold text-[#1a2340] tracking-tight">From the blog</h2>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors">
              All articles <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {recentArticles.map(article => {
              const badge = CATEGORY_BADGE_COLORS[article.category] || { bg: '#F3F4F6', color: '#374151' }
              return (
                <Link
                  key={article.slug}
                  href={article.url}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all flex flex-col gap-4"
                >
                  <span
                    style={{ background: badge.bg, color: badge.color }}
                    className="self-start text-xs font-semibold px-2.5 py-1 rounded-md"
                  >
                    {article.category}
                  </span>
                  <h3 className="font-semibold text-[#1a2340] leading-snug text-base">{article.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{article.excerpt}</p>
                  <span className="text-indigo-600 text-sm font-semibold inline-flex items-center gap-1">
                    Read more <ArrowRight size={13} />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="bg-gradient-to-br from-indigo-700 to-blue-600 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-blue-200 uppercase mb-4">Weekly newsletter</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Oh My News
          </h2>
          <p className="text-blue-100 leading-relaxed mb-8 text-base">
            Every Tuesday, one piece from our career resources blog. Practical advice on the employment field & market data.
          </p>
          <NewsletterForm />
          <p className="text-blue-200/60 text-xs mt-5">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </>
  )
}