import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Award,
  ChevronRight,
} from 'lucide-react'
import {
  CERTIFICATIONS,
  TOC_SECTIONS,
  getCertificationBySlug,
} from './certifications-data'

const SITE_URL = 'https://www.solarroles.com'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return CERTIFICATIONS.map(c => ({ slug: c.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const cert = getCertificationBySlug(params.slug)
  if (!cert) return {}

  const title = `${cert.name}: Cost, Requirements, and How to Get It | Solar Roles`
  const description = `${cert.whatItIs.slice(0, 140)}...`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/certifications/${cert.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/certifications/${cert.slug}`, type: 'article' },
  }
}

/* ──────────────────────────────────────────────────────────────
   Helpers — Onisep-style building blocks
   ────────────────────────────────────────────────────────────── */

// Title with the gold "souligné" underline (Onisep signature)
function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold text-[#0B1A2E] mb-5 scroll-mt-24"
    >
      {children}
      <span className="block w-12 h-1 bg-[#F5B819] mt-2" />
    </h2>
  )
}

// "Label : valeur" pill (Onisep "Niveau : CAP" style)
function FactPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-sm">
      <span className="text-gray-500">{label} : </span>
      <span className="font-bold text-[#0B1A2E]">{value}</span>
    </div>
  )
}

// Section wrapper that uses the new title
function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <SectionTitle id={id}>{title}</SectionTitle>
      {children}
    </section>
  )
}

// Boxed content (Onisep-style colored border)
function BoxedSection({
  accent = 'navy',
  children,
  className = '',
}: {
  accent?: 'navy' | 'gold'
  children: React.ReactNode
  className?: string
}) {
  const border = accent === 'gold' ? 'border-[#F5B819]' : 'border-[#0B1A2E]'
  return (
    <div className={`border-2 ${border} rounded-xl p-6 ${className}`}>
      {children}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────── */
export default function CertificationPage({ params }: PageProps) {
  const cert = getCertificationBySlug(params.slug)
  if (!cert) notFound()

  return (
    <article className="bg-white">
      {/* ── BREADCRUMB ─────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="bg-gray-50 border-b border-gray-100 py-3 px-6"
      >
        <div className="max-w-6xl mx-auto text-sm text-gray-500 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-[#0B1A2E] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link
            href="/certifications"
            className="hover:text-[#0B1A2E] transition-colors"
          >
            Certifications
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-[#0B1A2E] font-semibold">
            {cert.shortLabel}
          </span>
        </div>
      </nav>

      {/* ── HERO BAND — Onisep-style colored band + white card ── */}
      <section className="bg-[#0B1A2E] text-white py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-block bg-white text-[#0B1A2E] px-7 py-3 rounded-lg shadow-xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {cert.name}
            </h1>
          </div>
          <p className="text-white/80 mt-6 text-lg max-w-2xl leading-relaxed">
            {cert.acronymExpansion}
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {cert.forRoles.map(role => (
              <span
                key={role}
                className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5B819] text-[#0B1A2E]"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN LAYOUT: sticky TOC + main content ───── */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Sticky sidebar TOC */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 px-3">
              On this page
            </p>
            <nav>
              <ul className="space-y-1">
                {TOC_SECTIONS.map(section => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-sm font-medium text-gray-600 hover:text-[#0B1A2E] hover:bg-white px-3 py-2 rounded transition-colors"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main>
          {/* ── QUICK FACTS — Onisep "fiche d'identité" ──────── */}
          <BoxedSection accent="gold" className="mb-10 bg-[#FFFBEB]">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <FactPill label="Format" value={cert.format} />
              <FactPill label="Duration" value={cert.duration} />
              <FactPill label="Typical cost" value={cert.priceRange} />
              <FactPill
                label="Difficulty"
                value={`${cert.difficulty.score}/10`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-[#F5B819]/30">
              All figures editorial estimates. NABCEP and OSHA don't publish
              per-exam difficulty ratings.
            </p>
          </BoxedSection>

          {/* ── WHAT IT IS ──────────────────────────────────── */}
          <Section id="what-it-is" title="What it is">
            <div className="border-l-4 border-[#F5B819] pl-5 space-y-3">
              <p className="text-gray-700 leading-relaxed text-lg">
                {cert.whatItIs}
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                {cert.whyItMatters}
              </p>
            </div>
          </Section>

          {/* ── CAREER PATHS ────────────────────────────────── */}
          <Section id="career-paths" title="Careers it unlocks">
            <p className="text-gray-600 leading-relaxed mb-4">
              In solar specifically, this credential is most relevant for:
            </p>
            <div className="flex flex-wrap gap-2">
              {cert.careerPaths.map(role => (
                <span
                  key={role}
                  className="text-sm font-semibold px-4 py-2 rounded-full bg-[#0B1A2E] text-white"
                >
                  {role}
                </span>
              ))}
            </div>
          </Section>

          {/* ── REQUIREMENTS ────────────────────────────────── */}
          <Section id="requirements" title="Requirements">
            <ul className="space-y-3 bg-gray-50 rounded-xl p-6">
              {cert.requirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-gray-700 leading-relaxed"
                >
                  <CheckCircle2
                    className="text-[#F5B819] flex-shrink-0 mt-1"
                    size={18}
                  />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* ── EXAM FORMAT ─────────────────────────────────── */}
          <Section id="exam-format" title="Exam format & passing score">
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Questions
                </p>
                <p className="text-base font-bold text-[#0B1A2E]">
                  {cert.examFormat.questionCount}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Time allowed
                </p>
                <p className="text-base font-bold text-[#0B1A2E]">
                  {cert.examFormat.duration}
                </p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              {cert.examFormat.format}
            </p>
            <div className="rounded-xl border-2 border-[#F5B819] bg-[#FFFBEB] p-5">
              <p className="text-sm font-bold text-[#0B1A2E] mb-1.5">
                Passing score : {cert.passingScore.scoreDescription}
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {cert.passingScore.detail}
              </p>
            </div>
          </Section>

          {/* ── DIFFICULTY ──────────────────────────────────── */}
          <Section id="difficulty" title="How hard is it">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-[#F5B819] rounded-full"
                  style={{ width: `${cert.difficulty.score * 10}%` }}
                />
              </div>
              <span className="text-lg font-bold text-[#0B1A2E] whitespace-nowrap">
                {cert.difficulty.score}/10
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {cert.difficulty.rationale}
            </p>
            <p className="text-xs text-gray-400 mt-3">
              This score is our editorial estimate based on published pass-rate
              data and requirement complexity — NABCEP and OSHA don't publish
              an official per-exam difficulty rating.
            </p>
          </Section>

          {/* ── COST ────────────────────────────────────────── */}
          <Section id="cost" title="Cost">
            <div className="rounded-xl border-2 border-[#0B1A2E] divide-y divide-gray-100 mb-4 overflow-hidden">
              <div className="flex justify-between items-start p-4">
                <span className="text-sm text-gray-500">Training</span>
                <span className="text-sm font-bold text-[#0B1A2E] text-right max-w-[65%]">
                  {cert.cost.trainingCost}
                </span>
              </div>
              {cert.cost.applicationFee && (
                <div className="flex justify-between items-start p-4">
                  <span className="text-sm text-gray-500">Application fee</span>
                  <span className="text-sm font-bold text-[#0B1A2E] text-right max-w-[65%]">
                    {cert.cost.applicationFee}
                  </span>
                </div>
              )}
              {cert.cost.examFee && (
                <div className="flex justify-between items-start p-4">
                  <span className="text-sm text-gray-500">Exam fee</span>
                  <span className="text-sm font-bold text-[#0B1A2E] text-right max-w-[65%]">
                    {cert.cost.examFee}
                  </span>
                </div>
              )}
              {cert.cost.membershipFee && (
                <div className="flex justify-between items-start p-4">
                  <span className="text-sm text-gray-500">Membership</span>
                  <span className="text-sm font-bold text-[#0B1A2E] text-right max-w-[65%]">
                    {cert.cost.membershipFee}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start p-4 bg-[#F5B819]/15">
                <span className="text-sm font-bold text-[#0B1A2E]">
                  Total estimate
                </span>
                <span className="text-sm font-bold text-[#0B1A2E] text-right max-w-[65%]">
                  {cert.cost.totalEstimate}
                </span>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {cert.cost.notes}
            </p>
          </Section>

          {/* ── REIMBURSEMENT ───────────────────────────────── */}
          {cert.reimbursement.available && (
            <Section id="reimbursement" title="Reimbursement & funding">
              <p className="text-gray-700 leading-relaxed mb-4">
                {cert.reimbursement.summary}
              </p>
              <ul className="space-y-2.5">
                {cert.reimbursement.sources.map((source, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-700 text-sm leading-relaxed"
                  >
                    <DollarSign
                      className="text-[#F5B819] flex-shrink-0 mt-0.5"
                      size={18}
                    />
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* ── SALARY ──────────────────────────────────────── */}
          <Section id="salary" title="What it pays">
            <p className="text-gray-700 leading-relaxed mb-4">
              Live salary data from current listings on Solar Roles for the
              roles this credential unlocks:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {cert.relatedSalaryPages.map(page => (
                <Link
                  key={page.slug}
                  href={`/data/salaries/${page.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-[#F5B819] hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-[#0B1A2E]">
                    {page.label}
                  </span>
                  <ArrowRight size={14} className="text-[#F5B819]" />
                </Link>
              ))}
            </div>
          </Section>

          {/* ── HEATSPRING CTA — boxed Onisep-style ──────────── */}
          <section id="why-heatspring" className="scroll-mt-24 mb-12">
            <BoxedSection accent="gold" className="bg-gradient-to-br from-[#FFFBEB] to-white">
              <p className="text-xs font-bold tracking-widest text-[#B45309] uppercase mb-3">
                Where we'd get it
              </p>
              <h2 className="text-2xl font-bold text-[#0B1A2E] mb-4">
                HeatSpring is our pick for this one
              </h2>
              <ul className="space-y-2.5 mb-6">
                {cert.whyHeatSpring.map((reason, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <CheckCircle2
                      className="text-[#B45309] flex-shrink-0 mt-0.5"
                      size={18}
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
              <a
                href={cert.heatspringUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-2 bg-[#F5B819] hover:bg-[#E5A810] text-[#0B1A2E] px-6 py-3 rounded-full font-bold transition-colors shadow-sm"
              >
                Get started on HeatSpring <ExternalLink size={14} />
              </a>
              <p className="text-xs text-gray-500 mt-4">
                Solar Roles may earn a commission if you enroll through this
                link, at no extra cost to you. It doesn't change our assessment
                above — see our full, unsponsored comparison of{' '}
                <Link
                  href="/resources/nabcep-training-providers-compared"
                  className="underline hover:text-gray-700"
                >
                  training providers
                </Link>{' '}
                if you'd like to weigh other options.
              </p>
            </BoxedSection>
          </section>

          {/* ── EXPIRATION ──────────────────────────────────── */}
          <Section id="renewal" title="Expiration & renewal">
            <div className="rounded-xl border-2 border-gray-100 p-5">
              <p className="text-sm font-bold text-[#0B1A2E] mb-1.5">
                Valid for : {cert.expirationRenewal.validityPeriod}
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {cert.expirationRenewal.renewalRequirement}
              </p>
            </div>
          </Section>

          {/* ── OTHER CERTS ─────────────────────────────────── */}
          <section>
            <SectionTitle>Other certifications</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CERTIFICATIONS.filter(c => c.slug !== cert.slug).map(c => (
                <Link
                  key={c.slug}
                  href={`/certifications/${c.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-[#F5B819] hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-bold text-[#0B1A2E]">
                    {c.shortLabel}
                  </span>
                  <ArrowRight size={14} className="text-[#F5B819]" />
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </article>
  )
}