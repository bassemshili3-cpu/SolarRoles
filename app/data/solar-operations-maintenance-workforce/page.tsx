import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import styles from './report.module.css'

export const metadata: Metadata = {
  title: 'The People Who Keep Solar Running | Solar Roles Research',
  description: 'An exploratory look at the skills, tasks and working conditions described in archived U.S. solar operations and maintenance postings.',
  alternates: { canonical: 'https://www.solarroles.com/data/solar-operations-maintenance-workforce' },
}

const domains = [
  { name: 'Diagnosis & repair', description: 'Troubleshooting faults and corrective repairs' },
  { name: 'Electrical work', description: 'Electrical systems, testing or knowledge' },
  { name: 'Inverters', description: 'Inverter equipment and systems' },
  { name: 'Inspection', description: 'Equipment or site inspections' },
  { name: 'Safety procedures', description: 'Specific rules such as OSHA or lockout/tagout' },
  { name: 'Preventive maintenance', description: 'Explicit preventive maintenance duties' },
  { name: 'Documentation', description: 'Work orders, reports or maintenance software' },
] as const

const periods = [
  { label: '2020–2022', value: '5.8%', count: '103 / 1,767', width: '36.4%' },
  { label: '2023', value: '2.8%', count: '16 / 576', width: '17.4%' },
  { label: '2024–2026', value: '12.1%', count: '271 / 2,234', width: '75.8%' },
] as const

const archive = {
  palmetto: 'https://job-boards.greenhouse.io/palmettocleantech/jobs/5044833008',
  onward: 'https://web.archive.org/web/20250731224525/https://southwestgen.hrmdirect.com/employment/view.php?req=3474307',
  schneider: 'https://web.archive.org/web/20210227133854/https://jobs.jobvite.com/careers/schneider-electric/job/oHkBefwA',
} as const

