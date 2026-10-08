import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sun } from "lucide-react";

interface Category {
  name: string;
  type: string;
  legal: string;
  governedBy: string;
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://solarroles.com";
const PAGE_PATH = "/resources/nabcep-vs-eta-vs-state-licenses";
const PAGE_TITLE =
  "NABCEP vs ETA vs State Licenses vs Manufacturer Certifications (2026)";
const PAGE_DESCRIPTION =
  "A clear, neutral breakdown of the four different solar credential types in the US: NABCEP, ETA International, state contractor licenses, and manufacturer installer programs like Tesla and Enphase.";

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

const CATEGORIES: Category[] = [
  {
    name: "NABCEP",
    type: "Voluntary national certification",
    legal: "No legal weight on its own",
    governedBy: "NABCEP (nonprofit)",
  },
  {
    name: "ETA International",
    type: "Voluntary national certification",
    legal: "No legal weight on its own",
    governedBy: "ETA International (nonprofit)",
  },
  {
    name: "State contractor license",
    type: "Legal requirement (where applicable)",
    legal: "Required to legally pull permits or run jobs",
    governedBy: "State licensing board",
  },
  {
    name: "Manufacturer certification",
    type: "Brand-specific training program",
    legal: "No legal weight, but affects pricing and eligibility",
    governedBy: "The manufacturer (Tesla, Enphase, SolarEdge, etc.)",
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
          name: "NABCEP vs ETA vs State Licenses vs Manufacturer Certifications",
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

function SunBullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Sun
        aria-hidden="true"
        className="mt-1.5 h-4 w-4 shrink-0 text-[#F2A93B]"
      />
      <span>{children}</span>
    </li>
  );
}

export default function NabcepVsEtaVsStateLicenses() {
  return (
    <article className="resource-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1>NABCEP vs ETA vs State Licenses vs Manufacturer Certifications</h1>
      <p className="resource-intro">
        Solar credentials fall into four categories. Industry certifications
        demonstrate knowledge. State licenses grant legal authority to do the
        work. Manufacturer programs prove that an installer has completed
        product-specific training. Choosing the wrong category can mean paying
        for a credential that does not yet help your career.
      </p>

      <div className="resource-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Type</th>
              <th>Legal weight</th>
              <th>Governed by</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c) => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.type}</td>
                <td>{c.legal}</td>
                <td>{c.governedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="resource-section">
        <h2>The four categories</h2>
        <ul className="!mb-6 !ml-0 list-none space-y-4 !pl-0">
          <SunBullet>
            <strong>NABCEP</strong> is a voluntary national certification. It
            does not grant legal permission to work. It tells employers and
            customers that you have met a recognized industry standard.
          </SunBullet>
          <SunBullet>
            <strong>ETA International</strong> is another voluntary
            certification body. It is older than NABCEP and is better known
            within the electronics and solar trades. Its pathway places more
            emphasis on hands-on assessment.
          </SunBullet>
          <SunBullet>
            <strong>State contractor licenses</strong> are legal requirements.
            In states that require one, you cannot pull permits or operate a
            solar business without the appropriate license. Voluntary
            certifications do not override that rule.
          </SunBullet>
          <SunBullet>
            <strong>Manufacturer certifications</strong> cover equipment from
            brands such as Tesla, Enphase, SolarEdge and IronRidge. They carry
            no legal authority. They can still unlock better pricing, lead
            referrals and eligibility to install products under warranty.
          </SunBullet>
        </ul>
      </section>

      <section className="resource-section">
        <h2>NABCEP vs ETA International</h2>
        <p>
            NABCEP and ETA publish different credential requirements. Compare the named credential, not just the organization: NABCEP&apos;s Associate route is different from its professional Board Certifications, while <a href="https://www.etai.org/renewable_energy.html" target="_blank" rel="noopener noreferrer">ETA&apos;s renewable-energy programs</a> specify their own training and assessment steps.
          </p>
        <p>
            NABCEP PVIP combines qualifying education, an exam and project responsibility. The Board Eligible option changes the order by allowing the exam before the experience is complete. Neither route means a beginner must earn PVIP before applying for a supervised installation job.
          </p>
        <p>
          ETA&apos;s Photovoltaic Installer Level 1 (PVI1) requires hands-on
          training from an approved school. Its more advanced PV2 credential
          has additional conditions, including field experience, approved
          training, OSHA 10 or an equivalent, and Customer Service Specialist
          certification. The requirements for one level should not be read
          as requirements for every ETA applicant.
        </p>
        <p>
            Compare application, exam and renewal fees separately from school tuition. A provider may package some of those charges together. Employer reimbursement or an eligible training program can change what the candidate pays, without changing the credential requirements.
          </p>
        <p>
            If an employer or project specifies NABCEP, ask which credential it means. An ETA certificate will not automatically satisfy a requirement naming PVIP, and a preferred qualification is different from a mandatory condition of employment.
          </p>
        <p>
          Neither organization&apos;s credential substitutes for a state
          license where the law requires one.
        </p>
      </section>

      <section className="resource-section">
        <h2>Licensing follows the work and jurisdiction</h2>
        <p>
            A contractor license can govern who offers the work or pulls permits; an individual electrical license can govern who performs it. States and local authorities use different categories and exemptions. Check both the company&apos;s authority and the worker&apos;s permitted duties in the jurisdiction where the project is located.
          </p>
        <p>
          In some states, an unlicensed worker can perform the work under the
          supervision of a license holder. Local rules determine the scope.
        </p>
        <p>
          NABCEP certification is not a state license. Holding it does not
          exempt you from local licensing rules. The two systems do intersect
          in a few places.
        </p>
        <p>
            Some licensing or incentive programs recognize industry credentials, but their conditions are specific to that jurisdiction or program. A national certificate does not establish that you meet every local prerequisite.
          </p>
        <p>
          Check your state's licensing rules before taking responsibility for
          a job. A national certification is portable across state lines. A
          contractor license generally is not.
        </p>
      </section>

      <section className="resource-section">
        <h2>Manufacturer certifications</h2>
        <p>
          Tesla, Enphase, SolarEdge and SMA run their own installer programs.
          Each one teaches the correct way to work with a specific product
          line. Examples include Tesla Powerwall and Solar Roof, Enphase
          microinverters and SolarEdge power optimizers.
        </p>
        <p>
            Manufacturers distinguish technician learning from commercial partner benefits. Product pricing and referrals may belong to the company&apos;s partner program rather than to a worker who completes an online course.
          </p>
        <p>
          These programs do not replace NABCEP, ETA or a state license. A manufacturer course documents completion of its stated learning requirements. It does not validate broader knowledge of PV
          design or electrical codes, or grant an electrical license.
        </p>
        <p>
          Product-specific training can still decide who gets specialized
          installation work. That is especially true for battery systems such
          as Powerwall and Enphase IQ Battery. The right manufacturer
          credential can also determine warranty eligibility.
        </p>
      </section>

      <section className="resource-section">
        <h2>How these stack for a real career</h2>
        <p>
          A long-term solar installation career usually requires a combination
          of credentials. The useful order depends on your state and the work
          you want to perform.
        </p>
        <ul className="!mb-6 !ml-0 list-none space-y-4 !pl-0">
          <SunBullet><strong>First installation job:</strong> Look for trainee or helper duties and the training the employer provides. Where electrical work requires registration, an apprentice license may be the entry route. A beginner does not normally apply for a contractor license simply to join a crew.</SunBullet>
          <SunBullet><strong>Covered electrical work:</strong> Follow the jurisdiction&apos;s licensing and supervision rules. Keep the records needed for progression; the rules for a journeyman, master and contractor are not interchangeable.</SunBullet>
          <SunBullet><strong>Advanced project responsibility:</strong> Check whether PVIP, PVIS or another named credential fits the role. Review eligibility and employer support before committing to coursework.</SunBullet>
          <SunBullet><strong>Equipment-specific assignment:</strong> Complete the manufacturer learning path the employer needs. Enphase and SolarEdge offer free online learning; company approval and tool access are separate conditions.</SunBullet>
        </ul>
      </section>



      <p className="resource-fine-print">
        The licensing rules, certification costs and manufacturer program
        details on this page reflect information available in mid-2026. These
        details change over time. State requirements are especially likely to
        change. Confirm the current rules with your state licensing board and
        the relevant certifying body before enrolling or applying for a
        license.
      </p>
    </article>
  );
}
