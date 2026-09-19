import type { Metadata } from 'next'
import Link from 'next/link'

import SolarHoursChecker from '@/app/tools/solar-apprenticeship-hours-checker/solar-hours-checker/SolarHoursChecker'
import EmbedHeightReporter from './EmbedHeightReporter'

export const metadata: Metadata = {
  title: 'Solar Apprenticeship Hours Checker Embed | Solar Roles',
  robots: { index: false, follow: false },
}

export default function SolarApprenticeshipHoursCheckerEmbedPage() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-white p-2 text-slate-950 sm:p-4">
      <EmbedHeightReporter />
      <SolarHoursChecker />
      <p className="mt-3 text-right text-[11px] text-slate-500">
        <Link
          href="/tools/solar-apprenticeship-hours-checker"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-slate-800"
        >
          Powered by Solar Roles
        </Link>
      </p>
    </main>
  )
}
