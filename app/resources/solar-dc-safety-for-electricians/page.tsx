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
        <span><strong>Last reviewed:</strong> 10 August, 2026</span>
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
            An electrician who is experienced on conventional AC systems already brings valuable fundamentals: safe work practices, troubleshooting discipline, and respect for energized equipment. Solar PV adds a different electrical environment, not just a different kind of rooftop installation.
          </p>
          <p>
            The key difference is how an arc behaves. In AC, current reverses direction and crosses zero many times per second. That zero crossing can help an arc extinguish when a circuit opens. DC has no equivalent repeated zero crossing. Once a DC arc is established, it can be sustained until the circuit is interrupted by equipment designed and rated to do so.
          </p>
          <div className="sr2-callout">
            <span className="kicker">The practical takeaway</span>
            <p>Solar work is not a lower-voltage version of conventional electrical work. The hazard assessment, isolation plan, switching equipment, and training must fit the DC circuit in front of you.</p>
          </div>

          <h2 id="daylight"><span className="n">02</span>Why “Off” Is Not Always De-Energized</h2>
          <p>
            A PV module generates DC electricity whenever light reaches it. Opening an inverter, disconnect, or breaker may isolate part of the system, but it does not make every conductor on the array side dead. The exact energized sections depend on the system design and the isolation points available.
          </p>
          <p>
            This is where an AC-only mental model can become dangerous. “The system is off” is not a complete electrical status. A qualified worker needs to identify the source, the circuit boundaries, the devices that can interrupt the circuit, and what remains energized in daylight before work begins.
          </p>
          <p>
            OSHA specifically notes that solar workers face shock and arc-flash hazards, and that PV circuits are energized whenever modules are exposed to sunlight. That is why solar-specific safety training matters alongside a general electrical background.
          </p>

          <h2 id="scale"><span className="n">03</span>Voltage and Available Energy Change the Job</h2>
          <p>
            Large solar sites commonly use DC collection architectures in the 600 to 1,500 V range. Higher voltage alone does not describe the full arc-flash risk: available fault current, clearing time, working distance, enclosure design, and the task all matter. But it does mean the work cannot be approached like a small residential branch circuit.
          </p>
          <p>
            The risk can concentrate at combiner boxes, recombiners, inverters, disconnects, and other points where strings are brought together. Those locations combine exposed electrical work with equipment-specific switching and isolation rules. A job that looks routine on a one-line diagram can carry very different consequences when DC sources remain available.
          </p>

          <h2 id="retraining"><span className="n">04</span>What an AC Electrician Must Relearn</h2>
          <p>
            The goal is not to erase AC experience. It is to add PV-specific competence before taking responsibility for DC-side work. That includes understanding string and combiner architecture, DC-rated disconnecting means, rapid-shutdown design where applicable, lockout/tagout limits, and the site&apos;s arc-flash risk assessment.
          </p>
          <p>
            It also means learning to treat labels, one-line diagrams, equipment instructions, and the employer&apos;s electrical safety program as working tools rather than paperwork. PPE is part of the control strategy, not a substitute for eliminating exposure, establishing a safe work condition, or following the designed switching sequence.
          </p>
          <p>
            Our <Link href="/resources/osha-safety-guide-solar-installers">OSHA safety guide for solar installers</Link> covers the broader roof, fall-protection, and electrical hazards that sit alongside this DC-specific risk. In Texas, licensing and supervision rules also shape who may perform this work; see the guide to <Link href="/resources/solar-installer-vs-electrician-texas">solar installer versus electrician requirements</Link>.
          </p>

          <h2 id="employers"><span className="n">05</span>What Employers Should Look For</h2>
          <p>
            Hiring an electrician for solar should not stop at checking a license or years of AC experience. The useful question is whether the candidate has been trained and supervised on the PV equipment, voltage class, operating procedures, and energized-work rules used on that site.
          </p>
          <p>
            For electricians moving into solar, the strongest signal is not simply saying “I have worked around DC.” It is being able to explain how a PV array remains a source in daylight, where isolation begins and ends, and why the planned task can be completed under the site&apos;s safety controls.
          </p>

          <h2 id="next"><span className="n">06</span>Next Step</h2>
          <p>
            If you already have an electrical background and want to apply it in solar, explore <Link href="/solar-electrician-jobs">Solar Electrician job openings</Link>. Before accepting DC-side responsibility, make sure the employer provides role- and site-specific PV safety training, equipment procedures, and qualified supervision.
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
