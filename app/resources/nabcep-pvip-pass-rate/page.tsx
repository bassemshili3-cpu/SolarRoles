import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateLink } from '@/components/click_affiliate_link';

const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/nabcep-pvip-pass-rate";
const PAGE_TITLE =
  "NABCEP PVIP Pass Rate, Retake Cost & Why It Feels So Hard (2026)";
const PAGE_DESCRIPTION =
  "The real PVIP pass rate, what the $275 retake actually costs you, and why the exam feels harder than the material — plus how to prepare so you don't need a second attempt.";

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
        { "@type": "ListItem", position: 2, name: "NABCEP PVIP Pass Rate", item: `${SITE_URL}${PAGE_PATH}` },
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
/* ── STAT GRID ────────────────────────────────────────────────────── */
.sr2-facts {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; margin: 20px 0 28px;
}
@media (max-width: 720px) { .sr2-facts { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .sr2-facts { grid-template-columns: 1fr; } }
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
.sr2-fact .v.amber { color: var(--amber-600); }
.sr2-fact .l { font-size: 12.5px; color: var(--ink-600); line-height: 1.45; }
/* ── DOWNSIDES / MISTAKES LIST ───────────────────────────────────── */
.sr2-downsides { list-style: none; margin: 0 0 20px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.sr2-downsides li { position: relative; padding-left: 24px; margin: 0; color: var(--ink-700); }
.sr2-downsides li::before {
  content: ""; position: absolute; left: 0; top: 9px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #DC2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
}
/* ── CHECKLIST ────────────────────────────────────────────────────── */
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

export default function NabcepPvipPassRate() {
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
          Exam Guide · 2026
        </span>
        <h1>
          NABCEP PVIP <span className="accent">Pass Rate</span> &amp; What a Retake Actually Costs
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
              <li><a href="#why-hard">Why It Feels Harder Than It Should</a></li>
              <li><a href="#passrate">What the Pass Rate Actually Means</a></li>
              <li><a href="#format">Exam Format &amp; Scoring</a></li>
              <li><a href="#retake">If You Fail: Retake Process &amp; Cost</a></li>
              <li><a href="#prepare">How to Avoid Needing a Retake</a></li>
              <li><a href="#mistakes">Common Mistakes</a></li>
              <li><a href="#next">Next Steps</a></li>
            </ol>
          </div>
        </aside>

        {/* ARTICLE */}
        <article className="sr2-article">
          <h2 id="why-hard" className="sr2-first"><span className="n">01</span>Why It Feels Harder Than It Should</h2>
          <p>
            If you&apos;re researching this after a failed attempt, or before
            a first one you&apos;re dreading: the difficulty isn&apos;t in
            your head, and it isn&apos;t a sign you don&apos;t know your
            trade. The PVIP exam tests design, code compliance, commissioning,
            and troubleshooting together in one sitting — categories that, on
            the job, you&apos;d rarely be tested on all at once. Someone with
            years of hands-on install experience can still get caught out by
            a code-reference question or a commissioning scenario they
            haven&apos;t personally run, simply because that&apos;s not the
            part of the job they do daily.
          </p>
          <div className="sr2-reassure">
            <strong>The short version:</strong> a large share of the field
            fails on the first attempt. That&apos;s a statement about how the
            exam is built — broad, code-heavy, scenario-based — not about
            who passes it.
          </div>

          <h2 id="passrate"><span className="n">02</span>What the Pass Rate Actually Means</h2>
          <p>
            NABCEP doesn&apos;t publish an official first-attempt pass rate,
            but the figure most consistently cited across training providers
            and industry guides puts it around <strong>60–70% on the first
            try</strong> — meaning somewhere between 3 and 4 in 10 candidates
            need a retake. The candidates who pass on the first attempt are
            almost always the ones who went through a structured prep course
            built against NABCEP&apos;s published Job Task Analysis, rather
            than studying general solar material or relying on field
            experience alone.
          </p>
          <p>
            That gap — structured prep vs. general experience — is the
            single biggest factor training providers point to. Field
            experience teaches you to install correctly. It doesn&apos;t
            teach you to explain, in a multiple-choice format, why you
            installed it that way under a specific code section.
          </p>

          <h2 id="format"><span className="n">03</span>Exam Format &amp; Scoring</h2>
          <div className="sr2-facts">
            <div className="sr2-fact">
              <div className="v">70</div>
              <div className="l">Multiple-choice questions — 60 scored, 10 unscored pilot questions</div>
            </div>
            <div className="sr2-fact">
              <div className="v">4 hrs</div>
              <div className="l">Time limit, with the 2017 NEC and a calculator provided at the test site</div>
            </div>
            <div className="sr2-fact">
              <div className="v amber">70/99</div>
              <div className="l">Scaled passing score — not a raw percentage of questions correct</div>
            </div>
          </div>
          <p>
            One detail that trips people up: the scaled score isn&apos;t the
            same as "70% of questions right." NABCEP weights and scales
            results across the pool of scored questions, so two candidates
            who feel equally unsure walking out can land on different sides
            of the passing line. Don&apos;t try to reverse-engineer your
            score from how the exam felt — it&apos;s not a reliable signal
            either way.
          </p>

          <h2 id="retake"><span className="n">04</span>If You Fail: Retake Process &amp; Cost</h2>
          <p>
            Failing doesn&apos;t reset your eligibility. You have up to four
            attempts within your one-year eligibility window, with a
            mandatory two-week wait between attempts.
          </p>
          <ul className="sr2-checklist">
            <li>Retake fee: $275 per additional attempt</li>
            <li>Minimum 2-week wait required between attempts</li>
            <li>Up to 4 total attempts within your 1-year eligibility period</li>
            <li>If you don&apos;t pass within the year, your application eligibility lapses and you&apos;ll need to reapply</li>
          </ul>
          <p>
            Some prep providers build the retake fee into their guarantee.
            HeatSpring&apos;s PVIP prep, for example, covers the cost of a
            retake if you don&apos;t pass on your first attempt after
            completing their course — worth factoring in if you&apos;re
            budgeting for the possibility now rather than after the fact.
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

          <h2 id="prepare"><span className="n">05</span>How to Avoid Needing a Retake</h2>
          <p>
            Most sources point to somewhere around 100–150 hours of focused
            study for candidates without a structured course, spread over
            several weeks rather than crammed. A few things consistently
            separate first-time passes from retakes:
          </p>
          <ul>
            <li>Studying directly against NABCEP&apos;s published PVIP Job Task Analysis, not a generic solar curriculum</li>
            <li>Practicing with timed, scored practice exams rather than just reading material — the 4-hour time pressure catches people who&apos;ve only studied untimed</li>
            <li>Reviewing 2017 NEC code sections specifically, since that&apos;s the edition the exam is still based on regardless of what&apos;s current in the field</li>
            <li>Treating commissioning and troubleshooting scenarios as their own study category, even if that&apos;s not the part of the job you do day to day</li>
          </ul>

          <h2 id="mistakes"><span className="n">06</span>Common Mistakes</h2>
          <ul className="sr2-downsides">
            <li>Assuming years of field experience alone is enough prep — it builds the wrong kind of exam readiness for a scenario-based, code-referenced test.</li>
            <li>Studying the current NEC cycle instead of the 2017 edition the exam is still built on.</li>
            <li>Skipping timed practice exams and only reviewing material passively.</li>
            <li>Waiting until after a first failed attempt to invest in structured prep, instead of budgeting for it up front.</li>
          </ul>

          <h2 id="next"><span className="n">07</span>Next Steps</h2>
          <p>
            If you&apos;re earlier in the process and still deciding which
            NABCEP credential to target first, our{" "}
            <Link href="/resources/how-to-get-nabcep-certified">
              guide to getting NABCEP certified
            </Link>{" "}
            compares PV Associate, PVIP, and PVIS side by side. If
            you&apos;ve got the training done but not yet the field hours,
            the{" "}
            <Link href="/resources/nabcep-board-eligible-status">
              Board Eligible pathway
            </Link>{" "}
            lets you sit the exam first. Once you&apos;re certified, browse
            current{" "}
            <Link href="/jobs?what=Solar%20Installer">
              Solar Installer openings
            </Link>{" "}
            on Solar Roles.
          </p>

          <p className="sr2-fine">
            NABCEP is an independent certification body and is not affiliated
            with Solar Roles. Pass rates cited here reflect figures commonly
            reported by training providers and industry publications, not an
            official statistic published by NABCEP. Exam fees, retake costs,
            and format details are set by NABCEP and can change — always
            confirm current requirements at nabcep.org before scheduling an
            exam.
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