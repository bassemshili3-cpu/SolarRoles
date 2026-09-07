import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Download } from 'lucide-react'
import SolarRentTable from '@/components/data/SolarRentTable'
import report from '@/data/solar-installer-rent/report.json'

const URL = 'https://www.solarroles.com/data/solar-installer-salary-rent-report'
const TITLE = 'Where Solar Installer Pay Goes Furthest on Rent: 2026'
const DESCRIPTION = 'A one-bedroom rent takes 41 hours of solar installer pay in Albuquerque and 99 in Santa Cruz. Compare salaries and housing costs across 28 US metros.'
const CSV = '/data/solar-installer-rent-2026.csv'
const BLS = 'https://www.bls.gov/oes/special-requests/oesm25ma.zip'
const HUD = 'https://www.huduser.gov/portal/datasets/fmr/fmr2026/FY2026_FMR_Schedule.pdf'
const REVISION = 'https://www.federalregister.gov/documents/2026/04/21/2026-07741/fair-market-rents-for-the-housing-choice-voucher-program-moderate-rehabilitation-single-room'
const image = `${URL}/opengraph-image`

export const metadata: Metadata = {
  title: `${TITLE} | Solar Roles`, description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'article', publishedTime: report.date, modifiedTime: report.date, images: [{ url: image, width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [image] },
}

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const rows = report.rows
const low = rows[0]
const high = rows[rows.length - 1]
const over30 = rows.filter(row => row.rentShare > 30).length
const vegas = rows.find(row => row.area === '29820')!
const sanDiego = rows.find(row => row.area === '41740')!
const chartRows = [...rows.slice(0, 4), ...rows.slice(-4)]
const jsonLd = {
  '@context': 'https://schema.org', '@graph': [
    { '@type': 'Report', '@id': `${URL}#report`, headline: TITLE, description: DESCRIPTION, url: URL, datePublished: report.date, dateModified: report.date, image,
      author: { '@type': 'Organization', name: 'Solar Roles Research', url: 'https://www.solarroles.com/data' },
      publisher: { '@type': 'Organization', name: 'Solar Roles', url: 'https://www.solarroles.com' }, mainEntity: { '@id': `${URL}#dataset` } },
    { '@type': 'Dataset', '@id': `${URL}#dataset`, name: 'Solar installer pay and one-bedroom rent in 28 US metros', description: 'May 2025 BLS median wages matched to FY 2026 HUD one-bedroom Fair Market Rents in 28 metropolitan areas with matching county coverage. Includes work hours and rent as a share of gross annual pay.', url: URL,
      creator: { '@type': 'Organization', name: 'Solar Roles Research' }, dateModified: report.date, spatialCoverage: '28 metropolitan areas in the United States',
      measurementTechnique: 'Monthly one-bedroom Fair Market Rent divided by median gross hourly pay; annual rent divided by median gross annual pay.',
      isBasedOn: [BLS, HUD, REVISION], distribution: { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `https://www.solarroles.com${CSV}` } },
  ],
}

export default function SolarInstallerRentReportPage() {
  return <main className="min-h-screen bg-[#F7F7F4] px-5 py-10 text-[#1C2126] sm:px-8 md:py-14">
    <div className="mx-auto max-w-5xl">
      <Link href="/data" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#744600] hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />All solar market data</Link>
      <article aria-labelledby="report-title" className="overflow-hidden rounded-3xl border border-black/10 bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
        <header className="bg-[#1C2126] px-6 py-10 text-white sm:px-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F2A93B]">Solar Roles Research · Pay &amp; housing</p>
          <h1 id="report-title" className="mt-5 max-w-4xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">Where solar installer pay goes furthest on rent</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">A one-bedroom rent takes {low.rentHours.toFixed(0)} hours of installer pay in Albuquerque and {high.rentHours.toFixed(0)} in Santa Cruz–Watsonville. Across {over30} of the {rows.length} metros compared, it exceeds 30% of a single installer&apos;s median gross pay.</p>
          <p className="mt-5 text-sm text-white/60">By Solar Roles Research · <time dateTime={report.date}>September 5, 2026</time><br />May 2025 wages · FY 2026 rents</p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <a href={CSV} download className="inline-flex items-center gap-2 rounded-full bg-[#F2A93B] px-5 py-3 text-sm font-bold text-[#1C2126] hover:bg-amber-300"><Download className="h-4 w-4" aria-hidden="true" />Download the data</a>
            <a href="#metro-comparison" className="text-sm font-semibold underline underline-offset-4">Find your metro</a>
            <a href="#methodology" className="text-sm text-white/80 underline underline-offset-4">How we calculated it</a>
          </div>
        </header>

        <div className="px-6 py-9 sm:px-10 sm:py-12">
          <div className="grid gap-6 border-b border-gray-200 pb-9 sm:grid-cols-3">
            {[[`${low.rentHours.toFixed(1)} hrs`, 'Albuquerque: lowest rent hours'], [`${high.rentHours.toFixed(1)} hrs`, 'Santa Cruz: highest rent hours'], [`${over30} of ${rows.length}`, 'Metros above 30% of gross pay']].map(([value, label]) => <div key={label}><p className="text-3xl font-bold tracking-tight">{value}</p><p className="mt-2 text-sm text-gray-600">{label}</p></div>)}
          </div>

          <section className="mt-10" aria-labelledby="albuquerque-title">
            <h2 id="albuquerque-title" className="text-2xl font-bold tracking-tight">Albuquerque leads the 28 metros compared</h2>
            <p className="mt-4 text-base leading-8 text-gray-700">{money(low.monthlyRent)} a month covers HUD&apos;s one-bedroom rent benchmark in Albuquerque. At the local median installer wage of ${low.hourlyWage.toFixed(2)} an hour, that amounts to {low.rentHours.toFixed(1)} hours of gross earnings. Bakersfield follows at {rows[1].rentHours.toFixed(1)} hours; Grand Junction comes next at {rows[2].rentHours.toFixed(1)}.</p>
            <p className="mt-4 text-base leading-8 text-gray-700">Santa Cruz–Watsonville sits at the other end. Its {money(high.annualWage)} median annual wage is higher than Albuquerque&apos;s {money(low.annualWage)}, but the one-bedroom rent benchmark reaches {money(high.monthlyRent)}. Rent takes {high.rentHours.toFixed(1)} hours of gross pay there, or about {(high.rentHours / 40).toFixed(1)} 40-hour workweeks.</p>
            <figure className="mt-7 rounded-2xl bg-[#F7F7F4] p-5 sm:p-7">
              <figcaption className="mb-6"><span className="block text-lg font-bold">One month&apos;s rent, measured in work hours</span><span className="mt-1 block text-sm text-gray-600">Four lowest and four highest values among the 28 matched metros. Gross pay, before taxes.</span></figcaption>
              <ol className="space-y-5">{chartRows.map(row => <li key={row.area}>
                <div className="mb-2 flex items-baseline justify-between gap-3 text-sm"><span>{row.metro}</span><strong className="shrink-0 tabular-nums">{row.rentHours.toFixed(1)} hrs</strong></div>
                <div className="h-3 rounded-full bg-gray-200" aria-hidden="true"><div className={`h-3 rounded-full ${row.rentHours > 70 ? 'bg-[#4B5965]' : 'bg-[#D68A1F]'}`} style={{ width: `${row.rentHours / 110 * 100}%` }} /></div>
              </li>)}</ol>
              <p className="mt-6 text-xs leading-5 text-gray-600">Source: Solar Roles calculations using <a className="underline" href={BLS}>BLS OEWS</a> and <a className="underline" href={HUD}>HUD Fair Market Rents</a>. Full results below.</p>
            </figure>
          </section>

          <section className="mt-12" aria-labelledby="vegas-title">
            <h2 id="vegas-title" className="text-2xl font-bold tracking-tight">Las Vegas combines higher pay with a smaller rent bill than San Diego</h2>
            <p className="mt-4 text-base leading-8 text-gray-700">{money(vegas.annualWage)} is the median annual installer wage in Las Vegas, compared with {money(sanDiego.annualWage)} in San Diego. The one-bedroom rent benchmark is lower too: {money(vegas.monthlyRent)} versus {money(sanDiego.monthlyRent)}.</p>
            <p className="mt-4 text-base leading-8 text-gray-700">That leaves a {(sanDiego.rentHours - vegas.rentHours).toFixed(1)}-hour gap in the gross earnings needed for one month&apos;s rent. For someone comparing job offers, both the hourly rate and the local housing bill belong in the calculation. Openings, travel requirements and hours offered still need to be checked separately.</p>
          </section>

          <section id="metro-comparison" className="mt-12 scroll-mt-24" aria-labelledby="comparison-title">
            <h2 id="comparison-title" className="text-2xl font-bold tracking-tight">Compare installer pay and rent in {rows.length} metros</h2>
            <p className="mb-6 mt-4 text-base leading-8 text-gray-700">{over30} metros exceed the 30% benchmark; {rows.length - over30} fall below it. Sort by salary to see how the order changes. Each metro name links to its HUD rent source.</p>
            <SolarRentTable rows={rows} />
            <p className="mt-4 text-sm leading-6 text-gray-600">These are metropolitan areas, which can span several cities and counties. The comparison covers one worker paying the entire one-bedroom rent. It does not measure the share of actual installers who struggle to pay rent.</p>
          </section>

          <section id="methodology" className="mt-12 scroll-mt-24 border-t border-gray-200 pt-9" aria-labelledby="method-title">
            <h2 id="method-title" className="text-2xl font-bold tracking-tight">How we matched pay and rent</h2>
            <p className="mt-4 text-base leading-8 text-gray-700">48 US metropolitan areas have solar installer rows in the May 2025 BLS file, excluding Puerto Rico. We retained 28 whose full county coverage matches a single HUD rent area. The other 20 were excluded because assigning one of their local HUD rents to the entire metro would misstate the geography.</p>
            <dl className="mt-6 space-y-6 text-sm leading-7 text-gray-700">
              <div><dt className="font-bold text-[#1C2126]">Pay: one occupation, two published medians</dt><dd>We use BLS Occupational Employment and Wage Statistics for Solar Photovoltaic Installers (47-2231): the hourly median for work hours and the annual median for the rent share. These are employer-survey estimates, not Solar Roles advertised salaries. They do not cover every solar occupation or self-employed workers. A median is not an entry-level offer. Small local samples can produce uncertain estimates; rank differences are descriptive, not tests of statistical significance.</dd></div>
              <div><dt className="font-bold text-[#1C2126]">Housing: a one-bedroom gross rent benchmark</dt><dd>HUD Fair Market Rent estimates the 40th percentile gross rent for standard-quality units. It includes rent and most tenant-paid utilities; it is not a median asking rent or a quote for an available apartment. We use FY 2026, including the May 21 revision to San Luis Obispo ({money(2036)} for one bedroom). FY 2027 rents are outside this edition.</dd></div>
              <div><dt className="font-bold text-[#1C2126]">Hours and rent share</dt><dd>Hours for rent = monthly one-bedroom FMR ÷ median gross hourly wage. Rent share = monthly FMR × 12 ÷ median gross annual wage × 100. Values are ranked before rounding. The 30% comparison is a stated affordability benchmark for this single-earner scenario, not a measurement of household rent burden. Published hourly and annual wage estimates are rounded independently.</dd></div>
              <div><dt className="font-bold text-[#1C2126]">Coverage and timing</dt><dd>May 2025 wages and FY 2026 rents refer to different periods. We have not projected wages forward or estimated take-home pay. Taxes, food, transport, childcare, benefits, overtime and unpaid weeks are outside the calculation. The 28 metros are the matched sample, not a nationally representative estimate. Los Angeles, New York, Seattle and other metros with split rent geographies are listed in the exclusions download.</dd></div>
            </dl>
            <a href="/data/solar-installer-rent-2026-exclusions.csv" download className="mt-5 inline-block text-sm font-semibold text-[#744600] underline underline-offset-4">Download the 20 excluded metros and the reason</a>
          </section>

          <section className="mt-10 border-t border-gray-200 pt-8" aria-labelledby="sources-title">
            <h2 id="sources-title" className="text-xl font-bold">Sources and data downloads</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">Two federal datasets provide the pay and rent inputs. The BLS county definitions establish the geographic match; HUD&apos;s revision notice updates the affected rent.</p>
            <ul className="mt-4 space-y-3 text-sm text-[#744600] underline underline-offset-4">
              <li><a href={BLS}>BLS: May 2025 metropolitan wage estimates (ZIP)</a></li>
              <li><a href="https://www.bls.gov/oes/area_definitions_m2025.xlsx">BLS: May 2025 area definitions (XLSX)</a></li>
              <li><a href={HUD}>HUD: FY 2026 rent schedule and county coverage (PDF)</a></li>
              <li><a href={REVISION}>HUD: revised FY 2026 rents, effective May 21, 2026</a></li>
              <li><a href={CSV} download>Solar Roles: all 28 metro calculations (CSV)</a></li>
            </ul>
            <p className="mt-6 text-sm leading-7 text-gray-700">For coverage, cite <strong>Solar Roles&apos; 2026 Solar Installer Pay and Rent Report</strong> and link to this page. The CSV includes source links and calculations to four decimal places for checking the findings. <Link href="/contact" className="text-[#744600] underline">Contact Solar Roles</Link> for questions about the analysis.</p>
          </section>
          <div className="mt-9 flex flex-wrap gap-5 border-t border-gray-200 pt-7 text-sm font-bold text-[#744600]">
            <Link href="/solar-pv-installer-jobs" className="inline-flex items-center gap-2 hover:underline">Browse solar installer jobs<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/data/battery-storage-leads-segment-specific-solar-hiring" className="hover:underline">Read our battery storage hiring report</Link>
          </div>
        </div>
      </article>
    </div>
  </main>
}
