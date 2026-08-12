import type { Metadata } from "next";
import Link from "next/link";
import { Sora } from "next/font/google";
import { articleCss } from "../_shared/article-styles";

const sora = Sora({ subsets: ["latin"], weight: ["700", "800"], display: "swap" });

const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/solar-engineer-jobs";
const PAGE_TITLE = "Types of Solar Engineer Jobs (2026 Guide)";
const PAGE_DESCRIPTION =
  "Every solar engineer job title mapped to what it does, what it pays, and what you need — from PV design to BESS.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Solar Roles",
    type: "article",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: `${SITE_URL}${PAGE_PATH}`,
      dateModified: "2026-08-12",
      author: [{ "@type": "Organization", name: "Solar Roles" }],
      publisher: { "@type": "Organization", name: "Solar Roles" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 2, name: PAGE_TITLE, item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What software do solar design engineers use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The most common tools are PVsyst for production modeling, Helioscope and Aurora Solar for layout and shading analysis, and AutoCAD or AutoCAD Civil 3D for plan sets. Utility-scale roles add PVCase or PlantPredict for large-array optimization and interconnection studies.",
          },
        },
        {
          "@type": "Question",
          name: "Do solar engineers need a PE license?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not for most design roles. A Professional Engineer (PE) license is required when someone needs to stamp structural or electrical drawings, which matters most at utility scale and for certain commercial permits. Many residential and small-commercial design roles do not require a PE, though holding an EIT (Engineer in Training) is increasingly common on job postings.",
          },
        },
        {
          "@type": "Question",
          name: "What's the difference between a solar design engineer and a solar installer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A solar installer works on the roof or ground mount physically building the system — racking, panels, wiring. A solar design engineer works in software before anything is built: system layout, electrical calculations, production modeling, and permit documents. Installers can move into design roles after learning the software and code requirements.",
          },
        },
        {
          "@type": "Question",
          name: "Can I become a solar design engineer without an engineering degree?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, for many roles. A significant share of residential and small-commercial design engineer postings accept a technician background plus software proficiency (PVsyst, Aurora, Helioscope) and NABCEP certification in lieu of a 4-year engineering degree. PE-track and utility-scale roles more consistently require an ABET-accredited engineering degree.",
          },
        },
        {
          "@type": "Question",
          name: "What is the salary range for solar engineers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Based on aggregated job postings, residential solar design engineers typically range from $60,000 to $85,000, commercial and utility-scale design engineers from $80,000 to $120,000, and senior or PE-licensed engineers from $110,000 to $150,000+. Exact figures vary by employer, region, and scope.",
          },
        },
        {
          "@type": "Question",
          name: "What certifications help for solar engineering jobs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "NABCEP PV Installation Professional (PVIP) is the most commonly requested solar-specific credential on engineering postings. EIT or PE licensure matters for stamping roles. Some employers also list NABCEP PV Design Specialist or manufacturer certifications from Tesla, Enphase, or SolarEdge for design roles.",
          },
        },
        {
          "@type": "Question",
          name: "Is solar thermal engineering a real career path in the US?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It exists but is rare. The US solar market is overwhelmingly photovoltaic (PV) — solar thermal (hot water, process heat) makes up a very small share of installations and job postings. Most 'solar engineer' roles you'll find are PV-focused. If you're interested in thermal, it's usually a niche within mechanical engineering.",
          },
        },
      ],
    },
  ],
};

