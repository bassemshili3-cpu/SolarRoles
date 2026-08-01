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
  "Tesla, Enphase, and SolarEdge Certifications for Installers (2026): Company vs Individual";
const PAGE_DESCRIPTION =
  "How manufacturer certifications actually work for solar installers: which ones a company enrolls in, which ones an individual technician can complete directly, and whether they're worth pursuing.";

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
        These three names come up constantly in solar job postings, and the
        way they work differs enough between manufacturers that it's worth
        separating out before deciding where to spend your time. Some of
        this is a certification you can complete yourself, on your own
        schedule. Some of it depends entirely on who you work for.
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
          Search around for "how to become Tesla certified" and you'll find
          pages that flatly disagree with each other, some describing
          individual eligibility criteria, others stating plainly that only
          companies get certified. Both are partly right, because Tesla's
          program and Enphase's or SolarEdge's programs are structured
          differently at the core.
        </p>
        <p>
          Tesla certifies installation companies as partners. A business
          applies, meets Tesla's requirements, and once approved, trains its
          own technicians internally so they can install and service
          Powerwall and Solar Roof to Tesla's standard. An individual
          outside of a Tesla-partnered company generally can't enroll in
          that training directly; access runs through the employer.
        </p>
        <p>
          Enphase and SolarEdge split the two levels apart. Both run a
          company-level partner program, Enphase's platinum/gold/silver
          tiers being the more visible example, but they also offer
          individual, self-paced online certification through Enphase
          University and SolarEdge University respectively, open to anyone
          regardless of where they work. A technician can complete either
          one independently, without an employer's sponsorship, which is
          the opposite of how Tesla's program is structured.
        </p>
      </section>

      <section className="resource-section">
        <h2>What this means if you're job hunting</h2>
        <p>
          If a job posting lists "Enphase Install and Battery certification
          is a plus," that's a credential you can go earn before you even
          apply, at no cost, using Enphase's own online platform. The same
          applies to SolarEdge University. Doing this ahead of time turns
          a line on a job posting into a line on your resume, which is a
          fairly rare situation in a field where most other credentials
          take money or months to earn.
        </p>
        <p>
          A Tesla certification works differently: it's not something to
          chase before you have the job. It's a benefit that shows up after
          you're hired by a company that's already a Tesla-certified
          partner, at which point the training is handled internally rather
          than something you seek out on your own.
        </p>
      </section>

      <section className="resource-section">
        <h2>Where this fits next to NABCEP and OSHA</h2>
        <p>
          None of these manufacturer credentials substitute for NABCEP, a
          state license, or OSHA training, and no serious employer treats
          them as if they do. They're narrower by design: proof you know
          one company's equipment, not proof of broader PV design or code
          knowledge. Where they land in the fuller certification picture is
          covered in our{" "}
          <Link href="/resources/solar-certifications-by-job-role">
            certifications-by-job-role reference table
          </Link>
          , and if you're earlier in the process of sorting out which
          credentials actually matter for your target role, the{" "}
          <Link href="/resources/nabcep-training-providers-compared">
            NABCEP training provider comparison
          </Link>{" "}
          and{" "}
          <Link href="/resources/osha-safety-guide-solar-installers">
            OSHA safety guide
          </Link>{" "}
          cover the credentials that do carry that broader weight.
        </p>
        <p>
          They're still worth having. Battery storage work in particular,
          Powerwall and Enphase's IQ Battery especially, increasingly lists
          a manufacturer certification as a practical requirement for
          getting assigned to that work, warranty terms attached to it in
          a way that a general PV credential doesn't cover.
        </p>
      </section>

      <p className="resource-fine-print">
        Program structures, enrollment requirements, and partner tier names
        reflect information available as of mid-2026 and change as
        manufacturers update their programs. Confirm current enrollment
        details directly with Tesla, Enphase, or SolarEdge before assuming
        a specific pathway applies to your situation.
      </p>
    </article>
  );
}