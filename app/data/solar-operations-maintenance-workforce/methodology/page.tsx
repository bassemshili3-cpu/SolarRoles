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
        </header>

        <section className={styles.hero}>
          <h1>Methodology and sources</h1>
          <p>How we collected, grouped and analysed the job postings in “What solar maintenance jobs ask for”.</p>
          <div className={styles.meta}>U.S. solar operations and maintenance · Captures from 2020–2026</div>
        </section>

        <article className={styles.methodArticle}>
          <section>
            <h2>What we built and checked</h2>
            <p>We built an archive of U.S. solar job postings captured between 2020 and 2026 and kept 4,525 distinct posting texts. From them, our classification rules identified 387 operations and maintenance postings. In each one, we measured seven skill areas, travel and physical demands, and the status of the electrician licence.</p>
            <p>Every licence sentence in those postings was extracted and classified, text by text, in two independent automated coding passes. The skill-area detectors were checked in two rounds of independent automated coding, and the author reviewed selected cases in four rounds. These checks improved the results along the way: 19 misclassified postings were removed, company presentations and keyword lists are now set aside more reliably, and the licence classification corrected a first rule-based count of required licences from 44 groups to 36.</p>
          </section>

          <section>
            <h2>The collection</h2>
            <p>We analysed 13,254 observations grouped into 4,525 solar posting-text groups, including pages preserved by the Internet Archive. Of these, 387 groups were classified as operations and maintenance (O&amp;M), with 80 identified employers. The O&amp;M groups include 167 maintenance, 179 service, 22 operations and 19 monitoring groups.</p>
            <p>Dates refer to when a page was captured, which can be later than when its job was posted. The 2026 period is partial through October 10.</p>
          </section>

          <section>
            <h2>What we count</h2>
            <p>We group repeated and similar posting texts within an employer and year. A text group is an analytical unit: one opening can appear in several groups, and one group can cover several openings. The 387 O&amp;M groups correspond to about 223 employer–title combinations, another grouping that also gives only an approximate count of openings.</p>
            <p>The collection reflects the postings we were able to archive, so its picture of the U.S. labour market is partial. Employers, pages and sources vary over time, and classification misses some O&amp;M postings. Their number could not be estimated reliably enough to correct the shares.</p>
          </section>

          <section>
            <h2>Tools and processing</h2>
            <p>Postings and their texts are kept in a SQLite catalogue and read with SQL queries. Python scripts then apply explicit, documented rules: they classify O&amp;M postings, keep the part of each description that concerns the job, and detect mentions of skills, licences and working conditions. Company presentations, benefits, legal text and recruiters’ keyword lists are set aside before detection.</p>
            <p>A mention can be a duty, a requirement or a preferred qualification. It describes what a posting asks for; the work itself can include more. Classification precision was estimated at 87% on an independent sample (weighted for how the sample was drawn; 38 of the 47 sampled postings classified O&amp;M were correct, 81% unweighted, 95% interval 68% to 90%), before 19 misclassified postings were removed.</p>
          </section>

          <section>
            <h2>The seven skill areas</h2>
            <p>Electrical work or knowledge (wiring, electrical testing, schematics, the National Electrical Code, an electrician licence or a PV certification); safety procedures (OSHA training, NFPA 70E, arc flash, lockout/tagout, protective equipment, written safety rules); digital tools and software (computers, office software, tablets and field apps, maintenance or customer software, monitoring systems and SCADA); inverters; mechanical systems (trackers, racking, motors, gearboxes, hydraulics, torque, mechanical repair); batteries and storage; high and medium voltage (switchgear, transformers, substations).</p>
            <p>Each share is the automatic detection result across the 387 groups. The areas overlap and can appear in the same sentence. The 61.5% figure is the share of groups in which at least four of the seven are detected (238 of 387 groups). Counting one posting per employer and normalised title gives 52.5%; postings sharing an employer and title can still differ. The maintenance and service comparisons use the same detections.</p>
          </section>

          <section>
            <h2>Electrician licence</h2>
            <p>The licence figures rest on a classification of every licence sentence. We extracted every sentence mentioning a licence in the 387 groups, with a wider search than the detection rules, which brought in 15 groups the rules had missed. Each distinct text was then classified into one of six statuses: required, a plus, depending on the state, equivalent accepted, unstated, or another kind of licence. Two independent automated coding passes did this without seeing the earlier results; they agreed on 72 of 75 distinct texts, and the three disagreements were settled by reading the text. The author then reviewed 12 licence texts without seeing their classification.</p>
            <p>“Required” means the posting makes the licence a condition of the job: 36 groups (9.3%), including 12 that name the state or city of the job, such as “Active Illinois Electrical Journeyman License required”. Without these 12, 6% of groups require a licence. The licence is a plus in 72 groups and depends on the state where the work is done in 36; 4 accept an equivalent or do not say. The required share is 9.4% when counting one posting per employer and normalised title, and 10.2% and 10.6% in maintenance and service postings.</p>
            <p>This classification replaced a first rule-based one, which counted 44 groups as requiring a licence. Eleven of them turned out to depend on the state, accept an equivalent, treat the licence as a plus or leave it unstated, and the wider search added 3 required groups the rules had missed.</p>
          </section>

          <section>
            <h2>Travel and physical demands</h2>
            <p>Travel, lifting, work at height and driver’s licences are estimates adjusted for detector precision, measured on verified samples. Those checks rely on small samples. A mention may be required, preferred or depend on the state.</p>
          </section>

          <section>
            <h2>Checks</h2>
            <p>Automated checks: the seven skill-area detectors were compared with two independent automated coding passes on 48 sampled postings read in full, then on 140 further detections. Precision is 0.94 to 1.00 across the seven areas and recall 0.79 to 1.00; mechanical systems has the lowest recall (0.79). Disagreements between the coding passes were settled by reading the posting.</p>
            <p>Human reading by the author, in four rounds of selected cases: difficult cases, threshold cases and controls. The first three rounds (47 distinct postings) checked an earlier set of categories. The fourth round covered 12 licence texts, read without seeing the automated classification (10 matched; the two others were licences required in the named state or city of the job), and 10 postings detected at exactly four skill areas, with the triggering sentence shown (36 of 40 areas confirmed, 1 unsure). Read in full, one of those 10 postings falls below four skill areas: its storage sentences describe the company. Because this reading focused on possible false detections at the threshold, it is reported as an observation, and the 61.5% stays the automatic result.</p>
            <p>The checks improved the results. The classification check led to the removal of 19 misclassified postings: 12 factory jobs, 6 installation foremen and 1 IT role. The human readings led to better handling of company presentations without a heading and of recruiters’ keyword lists, which had inflated some counts. The licence classification corrected the first rule-based count, from 44 required groups to 36, and the wider search added 15 groups the rules had missed.</p>
          </section>

          <section>
            <h2>Comparing periods</h2>
            <p>The report compares the share of selected solar posting-text groups classified as O&amp;M: 102 of 1,751 in 2020–22, 16 of 565 in 2023 and 269 of 2,209 in 2024–26. The cause of the 2023 dip is still under investigation, with coverage and classification as the main leads.</p>
            <p>About half of the 6.4-point increase between 2020–22 and 2024–26 reflects the net change in which employers appeared in the archive. The remainder includes changes among employers present in both periods and the pooled group of unidentified or intermediary employers. These figures describe changes in the collection.</p>
          </section>

          <section>
            <h2>External source</h2>
            <p>Interstate Renewable Energy Council (IREC), National Solar Jobs Census, 2024 data: operations and maintenance was the only solar sector where hiring difficulty increased in 2024, with 23% of O&amp;M employers finding it very difficult to find qualified workers; across all sectors, the reason employers cite most often is a lack of experience, training or technical skills. <a href="https://irecusa.org/census-workforce-development/" target="_blank" rel="noreferrer">irecusa.org/census-workforce-development</a>. This context comes from IREC’s survey of employers.</p>
          </section>
        </article>

        <footer className={styles.footer}><Link href="/data/solar-operations-maintenance-workforce"><ArrowLeft size={14} /> Back to report</Link></footer>
      </div>
    </main>
  )
}
