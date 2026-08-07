import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateLink } from '@/components/click_affiliate_link';

const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/nabcep-board-eligible-status";
const PAGE_TITLE =
  "NABCEP Board Eligible Status (2026): The New Path to PVIP Without the Chicken-and-Egg Problem";
const PAGE_DESCRIPTION =
  "How NABCEP's Board Eligible pathway lets you pass the PVIP exam before you have the field experience, with up to 3 years to convert to full Board Certified status.";

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
        { "@type": "ListItem", position: 2, name: "NABCEP Board Eligible Status", item: `${SITE_URL}${PAGE_PATH}` },
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
/* ── OLD VS NEW COMPARE ───────────────────────────────────────────── */
.sr2-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 20px 0 28px;
}
@media (max-width: 640px) { .sr2-compare { grid-template-columns: 1fr; } }
.sr2-compare-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 20px;
}
.sr2-compare-card.old { background: #FBF6EE; }
.sr2-compare-card.new { background: var(--navy-50); border-color: rgba(245,184,25,0.35); }
.sr2-compare-card .lbl {
  display: inline-block;
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 8px; border-radius: 5px;
  margin-bottom: 10px;
}
.sr2-compare-card.old .lbl { color: var(--amber-700, var(--amber-600)); background: var(--cream-100); }
.sr2-compare-card.new .lbl { color: var(--navy-900); background: linear-gradient(135deg, var(--gold-500), var(--amber-500)); }
.sr2-compare-card ol { margin: 0; padding-left: 18px; font-size: 14px; color: var(--ink-700); }
.sr2-compare-card li { margin: 5px 0; }
/* ── TIMELINE TABLE ───────────────────────────────────────────────── */
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
/* ── CHECKLIST ────────────────────────────────────────────────────── */
.sr2-checklist {
  list-style: none; margin: 0 0 20px; padding: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.sr2-checklist li {
  position: relative;
  padding: 12px 16px 12px 44px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 14.5px;
  color: var(--ink-700);
}
.sr2-checklist li::before {
  content: "";
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  width: 18px; height: 18px; border-radius: 5px;
  background: var(--green-600);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'/></svg>");
  background-size: 11px 11px; background-repeat: no-repeat; background-position: center;
}
/* ── DOWNSIDES / MISTAKES LIST ───────────────────────────────────── */
.sr2-downsides { list-style: none; margin: 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.sr2-downsides li { position: relative; padding-left: 24px; margin: 0; color: var(--ink-700); }
.sr2-downsides li::before {
  content: ""; position: absolute; left: 0; top: 9px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #DC2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
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

export default function NabcepBoardEligibleStatus() {
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
          Certification Update · 2026
        </span>
        <h1>
          NABCEP <span className="accent">Board Eligible</span> Status: The New Path to PVIP
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
              <li><a href="#problem">The Problem It Solves</a></li>
              <li><a href="#how">How Board Eligible Works</a></li>
              <li><a href="#requirements">Requirements to Apply</a></li>
              <li><a href="#timeline">Timeline &amp; Deadlines</a></li>
              <li><a href="#who">Who This Is For</a></li>
              <li><a href="#mistakes">Common Mistakes</a></li>
              <li><a href="#next">Next Steps</a></li>
            </ol>
          </div>
        </aside>

        {/* ARTICLE */}
        <article className="sr2-article">
          <h2 id="problem" className="sr2-first"><span className="n">01</span>The Problem It Solves</h2>
          <p>
            The PV Installation Professional (PVIP) credential has always had a
            circular requirement: employers want to see PVIP before they hand
            someone a decision-making role on an install, but NABCEP has
            historically required documented decision-making field experience
            before you could even sit for the PVIP exam. That left a real gap
            for career changers, recent grads, and installers who could pass
            the exam today but hadn&apos;t yet been signed off as the person
            making the calls on a job site.
          </p>
          <p>
            <strong>Board Eligible status is NABCEP&apos;s answer.</strong>{" "}
            It decouples the exam from the experience: you can complete your
            training and pass the PVIP exam first, then spend up to three
            years accumulating the field experience NABCEP requires, rather
            than the other way around.
          </p>

          <h2 id="how"><span className="n">02</span>How Board Eligible Works</h2>
          <p>
            The sequence flips compared to the traditional PVIP pathway.
            Instead of gathering experience first and sitting the exam last,
            you complete your training hours and OSHA 10, pass the PVIP exam,
            and become <strong>Board Eligible</strong> — a temporary status.
            You are not yet Board Certified: you won&apos;t get the digital
            badge or appear in NABCEP&apos;s Professional Directory until the
            experience requirement is also met and your conversion
            application is approved.
          </p>
          <div className="sr2-compare">
            <div className="sr2-compare-card old">
              <span className="lbl">Traditional pathway</span>
              <ol>
                <li>Document field experience with a decision-making role</li>
                <li>Complete 58 hrs advanced training + OSHA 10</li>
                <li>Sit and pass the PVIP exam</li>
                <li>Become Board Certified immediately</li>
              </ol>
            </div>
            <div className="sr2-compare-card new">
              <span className="lbl">Board Eligible pathway</span>
              <ol>
                <li>Complete 58 hrs advanced training + OSHA 10</li>
                <li>Sit and pass the PVIP exam</li>
                <li>Become <strong>Board Eligible</strong> (temporary status)</li>
                <li>Accumulate experience — up to 3 years — then convert</li>
              </ol>
            </div>
          </div>

          <h2 id="requirements"><span className="n">03</span>Requirements to Apply</h2>
          <p>
            The training and exam side of Board Eligible is identical to the
            standard PVIP requirements — this pathway changes the order
            things happen in, not what NABCEP asks for overall.
          </p>
          <ul className="sr2-checklist">
            <li>10 hours of OSHA Outreach Training for the Construction Industry (OSHA 10 or equivalent)</li>
            <li>58 hours of approved advanced PV training</li>
            <li>A passing score on the PVIP exam</li>
            <li>Within 3 years of passing: 6 Project Credits documenting a decision-making role on completed, permitted, and inspected PV installations</li>
          </ul>
          <p>
            One detail worth flagging: NABCEP also gives you a window to
            actually sit the exam once you&apos;ve enrolled — one year, or up
            to four attempts after your training course end-date, whichever
            comes first. That clock is separate from the three-year
            experience window that starts once you pass.
          </p>

          <h2 id="timeline"><span className="n">04</span>Timeline &amp; Deadlines</h2>
          <table className="sr2-credtable">
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Deadline</th>
                <th>What happens if you miss it</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Sit the PVIP exam</th>
                <td>1 year, or 4 attempts, after course end-date</td>
                <td>Enrollment lapses; training hours may need to be retaken depending on provider policy</td>
              </tr>
              <tr>
                <th scope="row">Pass the exam</th>
                <td>—</td>
                <td>You become Board Eligible the day you pass</td>
              </tr>
              <tr>
                <th scope="row">Document 6 Project Credits</th>
                <td>3 years from your exam pass date</td>
                <td>Board Eligible status expires; the pathway back requires re-qualifying</td>
              </tr>
              <tr>
                <th scope="row">Submit Conversion Application</th>
                <td>Once experience is documented</td>
                <td>No additional fee — this step just confirms and finalizes Board Certified status</td>
              </tr>
            </tbody>
          </table>
          <p>
            Project Credits scale with system size — larger commercial and
            utility-scale systems count for more than a single residential
            install — so the 6-credit threshold doesn&apos;t always mean six
            separate jobs.
          </p>

          <p>
            If you&apos;re starting the training side of this now, HeatSpring&apos;s
            PVIP prep bundle is built directly against NABCEP&apos;s current
            job task analysis and covers the 58-hour advanced training
            requirement in one package.
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

          <h2 id="who"><span className="n">05</span>Who This Is For</h2>
          <p>
            Board Eligible status is most useful for people who can prove
            they know the material but haven&apos;t yet been the
            decision-maker on a documented install:
          </p>
          <ul>
            <li>Career changers moving into solar from electrical, roofing, or general construction, who can pass a knowledge-based exam faster than they can accumulate decision-making field hours</li>
            <li>Installers already on a crew who are ready technically but whose current role doesn&apos;t put their name on the permit or inspection</li>
            <li>Recent graduates of solar training programs who want a credential to show employers while they build the experience side</li>
          </ul>
          <p>
            It&apos;s less useful if you already have years of decision-making
            field experience — in that case the traditional pathway gets you
            to fully Board Certified in one pass, with no temporary status in
            between.
          </p>

          <h2 id="mistakes"><span className="n">06</span>Common Mistakes</h2>
          <ul className="sr2-downsides">
            <li>Treating Board Eligible as equivalent to Board Certified when applying for lead installer roles — employers can tell the difference, and some job postings specifically require full certification.</li>
            <li>Losing track of the 3-year experience clock, since it starts on your exam pass date, not your training completion date.</li>
            <li>Logging installation hours without documenting a decision-making role specifically — general labor hours on a crew don&apos;t automatically count as Project Credits.</li>
            <li>Assuming the Conversion Application happens automatically once hours are logged — it&apos;s a separate submission you have to file.</li>
          </ul>

          <h2 id="next"><span className="n">07</span>Next Steps</h2>
          <p>
            If you&apos;re still deciding whether PVIP or another credential
            fits your stage, our{" "}
            <Link href="/resources/how-to-get-nabcep-certified">
              guide to getting NABCEP certified
            </Link>{" "}
            compares PV Associate, PVIP, and PVIS side by side. Once
            you&apos;re Board Eligible or fully certified, browse current{" "}
            <Link href="/jobs?what=Solar%20Installer">
              Solar Installer openings
            </Link>{" "}
            on Solar Roles.
          </p>

          <p className="sr2-fine">
            NABCEP is an independent certification body and is not affiliated
            with Solar Roles. Board Eligible requirements, deadlines, and
            Project Credit thresholds are set by NABCEP and can change —
            always confirm current requirements at nabcep.org before applying
            or enrolling in a prep course.
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