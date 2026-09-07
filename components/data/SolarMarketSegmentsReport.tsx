import { BarChart3, CalendarDays, Check, Download, ExternalLink } from 'lucide-react'

const DOWNLOAD_URL = '/data/solar-hiring-market-segments-2026-09-04.csv'

const SEGMENTS = [
  { name: 'Battery storage', count: 174, share: 47.0, color: '#F2A93B' },
  { name: 'Utility-scale solar', count: 158, share: 42.7, color: '#4B5965' },
  { name: 'Commercial solar', count: 19, share: 5.1, color: '#7F8B94' },
  { name: 'Residential solar', count: 19, share: 5.1, color: '#AAB1B6' },
] as const

const IREC_SEGMENTS = [
  { name: 'Residential', count: '79,633', share: '45%' },
  { name: 'Utility-scale', count: '58,351', share: '33%' },
  { name: 'Commercial', count: '25,823', share: '14%' },
  { name: 'Community solar', count: '14,906', share: '8%' },
] as const

const reportJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Report',
      headline: 'Battery Storage Leads the Solar Jobs That Name a Market Segment',
      description:
        'Battery storage accounted for 47% of 370 unique US solar openings that named a market segment in the title.',
      url: 'https://www.solarroles.com/data/battery-storage-leads-segment-specific-solar-hiring',
      datePublished: '2026-09-04',
      dateModified: '2026-09-04',
      author: {
        '@type': 'Organization',
        name: 'Solar Roles Research',
        url: 'https://www.solarroles.com',
      },
      mainEntity: {
        '@id': 'https://www.solarroles.com/data/battery-storage-leads-segment-specific-solar-hiring#market-segments-dataset',
      },
    },
    {
      '@type': 'Dataset',
      '@id': 'https://www.solarroles.com/data/battery-storage-leads-segment-specific-solar-hiring#market-segments-dataset',
      name: 'Segment-explicit US solar job postings, September 2026',
      description:
        'Counts of unique active US solar job postings that explicitly name battery storage, utility-scale, commercial or residential work in the job title.',
      dateModified: '2026-09-04',
      temporalCoverage: '2026-09-04',
      spatialCoverage: 'United States',
      creator: { '@type': 'Organization', name: 'Solar Roles' },
      distribution: {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `https://www.solarroles.com${DOWNLOAD_URL}`,
      },
    },
  ],
}

