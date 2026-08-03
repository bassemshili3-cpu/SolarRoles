import Image from 'next/image'
import type { CertificationEntry } from '@/app/certifications/[slug]/certifications-data'

export function CertificationBanner({ cert }: { cert: CertificationEntry }) {
  return (
    <a
      href={cert.heatspringUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative block overflow-hidden rounded-2xl my-8 border border-[#F5B819]/30 hover:border-[#F5B819]/60 transition-colors"
    >
      <Image
        src={cert.bannerImageSrc}
        alt={cert.bannerHeadline}
        width={720}
        height={720}
        className="w-full h-auto"
        sizes="(max-width: 768px) 100vw, 720px"
      />
    </a>
  )
}