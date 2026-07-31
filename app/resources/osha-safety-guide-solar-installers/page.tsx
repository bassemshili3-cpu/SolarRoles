import type { Metadata } from "next";

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
        OSHA training is often the first credential a new installer earns,
        it's frequently a hard requirement to get on a commercial roof at
        all, and the hazards it covers (falls, live DC circuits, struck-by
        incidents) are the ones that actually injure people in this trade.
        Here's what the card means, what the rules require on a real roof,
        and who's on the hook when something goes wrong.
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
        <h2>OSHA 10 vs OSHA 30: what's actually different</h2>
        <p>
          Both come from the same Outreach Training Program and cover the
          same four hazard categories construction relies on: falls,
          electrocution, struck-by, and caught-in/between. The difference
          isn't the topic list, it's the depth and the audience. OSHA 10
          gives a new installer enough hazard awareness to work safely under
          someone else's supervision. OSHA 30 adds program-level material,
          like how to run a jobsite safety plan and manage subcontractor
          compliance, aimed at whoever is actually responsible for the crew.
        </p>
        <p>
          Neither is legally mandated by federal OSHA itself. In practice,
          almost every general contractor, EPC, and installation company
          requires OSHA 10 before a worker sets foot on a jobsite, and a
          growing number of states and municipalities have made it a legal
          condition for construction permits regardless of what OSHA
          requires nationally. If your state is one of them, that
          requirement overrides "voluntary" in every practical sense.
        </p>
        <p>
          One detail that trips people up: OSHA 10 is not a prerequisite for
          OSHA 30. A new hire who's about to become a crew lead can go
          straight into the 30-hour course. What decides which one you need
          is your role and your state's rules, not a hierarchy between the
          two cards.
        </p>
      </section>

      <section className="resource-section">
        <h2>Fall protection: the rule that governs every roof job</h2>
        <p>
          Falls are the leading cause of serious injury in solar
          installation, and the rule is more specific than "wear a harness."
          Under construction standards, workers installing panels are
          exposed to a fall hazard at six feet or more and must be protected
          by a guardrail system, a safety net, or a personal fall arrest
          system. Maintenance work on an already-installed system falls
          under general industry rules instead, where the threshold drops to
          four feet, and a standard railing is the default expectation
          before fall arrest gear becomes an option.
        </p>
        <p>
          That construction-vs-maintenance split matters more than most
          installers realize. Two workers can be standing on the same roof,
          doing what looks like similar work, and be governed by two
          different rulebooks depending on whether it's a new install or a
          repair. State-plan states can also set their own, stricter
          numbers. California's fall protection threshold for this work sits
          at seven and a half feet rather than the federal six, and several
          other state plans layer on their own heat or fall requirements on
          top of the federal floor. The safe assumption on any job is to
          follow whichever standard is stricter, not whichever one is more
          convenient.
        </p>
        <p>
          Roof edges aren't the only exposure. Skylights and roof hatches
          cause a disproportionate share of incidents because they don't
          register as a hazard the way an open edge does, especially on
          metal roofs where a skylight can blend into the surrounding
          panels. OSHA requires any rooftop hatch opening to have guardrails
          on its exposed sides plus a self-closing gate, and unguarded
          skylights need screening or covers rated to hold a worker's
          weight, not just a warning sign.
        </p>
      </section>

      <section className="resource-section">
        <h2>Electrical hazards specific to PV, not generic construction</h2>
        <p>
          This is where solar diverges from standard roofing work, and it's
          the piece most general OSHA training doesn't cover well. A PV
          module produces current the moment light hits it, regardless of
          whether a breaker downstream is open or a disconnect is switched
          off. Lockout/tagout procedures under 29 CFR 1910.147 still apply
          to isolate energy sources during install or maintenance, but LOTO
          alone doesn't make a module safe to touch during daylight the way
          it makes a de-energized circuit safe elsewhere. Covering panels or
          working before sunrise are common field workarounds precisely
          because switching off downstream equipment doesn't stop
          generation at the source.
        </p>
        <p>
          Arc flash risk on the DC side is also treated differently than
          installers coming from AC-only electrical backgrounds expect. DC
          arcs don't self-extinguish at the zero-crossing the way AC arcs
          do, which is part of why DC combiner boxes and rapid shutdown
          devices get specific attention in solar-focused safety training
          that generic construction courses skip entirely.
        </p>
        <p>
          None of this is covered in real depth inside a 10-hour or even
          30-hour Outreach course. Both are awareness-level programs across
          all of construction, not a solar-specific curriculum. Employers
          are expected to layer task-specific electrical training on top,
          and that layer is where most of the actual PV-related electrical
          safety knowledge gets taught.
        </p>
      </section>

      <section className="resource-section">
        <h2>Employer obligations vs worker obligations</h2>
        <p>
          The OSH Act puts the legal weight on the employer, not the
          individual installer, which is worth knowing if you're ever
          unsure who's supposed to catch a problem. Employers are required
          to provide a workplace free of recognized hazards, supply and pay
          for required PPE and fall protection equipment, provide the
          training a task requires, and keep the records that prove it
          happened. That obligation doesn't shrink based on company size,
          and on multi-contractor sites, liability commonly extends to the
          general contractor and property owner as well as the direct
          employer.
        </p>
        <p>
          Workers have real obligations too, just narrower ones: use the
          equipment and procedures you were trained on, report hazards and
          near-misses instead of working around them, and follow the fall
          protection and lockout/tagout rules that apply to the specific
          task in front of you. A worker can be disciplined for ignoring
          provided protection, but a worker cannot be held responsible for
          protection the employer never supplied in the first place. When
          something goes wrong on a roof, that distinction is usually where
          an OSHA investigation starts.
        </p>
      </section>

      <section className="resource-section">
        <h2>Which card should a solar installer actually get</h2>
        <p>
          For someone entering the trade with no supervisory role yet, OSHA
          10 Construction is the standard starting point, and it's often
          what employers or state law require before you're even allowed on
          a residential roof crew. It's cheap, it's fast, and most
          installation companies treat it as a baseline hiring requirement
          rather than a differentiator.
        </p>
        <p>
          OSHA 30 Construction makes sense once you're leading a crew,
          managing a jobsite safety plan, or coordinating subcontractors,
          which for most installers lines up with a lead installer or
          foreman role rather than an entry-level one. Getting it earlier
          than your role requires isn't wasted effort, since the deeper
          program-management material tends to matter more once you're
          responsible for other people's safety, not before.
        </p>
        <p>
          Either card should be treated as a floor, not a ceiling. It proves
          general construction hazard awareness. It does not certify you on
          DC electrical hazards, rapid shutdown systems, or roof-specific PV
          mounting risk, and no employer should treat it as if it does.
        </p>
      </section>

      <p className="resource-fine-print">
        Regulatory thresholds, program requirements, and state variations
        reflect information available as of mid-2026 and change over time,
        particularly at the state-plan level. This is general safety
        information, not legal or compliance advice. Confirm current
        requirements with OSHA, your state plan, and a qualified safety
        professional before setting jobsite policy.
      </p>
    </article>
  );
}