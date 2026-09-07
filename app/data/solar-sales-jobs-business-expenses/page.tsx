import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Download } from 'lucide-react'
import report from '@/data/sales-costs/report.json'

const URL = 'https://www.solarroles.com/data/solar-sales-jobs-business-expenses'
const TITLE = 'A Solar Sales Job—or a Business You Have to Fund?'
const DESCRIPTION = 'One solar sales listing puts the ad budget on the rep. Six job descriptions show who supplies leads, equipment and income support—and what applicants still need to ask.'
const CSV = `/data/solar-sales-business-expenses-${report.date}.csv`
const image = `${URL}/opengraph-image`

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | Solar Roles` }, description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'article', publishedTime: report.date, images: [{ url: image, width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [image] },
}

const jsonLd = {
  '@context': 'https://schema.org', '@graph': [
    { '@type': 'Report', '@id': `${URL}#report`, headline: TITLE, description: DESCRIPTION, url: URL, image,
      datePublished: report.date, dateModified: report.date,
      author: { '@type': 'Organization', name: 'Solar Roles Research', url: 'https://www.solarroles.com/data' },
      publisher: { '@type': 'Organization', name: 'Solar Roles', url: 'https://www.solarroles.com' }, mainEntity: { '@id': `${URL}#dataset` } },
    { '@type': 'Dataset', '@id': `${URL}#dataset`, name: 'Worker resources and company support in six selected solar sales listings',
      description: report.samplingMethod + ' Source excerpts, advertised responsibilities, company support and unresolved expense questions.',
      url: URL, creator: { '@type': 'Organization', name: 'Solar Roles Research' }, dateModified: report.date,
      temporalCoverage: report.extractedAt, spatialCoverage: 'United States-listed solar sales roles',
      measurementTechnique: 'Title screening and targeted description review, followed by purposive case selection. Expenses, personal resources, prospecting and pay guarantees are assessed separately.',
      distribution: { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `https://www.solarroles.com${CSV}` } },
  ],
}

