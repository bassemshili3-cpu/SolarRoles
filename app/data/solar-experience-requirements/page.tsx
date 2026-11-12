import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Download } from 'lucide-react'
import styles from '../solar-operations-maintenance-workforce/report-press.module.css'
import report from './report.module.css'
import { ANNUAL_ROWS, ANNUAL_YEARS, DISTRIBUTION, DIST_BANDS, DIST_NOTES, ELECTRICIAN_COUNT_WAYS, ELECTRICIAN_COUNT_WAYS_NOTE, ENGINEER_PERIODS, NO_RISE_MARK, changeLabel } from './chart-data'

export const metadata: Metadata = {
  title: 'Experience in Solar Job Postings | Solar Roles Research',
  description: 'How often archived U.S. solar job postings mention at least three years of experience, by occupation and year.',
  robots: { index: true, follow: true },
}

export default function SolarExperienceReport() {
  return (
    <main className={styles.report}>
      <div className={styles.width}>
        <header className={styles.header}>
          <Link href="/data" className={styles.back}><ArrowLeft size={15} /> All research</Link>
        </header>

        <section className={styles.hero}>
          <h1 className={report.heroTitle}>Solar job postings show a wide <span style={{ color: '#176456' }}>experience gap between occupations</span></h1>
          <div className={report.heroStats}>
            <div><strong>68%</strong><span>Project & construction managers</span><small>3+ years detected · 2024–2026</small></div>
            <div><strong>4%</strong><span>Installers</span><small>3+ years detected · 2024–2026</small></div>
          </div>
          <p>In our 2024–2026 archive, our analysis detected three or more years of experience in 68% of distinct project and construction manager postings and 61% of engineering and design postings. For installers, the share was 4%.</p>
          <div className={report.heroGroups}>Distinct postings analyzed: 569 project and construction manager · 628 engineering and design · 290 installer</div>
          <div className={styles.meta}>7,116 distinct U.S. solar job postings · 2020–2026 · Six occupations · 2026 incomplete</div>
          <Link href="/data/solar-experience-requirements/methodology" className={styles.methodCta}>View methodology <ArrowUpRight size={15} /></Link>
        </section>

        <div className={styles.summary}>
          <p>Each percentage shows the share of distinct postings in an occupation where the analysis detected a non-preferred experience figure of three years or more. The number beneath each percentage shows how many distinct postings were analyzed.</p>
        </div>
        <nav className={styles.nav} aria-label="Report sections">
          <a href="#by-occupation">By occupation</a><a href="#years-stated">Years stated</a><a href="#electricians">Electricians</a><a href="#engineers">Engineers over time</a><a href="#the-data">The data</a>
        </nav>

        <section className={styles.section} id="by-occupation">
          <h2>Project management and engineering postings lead on experience mentions</h2>
          <p className={styles.sectionIntro}>Share of distinct postings with three or more years of experience detected, by occupation and year.</p>
          <figure className={`${report.ranking} ${report.annualRanking}`}>
            <figcaption className={report.rankingCaption}>
              <div><span className={report.eyebrow}>Solar Roles research</span><h3>Share of U.S. solar job postings with 3+ years of experience detected</h3><p>By occupation and year · distinct postings in our archive, preferred figures excluded · n = postings analyzed · 2026 incomplete</p></div>
              <span className={report.captionPeriod}>2020–2026</span>
            </figcaption>
            <p className={report.scrollHint}>Swipe to see all years →</p>
            <div className={report.tableScroll} role="region" aria-label="Annual experience table; scroll horizontally for later years" tabIndex={0}>
              <table className={`${report.table} ${report.annualTable}`}>
                <thead><tr><th scope="col">Occupation</th>{ANNUAL_YEARS.map(year => <th scope="col" key={year}>{year === 2026 ? '2026†' : year}</th>)}<th scope="col" className={report.changeCol}>2020–22 → 2024–26</th></tr></thead>
                <tbody>{ANNUAL_ROWS.map(row => (
                  <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((cell, i) => (
                    <td key={ANNUAL_YEARS[i]}>{cell ? <><strong>{cell.pct}%</strong><small className={cell.small ? report.smallN : undefined} aria-label={cell.small ? `${cell.n} postings, fewer than 30` : undefined}>n={cell.n}{cell.small && '*'}</small></> : <><strong>—</strong><small>not reviewed</small></>}</td>
                  ))}<td className={report.changeCell}><span>{changeLabel(row.change)}</span>{row.change.rise && <em className={report.badgeRise}>Rise</em>}</td></tr>
                ))}</tbody>
              </table>
            </div>
            <div className={report.changeKey}>
              <p><em className={report.badgeRise}>Rise</em> An increase between 2020–2022 and 2024–2026 that remains positive across the report’s employer and date checks.</p>
              <p><span className={report.keyMark}>{NO_RISE_MARK}</span> A period comparison that did not meet the “Rise” checks.</p>
              <p><span className={`${report.keyMark} ${report.smallN}`}>*</span> Fewer than 30 postings.</p>
              <p><span className={report.keyMark}>†</span> 2026 is incomplete. <Link href="/data/solar-experience-requirements/methodology#rise">See the methodology for details.</Link></p>
            </div>
            <p className={report.rankingNote}><strong>Source: Solar Roles.</strong></p>
            <div className={report.downloads}><a href="/data/solar-experience-requirements/downloads/ranking.png"><Download size={14} /> Download chart</a><a href="/data/solar-experience-requirements/downloads/ranking.csv"><Download size={14} /> Download CSV</a></div>
          </figure>
          <p className={styles.note}>To check the automated detection, a member of our team also read 50 randomly drawn distinct postings blind. The reading confirmed 24 of the 28 detected three-year thresholds, and none of the 22 postings without a three-year detection asked for three years or more. <Link href="/data/solar-experience-requirements/methodology#checks">See how the checks were done.</Link></p>
        </section>

        <section className={styles.section} id="years-stated">
          <h2>Behind the shares: how many years postings state</h2>
          <p className={styles.sectionIntro}>This chart shows the distribution of detected experience figures across four bands, by occupation and period.</p>
          <figure className={`${report.ranking} ${report.annualRanking}`}>
            <figcaption className={`${report.rankingCaption} ${report.distCaption}`}>
              <div><span className={report.eyebrow}>Solar Roles research</span><h3>U.S. solar job postings by years of experience</h3><p>Share of distinct postings in each band, by occupation and period · largest non-preferred number per posting · 2026 incomplete</p></div>
              <span className={report.captionPeriod}>2020–22 vs 2024–26</span>
            </figcaption>
            <div className={report.distLegend}>{DIST_BANDS.map(b => <span key={b.key}><i className={report[`band_${b.key}`]} />{b.label}</span>)}</div>
            <div className={report.distRows}>
              {DISTRIBUTION.map(row => (
                <div className={report.distRow} key={row.label}>
                  <div className={report.distLabel}>{row.label}</div>
                  <div>{row.periods.map(p => (
                    <div className={report.distLine} key={p.period}>
                      <span className={report.distPeriod}>{p.period}<small>n={p.n}</small></span>
                      <div className={report.distBar} role="img" aria-label={`${row.label}, ${p.period}: ${DIST_BANDS.map(b => `${b.label} ${p.pct[b.key]}%`).join(', ')}`}>
                        {DIST_BANDS.map(b => <span key={b.key} className={`${report[`band_${b.key}`]} ${p.pct[b.key] < 8 ? report.distSmall : ''}`} style={{ width: `${100 * p.counts[b.key] / p.n}%` }} title={`${b.label}: ${p.pct[b.key]}%`}>{p.pct[b.key] >= 4 ? `${p.pct[b.key]}%` : ''}</span>)}
                      </div>
                    </div>
                  ))}</div>
                </div>
              ))}
            </div>
            <p className={report.rankingNote}>{DIST_NOTES.join(' ')} <strong>Source: Solar Roles.</strong></p>
            <div className={report.downloads}><a href="/data/solar-experience-requirements/downloads/distribution.png"><Download size={14} /> Download chart</a><a href="/data/solar-experience-requirements/downloads/distribution.csv"><Download size={14} /> Download CSV</a></div>
          </figure>
          <div className={`${styles.prose} ${report.distProse}`}>
            <p>In 2024–2026, no non-preferred number of years was detected in <strong>68%</strong> of installer postings and <strong>57%</strong> of sales postings. When a number was found, it was mostly under three years (29% and 25% of all postings).</p>
            <p>Among electricians, the share with no non-preferred number fell from <strong>61%</strong> in 2020–2022 to <strong>30%</strong> in 2024–2026, while three or four years rose from 17% to 46%. Under three years barely moved, from 17% to 18%. A posting with no number may still require experience.</p>
          </div>
        </section>

        <section className={styles.section} id="electricians">
          <h2>3+ years detected in 51% of electrician postings; 5+ in 5%</h2>
          <div className={styles.twoColumns}>
            <div className={report.numberPair}>
              <div><strong>51%</strong><span>3+ years detected</span></div>
              <div><strong>5%</strong><span>5+ years detected</span></div>
              <p>384 distinct electrician postings · 2024–2026</p>
            </div>
            <div className={styles.prose}>
              <p>Across 384 distinct electrician postings from 2024–2026, three or four years were detected in <strong>46%</strong>. A further 5% reached the five-year threshold.</p>
              <p>In the archive, the share with three or more years detected rose from <strong>22%</strong> in 2020–2022 to <strong>51%</strong> in 2024–2026, a change labelled “Rise” in the table above.</p>
            </div>
          </div>
          <figure className={report.countWays}>
            <figcaption><h3>Three ways to count the archive</h3><p>Electrician postings with 3+ years detected, 2024–2026</p></figcaption>
            <div className={report.countWaysGrid}>
              {ELECTRICIAN_COUNT_WAYS.map(way => <div key={way.label}><strong>{way.pct}%</strong><span>{way.label}</span><small>{way.basis}</small></div>)}
            </div>
            <p className={report.figureNote}>{ELECTRICIAN_COUNT_WAYS_NOTE}</p>
            <div className={report.figureDownloads}><a href="/data/solar-experience-requirements/downloads/electricians.png"><Download size={14} /> Download chart</a><a href="/data/solar-experience-requirements/downloads/electricians.csv"><Download size={14} /> Download CSV</a></div>
          </figure>
        </section>

        <section className={styles.section} id="engineers">
          <h2>Engineering postings: 44% to 61% with 3+ years detected</h2>
          <div className={styles.twoColumns}>
            <figure className={report.comparison}>
              <figcaption><h3>Engineering and design postings with 3+ years detected</h3><p>Share of distinct postings in each period</p></figcaption>
              {ENGINEER_PERIODS.map(p => <div className={report.compareRow} key={p.period}><span>{p.period}<small>{p.n} postings</small></span><div className={report.barTrack}><div style={{ width: `${p.pct}%` }} /></div><strong>{p.pct}%</strong></div>)}
              <div className={report.figureDownloads}><a href="/data/solar-experience-requirements/downloads/engineers.png"><Download size={14} /> Download chart</a><a href="/data/solar-experience-requirements/downloads/engineers.csv"><Download size={14} /> Download CSV</a></div>
            </figure>
            <div className={styles.prose}>
              <p>The share rose from <strong>44%</strong> of 769 distinct engineering and design postings in 2020–2022 to <strong>61%</strong> of 628 in 2024–2026. The increase remains visible across the report’s alternative counts of employers, sources and posting length, though its size varies.</p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="the-data">
          <h2>From 20,025 records to 7,116 distinct postings</h2>
          <ol className={report.dataFlow} aria-label="How the records become the distinct postings in the table">
            <li><strong>20,025</strong><span>records, 2020–2026</span></li>
            <li><strong>9,732</strong><span>distinct postings, 2020–2026</span></li>
            <li><strong>7,116</strong><span>distinct postings in the six occupations of the table, 2020–2026</span></li>
          </ol>
          <div className={styles.twoColumns}>
            <div className={styles.prose}><p>Identical and near-identical postings from the same employer and year are counted once, as distinct postings. The table covers 7,116 of them across six job families, from installers to project and construction managers, including 2,809 from 2024–2026. Distinct postings are not a count of vacancies or hires.</p></div>
            <div className={styles.prose}><p>Occupations are assigned from job titles. Lead installer, crew lead, foreman and supervisor titles are kept out of the installer row, and the maintenance row focuses on work on systems in operation. <Link href="/data/solar-experience-requirements/methodology">Full methodology, definitions and checks.</Link></p></div>
          </div>
        </section>
        <footer className={styles.footer}><Link href="/data/solar-experience-requirements/methodology">Methodology and sources <ArrowUpRight size={14} /></Link><Link href="/data">Explore more solar research <ArrowUpRight size={14} /></Link></footer>
      </div>
    </main>
  )
}
