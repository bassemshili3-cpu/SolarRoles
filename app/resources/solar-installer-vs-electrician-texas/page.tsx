import type { Metadata } from "next";
import Link from "next/link";
import { Sora } from "next/font/google";
import { articleCss } from "../_shared/article-styles";

const sora = Sora({ subsets: ["latin"], weight: ["700", "800"], display: "swap" });

const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/solar-installer-vs-electrician-texas";
const PAGE_TITLE =
  "Solar Installer or Electrician? Texas Law Requirements";
const PAGE_DESCRIPTION =
  "Texas job ads talk about DC-only installer roles whereas Texas law doesn't recognize that distinction. Here's what the statute says, and the legal way in.";

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
      dateModified: "2026-08-10",
      author: [{ "@type": "Person", name: "Bassem SHILI" }],
      publisher: { "@type": "Organization", name: "Solar Roles" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 2, name: "Solar Installer vs Electrician in Texas", item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
  ],
};

export default function SolarInstallerVsElectricianTexas() {
  return (
    <div className="sr2-page">
      <style dangerouslySetInnerHTML={{ __html: articleCss }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="sr2-title">
        <span className="eyebrow"><span className="d" />Licensing · Texas · 2026</span>
        <h1 className={sora.className}>
          Solar Installer or <span className="accent">Electrician</span>? Texas Law Requirements
        </h1>
        <p className="sub">{PAGE_DESCRIPTION}</p>
      </div>

      <div className="sr2-meta-strip flex justify-center items-center gap-2">
        <span><strong>Last reviewed:</strong> 10 August, 2026</span>
      </div>

      <div className="sr2-shell">
        <aside className="sr2-toc-col" aria-label="Table of contents">
          <div className="sr2-toc-card">
            <div className="sr2-toc-head">Table of Contents</div>
            <ol className="sr2-toc-list">
              <li><a href="#gap">The Ad vs the Statute</a></li>
              <li><a href="#law">Texas Law Requirements</a></li>
              <li><a href="#myth">The DC-Side</a></li>
              <li><a href="#apprentice">The Legal Entry Point</a></li>
              <li><a href="#hunting">What This Means If You're Job Hunting</a></li>
              <li><a href="#next">What is Next</a></li>
            </ol>
          </div>
        </aside>

        <article className="sr2-article">
          <h2 id="gap"><span className="n">01</span>The Ad vs the Statute</h2>
          <p>
Plenty of job postings for <Link href="/solar-pv-installer-jobs">solar installer jobs</Link> in Texas are saying that crew members can handle DC side work such as racking, installing modules, and string wiring without an electrical license. A licensed electrician then takes care of the AC interconnection. But Texas law does not actually define the work that way.

          </p>

          <h2 id="law"><span className="n">02</span>Texas Law Requirements</h2>
          <p>
            The Texas Electrical Safety and Licensing Act (Occupations Code
            Chapter 1305) defines &quot;electrical work&quot; broadly enough
            to cover a full PV installation, and it does not carve out DC
            circuits as a separate, lower-barrier category. TDLR&apos;s own
            published guidance breaks a typical install into tasks. System
            design, racking installation, module mounting, DC connections and
            grounding, AC connections and grounding. It assigns the same
            answer to every single one: licensed electrician, working through
            a licensed Electrical Contractor.
          </p>
          <p>
            Transporting panels to the jobsite is the one task on that list
            that doesn&apos;t require a license (a driver&apos;s license
            covers it). Everything involving the system itself is treated the
            same, DC or AC.
          </p>

          <h2 id="myth"><span className="n">03</span>The DC-Side</h2>
          <p>
            A licensing guidance document prepared for the Texas Renewable
            Energy Industries Association addresses this directly: some
            installers assume DC-side work falls outside licensing
            requirements, and TDLR guidance states plainly that this
            assumption has no basis in the statute. General contractors who
            bring in a licensed electrician only to pull the permit and
            handle the AC interconnection, while unlicensed workers build out
            the rest of the system, are described as out of compliance —
            regardless of who touches the AC side.
          </p>
          <div className="sr2-callout">
            <span className="kicker">Why this matters for job seekers</span>
            <p>
              A posting that limits your role to &quot;DC-side installation&quot;
              in Texas is describing a company&apos;s internal division of labor,
              which only stays legal if you&apos;re working under an
              Electrical Apprentice license and on-site supervision.
            </p>
          </div>

          <h2 id="apprentice"><span className="n">04</span>The Legal Entry Point</h2>
          <p>
            Texas does have a route in without a full journeyman or master
            license: the <Link href="/resources/how-to-get-a-solar-apprenticeship">Electrical Apprentice license</Link>. An apprentice can
            perform electrical work, DC or AC, under the on-site supervision
            of a Master Electrician, Journeyman Electrician, or Residential
            Wireman. The supervisor is on the hook
            for reviewing and inspecting the apprentice&apos;s work, and the
            apprentice still needs the license itself before starting.
          </p>

          <h2 id="hunting"><span className="n">05</span>What This Means If You&apos;re Job Hunting</h2>
          <p>
            A few practical takeaways if you&apos;re looking at solar roles
            in Texas specifically:
          </p>
          <ul>
            <li>Ask directly whether the role requires (or sponsors) a TDLR Electrical Apprentice license.</li>
            <li>Confirm the employer holds a Texas Electrical Contractor license and has a Master Electrician on staff.</li>
            <li>Physical labor roles that never touch wiring — module handling, site prep, logistics, sit outside licensing requirements entirely and are a legitimate way in without any license.</li>
          </ul>

          <h2 id="next"><span className="n">06</span>What is next</h2>
          <p>
            If you already hold an electrician&apos;s license or are working
            toward one, browse current{" "}
            <Link href="/solar-electrician-jobs">Solar Electrician job openings</Link>{" "}
            — these are the roles built around what Texas law
            requires. If you&apos;re earlier in the process, the
            TDLR apprentice application is the concrete first step; our{" "}
            <Link href="/resources/how-to-become-a-solar-installer">
              solar installer guide
            </Link>{" "}
            covers the broader entry pathways.
          </p>

          <div className="sr2-fine">
            This page summarizes TDLR guidance and the Texas Electrical
            Safety and Licensing Act (Occupations Code Ch. 1305) as of August
            2026. Municipal rules can add requirements on top of state law.
            Verify current requirements directly with TDLR before making
            employment or licensing decisions.
          </div>
        </article>

        <aside className="sr2-sidebar">
          <div className="sr2-card">
            <div className="sr2-author-card">
              <div>
              </div>
            </div>
            <ul className="sr2-badges">
              <li className="sr2-badge">Sourced from TDLR guidance</li>
              <li className="sr2-badge">Texas Occupations Code Ch. 1305</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
