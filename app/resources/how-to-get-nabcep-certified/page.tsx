import type { Metadata } from "next";
import Link from "next/link";
const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources/how-to-get-nabcep-certified";
const PAGE_TITLE =
  "How to Get NABCEP Certified (2026): PV Associate vs Installation Professional, Costs, and the Real Timeline";
const PAGE_DESCRIPTION =
  "Our step-by-step complete guide";
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
      dateModified: "2026-08-03",
      author: [{ "@type": "Person", name: "Maya Okonkwo" }],
      publisher: { "@type": "Organization", name: "Solar Roles" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 2, name: "How to Get NABCEP Certified", item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
  ],
};
/* ────────────────────────────────────────────────────────────────────────── */
/* Solar Roles palette (extracted from solarroles.com) — reused identically  */
/* Navy #0B1A2E · #1E3A5F Gold #F5B819 Amber #B45309 Coral #FF6A3D          */
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
  max-width: 880px;
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
  max-width: 680px;
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
.sr2-toc-col {
  position: sticky;
  top: 24px;
  align-self: start;
}
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
.sr2-toc-list {
  list-style: none; margin: 0; padding: 6px 0;
  counter-reset: tc;
}
.sr2-toc-list li {
  counter-increment: tc;
  margin: 0;
}
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
.sr2-downsides {
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sr2-downsides li {
  position: relative;
  padding-left: 24px;
  margin: 0;
  color: var(--ink-700);
}
.sr2-downsides li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #DC2626;
  box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
}
.sr2-paygrid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 24px 0 28px;
}
@media (max-width: 720px) { .sr2-paygrid { grid-template-columns: 1fr; } }
.sr2-paycard {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 18px 16px;
  transition: all .2s;
}
.sr2-paycard:hover {
  border-color: var(--gold-500);
  box-shadow: 0 8px 20px -8px rgba(245,184,25,0.3);
  transform: translateY(-1px);
}
.sr2-paycard .stage {
  display: inline-block;
  font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--amber-600);
  background: var(--cream-100);
  padding: 4px 8px; border-radius: 4px;
  margin-bottom: 12px;
}
.sr2-paycard .rate {
  font-size: 24px; font-weight: 800; color: var(--navy-900);
  letter-spacing: -0.02em; line-height: 1.1;
}
.sr2-paycard .rate .per { font-size: 13px; color: var(--ink-400); font-weight: 600; }
.sr2-paycard .desc { font-size: 13px; color: var(--ink-600); margin-top: 8px; line-height: 1.5; }





