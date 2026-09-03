import type { Metadata } from "next";
import Link from "next/link";

interface StepRow {
  step: string;
  electricalTrack: string;
  employerOrState: string;
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/how-to-get-a-solar-apprenticeship";
const PAGE_TITLE =
  "How to Land a Solar Installer Apprenticeship (2026): Application, Testing, and Selection";
const PAGE_DESCRIPTION =
  "A practical guide to getting into a solar apprenticeship: how JATC-style electrical apprenticeships rank and select candidates, what the aptitude test covers, and how employer-run and state-registered programs differ.";

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

const STEP_ROWS: StepRow[] = [
  {
    step: "Apply",
    electricalTrack: "Online application, sometimes a non-refundable fee",
    employerOrState: "Standard job or program application",
  },
  {
    step: "Screening",
    electricalTrack: "Checked against minimum requirements (age, diploma, algebra credit)",
    employerOrState: "Resume/background review by employer or agency",
  },
  {
    step: "Testing",
    electricalTrack: "Formal aptitude test: algebra + reading comprehension",
    employerOrState: "Rarely a formal test; sometimes a basic skills check",
  },
  {
    step: "Interview",
    electricalTrack: "Panel interview (JATC committee), scored",
    employerOrState: "Standard hiring-style interview",
  },
  {
    step: "Outcome",
    electricalTrack: "Ranked on an eligibility list, offers by rank order",
    employerOrState: "Direct hire/reject, no ranked waitlist",
  },
  {
    step: "Typical wait",
    electricalTrack: "Weeks to several months, sometimes longer",
    employerOrState: "Days to a few weeks",
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
          name: "How to Land a Solar Installer Apprenticeship",
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

export default function HowToGetASolarApprenticeship() {
  return (
    <article className="resource-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>How to Land a Solar Installer Apprenticeship</h1>
      <p className="resource-intro">
        Use this guide to find{" "}
        <Link href="/resources/solar-installer-apprenticeship-programs">open solar apprenticeship programs</Link>.
        It also explains what selection committees look for.
      </p>

      <div className="resource-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>Electrical-track (JATC/union)</th>
              <th>Employer-run or state-registered</th>
            </tr>
          </thead>
          <tbody>
            {STEP_ROWS.map((row) => (
              <tr key={row.step}>
                <td>{row.step}</td>
                <td>{row.electricalTrack}</td>
                <td>{row.employerOrState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="resource-section">
        <h2>Two very different application paths</h2>
        <p>
          If your solar apprenticeship route runs through an electrical
          license, like Oregon's Limited Renewable Energy Technician track,
          you're applying through a Joint Apprenticeship Training Committee
          structure shared with the broader electrical trades. 
        </p>
        <p>
          Employer-run and state-registered programs usually skip formal tests
          and ranked eligibility lists. ReVision Energy and Florida's state
          pathway follow this model. Candidates apply much as they would for a
          job. The employer reviews a resume and interview for a paid position
          with structured training.
        </p>
      </section>

      <section className="resource-section">
        <h2>The JATC aptitude test</h2>
        <p>
          Programs that use the standard electrical apprenticeship test
          battery is often called by its former name: the NJATC test. The
          Electrical Training Alliance now administers it. Candidates complete
          algebra and reading-comprehension sections in about two and a half
          hours. Most locals require a minimum score before the interview.
          Four out of nine is a common threshold.
        </p>
        <p>
          The material is manageable even if you have not studied algebra
          since high school. Electric Prep and SkillsPrep offer free tools for
          this test. Several JATC websites refer applicants to them directly.
        </p>
      </section>

      <section className="resource-section">
        <h2>The ranking system nobody explains upfront</h2>
        <p>
          This is the part that trips up first-time applicants the most.
          Passing the test and interview does not guarantee immediate entry.
          The committee scores candidates and places them on an eligibility
          list. Some lists remain valid for up to two years.
        </p>
        <p>
          Offers go out in rank order as positions open. A strong score
          improves your place. It does not provide a start date.
        </p>
        <p>
          Timelines vary even for similarly qualified applicants. A candidate
          near the top of a busy list may start within weeks. Someone in the
          middle of a slower list may wait most of a year. Apply to every local
          that serves your area rather than relying on one list.
        </p>
      </section>

      <section className="resource-section">
        <h2>What moves your ranking up</h2>
        <p>
          Documented work experience carries real weight. Several JATC locals
          waive the minimum test score for applicants with roughly 2,000 to
          4,000 hours of related electrical construction experience. Those
          candidates still sit for the test so the committee has a score on
          file.
        </p>
        <p>
          A recognized pre-apprenticeship can also strengthen an application.
          Several JATCs explicitly credit that training. Documented veteran
          status submitted with a DD-214 may also affect scoring. These factors
          do not bypass the process. They give the committee more evidence
          before the test and interview.
        </p>
        <p>
          An <Link href="/certifications/osha-10">OSHA 10 card</Link> or{" "}
          <Link href="/certifications/nabcep-pv-associate">NABCEP Associate credential</Link>{" "}
          rarely appears as a formal scoring item. It still shows that you
          prepared before applying. A strong interview answer sends the same
          signal.
        </p>
      </section>

      <section className="resource-section">
        <h2>Where to apply</h2>
        <p>
          Apprenticeship.gov's Job Finder is the closest thing to a
          national search tool. Use it as a starting point, then check your
          state apprenticeship agency and local IBEW halls. Direct outreach
          to regional employers can uncover openings that never reach a
          national search.
        </p>
        <p>
          Eligibility lists are local and program availability varies by state.
          Applying to several programs at once is the most direct way to
          shorten the wait.
        </p>
      </section>

      <p className="resource-fine-print">
        Application steps, test formats and ranking criteria vary by program.
        These details reflect information available in mid-2026. Confirm the
        current requirements with the JATC, employer or state apprenticeship
        agency before applying.
      </p>
    </article>
  );
}
