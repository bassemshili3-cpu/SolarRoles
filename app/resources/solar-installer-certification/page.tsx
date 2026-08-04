import type { Metadata } from "next";

import Link from "next/link";


const SITE_URL = "https://www.solarroles.com";

const PAGE_PATH = "/resources/solar-installer-certification";

const PAGE_TITLE =

  "Solar Installer Certifications: What to Get & Which Course Fits Your Path";

const PAGE_DESCRIPTION =

  "Every solar installer credential and the specifics of each course.";


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

      dateModified: "2026-08-04",

      publisher: { "@type": "Organization", name: "Solar Roles" },

    },

    {

      "@type": "BreadcrumbList",

      itemListElement: [

        { "@type": "ListItem", position: 1, name: "Resources", item: `${SITE_URL}/resources` },

        { "@type": "ListItem", position: 2, name: "Solar Installer Certification", item: `${SITE_URL}${PAGE_PATH}` },

      ],

    },

  ],

};


/* ────────────────────────────────────────────────────────────────────────── */

/*  Solar Roles palette                                                       */

/* ────────────────────────────────────────────────────────────────────────── */


const css = `

.sr2-page {

  --navy-900: #0B1A2E;

  --navy-800: #0F2440;

  --navy-700: #1a2340;

  --navy-600: #1E3A5F;

  --navy-100: #E5EAF2;

  --navy-50:  #F2F5FA;

  --gold-500: #F5B819;

  --gold-600: #E5A810;

  --amber-600: #B45309;

  --amber-700: #92400E;

  --amber-800: #78350F;

  --amber-500: #F2A93B;

  --coral-500: #FF6A3D;

  --cream-100: #FEF3C7;

  --ink-900: #0B1A2E;

  --ink-700: #2A3344;

  --ink-600: #3F4A5C;

  --ink-500: #5A6577;

  --ink-400: #6B7484;

  --line:     #E5E9F0;

  --line-soft:#EEF1F6;

  --green-600: #15803D;

  --green-50: #F0FDF4;

  --red-600: #DC2626;

  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  color: var(--ink-900);

  background: #fff;

  -webkit-font-smoothing: antialiased;

  text-rendering: optimizeLegibility;

  font-size: 15px;

  line-height: 1.55;

}


/* ── PAGE TITLE (H1) ──────────────────────────────────────────────── */

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


/* ── MAIN LAYOUT (single col, no sidebar) ────────────────────────── */

.sr2-shell {

  max-width: 1180px;

  margin: 36px auto 0;

  padding: 0 24px 96px;

  display: grid;

  grid-template-columns: minmax(0, 1fr);

  align-items: start;

}


/* ── AUTHOR BYLINES (under title) ────────────────────────────────── */

.sr2-bylines {

  display: inline-flex;

  align-items: center;

  gap: 16px;

  margin: 22px auto 0;

  padding: 10px 16px;

  background: #fff;

  border: 1px solid var(--line);

  border-radius: 12px;

  box-shadow: 0 1px 0 rgba(11,26,46,0.03);

  font-size: 12.5px;

  color: var(--ink-500);

  text-align: left;

}

.sr2-bylines-author { display: flex; align-items: center; gap: 10px; }

.sr2-bylines-author .a {

  width: 32px; height: 32px; border-radius: 50%;

  background: linear-gradient(135deg, #1E3A5F, #0B1A2E);

  color: #fff;

  display: flex; align-items: center; justify-content: center;

  font-weight: 800; font-size: 13px;

  flex-shrink: 0;

}

.sr2-bylines-author .by {

  display: block;

  font-size: 10.5px; font-weight: 800; letter-spacing: 0.12em;

  text-transform: uppercase; color: var(--ink-500);

  line-height: 1.2;

}

.sr2-bylines-author .nm {

  display: block; font-size: 14px; font-weight: 800; color: var(--navy-900);

  line-height: 1.2;

}

.sr2-bylines-author .nm .mark { color: var(--gold-500); }

.sr2-bylines-meta {

  display: flex; align-items: center; gap: 8px;

  padding-left: 16px;

  border-left: 1px dashed var(--line);

  flex-wrap: wrap;

}

.sr2-bylines-meta strong { color: var(--ink-900); font-weight: 700; }

.sr2-bylines-meta .changes { color: var(--amber-600); font-weight: 600; }

.sr2-bylines-meta .sep {

  width: 3px; height: 3px; border-radius: 50%;

  background: var(--ink-400); flex-shrink: 0;

}

@media (max-width: 640px) {

  .sr2-bylines { flex-direction: column; gap: 12px; align-items: stretch; padding: 12px 14px; }

  .sr2-bylines-meta { padding-left: 0; border-left: none; padding-top: 12px; border-top: 1px dashed var(--line); justify-content: center; }

}






/* ── ARTICLE ─────────────────────────────────────────────────────── */

.sr2-article {

  font-size: 16.5px;

  line-height: 1.72;

  color: var(--ink-700);

  min-width: 0;

}

.sr2-article h2 {

  font-size: 24px;

  font-weight: 800;

  color: var(--navy-900);

  margin: 32px 0 12px;

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


/* ── TABLE NOTE (above table) ────────────────────────────────────── */

.sr2-table-note {

  font-size: 12.5px; color: var(--ink-500);

  margin: 16px 0 0;

  display: flex; align-items: center; gap: 6px;

}




/* ── CERTIFICATION CHEAT SHEET TABLE (7 cols) ────────────────────── */

.sr2-cert-table {

  margin: 8px 0 8px;

  border: 1px solid var(--line);

  border-radius: 12px;

  overflow: hidden;

  background: #fff;

  box-shadow: 0 1px 0 rgba(11,26,46,0.03);

}

.sr2-cert-head {
  display: grid;
  grid-template-columns: 1.4fr 0.85fr 1fr 1.05fr 0.85fr 1.1fr 0.85fr;
  gap: 6px;
  padding: 16px 16px 0;
  background: #fff;
}

.sr2-cert-head span {

  display: flex;

  align-items: flex-start;

  justify-content: center;

  text-align: center;

  padding: 12px 10px 24px;

  font-size: 11px;

  font-weight: 800;

  letter-spacing: 0.09em;

  text-transform: uppercase;

  color: #fff;

  background: linear-gradient(180deg, var(--amber-700) 0%, var(--amber-800) 100%);

  clip-path: polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%);

}

.sr2-cert-head span:first-child {

  background: transparent;

  clip-path: none;

  color: transparent;

  padding-bottom: 0;

}

.sr2-cert-row {
  display: grid;
  grid-template-columns: 1.4fr 0.85fr 1fr 1.05fr 0.85fr 1.1fr 0.85fr;
  border-top: 1px solid var(--line-soft);
  background: #fff;
}

.sr2-cert-row:nth-child(even) { background: #FBF6EE; }

/* ── AFFILIATE DISCLOSURE ─────────────────────────────────────────── */
.sr2-affiliate-disclosure {
  font-size: 11.5px;
  color: var(--ink-400);
  margin: 4px 0 0;
  font-style: italic;
}

/* ── CTA CELL / BUTTON ────────────────────────────────────────────── */
.sr2-cta {
  justify-content: center;
}

.sr2-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 700;
  color: #000;
  background: linear-gradient(135deg, var(--gold-500), var(--amber-500));
  border-radius: 8px;
  text-decoration: none;
  border-bottom: none;
  white-space: nowrap;
  box-shadow: 0 4px 10px -4px rgba(245,184,25,0.4);
  transition: filter .15s;
}

.sr2-article .sr2-cta-btn {
  color: #000;
}

.sr2-cta-btn:hover {
  filter: brightness(1.06);
}




/* ── PVA row: subtle gold-tinted highlight ──────────────────────── */

.sr2-cert-row.sr2-pva-row {

  background: linear-gradient(90deg, #FEF6E0 0%, #FDEFCB 100%) !important;

  position: relative;

}

.sr2-cert-row.sr2-pva-row::before {

  content: ""; position: absolute; left: 0; top: 0; bottom: 0;

  width: 3px; background: var(--gold-500);

}


.sr2-cert-row > div {

  padding: 14px 16px;

  font-size: 13.5px;

  color: var(--ink-700);

  display: flex;

  align-items: center;

}

.sr2-cert-name {

  font-weight: 800;

  color: var(--navy-900);

  flex-direction: column; align-items: flex-start !important; gap: 3px;

  border-left: 3px solid var(--amber-700);

  padding-left: 13px !important;

}

.sr2-cert-row.sr2-pva-row .sr2-cert-name {

  border-left-color: var(--gold-500);

}

.sr2-cert-name .sub { font-weight: 500; font-size: 12px; color: var(--ink-500); }


.sr2-recognition {
  font-weight: 600;
  color: var(--navy-900);
  font-size: 14px;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.sr2-recognition--highlight {
  font-weight: 700;
}

.sr2-recognition-source {
  display: block;
  margin-top: 2px;
  font-weight: 400;
  font-size: 11px;
  color: var(--navy-500, #5a6b7d);
  letter-spacing: 0;
}






@media (max-width: 760px) {

  .sr2-cert-head { display: none; }

  .sr2-cert-table { border: none; box-shadow: none; }

  .sr2-cert-row {

    grid-template-columns: 1fr;

    border: 1px solid var(--line);

    border-radius: 12px;

    margin-bottom: 10px;

    padding: 4px 0;

  }

  .sr2-cert-row:nth-child(even) { background: #fff; }

  .sr2-cert-row.sr2-pva-row { background: linear-gradient(180deg, #FEF6E0 0%, #FDEFCB 100%) !important; }

  .sr2-cert-row.sr2-pva-row::before { width: 100%; height: 3px; }

  .sr2-cert-row > div {

    padding: 8px 16px;

    display: flex;

    justify-content: space-between;

    align-items: flex-start;

    gap: 12px;

  }

  .sr2-cert-row > div::before {

    content: attr(data-label);

    font-size: 10px;

    font-weight: 800;

    letter-spacing: 0.08em;

    text-transform: uppercase;

    color: var(--ink-400);

    flex-shrink: 0;

    padding-top: 2px;

    min-width: 64px;

  }

  .sr2-cert-name { flex-direction: row !important; border-left: none; padding-left: 16px !important; }

  .sr2-cert-name::before { content: none !important; }

  .sr2-pay { align-items: flex-end !important; }

}


/* ── BOTTOM-LINE 3-UP FACTS ──────────────────────────────────────── */

.sr2-facts {

  display: grid; grid-template-columns: repeat(3, 1fr);

  gap: 14px; margin: 12px 0 24px;

}

@media (max-width: 720px) { .sr2-facts { grid-template-columns: 1fr; } }

.sr2-fact {

  background: var(--navy-50);

  border: 1px solid var(--line);

  border-radius: 12px;

  padding: 16px 18px;

}

.sr2-fact .v {

  font-size: 28px; font-weight: 800; color: var(--navy-900);

  letter-spacing: -0.02em; line-height: 1;

  margin-bottom: 6px;

  font-variant-numeric: tabular-nums;

}

.sr2-fact .v.green { color: var(--green-600); }

.sr2-fact .l {

  font-size: 12.5px; color: var(--ink-600);

  line-height: 1.45;

}


/* ── CTA STRIP AT BOTTOM ─────────────────────────────────────────── */

.sr2-cta-strip {

  margin: 40px 0 0;

  background:

    radial-gradient(500px 240px at 100% 0%, rgba(245,184,25,0.18), transparent 60%),

    linear-gradient(135deg, #0B1A2E 0%, #1E3A5F 100%);

  border-radius: 16px;

  padding: 28px 28px;

  color: #fff;

  position: relative;

  overflow: hidden;

}

.sr2-cta-strip::after {

  content: ""; position: absolute; right: -50px; top: -50px;

  width: 220px; height: 220px;

  border: 1px solid rgba(245,184,25,0.2);

  border-radius: 50%;

}

.sr2-cta-strip .label {

  display: inline-block;

  font-size: 11px; font-weight: 800; letter-spacing: 0.18em;

  text-transform: uppercase; color: var(--gold-500);

  margin-bottom: 8px;

}

.sr2-cta-strip h3 {

  font-size: 22px; font-weight: 800; line-height: 1.2;

  letter-spacing: -0.01em; margin: 0 0 8px;

  position: relative; z-index: 1;

}

.sr2-cta-strip p {

  font-size: 14px; color: rgba(255,255,255,0.78);

  margin: 0 0 18px;

  position: relative; z-index: 1;

}

.sr2-cta-strip .actions { display: flex; gap: 10px; flex-wrap: wrap; position: relative; z-index: 1; }

.sr2-cta-strip .gold-btn {

  display: inline-flex; align-items: center; gap: 6px;

  padding: 13px 18px;

  background: var(--gold-500);

  color: var(--navy-900);

  border-radius: 10px;

  text-decoration: none; font-weight: 800; font-size: 14.5px;

  box-shadow: 0 6px 18px -6px rgba(245,184,25,0.55);

  transition: all .15s;

}

.sr2-cta-strip .gold-btn:hover { background: #FFD23E; transform: translateY(-1px); }

.sr2-cta-strip .ghost {

  display: inline-flex; align-items: center; gap: 6px;

  padding: 11px 18px;

  background: rgba(255,255,255,0.06);

  color: #fff;

  border: 1px solid rgba(255,255,255,0.2);

  border-radius: 8px;

  text-decoration: none; font-weight: 600; font-size: 14px;

  transition: all .15s;

}

.sr2-cta-strip .ghost:hover { background: rgba(255,255,255,0.12); }


/* ── FINE PRINT ─────────────────────────────────────────────────── */

.sr2-fine {

  margin: 28px 0 0;

  font-size: 11.5px; line-height: 1.5; color: var(--ink-500);

}

.sr2-fine strong { color: var(--ink-700); font-weight: 700; }


/* ── RIGHT SIDEBAR ────────────────────────────────────────────────── */

.sr2-sidebar { position: sticky; top: 24px; align-self: start; display: flex; flex-direction: column; gap: 18px; }

.sr2-card {

  background: #fff;

  border: 1px solid var(--line);

  border-radius: 14px;

  padding: 20px;

}

.sr2-author-card { display: flex; gap: 12px; align-items: flex-start; }

.sr2-author-card .a {

  width: 40px; height: 40px; border-radius: 50%;

  background: linear-gradient(135deg, #1E3A5F, #0B1A2E);

  color: #fff;

  display: flex; align-items: center; justify-content: center;

  font-weight: 800; font-size: 16px;

  flex-shrink: 0;

}

.sr2-author-card .by {

  font-size: 11px; font-weight: 800; letter-spacing: 0.12em;

  text-transform: uppercase; color: var(--ink-500);

}

.sr2-author-card .nm {

  font-size: 14px; font-weight: 800; color: var(--navy-900);

  display: flex; align-items: center; gap: 4px;

  margin: 1px 0 0;

}

.sr2-author-card .nm .mark { color: var(--gold-500); }


/* ── SIDEBAR META STRIP (inside the author card) ─────────────────── */

.sr2-card-meta {

  margin-top: 14px;

  padding-top: 14px;

  border-top: 1px dashed var(--line-soft);

  font-size: 12px;

  color: var(--ink-500);

  line-height: 1.5;

}

.sr2-card-meta .row { display: flex; align-items: center; gap: 6px; }

.sr2-card-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--ink-400); }

.sr2-card-meta strong { color: var(--ink-700); font-weight: 700; }

.sr2-card-meta .changes { color: var(--amber-600); font-weight: 600; }

`;


