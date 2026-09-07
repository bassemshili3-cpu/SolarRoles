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
  "Solar Certifications by Job Role: Which Credential for Which Position";
const PAGE_DESCRIPTION =
  "A single reference table mapping US solar job roles to the certifications and licenses that apply to them: what's legally required, what's most valued by employers, and what's manufacturer-specific.";

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
        Solar credentials come from several sources. OSHA provides federal
        safety training. States issue trade licenses. NABCEP and ETA offer
        voluntary industry credentials. Manufacturers run product-specific
        programs. The table shows which ones apply to each job before you pay
        for training.
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
          "Legally required" covers safety training, state licenses and
          permitting rules that apply in a jurisdiction. "Most valued" covers
          voluntary credentials sought by employers or incentive programs.
          "Optional / manufacturer" refers to narrower qualifications tied to
          a product line.
        </p>
        <p>
          Electrical licensing rules can change at a state border. Our{" "}
          <Link href="/resources/nabcep-vs-eta-vs-state-licenses">
            breakdown of NABCEP, ETA, and state licenses
          </Link>
          {" "}explains those differences in more detail. Treat this table as a
          general framework. Check your state's rules before relying on a row.
        </p>
      </section>

      <section className="resource-section">
        <h2>The baseline that applies almost everywhere</h2>
        <p>
          OSHA training underpins almost every row in the table. The card
          rarely secures a job by itself. It often determines whether a worker
          can enter the site. Our{" "}
          <Link href="/resources/osha-safety-guide-solar-installers">
            OSHA safety guide for solar installers
          </Link>{" "}
          explains the difference between OSHA 10 and OSHA 30. It also covers
          fall protection and PV electrical hazards.
        </p>
      </section>

      <section className="resource-section">
        <h2>Two ways to reach the same row</h2>
        <p>
          Lead installers and solar electricians can reach the required
          qualifications by different routes. A paid NABCEP prep course may be
          fastest for someone with savings and relevant experience. Our{" "}
          <Link href="/resources/nabcep-training-providers-compared">
            comparison of NABCEP training providers
          </Link>
          {" "}compares the main options. A{" "}
          <Link href="/resources/solar-installer-apprenticeship-programs">
            Registered Apprenticeship
          </Link>{" "}
          pays you while you build documented experience. The tradeoff is a
          longer and more structured timeline.
        </p>
      </section>

      <section className="resource-section">
        <h2>Where manufacturer certifications fit</h2>
        <p>
          Tesla, Enphase and SolarEdge credentials appear in the optional
          column because they do not replace NABCEP or a state license. Some
          can be completed independently. Others require an approved employer.
          Our{" "}
          <Link href="/resources/manufacturer-certifications-tesla-enphase-solaredge">
            guide to Tesla, Enphase, and SolarEdge certifications
          </Link>
          .
        </p>
      </section>

      <p className="resource-fine-print">
        This table is a general framework rather than a state-by-state legal
        reference. Licensing rules, credential names and employer expectations
        change over time. Confirm current requirements with your state board
        and the relevant certifying body before making a decision.
      </p>
    </article>
  );
}
