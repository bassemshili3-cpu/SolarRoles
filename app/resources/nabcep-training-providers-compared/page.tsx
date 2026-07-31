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
const PAGE_TITLE = "NABCEP Training Providers Compared (2026): HeatSpring vs Everblue vs SEI";
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
    body: `HeatSpring built its reputation on Dr. Sean White's books and courses, which show up constantly as reference material across the industry. The Solar PV Boot Camp plus NABCEP PV Associate Exam Prep course is built for speed: most students finish in 18 to 24 hours, entirely online and at their own pace, with a full year of access to course materials.

The standout feature is the pass guarantee. Students who complete the course and still fail the exam can retake both the course and the exam at no extra cost, and HeatSpring reports a pass rate above 88 percent. The companion textbook isn't included in the course price (expect to pay 25 to 35 dollars separately), but the exam fee is typically bundled into checkout.

Best fit: people who already have some electrical or construction background and want the fastest, cheapest route to the PV Associate credential without cutting real corners.`,
    link: "https://www.heatspring.com",
  },
  {
    name: "Everblue",
    format: "Online, self-paced",
    hours: "40 hrs",
    price: "$700–900",
    examFee: "Included",
    body: `Everblue acts more like a full-service training partner than a course seller. Past the entry-level PV Associate package, it offers bundles for PV Installation Professional, PV Design Specialist, and PV System Inspector, each combining the required hours with the NABCEP application paperwork Everblue files on your behalf.

Pricing sits higher than HeatSpring, generally 700 to 900 dollars for the Associate package after the discount that seems to run almost continuously on their site, and closer to 1,600 to 2,000 dollars for the advanced tracks. The entry package runs 40 hours across 24 sections.

Best fit: people who want a single predictable price that already includes the exam fee, a practice exam, and the eligibility paperwork, without assembling the steps themselves.`,
    link: "https://everbluetraining.com",
  },
  {
    name: "Solar Energy International (SEI)",
    format: "Online, plus in-person labs",
    hours: "60 hrs for PVOL101 alone",
    price: "$995 for PVOL101",
    examFee: "Paid to NABCEP directly",
    body: `SEI is a nonprofit that has trained solar professionals since 1991, and its curriculum reflects that history. Instead of one bootcamp, SEI sells a sequence of individual courses (PVOL101, PVOL202, PVOL203, and so on), each mapped to specific NABCEP requirements.

The foundational course, PVOL101, runs 60 hours online and costs 995 dollars by itself, already more than a full Associate package elsewhere. SEI doesn't fold the NABCEP exam fee into its pricing; students pay NABCEP directly once training hours are complete.

What sets SEI apart is flexibility for people without much cash up front: a formal payment plan, scholarships, and a work-trade program where students can earn their tuition by working for SEI, an option no other provider here offers. In-person labs pair with the online coursework for hands-on practice, and Colorado residents may qualify for state workforce funding.

Best fit: people planning a longer career rather than just the entry credential, or anyone for whom the up-front cost of other providers is the real obstacle.`,
    link: "https://www.solarenergy.org",
  },
  {
    name: "NC Clean Tech Center (FSPV)",
    format: "In-person, 5 days",
    hours: "40 hrs",
    price: "$1,500–1,725",
    examFee: "Included",
    body: `For people who learn better in a room than on a screen, NC State's Clean Technology Center runs a 5-day Fundamentals of Solar PV Design and Installation course. Pricing runs 1,500 to 1,725 dollars depending on registration timing, with a reduced student rate near 350 dollars.

Four days cover classroom theory; the fifth is spent physically installing a grid-tied residential PV system. The NABCEP PV Associate exam fee is included in registration.

Best fit: people who want hands-on installation experience before ever setting foot on a real job site, and who can take a full week away from other commitments. Regional nonprofits such as the Midwest Renewable Energy Association run comparable in-person sessions on a smaller scale, though their shorter online modules suit topping up hours for recertification better than a first-time Associate path.`,
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
        HeatSpring, Everblue, SEI, and in-person alternatives, side by side.
        Prices change often, so confirm current numbers directly with
        each provider before enrolling.
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
        <h2>How to actually choose</h2>
        <p>
          If money and speed matter most, and you learn fine on your own,
          HeatSpring's boot camp is hard to beat on price, and the retake
          guarantee removes the risk of paying twice if you fail.
        </p>
        <p>
          If you'd rather have everything handled in one purchase, including
          the exam fee and paperwork, Everblue's bundles are built for that.
        </p>
        <p>
          If you're building a long career rather than just a first
          credential, or the up-front cost elsewhere is a real obstacle,
          SEI's depth, payment plan, and work-trade program justify the
          higher price and slower pace.
        </p>
        <p>
          If you learn best with your hands on real equipment and can spare a
          week, an in-person intensive like NC State's course will teach you
          things no online course can.
        </p>
        <p>
          None of these paths guarantee a passing score or a job offer. They
          guarantee you'll cover the material NABCEP expects you to know. The
          rest comes down to how much effort goes into the studying, not
          which logo sits on the certificate of completion.
        </p>
      </section>

      <p className="resource-fine-print">
        Prices, course lengths, and program details reflect information
        available as of mid-2026 and are subject to change. Confirm current
        pricing and availability directly with each provider before
        enrolling.
      </p>
    </article>
  );
}