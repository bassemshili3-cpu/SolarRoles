import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CertificationsNavCta() {
  return (
    <Button
      asChild
      size="sm"
      className="h-7 rounded-full border border-[#E9DAB9] bg-[#FFF8E8] px-3 text-xs font-semibold text-[#563609] shadow-none transition-colors hover:border-[#D6BB81] hover:bg-[#FFF1D6] hover:text-[#3F270B] focus-visible:ring-[#D6BB81] max-[360px]:px-2 max-[360px]:text-[11px] sm:h-9 sm:px-4 sm:text-sm"
    >
      <Link href="/certifications">Certifications</Link>
    </Button>
  )
}