export default function SolarInstallerCertification() {

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

          Quick Look · 2026

        </span>

        <h1>

          Solar Installer <span className="accent">Certifications</span>: What to Get & Which Course Fits Your Path

        </h1>

        <p className="sub">{PAGE_DESCRIPTION}</p>


        <div className="sr2-bylines">

          <div className="sr2-bylines-author">

            <div className="a">SR</div>

            <div>

              <div className="by">By Editorial Team</div>

              <div className="nm">Solar<span className="mark">Roles</span></div>

            </div>

          </div>

          <div className="sr2-bylines-meta">

            <span><strong>Last reviewed:</strong> 4 August, 2026</span>

            <span className="sep" />

            <span className="changes">Updated with Q3 2026 requirements &amp; pay data</span>

          </div>

        </div>

      </div>


      <div className="sr2-shell">

        <article className="sr2-article">

















          <h2 id="table" className="sr2-first"><span className="n">01</span>The cheat sheet</h2>
<p className="sr2-table-note">
  *Pay ranges reflect BLS OEWS May 2024 (SOC 47-2231) plus current
  industry surveys — see sources at the bottom of the page.
<br></br>
  *This table contains affiliate links. We may earn a commission if
  you enroll through them, at no extra cost to you.
</p>


<div className="sr2-cert-table">
  <div className="sr2-cert-head">
    <span>Credential</span>
    <span>Status</span>
    <span>Who needs it</span>
    <span>Training hours</span>
    <span>Exam cost</span>
    <span>Recognition</span>
    <span>Get started</span>
  </div>

  <div className="sr2-cert-row">
    <div className="sr2-cert-name" data-label="Credential">
      OSHA 10
    </div>
    <div data-label="Status">Employer-required</div>
    <div data-label="Who">Anyone starting on a roof crew</div>
    <div data-label="Training hours">10 hrs, no prerequisite</div>
   <div data-label="Exam cost">$50 – $150</div>   
    <div data-label="Recognition" className="sr2-recognition">
      <span className="sr2-recognition">Federal DOL card (OSHA)</span>
    </div>
    <div data-label="Get started" className="sr2-cta">
      <a href="https://www.heatspring.com/courses/osha-10-hour-construction?aff_id=9f_wlq" className="sr2-cta-btn">
        Start Today
      </a>
    </div>
  </div>

  <div className="sr2-cert-row">
    <div className="sr2-cert-name" data-label="Credential">
      OSHA 30
    </div>
    <div data-label="Status">Recommended</div>
    <div data-label="Who">Crew leads &amp; supervisors</div>
    <div data-label="Training hours">30 hrs, deeper safety scope</div>
    <div data-label="Exam cost">$130 – $190</div>  {/* OSHA 30 */}
    <div data-label="Typical pay" className="sr2-recognition">
      <span className="sr2-recognition">Federal DOL card (OSHA)</span>
    </div>
    <div data-label="Get started" className="sr2-cta">
      <a href="https://www.heatspring.com/courses/osha-30-hour-construction?aff_id=9f_wlq" className="sr2-cta-btn">
        Start Today
      </a>
    </div>
  </div>

  <div className="sr2-cert-row">
    <div className="sr2-cert-name" data-label="Credential">
      State electrical license
    </div>
    <div data-label="Status">Legally required*</div>
    <div data-label="Who">Anyone doing licensed wiring work</div>
    <div data-label="Training hours">Varies by state</div>
    <div data-label="Exam cost">$50 – $150</div> 
    <div data-label="Typical pay" className="sr2-recognition">
      <span className="sr2-recognition">Required by state</span>
    </div>
    <div data-label="Get started" className="sr2-cta">
      <a href="https://www.nascla.org" className="sr2-cta-btn">
        Start Today
      </a>
    </div>
  </div>

  <div className="sr2-cert-row sr2-pva-row">
    <div className="sr2-cert-name" data-label="Credential">
      NABCEP PV Associate
      <span className="sub">Entry-level credential</span>
    </div>
    <div data-label="Status">Recommended</div>
    <div data-label="Who">Installers a few months in</div>
    <div data-label="Training hours">No fixed minimum — typical prep courses run ~40 hrs</div>
    <div data-label="Exam cost">$150</div> 
    <div data-label="Typical pay" className="sr2-recognition">
      <span className="sr2-recognition">
  Recognized stepping stone to PVIP
</span>
      
    </div>
    <div data-label="Get started" className="sr2-cta">
      <a href="https://www.heatspring.com/courses/solar-pv-boot-camp-nabcep-pv-associate-exam-prep?aff_id=9f_wlq" className="sr2-cta-btn">
        Start Today
      </a>
    </div>
  </div>

  <div className="sr2-cert-row">
    <div className="sr2-cert-name" data-label="Credential">
      NABCEP PVIP
      <span className="sub">Installation Professional</span>
    </div>
    <div data-label="Status">Expected for lead roles</div>
    <div data-label="Who">Lead installer, commercial bids</div>
    <div data-label="Training hours">58 documented training hours</div>
    <div data-label="Exam cost">$500</div> 
    <div data-label="Typical pay" className="sr2-recognition">
      <span className="sr2-recognition sr2-recognition--highlight">
  Only US solar installer credential accredited to ISO/IEC 17024 (ANSI)
  <span className="sr2-recognition-source">Source: NABCEP / ANAB</span>
</span>
      
    </div>
    <div data-label="Get started" className="sr2-cta">
      <a href="https://www.heatspring.com/courses/nabcep-pv-installation-professional-pvip-certification-prep?aff_id=9f_wlq" className="sr2-cta-btn">
        Start Today
      </a>
    </div>
  </div>

  <div className="sr2-cert-row">
    <div className="sr2-cert-name" data-label="Credential">
      Manufacturer certs
      <span className="sub">Tesla, Enphase, SolarEdge</span>
    </div>
    <div data-label="Status">Optional</div>
    <div data-label="Who">Installers specializing in that equipment</div>
    <div data-label="Training hours">Enphase: ~5 hrs SolarEdge: 2-12 hrs Tesla: weeks-to-months</div>
    <div data-label="Exam cost">Free – $150</div>
    <div data-label="Typical pay" className="sr2-recognition">
      <span className="sr2-recognition">Manufacturer-specific recognition only</span>
    </div>
    <div data-label="Get started" className="sr2-cta">
      <a href="https://www.tesla.com/support/energy/tesla-certified-installer" className="sr2-cta-btn">
        Start Today
      </a>
    </div>
  </div>
</div>









          <h2 id="bottom"><span className="n">02</span>The bottom line</h2>


          <div className="sr2-facts">

            <div className="sr2-fact">

              <div className="v green">+$11k/yr</div>

              <div className="l">
Average pay bump reported for NABCEP-certified installers, based on third-party salary data analysis
 (PayScale/SimplyHired).</div>

            </div>

            <div className="sr2-fact">

              <div className="v">75%</div>

              <div className="l">
Of NABCEP PV Installation Professional holders on Indeed say earning the credential helped them land a job.</div>

            </div>

            <div className="sr2-fact">

              <div className="v">88%</div>

              <div className="l">88% pass rate among students of HeatSpring's PVA prep course (HeatSpring, self-reported)</div>

            </div>

          </div>


          <p>

            That's the whole picture in 30 seconds. The table above covers

            every credential you'll see on a solar job posting and what each

            one actually pays. Everything below is the long version, if you

            want it.

          </p>


          <h2 id="law"><span className="n">03</span>What's actually required by law</h2>

          <p>

            Shorter than most people expect, and it varies by state rather

            than being one national rule. No federal law requires any

            certification to install solar panels. What can be legally

            required, depending on where you work, is a state electrical

            license for certain wiring tasks, and OSHA safety training that

            most employers treat as mandatory even where it technically

            isn't. A NABCEP credential is not a license — it doesn't let

            you pull a permit or pass a final inspection on its own, in any

            state. If your job involves signing off on electrical work, your

            state license is what carries the legal weight, not your NABCEP

            card.

          </p>

          <p>

            The practical takeaway: a state electrical license and the

            NABCEP PVA are not competing credentials. The license is a slow,

            multi-year path that gates certain work. The PVA is a months-long

            move that raises what you earn on every job you're allowed to

            do. Most installers end up wanting both eventually.

          </p>


          <h2 id="payoff"><span className="n">04</span>Where the pay jump actually happens</h2>

          <p>

            The clearest financial jump sits between OSHA 10 alone and

            NABCEP PV Associate. Entry-level installers without the PVA

            generally top out around $42k. Adding the PVA — which has no

            field-experience prerequisite to sit the exam — moves the same

            installer into the $45-55k band, often within the first year on

            the crew. The PVA doesn't change the work; it changes what

            companies will pay you for it.

          </p>

          <p>

            The next jump, from PVA to PVIP, is what separates lead installer pay from crew installer pay. PVIP holders typically land in the $60-75k range — in line with BLS data showing the top 25% of solar PV installers earning $60k+ annually, with the highest 10% clearing $80k. Real listing data, not a marketing estimate — see the breakdown on our{" "}

            <Link href="/data/salaries/lead-solar-installer">

              Lead Solar Installer salary page

            </Link>

            .

          </p>


          <div className="sr2-cta-strip">

            <span className="label">Next step</span>

            <h3>See who's hiring solar installers this week.</h3>

            <p>

              Every listing on Solar Roles is pulled from an actual employer

              posting — no scraped duplicates, no recruiter spam.

            </p>

            <div className="actions">

              <Link href="/jobs?what=Solar%20Installer" className="gold-btn">

                Browse open installer jobs

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>

              </Link>

              <Link href="/resources/how-to-become-a-solar-installer" className="ghost">

                Full career guide

              </Link>

            </div>

          </div>


          <p className="sr2-fine">

            <strong>*Sources:</strong> Sources: BLS Occupational Employment and Wage Statistics, May 2024 (SOC 47-2231, Solar Photovoltaic Installers); BLS Occupational Outlook Handbook, 2024 edition; NABCEP 2024 Industry Survey Report; NABCEP accreditation status per ANSI National Accreditation Board (ANAB), ISO/IEC 17024 personnel certification directory. Pay levels reflect national wage distribution bands and vary by state, employer, and overtime. Certification and licensing requirements vary by state and change over time — this page is not legal advice.

          </p>

        </article>

      </div>

    </div>

  );

}