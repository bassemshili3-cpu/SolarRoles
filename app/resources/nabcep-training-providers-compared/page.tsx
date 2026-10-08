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
const SITE_URL = "https://solarroles.com";
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
    format: "Online; self-paced with instructor support on the paid course",
    hours: "18–24 hours listed for the PV Associate boot camp",
    price: "Paid; confirm the current course price",
    examFee: "Separate from boot-camp tuition",
    body: `The PV Associate boot camp combines PV fundamentals with exam preparation. Its course page explicitly excludes the official exam fee from tuition. Check the package details for the application process and any optional materials.

HeatSpring also hosts free practice exams. Those exercises are separate from its qualifying courses: completing a practice test does not establish exam eligibility.`,
    link: "https://www.heatspring.com",
  },
  {
    name: "Everblue",
    format: "Online; live training is a separate option",
    hours: "40 hours for PV101",
    price: "Paid; compare course and credential-package quotes",
    examFee: "Check the selected package inclusions",
    body: `Everblue lists a 40-hour PV101 course and a separate PV Associate credential package. A course listing and a package quote may therefore cover different items. Compare the training, exam administration and live instruction included in the offer.

For the Associate Education Pathway, Everblue verifies completion of its approved program and helps arrange the exam. Advanced Board Certification still has experience requirements that a training purchase cannot supply.`,
    link: "https://everbluetraining.com/all-courses/category/solar/",
  },
  {
    name: "Solar Energy International (SEI)",
    format: "Scheduled online courses, in-person theory and separate labs",
    hours: "Course-specific; online theory courses generally 40–60 contact hours",
    price: "Paid; tuition depends on course sequence and lab selection",
    examFee: "Confirm whether the selected package includes testing",
    body: `SEI organizes its curriculum as a sequence of courses. PV101 and PVOL101 are classroom and online routes into its foundational PV material; later courses and labs address different skills. A single-course price cannot be compared directly with a multi-course certification package.

SEI publishes tuition-payment and funding options, including scholarships and workforce funding for eligible applicants. Availability and eligibility need to be confirmed with the school and funding agency before enrolling.`,
    link: "https://www.solarenergy.org/support/training-program/",
  },
  {
    name: "NC Clean Energy Technology Center (FSPV)",
    format: "Instructor-led; confirm the scheduled session and practical component",
    hours: "40-hour Fundamentals of Solar PV curriculum",
    price: "Session-specific; request current registration terms",
    examFee: "Confirm with the session organizer",
    body: `NC State's center offers a Fundamentals of Solar PV Design and Installation curriculum covering material for the Associate exam. Its instructor-led format should be compared with the actual scheduled session, including equipment access and practical work.

Travel, lodging and time away from work can change the total cost. Ask which exam charges and materials the registration includes rather than assuming that every session has the same package.`,
    link: "https://nccleantech.ncsu.edu/our-work/training/customized-clean-energy-trainings/",
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
      <p>
            HeatSpring, Everblue, SEI and NC State&apos;s clean-energy center offer different combinations of instruction and exam preparation. An employer&apos;s reimbursement policy, a community-college course or an apprenticeship may cover education you would otherwise fund yourself. For public funding, check <a href="https://www.careeronestop.org/LocalHelp/EmploymentAndTraining/find-WIOA-training-programs.aspx" target="_blank" rel="noopener noreferrer">WIOA-eligible programs</a> with the local workforce office; scholarships also have their own eligibility and intake dates.
          </p>

      <p>This comparison uses published course descriptions, listed training hours and stated exam-fee inclusions, checked on October 8, 2026. It does not rank teaching quality or pass rates: comparable cohort results are not available here. Current tuition could not be established consistently across all four offers, so the table does not reproduce older price ranges. Contact hours, estimated completion time and hands-on lab time are also different measures.</p>
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
            {p.name} program information
          </a>
        </section>
      ))}

      <section className="resource-provider">
        <h2>Compare the education you still need</h2>
        <p>The <a href="https://coursecatalog.nabcep.org/" target="_blank" rel="noopener noreferrer">NABCEP course catalog</a> identifies approved credit categories. Match those to the credential&apos;s requirements before comparing tuition: a beginner&apos;s course, advanced qualifying education and a question bank do different jobs.</p>
        <p>Self-study using the <a href="https://www.nabcep.org/resources/" target="_blank" rel="noopener noreferrer">NABCEP handbooks and exam references</a> can target gaps in exam knowledge. Free questions and manufacturer lessons may help with revision, but do not automatically supply qualifying hours.</p>
        <p>Request an itemized quote with tuition, testing and required materials shown separately. For classroom study, add travel and missed work. <a href="https://www.solarenergy.org/support/tuition-payments/" target="_blank" rel="noopener noreferrer">SEI&apos;s tuition-payment information</a> gives examples of funding arrangements to investigate; an award or reimbursement should be confirmed before committing to a course.</p>
      </section>
      <p>
            Provider links are non-affiliate references presented on the same basis. Paid courses are described for comparison, not as requirements for every applicant. No comparable pass-rate or total-price ranking is asserted.
          </p>
    </article>
  );
}
