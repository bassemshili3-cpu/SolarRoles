import type { Metadata } from "next";
import Link from "next/link";

interface RoleRow {
  role: string;
  required: string;
  recommended: string;
  optional: string;
  learnMore?: { label: string; href: string };
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/solar-certifications-by-job-role";
const PAGE_TITLE =
  "Solar Certifications by Job Role (2026): Which Credential for Which Position";
const PAGE_DESCRIPTION =
  "A single reference table mapping US solar job roles to the certifications and licenses that actually apply to them: what's legally required, what's most valued by employers, and what's manufacturer-specific.";

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

// Warm gold-to-amber gradient across header columns, in place of the
// blue-to-green gradient in the original slide reference.
const HEADER_COLORS = ["#F5B819", "#F0A012", "#EA850E", "#E36A12"];

const ROLE_ROWS: RoleRow[] = [
  {
    role: "PV Installer (entry-level)",
    required: "OSHA 10 (employer-expected, not federally mandated)",
    recommended: "NABCEP PV Associate",
    optional: "—",
    learnMore: {
      label: "OSHA guide",
      href: "/resources/osha-safety-guide-solar-installers",
    },
  },
  {
    role: "Solar Apprentice",
    required: "Program-specific minimum requirements (age, diploma/GED)",
    recommended: "OSHA 10 during or before the program",
    optional: "NABCEP Associate, often earned using apprenticeship hours",
    learnMore: {
      label: "Apprenticeship programs",
      href: "/resources/solar-installer-apprenticeship-programs",
    },
  },
  {
    role: "Lead Installer / Foreman",
    required: "OSHA 10, state electrical license where applicable",
    recommended: "NABCEP PV Installation Professional",
    optional: "OSHA 30",
    learnMore: {
      label: "NABCEP vs ETA vs licenses",
      href: "/resources/nabcep-vs-eta-vs-state-licenses",
    },
  },
  {
    role: "Solar Electrician",
    required: "State journeyman or master electrician license",
    recommended: "NABCEP PV Installation Professional",
    optional: "ETA International credential",
    learnMore: {
      label: "NABCEP vs ETA vs licenses",
      href: "/resources/nabcep-vs-eta-vs-state-licenses",
    },
  },
  {
    role: "O&M Technician (commercial/utility)",
    required: "Journeyman electrician license (required in some states)",
    recommended: "NABCEP PV Commissioning & Maintenance Specialist",
    optional: "SCADA / infrared thermography training",
    learnMore: {
      label: "NABCEP training providers",
      href: "/resources/nabcep-training-providers-compared",
    },
  },
  {
    role: "Energy Storage Installer",
    required: "State electrical license (required in some states)",
    recommended: "NABCEP PV Installation Professional",
    optional: "Manufacturer certification (Tesla, Enphase, SolarEdge)",
    learnMore: {
      label: "Manufacturer certifications",
      href: "/resources/manufacturer-certifications-tesla-enphase-solaredge",
    },
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
      dateModified: "2026-08-01",
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
          name: "Solar Certifications by Job Role",
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

export default function SolarCertificationsByJobRole() {
  return (
    <article className="resource-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>Solar Certifications by Job Role</h1>
      <p className="resource-intro">
        Certification requirements in solar don't come from one source.
        Some are federal (OSHA), some are state-issued licenses, some are
        voluntary industry credentials (NABCEP, ETA), and some are
        manufacturer-specific. This table lines them up against the roles
        they actually apply to, so you can see what a given position
        realistically expects before enrolling in anything.
      </p>

      <div className="certs-hub-table-wrap">
        <div className="certs-hub-title">
          Solar Job Roles &amp; Certification Requirements
        </div>
        <table
          className="certs-hub-table"
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "22%" }}></th>
              <th
                style={{
                  backgroundColor: HEADER_COLORS[0],
                  width: "22%",
                  verticalAlign: "top",
                }}
              >
                Legally required
              </th>
              <th
                style={{
                  backgroundColor: HEADER_COLORS[1],
                  width: "22%",
                  verticalAlign: "top",
                }}
              >
                Most valued
              </th>
              <th
                style={{
                  backgroundColor: HEADER_COLORS[2],
                  width: "22%",
                  verticalAlign: "top",
                }}
              >
                Optional / manufacturer
              </th>
              <th
                style={{
                  backgroundColor: HEADER_COLORS[3],
                  width: "12%",
                  verticalAlign: "top",
                }}
              >
                Learn more
              </th>
            </tr>
          </thead>
          <tbody>
            {ROLE_ROWS.map((row) => (
              <tr key={row.role}>
                <th
                  scope="row"
                  data-label="Role"
                  style={{ verticalAlign: "top" }}
                >
                  {row.role}
                </th>
                <td
                  data-label="Legally required"
                  style={{ verticalAlign: "top" }}
                >
                  {row.required}
                </td>
                <td
                  data-label="Most valued"
                  style={{ verticalAlign: "top" }}
                >
                  {row.recommended}
                </td>
                <td
                  data-label="Optional / manufacturer"
                  style={{ verticalAlign: "top" }}
                >
                  {row.optional}
                </td>
                <td
                  data-label="Learn more"
                  style={{ verticalAlign: "top" }}
                >
                  {row.learnMore ? (
                    <Link href={row.learnMore.href}>
                      {row.learnMore.label} →
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="resource-section">
        <h2>How to read this table</h2>
        <p>
          "Legally required" means an OSHA program, a state license, or a
          rule tied to permitting, none of which are optional where they
          apply. "Most valued" covers voluntary credentials that aren't
          mandated anywhere but that employers and incentive programs
          consistently look for. "Optional / manufacturer" is narrower still,
          usually tied to a specific product line rather than the role
          itself.
        </p>
        <p>
          The required column varies more than it looks by state. A
          electrical license requirement in one state can be a
          non-requirement two states over, covered in more detail in our{" "}
          <Link href="/resources/nabcep-vs-eta-vs-state-licenses">
            breakdown of NABCEP, ETA, and state licenses
          </Link>
          . Treat this table as the general framework, and check your
          specific state before assuming a row applies to you exactly as
          written.
        </p>
      </section>

      <section className="resource-section">
        <h2>The baseline that applies almost everywhere</h2>
        <p>
          Across nearly every row in this table, OSHA training sits
          underneath everything else. It's rarely the credential that gets
          someone hired, but it's frequently the one that gets them onto a
          jobsite in the first place. Our{" "}
          <Link href="/resources/osha-safety-guide-solar-installers">
            OSHA safety guide for solar installers
          </Link>{" "}
          covers the OSHA 10 vs 30 distinction and the fall protection and
          electrical rules specific to PV work in more depth than this table
          can.
        </p>
      </section>

      <section className="resource-section">
        <h2>Two ways to reach the same row</h2>
        <p>
          For roles like Lead Installer or Solar Electrician, there's
          usually more than one path to the required qualifications. Paying
          for a NABCEP-prep course is the faster route if you already have
          savings and a related background, covered in our{" "}
          <Link href="/resources/nabcep-training-providers-compared">
            comparison of NABCEP training providers
          </Link>
          . A{" "}
          <Link href="/resources/solar-installer-apprenticeship-programs">
            Registered Apprenticeship
          </Link>{" "}
          gets you paid while you accumulate the same documented experience,
          at the cost of a longer, more structured timeline. Both paths can
          lead to the same row in this table.
        </p>
      </section>

      <section className="resource-section">
        <h2>Where manufacturer certifications fit</h2>
        <p>
          Tesla, Enphase, and SolarEdge certifications show up in the
          "optional" column for a reason: they're not a substitute for
          NABCEP or a state license. How each program actually works, and
          which ones you can complete on your own versus which ones depend
          on your employer, is covered in our{" "}
          <Link href="/resources/manufacturer-certifications-tesla-enphase-solaredge">
            guide to Tesla, Enphase, and SolarEdge certifications
          </Link>
          .
        </p>
      </section>

      <p className="resource-fine-print">
        Requirements shown here are a general framework, not a
        state-by-state legal reference. Licensing rules, credential names,
        and employer expectations vary and change over time. Confirm
        current requirements with your state licensing board and the
        certifying bodies referenced before making training or licensing
        decisions.
      </p>
    </article>
  );
}