import type { Metadata } from "next";

interface Provider {
  name: string;
  format: string;
  hours: string;
  price: string;
  examFee: string;
  body: string;
  link: string;
}

// Swap this for your real domain once, everything below reads from it.
const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/nabcep-training-providers-compared";
const PAGE_TITLE = "HeatSpring vs Everblue vs SEI (NABCEP Training Providers Comparison)";
const PAGE_DESCRIPTION =
  "An independent, updated comparison of NABCEP training providers, HeatSpring, Everblue, SEI, and in-person options, covering price, hours, and exam fees so you can pick the right path.";

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

const PROVIDERS: Provider[] = [
  {
    name: "HeatSpring",
    format: "Online, self-paced",
    hours: "18–24 hrs",
    price: "$400–600",
    examFee: "Usually included",
    body: `HeatSpring built its reputation on Dr. Sean White's books and courses. Both are widely used as industry references. Most students complete the Solar PV Boot Camp and NABCEP PV Associate Exam Prep in 18 to 24 hours. The course is self-paced and online, with access to materials for one year.

The pass guarantee is the key distinction. A student who completes the course and fails may retake the course and exam at no extra cost. HeatSpring reports a pass rate above 88 percent. The companion textbook costs another 25 to 35 dollars, while checkout typically includes the exam fee.

Best fit: people who already have some electrical or construction background and want the fastest, cheapest route to the PV Associate credential without cutting real corners.`,
    link: "https://www.heatspring.com",
  },
  {
    name: "Everblue",
    format: "Online, self-paced",
    hours: "40 hrs",
    price: "$700–900",
    examFee: "Included",
    body: `Everblue operates as a full-service training partner. Beyond the entry-level PV Associate package, it sells bundles for PV Installation Professional, PV Design Specialist and PV System Inspector. Each combines the required training hours with application paperwork filed by Everblue.

Pricing is higher than HeatSpring. The Associate package generally costs 700 to 900 dollars after the frequently offered discount. Advanced tracks run closer to 1,600 to 2,000 dollars. The entry package contains 40 hours across 24 sections.

Best fit: people who want a single predictable price that already includes the exam fee, a practice exam, and the eligibility paperwork, without assembling the steps themselves.`,
    link: "https://everbluetraining.com",
  },
  {
    name: "Solar Energy International (SEI)",
    format: "Online, plus in-person labs",
    hours: "60 hrs for PVOL101 alone",
    price: "$995 for PVOL101",
    examFee: "Paid to NABCEP directly",
    body: `SEI is a nonprofit that has trained solar professionals since 1991. Its curriculum is a sequence rather than a single boot camp. Courses such as PVOL101, PVOL202 and PVOL203 map to specific NABCEP requirements.

The foundational PVOL101 course runs for 60 hours online and costs 995 dollars. That is already more than a complete Associate package from some competitors. Students pay the NABCEP exam fee separately after completing their training hours.

SEI offers several ways to reduce the upfront burden. Students can use a payment plan, apply for scholarships or earn tuition through a work-trade program. No other provider in this comparison offers the last option. In-person labs add practical experience to the online courses. Colorado residents may also qualify for state workforce funding.

Best fit: people planning a career beyond the entry credential. It also suits students who need alternatives to paying the full cost upfront.`,
    link: "https://www.solarenergy.org",
  },
  {
    name: "NC Clean Tech Center (FSPV)",
    format: "In-person, 5 days",
    hours: "40 hrs",
    price: "$1,500–1,725",
    examFee: "Included",
    body: `NC State's Clean Technology Center offers a five-day Fundamentals of Solar PV Design and Installation course. It suits students who learn better in person. Tuition ranges from 1,500 to 1,725 dollars based on registration timing. A reduced student rate is about 350 dollars.

Four days cover classroom theory; the fifth is spent physically installing a grid-tied residential PV system. The NABCEP PV Associate exam fee is included in registration.

Best fit: people who want hands-on experience before entering a real jobsite and can commit a full week. Regional nonprofits such as the Midwest Renewable Energy Association run smaller in-person sessions. Their shorter online modules are better suited to recertification hours than a first Associate credential.`,
    link: "https://nccleantech.ncsu.edu",
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
          name: "NABCEP Training Providers Compared",
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

export default function NabcepTrainingComparison() {
  return (
    <article className="resource-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>NABCEP Training Providers Compared</h1>
      <p className="resource-intro">
        Compare HeatSpring, Everblue, SEI and in-person alternatives side by
        side. Prices change often. Confirm the current amount with each
        provider before enrolling.
      </p>

      <div className="resource-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Format</th>
              <th>Hours</th>
              <th>Price</th>
              <th>Exam fee</th>
            </tr>
          </thead>
          <tbody>
            {PROVIDERS.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.format}</td>
                <td>{p.hours}</td>
                <td>{p.price}</td>
                <td>{p.examFee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {PROVIDERS.map((p) => (
        <section key={p.name} className="resource-provider">
          <h2>{p.name}</h2>
          {p.body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <a href={p.link} target="_blank" rel="noopener noreferrer">
            Visit {p.name}
          </a>
        </section>
      ))}

      <section className="resource-provider">
        <h2>How to choose</h2>
        <p>
          HeatSpring suits independent learners who prioritize price and speed.
          Its retake guarantee also reduces the cost of a failed first attempt.
        </p>
        <p>
          Everblue suits candidates who want the exam fee and paperwork handled
          in one purchase.
        </p>
        <p>
          SEI offers more depth for a longer career. Its payment plan and
          work-trade program can also make the higher price manageable.
        </p>
        <p>
          An in-person intensive suits hands-on learners who can spare a week.
          NC State's course provides equipment experience that an online
          course cannot reproduce.
        </p>
        <p>
          No course guarantees a passing score or a job offer. Each covers the
          material NABCEP expects. The result still depends on preparation.
        </p>
      </section>

      <p className="resource-fine-print">
        Prices, course lengths and program details reflect information
        available in mid-2026. Confirm current pricing and availability with
        each provider before enrolling.
      </p>
    </article>
  );
}