export default function SolarSalesExpensesReportPage() {
  return <main className="min-h-screen bg-[#F7F7F4] px-5 py-10 text-[#1C2126] sm:px-8 md:py-14">
    <div className="mx-auto max-w-5xl">
      <Link href="/data" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#744600] hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />All solar market data</Link>
      <article aria-labelledby="report-title" className="overflow-hidden rounded-3xl border border-black/10 bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
        <header className="bg-[#1C2126] px-6 py-10 text-white sm:px-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F2A93B]">Solar Roles Research · Sales careers</p>
          <h1 id="report-title" className="mt-5 max-w-4xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">A solar sales job—or a business you have to fund?</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">One solar sales listing puts the advertising budget on the representative. Six job descriptions show how differently companies divide the work, resources and financial risk of making a sale.</p>
          <p className="mt-5 text-sm leading-6 text-white/60">By Solar Roles Research · <time dateTime={report.date}>September 7, 2026</time><br />Six selected cases · Frozen job-description snapshot</p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <a href={CSV} download className="inline-flex items-center gap-2 rounded-full bg-[#F2A93B] px-5 py-3 text-sm font-bold text-[#1C2126] hover:bg-amber-300"><Download className="h-4 w-4" aria-hidden="true" />Download the evidence</a>
            <a href="#case-comparison" className="text-sm font-semibold underline underline-offset-4">Compare the six offers</a>
            <a href="#methodology" className="text-sm underline underline-offset-4">How we selected the cases</a>
          </div>
        </header>

        <div className="px-6 py-9 sm:px-10 sm:py-12">
          <aside aria-label="Scope of this report" className="rounded-2xl border border-amber-200 bg-[#FFF8EC] p-5 text-sm leading-7">
            <strong>These are case studies, not a market estimate.</strong> We selected six descriptions to compare explicit expenses, personal resources, prospecting duties and company support. They do not tell us what share of solar sales jobs requires workers to spend money.
          </aside>

          <section className="mt-10" aria-labelledby="budget-title">
            <h2 id="budget-title" className="text-2xl font-bold tracking-tight">The company runs the campaigns. The rep brings the ad budget.</h2>
            <p className="mt-4 leading-8 text-gray-700">Solar Tech Elec&apos;s Virtual Sales Agents listing offers a company email account, CRM access and proposal software. Its teams handle marketing campaigns and creative work. The source of the advertising money appears in a separate sentence about commission pay.</p>
            <figure className="my-7 rounded-2xl bg-[#1C2126] p-6 text-white sm:p-8">
              <blockquote className="text-xl font-semibold leading-9 sm:text-2xl">“{report.rows[0].evidence[0]}”</blockquote>
              <figcaption className="mt-4 text-sm leading-6 text-white/70">Solar Tech Elec LLC · Virtual Sales Agents · <a href={report.rows[0].sourceUrl} className="text-[#F2A93B] underline underline-offset-4">Employer listing</a></figcaption>
            </figure>
            <p className="mt-4 leading-8 text-gray-700">The description requires a computer and internet access, too. It mentions a marketing-team commission without explaining the payment arrangement. No advertising amount or reimbursement terms are specified, so we cannot calculate the representative&apos;s expenses or take-home earnings.</p>
            <p className="mt-4 leading-8 text-gray-700">For an applicant, the distinction is concrete: access to company sales software does not mean the company supplies the money to attract customers. This listing makes that budget a question to settle before accepting the offer.</p>
          </section>

          <section className="mt-12" aria-labelledby="leads-title">
            <h2 id="leads-title" className="text-2xl font-bold tracking-tight">Generating your own leads does not necessarily mean buying them</h2>
            <p className="mt-4 leading-8 text-gray-700">SolarShoppers asks representatives to find prospects through door-to-door work, referrals, networking and community contacts. SalesDraft Recruiting&apos;s listing for a Powur role also requires personal lead generation and explicitly rules out a base salary, draws and guaranteed income. Neither description states a required advertising purchase or lead fee.</p>
            <p className="mt-4 leading-8 text-gray-700">ATX Solar describes another arrangement: representatives build their own pipeline, then may gain access to supplemental company leads after meeting sales milestones. The description does not give a threshold. An applicant would need to ask what qualifies, how long access takes and whether those leads carry any charge.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">{[
              ['Advertising spend', 'Money allocated to acquiring prospects. Explicitly identified in the Solar Tech Elec case.'],
              ['Personal resources', 'Equipment or transportation a candidate must have. Reimbursement may still be available.'],
              ['Prospecting time', 'Finding potential customers. It can involve unpaid effort without requiring a purchase.'],
            ].map(([title, text]) => <div key={title} className="rounded-2xl border border-gray-200 p-5"><h3 className="font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-gray-600">{text}</p></div>)}</div>
          </section>

          <section className="mt-12" aria-labelledby="support-title">
            <h2 id="support-title" className="text-2xl font-bold tracking-tight">Some offers supply leads—and one spells out a pay floor</h2>
            <p className="mt-4 leading-8 text-gray-700">Exact Solar requires personal transportation but says it supplies leads, does not require door-knocking and provides paid training as necessary. The transportation requirement alone cannot establish whether a representative pays unreimbursed mileage costs.</p>
            <p className="mt-4 leading-8 text-gray-700">Brooklyn SolarWorks combines personal prospecting with company leads. Its description calls the W-2 role commission-only, then expressly guarantees an applicable New York City minimum-wage floor when commissions fall short. It also explains that commissions arrive at booking, installation and final utility approval.</p>
            <p className="mt-4 leading-8 text-gray-700">Those details change the comparison. A commission label does not fully describe the pay arrangement, just as a requirement to find prospects does not fully describe the cost of doing so.</p>
          </section>

          <section id="case-comparison" className="mt-12 scroll-mt-24" aria-labelledby="comparison-title">
            <h2 id="comparison-title" className="text-2xl font-bold tracking-tight">Six offers, with different answers to “who supplies what?”</h2>
            <p className="mt-4 leading-8 text-gray-700">The six selected descriptions separate what the worker brings from the support advertised by the company. An unspecified term remains an open question; it is not evidence that the worker must pay.</p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200" role="region" aria-label="Comparison of six selected solar sales listings" tabIndex={0}>
              <table className="w-full min-w-[760px] text-left text-sm leading-6">
                <caption className="sr-only">Worker responsibilities and company support in six selected listings. Source evidence follows the table.</caption>
                <thead className="bg-[#F7F7F4]"><tr>{['Advertiser / role', 'What the worker brings', 'What the company offers'].map(label => <th key={label} scope="col" className="px-5 py-4 font-bold">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-200">{report.rows.map((row, index) => <tr key={row.id}>
                  <th scope="row" className="min-w-[210px] px-5 py-5 align-top"><a href={`#case-${index + 1}`} className="text-[#744600] underline underline-offset-4">{row.advertiser}</a><span className="mt-2 block font-normal text-gray-600">{row.title}</span></th>
                  <td className="px-5 py-5 align-top text-gray-700">{row.worker}</td><td className="px-5 py-5 align-top text-gray-700">{row.support}</td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="mt-6 space-y-3">{report.rows.map((row, index) => <details key={row.id} id={`case-${index + 1}`} className="scroll-mt-24 rounded-2xl border border-gray-200 p-5">
              <summary className="cursor-pointer font-bold leading-7">{row.advertiser}<span className="mt-1 block text-sm font-normal text-gray-600">{row.category} · Read the source evidence</span></summary>
              <div className="mt-5 space-y-4 text-sm leading-7">
                {row.evidence.map(quote => <blockquote key={quote} className="border-l-2 border-amber-500 pl-4">“{quote}”</blockquote>)}
                <p>{row.interpretation}</p><p className="text-gray-600"><strong>Still unspecified:</strong> {row.unknown}</p>
                <p className="text-xs text-gray-500">Stored location: {row.location} · Source: {row.source} · Retrieved {new Date(row.fetchedAt).toISOString().slice(0, 10)} (UTC)</p>
                <a href={row.sourceUrl} className="inline-flex items-center gap-1 font-semibold text-[#744600] underline">Open the source listing<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
              </div>
            </details>)}</div>
          </section>

          <section className="mt-12" aria-labelledby="questions-title">
            <h2 id="questions-title" className="text-2xl font-bold tracking-tight">Ask for the expense terms before comparing commissions</h2>
            <p className="mt-4 leading-8 text-gray-700">Solar Tech Elec identifies an ad budget without naming an amount; ATX describes access to company leads without naming the sales threshold. A written answer to either question would make the offer easier to assess.</p>
            <ol className="mt-6 space-y-4">{[
              ['What must I pay for?', 'Ask for required ad spend, lead purchases, software charges and any deductions from commissions. Separate mandatory expenses from optional purchases.'],
              ['What does the company supply from day one?', 'Confirm equipment, training and lead access. If support depends on performance, request the threshold and any associated charges.'],
              ['Which expenses are reimbursed?', 'Get the rules for mileage, phone service, equipment and advertising, including approval requirements and payment timing.'],
              ['When is income paid?', 'Ask about guaranteed pay, any draw and its repayment terms, commission milestones, cancellations and chargebacks.'],
              ['Who controls the advertising account?', 'If you fund campaigns, establish who owns the account and leads, how spending is authorized and what happens to unused funds when the relationship ends.'],
            ].map(([title, text], index) => <li key={title} className="flex gap-4 rounded-2xl bg-[#F7F7F4] p-5"><span className="font-bold text-[#744600]" aria-hidden="true">0{index + 1}</span><div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-gray-600">{text}</p></div></li>)}</ol>
          </section>

          <section id="methodology" className="mt-12 scroll-mt-24 border-t border-gray-200 pt-9" aria-labelledby="method-title">
            <h2 id="method-title" className="text-2xl font-bold tracking-tight">How we selected and read the six descriptions</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-gray-600">
              <p>{report.activeRecordsScreened.toLocaleString('en-US')} active, unexpired Solar Roles records were captured at <time dateTime={report.extractedAt}>{report.extractedAt}</time> (September 7 in Paris, September 6 UTC). Deleted and paused records were excluded. The snapshot records database availability, not independent confirmation that every employer was still hiring.</p>
              <p>A title screen for sales, setter, closer, canvass, energy advisor or solar consultant returned {report.titleCandidates} candidate records. This broad screen includes repeated listings and adjacent industries. Targeted searches of the stored descriptions looked for advertising budgets, lead generation, personal equipment or transportation, reimbursement and commission terms.</p>
              <p>We selected {report.caseCount} distinct US-listed solar sales cases to illustrate different arrangements and reviewed their full stored descriptions in context. This is purposive selection, not a complete coding of the {report.titleCandidates} records. Neither that screening count nor the six cases is a denominator for estimating how common worker-funded expenses are.</p>
              <p>HTML was converted to plain text and whitespace normalized. Evidence excerpts were checked against the frozen descriptions. The CSV retains record IDs, source links, source retrieval dates, description hashes, interpretations and unresolved questions. SalesDraft Recruiting is identified as the advertiser for a description naming Powur. Aggregator locations are retained as stored, without treating them as confirmed work territories.</p>
              <p>Only explicit expense wording supports a cash-expense finding. Self-generation of leads, commission-only pay, contractor status and possession of equipment do not establish an out-of-pocket purchase. Missing reimbursement language does not establish that reimbursement is unavailable. The descriptions cannot establish actual spending, earnings, contract terms or employer compliance.</p>
              <p>Source retrieval dates range from August 8 to September 6, 2026. Listings may change or disappear after collection. The primary Solar Tech Elec page was also checked for the advertising-budget wording during preparation. This report measures advertised terms; it does not include employer interviews or worker expense records.</p>
            </div>
            <a href={CSV} download className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#744600] underline"><Download className="h-4 w-4" aria-hidden="true" />Download all six cases and source excerpts (CSV)</a>
          </section>
          <footer className="mt-10 border-t border-gray-200 pt-6 text-sm leading-7 text-gray-600">Cite as: Solar Roles Research, “A Solar Sales Job—or a Business You Have to Fund?”, September 7, 2026. Please describe the findings as selected cases, not an industry-wide rate. <Link href="/contact" className="text-[#744600] underline">Questions or corrections</Link>.</footer>
        </div>
      </article>
    </div>
  </main>
}
