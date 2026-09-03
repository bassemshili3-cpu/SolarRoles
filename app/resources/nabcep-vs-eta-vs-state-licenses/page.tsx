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
const SITE_URL = "https://www.solarroles.com";
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
      dateModified: "2026-07-01",
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
          Both credentials come from legitimate nonprofit certification
          bodies. They are often presented as competitors. In practice, they
          suit different stages and styles of training.
        </p>
        <p>
          NABCEP's certification track generally assumes you already have
          field experience. To sit for the PV Installation Professional
          exam, candidates need training hours and documented involvement in
          a minimum number of installations. The pathway relies heavily on
          exams. It is also widely recognized by employers and government
          incentive programs across the country.
        </p>
        <p>
          ETA leans further into hands-on assessment. Its entry-level
          certification is designed for people who are newer to the field.
          Practical instruction from an ETA-approved school is part of the
          process. ETA also pairs its technical credential with a Customer
          Service Specialist certification. NABCEP does not include that
          requirement in its core pathway.
        </p>
        <p>
          Cost is one of the clearest differences. Initial certification and
          renewal through NABCEP tend to cost several times more than the
          comparable ETA level. Higher exam and application fees account for
          much of that gap.
        </p>
        <p>
          Price does not settle the choice. NABCEP has stronger recognition
          among employers and utility incentive programs. That can carry real
          value over a career.
        </p>
        <p>
          Many installers hold both credentials. Neither replaces field
          experience. Neither substitutes for a state license where the law
          requires one.
        </p>
      </section>

      <section className="resource-section">
        <h2>State contractor licenses: the one that isn't optional</h2>
        <p>
          Twelve states and Puerto Rico require a solar-specific contractor
          license according to the most recent tally. That credential is
          separate from a general electrical or plumbing license. Most other
          states still require an electrical contractor license to connect a
          PV system to the grid.
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
          Utah requires NABCEP certification before a professional can qualify
          for its state solar contractor license.
          California, Delaware and Massachusetts also favor NABCEP-certified
          professionals in some rebate and incentive programs. They do not
          make the credential a statewide legal requirement.
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
          The value goes beyond training. A program may offer better product
          pricing, priority technical support or marketing assistance.
          Enphase also uses partner tiers that affect access to new product
          allocations.
        </p>
        <p>
          These programs do not replace NABCEP, ETA or a state license. A
          manufacturer credential proves that you can install one company's
          equipment correctly. It does not validate broader knowledge of PV
          design or electrical codes. Permitting offices give it no legal
          weight.
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
          <SunBullet>
            <strong>Start with the legal requirement.</strong> Work toward a
            state contractor license when your state requires one. Until you
            qualify, accumulate supervised hours under a licensed contractor.
          </SunBullet>
          <SunBullet>
            <strong>Add NABCEP PV Associate early.</strong> It requires no
            field experience and demonstrates foundational knowledge while
            you build installation hours.
          </SunBullet>
          <SunBullet>
            <strong>Pursue NABCEP PV Installation Professional next.</strong>{" "}
            Apply once you have the documented field experience. The
            credential remains widely recognized by employers and incentive
            programs nationwide.
          </SunBullet>
          <SunBullet>
            <strong>Choose manufacturer programs selectively.</strong> Focus
            on one or two brands used by your employer or in your region.
            Those credentials can open access to specialized installation
            work.
          </SunBullet>
          <SunBullet>
            <strong>Consider ETA for a hands-on pathway.</strong> It can be
            valuable when practical assessment fits your training style or a
            local employer requests it. It does not match NABCEP's broader
            name recognition.
          </SunBullet>
        </ul>
      </section>

      <section className="resource-section">
        <h2>The main thing to remember</h2>
        <p>
          A national certification does not substitute for a legally required
          state license. That rule applies to NABCEP, ETA and manufacturer
          programs. A state license also does not remove an employer's
          certification requirements. Check your state's rules first. Build
          the rest of your credential stack from there.
        </p>
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
