import type { Metadata } from "next";

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
  "A practical guide to actually getting into a solar apprenticeship: how JATC-style electrical apprenticeships rank and select candidates, what the aptitude test covers, and how employer-run and state-registered programs differ.";

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
       Here is a practical guide to help you find 
      open solar apprenticeship slots, and see what 
      selection committees are actually screening for
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
          structure shared with the broader electrical trades. That process
          is formal, tested, and ranked, and it exists whether or not the
          specific opening is solar-focused.
        </p>
        <p>
          Employer-run and state-registered solar apprenticeships, like
          ReVision Energy's program or Florida's state-registered pathway,
          typically skip the formal testing and ranking system entirely.
          You apply the way you'd apply for a job, because in most respects
          it is one: a paid position with a structured training plan
          attached, evaluated by resume and interview rather than a scored
          aptitude test.
        </p>
      </section>

      <section className="resource-section">
        <h2>What the JATC aptitude test actually covers</h2>
        <p>
          Programs that use the standard electrical apprenticeship test
          battery (often referred to by its old name, the NJATC test, now
          administered through the Electrical Training Alliance) split into
          two sections: algebra and reading comprehension, run back to back
          with a short break, taking roughly two and a half hours total.
          Most locals set a minimum passing score, commonly around 4 out of
          9, before you're advanced to the interview stage.
        </p>
        <p>
          The material is more accessible than it sounds if you haven't
          touched algebra since high school. Free prep tools exist
          specifically for this test (Electric Prep and SkillsPrep are the
          two most commonly referenced), and several JATC websites
          point applicants toward them directly rather than leaving people
          to guess what's tested.
        </p>
      </section>

      <section className="resource-section">
        <h2>The ranking system nobody explains upfront</h2>
        <p>
          This is the part that trips up first-time applicants the most.
          Passing the test and doing well in the interview doesn't mean
          immediate acceptance. You get scored and placed on an eligibility
          list, sometimes valid for up to two years, and offers go out in
          rank order as apprenticeship slots actually open up. A strong
          interview score gets you a good position on that list; it doesn't
          guarantee a start date.
        </p>
        <p>
          That explains why two equally qualified applicants can have
          wildly different timelines. Someone ranked near the top of a
          list with high turnover might start within weeks. Someone ranked
          in the middle of a list with few annual openings could wait the
          better part of a year. Applying to only one local's list, when
          several may serve your area, is the single most common
          unforced error.
        </p>
      </section>

      <section className="resource-section">
        <h2>What actually moves your ranking up</h2>
        <p>
          Documented work experience carries real weight, and not just as a
          tiebreaker. Several JATC locals exempt applicants with roughly
          2,000 to 4,000 hours of related electrical construction
          experience from the minimum aptitude test score requirement
          entirely, though they're still required to sit for the test so
          the committee has an aptitude reading on file.
        </p>
        <p>
          Completing a recognized pre-apprenticeship program is another
          lever several JATCs explicitly credit toward eligibility, and
          documented veteran status, submitted with a DD-214, is commonly
          factored into scoring as well. None of these are shortcuts around
          the process; they're ways of arriving at the test and interview
          with a stronger file already in front of the committee.
        </p>
        <p>
          An OSHA 10 card or a NABCEP Associate credential earned beforehand
          rarely appears as a formal scoring criterion on its own, but it
          signals the same thing a strong interview answer does: you looked
          into this before showing up. Committees interview a lot of people
          who clearly haven't.
        </p>
      </section>

      <section className="resource-section">
        <h2>Where to actually apply</h2>
        <p>
          Apprenticeship.gov's Job Finder is the closest thing to a
          national search tool, pulling listings tied to registered
          programs and partners. In practice, it works best as a starting
          point rather than a complete list; state apprenticeship agencies
          (Florida and Oregon both maintain their own), IBEW local union
          halls for the electrical-track route, and direct outreach to
          regional employers running their own registered program often
          surface openings that never show up in a national search.
        </p>
        <p>
          Because eligibility lists are local and options vary so much by
          state, applying to more than one program at once, rather than
          waiting on a single application, is the most direct way to
          shorten however long this process ends up taking.
        </p>
      </section>

      <p className="resource-fine-print">
        Application steps, test formats, and ranking criteria vary by local
        program and change over time. Details reflect information available
        as of mid-2026. Confirm current requirements directly with the
        specific JATC, employer, or state apprenticeship agency before
        applying.
      </p>
    </article>
  );
}