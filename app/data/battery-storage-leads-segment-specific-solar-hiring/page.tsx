import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SolarMarketSegmentsReport from '@/components/data/SolarMarketSegmentsReport'

const SITE_URL = 'https://www.solarroles.com'
const PAGE_PATH = '/data/battery-storage-leads-segment-specific-solar-hiring'
const TITLE = 'Battery Storage Leads Segment-Specific Solar Hiring'
const DESCRIPTION =
  'Battery storage accounted for 47% of 370 unique US solar openings that named a market segment in the title, ahead of utility-scale, commercial and residential solar.'

export const metadata: Metadata = {
  title: `${TITLE} | Solar Roles`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    type: 'article',
    publishedTime: '2026-09-04T00:00:00.000Z',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function SolarMarketSegmentsReportPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F4] px-5 py-10 text-[#1C2126] sm:px-8 md:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/data"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#744600] hover:text-[#1C2126]"
        >
          <ArrowLeft className="h-4 w-4" />
          All solar market data
        </Link>
        <SolarMarketSegmentsReport />
      </div>
    </main>
  )
}

