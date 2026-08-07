import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateLink } from '@/components/click_affiliate_link';

const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/nabcep-project-credits-explained";
const PAGE_TITLE =
  "NABCEP Project Credits Explained: How to Get Decision-Making Experience Without Already Having the Job (2026)";
const PAGE_DESCRIPTION =
  "What actually counts as a Project Credit, how many installs you really need, and how to document a decision-making role when you're just starting out.";

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
        { "@type": "ListItem", position: 2, name: "NABCEP Project Credits Explained", item: `${SITE_URL}${PAGE_PATH}` },
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
  --green-600: #15803D;
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
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
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
/* ── REASSURANCE CALLOUT ──────────────────────────────────────────── */
.sr2-reassure {
  margin: 16px 0 28px;
  background: var(--navy-50);
  border: 1px solid var(--line);
  border-left: 3px solid var(--gold-500);
  border-radius: 12px;
  padding: 18px 20px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--ink-700);
}
.sr2-reassure strong { color: var(--navy-900); }
/* ── CREDIT TABLE ─────────────────────────────────────────────────── */
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
/* ── MATH STRIP ───────────────────────────────────────────────────── */
.sr2-facts {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; margin: 20px 0 28px;
}
@media (max-width: 720px) { .sr2-facts { grid-template-columns: 1fr; } }
.sr2-fact {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px 18px;
}
.sr2-fact .v {
  font-size: 26px; font-weight: 800; color: var(--navy-900);
  letter-spacing: -0.02em; line-height: 1;
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
}
.sr2-fact .v.green { color: var(--green-600); }
.sr2-fact .l { font-size: 12.5px; color: var(--ink-600); line-height: 1.45; }
/* ── OPTIONS LIST (numbered but real routes, not generic) ────────── */
.sr2-routes { list-style: none; margin: 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.sr2-routes li {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
}
.sr2-routes .t { font-weight: 800; color: var(--navy-900); font-size: 14.5px; margin-bottom: 4px; }
.sr2-routes .d { font-size: 14px; color: var(--ink-600); line-height: 1.55; }
/* ── DOWNSIDES / MISTAKES LIST ───────────────────────────────────── */
.sr2-downsides { list-style: none; margin: 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.sr2-downsides li { position: relative; padding-left: 24px; margin: 0; color: var(--ink-700); }
.sr2-downsides li::before {
  content: ""; position: absolute; left: 0; top: 9px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #DC2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
}
/* ── DOCUMENTATION CHECKLIST ──────────────────────────────────────── */
.sr2-checklist { list-style: none; margin: 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.sr2-checklist li {
  position: relative; padding: 12px 16px 12px 44px;
  background: #fff; border: 1px solid var(--line); border-radius: 10px;
  font-size: 14.5px; color: var(--ink-700);
}
.sr2-checklist li::before {
  content: ""; position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  width: 18px; height: 18px; border-radius: 5px;
  background: var(--green-600);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'/></svg>");
  background-size: 11px 11px; background-repeat: no-repeat; background-position: center;
}
/* ── HEATSPRING INLINE CTA ───────────────────────────────────────── */
.sr2-heatspring-cta { text-align: center; margin: 20px 0; }
.sr2-article a.sr2-heatspring-btn {
  display: inline-block;
  padding: 12px 22px;
  background: var(--gold-500);
  color: #121010 !important;
  font-weight: 800;
  font-size: 14px;
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

export default function NabcepProjectCreditsExplained() {
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
          NABCEP <span className="accent">Project Credits</span> Explained: The Real Bottleneck for Beginners
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
              <li><a href="#bottleneck">The Real Bottleneck</a></li>
              <li><a href="#what-counts">What Actually Counts as a Credit</a></li>
              <li><a href="#decision-making">What "Decision-Making Role" Means</a></li>
              <li><a href="#how-many">How Many Installs You Actually Need</a></li>
              <li><a href="#routes">Ways to Get Credits Without Already Having the Role</a></li>
              <li><a href="#timing">Timing Rules to Know</a></li>
              <li><a href="#mistakes">Common Mistakes</a></li>
              <li><a href="#next">Next Steps</a></li>
            </ol>
          </div>
        </aside>

        {/* ARTICLE */}
        <article className="sr2-article">
          <h2 id="bottleneck" className="sr2-first"><span className="n">01</span>The Real Bottleneck</h2>
          <p>
            Most NABCEP guides walk you through training hours and exam
            format without dwelling on the part that actually stops people:
            the <strong>6 Project Credits</strong> requirement for PVIP and
            PVIS both ask for documented experience in a{" "}
            <strong>decision-making role</strong>. If you&apos;re new to the
            trade, that&apos;s the classic catch — you need the experience to
            get certified, and in a lot of hiring pipelines, certification is
            what gets you into the roles where that experience is earned.
          </p>
          <p>
            This page breaks down what actually counts, how few installs the
            requirement really takes once you look at the credit math, and
            the routes people use to document a qualifying role before
            they&apos;ve landed a lead position.
          </p>

          <h2 id="what-counts"><span className="n">02</span>What Actually Counts as a Credit</h2>
          <p>
            Project Credits scale with system size, not with hours worked or
            number of panels touched. Per NABCEP&apos;s own certification
            handbook:
          </p>
          <table className="sr2-credtable">
            <thead>
              <tr>
                <th>System size</th>
                <th>Project Credits</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1 kW – 999 kW</th>
                <td>2 Project Credits</td>
              </tr>
              <tr>
                <th scope="row">1 MW and up</th>
                <td>3 Project Credits</td>
              </tr>
            </tbody>
          </table>
          <p>
            That first bracket covers essentially every residential system
            and most commercial rooftop jobs — a standard 8kW home install
            earns the same 2 credits as a 900kW commercial array. Size
            doesn&apos;t need to be large to count; it just needs to clear
            1kW and be documented properly.
          </p>

          <h2 id="decision-making"><span className="n">03</span>What "Decision-Making Role" Means</h2>
          <p>
            This is where most of the confusion actually lives. NABCEP
            doesn&apos;t require you to be the installation contractor listed
            on the permit — that helps, but it&apos;s not the only path.
            If your name isn&apos;t on the permit or final inspection, you
            can still qualify by submitting one of the following:
          </p>
          <ul className="sr2-checklist">
            <li>A signed letter on company letterhead from the person (or senior management) named on the permit/inspection, describing your decision-making role on that project</li>
            <li>Design plans identifying you as responsible for the drawing or review of the system design</li>
            <li>A commissioning or quality assurance report identifying you as responsible for that commissioning or QA process</li>
          </ul>
          <p>
            One detail that surprises a lot of candidates: <strong>more than
            one person can qualify for the same system.</strong> NABCEP
            explicitly allows for multiple decision-making roles on a single
            install — a lead installer, a designer, and whoever ran
            commissioning can each document their own role and each count
            that project toward their own credits. Being on a crew
            doesn&apos;t automatically disqualify you just because someone
            else is the named contractor.
          </p>

          <h2 id="how-many"><span className="n">04</span>How Many Installs You Actually Need</h2>
          <div className="sr2-reassure">
            <strong>The math is more forgiving than it sounds.</strong>{" "}
            At 2 credits per residential or standard commercial system, three
            completed installs with a documented decision-making role clears
            the 6-credit threshold. This isn&apos;t a multi-year, dozens-of-jobs
            requirement — it&apos;s a documentation problem more than a
            volume problem.
          </div>
          <div className="sr2-facts">
            <div className="sr2-fact">
              <div className="v green">3</div>
              <div className="l">Standard-size installs needed at 2 credits each to hit the 6-credit minimum</div>
            </div>
            <div className="sr2-fact">
              <div className="v">6</div>
              <div className="l">Total Project Credits required for both PVIP and PVIS</div>
            </div>
            <div className="sr2-fact">
              <div className="v">2 yrs</div>
              <div className="l">Window before submission in which completed installs still count</div>
            </div>
          </div>

          <h2 id="routes"><span className="n">05</span>Ways to Get Credits Without Already Having the Role</h2>
          <ul className="sr2-routes">
            <li>
              <div className="t">Ask for documentation on jobs you already work</div>
              <div className="d">
                If you&apos;re on a crew but not named on the permit, ask
                your supervisor directly for a letterhead letter describing
                your role on a specific completed install. Employers rarely
                offer this unprompted — it usually has to be requested per
                project.
              </div>
            </li>
            <li>
              <div className="t">Target design or commissioning tasks, not just installation</div>
              <div className="d">
                A decision-making role isn&apos;t limited to running the
                crew. If you review or contribute to system design, or handle
                commissioning/QA on a job, that&apos;s independently
                documentable — even in a junior role, if the responsibility
                is real and someone senior will confirm it in writing.
              </div>
            </li>
            <li>
              <div className="t">Registered apprenticeship programs</div>
              <div className="d">
                Structured apprenticeships are built to produce documented,
                verifiable experience over time, which maps naturally onto
                what NABCEP asks for. See our{" "}
                <Link href="/resources/how-to-get-a-solar-apprenticeship">
                  guide to solar apprenticeship programs
                </Link>{" "}
                for how to find one.
              </div>
            </li>
            <li>
              <div className="t">Community and volunteer builds</div>
              <div className="d">
                Nonprofit and community solar build programs sometimes place
                volunteers directly into hands-on installation roles. Not all
                of them can provide the specific documentation NABCEP
                requires, so confirm with the program directly whether they
                can issue a decision-making role letter before counting on
                it.
              </div>
            </li>
            <li>
              <div className="t">Consider the Board Eligible pathway for PVIP</div>
              <div className="d">
                If the training and exam side is more within reach than the
                experience side right now, you can sit the PVIP exam first
                and take up to three years to accumulate the 6 credits
                afterward. See our{" "}
                <Link href="/resources/nabcep-board-eligible-status">
                  Board Eligible status guide
                </Link>{" "}
                for how that works.
              </div>
            </li>
          </ul>

          <p>
            If you&apos;re working toward the training-hour side of PVIP
            while you sort out project credits, HeatSpring&apos;s prep
            bundle covers the full 58-hour requirement.
          </p>
          <div className="sr2-heatspring-cta">
            <AffiliateLink
              href="https://www.heatspring.com/courses/nabcep-pv-installation-professional-pvip-certification-prep?aff_id=9f_wlq"
              offerName="nabcep_pvip"
              className="sr2-heatspring-btn"
            >
              See the PVIP Prep Course
            </AffiliateLink>
          </div>
          <p className="sr2-heatspring-disclosure">
            * We may earn a commission if you enroll through this link, at no extra cost to you.
          </p>

          <h2 id="timing"><span className="n">06</span>Timing Rules to Know</h2>
          <ul className="sr2-checklist">
            <li>Installations generally need to be completed within 2 calendar years prior to submitting your application</li>
            <li>Training hours need to have been completed within 5 calendar years prior to submitting</li>
            <li>Each installation needs a permit and a final approved inspection submitted as part of your documentation — plans or unpermitted work don&apos;t qualify</li>
          </ul>
          <p>
            This is why documenting your role at the time a job wraps matters
            more than most people expect — going back two years later to ask
            for a letter about a project no one remembers clearly is much
            harder than requesting it while it&apos;s fresh.
          </p>

          <h2 id="mistakes"><span className="n">07</span>Common Mistakes</h2>
          <ul className="sr2-downsides">
            <li>Assuming general labor or helper hours automatically count — they don&apos;t, without a documented decision-making role.</li>
            <li>Not requesting documentation until the certification application is already underway, long after the project team has moved on.</li>
            <li>Believing you&apos;re excluded from claiming a project because someone else is the named contractor — multiple people can qualify per system.</li>
            <li>Overlooking design or commissioning work as a path to credits, and only looking at installation-lead roles.</li>
            <li>Letting installs age past the 2-year window before applying.</li>
          </ul>

          <h2 id="next"><span className="n">08</span>Next Steps</h2>
          <p>
            For the full picture of PVIP requirements alongside training and
            exam details, see our{" "}
            <Link href="/resources/how-to-get-nabcep-certified">
              guide to getting NABCEP certified
            </Link>
            . If the exam itself is what&apos;s weighing on you, our{" "}
            <Link href="/resources/nabcep-pvip-pass-rate">
              PVIP pass rate and retake guide
            </Link>{" "}
            covers what to expect. Once you&apos;re working toward
            certification, browse current{" "}
            <Link href="/jobs?what=Solar%20Installer">
              Solar Installer openings
            </Link>{" "}
            on Solar Roles.
          </p>

          <p className="sr2-fine">
            NABCEP is an independent certification body and is not affiliated
            with Solar Roles. Project Credit values, documentation
            requirements, and timing windows are set by NABCEP and can
            change — always confirm current requirements at nabcep.org or in
            the NABCEP Certification Handbook before submitting an
            application.
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