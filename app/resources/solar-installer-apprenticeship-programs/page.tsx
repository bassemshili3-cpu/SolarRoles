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
  "Solar Installer Apprenticeships (2026): How Registered Apprenticeship Programs Actually Work";
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

      <h1>Solar Installer Apprenticeships: How They Actually Work</h1>
      <p className="resource-intro">
        Most "how to become a solar installer" guides mention apprenticeships
        in a single line and move straight back to paid training courses.
        That's backwards for a lot of people. A Registered Apprenticeship
        pays you while you train, which matters a great deal if a
        NABCEP-approved course running several hundred dollars isn't
        realistic right now. Here's what these programs are, why the paperwork
        behind them is stranger than it looks, and why more employers started
        offering them recently.
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
        <h2>The odd detail nobody explains: solar installer isn't "apprenticeable"</h2>
        <p>
          To register an apprenticeship with the Department of Labor, the
          occupation has to be formally recognized as apprenticeable. As of
          this writing, "solar installer" still isn't one of those
          recognized occupations on its own. Programs work around that by
          registering apprentices under an occupation the DOL already
          recognizes, most often Construction Craft Laborer, and building
          solar-specific tasks into that framework instead.
        </p>
        <p>
          IREC and SEIA got national guidelines approved for exactly this
          setup, giving employers, community colleges, and unions a
          DOL-compliant template to build a solar apprenticeship without
          waiting for a dedicated occupation code to exist. Some states,
          like Oregon, route the same idea through an existing electrical
          apprenticeship (the Limited Renewable Energy Technician license)
          instead of the general laborer route, so the exact legal wrapper
          varies by state even when the on-the-ground training looks
          similar.
        </p>
      </section>

      <section className="resource-section">
        <h2>Why employers suddenly care: the IRA apprenticeship requirement</h2>
        <p>
          Apprenticeships existed in solar before this, just unevenly.
          What changed the math for a lot of employers is the Inflation
          Reduction Act's labor provisions. Solar and storage projects over
          1 megawatt have to source a minimum share of construction labor
          hours from registered apprentices to qualify for the full federal
          tax credit, a threshold that started at 12.5 percent and stepped
          up to 15 percent. For an EPC contractor chasing utility-scale
          work, standing up a real apprenticeship pipeline stopped being
          a nice-to-have and became a direct lever on how much of the credit
          they can actually claim.
        </p>
        <p>
          That's useful context for a job seeker, not just industry trivia:
          it explains why apprenticeship openings have been showing up more
          at utility-scale EPCs specifically, rather than spread evenly
          across residential installers who aren't chasing that credit
          threshold in the first place.
        </p>
      </section>

      <section className="resource-section">
        <h2>What a program actually looks like day to day</h2>
        <p>
          Structure varies by sponsor, but the shape repeats: a mix of paid
          on-the-job training under a mentor, plus classroom or online
          instruction covering electrical fundamentals, NEC compliance, and
          safety. ReVision Energy's four-year program, for example, splits
          into installation or maintenance technician tracks and combines
          8,000 hours of supervised fieldwork with 600 hours of related
          classroom instruction. Oregon's electrical-track apprenticeship
          runs leaner at 4,000 OJT hours and 288 classroom hours, reflecting
          the difference between a general craft-laborer wrapper and a
          licensure-track electrical apprenticeship.
        </p>
        <p>
          Pay typically starts below a fully qualified installer's wage and
          steps up on a schedule as hours and competencies accumulate,
          which is the entire point: you're being paid to become qualified,
          not paying tuition to prove you already are.
        </p>
      </section>

      <section className="resource-section">
        <h2>Apprenticeship vs. paying for NABCEP training up front</h2>
        <p>
          These aren't really competing paths so much as different starting
          points that can converge. An apprenticeship gets you paid,
          supervised field hours from day one, which is exactly the kind of
          documented experience NABCEP's Experience Pathway asks for. Many
          apprentices end up sitting for a NABCEP Associate or Installation
          Professional exam anyway, using the apprenticeship's hours and
          classroom instruction as the preparation instead of a separate
          paid course.
        </p>
        <p>
          The tradeoff is speed and flexibility. Apprenticeships run for
          years on a fixed structure with a defined sponsor and location. A
          paid NABCEP prep course can be finished in weeks, on your own
          schedule, if you already have some construction or electrical
          background and cash to cover it. Someone with savings and a
          related background may move faster through paid training; someone
          without either usually comes out ahead going the paid,
          supervised route instead.
        </p>
      </section>

      <section className="resource-section">
        <h2>Where these programs actually exist</h2>
        <p>
          There's no single national job board for solar apprenticeship
          openings, which is part of why they're underused. In practice
          they show up through a handful of channels: state apprenticeship
          agencies (Florida and Oregon both run registered programs
          directly), IBEW union locals for the electrical-track route,
          employer-run programs at larger regional installers like ReVision
          Energy, and the DOL's Solar Ready Vets Network for veterans
          transitioning into the trade. SEIA and IREC also maintain
          employer-facing resources that, in practice, double as a way to
          find which companies in a given region are currently running a
          registered program.
        </p>
      </section>

      <section className="resource-section">
        <h2>What's next</h2>
        <p>
          Knowing how to actually get into one of these programs can seem confusing.
          This is why we have created a specific resource: a
          practical guide to finding open solar apprenticeship slots and
          what selection committees are actually screening for.
        </p>
        <p>
          <Link href="/resources/how-to-get-a-solar-apprenticeship">
            Read the full guide: How to Land a Solar Installer Apprenticeship →
          </Link>
        </p>
      </section>

      <p className="resource-fine-print">
        Program structures, hour requirements, and federal tax credit
        thresholds reflect information available as of mid-2026 and change
        over time as new programs register and legislation evolves. Confirm
        current details directly with the listed program sponsors or your
        state apprenticeship agency before applying.
      </p>
    </article>
  );
}