import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, ArrowRight } from 'lucide-react'
import { CERTIFICATIONS } from './[slug]/certifications-data'

export const metadata: Metadata = {
  title: 'Solar Certifications | Solar Roles',
  description:
    'NABCEP, OSHA, and the other certifications that matter for solar installer jobs — what they are, who needs them, and where to get them.',
}

// The featured certs shown as the "bouquin" diploma visuals.
// ⚠️  'nabcep-pvip' is a placeholder slug — vérifie qu'il correspond bien
//     à celui utilisé dans ton fichier certifications-data.ts (ex: 'nabcep-pvip',
//     'pvip', ou 'nabcep-pv-installation-professional' selon ta convention).
const FEATURED_SLUGS = ['nabcep-pv-associate', 'nabcep-pv-installation-professional', 'osha-10', 'osha-30']

type Cert = (typeof CERTIFICATIONS)[number]

export default function CertificationsIndex() {
  const featured = CERTIFICATIONS.filter(c =>
    FEATURED_SLUGS.includes(c.slug)
  )

  return (
    <div className="bg-white">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0B1A2E] text-white py-20 px-6">
        {/* Atmosphere */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#F5B819]/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#F5B819]/10 blur-3xl" />
          {/* Sunburst rays */}
          <svg
            className="absolute inset-0 m-auto h-[140%] w-[140%] text-[#F5B819] opacity-[0.04]"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden
          >
            <g stroke="currentColor" strokeWidth="0.5" strokeLinecap="round">
              {Array.from({ length: 36 }).map((_, i) => {
                const a = (i * 360) / 36
                const r = (a * Math.PI) / 180
                return (
                  <line
                    key={i}
                    x1={100 + Math.cos(r) * 20}
                    y1={100 + Math.sin(r) * 20}
                    x2={100 + Math.cos(r) * 100}
                    y2={100 + Math.sin(r) * 100}
                  />
                )
              })}
            </g>
            <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5B819]/30 bg-[#F5B819]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F5B819] mb-5">
            <Award size={11} strokeWidth={2.5} />
            Solar Certifications
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-5">
            Get the certifications solar employers{' '}
            <span className="text-[#F5B819]">actually ask for.</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            What each one is, which role it's for, and where we'd go to get it.
          </p>
        </div>
      </section>

      {/* ── BOUQUINS — Featured diploma visuals ──────────────── */}
      {featured.length > 0 && (
        <section className="relative bg-gradient-to-b from-white to-gray-50 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-widest text-[#F5B819] uppercase mb-2">
                Top Certifications
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1A2E] mb-3">
                The certifications that open the most doors
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Start with these and you'll qualify for the majority of solar installer roles out there.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(cert => (
                <FeaturedDiploma key={cert.slug} cert={cert} />
              ))}
            </div>
          </div>
        </section>
      )}

      <p className="text-sm text-gray-400 mt-10 text-center max-w-3xl mx-auto px-6 pb-12">
        See our{' '}
        <Link
          href="/resources/solar-certifications-by-job-role"
          className="underline hover:text-gray-600"
        >
          certifications-by-job-role reference table
        </Link>
        .
      </p>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   FEATURED DIPLOMA — big diploma visual for the bouquin section
   ────────────────────────────────────────────────────────────── */
function FeaturedDiploma({ cert }: { cert: Cert }) {
  return (
    <Link
      href={`/certifications/${cert.slug}`}
      className="group relative block overflow-hidden rounded-2xl border-2 border-[#F5B819] bg-gradient-to-br from-white via-[#FFFEF7] to-[#FFF8E1] aspect-[3/4] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#F5B819]/30"
    >
      {/* Gold corner ornaments */}
      <Corner position="tl" />
      <Corner position="tr" />
      <Corner position="bl" />
      <Corner position="br" />

      {/* Inner double border (diploma-style) */}
      <div className="absolute inset-4 rounded-lg border border-[#F5B819]/40 pointer-events-none" />
      <div className="absolute inset-5 rounded-lg border border-dashed border-[#F5B819]/20 pointer-events-none" />

      {/* Decorative top ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F5B819] via-[#FFD96B] to-[#F5B819]" />

      <div className="relative h-full flex flex-col items-center justify-center px-6 py-8 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-[#F5B819] uppercase mb-2">
          Certificate of
        </p>

        <div className="mb-1 flex items-center gap-2 text-[10px] text-[#F5B819]/70">
          <span className="h-px w-6 bg-[#F5B819]/40" />
          <span>★</span>
          <span className="h-px w-6 bg-[#F5B819]/40" />
        </div>

        <h3 className="text-[19px] font-extrabold text-[#0B1A2E] leading-[1.15] mb-2 max-w-[220px]">
          {cert.name}
        </h3>

        <p className="text-[10px] text-gray-500 mb-5 max-w-[200px] leading-relaxed">
          For {cert.forRoles.slice(0, 2).join(' · ')}
        </p>

        {/* Official seal */}
        <div className="relative mb-3">
          <div className="absolute inset-0 rounded-full bg-[#F5B819]/40 blur-lg group-hover:bg-[#F5B819]/60 transition-colors" />
          <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-[#F5B819] via-[#F5B819] to-[#E5A810] flex items-center justify-center shadow-xl ring-4 ring-[#F5B819]/20 transition-transform group-hover:scale-110 group-hover:rotate-6">
            <Award className="text-[#0B1A2E]" size={28} strokeWidth={2.5} />
          </div>
        </div>

        <span className="text-xs font-bold text-[#0B1A2E] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          Read the guide <ArrowRight size={12} />
        </span>
      </div>

      {/* Bottom decorative ribbon */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F5B819] via-[#E5A810] to-[#F5B819]" />
    </Link>
  )
}

/* ──────────────────────────────────────────────────────────────
   Corner ornament helper
   ────────────────────────────────────────────────────────────── */
function Corner({
  position,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
}) {
  const map = {
    tl: 'top-3 left-3 border-l-2 border-t-2',
    tr: 'top-3 right-3 border-r-2 border-t-2',
    bl: 'bottom-3 left-3 border-l-2 border-b-2',
    br: 'bottom-3 right-3 border-r-2 border-b-2',
  }
  return <div className={`absolute w-7 h-7 border-[#F5B819] ${map[position]}`} />
}