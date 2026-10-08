import type { Metadata } from "next";
import Link from "next/link";

interface ProgramRow {
  program: string;
  sponsor: string;
  length: string;
  hours: string;
  outcome: string;
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://solarroles.com";
const PAGE_PATH = "/resources/solar-installer-apprenticeship-programs";
const PAGE_TITLE =
  "How Registered Apprenticeship Programs for Solar Installers Work";
const PAGE_DESCRIPTION =
  "A standalone guide to paid, earn-while-you-learn apprenticeship pathways for solar PV installers in the US: how Registered Apprenticeship Programs work, why solar installer isn't officially apprenticeable yet, and how the IRA tax credit changed employer incentives.";

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

const PROGRAM_ROWS: ProgramRow[] = [
  {
    program: "ReVision Energy REEAP",
    sponsor: "Employer (Maine / New Hampshire)",
    length: "4 years",
    hours: "8,000 OJT + 600 classroom",
    outcome: "State electrical licensure exam prep",
  },
  {
    program: "Florida Solar Energy Apprenticeship",
    sponsor: "State-registered (FlaSEIA / FSEC)",
    length: "Multi-year, DOL-registered",
    hours: "OJT + related classroom instruction",
    outcome: "Pathway to FL solar contractor license",
  },
  {
    program: "Oregon RE-JATC (LRT track)",
    sponsor: "Joint labor-management committee",
    length: "Multi-year",
    hours: "4,000 OJT + 288 classroom",
    outcome: "Limited Renewable Energy Technician license",
  },
  {
    program: "Construction Craft Laborer (solar-adapted)",
    sponsor: "IREC / SEIA national guidelines",
    length: "~2 years",
    hours: "Varies by sponsor",
    outcome: "Craft laborer credential, solar-specific tasks",
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
          name: "Solar Installer Apprenticeship Programs",
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

export default function SolarInstallerApprenticeshipPrograms() {
  return (
    <article className="resource-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>How Solar Installer Apprenticeships Work</h1>
      <p>
            A Registered Apprenticeship combines a paid job with instruction and supervised skill development. Sponsors recruit for particular occupations, locations and intake dates. A program&apos;s registration is not evidence that it has an opening today.
          </p>

      <div className="resource-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Program</th>
              <th>Sponsor</th>
              <th>Length</th>
              <th>Hours</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {PROGRAM_ROWS.map((row) => (
              <tr key={row.program}>
                <td>{row.program}</td>
                <td>{row.sponsor}</td>
                <td>{row.length}</td>
                <td>{row.hours}</td>
                <td>{row.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="resource-section">
        <h2>The registered occupation may have a different name</h2>
        <p>
            A solar employer may train apprentices under an electrical or Construction Craft Laborer occupation, depending on its approved program. Search both the employer and occupation in the <a href="https://www.apprenticeship.gov/partner-finder" target="_blank" rel="noopener noreferrer">registered sponsor directory</a>; limiting a search to &quot;solar installer&quot; can miss relevant programs.
          </p>
        <p>
          IREC and SEIA secured national guidelines for this model. The
          template lets employers build a solar apprenticeship without a
          dedicated occupation code. Oregon takes a different route through
          its Limited Renewable Energy Technician electrical apprenticeship.
          The legal structure varies by state even when the field training
          looks similar.
        </p>
      </section>

      <section className="resource-section">
        <h2>The IRA apprenticeship requirement</h2>
        <p>
            Federal clean-energy tax incentives can attach apprenticeship conditions to qualifying construction work. The <a href="https://www.apprenticeship.gov/inflation-reduction-act-apprenticeship-resources" target="_blank" rel="noopener noreferrer">Department of Labor&apos;s apprenticeship guidance</a> explains the registered-program requirements and exceptions. A candidate still applies to a sponsor or employer; a project&apos;s tax-credit status does not guarantee an apprentice vacancy.
          </p>


      </section>

      <section className="resource-section">
        <h2>What a program looks like</h2>
        <p>
          Every sponsor sets its own structure. Most combine paid work under a
          mentor with classroom or online instruction in safety and electrical
          fundamentals.
        </p>
        <p>
          ReVision Energy's four-year program offers installation and
          maintenance tracks. It includes 8,000 supervised field hours and 600
          classroom hours. Oregon's electrical track requires 4,000 on-the-job
          hours and 288 classroom hours. Its shorter schedule reflects a
          different licensing framework.
        </p>
        <p>
            Registered Apprenticeship includes wage progression as skills develop. Ask for the sponsor&apos;s starting rate and increase schedule, including whether each increase depends on hours, competencies or classroom progress. Also check charges for books, tools or related instruction; paid work does not necessarily mean every expense is covered.
          </p>
      </section>

      <section className="resource-section">
        <h2>Apprenticeship records and NABCEP eligibility</h2>
        <p>
            An apprenticeship produces work and education records that may support a later NABCEP application. The credential has its own rules: a course must supply the required training category, and project experience must demonstrate the specified responsibility. Completing the apprenticeship does not automatically confer NABCEP certification.
          </p>
        <p>
            Ask the sponsor which course certificates and project records apprentices receive. For electrical licensure, confirm who verifies your work and whether the hours count in the state where you intend to qualify. A shorter exam-prep course cannot supply the supervised trade experience an apprenticeship provides.
          </p>
      </section>

      <section className="resource-section">
        <h2>Where these programs exist</h2>
        <p>
            Use <a href="https://www.apprenticeship.gov/apprenticeship-job-finder" target="_blank" rel="noopener noreferrer">Apprenticeship.gov&apos;s Job Finder</a> to locate advertised positions, then check intake dates with the sponsor. The <a href="https://www.apprenticeship.gov/contact-us" target="_blank" rel="noopener noreferrer">state apprenticeship office</a> can identify registered programs in your area. For an electrical route, contact the local IBEW/NECA Joint Apprenticeship and Training Committee through the <a href="https://www.electricaltrainingalliance.org/locateaTrainingCenter" target="_blank" rel="noopener noreferrer">electrical training ALLIANCE directory</a>. Solar contractors also recruit apprentices directly on their careers pages. Ask about paid work, classroom attendance and the licensing outcome before applying.
          </p>
      </section>

      <section className="resource-section">
        <h2>What's next</h2>
        <p>
            Application documents and selection steps differ between programs. Our application guide covers transcripts, aptitude preparation and interviews.
          </p>
        <p>
          <Link href="/resources/how-to-get-a-solar-apprenticeship">
            Read the full guide: How to Land a Solar Installer Apprenticeship
          </Link>
        </p>
      </section>

      <p className="resource-fine-print">
        Program structures and required hours can change. Confirm the current
        terms and intake dates with the program sponsor or your state
        apprenticeship agency before applying.
      </p>
    </article>
  );
}
