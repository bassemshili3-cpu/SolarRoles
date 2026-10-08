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
const SITE_URL = "https://solarroles.com";
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
    cost: "Arranged through the business; confirm employment terms",
    unlocks: "Product-specific eligibility; confirm installation vs service scope",
  },
  {
    program: "Enphase Installer Certification",
    whoEnrolls: "Individual, via Enphase University",
    format: "Free online coursework, self-paced",
    cost: "Free",
    unlocks: "Personal certificate; company-level tiers layer on top",
  },
  {
    program: "SolarEdge EDGE Academy",
    whoEnrolls: "Individual, via SolarEdge's online training platform",
    format: "Free online coursework, self-paced",
    cost: "Free",
    unlocks: "Course completion; company partner status is separate",
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
        <h2>A trained technician and a partner company are different</h2>
        <p>
            An individual course record belongs to the technician. A manufacturer partnership belongs to the business and may carry separate commercial, insurance or licensing conditions. Passing an online module does not enroll a company in an installer network.
          </p>
        <p>
            Tesla&apos;s <a href="https://www.tesla.com/partner-with-tesla" target="_blank" rel="noopener noreferrer">Certified Installer application</a> is aimed at installation businesses. Its <a href="https://energylibrary.tesla.com/docs/Public/Directory/en-us/GUID-FE8456DA-DF78-42F2-BF19-EA8BD7F5728E.html" target="_blank" rel="noopener noreferrer">energy training directory</a> separates product courses. A job seeker should ask a prospective employer which training and account access it provides rather than assume that a public document grants installer status.
          </p>
        <p>
            <a href="https://university.enphase.com/" target="_blank" rel="noopener noreferrer">Enphase University</a> records training through an individual account. The portal asks for the learner&apos;s role; installer and product-specific activities may require a company-linked account or other access approval. <a href="https://www.solaredge.com/us/installers/training" target="_blank" rel="noopener noreferrer">SolarEdge training</a> leads to EDGE Academy&apos;s online courses and technical material, with account registration for the learning platform. Neither course record establishes company partner status.
          </p>
      </section>

      <section className="resource-section">
        <h2>What this means if you're job hunting</h2>
        <p>
            The free online material can help you learn the equipment named in a vacancy. On a resume, give the exact completed course or learning path and product generation. Enphase&apos;s <a href="https://enphase.com/installers/training/videos" target="_blank" rel="noopener noreferrer">public installation training videos</a> can also be used with the product documentation.
          </p>
        <p>
            For Tesla roles, confirm that the business is in the relevant installer program and ask how technicians receive product training. Installation approval and service authorization may differ. A certificate from an unrelated course does not resolve either requirement.
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
            Our <Link href="/resources/solar-certifications-by-job-role">certifications-by-job-role table</Link> distinguishes product learning from trade licensing and professional credentials. The <Link href="/resources/osha-safety-guide-solar-installers">OSHA guide</Link> covers the separate safety-training obligations.
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
        the official enrollment and training pages. Manufacturers update these programs
        regularly. Confirm the current pathway directly with Tesla, Enphase or
        SolarEdge before enrolling.
      </p>
    </article>
  );
}