export default function SolarOperationsMaintenanceWorkforce() {
  return (
    <main className={styles.report}>
      <div className={styles.preview}><span className={styles.previewDot} /> SOLAR ROLES RESEARCH <span className={styles.previewRule}>/</span> U.S. solar workforce</div>

      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <Link href="/data" className={styles.back}><ArrowLeft size={15} /> ALL RESEARCH</Link>
          <span>SOLAR ROLES <span className={styles.heroSlash}>/</span> RESEARCH</span>
        </div>
        <div className={styles.heroBody}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrowLight}><span className={styles.eyebrowDot} /> THE SOLAR WORKFORCE <span className={styles.eyebrowLine} /> UNITED STATES</div>
            <h1>Who keeps solar <em>running?</em></h1>
            <p className={styles.heroLead}>What 390 groups of archived U.S. job postings tell us about the work of keeping solar installations running.</p>
            <div className={styles.heroMeta}><span>OPERATIONS &amp; MAINTENANCE</span><span>2020–2026</span><span>ARCHIVED POSTINGS</span></div>
            <a href="#the-work" className={styles.heroButton}>Explore the report <ArrowDown size={16} /></a>
          </div>
          <div className={styles.heroArtwork} aria-hidden="true">
            <div className={styles.artOrbit} /><div className={styles.artOrbitTwo} />
            <div className={styles.artTop}><span>FIELD NOTES</span><span>01 — 03</span></div>
            <div className={styles.solarMark}><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            <div className={styles.artBottom}><span>SOLAR ASSETS<br /><strong>IN OPERATION</strong></span><span className={styles.artCoordinate}>WORKFORCE<br />RESEARCH</span></div>
            <div className={styles.artCaption}><span>01</span><p>A closer look at<br />the work after installation.</p></div>
          </div>
        </div>
      </header>

      <nav className={styles.chapterNav} aria-label="Report sections">
        <div className={styles.chapterNavInner}><span>IN THIS REPORT</span><ol><li><a href="#the-work"><small>01</small> The work</a></li><li><a href="#the-skills"><small>02</small> The categories</a></li><li><a href="#role-profiles">The roles</a></li><li><a href="#the-archive"><small>03</small> The archive</a></li><li><a href="#methods"><small>04</small> Methods</a></li></ol></div>
      </nav>

      <section className={styles.scope} aria-label="Study at a glance">
        <div className={styles.width}><div className={styles.scopeGrid}>
          <div><strong>390</strong><span>O&amp;M text groups analysed</span></div>
          <div><strong>80</strong><span>identified employers in those groups</span></div>
          <div><strong>4,577</strong><span>total solar posting groups in the archive</span></div>
          <p>Captured between 2020 and 2026. Groups of similar texts are analytical units; they are not necessarily distinct openings or people hired.</p>
        </div></div>
      </section>

      <section className={styles.intro} id="the-work">
        <div className={styles.width}>
          <div className={styles.sectionLead}><div className={styles.chapterNumber}><span>CHAPTER</span><strong>01</strong></div><div><p className={styles.eyebrow}>AFTER THE PANELS ARE INSTALLED</p><h2>A service visit can start <em>with a fault on an inverter.</em></h2></div></div>
          <div className={styles.introGrid}>
            <div className={styles.introCopy}><p className={styles.largeCopy}>A fault on an inverter. A damaged wire. A system that isn’t producing as expected.</p><p>Solar installations need inspections, repairs and maintenance throughout their working lives. Some people work across large project sites; others return to systems on homes and businesses.</p><p>We examined archived U.S. job postings to see how employers describe the work. A posting captures what was written for a role, not everything a technician does.</p></div>
            <aside className={styles.contextCard}><span className={styles.cardKicker}>THE SOLAR O&amp;M WORKFORCE</span><div className={`${styles.contextStat} ${styles.workforceStat}`}>21,833</div><p>Solar operations and maintenance jobs counted in 2024. The figure covers the O&amp;M sector, including roles beyond technicians.</p><div className={styles.contextFoot}><span>IREC · 2024</span><a href="https://irecusa.org/census-solar-job-trends/" target="_blank" rel="noreferrer">Source <ArrowUpRight size={14} /></a></div></aside>
          </div>
          <div className={styles.readingLine}><span>01 / A POSTING FROM THE ARCHIVE</span><p>Palmetto · Solar Field Service Technician · captured January 2026</p></div>
          <figure className={styles.postingQuote}>
            <div className={styles.quoteMark}>“</div><blockquote>Provide onsite troubleshooting and repair of solar systems.</blockquote>
            <figcaption><span>A responsibility listed in the saved description</span><a href={archive.palmetto} target="_blank" rel="noreferrer">Original posting (may be unavailable) <ArrowUpRight size={14} /></a></figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.skills} id="the-skills">
        <div className={styles.width}>
          <div className={styles.sectionLead}><div className={styles.chapterNumber}><span>CHAPTER</span><strong>02</strong></div><div><p className={styles.eyebrow}>A CLOSER LOOK AT THE WORK</p><h2>Seven categories. <em>Often together.</em></h2><p className={styles.sectionDescription}>Diagnosis, electrical work, safety and documentation can appear in the same description. We looked for seven overlapping categories of tasks and knowledge.</p></div></div>
          <div className={styles.skillLayout}>
            <div className={styles.skillHeadline}><span className={styles.labelLight}>AUTOMATIC DETECTION · 390 GROUPS</span><div className={styles.bigPercent}>70.5<span>%</span></div><p>mention four or more of the seven categories we studied.</p><div className={styles.headlineDivider} /><span className={styles.headlineSmall}>62.2% WHEN COUNTING ONE POSTING<br />PER EMPLOYER AND NORMALIZED TITLE</span></div>
            <div className={styles.domainChart}><div className={styles.categoryHeading}><span className={styles.chartKicker}>THE SEVEN CATEGORIES</span><h3>What we looked for</h3><p>Each category can appear as a duty, requirement or preferred qualification.</p></div>
              <ol className={styles.categoryList}>{domains.map((item, index) => <li key={item.name}><span className={styles.categoryNumber}>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.name}</strong><small>{item.description}</small></div></li>)}</ol>
              <p className={styles.chartNote}>Categories overlap: a sentence about troubleshooting an inverter can count in both categories. A missing mention does not mean the work is absent.</p>
            </div>
          </div>
          <div className={styles.verification}><span>HOW TO READ THIS FIGURE</span><p>The 70.5% is an automated detection result, not a count of workers or a guaranteed minimum. Grouping by employer and normalized title gives 62.2%; those groups are not necessarily identical job ads.</p><p>In two targeted reading rounds, all 20 groups detected at four or more categories were confirmed, including 10 at exactly four. The final round showed the detected passages to the reader. These checks support the result but do not measure its accuracy across the full collection.</p></div>
        </div>
      </section>

      <section className={styles.profiles} id="role-profiles"><div className={styles.width}>
        <div className={styles.profileIntro}><p className={styles.eyebrow}>TWO PROFILES IN THE ARCHIVE</p><h2>What maintenance and service postings <em>mention.</em></h2><p>Our classification separates 167 maintenance groups and 181 service groups. Many maintenance postings concern large sites; service includes work on customer systems and equipment-maker support. Another 42 groups cover operations and monitoring.</p></div>
        <div className={styles.profileGrid}>
          <article><span>MAINTENANCE · 167 GROUPS</span><h3>At the site</h3><p>Automatic detection found mentions of electrical work or knowledge in <strong>95%</strong>, travel in <strong>73%</strong>, and lifting or work at height in <strong>43%</strong>.</p><div className={styles.fieldEvidence}><span>ONWARD ENERGY · CAPTURED 2025</span><blockquote>“Must be available for night, overtime, weekend, and holiday work as required.”</blockquote></div><a className={styles.profileLink} href={archive.onward} target="_blank" rel="noreferrer">View archived posting <ArrowUpRight size={15} /></a></article>
          <article><span>SERVICE · 181 GROUPS</span><h3>In the field</h3><p>Automatic detection found mentions of electrical work or knowledge in <strong>81%</strong>, travel in <strong>61%</strong>, and lifting or work at height in <strong>74%</strong>.</p><div className={styles.fieldEvidence}><span>SCHNEIDER ELECTRIC · CAPTURED 2021</span><blockquote>“Commission, troubleshoot, repair and analyze solar (PV) inverters.”</blockquote></div><a className={styles.profileLink} href={archive.schneider} target="_blank" rel="noreferrer">View archived posting <ArrowUpRight size={15} /></a></article>
        </div><p className={styles.profileNote}>Unadjusted automated detections of mentions, including preferred qualifications. Lifting and height are combined in the figures above; a mention does not establish a worker’s exposure or what every technician does. Individual examples do not represent every role.</p>
        <div className={styles.conditions}><span>ACROSS ALL 390 GROUPS</span><p>Estimated shares after adjustment for detector precision: <strong>89%</strong> mention diagnosis or repair and <strong>46%</strong> inverters. <strong>64%</strong> mention travel, <strong>47%</strong> lifting, <strong>39%</strong> work at height and <strong>43%</strong> a driver’s licence. An electrician’s licence appears in an estimated <strong>29%</strong>; it can be required, preferred or depend on the state. These are estimates of mentions in this archive.</p></div>
      </div></section>

      <section className={styles.archiveSection} id="the-archive">
        <div className={styles.width}>
          <div className={`${styles.sectionLead} ${styles.sectionLeadDark}`}><div className={styles.chapterNumber}><span>CHAPTER</span><strong>03</strong></div><div><p className={styles.eyebrowLight}>WHAT CHANGED IN OUR COLLECTION</p><h2>Maintenance takes a larger share <em>of the archive.</em></h2><p className={styles.sectionDescription}>The share of selected posting groups classified as operations and maintenance was higher in 2024–2026 than in 2020–2022.</p></div></div>
          <div className={styles.archiveGrid}>
            <figure className={styles.trendCard}><figcaption><span>O&amp;M SHARE · SELECTED POSTING GROUPS</span><h3>Two periods, one archive</h3><p>Percentage of grouped posting texts classified as O&amp;M</p></figcaption><div className={styles.trendRows}>{periods.map(item => <div className={styles.trendRow} key={item.label}><div className={styles.trendText}><strong>{item.label}</strong><span>{item.count} groups</span></div><div className={styles.trendTrack}><span style={{ width: item.width }} /></div><b>{item.value}</b></div>)}</div><p className={styles.trendNote}>The 2023 dip is not yet explained; coverage and classification require further investigation. 2026 is partial, through October 10. Groups are counted by capture year, not necessarily the posting date.</p></figure>
            <div className={styles.archiveCopy}><span className={styles.archiveIndex}>THE READING</span><h3>5.8% <span>to</span> 12.1%</h3><p>O&amp;M rose from 103 of 1,767 groups to 271 of 2,234. About half of the 6.3-point increase reflects the net change in which employers appeared in the archive; most of the remainder comes from employers present in both periods, including unknown or intermediary employers.</p><p>The share was also higher without the three largest O&amp;M advertisers (7.4% to 11.1%) and when comparing complete years 2021–22 with 2024–25 (5.8% to 11.0%). These are changes in the collection, not estimates of national hiring.</p><div className={styles.archiveAside}><span>WHAT THE FIGURES MEASURE</span><p>Archived posting text, grouped by similarity and year of capture. The remaining roughly 2.9 points reflect changes among employers present in both periods and the pooled group of unidentified employers.</p></div></div>
          </div>
        </div>
      </section>

      <section className={styles.queueSection}>
        <div className={styles.width}><div className={styles.queueGrid}><div><p className={styles.eyebrow}>THE BIGGER PICTURE</p><h2>773 GW of proposed solar capacity <em>are waiting for a grid connection.</em></h2></div><div className={styles.queueCopy}><p>At the end of 2025, proposed solar projects represented 773 GW in U.S. transmission interconnection queues, according to Berkeley Lab. These are projects seeking a connection, not operating installations.</p><p>Historically, many queued projects have not reached operation. The postings in this report describe work on systems already in service.</p><a href="https://eta.lbl.gov/publications/queued-2026-edition-characteristics" target="_blank" rel="noreferrer">Explore Berkeley Lab’s queue data <ArrowUpRight size={15} /></a></div></div></div>
      </section>

      <section className={styles.methodSection} id="methods">
        <div className={styles.width}><div className={styles.methodHeader}><div className={styles.chapterNumber}><span>ABOUT THE STUDY</span><strong>04</strong></div><div><p className={styles.eyebrow}>DATA &amp; METHODS</p><h2>How we read <em>the postings.</em></h2></div></div>
          <div className={styles.methodGrid}><div><span>01 / THE COLLECTION</span><p>We analysed 13,335 observations grouped into 4,577 solar posting text groups, including pages preserved by the Internet Archive. Dates refer to capture, not necessarily the date the job was posted.</p></div><div><span>02 / THE UNIT</span><p>Repeated and similar texts were grouped within an employer and year. The 390 O&amp;M groups correspond to about 225 employer–title combinations. Neither measure counts distinct openings reliably.</p></div><div><span>03 / THE CHECKS</span><p>Python scripts applied classification and detection rules. Targeted checks included three rounds of human reading across 47 distinct groups. The review did not cover every posting or estimate; the final threshold reading showed the detected passages.</p></div><div><span>04 / THE LIMITS</span><p>The employers, pages and sources available to us vary over time. Classification misses some O&amp;M postings, but their share could not be estimated reliably. The collection is not representative of the U.S. labor market, and postings do not measure people hired.</p></div></div>
          <div className={styles.sourceRow}><span>SOURCES &amp; METHODS</span><div><a href="/reports/solar-om-method.md">Full method note <ArrowUpRight size={14} /></a><a href="https://irecusa.org/census-solar-job-trends/" target="_blank" rel="noreferrer">IREC · National Solar Jobs Census <ArrowUpRight size={14} /></a><a href="https://eta.lbl.gov/publications/queued-2026-edition-characteristics" target="_blank" rel="noreferrer">Berkeley Lab · Interconnection queues <ArrowUpRight size={14} /></a></div></div>
        </div>
      </section>

      <footer className={styles.closing}><div className={styles.width}><p>SOLAR ROLES RESEARCH <span> / </span> WORKFORCE</p><h2>Explore more <em>solar research.</em></h2><p>Read the rest of our work on solar jobs.</p><Link href="/data">Explore all research <ArrowRight size={16} /></Link></div></footer>
    </main>
  )
}
