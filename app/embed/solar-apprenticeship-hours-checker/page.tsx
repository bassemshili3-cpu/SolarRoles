import type { Metadata } from 'next'
import Link from 'next/link'

import SolarHoursChecker from '@/app/tools/solar-apprenticeship-hours-checker/solar-hours-checker/SolarHoursChecker'
import EmbedHeightReporter from './EmbedHeightReporter'

export const metadata: Metadata = {
  title: 'Solar Apprenticeship Hours Checker Embed | Solar Roles',
  robots: { index: false, follow: false },
}

export default async function SolarApprenticeshipHoursCheckerEmbedPage({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string | string[];
    state_only?: string | string[];
    accent?: string | string[];
  }>;
}) {
  const params = await searchParams
  const initialState = Array.isArray(params.state) ? params.state[0] : params.state
  const stateOnlyParam = Array.isArray(params.state_only)
    ? params.state_only[0]
    : params.state_only
  const stateOnly = stateOnlyParam === '1' || stateOnlyParam?.toLowerCase() === 'true'
  const accent = Array.isArray(params.accent) ? params.accent[0] : params.accent

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-white p-2 text-slate-950 sm:p-4">
      <EmbedHeightReporter />
      <SolarHoursChecker initialState={initialState} stateOnly={stateOnly} accent={accent} />
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
