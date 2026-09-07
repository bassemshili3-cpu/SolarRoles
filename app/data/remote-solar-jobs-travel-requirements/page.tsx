import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import RemoteTravelTable from '@/components/data/RemoteTravelTable'
import report from '@/data/remote-travel/report.json'

const URL = 'https://www.solarroles.com/data/remote-solar-jobs-travel-requirements'
const TITLE = 'Remote Solar Jobs Can Still Require 90% Travel'
const DESCRIPTION = `${report.travelCount} of ${report.groups} remote-advertised roles reviewed by Solar Roles mentioned travel or site visits. See the requirements, source excerpts and methodology.`
const CSV = `/data/remote-solar-travel-${report.date}.csv`
const image = `${URL}/opengraph-image`
const topEmployer = report.employerConcentration[0]
const sensitivity = report.withoutTopEmployer

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | Solar Roles` }, description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'article', publishedTime: report.extractedAt, modifiedTime: report.extractedAt, images: [{ url: image, width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [image] },
}

const jsonLd = {
  '@context': 'https://schema.org', '@graph': [
    { '@type': 'Report', '@id': `${URL}#report`, headline: TITLE, description: DESCRIPTION, url: URL, image, datePublished: report.extractedAt, dateModified: report.extractedAt,
      author: { '@type': 'Organization', name: 'Solar Roles Research', url: 'https://www.solarroles.com/data' }, publisher: { '@type': 'Organization', name: 'Solar Roles', url: 'https://www.solarroles.com' }, mainEntity: { '@id': `${URL}#dataset` } },
    { '@type': 'Dataset', '@id': `${URL}#dataset`, name: 'Travel disclosures in remote-advertised solar and storage roles, September 2026', description: `A reviewed snapshot of ${report.groups} employer-role combinations from ${report.recordCount} US-listed Solar Roles records. Includes remote evidence, travel wording, percentage qualifiers and source links. Not a representative estimate of US employment.`,
      url: URL, creator: { '@type': 'Organization', name: 'Solar Roles Research' }, dateModified: report.extractedAt, temporalCoverage: report.date, spatialCoverage: 'United States-listed roles',
      measurementTechnique: 'Keyword screening of stored job descriptions followed by contextual review and employer-role grouping. Stated percentages, ranges and ceilings are kept separate.',
      distribution: { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `https://www.solarroles.com${CSV}` } },
  ],
}

const categories = [
  ['A consistent travel percentage', report.categoryCounts.quantified],
  ['Travel or site visits, without a percentage', report.categoryCounts.unquantified],
  ['Conflicting travel percentages', report.categoryCounts.conflicting],
  ['Field work, without a travel schedule', report.categoryCounts.field],
  ['Ambiguous office-attendance wording', report.categoryCounts.office],
  ['No travel or attendance requirement identified', report.categoryCounts.not_stated],
] as const
const examples = ['Cypress Creek Renewables', 'Hanwha Convergence USA', 'RES', 'ENGIE'].map(company => report.rows.find(row => row.company === company && row.travelKind === 'quantified')!)

