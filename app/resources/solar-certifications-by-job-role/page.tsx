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
const SITE_URL = "https://solarroles.com";
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
    required: "Task-specific safety training; apprentice / trade license where required",
    recommended: "NABCEP PV Associate",
    optional: "—",
    learnMore: {
      label: "OSHA guide",
      href: "/resources/osha-safety-guide-solar-installers",
    },
  },
  {
    role: "Solar Apprentice",
    required: "Program admission criteria; apprentice registration where required",
    recommended: "OSHA 10 during or before the program",
    optional: "NABCEP Associate if its education or experience criteria are met",
    learnMore: {
      label: "Apprenticeship programs",
      href: "/resources/solar-installer-apprenticeship-programs",
    },
  },
  {
    role: "Lead Installer / Foreman",
    required: "Safety training and electrical licensing / supervision as applicable",
    recommended: "NABCEP PV Installation Professional",
    optional: "OSHA 30",
    learnMore: {
      label: "NABCEP vs ETA vs licenses",
      href: "/resources/nabcep-vs-eta-vs-state-licenses",
    },
  },
  {
    role: "Solar Electrician",
    required: "Appropriate electrical license under state / local rules",
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
      <p>
            An electrical license governs the work a person may legally perform. A NABCEP credential demonstrates knowledge and, for Board Certification, qualifying experience. OSHA Outreach cards and manufacturer training serve other purposes.
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
                Legal / program requirements
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
                  data-label="Legal / program requirements"
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
                      {row.learnMore.label}
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
          "Legal / program requirements" covers program admission, safety training, state licenses and
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
        <h2>Safety training follows the assignment</h2>
        <p>
            An employer must provide the safety training required for the assigned work. OSHA Outreach is a separate general-awareness program; a site or jurisdiction may require its card. Ask the employer which course it accepts and whether it arranges the training. Our <Link href="/resources/osha-safety-guide-solar-installers">OSHA safety guide</Link> explains the different audiences for the 10-hour and 30-hour courses.
          </p>
      </section>

      <section className="resource-section">
        <h2>Who pays depends on the hiring route</h2>
        <p>
            An apprentice earns wages while building skills; the program&apos;s classroom instruction may also satisfy some credential requirements if the provider and content qualify. A new hire may receive equipment training through the employer. For an experienced worker seeking PVIP, reimbursement can cover a class or exam, but it should be agreed before enrollment. Self-study supports preparation; it cannot replace required education or documented projects. Candidates who fund their own training can compare course scope in our <Link href="/resources/nabcep-training-providers-compared">provider comparison</Link>.
          </p>
      </section>

      <section className="resource-section">
        <h2>Where manufacturer certifications fit</h2>
        <p>
            Enphase and SolarEdge offer free online learning, while Tesla&apos;s installer pathway involves an approved business. Product courses are often most useful after the employer identifies the equipment you will use, and some are required for particular installation or commissioning tasks. Our <Link href="/resources/manufacturer-certifications-tesla-enphase-solaredge">manufacturer training guide</Link> links to the official routes and explains the access conditions.
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