export default function SolarEngineerJobs() {
  return (
    <div className="sr2-page">
      <style dangerouslySetInnerHTML={{ __html: articleCss }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="sr2-title">
        <span className="eyebrow"><span className="d" />Engineering careers · Job titles · 2026</span>
        <h1 className={sora.className}>
          Types of <span className="accent">Solar Engineer</span> Jobs
        </h1>
        <p className="sub">{PAGE_DESCRIPTION}</p>
      </div>

      <div className="sr2-meta-strip flex justify-center items-center gap-2">
        <span><strong>Last reviewed:</strong> 12 August, 2026</span>
      </div>

      <div className="sr2-shell">
        <aside className="sr2-toc-col" aria-label="Table of contents">
          <div className="sr2-toc-card">
            <div className="sr2-toc-head">Table of Contents</div>
            <ol className="sr2-toc-list">
              <li><a href="#confusion">Why are They so many Titles</a></li>
              <li><a href="#mapping">Job Title Mapping Table</a></li>
              <li><a href="#pv-design">PV Design Engineer</a></li>
              <li><a href="#systems">Solar Systems Engineer</a></li>
              <li><a href="#project">Solar Project Engineer</a></li>
              <li><a href="#electrical">Electrical Engineer (Solar)</a></li>
              <li><a href="#thermal">Solar Thermal Engineer</a></li>
              <li><a href="#bess">BESS Engineer</a></li>
              <li><a href="#scope">Residential vs. Commercial vs. Utility</a></li>
              <li><a href="#career-path">Career Path / Progression</a></li>
              <li><a href="#degree">Do You Need an Engineering Degree?</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ol>
          </div>
        </aside>

        <article className="sr2-article">
          <h2 id="confusion"><span className="n">01</span>Why are they so many titles ?</h2>
          <p>
            If you've searched "solar engineer" on any job board, you already know the problem. One posting calls the role "Solar Design Engineer," and the next "PV Systems Engineer," and a third "Electrical Engineer — Solar." 
          </p>
          <p>
            The root cause is structural. Solar is a young industry with no single standardized BLS/SOC occupational code covering these roles. The Bureau of Labor Statistics tracks "Electrical Engineers" (17-2071) and "Mechanical Engineers" (17-2141), but there's no "Solar Engineer" code. So every EPC, installer, and utility names the role however their internal structure dictates. A 200-person residential installer and a utility-scale EPC can both post a "Solar Design Engineer" and mean genuinely different jobs.
          </p>
          <p>
            This guide maps the real titles you'll see in postings to what the job involves, what employers ask for, and what it pays. It's built from patterns observed across Indeed, LinkedIn, ZipRecruiter, and company career pages.
          </p>

          <h2 id="mapping"><span className="n">02</span>Job Title Mapping Table</h2>
          <p>
            Find the title you're looking at, and this table tells you which functional bucket it belongs to.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0 28px", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#0B1A2E", color: "#fff" }}>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>Functional category</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>Common real-world job titles</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>One-line description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #E5E9F0" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0B1A2E" }}>PV Design Engineer</td>
                <td style={{ padding: "10px 12px" }}>Solar Design Engineer, PV Design Engineer, Solar Designer, Design Technician</td>
                <td style={{ padding: "10px 12px" }}>Lays out arrays, sizes conductors and racking, runs production models, produces permit-ready drawings.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #E5E9F0", background: "#F2F5FA" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0B1A2E" }}>Solar Systems Engineer</td>
                <td style={{ padding: "10px 12px" }}>Solar Systems Engineer, PV Systems Engineer, Solar Energy Systems Engineer</td>
                <td style={{ padding: "10px 12px" }}>Owns the whole system architecture: electrical, structural, and performance.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #E5E9F0" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0B1A2E" }}>Solar Project Engineer</td>
                <td style={{ padding: "10px 12px" }}>Solar Project Engineer, Project Engineer — Solar, Solar Construction Engineer</td>
                <td style={{ padding: "10px 12px" }}>Bridges design and field: RFIs, submittals, as-builts, and solving site issues during construction.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #E5E9F0", background: "#F2F5FA" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0B1A2E" }}>Electrical Engineer (Solar)</td>
                <td style={{ padding: "10px 12px" }}>Electrical Engineer — Solar, Solar Electrical Engineer, PV Electrical Engineer</td>
                <td style={{ padding: "10px 12px" }}>Focuses on the electrical side: one-line diagrams, protection, interconnection, code compliance.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #E5E9F0" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0B1A2E" }}>Solar Thermal Engineer</td>
                <td style={{ padding: "10px 12px" }}>Solar Thermal Engineer, Solar Hot Water Designer</td>
                <td style={{ padding: "10px 12px" }}>Designs solar hot water and process-heat systems. Rare in the US, mostly PV dominates.</td>
              </tr>
              <tr style={{ background: "#F2F5FA" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0B1A2E" }}>BESS Engineer</td>
                <td style={{ padding: "10px 12px" }}>BESS Engineer, Energy Storage Engineer, Battery Storage Design Engineer</td>
                <td style={{ padding: "10px 12px" }}>Designs battery storage systems — the fastest-growing engineering niche in solar right now.</td>
              </tr>
            </tbody>
          </table>

          <h2 id="pv-design"><span className="n">03</span>Photovoltaic (PV) Design Engineer</h2>
          <p>
            This is the most common "solar engineer" posting you'll find, and the most accessible entry point. A PV Design Engineer takes a site — a roof, a parking lot, a ground mount, and turns it into a buildable system.
          </p>
          <p><strong>Day-to-day:</strong> Site layout in software, string sizing, conductor and conduit sizing, racking selection, shading analysis, production estimates, and producing the drawing set that goes to permitting. At residential companies, this role often overlaps with sales engineering — the design has to be cost-competitive.</p>
          <p><strong>Software commonly required:</strong> PVsyst (production modeling), Helioscope or Aurora Solar (layout and shading), AutoCAD (plan sets). Some postings add SketchUp for 3D modeling.</p>
          <p><strong>Certifications commonly requested:</strong> NABCEP PV Installation Professional (PVIP) shows up on a meaningful share of postings. NABCEP PV Design Specialist is less common but appears on more senior roles. EIT is a plus but rarely required at this level.</p>
          <p><strong>Degree requirement:</strong> Many residential and small-commercial design roles do <em>not</em> strictly require a 4-year engineering degree. Postings frequently accept an associate degree plus software proficiency and field experience. Utility-scale design roles are more likely to require a BS in electrical or mechanical engineering.</p>
          <p><strong>Salary range:</strong> Aggregated from job postings: roughly $60,000–$85,000 for residential design, $80,000–$110,000 for commercial/utility design. Senior or PE-licensed roles push $110,000–$140,000. Exact figures vary by employer and region.</p>
          <p><strong>Scope skew:</strong> Residential and small-commercial, with utility-scale roles at larger EPCs.</p>

          <h2 id="systems"><span className="n">04</span>Solar Systems Engineer</h2>
          <p>
            "Solar Systems Engineer" and "PV Systems Engineer" are the titles employers use when they want someone who owns the whole system. These roles appear more often at EPCs, integrators, and companies building larger projects.
          </p>
          <p><strong>Day-to-day:</strong> System architecture, electrical design (DC and AC sides), structural coordination, performance modeling, equipment selection (inverters, transformers, trackers), and technical review of designs produced by others. Systems engineers are the ones answering "will this work and meet code?" questions across the project.</p>
          <p><strong>Software commonly required:</strong> PVsyst, PVCase or PlantPredict for utility-scale optimization, AutoCAD, and often specialized tools like CYMCAP for cable ampacity or ETAP for protection studies.</p>
          <p><strong>Certifications commonly requested:</strong> NABCEP PVIP is frequently listed. EIT/PE track is more common here than in residential design. Some postings explicitly say "PE preferred" or "EIT required."</p>
          <p><strong>Degree requirement:</strong> A BS in electrical engineering is the most common requirement on these postings. Mechanical engineering degrees appear for structural-heavy roles. Some employers accept equivalent experience, but the bar is higher than residential design.</p>
          <p><strong>Salary range:</strong> Aggregated from job postings: $80,000–$120,000 for mid-level, $110,000–$150,000+ for senior or PE-licensed. Utility-scale systems engineers at large EPCs sit at the top of that range.</p>
          <p><strong>Scope skew:</strong> Commercial and utility-scale.</p>

          <h2 id="project"><span className="n">05</span>Solar Project Engineer</h2>
          <p>
            Project Engineer is a construction-industry title that solar has adopted. It's the role that sits between the design office and the field crew — and it's a common lateral move for design engineers who want more site exposure.
          </p>
          <p><strong>Day-to-day:</strong> Managing RFIs (requests for information), reviewing submittals, coordinating with the general contractor and subcontractors, tracking as-built changes, and solving problems that only show up once construction starts. On smaller companies, the Project Engineer might also do the design. On larger EPCs, it's a dedicated coordination role.</p>
          <p><strong>Software commonly required:</strong> AutoCAD (reading and marking up drawings), Procore or similar construction management software, and Microsoft Project or Primavera for scheduling. Design software is less central here than in design roles.</p>
          <p><strong>Certifications commonly requested:</strong> NABCEP PVIP is a plus. OSHA 30 is frequently required for site work. EIT/PE is less common unless the role includes stamping responsibility.</p>
          <p><strong>Degree requirement:</strong> A BS in engineering (civil, mechanical, or electrical) is the most common requirement, but construction management degrees and equivalent field experience also appear on postings.</p>
          <p><strong>Salary range:</strong> Aggregated from job postings: $70,000–$100,000 for mid-level, $95,000–$130,000 for senior project engineers at utility-scale EPCs.</p>
          <p><strong>Scope skew:</strong> Commercial and utility-scale, with some large residential builders hiring project engineers for multi-site rollouts.</p>

          <h2 id="electrical"><span className="n">06</span>Electrical Engineer (Solar Focus)</h2>
          <p>
            These postings are usually written by companies that need a licensed-track electrical engineer who understands PV. The emphasis is on the electrical side of the system.
          </p>
          <p><strong>Day-to-day:</strong> One-line and three-line diagrams, protection and coordination studies, grounding design, interconnection applications to the utility, and code compliance (NEC Article 690 for PV, Article 705 for interconnected systems). At utility scale, this role also handles substation and medium-voltage design coordination.</p>
          <p><strong>Software commonly required:</strong> AutoCAD Electrical, ETAP or SKM for protection studies, and sometimes CYMCAP. PVsyst appears less often here, this is an electrical engineering role.</p>
          <p><strong>Certifications commonly requested:</strong> EIT is frequently required, PE is often preferred or required for stamping roles. NABCEP PVIP is a plus but secondary to the electrical credentials.</p>
          <p><strong>Degree requirement:</strong> A BS in electrical engineering from an ABET-accredited program is the standard requirement. This is the one solar engineering category where the degree is genuinely hard to bypass — PE-track roles require it by definition.</p>
          <p><strong>Salary range:</strong> Aggregated from job postings: $80,000–$115,000 for EIT-level, $110,000–$150,000+ for PE-licensed. Utility-scale electrical engineers at large EPCs and utilities sit at the top.</p>
          <p><strong>Scope skew:</strong> Commercial and utility-scale, with some residential companies hiring electrical engineers for interconnection-heavy markets.</p>

          <h2 id="thermal"><span className="n">07</span>Solar Thermal Engineer</h2>
          <p>
            This is rare in the US market. Solar thermal — systems that heat water or process fluids — makes up a very small share of US solar installations, and job postings reflect that. Most "solar engineer" roles you'll find are PV-focused.
          </p>
          <p>
            When solar thermal roles do appear, they're usually within mechanical engineering departments at companies doing industrial process heat, or at specialized firms serving the commercial hot-water market. The skills are closer to HVAC and plumbing design than to PV electrical work.
          </p>
          <p>
            If you're interested in thermal, the honest advice is to pursue a mechanical engineering background and look for companies with a thermal product line — don't expect a dedicated "solar thermal engineer" job board to be useful.
          </p>

          <h2 id="bess"><span className="n">08</span>BESS Engineer</h2>
          <p>
            Battery Energy Storage Systems (BESS) engineering is the fastest-growing corner of solar engineering right now. Storage is being added to residential, commercial, and utility-scale projects across the country, and the labor shortage is real.
          </p>
          <p>
            A BESS Engineer designs the storage side: battery sizing, inverter and PCS selection, thermal management, fire safety per NFPA 855, and the controls that make the system dispatchable. At utility scale, this includes containerized systems, medium-voltage integration, and grid services modeling.
          </p>
          <p>
            We have a dedicated guide on <Link href="/resources/do-you-need-to-be-an-electrician-for-bess">BESS technician requirements</Link> and a <Link href="/bess-technician-jobs">BESS technician jobs board</Link> — the engineering side is a step up from technician work, but the same market dynamics apply: demand is growing faster than the supply of qualified people.
          </p>

          <h2 id="scope"><span className="n">09</span>Residential vs. Commercial vs. Utility-Scale: How Scope Changes the Job</h2>
          <p>
            The same title means different work depending on the market segment. This matters more in solar than in most industries.
          </p>
          <p>
            <strong>Residential:</strong> Design engineers deal with permitting variance state-by-state and jurisdiction-by-jurisdiction. Every AHJ (Authority Having Jurisdiction) has its own requirements, and a design that passes in one county can fail in the next. The work is high-volume — dozens of small designs per week — and cost pressure is intense. Residential solar is in a harder market right now, with slower installs and tighter margins, which means design roles here are more exposed to market swings.
          </p>
          <p>
            <strong>Commercial:</strong> Design engineers work on larger rooftops and parking structures with more complex electrical systems — three-phase, higher voltages, more interconnection coordination. The design cycle is longer and the stakes per project are higher. This is where the "systems engineer" title starts to appear.
          </p>
          <p>
            <strong>Utility-scale:</strong> Design engineers deal with interconnection studies, medium-voltage collection systems, tracker layouts, and BOM complexity that residential designers never touch. Projects take 1–3 years from design to energization. This segment is labor-short and pays the most, but it also demands the most formal engineering background — PE licensure is common, and the design work is closer to traditional power engineering than to residential solar.
          </p>
          <p>
            The practical takeaway: if you're entering the field, residential design is the most accessible on-ramp. If you're aiming for the top of the pay range, utility-scale and BESS are where the market is heading.
          </p>

          <h2 id="career-path"><span className="n">10</span>Career Path / Progression Map</h2>
          <p>
            Solar engineering careers are less rigid than traditional engineering tracks, which is good for people entering from adjacent fields. Here are the realistic paths:
          </p>
          <ul>
            <li><strong>Technician → Junior Design Engineer → Design Engineer → Senior Design Engineer:</strong> The most common non-degree path. Field experience plus software proficiency (PVsyst, Aurora, Helioscope) plus NABCEP certification can substitute for a degree at many residential and small-commercial companies.</li>
            <li><strong>Design Engineer → Project Engineer → Project Manager:</strong> A lateral move that trades design depth for construction coordination. Project Engineers who can read drawings, manage RFIs, and keep schedules on track often move into project management within 2–4 years.</li>
            <li><strong>Design Engineer → Systems Engineer → PE-licensed Senior Engineer:</strong> The degree-required track. Systems engineering roles at EPCs and utilities lead toward PE licensure and the highest salaries in the field.</li>
            <li><strong>Electrical Engineer → Solar Electrical Engineer → Utility Interconnection / Grid Engineer:</strong> Electrical engineers can specialize into interconnection and grid integration, which is one of the most in-demand niches as solar penetration grows.</li>
          </ul>
          <p>
            The key insight: your first solar engineering job doesn't lock you in. The industry is young enough that lateral moves between design, project, and systems roles are common — and the fastest-growing segment (BESS) is pulling people from all of them.
          </p>

          <h2 id="degree"><span className="n">11</span>Do You Need an Engineering Degree?</h2>
          <p>
            <strong>It really depends on the role.</strong>
          </p>
          <p>
            For residential and small-commercial design roles, a significant share of postings accept a technician background plus software proficiency and NABCEP certification in lieu of a 4-year engineering degree. If you can demonstrate PVsyst and Aurora proficiency, understand string sizing and NEC basics, and have field experience, you're competitive for these roles without a degree.
          </p>
          <p>
            For systems engineering and utility-scale roles, a BS in electrical or mechanical engineering is the standard requirement. PE-track roles require an ABET-accredited degree by definition.
          </p>
          <p>
            The middle ground: an associate degree in engineering technology plus NABCEP certification plus software skills can get you into residential design, and from there you can build toward commercial roles. The ceiling without a degree is real but higher than most people assume — it's roughly at the senior design engineer level, before PE-track systems engineering.
          </p>

          <h2 id="faq"><span className="n">12</span>FAQ</h2>

          <h3>What software do solar design engineers use?</h3>
          <p>
            The most common tools are PVsyst for production modeling, Helioscope and Aurora Solar for layout and shading analysis, and AutoCAD or AutoCAD Civil 3D for plan sets. Utility-scale roles add PVCase or PlantPredict for large-array optimization and interconnection studies.
          </p>

          <h3>Do solar engineers need a PE license?</h3>
          <p>
            Not for most design roles. A Professional Engineer (PE) license is required when someone needs to stamp structural or electrical drawings, which matters most at utility scale and for certain commercial permits. Many residential and small-commercial design roles do not require a PE, though holding an EIT (Engineer in Training) is increasingly common on job postings.
          </p>

          <h3>What's the difference between a solar design engineer and a solar installer?</h3>
          <p>
            A solar installer works on the roof or ground mount physically building the system. A solar design engineer works in software before anything is built: system layout, electrical calculations, production modeling, and permit documents. Installers can move into design roles after learning the software and code requirements.
          </p>

          <h3>Can I become a solar design engineer without an engineering degree?</h3>
          <p>
            Yes, for many roles. A significant share of residential and small-commercial design engineer postings accept a technician background plus software proficiency (PVsyst, Aurora, Helioscope) and NABCEP certification in lieu of a 4-year engineering degree. PE-track and utility-scale roles more consistently require an ABET-accredited engineering degree.
          </p>

          <h3>What is the salary range for solar engineers?</h3>
          <p>
            Residential solar design engineers typically range from $60,000 to $85,000, commercial and utility-scale design engineers from $80,000 to $120,000, and senior or PE-licensed engineers from $110,000 to $150,000+. Exact figures vary by employer, region, and scope.
          </p>

          <h3>What certifications help for solar engineering jobs?</h3>
          <p>
            NABCEP PV Installation Professional (PVIP) is the most commonly requested solar-specific credential on engineering postings. EIT or PE licensure matters for stamping roles. Some employers also list NABCEP PV Design Specialist or manufacturer certifications from Tesla, Enphase, or SolarEdge for design roles.
          </p>

          <h3>Is solar thermal engineering a real career path in the US?</h3>
          <p>
            It exists but is rare. The US solar market is overwhelmingly photovoltaic (PV) — solar thermal (hot water, process heat) makes up a very small share of installations and job postings. Most "solar engineer" roles you'll find are PV-focused. If you're interested in thermal, it's usually a niche within mechanical engineering.
          </p>

          <div className="sr2-callout">
            <span className="kicker">Ready to look at real openings?</span>
            <p>
              Browse live <Link href="/solar-engineer-jobs" style={{ color: "#F5B819", borderBottomColor: "rgba(245,184,25,0.4)" }}>solar engineer job listings</Link> on Solar Roles — updated daily from real employer postings across the US.
            </p>
          </div>

          <div className="sr2-fine">
            Salary figures are aggregated from real job postings collected by Solar Roles and are labeled as such. For official occupational data, see the Bureau of Labor Statistics <a href="https://www.bls.gov/oes/current/oes172071.htm" target="_blank" rel="nofollow noopener noreferrer">Electrical Engineers (17-2071)</a> and <a href="https://www.bls.gov/oes/current/oes172141.htm" target="_blank" rel="nofollow noopener noreferrer">Mechanical Engineers (17-2141)</a> pages, and O*NET's <a href="https://www.onetonline.org/link/summary/17-2071.00" target="_blank" rel="nofollow noopener noreferrer">Electrical Engineers summary</a>. Job title patterns and requirements are based on Solar Roles' own review of postings across Indeed, LinkedIn, ZipRecruiter, and company career pages. This is career information only.
          </div>
        </article>

        <aside className="sr2-sidebar">
          <div className="sr2-card">
            <div className="sr2-author-card">
              <div className="a">SR</div>
              <div>
                <div className="by">Career guide</div>
                <div className="nm">Solar<span className="mark">Roles</span></div>
              </div>
            </div>
            <ul className="sr2-badges">
              <li className="sr2-badge">Real job title mapping</li>
              <li className="sr2-badge">Salary ranges from postings</li>
             
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}