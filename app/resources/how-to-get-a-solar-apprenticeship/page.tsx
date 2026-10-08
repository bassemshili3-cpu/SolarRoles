import type { Metadata } from "next";
import Link from "next/link";

interface StepRow {
  step: string;
  electricalTrack: string;
  employerOrState: string;
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://solarroles.com";
const PAGE_PATH = "/resources/how-to-get-a-solar-apprenticeship";
const PAGE_TITLE =
  "How to Land a Solar Installer Apprenticeship: 2026 Edition";
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
    employerOrState: "Testing or skills checks depend on the sponsor",
  },
  {
    step: "Interview",
    electricalTrack: "Panel interview (JATC committee), scored",
    employerOrState: "Standard hiring-style interview",
  },
  {
    step: "Outcome",
    electricalTrack: "Ranked on an eligibility list, offers by rank order",
    employerOrState: "Employer / sponsor selection; waiting lists may apply",
  },
  {
    step: "Typical wait",
    electricalTrack: "Weeks to several months, sometimes longer",
    employerOrState: "Depends on hiring and program intake",
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
            Employer-run programs may begin with an ordinary job application, while a JATC may use a separate admission process. The sponsor&apos;s current notice controls. Look for diploma or GED requirements, transcripts showing any required algebra credit, and a driver&apos;s license if the role involves driving. Submit a resume describing tools, safety training and related work; these requirements are not universal across programs.
          </p>
      </section>

      <section className="resource-section">
        <h2>The JATC aptitude test</h2>
        <p>
            Electrical apprenticeship aptitude testing commonly covers algebra and reading comprehension. The sponsor sets its testing arrangements, minimum score and any exceptions. Obtain those details from the local program rather than relying on a national preparation site&apos;s claimed cutoff.
          </p>
        <p>
            The <a href="https://www.electricaltrainingalliance.org/SamplePage/PreparingfortheTest" target="_blank" rel="noopener noreferrer">electrical training ALLIANCE&apos;s free sample questions</a> show the algebra and reading tasks used in its test battery. Work through them before deciding whether you need additional preparation. For missing algebra foundations, <a href="https://www.khanacademy.org/math/algebra" target="_blank" rel="noopener noreferrer">Khan Academy&apos;s algebra lessons</a> are free; neither resource guarantees a qualifying score.
          </p>
      </section>

      <section className="resource-section">
        <h2>The ranking system nobody explains upfront</h2>
        <p>
            Passing a test and interview may place you on an eligibility list rather than produce an immediate offer. Ask when the list expires and what the program permits if you want to re-interview or update your work experience.
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
            Related work can matter in selection, but only the sponsor can confirm how it affects testing or ranking. Keep dates, hours and supervisor contacts for electrical or construction jobs. Ask which records the committee accepts rather than assuming a particular number of hours guarantees an exemption.
          </p>
        <p>
          A recognized pre-apprenticeship can also strengthen an application.
          Several JATCs explicitly credit that training. Documented veteran
          status submitted with a DD-214 may also affect scoring. These factors
          do not bypass the process. They give the committee more evidence
          before the test and interview.
        </p>
        <p>
            An existing OSHA card or solar course belongs on the resume, but buying another credential is not a substitute for missing admission documents. Prioritize the sponsor&apos;s stated requirements and prepare examples of reliable attendance, safe work and learning a new task.
          </p>
      </section>

      <section className="resource-section">
        <h2>Where to apply</h2>
        <p>
            Search <a href="https://www.apprenticeship.gov/apprenticeship-job-finder" target="_blank" rel="noopener noreferrer">Apprenticeship.gov&apos;s Job Finder</a>, then follow the employer or sponsor&apos;s application link. Check the <a href="https://www.apprenticeship.gov/contact-us" target="_blank" rel="noopener noreferrer">state apprenticeship office</a> and local JATC for programs not currently advertising there. Direct applications to regional contractors are also useful, provided you verify that the position is part of a registered program if that is the route you want.
          </p>
        <p>
          Eligibility lists are local and program availability varies by state.
          Applying to several programs at once is the most direct way to
          shorten the wait.
        </p>
      </section>

      <p className="resource-fine-print">
        Application steps, test formats and ranking criteria vary by program.
        Confirm the
        current requirements with the JATC, employer or state apprenticeship
        agency before applying.
      </p>
    </article>
  );
}
