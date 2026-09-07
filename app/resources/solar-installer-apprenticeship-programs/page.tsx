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
const SITE_URL = "https://www.solarroles.com";
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
      <p className="resource-intro">
        A Registered Apprenticeship pays you while you train. That matters when
        a <Link href="/resources/nabcep-training-providers-compared">NABCEP-approved course</Link>{" "}
        costing several hundred dollars is out of reach. Here is how the
        programs work and why their paperwork can be confusing.
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
        <h2>Solar installer isn't "apprenticeable"</h2>
        <p>
          To register an apprenticeship with the Department of Labor, the
          occupation has to be formally recognized as apprenticeable. As of
          this writing, "solar installer" still isn't one of those
          occupations. Programs instead register apprentices under an existing
          DOL category. Construction Craft Laborer is the most common. The
          sponsor then adds solar-specific tasks to that framework.
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
          Solar apprenticeships existed before the Inflation Reduction Act,
          but availability was uneven. The law's labor provisions changed the
          calculation for employers. Solar and storage projects above 1
          megawatt must assign a minimum share of construction hours to
          registered apprentices to receive the full federal tax credit. The
          threshold began at 12.5 percent and rose to 15 percent.
        </p>
        <p>
          For utility-scale EPC contractors, an apprenticeship pipeline now
          affects the value of the credit they can claim.
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
          Pay typically starts below a fully qualified installer's wage and
          steps up on a schedule as hours and competencies accumulate. 
         
        </p>
      </section>

      <section className="resource-section">
        <h2>Apprenticeship vs. paying for NABCEP training up front</h2>
        <p>
          These routes can lead to the same place. An apprenticeship provides
          paid and supervised field hours from the first day. That experience
          can support NABCEP's Experience Pathway. Many apprentices later sit
          for a NABCEP Associate or Installation Professional exam. Their work
          hours and classroom instruction replace a separate prep course.
        </p>
        <p>
          The tradeoff is speed and flexibility. Apprenticeships follow a fixed
          structure and can last for years. They also tie you to a sponsor and
          location. A worker with relevant experience and enough savings may
          complete a paid NABCEP prep course in weeks. Without those
          advantages, paid and supervised training is often the stronger route.
        </p>
      </section>

      <section className="resource-section">
        <h2>Where these programs exist</h2>
        <p>
          Start with your state apprenticeship agency or an IBEW local if you
          want the electrical track. Employer-run programs offer another route.
          SEIA and IREC also publish resources for sponsors. Those directories
          can reveal which regional employers currently run registered
          programs.
        </p>
      </section>

      <section className="resource-section">
        <h2>What's next</h2>
        <p>
          Knowing how to get into one of these programs can seem confusing.
          This is why we have created a specific resource: a
          practical guide to finding open solar apprenticeship slots and
          what selection committees are screening for.
        </p>
        <p>
          <Link href="/resources/how-to-get-a-solar-apprenticeship">
            Read the full guide: How to Land a Solar Installer Apprenticeship
          </Link>
        </p>
      </section>

      <p className="resource-fine-print">
        Program structures, required hours and federal tax-credit thresholds
        reflect information available in mid-2026. New registrations and
        legislation can change those details. Confirm the current terms with
        the program sponsor or your state apprenticeship agency before
        applying.
      </p>
    </article>
  );
}