export default function RemoteSolarTravelReportPage() {
  return <main className="min-h-screen bg-[#F7F7F4] px-5 py-10 text-[#1C2126] sm:px-8 md:py-14">
    <div className="mx-auto max-w-5xl">
      <Link href="/data" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#744600] hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />All solar market data</Link>
      <article aria-labelledby="report-title" className="overflow-hidden rounded-3xl border border-black/10 bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
        <header className="bg-[#1C2126] px-6 py-10 text-white sm:px-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F2A93B]">Solar Roles Research · Remote work</p>
          <h1 id="report-title" className="mt-5 max-w-4xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">Remote solar jobs can still require 90% travel</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">{report.travelCount} of {report.groups} remote-advertised roles in our review mentioned travel or site visits. Some described occasional trips. Others called for spending most of the working schedule on the road.</p>
          <p className="mt-5 text-sm leading-6 text-white/60">By Solar Roles Research · <time dateTime={report.date}>September 6, 2026</time><br />Frozen snapshot · US-listed solar, storage and related roles</p>
          <div className="mt-7 flex flex-wrap items-center gap-5"><a href={CSV} download className="inline-flex items-center gap-2 rounded-full bg-[#F2A93B] px-5 py-3 text-sm font-bold text-[#1C2126] hover:bg-amber-300"><Download className="h-4 w-4" aria-hidden="true" />Download the data</a><a href="#role-comparison" className="text-sm font-semibold underline underline-offset-4">See the roles</a><a href="#methodology" className="text-sm underline underline-offset-4">How we reviewed the listings</a></div>
        </header>
        <div className="px-6 py-9 sm:px-10 sm:py-12">
          <div className="grid gap-6 border-b border-gray-200 pb-9 sm:grid-cols-3">{[[`${report.travelCount} of ${report.groups}`, 'Reviewed roles mentioning travel or site visits'], [`${report.categoryCounts.quantified}`, 'Roles with a consistent travel percentage'], [`${report.advertisers}`, 'Companies or recruiting advertisers represented']].map(([value,label]) => <div key={label}><p className="text-3xl font-bold">{value}</p><p className="mt-2 text-sm leading-6 text-gray-600">{label}</p></div>)}</div>

          <section className="mt-10" aria-labelledby="road-title">
            <h2 id="road-title" className="text-2xl font-bold tracking-tight">A remote base can come with a field schedule</h2>
            <p className="mt-4 leading-8 text-gray-700">90% travel appears in the description of a QA/QC Solar Technician role at Cypress Creek Renewables. The same description calls the role remote. For a candidate, those two details describe very different parts of the job: where they can be based and where they will spend their workdays.</p>
            <p className="mt-4 leading-8 text-gray-700">Our review found {report.groups} employer-role combinations with a remote offer or label and enough description text to assess. Travel or site visits appeared in {report.travelShare}% of them. That share describes this Solar Roles sample, not the US solar labor market.</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">{examples.map(row => <div key={row.id} className="rounded-2xl border border-gray-200 bg-[#F7F7F4] p-5"><p className="text-2xl font-bold text-[#744600]">{row.travelLabel}</p><p className="mt-2 font-bold">{row.company}</p><p className="mt-1 text-sm leading-6 text-gray-600">{row.title}</p><blockquote className="mt-4 border-l-2 border-amber-500 pl-3 text-sm leading-6">“{row.travelEvidence}”</blockquote><a href={row.sourceUrl} className="mt-3 inline-block text-sm text-[#744600] underline">Source listing</a></div>)}</div>
            <p className="mt-4 text-sm leading-6 text-gray-600">These are advertised expectations, not measured travel. ENGIE&apos;s “up to 85%” is a ceiling. Hanwha&apos;s 60–75% is an approximate range. RES states a required 76–100% range.</p>
          </section>

          <section id="employer-concentration" className="mt-12 scroll-mt-24" aria-labelledby="concentration-title">
            <h2 id="concentration-title" className="text-2xl font-bold tracking-tight">Without {topEmployer.company}, {sensitivity.travelShare}% still mention travel</h2>
            <p className="mt-4 leading-8 text-gray-700">{topEmployer.company} accounts for {topEmployer.groups} of the {report.groups} employer-role combinations ({topEmployer.share}%), the largest share in this sample. {topEmployer.travelCount} of its combinations mention travel or site visits.</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F7F7F4] p-5"><dt className="text-sm text-gray-600">Full reviewed sample</dt><dd className="mt-2 text-2xl font-bold">{report.travelShare}% <span className="text-base font-normal">({report.travelCount} of {report.groups})</span></dd></div>
              <div className="rounded-2xl bg-[#F7F7F4] p-5"><dt className="text-sm text-gray-600">Excluding {topEmployer.company}</dt><dd className="mt-2 text-2xl font-bold">{sensitivity.travelShare}% <span className="text-base font-normal">({sensitivity.travelCount} of {sensitivity.groups})</span></dd></div>
            </dl>
            <p className="mt-4 text-sm leading-7 text-gray-600">The change is {sensitivity.percentagePointChange} percentage points, calculated before rounding the two shares. Travel mentions remain common in the remaining sample. This check removes the largest contributor; it does not correct for the mix of other employers or roles, or make the sample representative of the wider market.</p>
          </section>

          <section className="mt-12" aria-labelledby="disclosures-title">
            <h2 id="disclosures-title" className="text-2xl font-bold tracking-tight">Most travel disclosures did not give a percentage</h2>
            <p className="mt-4 leading-8 text-gray-700">{report.categoryCounts.unquantified} roles mentioned trips or site visits without expressing them as a percentage of working time. Some were specific in another way: a Jobot community-solar role described monthly visits, while a Consolidated Electrical Distributors design role called for visits at least weekly.</p>
            <figure className="mt-6 rounded-2xl bg-[#F7F7F4] p-5 sm:p-7"><figcaption className="mb-6 font-bold">Travel and attendance disclosures in {report.groups} reviewed roles</figcaption><ol className="space-y-5">{categories.map(([label,count]) => <li key={label}><div className="mb-2 flex justify-between gap-4 text-sm"><span>{label}</span><strong className="tabular-nums">{count}</strong></div><div className="h-3 rounded-full bg-gray-200" aria-hidden="true"><div className="h-3 rounded-full bg-[#D68A1F]" style={{ width: `${count / report.groups * 100}%` }} /></div></li>)}</ol><p className="mt-5 text-xs leading-5 text-gray-600">One category per employer-role combination. The first three categories make up the {report.travelCount} roles mentioning travel or site visits. Source: Solar Roles description review, September 6, 2026.</p></figure>
            <p className="mt-5 leading-8 text-gray-700">One Intertek description said both “over 80%” and “up to 80%.” We counted it as mentioning travel and kept it outside the {report.categoryCounts.quantified} consistent percentage disclosures. We did not turn either phrase into a single travel estimate.</p>
          </section>

          <section className="mt-12" aria-labelledby="label-title">
            <h2 id="label-title" className="text-2xl font-bold tracking-tight">“Fully remote” did not always mean no site visits</h2>
            <p className="mt-4 leading-8 text-gray-700">SOLV Energy&apos;s BESS Engineer II description called the role fully remote and also required travel to support project execution. Several commissioning roles carried a remote location label while describing hybrid work and extended stays at project sites.</p>
            <p className="mt-4 leading-8 text-gray-700">A remote label does not establish that an employer promised zero travel. Labels can also come from a recruiting platform or the way a listing was imported. This review measures the wording available on Solar Roles; it does not determine whether an employer misled applicants.</p>
          </section>

          <section id="role-comparison" className="mt-12 scroll-mt-24" aria-labelledby="roles-title"><h2 id="roles-title" className="text-2xl font-bold tracking-tight">Check the requirement behind each remote offer</h2><p className="mt-4 leading-8 text-gray-700">{report.recordCount} listing records were grouped into the {report.groups} combinations below. Open a row to read its remote signal and travel evidence. Source pages may change or close after the snapshot date.</p><RemoteTravelTable rows={report.rows.map(({id,company,title,travelKind,travelLabel,remoteEvidence,remoteSource,travelEvidence,notes,listingCount,sourceUrl,jobUrl}) => ({id,company,title,travelKind,travelLabel,remoteEvidence,remoteSource,travelEvidence,notes,listingCount,sourceUrl,jobUrl}))} /></section>

          <section className="mt-12" aria-labelledby="candidate-title"><h2 id="candidate-title" className="text-2xl font-bold tracking-tight">Ask about nights away before accepting an interview</h2><p className="mt-4 leading-8 text-gray-700">{report.categoryCounts.not_stated} reviewed roles had no explicit travel or attendance requirement we could identify. Silence is not a no-travel guarantee. A useful follow-up is: “How many overnight trips did the person in this role take last quarter, and how long did each trip last?” Ask separately about local site visits, office days and peak construction periods.</p></section>

          <section id="methodology" className="mt-12 scroll-mt-24 border-t border-gray-200 pt-9" aria-labelledby="method-title">
            <h2 id="method-title" className="text-2xl font-bold tracking-tight">How we reviewed the listings</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-gray-700">
              <p><strong>Employer concentration.</strong> {topEmployer.company} contributes {topEmployer.groups} of {report.groups} combinations ({topEmployer.share}%). Removing all of its combinations leaves {sensitivity.travelCount} of {sensitivity.groups} mentioning travel or site visits ({sensitivity.travelShare}%, compared with {report.travelShare}% in the full sample). We use the same grouping and coding rules in both calculations, with one vote per employer-role combination. This is a sensitivity check on employer concentration, not an employer-balanced estimate. <a href="#employer-concentration" className="text-[#744600] underline">Compare the results</a>.</p>
              <p><strong>Snapshot.</strong> We screened {report.activeJobs.toLocaleString('en-US')} active, unexpired, unpaused and undeleted Solar Roles records at 15:05 UTC on September 6, 2026. Titles, locations and original stored descriptions were searched for remote, remotely, work-from-home, work-at-home, home-based, telecommuting, telework and WFH wording. We analyzed the stored source description, not the SEO rewrite.</p>
              <p><strong>Eligibility.</strong> The search returned {report.keywordCandidates} candidates. Contextual review retained explicit role-specific remote offers, conditional remote options, and remote title or location labels. We excluded {report.excludedCandidates} records with Canadian locations or without a qualifying offer, including hybrid-only schedules, remote equipment or isolated sites, negative wording, generic company benefits and ambiguous mentions. A remote label on an otherwise hybrid description stayed in scope because the label itself is part of the candidate-facing information.</p>
              <p><strong>Grouping.</strong> The final analysis covers {report.groups} employer-role combinations from {report.recordCount} listing records and {report.advertisers} companies or recruiting advertisers. The initial grouping produced {report.screenedGroups} combinations; {report.incompleteGroups} was excluded because it contained only a company introduction, leaving {report.groups} for every full-sample statistic, chart and downloadable data row. We grouped repeated company/title variants across locations and listing IDs, including Jobot Solar/EPC title variants, Venture Solar inside-sales variants, and DEPCOM/Koch duplicates. Different commissioning disciplines stayed separate. These are analytical groups, not verified unique vacancies.</p>
              <p><strong>Coding.</strong> Travel includes stated business trips and site visits, whether required or possible, local or overnight. Physical field-work wording and ambiguous office attendance have separate categories. We retained percentage qualifiers and did not convert trip frequency to a percentage. “Up to” is a ceiling, not a minimum or an observed average. No stated requirement was coded as unknown, not zero travel. Classifications were assisted by keyword extraction and contextual review; they have not undergone independent double-coding.</p>
              <p><strong>Limits.</strong> This is a small convenience sample from one job board, including solar, storage and related electrical roles. It includes recruiting firms as well as direct employers. Coverage, source freshness, importing errors and grouping choices can affect the results. Before grouping, {report.recordTravelCount} of {report.recordCount} eligible records mentioned travel or site visits; repeated advertisements therefore change the weighting. No company ranking, national prevalence estimate or claim about actual employee travel is made.</p>
              <p><strong>Data and reuse.</strong> <a href={CSV} className="text-[#744600] underline">Download the reviewed data and source excerpts</a>. Cite “Solar Roles, Remote Solar Jobs Can Still Require 90% Travel, September 6, 2026” and link to this report. For questions or corrections, <Link href="/contact" className="text-[#744600] underline">contact Solar Roles</Link>.</p>
            </div>
          </section>
        </div>
      </article>
    </div>
  </main>
}
