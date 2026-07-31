import type { Metadata } from "next";

interface Category {
  name: string;
  type: string;
  legal: string;
  governedBy: string;
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/nabcep-vs-eta-vs-state-licenses";
const PAGE_TITLE =
  "NABCEP vs ETA vs State Licenses vs Manufacturer Certifications (2026)";
const PAGE_DESCRIPTION =
  "A clear, neutral breakdown of the four different solar credential types in the US: NABCEP, ETA International, state contractor licenses, and manufacturer installer programs like Tesla and Enphase.";

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

const CATEGORIES: Category[] = [
  {
    name: "NABCEP",
    type: "Voluntary national certification",
    legal: "No legal weight on its own",
    governedBy: "NABCEP (nonprofit)",
  },
  {
    name: "ETA International",
    type: "Voluntary national certification",
    legal: "No legal weight on its own",
    governedBy: "ETA International (nonprofit)",
  },
  {
    name: "State contractor license",
    type: "Legal requirement (where applicable)",
    legal: "Required to legally pull permits or run jobs",
    governedBy: "State licensing board",
  },
  {
    name: "Manufacturer certification",
    type: "Brand-specific training program",
    legal: "No legal weight, but affects pricing and eligibility",
    governedBy: "The manufacturer (Tesla, Enphase, SolarEdge, etc.)",
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
      dateModified: "2026-07-01",
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
          name: "NABCEP vs ETA vs State Licenses vs Manufacturer Certifications",
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

export default function NabcepVsEtaVsStateLicenses() {
  return (
    <article className="resource-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>NABCEP vs ETA vs State Licenses vs Manufacturer Certifications</h1>
      <p className="resource-intro">
        Solar credentials come in four different flavors. Some
        are voluntary industry certifications, some are legal requirements
        enforced by a state, and some are marketing programs run by
        equipment manufacturers that happen to require real training.
        Confusing them leads to wasted money on the wrong credential at the
        wrong time.
      </p>

      <div className="resource-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Type</th>
              <th>Legal weight</th>
              <th>Governed by</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c) => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.type}</td>
                <td>{c.legal}</td>
                <td>{c.governedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="resource-section">
        <h2>The four categories, in plain terms</h2>
        <p>
          NABCEP is a national, voluntary certification body. It doesn't
          grant you legal permission to work anywhere; it signals to
          employers and customers that you've met a recognized standard.
        </p>
        <p>
          ETA International is a separate certification body, older and less
          known outside the electronics and solar trades, with a more
          hands-on emphasis than NABCEP's largely exam-based approach.
        </p>
        <p>
          State contractor licenses are legal requirements, not optional
          credentials. Where they apply, you cannot legally pull permits or
          run a solar business without one, regardless of how many voluntary
          certifications you hold.
        </p>
        <p>
          Manufacturer certifications (Tesla, Enphase, SolarEdge, IronRidge,
          and others) are brand-specific training programs. They don't carry
          legal weight and aren't recognized industry-wide the way NABCEP
          is, but they unlock real business benefits: pricing, lead
          referrals, and eligibility to install certain products under
          warranty.
        </p>
      </section>

      <section className="resource-section">
        <h2>NABCEP vs ETA International</h2>
        <p>
          Both are legitimate, nonprofit-run certification bodies, and the
          two are often positioned as competitors, but they're built for
          slightly different moments in a career.
        </p>
        <p>
          NABCEP's certification track generally assumes you already have
          field experience. To sit for the PV Installation Professional
          exam, candidates need documented involvement in a minimum number
          of installations, on top of training hours. It's exam-heavy and
          widely recognized: employers and government incentive programs
          across the country reference it by name.
        </p>
        <p>
          ETA's approach leans further into hands-on assessment. Its
          entry-level certification is built for someone newer to the field,
          with practical training delivered through an ETA-approved school
          as part of the certification itself, rather than assumed
          beforehand. ETA also requires a Customer Service Specialist
          certification alongside its technical credential, something NABCEP
          doesn't build into its core pathway.
        </p>
        <p>
          Cost is one of the clearest differences. Between initial
          certification and renewal, NABCEP tends to run several times more
          expensive than ETA's comparable level, largely because of NABCEP's
          higher exam and application fees. That doesn't make ETA the better
          deal by default. NABCEP's wider name recognition among employers
          and utility incentive programs is worth real money over a career,
          even if it costs more up front.
        </p>
        <p>
          In practice, plenty of installers hold both. Neither one replaces
          field experience, and neither is a substitute for a state license
          where one is legally required.
        </p>
      </section>

      <section className="resource-section">
        <h2>State contractor licenses: the one that isn't optional</h2>
        <p>
          This is the category people mix up most often with NABCEP, and
          it's the one with real legal consequences if ignored. As of the
          most recent tally, twelve states plus Puerto Rico require a
          solar-specific contractor license, separate from a general
          electrical or plumbing license. Most other states still require a
          general electrical contractor license (or supervision by someone
          who holds one) to legally connect a PV system to the grid.
        </p>
        <p>
          NABCEP certification is not a state license, and holding it
          doesn't exempt you from licensing requirements where they exist.
          The two systems do intersect in a few places: Utah requires NABCEP
          certification as a prerequisite to qualify for its state solar
          contractor license, and a handful of states, including
          California, Delaware, and Massachusetts, give preference to
          NABCEP-certified professionals in rebate and incentive programs
          without making it a legal requirement.
        </p>
        <p>
          The practical takeaway is to check your specific state's licensing
          rules before assuming a national certification alone lets you
          legally run jobs. Certifications travel across state lines;
          licenses generally do not.
        </p>
      </section>

      <section className="resource-section">
        <h2>
          Manufacturer certifications: not a substitute, but not optional
          either in practice
        </h2>
        <p>
          Tesla, Enphase, SolarEdge, SMA, and other equipment manufacturers
          run their own certification programs, and they matter more than
          their non-legal status might suggest. These programs train
          installers on a specific product line (Tesla Powerwall and Solar
          Roof, Enphase microinverters, SolarEdge power optimizers) and
          typically unlock tangible business benefits: product pricing,
          priority technical support, marketing support, and in Enphase's
          case, a tiered partner system (platinum, gold, silver) that
          determines priority access to new product allocation.
        </p>
        <p>
          None of this replaces NABCEP, ETA, or a state license. A
          manufacturer certification proves you know how to install one
          company's equipment correctly; it says nothing about your broader
          PV design or code knowledge, and it carries no weight with a
          permitting office. But if you plan to specialize in a specific
          brand of equipment, particularly battery storage systems like
          Powerwall or Enphase's IQ Battery, the manufacturer certification
          is often what actually gets you the install jobs and warranty
          eligibility, regardless of what other credentials sit on your
          resume.
        </p>
      </section>

      <section className="resource-section">
        <h2>How these actually stack for a real career</h2>
        <p>
          Someone building a serious solar installation career in the US
          typically ends up with a combination, not a single credential.
        </p>
        <p>
          A state contractor license, or supervised hours toward one, if the
          state requires it, since this is the only category with legal
          teeth.
        </p>
        <p>
          NABCEP PV Associate early on, since it requires no field
          experience and signals foundational knowledge while you're
          building the installation hours needed for higher certifications.
        </p>
        <p>
          NABCEP PV Installation Professional once you have the documented
          field experience, since it remains the most widely recognized
          credential among employers and incentive programs nationally.
        </p>
        <p>
          One or two manufacturer certifications tied to whatever equipment
          your employer or region uses most, since these open doors to
          specific, well-paying installation work that generic credentials
          don't guarantee.
        </p>
        <p>
          ETA certification is worth adding if your training path leans more
          hands-on than exam-based, or if a specific employer or region
          values it, though it won't replace NABCEP's broader name
          recognition.
        </p>
      </section>

      <section className="resource-section">
        <h2>The mistake to avoid</h2>
        <p>
          The most expensive mistake in this space isn't picking the
          "wrong" certification. It's assuming a national certification
          (NABCEP, ETA, or a manufacturer program) substitutes for a legally
          required state license, or the reverse: assuming a state license
          means employers won't also expect NABCEP. Check what your
          specific state requires first. Everything else layers on top of
          that foundation, not instead of it.
        </p>
      </section>

      <p className="resource-fine-print">
        Licensing requirements, certification costs, and manufacturer
        program details reflect information available as of mid-2026 and
        change over time, especially at the state level. Confirm current
        requirements with your state licensing board and the relevant
        certifying body before making enrollment or licensing decisions.
      </p>
    </article>
  );
}