// app/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import SearchHero from '@/components/SearchHero'
import {
  Code2, Palette, DollarSign, Settings, BarChart2,
  TrendingUp, Heart, Briefcase, Search, Zap, ShieldCheck,
  ArrowRight, CheckCircle2, Sparkles, Star,
  ChevronRight, Users, Building2, Globe2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

/* ─────────────────────────────────────────────
   Animated counter hook
   ───────────────────────────────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

/* ─────────────────────────────────────────────
   Fade-in-on-scroll wrapper
   ───────────────────────────────────────────── */
function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Data
   ───────────────────────────────────────────── */
const categories = [
  { label: 'Engineering', icon: Code2, what: 'software engineer', gradient: 'from-blue-500 to-cyan-400' },
  { label: 'Design', icon: Palette, what: 'designer', gradient: 'from-pink-500 to-rose-400' },
  { label: 'Sales', icon: DollarSign, what: 'sales', gradient: 'from-emerald-500 to-green-400' },
  { label: 'Operations', icon: Settings, what: 'operations', gradient: 'from-orange-500 to-amber-400' },
  { label: 'Finance', icon: BarChart2, what: 'finance', gradient: 'from-violet-500 to-purple-400' },
  { label: 'Marketing', icon: TrendingUp, what: 'marketing', gradient: 'from-yellow-500 to-orange-400' },
  { label: 'Healthcare', icon: Heart, what: 'healthcare', gradient: 'from-red-500 to-pink-400' },
  { label: 'Legal', icon: Briefcase, what: 'legal', gradient: 'from-slate-600 to-slate-400' },
]

const stats = [
  { value: 6, suffix: 'M+', label: 'Active job listings', icon: Briefcase },
  { value: 50, suffix: 'K+', label: 'Partner companies', icon: Building2 },
  { value: 200, suffix: 'K+', label: 'Job seekers helped', icon: Users },
  { value: 50, suffix: '', label: 'States covered', icon: Globe2 },
]

const steps = [
  { number: '01', title: 'Tell us what you want', description: 'Enter a job title, skill, or keyword. Add a city or go fully remote. Our AI handles the rest.', icon: Search },
  { number: '02', title: 'We surface the best matches', description: 'No noise. No ghost jobs. We pull from multiple sources and rank by relevance, recency, and salary transparency.', icon: Sparkles },
  { number: '03', title: 'Apply with confidence', description: 'Every listing includes salary data when available. Click through directly to the employer. No middlemen.', icon: CheckCircle2 },
]

const features = [
  { icon: Search, title: 'Smart Search', description: 'Our algorithm surfaces the most relevant opportunities based on your skills, experience, and location — no noise, just the right jobs.', span: 'sm:col-span-2' },
  { icon: DollarSign, title: 'Salary Transparency', description: 'Every listing includes salary ranges so you can apply with confidence and negotiate from a position of knowledge.', span: '' },
  { icon: Zap, title: 'Instant Applications', description: 'Apply to hundreds of companies in seconds with direct links to employer pages.', span: '' },
  { icon: ShieldCheck, title: 'Verified & Fresh', description: 'We deprioritize stale listings and inactive employers. What you see is what\'s actually hiring.', span: 'sm:col-span-2' },
]

const testimonials = [
  { name: 'Sarah M.', role: 'UX Designer', location: 'Austin, TX', text: 'I was spending hours on Indeed scrolling through irrelevant results. Oh My Job showed me 12 design roles in Austin within seconds — and every single one had salary info.', rating: 5 },
  { name: 'James K.', role: 'Sales Manager', location: 'Chicago, IL', text: 'The AI search actually understands what I\'m looking for. I typed "B2B sales remote" and got exactly that. No bait-and-switch listings.', rating: 5 },
  { name: 'Priya R.', role: 'Registered Nurse', location: 'Denver, CO', text: 'Finally a job board that doesn\'t waste my time with listings that were posted 3 months ago. Everything here feels current and real.', rating: 5 },
]

/* ─────────────────────────────────────────────
   Component: Category Card
   ───────────────────────────────────────────── */
function CategoryCard({ label, icon: Icon, what, gradient }: typeof categories[0]) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/jobs?what=${encodeURIComponent(what)}`)}
      className="group relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between h-28 text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
      <Icon className="relative z-10 text-white/90" size={22} />
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="text-sm font-semibold text-white">{label}</span>
        <ArrowRight className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" size={16} />
      </div>
    </button>
  )
}

/* ─────────────────────────────────────────────
   Component: Stat Card
   ───────────────────────────────────────────── */
function StatCard({ value, suffix, label, icon: Icon }: typeof stats[0]) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="text-center group">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 mb-4 group-hover:bg-indigo-100 transition-colors">
        <Icon className="text-indigo-600" size={22} />
      </div>
      <p className="text-4xl md:text-5xl font-extrabold text-[#1a2340] tracking-tight">
        {count}{suffix}
      </p>
      <p className="text-sm text-gray-500 mt-2">{label}</p>
    </div>
  )
}

/* ═════════════════════════════════════════════
   PAGE
   ═════════════════════════════════════════════ */
export default function Home() {
  const router = useRouter()

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0f1729] text-white pt-28 pb-36">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[80px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Social proof pill */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-xs text-gray-300 font-medium">10,000+ job searches today</span>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
              Your next career move,
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                found smarter
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
              Search millions of jobs across the US. Real salaries. Fresh listings.
              <br className="hidden sm:block" />
              No ghost jobs. Powered by AI.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <SearchHero />
          </FadeIn>

          {/* Quick links */}
          <FadeIn delay={400}>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              <span className="text-xs text-gray-500">Trending:</span>
              {['Remote', 'Software Engineer', 'Nurse', 'Marketing Manager', 'Data Analyst'].map((term) => (
                <button
                  key={term}
                  onClick={() => router.push(`/jobs?what=${encodeURIComponent(term.toLowerCase())}`)}
                  className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/30 rounded-full px-3 py-1 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs text-center text-gray-400 font-medium tracking-wide uppercase mb-5">
            Aggregating jobs from leading employers across the US
          </p>
          <div className="flex items-center justify-between gap-8 opacity-30 grayscale overflow-hidden">
            {['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'JPMorgan', 'Deloitte'].map((name) => (
              <span key={name} className="text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap select-none flex-shrink-0">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-3">How it works</p>
              <h2 className="text-4xl font-bold text-[#1a2340]">Three steps to your next job</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ number, title, description, icon: Icon }, i) => (
              <FadeIn key={number} delay={i * 150}>
                <div className="relative group">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                  )}
                  <div className="relative z-10 bg-gray-50 group-hover:bg-indigo-50 rounded-2xl p-8 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold text-indigo-400 tracking-wider">{number}</span>
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                        <Icon className="text-indigo-600" size={20} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-[#1a2340] mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 100}>
                <StatCard {...stat} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES (Bento Grid) ── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-3">Why Oh My Job</p>
              <h2 className="text-4xl font-bold text-[#1a2340] mb-4">
                Built for job seekers who<br />value their time
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                We aggregate millions of listings and put salary data front and center so you can focus on what matters.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, description, span }, i) => (
              <FadeIn key={title} delay={i * 100} className={span}>
                <div className="h-full bg-gray-50 hover:bg-indigo-50 rounded-2xl p-8 flex gap-5 items-start transition-colors duration-300 group">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <Icon className="text-indigo-600" size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a2340] mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-3">Explore by field</p>
              <h2 className="text-4xl font-bold text-[#1a2340] mb-4">Browse top job categories</h2>
              <p className="text-gray-500">
                From software engineering to healthcare — find opportunities across every industry.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {categories.map((cat) => (
                <CategoryCard key={cat.label} {...cat} />
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="text-center">
              <button
                onClick={() => router.push('/jobs')}
                className="inline-flex items-center gap-2 border border-[#1a2340] text-[#1a2340] rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#1a2340] hover:text-white transition-all group"
              >
                View all categories
                <ChevronRight className="group-hover:translate-x-0.5 transition-transform" size={16} />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-3">What people say</p>
              <h2 className="text-4xl font-bold text-[#1a2340]">Trusted by thousands of job seekers</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, location, text, rating }, i) => (
              <FadeIn key={name} delay={i * 150}>
                <div className="bg-gray-50 rounded-2xl p-7 flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: rating }).map((_, j) => (
                      <Star key={j} className="text-amber-400 fill-amber-400" size={16} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-6">&ldquo;{text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                      {name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a2340]">{name}</p>
                      <p className="text-xs text-gray-400">{role} · {location}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative overflow-hidden bg-[#0f1729] py-24 px-6">
        <div className="absolute top-[-50%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-50%] right-[20%] w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
              Stop scrolling.<br />Start finding.
            </h2>
            <p className="text-gray-400 mb-10 text-lg">
              Join 200,000+ job seekers who search smarter with Oh My Job.
            </p>
            <button
              onClick={() => router.push('/jobs')}
              className="inline-flex items-center gap-2 bg-white text-[#0f1729] rounded-full px-8 py-3.5 text-sm font-semibold hover:bg-gray-100 transition-colors group"
            >
              Search jobs now
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </FadeIn>
        </div>
      </section>
    </>
  )
}