export default function SolarMarketSegmentsReport() {
  return (
    <article
      id="battery-storage-market-segments"
      aria-labelledby="market-segments-title"
      className="mb-20 scroll-mt-24"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportJsonLd) }}
      />

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-[#F7F7F4]">
        <header className="bg-[#1C2126] px-6 py-9 text-white sm:px-9 sm:py-11">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold uppercase tracking-[0.14em] text-[#F2A93B]">
            <span className="inline-flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Solar Roles Data Report
            </span>
            <span className="inline-flex items-center gap-2 text-white/55">
              <CalendarDays className="h-4 w-4" />
              September 4, 2026
            </span>
          </div>

          <h1
            id="market-segments-title"
            className="mt-6 max-w-4xl text-3xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-4xl md:text-5xl"
          >
            Battery storage leads the solar jobs that name a market segment
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">
            Of 370 unique US openings with a segment in the job title, 174
            named battery storage. Utility-scale followed with 158. Residential
            and commercial solar each had 19.
          </p>

          <a
            href={DOWNLOAD_URL}
            download
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F2A93B] px-5 py-3 text-sm font-bold text-[#1C2126] transition hover:bg-[#E39A2E] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1C2126]"
          >
            <Download className="h-4 w-4" />
            Download the snapshot
          </a>
        </header>

        <div className="px-6 py-9 sm:px-9 sm:py-11">
          <div className="grid gap-8 border-b border-black/10 pb-10 md:grid-cols-[150px_minmax(0,1fr)]">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#A96300]">
              Key points
            </h2>
            <ul className="space-y-4 text-base leading-7 text-[#3F464B] sm:text-lg sm:leading-8">
              <li className="flex gap-3">
                <Check className="mt-1.5 h-5 w-5 shrink-0 text-[#A96300]" />
                <span>
                  <strong className="text-[#1C2126]">Battery storage represented 47.0%</strong>{' '}
                  of the segment-explicit sample. Utility-scale represented 42.7%.
                </span>
              </li>
              <li className="flex gap-3">
                <Check className="mt-1.5 h-5 w-5 shrink-0 text-[#A96300]" />
                <span>
                  <strong className="text-[#1C2126]">Residential appeared in 19 titles.</strong>{' '}
                  Employers often use a generic title and identify residential
                  work only in the description.
                </span>
              </li>
              <li className="flex gap-3">
                <Check className="mt-1.5 h-5 w-5 shrink-0 text-[#A96300]" />
                <span>
                  <strong className="text-[#1C2126]">This release is a fixed baseline.</strong>{' '}
                  It does not yet measure growth since the residential tax credit expired.
                </span>
              </li>
            </ul>
          </div>

          <figure className="mt-10" aria-labelledby="segment-chart-title">
            <figcaption>
              <h2 id="segment-chart-title" className="text-xl font-bold text-[#1C2126]">
                Battery and utility-scale roles make up nearly 90% of explicit titles
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#666C71]">
                Share of 370 unique active postings whose title names one of the
                four market segments.
              </p>
            </figcaption>

            <div className="mt-8 space-y-6">
              {SEGMENTS.map((segment) => (
                <div key={segment.name}>
                  <div className="mb-2 flex items-baseline justify-between gap-4">
                    <span className="text-sm font-semibold text-[#1C2126]">
                      {segment.name}
                    </span>
                    <span className="font-mono text-sm font-bold tabular-nums text-[#1C2126]">
                      {segment.count}{' '}
                      <span className="text-[#777D82]">({segment.share.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#E2E4E1]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${segment.share}%`,
                        backgroundColor: segment.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-7 border-t border-black/10 pt-5 text-xs leading-5 text-[#777D82]">
              Source: Solar Roles analysis of active US listings. Titles without
              an explicit market segment are excluded.
            </p>
          </figure>

          <div className="mt-12 grid gap-10 border-t border-black/10 pt-10 lg:grid-cols-2">
            <section aria-labelledby="report-finding">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A96300]">
                The finding
              </p>
              <h2 id="report-finding" className="mt-3 text-2xl font-bold leading-tight text-[#1C2126]">
                Storage and utility-scale work send the clearest hiring signal
              </h2>
              <p className="mt-5 leading-7 text-[#4C5358]">
                Battery storage and utility-scale solar accounted for 332 of
                the 370 segment-explicit openings. Together, that is 89.7% of
                the sample.
              </p>
              <p className="mt-4 leading-7 text-[#4C5358]">
                Job-title conventions matter. BESS and utility-scale employers
                tend to name the project type. Residential employers often post
                “Solar Installer,” “Lead Installer” or “Solar Sales
                Representative” and leave the segment to the description.
              </p>
              <p className="mt-4 leading-7 text-[#4C5358]">
                The result measures the signal carried by titles. It does not
                mean residential solar represents only 5.1% of current hiring.
              </p>
            </section>

            <section aria-labelledby="irec-context">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A96300]">
                Census context
              </p>
              <h2 id="irec-context" className="mt-3 text-2xl font-bold leading-tight text-[#1C2126]">
                IREC’s 2024 workforce still leaned residential
              </h2>
              <p className="mt-5 leading-7 text-[#4C5358]">
                Residential firms employed 79,633 people, or 45% of installation
                and project-development employment. Utility-scale firms accounted
                for 58,351 jobs, or 33%.
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white">
                {IREC_SEGMENTS.map((segment) => (
                  <div
                    key={segment.name}
                    className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-black/10 px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="font-semibold">{segment.name}</span>
                    <span className="font-mono tabular-nums text-[#555B60]">{segment.count}</span>
                    <span className="w-9 text-right font-mono font-bold tabular-nums">{segment.share}</span>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm leading-6 text-[#5B6267]">
                The measures are not directly comparable. IREC estimates
                employment from company activity and installation data. Solar
                Roles classifies individual vacancy titles, and IREC measures
                storage separately from these four installation segments.
              </p>
              <a
                href="https://irecusa.org/census-solar-job-trends/"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#8A5200] underline decoration-[#F2A93B] decoration-2 underline-offset-4 hover:text-[#603900]"
              >
                Read the IREC census
                <ExternalLink className="h-4 w-4" />
              </a>
            </section>
          </div>

          <section
            aria-labelledby="maintenance-signal"
            className="mt-12 rounded-2xl border border-black/10 bg-white p-6 sm:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A96300]">
              A second signal
            </p>
            <h2
              id="maintenance-signal"
              className="mt-3 text-2xl font-bold leading-tight text-[#1C2126]"
            >
              A second signal: maintenance hiring
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#4C5358]">
              Strict operations and maintenance roles accounted for 221 of
              1,601 unique Solar Roles openings, or <strong className="text-[#1C2126]">13.8%</strong>.
              IREC counted 21,833 workers at O&amp;M-focused firms in 2024,
              equivalent to 7.8% of the solar workforce.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#FFF8EC] p-5">
                <p className="font-mono text-3xl font-bold tabular-nums text-[#9A5B00]">
                  13.8%
                </p>
                <p className="mt-2 text-sm font-semibold text-[#1C2126]">
                  Solar Roles openings
                </p>
                <p className="mt-1 text-xs leading-5 text-[#666C71]">
                  Strict O&amp;M roles after role review and deduplication
                </p>
              </div>
              <div className="rounded-2xl bg-[#ECEEEC] p-5">
                <p className="font-mono text-3xl font-bold tabular-nums text-[#4B5965]">
                  7.8%
                </p>
                <p className="mt-2 text-sm font-semibold text-[#1C2126]">
                  IREC solar workforce
                </p>
                <p className="mt-1 text-xs leading-5 text-[#666C71]">
                  Workers employed by firms primarily classified as O&amp;M
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-[#5B6267]">
              This is directional evidence, not a stock-to-flow comparison.
              IREC classifies workers by their employer’s primary business;
              Solar Roles classifies the vacancy itself. The Census nevertheless
              points the same way: O&amp;M was the only sector where hiring
              difficulty increased in 2024, and 53% of its positions were newly
              created.
            </p>
            <a
              href="https://irecusa.org/census-workforce-development/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#8A5200] underline decoration-[#F2A93B] decoration-2 underline-offset-4 hover:text-[#603900]"
            >
              See IREC’s workforce findings
              <ExternalLink className="h-4 w-4" />
            </a>
          </section>

          <section aria-labelledby="growth-baseline" className="mt-12 rounded-2xl bg-[#1C2126] p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F2A93B]">
              The next number
            </p>
            <h2 id="growth-baseline" className="mt-3 text-2xl font-bold leading-tight">
              The growth comparison starts with this baseline
            </h2>
            <p className="mt-4 leading-7 text-white/72">
              Solar Roles cannot yet support the claim that battery storage
              postings have grown X% faster than residential solar since the
              federal residential credit expired. The database does not contain
              a stable pre-expiration series built with the same sources and
              deduplication rules.
            </p>
            <p className="mt-4 leading-7 text-white/72">
              Repeating this snapshot will turn that question into a measured
              trend. For now, the defensible finding is narrower: storage is the
              largest category among current titles that name a market segment.
            </p>
          </section>

          <section aria-labelledby="report-methodology" className="mt-12 border-t border-black/10 pt-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A96300]">
              Methodology
            </p>
            <h2 id="report-methodology" className="mt-3 text-2xl font-bold text-[#1C2126]">
              How Solar Roles built the sample
            </h2>
            <dl className="mt-7 space-y-6 text-sm leading-6 text-[#4C5358]">
              <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
                <dt className="font-bold text-[#1C2126]">Universe</dt>
                <dd>
                  1,896 active US listings on September 4, 2026, collected from
                  Adzuna and direct employer ATS feeds.
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
                <dt className="font-bold text-[#1C2126]">Deduplication</dt>
                <dd>
                  Employer aliases, normalized titles and job sites reduced the
                  sample to 1,601 unique openings.
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
                <dt className="font-bold text-[#1C2126]">Classification</dt>
                <dd>
                  Only titles that explicitly identified battery storage,
                  utility-scale, commercial or residential work were included.
                  Multiple signals were resolved in that order.
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
                <dt className="font-bold text-[#1C2126]">Excluded</dt>
                <dd>
                  1,231 unique listings did not name one of the four segments.
                  Description-only matches were excluded because company
                  boilerplate can mention unrelated markets.
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
                <dt className="font-bold text-[#1C2126]">Interpretation</dt>
                <dd>
                  Postings measure advertised demand, not employment. One ad can
                  cover several openings, and not every vacancy appears online.
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </article>
  )
}
