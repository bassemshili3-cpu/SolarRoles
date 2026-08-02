import { Award, ExternalLink } from 'lucide-react'
import type { CertificationEntry } from '@/app/certifications/[slug]/certifications-data'

export function CertificationBanner({ cert }: { cert: CertificationEntry }) {
  return (
    <a
      href={cert.heatspringUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative overflow-hidden flex items-center gap-4 rounded-2xl border border-[#F5B819]/30 bg-gradient-to-r from-[#0B1A2E] to-[#16273F] p-5 my-8 hover:border-[#F5B819]/60 transition-colors"
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#F5B819]/15 flex items-center justify-center">
        <Award className="text-[#F5B819]" size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white mb-0.5">{cert.bannerHeadline}</p>
        <p className="text-sm text-white/70">{cert.bannerSubtext}</p>
      </div>

      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B1A2E] bg-[#F5B819] px-3 py-1.5 rounded-full group-hover:bg-[#E5A810] transition-colors">
          Get certified <ExternalLink size={12} />
        </span>
        {/* Disclosure d'affiliation — requise des lors que le lien pointe
            directement vers le partenaire remunere plutot que vers une
            page intermediaire du site */}
        <span className="text-[10px] text-white/35">Affiliate link</span>
      </div>
    </a>
  )
}