.sr2-heatspring-cta {
  text-align: center;
  margin: 20px 0;
}
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
.sr2-article a.sr2-heatspring-btn:hover {
  background: var(--gold-600);
  color: #fff !important;
  border-bottom: none;
}
.sr2-heatspring-disclosure {
  margin: 8px 0 0;
  font-size: 11.5px;
  color: var(--ink-400);
  text-align: center;
}
.sr2-sidebar { position: sticky; top: 24px; align-self: start; display: flex; flex-direction: column; gap: 18px; }
.sr2-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 20px;
}
.sr2-author-card { display: flex; gap: 12px; align-items: flex-start; }
.sr2-author-card .a {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, #1E3A5F, #0B1A2E);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px;
  flex-shrink: 0;
}
.sr2-author-card .by {
  font-size: 11px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ink-500);
}
.sr2-author-card .nm {
  font-size: 15px; font-weight: 800; color: var(--navy-900);
  display: flex; align-items: center; gap: 4px;
  margin: 1px 0 2px;
}
.sr2-author-card .nm .mark { color: var(--gold-500); }
.sr2-author-card .role { font-size: 13px; color: var(--ink-500); }
.sr2-badges {
  list-style: none; margin: 14px 0 0; padding: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.sr2-badge {
  display: flex; align-items: center; gap: 10px;
  font-size: 13.5px; font-weight: 600; color: var(--ink-700);
}
.sr2-badge::before {
  content: ""; width: 18px; height: 18px;
  border-radius: 50%;
  background: rgba(180,83,9,0.12);
  color: var(--amber-600);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B45309' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'/></svg>");
  background-size: 11px 11px;
  background-repeat: no-repeat;
  background-position: center;
}

.sr2-field {
  width: 100%;
  padding: 11px 12px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  color: var(--ink-900);
  margin-bottom: 10px;
  font-family: inherit;
  transition: all .15s;
}
.sr2-field:focus {
  outline: none;
  border-color: var(--gold-500);
  box-shadow: 0 0 0 3px rgba(245,184,25,0.18);
}
.sr2-btn-gold {
  width: 100%;
  padding: 13px;
  background: var(--gold-500);
  color: var(--navy-900);
  font-weight: 800;
  font-size: 14.5px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all .15s;
  box-shadow: 0 6px 18px -6px rgba(245,184,25,0.55);
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.sr2-btn-gold:hover { background: #FFD23E; transform: translateY(-1px); }
.sr2-form-foot {
  display: flex; gap: 14px; flex-wrap: wrap;
  margin-top: 14px;
  font-size: 12px; color: var(--ink-500);
}
.sr2-form-foot span { display: inline-flex; align-items: center; gap: 4px; }
.sr2-form-foot .ok { color: var(--amber-600); }
/* ── CREDENTIAL COMPARE TABLE ─────────────────────────────────────── */
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
.sr2-fine {
  margin: 36px 0 0;
  padding: 20px 22px;
  background: var(--navy-50);
  border-radius: 12px;
  border-left: 3px solid var(--gold-500);
  font-size: 12.5px; line-height: 1.65; color: var(--ink-600);
}
`;
export default function HowToGetNabcepCertified() {
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
          How to Get <span className="accent">NABCEP Certified</span>
        </h1>
        <p className="sub">{PAGE_DESCRIPTION}</p>
      </div>
      <div className="sr2-meta-strip flex justify-center items-center gap-2">
        <span><strong>Last reviewed:</strong> 3 August, 2026</span>
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
                <li><a href="#which">Registration</a></li>
              <li><a href="#which">Which Credential Fits You</a></li>
              <li><a href="#eligibility">Eligibility &amp; Hour Requirements</a></li>
              <li><a href="#exam">Exam Format &amp; Scoring</a></li>
              <li><a href="#timeline">Study Timeline</a></li>
              <li><a href="#mistakes">Common Mistakes</a></li>
             
            </ol>
          </div>
        </aside>

        {/* ARTICLE */}
        <article className="sr2-article">
            <h2 id="eligibility"><span className="n">02</span>Registration</h2>
          <p>
            Registration itself works differently depending on the path.
            We'll explain each step throughout this guide.
          </p>
         

          <h2 id="which"><span className="n">01</span>Which Credential Fits You</h2>
        
            
            
           
          <p>
            NABCEP runs several credentials:<ul>
                <li>- <strong>PV Associate (PVA)</strong>{" "}</li>
            <li>- <strong>PV Installation Professional (PVIP)</strong></li>
               <li>- <strong>NABCEP PV Installer Specialist (PVIS)</strong></li> 
                </ul>
           Each certification serves a different purpose and is designed for professionals
            at different stages of their careers. Choosing the right one depends on your 
            experience and career goals. </p>

          <p>
            <strong>1.</strong> <strong><Link href="https://www.heatspring.com/courses/solar-pv-boot-camp-nabcep-pv-associate-exam-prep?aff_id=9f_wlq">PV Associate</Link></strong> is the entry credential. No
            documented field hours required, which is what makes it the
            standard target for people still in training or early in an OJT
            role. It tells an employer you understand system design basics,
            electrical fundamentals, and code requirements before you&apos;ve
            necessarily touched a roof.
          </p>
          <p>For PVA taken through the Associate Education Pathway, you
            don&apos;t apply to NABCEP yourself: your training provider
            registers you for the exam once you&apos;ve completed their
            course, and your myNABCEP account gets created automatically at
            that point.</p>
          <p>
           <strong>2.</strong> <strong><Link href= "https://www.heatspring.com/courses/nabcep-pv-installation-professional-pvip-certification-prep?aff_id=9f_wlq">PV Installation Professional</Link></strong> is the credential
            experienced installers work toward. It requires documented
            installation experience and a separate written exam, and it&apos;s
            the one that shows up as a preferred or required qualification in
            lead installer and foreman postings. You can&apos;t shortcut to
            PVIP; the field hours are the gate, not the exam itself.
          </p>
           
          <p>
            <strong>3. <strong/><Link href= "https://www.heatspring.com/courses/nabcep-pv-installer-specialist-pvis-certification-prep?aff_id=9f_wlq">PV Installer Specialist (PVIS)</Link></strong>,
            is a narrower Board Certification aimed at installers who want to
            demonstrate competence in the hands-on installation process
            itself: DC and AC conductors, raceways, mounting, and monitoring
            and communication hardware, plus safety plan development. It
            doesn&apos;t cover the design and commissioning scope that PVIP
            does, which makes it a faster path for someone whose job is
            purely installation and who doesn&apos;t design systems or sign
            off on commissioning.
          </p>
          <ul>
            <li>New to solar, still in training or OJT → PV Associate first.</li>
            <li>Coming from electrical, roofing, or construction → PV Associate still makes sense as a fast, low-cost signal while you accumulate solar-specific hours toward PVIP or PVIS.</li>
            <li>Experienced installer, work is installation only, not design or commissioning → PVIS eligibility review.</li>
            <li>1+ years documented experience across design, install, and commissioning → go straight for PVIP eligibility review.</li>
          </ul>
          <p>If you're preparing for a NABCEP exam, we recommend HeatSpring.
            It's one of the most trusted online training platforms in the solar industry, and its 
            NABCEP-approved courses are taught by experienced industry professionals.<p/>

          </p>
<p><strong>Important:</strong> for PVIP, PVIS, and PVA taken through the Experience
            or Conversion pathways, it&apos;s the other way around, you
            create your own myNABCEP account, submit the application
            yourself with your documented hours and training, and wait for
            NABCEP to approve it before you can schedule an exam date. Your
            employer&apos;s only role is signing off on your logged hours,
            they don&apos;t register you or apply on your behalf.</p>

          <h2 id="eligibility"><span className="n">02</span>Eligibility &amp; Hour Requirements</h2>
          <p>
            PV Associate has no prerequisite hours, only a training-hour
            minimum that most short courses or bootcamps satisfy in a single
            program. PVIP is stricter: NABCEP requires documented experience
            hours across specific task categories (site assessment,
            installation, commissioning, maintenance), signed off by a
            supervisor or employer, before you&apos;re even eligible to take
            the exam. PVIS sits between the two: it requires documented
            installation-task hours, but not the design and commissioning
            hours PVIP demands.
          </p>
          <p>
            <strong>hours don&apos;t
            count retroactively unless they&apos;re documented at the time.</strong>{" "}
            If you&apos;re on a crew now and think PVIP or PVIS is a year or
            two away, start a simple log today: date, task category, hours,
            supervisor initials. Rebuilding that record later from memory is
            the single most common reason applications get delayed.
          </p>
         

          <h2 id="exam"><span className="n">03</span>Exam Format &amp; Scoring</h2>
          <p>
            All three exams are computer-based, multiple choice, proctored,
            and timed. PV Associate is the shorter, more foundational test —
            electrical fundamentals, basic system design, mechanical
            mounting, and safety. PVIS focuses tightly on installation
            execution: conductors, raceways, mounting hardware, monitoring
            and communication systems, and safety plans. PVIP goes further
            still, into code compliance (NEC), commissioning, and
            troubleshooting, and it draws directly on the field-hour
            categories you had to document to qualify.
          </p>
          <p>
            Course quality matters here more than raw study time. NABCEP
            publishes a job task analysis for each credential — the actual
            list of what the exam tests — and the strongest prep courses are
            built directly against it rather than a generic solar curriculum.
          </p>

          

          <h2 id="timeline"><span className="n">04</span>Study Timeline</h2>
          <table className="sr2-credtable">
            <thead>
              <tr>
                <th>Stage</th>
                <th>PV Associate</th>
                <th>PV Installer Specialist</th>
                <th>PV Installation Professional</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Prerequisite</th>
                <td>None — training hours only</td>
                <td>Documented installation-task hours</td>
                <td>Documented field hours across design, install &amp; commissioning</td>
              </tr>
              <tr>
                <th scope="row">Typical prep time</th>
                <td>2–6 weeks alongside a course</td>
                <td>3–6 months, mostly accumulating eligible hours</td>
                <td>3–6 months, mostly accumulating eligible hours</td>
              </tr>
              <tr>
                <th scope="row">Best taken</th>
                <td>Early in OJT or during a training program</td>
                <td>After a year on install-focused crews</td>
                <td>After 1+ years on the tools, including design/commissioning exposure</td>
              </tr>
              <tr>
                <th scope="row">Retake if failed</th>
                <td>Free with HeatSpring&apos;s pass guarantee</td>
                <td>Standard NABCEP retake fee applies</td>
                <td>Standard NABCEP retake fee applies</td>
              </tr>
            </tbody>
          </table>

   
          

          <h2 id="mistakes"><span className="n">06</span>Common Mistakes</h2>
          <p>
            Not logging hours until the PVIP or PVIS application is due.{" "}
            Studying for PVIP off general solar content instead
            of the published job task analysis. Treating PVA as
            optional when
            it&apos;s the fastest, cheapest way to clear an early hiring
            screen while you build toward PVIP or PVIS. Assuming PVIS and
            PVIP are interchangeable when employers are asking for design or
            commissioning experience specifically.
          </p>

          
          <p>
            If you&apos;re still deciding between training routes before you
            even get to certification, our{" "}
            <Link href="/resources/how-to-become-a-solar-installer">
              guide to becoming a solar installer
            </Link>{" "}
            covers entry pathways in full. Once you&apos;re certified, browse
            current{" "}
            <Link href="/jobs?what=Solar%20Installer">
              Solar Installer openings
            </Link>{" "}
            on Solar Roles, or compare providers in our{" "}
            <Link href="/resources/nabcep-training-providers-compared">
              NABCEP training provider comparison
            </Link>
            .
          </p>

          <p className="sr2-fine">
            NABCEP is an independent certification body and is not affiliated
            with Solar Roles. Exam fees, hour requirements, and credential
            names are set by NABCEP and can change — always confirm current
            requirements at nabcep.org before enrolling in a prep course.
          </p>
        </article>

        {/* SIDEBAR */}
        <aside className="sr2-sidebar">
          <div className="sr2-card">
            <div className="sr2-author-card">
              <div className="a">MO</div>
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