'use client'

import { Building2 } from 'lucide-react'
import { getCompanyLogoUrl } from '@/lib/companyLogo'

export default function CompanyLogo({
  company,
  size = 40,
}: {
  company: string
  size?: number
}) {
  return (
    <div
      className="rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={getCompanyLogoUrl(company)}
        alt={company}
        width={size}
        height={size}
        className="w-full h-full object-contain"
        onError={(e) => {
          const target = e.currentTarget
          target.style.display = 'none'
          const fallback = target.nextElementSibling as HTMLElement | null
          fallback?.removeAttribute('hidden')
        }}
      />
      <div hidden className="w-5 h-5">
        <Building2 className="w-full h-full text-slate-400" />
      </div>
    </div>
  )
}