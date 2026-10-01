'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Award, HardHat, ShieldCheck, Zap, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const NAV_CERTIFICATIONS = [
  {
    slug: 'nabcep-pv-associate',
    label: 'NABCEP PV Associate',
    hook: 'Entry point — no field experience required',
    icon: Award,
  },
  {
    slug: 'nabcep-pv-installation-professional',
    label: 'NABCEP PV Installer',
    hook: 'The credential employers ask for by name',
    icon: HardHat,
  },
  {
    slug: 'osha-10',
    label: 'OSHA 10',
    hook: 'Expected before you set foot on most jobsites',
    icon: ShieldCheck,
  },
  {
    slug: 'osha-30',
    label: 'OSHA 30',
    hook: 'For crew leads and jobsite supervisors',
    icon: Zap,
  },
]

export function CertificationsNavCta() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative inline-flex group"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setOpen(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setOpen(false)
      }}
    >
      <Link href="/certifications">
        <Button
          size="sm"
          className="h-7 rounded-full border border-[#E9DAB9] bg-[#FFF8E8] px-3 text-xs font-semibold text-[#563609] shadow-none transition-colors hover:border-[#D6BB81] hover:bg-[#FFF1D6] hover:text-[#3F270B] focus-visible:ring-[#D6BB81] max-[360px]:px-2 max-[360px]:text-[11px] sm:h-9 sm:px-4 sm:text-sm"
          aria-haspopup="true"
          aria-expanded={open}
        >
          Certifications
        </Button>
      </Link>

      {/* Hover buffer */}
      <div className="absolute left-0 top-full h-3 w-full" />

      {/* Mega-menu */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] w-80
                   bg-[#0B1A2E] border border-white/10 rounded-2xl shadow-2xl p-3
                   transition-all duration-200 ease-out z-50
                   ${open
                     ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                     : 'opacity-0 invisible translate-y-1 pointer-events-none'
                   }`}
      >
        <p className="px-3 pt-2 pb-3 text-[11px] font-bold uppercase tracking-widest text-[#F5B819]">
          Most-requested certifications
        </p>

        <div className="space-y-1">
          {NAV_CERTIFICATIONS.map(({ slug, label, hook, icon: Icon }) => (
            <Link
              key={slug}
              href={`/certifications/${slug}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group/item"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#F5B819]/15 flex items-center justify-center">
                <Icon className="text-[#F5B819]" size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">{label}</span>
                <span className="block text-xs text-white/50 truncate">{hook}</span>
              </span>
              <ArrowRight
                className="ml-auto flex-shrink-0 text-white/30 group-hover/item:text-[#F5B819] group-hover/item:translate-x-0.5 transition-all"
                size={14}
              />
            </Link>
          ))}
        </div>

        <Link
          href="/certifications"
          className="flex items-center justify-center gap-1.5 mt-2 mx-1 py-2.5 rounded-xl text-sm font-semibold text-[#F5B819] hover:bg-white/5 transition-colors border-t border-white/10 pt-3"
        >
          View all certifications <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
