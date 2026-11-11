import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import styles from './report-press.module.css'
import ChartTools from './ChartTools'
import OmChart from './OmChart'
import { CHARTS, LICENCE_COUNTS, periods } from './chart-data'

export const metadata: Metadata = {
  title: 'What Solar Maintenance Jobs Ask For | Solar Roles Research',
  description: 'What archived U.S. solar operations and maintenance job postings ask for: electrical skills in 84% of them, a broad mix of other skills, and an electrician licence required in 9%.',
  robots: { index: true, follow: true },
}


export default function SolarOperationsMaintenanceWorkforce() {
  return (
    <main className={styles.report}>
      <div className={styles.width}>
        <header className={styles.header}>
          <Link href="/data" className={styles.back}><ArrowLeft size={15} /> All research</Link>        </header>

        <section className={styles.hero}>
          <h1>What solar maintenance jobs <span>ask for</span></h1>
          <p>Electrical skills appear in 84% of the solar operations and maintenance postings we analysed. Only 9% make an electrician licence a condition of the job.</p>
          <div className={styles.meta}>387 O&amp;M postings among 4,525 archived U.S. solar postings · Captured 2020–2026 · 80 identified employers · Selected cases checked by human review</div>
          <Link href="/data/solar-operations-maintenance-workforce/methodology" className={styles.methodCta}>View methodology <ArrowUpRight size={15} /></Link>
        </section>

        <div className={styles.summary}>
          <p>Beyond electrical work, these postings ask for digital tools and software (63%), mechanical skills (44%) and batteries or energy storage (43%). Where an electrician licence appears, it is usually a plus or depends on the state. In our archive, O&amp;M’s share of solar postings rose from 5.8% in 2020–22 to 12.2% in 2024–26.</p>
        </div>
        <nav className={styles.nav} aria-label="Report sections">
          <a href="#the-skills">The skills</a><a href="#the-licence">The licence</a><a href="#the-archive">The archive</a>
        </nav>

        <section className={styles.section} id="the-skills">
          <h2>Beyond electrical work, 6 in 10 O&amp;M postings mention digital tools and 4 in 10 batteries</h2>
          <p className={styles.sectionIntro}>For context: O&amp;M was the only solar sector where hiring got harder in 2024, with 23% of O&amp;M employers finding it very difficult to find qualified workers, according to <a href="https://irecusa.org/census-workforce-development/" target="_blank" rel="noreferrer">IREC’s National Solar Jobs Census</a>. Across all sectors, the reason employers cite most often is a lack of experience, training or technical skills. The postings we analysed show what those skills look like.</p>
          <div className={styles.twoColumns}>
            <OmChart chart={CHARTS.skills}><ChartTools id="skills" /></OmChart>
            <div className={styles.prose}>
              <p>A single posting often covers several trades. The Onward Energy posting quoted below asks one technician to monitor, test, troubleshoot and repair the systems of a solar plant, from inverters to transformers, switchgear and trackers.</p>
              <p>That breadth is common: at least four of the seven skill areas are detected in <strong>61.5%</strong> of postings (<Link href="/data/solar-operations-maintenance-workforce/methodology">methodology</Link>), and three in four mention at least three. The pattern holds with a stricter count: keeping one posting per employer and job title, at least four areas still appear in 52.5%.</p>
              <p>Two technician profiles stand out. Maintenance postings, often at large plants, mention mechanical systems three times as often as service postings (70% against 22%) and high or medium voltage nearly four times as often (41% against 11%). Service postings, often on customers’ home systems, more often mention batteries (55% against 30%) and digital tools (69% against 53%).</p>
              <p>Electrical work comes first, in 84% of postings, which raises the question of the licence.</p>
            </div>
          </div>
          <div className={styles.evidence}>
            <blockquote>“Duties include monitoring PV Plant operation through SCADA, commissioning, testing, inspecting, troubleshooting, repairing, and modifying AC and DC solar PV systems, including inverters, PV module arrays, transformers, switchgear, trackers, and metering systems.”</blockquote>
            <p>Onward Energy · Solar Operations &amp; Maintenance Technician II · captured July 2025 · six of the seven skill areas · <a href="https://web.archive.org/web/20250731224525/https://southwestgen.hrmdirect.com/employment/view.php?req=3474307" target="_blank" rel="noreferrer">Archived posting <ArrowUpRight size={13} /></a></p>
          </div>
          <p className={styles.note}>Shares describe mentions detected in archived postings; see the methodology for definitions and checks.</p>
        </section>

        <section className={styles.section} id="the-licence">
          <h2>84% of O&amp;M postings ask for electrical skills; 9% require an electrician licence</h2>
          <div className={styles.twoColumns}>
            <OmChart chart={CHARTS.licence}><ChartTools id="licence" /></OmChart>
            <div className={styles.prose}>
              <p>An electrician licence appears in <strong>{LICENCE_COUNTS.mentioned}</strong> of 387 groups. In most of them it is a plus ({LICENCE_COUNTS.preferred} groups) or depends on the state where the work is done ({LICENCE_COUNTS.stateDependent}). Only {LICENCE_COUNTS.required} make it a condition of the job, {LICENCE_COUNTS.requiredNamedPlace} of them naming the job’s state or city; {LICENCE_COUNTS.other} accept an equivalent or do not say. The share changes little when keeping one posting per employer and job title (9.4%), and it is similar in maintenance and service postings (10% and 11%).</p>
              <p>The work is also mobile and physical. By our estimates, 64% of groups mention travel, 48% lifting, 69% a driver’s licence and 40% work at height.</p>
            </div>
          </div>
          <div className={styles.evidence}>
            <blockquote>“Electrical License (only required in MA, a plus elsewhere)”</blockquote>
            <p>Palmetto · Solar Field Service Technician · captured January 2026 · <a href="https://job-boards.greenhouse.io/palmettocleantech/jobs/5044833008" target="_blank" rel="noreferrer">Original posting <ArrowUpRight size={13} /></a></p>
          </div>
          <p className={styles.note}>Shares describe mentions detected in archived postings; see the methodology for definitions and checks.</p>
        </section>

        <section className={styles.section} id="the-archive">
          <h2>O&amp;M rises from 5.8% to 12.2% of groups in the archive</h2>
          <p className={styles.sectionIntro}>This change describes our archive. <strong>About half</strong> of the increase reflects which employers the archive contains.</p>
          <div className={styles.twoColumns}>
            <figure className={styles.figure}>
              <figcaption><h3>O&amp;M share of archived solar postings, by capture period</h3><p>Posting-text groups classified as O&amp;M, as a share of all selected solar groups captured in each period.</p></figcaption>
              <div className={styles.chart}>{periods.map(item => <div className={`${styles.barRow} ${styles.periodRow}`} key={item.label}><span>{item.label}<small>{item.count} groups</small></span><div className={styles.track}><div className={styles.fill} style={{ width: `${item.value / 15 * 100}%` }} /></div><strong>{item.value}%</strong></div>)}</div>
              <div className={styles.periodScale}><span>0%</span><span>5%</span><span>10%</span><span>15%</span></div>
              <p className={styles.note}>Groups are dated by capture. 2026 is partial, through October 10. These shares describe our archive.</p>
              <ChartTools id="om-share" />
            </figure>
            <div className={styles.prose}><p>O&amp;M rose from <strong>102</strong> of 1,751 groups to <strong>269</strong> of 2,209. About half of the 6.4-point increase reflects the net change in which employers appeared in the archive; most of the remainder comes from employers present in both periods, including unknown or intermediary employers.</p><p>The share was also higher without the three largest O&amp;M advertisers (7.4% to 11.1%) and when comparing complete years 2021–22 with 2024–25 (5.8% to 11.0%). In between, the share fell to 2.8% in 2023, a dip we cannot yet explain.</p></div>
          </div>
        </section>

        <footer className={styles.footer} id="methods"><Link href="/data/solar-operations-maintenance-workforce/methodology">Methodology and sources <ArrowUpRight size={14} /></Link><a href="/reports/solar-om-method.md">Full method note <ArrowUpRight size={14} /></a><Link href="/data">Explore more solar research <ArrowUpRight size={14} /></Link></footer>
      </div>
    </main>
  )
}
