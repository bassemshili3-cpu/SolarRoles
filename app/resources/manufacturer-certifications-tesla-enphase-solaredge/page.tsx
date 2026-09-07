import type { Metadata } from "next";
import Link from "next/link";

interface MfrRow {
  program: string;
  whoEnrolls: string;
  format: string;
  cost: string;
  unlocks: string;
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/manufacturer-certifications-tesla-enphase-solaredge";
const PAGE_TITLE =
  "Solar Manufacturer Certifications: How to make the right choice";
const PAGE_DESCRIPTION =
  "How manufacturer certifications work for solar installers: which ones a company enrolls in, which ones an individual technician can complete directly, and whether they're worth pursuing.";

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

const MFR_ROWS: MfrRow[] = [
  {
    program: "Tesla Certified Installer",
    whoEnrolls: "Company (business becomes a certified partner)",
    format: "Employer-sponsored training for its technicians",
    cost: "No direct cost to the individual technician",
    unlocks: "Eligibility to install/service Powerwall and Solar Roof",
  },
  {
    program: "Enphase Installer Certification",
    whoEnrolls: "Individual, via Enphase University",
    format: "Free online coursework, self-paced",
    cost: "Free",
    unlocks: "Personal certificate; company-level tiers layer on top",
  },
  {
    program: "SolarEdge University Certification",
    whoEnrolls: "Individual, via SolarEdge's online training platform",
    format: "Free online coursework, self-paced",
    cost: "Free",
    unlocks: "Personal certificate; separate Preferred/Elite partner tiers for companies",
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
          name: "Tesla, Enphase, and SolarEdge Certifications for Installers",
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

export default function ManufacturerCertifications() {
  return (
    <article className="resource-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>Tesla, Enphase, and SolarEdge Certifications for Installers</h1>
      <p className="resource-intro">
        Tesla, Enphase and SolarEdge credentials appear throughout solar job
        postings. Their programs do not work the same way. Some are open to
        individual installers and can be completed independently. Others are
        available only through an approved employer.
      </p>

      <div className="resource-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Program</th>
              <th>Who enrolls</th>
              <th>Format</th>
              <th>Cost</th>
              <th>What it unlocks</th>
            </tr>
          </thead>
          <tbody>
            {MFR_ROWS.map((row) => (
              <tr key={row.program}>
                <td>{row.program}</td>
                <td>{row.whoEnrolls}</td>
                <td>{row.format}</td>
                <td>{row.cost}</td>
                <td>{row.unlocks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="resource-section">
        <h2>The distinction that explains most of the confusion</h2>
        <p>
          Search for "how to become Tesla certified" and the answers appear to
          conflict. Some pages describe eligibility for individuals. Others
          say that only companies can qualify. The confusion comes from a
          basic difference between Tesla's model and the programs run by
          Enphase or SolarEdge.
        </p>
        <p>
          Tesla certifies installation companies as partners. A business
          applies and meets Tesla's requirements. Once approved, the employer
          trains its technicians to install and service Powerwall and Solar
          Roof. An individual outside a Tesla partner generally cannot enroll
          directly. Access runs through the employer.
        </p>
        <p>
          Enphase and SolarEdge separate individual training from company
          partnerships. Both operate partner programs for businesses. Enphase
          uses visible platinum, gold and silver tiers. The two manufacturers
          also offer self-paced individual courses through their online
          universities. A technician can complete that training without
          employer sponsorship.
        </p>
      </section>

      <section className="resource-section">
        <h2>What this means if you're job hunting</h2>
        <p>
          An Enphase Install and Battery credential can be earned before you
          apply for a job. The course is free on Enphase's own platform.
          SolarEdge University works in much the same way. Completing either
          program turns a preferred qualification into a line on your resume.
          Few other industry credentials are both free and available on
          demand.
        </p>
        <p>
          Tesla certification comes later. You first need a job with an
          approved Tesla partner. The employer then provides the training
          internally.
        </p>
      </section>

      <section className="resource-section">
        <h2>Where this fits next to NABCEP and OSHA</h2>
        <p>
          Manufacturer credentials do not substitute for NABCEP, a state
          license or OSHA training. Their purpose is narrower: they show that
          you understand one company's equipment.
        </p>
        <p>
          Our{" "}
          <Link href="/resources/solar-certifications-by-job-role">
            certifications-by-job-role reference table
          </Link>
          {" "}shows where they fit in the broader certification picture. If
          you are still deciding which credentials your target role needs,
          consult the{" "}
          <Link href="/resources/nabcep-training-providers-compared">
            NABCEP training provider comparison
          </Link>{" "}
          and{" "}
          <Link href="/resources/osha-safety-guide-solar-installers">
            OSHA safety guide
          </Link>.
          Both explain the credentials with broader value.
        </p>
        <p>
          Manufacturer training can still be worth pursuing. Battery storage
          work increasingly asks for credentials tied to Powerwall or Enphase
          IQ Battery. The qualification may determine who receives the work.
          It can also affect warranty eligibility in ways a general PV
          credential does not.
        </p>
      </section>

      <p className="resource-fine-print">
        Program structures, enrollment rules and partner tiers reflect
        information available in mid-2026. Manufacturers update these programs
        regularly. Confirm the current pathway directly with Tesla, Enphase or
        SolarEdge before enrolling.
      </p>
    </article>
  );
}
