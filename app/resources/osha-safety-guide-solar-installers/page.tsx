import type { Metadata } from "next";
import Link from "next/link";

interface OutreachRow {
  aspect: string;
  osha10: string;
  osha30: string;
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://solarroles.com";
const PAGE_PATH = "/resources/osha-safety-guide-solar-installers";
const PAGE_TITLE =
  "OSHA Safety Guide for Solar Installers: OSHA 10 vs 30, Fall Protection, Electrical Hazards";
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
    osha10: "Not federally mandated; employer / local rules may require it",
    osha30: "Not federally mandated; employer / local rules may require it",
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
      dateModified: "2026-10-08",
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
      <p>
            OSHA 10 and OSHA 30 are Outreach course-completion cards. Construction employers or local rules may require one, but neither card qualifies a worker for every hazard on a solar site. The employer still needs to train workers for the equipment and tasks they will encounter.
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
            The <a href="https://www.osha.gov/training/outreach" target="_blank" rel="noopener noreferrer">OSHA Outreach guidance</a> distinguishes general hazard awareness from training required under specific standards. A state, municipality, project owner or employer can require an Outreach card even though federal OSHA does not mandate it.
          </p>
        <p>
            OSHA 30 is intended for supervisors and workers with safety responsibilities, not automatically for every beginner. OSHA 10 is not its prerequisite. Match the course to the assignment: Construction for installation work, or General Industry where appropriate to manufacturing or operations. Confirm the track with the employer.
          </p>
      </section>

      <section className="resource-section">
        <p>For online courses, compare the actual training provider and course category with the <a href="https://www.osha.gov/training/outreach/training-providers" target="_blank" rel="noopener noreferrer">OSHA-authorized online providers</a>. A reseller&apos;s logo alone is not proof of authorization. For a classroom course, use <a href="https://www.osha.gov/training/outreach/find-a-trainer" target="_blank" rel="noopener noreferrer">OSHA&apos;s trainer guidance</a> and check the trainer&apos;s current authorization for the relevant industry. Ask the employer whether it already provides an accepted course.</p>
        <h2>Fall protection: the rule that governs every roof job</h2>
        <p>
            OSHA&apos;s <a href="https://www.osha.gov/green-jobs/solar/falls" target="_blank" rel="noopener noreferrer">solar fall-hazard guidance</a> describes protection for construction exposures of six feet or more. Roof edges, openings and access routes need to be assessed together; a harness is useful only as part of an appropriate protection system.
          </p>
        <p>
            General-industry walking-working-surface rules commonly use a four-foot threshold. The employer must determine which standard governs the task; calling all work on an existing array &quot;maintenance&quot; does not settle whether construction rules apply.
          </p>
        <p>
          The construction-versus-maintenance distinction changes the rulebook.
          Two workers on the same roof may face different requirements if one
          is installing and the other is repairing.
        </p>
        <p>
            State-plan requirements may differ from federal rules. Check the applicable plan and the specific activity rather than applying a single state height threshold to every solar roof job.
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
            A PV module generates electricity in light even when a downstream disconnect is open. <a href="https://www.osha.gov/green-jobs/solar/electrical" target="_blank" rel="noopener noreferrer">OSHA&apos;s solar electrical guidance</a> identifies the shock and arc hazards. The employer&apos;s energy-control procedures must cover the actual installation and applicable electrical standards; one general lockout rule does not cover every construction and maintenance task.
          </p>
        <p>
            Opening a switch, covering modules or working at night must not be treated as proof that conductors are safe. Qualified personnel must follow the equipment-specific isolation and verification procedures.
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
          foreman role</Link>. Its program-management content becomes relevant when those duties are part of the job. There is no need to buy it solely because 30 sounds better than 10.
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
