import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import styles from '../report-press.module.css'

export const metadata: Metadata = {
  title: 'Methodology | Solar Operations and Maintenance Workforce | Solar Roles',
  description: 'Data, definitions and checks behind the Solar Roles operations and maintenance workforce report.',
  robots: { index: false, follow: false },
}

export default function SolarOperationsMaintenanceMethodology() {
  return (
    <main className={styles.report}>
      <div className={styles.width}>
        <header className={styles.header}>
          <Link href="/data/solar-operations-maintenance-workforce" className={styles.back}><ArrowLeft size={15} /> Back to report</Link>
          <span className={styles.brand}>SOLAR ROLES <span>RESEARCH</span></span>
        </header>

        <section className={styles.hero}>
          <h1>Methodology and sources</h1>
          <p>How we collected, grouped and analysed the job postings in “Solar maintenance jobs: more than fixing panels”.</p>
          <div className={styles.meta}>U.S. solar operations and maintenance · Captures from 2020–2026</div>
        </section>

        <article className={styles.methodArticle}>
          <section>
            <h2>The collection</h2>
            <p>We analysed 13,254 observations grouped into 4,525 solar posting-text groups, including pages preserved by the Internet Archive. Of these, 387 groups were classified as operations and maintenance (O&amp;M), with 80 identified employers. The O&amp;M groups include 167 maintenance, 179 service, 22 operations and 19 monitoring groups.</p>
            <p>Dates refer to when a page was captured, not necessarily when its job was posted. The 2026 period is partial through October 10.</p>
          </section>

          <section>
            <h2>What we count</h2>
            <p>We group repeated and similar posting texts within an employer and year. A text group is an analytical unit, not necessarily a distinct opening or a person hired. The 387 O&amp;M groups correspond to about 223 employer–title combinations; this alternative grouping does not reliably count distinct openings either.</p>
            <p>The collection is not representative of the U.S. labour market. Employers, pages and sources vary over time, and classification misses some O&amp;M postings. Their number could not be estimated reliably enough to correct the shares.</p>
          </section>

          <section>
            <h2>Classifying postings and detecting mentions</h2>
            <p>Python scripts apply explicit rules to classify O&amp;M postings and detect mentions of tasks, knowledge and working conditions in job descriptions. Company presentations, benefits, legal text and recruiters’ keyword lists are excluded. Mentions can be duties, requirements or preferred qualifications; they describe what appears in a posting rather than everything a worker does.</p>
            <p>The seven categories are diagnosis and repair, electrical work or knowledge, inverters, inspection, safety procedures, preventive maintenance and documentation. They overlap: a sentence about troubleshooting an inverter can count in both diagnosis and inverters. Monitoring software is not included because its detection was not reliable enough.</p>
          </section>

          <section>
            <h2>Detection results and estimates</h2>
            <p>The 71.1% figure is the unadjusted automatic detection result for groups mentioning at least four of the seven categories. It is not a guaranteed minimum. Counting one posting per employer and normalized title gives 62.8%; postings sharing an employer and title are not necessarily identical advertisements.</p>
            <p>Figures for diagnosis or repair, inverters, travel, lifting, work at height, driver’s licences and electrician licences are estimates adjusted for detector precision, using verified samples. Those checks rely on small samples. The maintenance and service comparisons use unadjusted automatic detections, including preferred qualifications.</p>
            <p>Preventive maintenance is estimated differently. Two automated blind coders and an adjudicator read 40 sampled O&amp;M postings in full, with nothing highlighted, and a posting counts only when it uses explicit preventive wording; a generic mention of “maintenance” does not count. That strict reading gives an estimated 44% (weighted for how the sample was drawn; 16 of 40 before weighting, 95% interval 26% to 55%). Our detector, which made no false detections in that sample but missed some mentions, finds 39.5% of the 387 groups. A broader reading that counts generic maintenance duties gives about two thirds; a targeted human reading found that the coders over-counted this category under that broader reading.</p>
          </section>

          <section>
            <h2>Checks</h2>
            <p>Targeted checks included blind automated coding and three rounds of human reading across 47 distinct groups. The selection included difficult or influential cases and postings near the four-category threshold; it was not a random sample of the collection.</p>
            <p>Across the two rounds covering the seven categories, all 20 groups detected at four or more were confirmed, including 10 at exactly four. In the final round, the reader saw the passages detected for each category. These checks support the figure but do not measure its accuracy across the full collection or validate every estimate.</p>
          </section>

          <section>
            <h2>Comparing periods</h2>
            <p>The report compares the share of selected solar posting-text groups classified as O&amp;M: 102 of 1,751 in 2020–22, 16 of 565 in 2023 and 269 of 2,209 in 2024–26. The 2023 dip is not yet explained; coverage and classification require further investigation.</p>
            <p>About half of the 6.4-point increase between 2020–22 and 2024–26 reflects the net change in which employers appeared in the archive. The remainder includes changes among employers present in both periods and the pooled group of unidentified or intermediary employers. These are changes in the collection, not estimates of national hiring.</p>
          </section>
        </article>

        <footer className={styles.footer}><Link href="/data/solar-operations-maintenance-workforce"><ArrowLeft size={14} /> Back to report</Link></footer>
      </div>
    </main>
  )
}
