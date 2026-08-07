import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateLink } from '@/components/click_affiliate_link';

const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/nabcep-pvis-vs-pvip";
const PAGE_TITLE =
  "NABCEP PVIS vs PVIP (2026): The Difference NABCEP Never Actually Explains";
const PAGE_DESCRIPTION =
  "PV Installer Specialist and PV Installation Professional compared side by side — scope, training hours, eligibility, and which one actually fits your role.";

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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: `${SITE_URL}${PAGE_PATH}`,
      dateModified: "2026-08-08",
      publisher: { "@type": "Organization", name: "Solar Roles" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 2, name: "NABCEP PVIS vs PVIP", item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Solar Roles palette — reused identically from sibling /resources pages   */
/* ────────────────────────────────────────────────────────────────────────── */
const css = `
.sr2-page {
  --navy-900: #0B1A2E;
  --navy-800: #0F2440;
  --navy-700: #1a2340;
  --navy-600: #1E3A5F;
  --navy-100: #E5EAF2;
  --navy-50: #F2F5FA;
  --gold-500: #F5B819;
  --gold-600: #E5A810;
  --amber-600: #B45309;
  --amber-500: #F2A93B;
  --coral-500: #FF6A3D;
  --cream-100: #FEF3C7;
  --ink-900: #0B1A2E;
  --ink-700: #2A3344;
  --ink-600: #3F4A5C;
  --ink-500: #5A6577;
  --ink-400: #6B7484;
  --line: #E5E9F0;
  --line-soft:#EEF1F6;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--ink-900);
  background: #fff;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-size: 15px;
  line-height: 1.55;
}
.sr2-meta-strip {
  display: flex; align-items: center; flex-wrap: wrap; gap: 12px;
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid var(--line-soft);
  font-size: 13px; color: var(--ink-500);
}
.sr2-meta-strip .dot { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-400); }
.sr2-meta-strip strong { color: var(--ink-900); font-weight: 700; }
.sr2-meta-strip .changes { color: var(--amber-600); font-weight: 600; }
.sr2-title {
  max-width: 1280px;
  margin: 40px auto 0;
  padding: 0 24px;
  text-align: center;
}
.sr2-title .eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 800; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--amber-600);
  margin-bottom: 14px;
}
.sr2-title .eyebrow .d {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--gold-500);
  box-shadow: 0 0 0 4px rgba(245,184,25,0.18);
}
.sr2-title h1 {
  margin: 0 auto;
  max-width: 900px;
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.12;
  color: var(--navy-900);
}
.sr2-title h1 .accent {
  background: linear-gradient(135deg, #F5B819 0%, #FF6A3D 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.sr2-title .sub {
  max-width: 700px;
  margin: 16px auto 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink-500);
}
.sr2-shell {
  max-width: 1280px;
  margin: 36px auto 0;
  padding: 0 24px 96px;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 300px;
  gap: 36px;
  align-items: start;
}
@media (max-width: 1100px) {
  .sr2-shell { grid-template-columns: 220px minmax(0, 1fr); }
  .sr2-sidebar { display: none; }
}
@media (max-width: 820px) {
  .sr2-shell { grid-template-columns: 1fr; gap: 24px; }
  .sr2-toc-col { position: static !important; }
}
.sr2-toc-col { position: sticky; top: 24px; align-self: start; }
.sr2-toc-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(11,26,46,0.03);
}
.sr2-toc-head {
  background: linear-gradient(135deg, #0B1A2E 0%, #1E3A5F 100%);
  color: #fff;
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.02em;
  display: flex; align-items: center; gap: 8px;
}
.sr2-toc-head svg { color: var(--gold-500); }
.sr2-toc-list { list-style: none; margin: 0; padding: 6px 0; counter-reset: tc; }
.sr2-toc-list li { counter-increment: tc; margin: 0; }
.sr2-toc-list a {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 18px;
  font-size: 13.5px;
  color: var(--ink-700);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all .15s;
  line-height: 1.4;
}
.sr2-toc-list a:hover {
  background: var(--navy-50);
  color: var(--navy-900);
  border-left-color: var(--gold-500);
}
.sr2-toc-list a::before {
  content: counter(tc, decimal-leading-zero);
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  font-weight: 800;
  color: var(--amber-600);
  min-width: 22px;
}
.sr2-article {
  font-size: 16.5px;
  line-height: 1.72;
  color: var(--ink-700);
  min-width: 0;
}
.sr2-article h2 {
  font-size: 26px;
  font-weight: 800;
  color: var(--navy-900);
  margin: 36px 0 12px;
  letter-spacing: -0.02em;
  line-height: 1.2;
  display: flex; align-items: baseline; gap: 12px;
}
.sr2-article h2.sr2-first { margin-top: 0; }
.sr2-article h2 .n {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 30px; height: 30px; padding: 0 8px;
  font-size: 13px; font-weight: 800;
  color: var(--navy-900);
  background: linear-gradient(135deg, var(--gold-500), var(--amber-500));
  border-radius: 7px;
  box-shadow: 0 4px 10px -4px rgba(245,184,25,0.4);
  font-variant-numeric: tabular-nums;
}
.sr2-article p { margin: 0 0 16px; }
.sr2-article strong { color: var(--navy-900); font-weight: 700; }
.sr2-article a {
  color: var(--amber-600);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1.5px solid rgba(180,83,9,0.3);
}
.sr2-article a:hover { color: var(--navy-900); border-bottom-color: var(--gold-500); }
.sr2-article ul { margin: 0 0 20px; padding-left: 22px; }
.sr2-article li { margin: 6px 0; }
.sr2-h2-intro {
  font-size: 17px;
  line-height: 1.65;
  color: var(--ink-600);
  border-left: 3px solid var(--gold-500);
  padding: 4px 0 4px 16px;
  margin: 12px 0 22px;
}
/* ── SIDE-BY-SIDE SCOPE CARDS ─────────────────────────────────────── */
.sr2-scope {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 20px 0 28px;
}
@media (max-width: 640px) { .sr2-scope { grid-template-columns: 1fr; } }
.sr2-scope-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 20px;
}
.sr2-scope-card.pvis { background: #FBF6EE; }
.sr2-scope-card.pvip { background: var(--navy-50); border-color: rgba(245,184,25,0.35); }
.sr2-scope-card .lbl {
  display: inline-block;
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 8px; border-radius: 5px;
  margin-bottom: 10px;
}
.sr2-scope-card.pvis .lbl { color: var(--amber-600); background: var(--cream-100); }
.sr2-scope-card.pvip .lbl { color: var(--navy-900); background: linear-gradient(135deg, var(--gold-500), var(--amber-500)); }
.sr2-scope-card h4 { margin: 0 0 8px; font-size: 15px; font-weight: 800; color: var(--navy-900); }
.sr2-scope-card ul { margin: 0; padding-left: 18px; font-size: 14px; color: var(--ink-700); }
.sr2-scope-card li { margin: 4px 0; }
/* ── COMPARISON TABLE ─────────────────────────────────────────────── */
.sr2-credtable {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 20px 0 28px;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
}
.sr2-credtable th, .sr2-credtable td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--line-soft);
}
.sr2-credtable thead th {
  background: var(--navy-50);
  color: var(--navy-900);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.sr2-credtable tbody th {
  font-weight: 700;
  color: var(--navy-900);
  white-space: nowrap;
  background: #fff;
}
.sr2-credtable tbody tr:last-child td, .sr2-credtable tbody tr:last-child th { border-bottom: none; }
.sr2-credtable td { color: var(--ink-600); }
/* ── DOWNSIDES / MISTAKES LIST ───────────────────────────────────── */
.sr2-downsides { list-style: none; margin: 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.sr2-downsides li { position: relative; padding-left: 24px; margin: 0; color: var(--ink-700); }
.sr2-downsides li::before {
  content: ""; position: absolute; left: 0; top: 9px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #DC2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
}
/* ── DUAL HEATSPRING CTA ──────────────────────────────────────────── */
.sr2-dual-cta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 20px 0 8px;
}
@media (max-width: 640px) { .sr2-dual-cta { grid-template-columns: 1fr; } }
.sr2-dual-cta-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 18px 16px;
  text-align: center;
}
.sr2-dual-cta-card .t { font-size: 13.5px; font-weight: 800; color: var(--navy-900); margin-bottom: 10px; }
.sr2-article a.sr2-heatspring-btn {
  display: inline-block;
  padding: 10px 18px;
  background: var(--gold-500);
  color: #121010 !important;
  font-weight: 800;
  font-size: 13.5px;
  border-radius: 6px;
  text-decoration: none;
  border-bottom: none;
  transition: background .15s;
}
.sr2-article a.sr2-heatspring-btn:hover { background: var(--gold-600); color: #fff !important; border-bottom: none; }
.sr2-heatspring-disclosure { margin: 8px 0 0; font-size: 11.5px; color: var(--ink-400); text-align: center; }
/* ── SIDEBAR ──────────────────────────────────────────────────────── */
.sr2-sidebar { position: sticky; top: 24px; align-self: start; display: flex; flex-direction: column; gap: 18px; }
.sr2-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 20px; }
.sr2-author-card { display: flex; gap: 12px; align-items: flex-start; }
.sr2-author-card .a {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, #1E3A5F, #0B1A2E);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px;
  flex-shrink: 0;
}
.sr2-author-card .by { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-500); }
.sr2-author-card .nm { font-size: 15px; font-weight: 800; color: var(--navy-900); display: flex; align-items: center; gap: 4px; margin: 1px 0 2px; }
.sr2-author-card .nm .mark { color: var(--gold-500); }
.sr2-badges { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.sr2-badge { display: flex; align-items: center; gap: 10px; font-size: 13.5px; font-weight: 600; color: var(--ink-700); }
.sr2-badge::before {
  content: ""; width: 18px; height: 18px; border-radius: 50%;
  background: rgba(180,83,9,0.12);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B45309' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'/></svg>");
  background-size: 11px 11px; background-repeat: no-repeat; background-position: center;
  flex-shrink: 0;
}
/* ── FINE PRINT ─────────────────────────────────────────────────── */
.sr2-fine {
  margin: 36px 0 0;
  padding: 20px 22px;
  background: var(--navy-50);
  border-radius: 12px;
  border-left: 3px solid var(--gold-500);
  font-size: 12.5px; line-height: 1.65; color: var(--ink-600);
}
`;

export default function NabcepPvisVsPvip() {
  return (
    <div className="sr2-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="sr2-title">
        <span className="eyebrow">
          <span className="d" />
          Certification Guide · 2026
        </span>
        <h1>
          NABCEP <span className="accent">PVIS vs PVIP</span>: What NABCEP Never Actually Explains
        </h1>
        <p className="sub">{PAGE_DESCRIPTION}</p>
      </div>
      <div className="sr2-meta-strip flex justify-center items-center gap-2">
        <span><strong>Last reviewed:</strong> 8 August, 2026</span>
        <span className="dot" />
        <span className="changes">This page contains affiliate links. We may earn a commission at no additional cost to you</span>
      </div>

      <div className="sr2-shell">
        {/* TOC */}
        <aside className="sr2-toc-col" aria-label="Table of contents">
          <div className="sr2-toc-card">
            <div className="sr2-toc-head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Table of Contents
            </div>
            <ol className="sr2-toc-list">
              <li><a href="#confusion">Why the Confusion Exists</a></li>
              <li><a href="#scope">Scope: What Each One Covers</a></li>
              <li><a href="#compare">Side-by-Side Comparison</a></li>
              <li><a href="#pathway">Career Pathway Differences</a></li>
              <li><a href="#choose">Which One to Choose</a></li>
              <li><a href="#mistakes">Common Mistakes</a></li>
              <li><a href="#next">Next Steps</a></li>
            </ol>
          </div>
        </aside>

        {/* ARTICLE */}
        <article className="sr2-article">
          <h2 id="confusion" className="sr2-first"><span className="n">01</span>Why the Confusion Exists</h2>
          <p>
            Ask around and you&apos;ll find installers, and even some training
            providers, who genuinely aren&apos;t sure how the PV Installer
            Specialist (PVIS) differs from the PV Installation Professional
            (PVIP). It&apos;s a fair question — NABCEP doesn&apos;t publish a
            side-by-side comparison anywhere on nabcep.org. What exists
            instead is two separate certification pages, each listing its own
            requirements and Job Task Analysis, with no direct explanation of
            why you&apos;d pick one over the other. Training providers have
            had to fill that gap themselves.
          </p>
          <p>
            The short version: <strong>PVIP is the broader credential, and it
            actually contains PVIS.</strong> The PVIP Job Task Analysis draws
            on content from all three PV Specialist certifications — PV
            Design Specialist (PVDS), PVIS, and PV Commissioning &amp;
            Maintenance Specialist (PVCMS) — combined. PVIS isn&apos;t a
            different track from PVIP; it&apos;s a narrower slice of it.
          </p>

          <h2 id="scope"><span className="n">02</span>Scope: What Each One Covers</h2>
          <div className="sr2-scope">
            <div className="sr2-scope-card pvis">
              <span className="lbl">PVIS</span>
              <h4>Installation technique only</h4>
              <ul>
                <li>DC and AC PV system conductors</li>
                <li>Raceways and mechanical mounting</li>
                <li>Monitoring and communication hardware</li>
                <li>Safety plan development</li>
              </ul>
            </div>
            <div className="sr2-scope-card pvip">
              <span className="lbl">PVIP</span>
              <h4>Installation plus everything around it</h4>
              <ul>
                <li>Everything in the PVIS scope</li>
                <li>System design and sizing</li>
                <li>Commissioning</li>
                <li>Operations and maintenance</li>
              </ul>
            </div>
          </div>
          <p>
            PVIS doesn&apos;t touch design or commissioning at all. If your
            day-to-day is limited to the physical install — running
            conductors, mounting racking, wiring up monitoring gear — PVIS
            tests exactly that, and nothing beyond it.
          </p>

          <h2 id="compare"><span className="n">03</span>Side-by-Side Comparison</h2>
          <table className="sr2-credtable">
            <thead>
              <tr>
                <th>Factor</th>
                <th>PVIS</th>
                <th>PVIP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Scope</th>
                <td>Installation technique only</td>
                <td>Design, installation, commissioning &amp; maintenance</td>
              </tr>
              <tr>
                <th scope="row">Advanced training hours</th>
                <td>24 hours</td>
                <td>58 hours</td>
              </tr>
              <tr>
                <th scope="row">OSHA 10</th>
                <td>Required</td>
                <td>Required</td>
              </tr>
              <tr>
                <th scope="row">Field experience</th>
                <td>6 Project Credits, decision-making role</td>
                <td>6 Project Credits, decision-making role</td>
              </tr>
              <tr>
                <th scope="row">Board Eligible pathway</th>
                <td>Not offered</td>
                <td>Available — see our{" "}
                  <Link href="/resources/nabcep-board-eligible-status">
                    Board Eligible guide
                  </Link>
                </td>
              </tr>
              <tr>
                <th scope="row">Common employer framing</th>
                <td>Installer, crew member</td>
                <td>Lead installer, foreman, commercial bids</td>
              </tr>
            </tbody>
          </table>

          <h2 id="pathway"><span className="n">04</span>Career Pathway Differences</h2>
          <p>
            NABCEP&apos;s own career pathway materials list the same six solar
            installation job titles under both PVIS and PVIP — on paper,
            either one gets you recognized for installer roles. Where they
            diverge is everything adjacent to installation. PVIP is the
            credential that shows up as a preferred or required qualification
            for system design, project management, and business ownership,
            because the certification itself covers that ground. PVIS
            doesn&apos;t open those doors, since it was never built to test
            for them.
          </p>
          <p>
            That&apos;s also why PVIP is the one most often called the
            &quot;gold standard&quot; in industry materials — not because
            PVIS is a lesser credential for what it covers, but because PVIP
            is the only one of the two that certifies the full scope
            employers associate with a lead role.
          </p>

          <h2 id="choose"><span className="n">05</span>Which One to Choose</h2>
          <ul>
            <li>Your job is purely installation — running conductors, racking, mounting — and you don&apos;t design systems or sign off on commissioning → <strong>PVIS</strong>.</li>
            <li>You want to move toward lead installer, foreman, or eventually run your own crew or business → <strong>PVIP</strong>.</li>
            <li>You&apos;re not sure yet which direction your role is heading → PVIP is the safer target, since it already includes what PVIS tests for.</li>
            <li>You want the faster, cheaper credential to add now and can pursue PVIP later → PVIS at 24 training hours is quicker to complete than PVIP&apos;s 58.</li>
          </ul>

          <p>
            HeatSpring runs NABCEP-approved prep for both certifications,
            built against each credential&apos;s current Job Task Analysis.
          </p>
          <div className="sr2-dual-cta">
            <div className="sr2-dual-cta-card">
              <div className="t">PVIS Prep Course</div>
              <AffiliateLink
                href="https://www.heatspring.com/courses/nabcep-pv-installer-specialist-pvis-certification-prep?aff_id=9f_wlq"
                offerName="nabcep_pvis"
                className="sr2-heatspring-btn"
              >
                See PVIS Course
              </AffiliateLink>
            </div>
            <div className="sr2-dual-cta-card">
              <div className="t">PVIP Prep Course</div>
              <AffiliateLink
                href="https://www.heatspring.com/courses/nabcep-pv-installation-professional-pvip-certification-prep?aff_id=9f_wlq"
                offerName="nabcep_pvip"
                className="sr2-heatspring-btn"
              >
                See PVIP Course
              </AffiliateLink>
            </div>
          </div>
          <p className="sr2-heatspring-disclosure">
            * We may earn a commission if you enroll through these links, at no extra cost to you.
          </p>

          <h2 id="mistakes"><span className="n">06</span>Common Mistakes</h2>
          <ul className="sr2-downsides">
            <li>Assuming PVIS is a stepping stone to PVIP — it isn&apos;t a prerequisite, and passing it doesn&apos;t reduce PVIP&apos;s training-hour requirement.</li>
            <li>Choosing PVIS because it&apos;s cheaper and faster, without checking whether the job postings you&apos;re targeting actually ask for PVIP by name.</li>
            <li>Treating the two as interchangeable on a resume — employers hiring for design or commissioning-adjacent roles will notice the gap.</li>
            <li>Not accounting for the fact that PVIP&apos;s Board Eligible pathway has no PVIS equivalent, if you were planning to sit the exam before finishing field hours.</li>
          </ul>

          <h2 id="next"><span className="n">07</span>Next Steps</h2>
          <p>
            For the full breakdown of every NABCEP credential, including PV
            Associate, see our{" "}
            <Link href="/resources/how-to-get-nabcep-certified">
              guide to getting NABCEP certified
            </Link>
            . If you&apos;ve settled on PVIP and want to know how the newer
            Board Eligible pathway changes the order of requirements, read
            our{" "}
            <Link href="/resources/nabcep-board-eligible-status">
              Board Eligible status guide
            </Link>
            . Once certified, browse current{" "}
            <Link href="/jobs?what=Solar%20Installer">
              Solar Installer openings
            </Link>{" "}
            on Solar Roles.
          </p>

          <p className="sr2-fine">
            NABCEP is an independent certification body and is not affiliated
            with Solar Roles. Certification scope, training-hour
            requirements, and eligibility criteria are set by NABCEP and can
            change — always confirm current requirements at nabcep.org before
            enrolling in a prep course.
          </p>
        </article>

        {/* SIDEBAR */}
        <aside className="sr2-sidebar">
          <div className="sr2-card">
            <div className="sr2-author-card">
              <div className="a">SR</div>
              <div>
                <div className="by">By Editorial Team</div>
                <div className="nm">Solar<span className="mark">Roles</span></div>
              </div>
            </div>
            <ul className="sr2-badges">
              <li className="sr2-badge">NABCEP-aligned data</li>
              <li className="sr2-badge">Listing of hundreds active solar jobs</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}