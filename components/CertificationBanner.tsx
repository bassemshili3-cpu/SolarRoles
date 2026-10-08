import type { CertificationEntry } from '@/app/certifications/[slug]/certifications-data'

export function CertificationBanner({ cert }: { cert: CertificationEntry }) {
  return (
    <a
      href={cert.heatspringUrl}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="group relative block overflow-hidden rounded-2xl my-8 border border-[#F5B819]/30 hover:border-[#F5B819]/60 transition-colors"
    >
      <div className="bg-[#0B1A2E] p-5 text-white">
        <p className="text-xs font-semibold text-[#F5B819] mb-3">Free on HeatSpring</p>
        <p className="font-bold leading-snug mb-3">{cert.bannerHeadline}</p>
        <p className="text-sm text-white/80 leading-relaxed">{cert.bannerSubtext}</p>
        <span className="inline-block mt-5 text-sm font-bold text-[#F5B819]">
          {cert.heatspringCtaLabel}
        </span>
      </div>
    </a>
  )
}
