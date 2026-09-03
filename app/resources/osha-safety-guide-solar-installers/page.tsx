import type { Metadata } from "next";
import Link from "next/link";

interface OutreachRow {
  aspect: string;
  osha10: string;
  osha30: string;
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/osha-safety-guide-solar-installers";
const PAGE_TITLE =
  "OSHA Safety Guide for Solar Installers (2026): OSHA 10 vs 30, Fall Protection, Electrical Hazards";
const PAGE_DESCRIPTION =
  "A standalone guide to OSHA rules for solar installers: OSHA 10 vs OSHA 30, fall protection thresholds on residential and commercial roofs, electrical and arc hazards specific to PV, and what employers vs workers are each responsible for.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Solar Roles",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const OUTREACH_ROWS: OutreachRow[] = [
  {
    aspect: "Built for",
    osha10: "Entry-level installers with no supervisory duties",
    osha30: "Crew leads, foremen, and anyone with safety responsibility",
  },
  {
    aspect: "Length",
    osha10: "10 contact hours, usually 2 days",
    osha30: "30 contact hours, usually 4–5 days",
  },
  {
    aspect: "Core content",
    osha10: "Hazard awareness: falls, electrical, struck-by, caught-between",
    osha30: "Same four hazards in more depth, plus program management",
  },
  {
    aspect: "Federal requirement",
    osha10: "Voluntary, but expected by most GCs and installers",
    osha30: "Voluntary, but standard for site supervisors",
  },
  {
    aspect: "Card expiration",
    osha10: "Never expires federally; some states cap it at 5 years",
    osha30: "Never expires federally; some states cap it at 5 years",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: `${SITE_URL}${PAGE_PATH}`,
      dateModified: "2026-07-31",
      publisher: {
        "@type": "Organization",
        name: "Solar Roles",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Resources",
          item: `${SITE_URL}/resources`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "OSHA Safety Guide for Solar Installers",
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

export default function OshaSafetyGuideForSolarInstallers() {
  return (
    <article className="resource-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>OSHA Safety Guide for Solar Installers</h1>
      <p className="resource-intro">
        OSHA training is often the first credential a new installer earns.
        It is frequently required before someone can work on a commercial
        roof. The course covers the hazards that most often injure solar
        workers, including falls and live DC circuits.
      </p>

      <div className="resource-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>OSHA 10 (Construction)</th>
              <th>OSHA 30 (Construction)</th>
            </tr>
          </thead>
          <tbody>
            {OUTREACH_ROWS.map((row) => (
              <tr key={row.aspect}>
                <td>{row.aspect}</td>
                <td>{row.osha10}</td>
                <td>{row.osha30}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="resource-section">
        <h2>OSHA 10 vs OSHA 30: what's different</h2>
        <p>
          <Link href="/certifications/osha-10">OSHA 10</Link> and{" "}
          <Link href="/certifications/osha-30">OSHA 30</Link> belong to the
          same Outreach Training Program. Both cover core construction hazards
          such as falls and electrocution. The difference is depth and
          audience. OSHA 10 gives new installers the awareness needed to work
          under supervision. OSHA 30 adds material for people who manage a
          crew, a safety plan or subcontractor compliance.
        </p>
        <p>
          Federal OSHA does not require either card. Most solar employers still
          expect OSHA 10 before a worker enters a jobsite. Some states and
          municipalities also make Outreach training a condition of
          construction work. In those jurisdictions, the local rule controls.
        </p>
        <p>
          OSHA 10 is not a prerequisite for OSHA 30. A new hire preparing to
          lead a crew can take the 30-hour course directly. Your role and local
          rules determine which card you need.
        </p>
      </section>

      <section className="resource-section">
        <h2>Fall protection: the rule that governs every roof job</h2>
        <p>
          Falls are the leading cause of serious injury in solar installation.
          The rule is more specific than "wear a harness." Construction
          standards require protection when panel installers face a fall of
          six feet or more. That protection may be a guardrail or personal
          fall-arrest system.
        </p>
        <p>
          Maintenance on an existing system falls under general-industry
          rules. There, the threshold is four feet and a standard railing is
          the default protection.
        </p>
        <p>
          The construction-versus-maintenance distinction changes the rulebook.
          Two workers on the same roof may face different requirements if one
          is installing and the other is repairing.
        </p>
        <p>
          States with their own OSHA plans can set different thresholds.
          California uses seven and a half feet for this work. Other state
          plans add heat or fall protections. Follow the stricter rule when
          standards overlap.
        </p>
        <p>
          Roof edges are not the only fall exposure. Skylights and hatches can
          blend into a metal roof and are easy to overlook. OSHA requires
          guardrails on the exposed sides of a rooftop hatch and a self-closing
          gate. Unguarded skylights need screens or covers rated to support a
          worker's weight.
        </p>
      </section>

      <section className="resource-section">
        <h2>Electrical hazards specific to PV</h2>
        <p>
          A PV module produces current as soon as light reaches it. Opening a
          downstream breaker or disconnect does not stop generation at the
          module. Lockout/tagout procedures under 29 CFR 1910.147 still apply
          during installation and maintenance.
        </p>
        <p>
          LOTO cannot remove daylight from the source. Crews may cover panels
          or work before sunrise because downstream switching does not
          de-energize the array itself.
        </p>
        <p>
          DC arc behavior also differs from AC. A DC arc does not
          self-extinguish at a zero-crossing. Solar-focused safety training
          therefore gives special attention to combiner boxes and rapid
          shutdown devices. Generic construction courses may not cover those
          hazards in detail.
        </p>
        <p>
          Neither Outreach course teaches these issues in depth. OSHA 10 and
          OSHA 30 provide awareness across the construction industry.
          Employers must add electrical training for the work employees will
          perform. That task-specific layer carries most of the practical PV
          safety knowledge.
        </p>
      </section>

      <section className="resource-section">
        <h2>Employer obligations vs worker obligations</h2>
        <p>
          The OSH Act places the main legal duty on the employer. Employers
          must address recognized hazards and provide the training each task
          requires. They must also supply required protection. On a site with
          several contractors, responsibility can extend beyond a worker's
          direct employer.
        </p>
        <p>
          Workers have narrower obligations. They must follow their training,
          use the protection provided and report hazards. An employer may
          discipline a worker who ignores available protection. It cannot
          shift responsibility for equipment or training it never supplied.
          OSHA investigations often begin with that distinction.
        </p>
      </section>

      <section className="resource-section">
        <h2>Which card should a solar installer get</h2>
        <p>
          OSHA 10 Construction is the standard starting point for a new
          installer without supervisory duties. Employers or state law may
          require it before a worker joins a residential roof crew. The course
          is short, and many installation companies treat it as a hiring
          baseline.
        </p>
        <p>
          OSHA 30 Construction fits people who lead crews, manage jobsite
          safety plans or coordinate subcontractors. For installers, that
          usually means a <Link href="/lead-solar-installer-jobs">lead installer or
          foreman role</Link>. Taking it earlier is still useful. Its
          program-management material becomes most relevant once you are
          responsible for other workers.
        </p>
        <p>
          Either card should be treated as a floor. It proves
          general construction hazard awareness. However, it does not certify
          you for DC electrical work or roof-specific PV mounting.
        </p>
      </section>

      <p className="resource-fine-print">
        Regulatory thresholds, program requirements and state variations
        reflect information available in mid-2026. State-plan rules can change.
        This page provides general safety information only. Confirm current
        requirements with OSHA, your state plan and a qualified safety
        professional before setting jobsite policy.
      </p>
    </article>
  );
}
