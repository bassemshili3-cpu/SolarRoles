import type { Metadata } from "next";
import Link from "next/link";
import { Sora } from "next/font/google";
import { articleCss } from "../_shared/article-styles";

const sora = Sora({ subsets: ["latin"], weight: ["700", "800"], display: "swap" });

const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/solar-dc-safety-for-electricians";
const PAGE_TITLE = "Why Solar DC Safety Is Different for Electricians";
const PAGE_DESCRIPTION =
  "Why experience with conventional AC systems is not enough for solar PV work: sustained DC arcs, daylight-generated voltage, and the safety practices solar electricians need.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Solar Roles",
    type: "article",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: `${SITE_URL}${PAGE_PATH}`,
      dateModified: "2026-08-10",
      author: [{ "@type": "Organization", name: "Solar Roles" }],
      publisher: { "@type": "Organization", name: "Solar Roles" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 2, name: PAGE_TITLE, item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
  ],
};

export default function SolarDcSafetyForElectricians() {
  return (
    <div className="sr2-page">
      <style dangerouslySetInnerHTML={{ __html: articleCss }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="sr2-title">
        <span className="eyebrow"><span className="d" />Safety · Electrical work · 2026</span>
        <h1 className={sora.className}>
          Why Solar <span className="accent">DC Safety</span> Is Different for Electricians
        </h1>
        <p className="sub">{PAGE_DESCRIPTION}</p>
      </div>

      <div className="sr2-meta-strip flex justify-center items-center gap-2">
        <span><strong>Last reviewed:</strong> 27 August, 2026</span>
      </div>

      <div className="sr2-shell">
        <aside className="sr2-toc-col" aria-label="Table of contents">
          <div className="sr2-toc-card">
            <div className="sr2-toc-head">Table of Contents</div>
            <ol className="sr2-toc-list">
              <li><a href="#difference">The DC Difference</a></li>
              <li><a href="#daylight">Why “Off” Is Not Always De-Energized</a></li>
              <li><a href="#scale">Voltage and Available Energy</a></li>
              <li><a href="#retraining">What an AC Electrician Must Relearn</a></li>
              <li><a href="#employers">What Employers Should Look For</a></li>
              <li><a href="#next">Next Step</a></li>
            </ol>
          </div>
        </aside>

        <article className="sr2-article">
          <h2 id="difference"><span className="n">01</span>The DC Difference</h2>
          <p>
            AC electricians bring valuable fundamentals to solar. They already
            understand safe work, disciplined troubleshooting and the danger
            of energized equipment. PV adds a different electrical environment
            that requires its own methods.
          </p>
          <p>
            The key difference is arc behavior. AC reverses direction and
            crosses zero many times per second. That crossing can help an arc
            extinguish when a circuit opens. DC has no repeated zero crossing.
            Once established, an arc may continue until properly rated
            equipment interrupts the circuit.
          </p>
          <div className="sr2-callout">
            <span className="kicker">The practical takeaway</span>
            <p>Solar work is not a lower-voltage version of conventional electrical work. The hazard assessment and isolation plan must fit the DC circuit. So must the switching equipment and training.</p>
          </div>

          <h2 id="daylight"><span className="n">02</span>Why “Off” Is Not Always De-Energized</h2>
          <p>
            A PV module generates DC electricity whenever light reaches it.
            Opening an inverter may isolate part of the system. It does not
            de-energize every array-side conductor. The design and available
            isolation points determine what remains live.
          </p>
          <p>
            An AC-only mental model can be dangerous here. “The system is off”
            is not a complete electrical status. Before work begins, a
            qualified worker must identify the interruption point and every
            section that remains energized in daylight.
          </p>
          <p>
            OSHA identifies shock and arc-flash hazards for solar workers. It
            also notes that sunlight energizes PV circuits. General electrical
            experience therefore needs a layer of solar-specific training.
          </p>

          <h2 id="scale"><span className="n">03</span>Voltage and Available Energy Change the Job</h2>
          <p>
            Large solar sites commonly use DC collection systems from 600 to
            1,500 V. Voltage alone does not define arc-flash risk. Fault
            current, clearing time and working distance also matter. The
            enclosure and task change the exposure as well. This work cannot
            be approached like a small residential branch circuit.
          </p>
          <p>
            Risk can concentrate where strings come together. Combiner boxes,
            recombiners, inverters and disconnects are common examples. Each
            location has equipment-specific switching and isolation rules. A
            routine-looking task can carry serious consequences while DC
            sources remain available.
          </p>

          <h2 id="retraining"><span className="n">04</span>What an AC Electrician Must Relearn</h2>
          <p>
            AC experience remains useful. Before taking responsibility for
            DC-side work, add competence in string and combiner architecture.
            Learn DC-rated disconnects and rapid-shutdown design. Understand
            the limits of lockout/tagout and the site's arc-flash assessment.
          </p>
          <p>
            Labels, one-line diagrams and equipment instructions are working
            tools. The employer's electrical safety program is one too. PPE
            supports the control strategy. It cannot replace exposure removal,
            a safe work condition or the correct switching sequence.
          </p>
          <p>
            Our <Link href="/resources/osha-safety-guide-solar-installers">OSHA safety guide for solar installers</Link>{" "}
            covers roof and fall hazards alongside electrical risk. Texas also
            restricts who may perform this work. See our guide to{" "}
            <Link href="/resources/solar-installer-vs-electrician-texas">solar installer versus electrician requirements</Link>.
          </p>

          <h2 id="employers"><span className="n">05</span>What Employers Should Look For</h2>
          <p>
            A license and years of AC experience do not complete a solar
            safety assessment. Employers should confirm training on the site's
            equipment and voltage class. They should also check experience
            with its operating procedures and energized-work rules.
          </p>
          <p>
            Electricians should be able to explain how an array remains a
            source in daylight. They should identify where isolation begins
            and ends. They should also show why a planned task fits the site's
            safety controls. That evidence says more than a general claim of DC
            experience.
          </p>

          <h2 id="next"><span className="n">06</span>Next Step</h2>
          <p>
            Electricians can explore current{" "}
            <Link href="/solar-electrician-jobs">Solar Electrician job openings</Link>.
            Before accepting DC-side responsibility, confirm that the employer
            provides site-specific PV training. Equipment procedures and
            qualified supervision should also be in place.
          </p>

          <div className="sr2-fine">
            This is career and safety information, not a substitute for an employer&apos;s electrical safety program, equipment instructions, or the requirements that apply to a specific jobsite. For the underlying hazard guidance, see OSHA&apos;s <a href="https://www.osha.gov/green-jobs/solar/electrical" target="_blank" rel="nofollow noopener noreferrer">solar electrical hazards guidance</a>, its <a href="https://www.osha.gov/electrical/flash-hazards" target="_blank" rel="nofollow noopener noreferrer">arc-flash guidance</a>, and its solar electrical safety training material. Confirm the current rules and work procedures before performing electrical work.
          </div>
        </article>

        <aside className="sr2-sidebar">
          <div className="sr2-card">
            <div className="sr2-author-card">
              <div className="a">SR</div>
              <div>
                <div className="by">Career safety guide</div>
                <div className="nm">Solar<span className="mark">Roles</span></div>
              </div>
            </div>
            <ul className="sr2-badges">
              <li className="sr2-badge">PV-specific electrical hazards</li>
              <li className="sr2-badge">Built for electricians entering solar</li>
              <li className="sr2-badge">OSHA-aligned safety context</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
