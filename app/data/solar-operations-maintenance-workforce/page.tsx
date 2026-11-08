import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import styles from './report-press.module.css'
import ChartTools from './ChartTools'
import { conditions, periods, profiles } from './chart-data'

export const metadata: Metadata = {
  title: 'Solar Maintenance Jobs: More Than Fixing Panels | Solar Roles Research',
  description: 'An exploratory look at the skills, tasks and working conditions described in archived U.S. solar operations and maintenance postings.',
  robots: { index: true, follow: true },
}

const categories = [
  'Diagnosis and repair', 'Electrical work or knowledge', 'Inverters', 'Inspection',
  'Safety procedures', 'Preventive maintenance', 'Documentation',
]


export default function SolarOperationsMaintenanceWorkforce() {
  return (
    <main className={styles.report}>
      <div className={styles.width}>
        <header className={styles.header}>
          <Link href="/data" className={styles.back}><ArrowLeft size={15} /> All research</Link>
          <span className={styles.brand}>SOLAR ROLES <span>RESEARCH</span></span>
        </header>

        <section className={styles.hero}>
          <h1>Solar maintenance jobs: <span>more than fixing panels</span></h1>
          <p>We analysed 13,254 observations of archived U.S. solar job postings, grouped into 4,525 posting-text groups.</p>
          <div className={styles.meta}>387 operations &amp; maintenance groups · Captured 2020–2026 · 80 identified employers</div>
          <Link href="/data/solar-operations-maintenance-workforce/methodology" className={styles.methodCta}>View methodology <ArrowUpRight size={15} /></Link>
        </section>

        <div className={styles.summary}>
          <p>Repair, electrical work and travel recur across this collection of U.S. solar O&amp;M postings. Explicit preventive maintenance is mentioned far less often than fixing faults.</p>
        </div>
        <nav className={styles.nav} aria-label="Report sections">
          <a href="#the-archive">The archive</a><a href="#findings">Key findings</a><a href="#the-work">Tasks and conditions</a><a href="#the-skills">The seven categories</a><a href="#role-profiles">Role comparison</a>
        </nav>

        <section className={styles.section} id="the-archive">
          <h2>O&amp;M rises from 5.8% to 12.2% of groups in the archive</h2>
          <p className={styles.sectionIntro}>A change within our archive, not a measure of national hiring: about half of the increase reflects which employers the archive contains.</p>
          <div className={styles.twoColumns}>
            <figure className={styles.figure}>
              <figcaption><h3>12.2% of groups captured in 2024–26 were classified as O&amp;M</h3><p>Share of selected solar posting-text groups, by capture period.</p></figcaption>
              <div className={styles.chart}>{periods.map(item => <div className={`${styles.barRow} ${styles.periodRow}`} key={item.label}><span>{item.label}<small>{item.count} groups</small></span><div className={styles.track}><div className={styles.fill} style={{ width: `${item.value / 15 * 100}%` }} /></div><strong>{item.value}%</strong></div>)}</div>
              <div className={styles.periodScale}><span>0%</span><span>5%</span><span>10%</span><span>15%</span></div>
              <p className={styles.note}>Groups are dated by capture. 2026 is partial, through October 10. These shares describe the archive, not national hiring.</p>
              <ChartTools id="om-share" />
            </figure>
            <div className={styles.prose}><p>O&amp;M rose from 102 of 1,751 groups to 269 of 2,209. About half of the 6.4-point increase reflects the net change in which employers appeared in the archive; most of the remainder comes from employers present in both periods, including unknown or intermediary employers.</p><p>The share was also higher without the three largest O&amp;M advertisers (7.4% to 11.1%) and when comparing complete years 2021–22 with 2024–25 (5.8% to 11.0%).</p></div>
          </div>
        </section>

        <section className={styles.section} id="findings">
          <h2>71.1% of O&amp;M text groups mention at least four of seven task and knowledge categories</h2>
          <div className={styles.highlights}>
            <div><strong>71.1%</strong><p>mention at least four of seven task and knowledge categories.</p><small>Unadjusted automatic detection</small></div>
            <div><strong>64%</strong><p>mention travel.</p><small>Estimate · adjusted for detector precision</small></div>
            <div><strong>About 4 in 10</strong><p>mention explicit preventive maintenance, against an estimated 90% for diagnosis or repair.</p><small>Estimate · strict blind reading of 40 sampled groups</small></div>
          </div>
          <p className={styles.note}>Based on 387 O&amp;M posting-text groups. Estimated shares use precision checks on small samples. The 71.1% is an automatic detection result; the categories overlap and include duties, requirements and preferred qualifications. Preventive maintenance counts only explicit preventive wording: a strict blind reading of 40 sampled groups gives an estimated 44% (16 of 40 before weighting, 95% interval 26% to 55%), and our detector finds 39.5% of the 387 groups.</p>
        </section>

        <section className={styles.section} id="the-work">
          <h2>An estimated 64% of O&amp;M text groups mention travel</h2>
          <div className={styles.twoColumns}>
            <figure className={styles.figure}>
              <figcaption><h3>Fixing faults is near-universal; physical demands are common</h3><p>Estimated shares across 387 groups, adjusted for detector precision.</p></figcaption>
              <div className={styles.chart}>{conditions.map(item => <div className={styles.barRow} key={item.label}><span>{item.label}</span><div className={styles.track}><div className={styles.fill} style={{ width: `${item.value}%` }} /></div><strong>{item.value}%</strong></div>)}</div>
              <div className={styles.scale}><span>0%</span><span>50%</span><span>100%</span></div>
              <p className={styles.note}>A mention may be required, preferred or state-dependent. These estimates are based on small precision-check samples.</p>
              <ChartTools id="conditions" />
            </figure>
            <figure className={styles.figure} id="role-profiles">
              <figcaption><h3>75% of service groups mention lifting or work at height</h3><p>Unadjusted automatic detections, including preferred qualifications.</p></figcaption>
              <div className={styles.legend}><span><i className={styles.maintenanceSwatch} /> Maintenance · 167 groups</span><span><i className={styles.serviceSwatch} /> Service · 179 groups</span></div>
              {profiles.map(item => <div className={styles.pair} key={item.label}><div className={styles.pairLabel}>{item.label}</div><div className={styles.pairLine}><div className={styles.track}><div className={styles.fill} style={{ width: `${item.maintenance}%` }} /></div><strong>{item.maintenance}%</strong></div><div className={styles.pairLine}><div className={styles.track}><div className={styles.serviceFill} style={{ width: `${item.service}%` }} /></div><strong>{item.service}%</strong></div></div>)}
              <p className={styles.note}>Many maintenance postings concern large sites; service includes work on customer systems and equipment-maker support. Another 41 groups cover operations and monitoring.</p>
              <ChartTools id="role-profiles" />
            </figure>
          </div>
          <p className={styles.note}>Across all 387 groups, an estimated 46% mention inverters and 43% mention a driver’s licence. A licence can be required, preferred or depend on the state.</p>
          <div className={styles.evidence}>
            <blockquote>“Provide onsite troubleshooting and repair of solar systems.”</blockquote>
            <p>Palmetto · Solar Field Service Technician · captured January 2026 · <a href="https://job-boards.greenhouse.io/palmettocleantech/jobs/5044833008" target="_blank" rel="noreferrer">Original posting <ArrowUpRight size={13} /></a></p>
            <p>More examples: <a href="https://web.archive.org/web/20250731224525/https://southwestgen.hrmdirect.com/employment/view.php?req=3474307" target="_blank" rel="noreferrer">Onward Energy, captured 2025</a> · <a href="https://web.archive.org/web/20210227133854/https://jobs.jobvite.com/careers/schneider-electric/job/oHkBefwA" target="_blank" rel="noreferrer">Schneider Electric, captured 2021</a>.</p>
          </div>
        </section>

        <section className={styles.section} id="the-skills">
          <h2>Seven overlapping categories of tasks and knowledge</h2>
          <p className={styles.sectionIntro}>Automatic detection across 387 groups. Each category can appear as a duty, requirement or preferred qualification.</p>
          <ol className={styles.categories}>{categories.map(item => <li key={item}>{item}</li>)}</ol>
          <p className={styles.note}>Categories overlap: troubleshooting an inverter can count in both. Counting one posting per employer and normalized title gives 62.8%.</p>
        </section>


        <footer className={styles.footer} id="methods"><Link href="/data/solar-operations-maintenance-workforce/methodology">Methodology and sources <ArrowUpRight size={14} /></Link><Link href="/data">Explore more solar research <ArrowUpRight size={14} /></Link></footer>
      </div>
    </main>
  )
}
