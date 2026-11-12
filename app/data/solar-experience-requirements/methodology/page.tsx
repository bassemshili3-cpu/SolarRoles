import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import styles from '../../solar-operations-maintenance-workforce/report-press.module.css'
import report from '../report.module.css'
import { NO_RISE_MARK } from '../chart-data'

export const metadata: Metadata = {
  title: 'Methodology | Experience in Solar Job Postings | Solar Roles',
  description: 'How we counted distinct solar job postings and the years of experience detected in them, and how we checked the results.',
  robots: { index: false, follow: false },
}

export default function SolarExperienceMethodology() {
  return (
    <main className={styles.report}>
      <div className={styles.width}>
        <header className={styles.header}>
          <Link href="/data/solar-experience-requirements" className={styles.back}><ArrowLeft size={15} /> Back to report</Link>
        </header>

        <section className={styles.hero}>
          <h1>How we counted experience in solar job postings</h1>
          <p>We reduced 20,025 records to 9,732 distinct postings, then tracked experience figures by occupation and year.</p>
          <ol className={`${report.dataFlow} ${report.dataFlowHero}`} aria-label="Size of the archive">
            <li><strong>20,025</strong><span>records, 2020–2026</span></li>
            <li><strong>9,732</strong><span>distinct postings, 2020–2026</span></li>
            <li><strong>7,116</strong><span>distinct postings in the six occupations of the table, 2020–2026</span></li>
          </ol>
          <div className={styles.meta}>U.S. solar job postings · 2020–2026 archive · 2026 incomplete</div>
        </section>

        <article className={styles.methodArticle}>
          <section>
            <h2>The archive and the comparison</h2>
            <p>Our collection contains 20,025 U.S. solar job posting records captured or supplied by data providers for 2020–2026. The table covers 7,116 distinct postings in six occupations from 2020–2026, including 2,809 dated 2024–2026; each cell shows its count.</p>
            <p>The year is the first capture in our archive when available; otherwise it is the year the data provider created the record. It is not necessarily the posting or hiring date. The 2026 data are incomplete. The mix of sources and employers differs across periods, so changes in the archive do not by themselves establish changes in the solar workforce.</p>
          </section>

          <section>
            <h2>What a distinct posting represents</h2>
            <p>Within each employer and year:</p>
            <ul className={report.methodList}>
              <li>Identical posting texts are counted once, even when their titles differ.</li>
              <li>Near-identical texts are counted once when their normalized titles match and they pass the similarity and difference checks; variants that do not meet these rules remain separate.</li>
              <li>A text observed in another year is counted again in that year.</li>
            </ul>
            <p>We call the result distinct postings; they are the unit used throughout the report. A distinct posting is an analytical unit, not a count of positions or hires. Counting them reduces repeated texts, but it does not remove every possible duplicate or guarantee that one distinct posting represents one opening.</p>
          </section>

          <section>
            <h2>How a posting reaches a threshold</h2>
            <ol className={report.methodList}>
              <li>Automatic rules identify numeric experience figures in the representative text of each distinct posting.</li>
              <li>Figures marked as preferred are excluded.</li>
              <li>For a range such as “3–5 years,” the lower number is used.</li>
              <li>A posting reaches a threshold when at least one eligible figure meets it.</li>
              <li>When the posting offers alternative paths, for example a degree or more years of experience, the highest eligible number of years is counted.</li>
            </ol>
            <p>We tested the last choice: counting the least demanding path instead would change the 2024–2026 shares by about one percentage point.</p>
            <p>The table uses all distinct postings in each occupation as its denominator. A posting with no eligible number detected does not count toward the three- or five-year threshold; it may nevertheless request experience without stating a number, or contain a number the rules miss. It should not be read as requiring no experience. Some figures counted by the rules are alternatives or otherwise not firm requirements, so the percentages are approximate.</p>
            <h3 className={report.methodH3}>The “years stated” chart</h3>
            <p>The blue chart places each distinct posting in one of four bands according to the largest eligible number of years detected in it: no non-preferred number detected, under 3 years, 3–4 years, and 5 years or more. The first band also covers postings where years appear only as preferred. “Under 3 years” includes the rare postings that explicitly state zero years. The chart uses the same postings as the table, so its two upper bands together match the table’s period shares, up to rounding.</p>
            <p>In 2020–2022, 35% to 55% of the distinct postings in each occupation come from data-provider records. In every occupation, these records show no non-preferred number more often than archived postings. Shares are rounded from exact counts, so the four bands of a bar can total 99% or 101%.</p>
          </section>

          <section>
            <h2>Occupations</h2>
            <h3 className={report.methodH3}>How job titles define the six occupations</h3>
            <p>Each distinct posting is assigned to one of six occupations from its job title: project and construction managers, engineers and designers, electricians, maintenance and service (O&amp;M) roles, sales, and installers. The installer row covers 290 distinct postings in 2024–2026.</p>
            <p>Installer titles that name a lead installer, crew lead, foreman or supervisor are tracked separately, with 73 distinct postings in 2024–2026. We keep them out of the installer row so that it describes installation work rather than crew supervision; these supervisory postings ask for experience far more often than other installer postings. We do not show them as a row because, with so few postings, their share depends too much on how employers are weighted.</p>
            <h3 className={report.methodH3}>How we selected maintenance and service roles</h3>
            <p>The maintenance and service line uses a narrower definition intended to describe work on systems already in operation. Generic technician titles without a maintenance term are excluded because their duties are ambiguous.</p>
            <p>We then examined 108 postings whose titles had no maintenance term or only “operations” or “commissioning.” This review was automated: each full text was read and classified case by case against the written definition. It is separate from the blind human reading described below. 99 were excluded, including new-construction commissioning, inspection and factory roles. The review does not establish that every out-of-scope role has been removed: titles with a stronger maintenance or service term were checked on a small sample.</p>
            <p>The targeted review covered 2020–2022 and 2024–2026, not 2023. We omit the maintenance figure for 2023 because eight ambiguous postings in that year have not been reviewed under the same definition. Some annual counts are small; for example, the maintenance figure for 2020 uses 21 postings.</p>
          </section>

          <section id="checks">
            <h2>How we checked the results</h2>
            <h3 className={report.methodH3}>1. Automated checks on full texts</h3>
            <p>Detection and selected occupation classifications were checked on samples of full posting texts through automated readings, separate from the rules that produce the figures. Known detector limits each change the 2024–2026 shares by about 1.5 percentage points or less: some wordings are missed (for example “Experience: 5+ years”), a few pages hold several job postings, and a few ranges glued to a preceding word are read by their upper end. They do not establish the net error in each published share.</p>
            <h3 className={report.methodH3}>2. Blind human reading</h3>
            <p>A member of our team read 50 randomly drawn distinct postings blind, without the detected values or the assigned occupation. In that reading, 24 of the 28 postings where three or more years were detected were confirmed (26 when alternative paths are counted by their highest figure), and none of the 22 postings without a detection asked for three years or more. 40 of the 50 occupations matched the title rule. This sample is small: it shows the direction of errors, not error rates by occupation.</p>
            <h3 className={report.methodH3}>3. Employer and source checks</h3>
            <p>We compared results after changing how employers and repeated titles are counted. For electricians in 2024–2026, the share at three years or more is 51% of distinct postings, but about 34% when the three largest advertisers are removed and 38% when identified employers receive equal weight. These measures answer different questions; they are not the endpoints of a confidence interval.</p>
            <p>Confidence intervals for differences use employer-cluster resampling. They describe sensitivity to the observed employer composition under that procedure, not a national margin of error: this is not a probability sample of U.S. job postings. They do not include detection or occupation-classification errors. An interval that includes zero does not establish that two shares are equal.</p>
            <p>The annual table is descriptive. The robustness checks behind the trend analysis compare pooled periods, 2020–2022 and 2024–2026; they do not establish that each year-to-year difference is meaningful. Employer mix, data sources and how postings are dated can change from year to year. Cells based on fewer than 30 postings are marked with an asterisk (*).</p>
          </section>

          <section id="rise">
            <h2>The “Rise” label</h2>
            <p>A period comparison receives the “Rise” label when the employer-cluster interval is above zero and the difference remains positive across four checks: removing the three largest employers, weighting identified employers equally, using archive capture dates only, and keeping employers present in both periods. The rule was set before the analysis.</p>
            <p>Other comparisons are marked {NO_RISE_MARK}: they did not meet these checks, which does not establish that the share was unchanged. No fall meets the same rule. The 2026 column is marked † because the 2026 data are incomplete.</p>
          </section>
        </article>

        <footer className={styles.footer}><Link href="/data/solar-experience-requirements">Back to report</Link><Link href="/data">Explore more solar research</Link></footer>
      </div>
    </main>
  )
}
