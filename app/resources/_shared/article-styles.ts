export const articleCss = `
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
/* ── EDITORIAL BYLINE STRIP ───────────────────────────────────────────── */
.sr2-bylines {
  max-width: 1280px;
  margin: 28px auto 0;
  padding: 0 24px;
}
.sr2-bylines-inner {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 22px 26px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(11,26,46,0.03);
}
.sr2-byline { display: flex; align-items: center; gap: 14px; padding: 10px 0; }
.sr2-byline + .sr2-byline { border-top: 1px dashed var(--line-soft); }
.sr2-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.sr2-avatar.a1 { background: linear-gradient(135deg, #1E3A5F, #0B1A2E); }
.sr2-avatar.a2 { background: linear-gradient(135deg, #B45309, #0B1A2E); }
.sr2-avatar.a3 { background: linear-gradient(135deg, #F5B819, #B45309); color: #0B1A2E; }
.sr2-byline .who { flex: 1; min-width: 0; }
.sr2-byline .who .label {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-700);
}
.sr2-byline .who .label strong { color: var(--ink-900); font-weight: 700; }
.sr2-byline .who .role {
  display: block;
  font-size: 13px;
  color: var(--amber-600);
  font-weight: 600;
  margin-top: 1px;
}
.sr2-byline .socials { display: flex; gap: 8px; align-items: center; }
.sr2-soc {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: #0B1A2E;
  color: #fff;
  transition: all .15s;
}
.sr2-soc:hover { background: var(--gold-500); color: var(--navy-900); }
.sr2-soc.ghost { background: transparent; color: var(--navy-900); border: 1px solid var(--line); }
.sr2-soc.ghost:hover { background: var(--navy-900); color: var(--gold-500); border-color: var(--navy-900); }
.sr2-meta-strip {
  display: flex; align-items: center; flex-wrap: wrap; gap: 12px;
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid var(--line-soft);
  font-size: 13px; color: var(--ink-500);
}
.sr2-meta-strip .dot { width: 4px; height: 4px; border-radius: 50%; background: var(--ink-400); }
.sr2-meta-strip strong { color: var(--ink-900); font-weight: 700; }
.sr2-meta-strip .changes { color: var(--amber-600); font-weight: 600; }
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
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.15;
  color: var(--navy-900);
}
.sr2-title h1 .accent {
  color: var(--navy-900);
}
.sr2-title .sub {
  max-width: 680px;
  margin: 16px auto 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink-500);
}
/* ── HERO IMAGE ─────────────────────────────────────────────────────── */
.sr2-hero-img {
  max-width: 1280px;
  margin: 28px auto 0;
  padding: 0 24px;
}
.sr2-hero-img .frame {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 16 / 6;
  background: #0B1A2E;
  box-shadow: 0 24px 60px -20px rgba(11,26,46,0.4);
}
.sr2-hero-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.sr2-hero-img .veil {
  position: absolute; inset: 0;
  background:
    linear-gradient(180deg, rgba(11,26,46,0) 30%, rgba(11,26,46,0.85) 100%),
    linear-gradient(90deg, rgba(11,26,46,0.45) 0%, rgba(11,26,46,0) 50%);
}
.sr2-hero-img .caption {
  position: absolute; left: 28px; bottom: 22px; right: 28px;
  color: #fff;
  display: flex; align-items: end; justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.sr2-hero-img .caption h1 {
  margin: 0;
  font-size: clamp(26px, 3.4vw, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  max-width: 720px;
}
.sr2-hero-img .caption h1 .accent {
  background: linear-gradient(135deg, #F5B819 0%, #FF6A3D 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.sr2-hero-img .caption .eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--gold-500);
  margin-bottom: 10px;
}
.sr2-hero-img .caption .eyebrow .d {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--gold-500);
  box-shadow: 0 0 0 4px rgba(245,184,25,0.18);
}
.sr2-hero-img .ph-credit {
  font-size: 11px; color: rgba(255,255,255,0.6);
  background: rgba(11,26,46,0.6);
  backdrop-filter: blur(6px);
  padding: 4px 8px; border-radius: 4px;
}
/* ── MAIN LAYOUT ────────────────────────────────────────────────────── */
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
/* ── LEFT: TABLE OF CONTENTS ───────────────────────────────────────── */
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
/* ── CENTER: ARTICLE ───────────────────────────────────────────────── */
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
/* ── DOWNSIDES LIST ───────────────────────────────────────────────── */
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
/* ── INTERACTIVE WIDGET: ROUTE FINDER ─────────────────────────────── */
.sr2-widget {
  margin: 40px 0;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 32px -16px rgba(11,26,46,0.18);
}
.sr2-widget-head {
  background:
    radial-gradient(400px 200px at 100% 0%, rgba(245,184,25,0.18), transparent 60%),
    linear-gradient(135deg, #0B1A2E 0%, #1E3A5F 100%);
  color: #fff;
  padding: 22px 26px 20px;
}
.sr2-widget-head h3 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.sr2-widget-head p {
  margin: 0;
  font-size: 14px;
  color: rgba(255,255,255,0.75);
}
.sr2-widget-body { padding: 22px 26px 26px; }
.sr2-progress {
  display: flex; align-items: center; gap: 10px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-500);
  margin-bottom: 10px;
}
.sr2-progress-bar {
  flex: 1;
  height: 4px;
  background: var(--navy-100);
  border-radius: 99px;
  overflow: hidden;
  position: relative;
}
.sr2-progress-bar .fill {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 25%;
  background: linear-gradient(90deg, var(--gold-500), var(--amber-500));
  border-radius: 99px;
  box-shadow: 0 0 12px rgba(245,184,25,0.5);
}
.sr2-q { margin-top: 14px; }
.sr2-q .qtitle {
  font-size: 18px;
  font-weight: 700;
  color: var(--navy-900);
  margin: 0 0 6px;
}
.sr2-q .qhint { font-size: 13px; color: var(--ink-500); margin: 0 0 14px; }
.sr2-options { display: grid; gap: 10px; }
.sr2-opt {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--ink-700);
  transition: all .15s;
  text-align: left;
  width: 100%;
}
.sr2-opt:hover {
  border-color: var(--gold-500);
  background: #FFFBEC;
  color: var(--navy-900);
}
.sr2-opt .check {
  width: 20px; height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--line);
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  background: #fff;
  transition: all .15s;
}
.sr2-opt:hover .check { border-color: var(--gold-500); background: var(--gold-500); }
.sr2-opt .arrow { margin-left: auto; color: var(--ink-400); }
.sr2-opt:hover .arrow { color: var(--amber-600); transform: translateX(2px); }
/* ── PAY GRID ─────────────────────────────────────────────────────── */
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
/* ── CALLOUT ─────────────────────────────────────────────────────── */
.sr2-callout {
  margin: 24px 0;
  background: linear-gradient(135deg, #0B1A2E 0%, #1E3A5F 100%);
  color: #fff;
  border-radius: 12px;
  border: 1px solid rgba(245,184,25,0.2);
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
}
.sr2-callout::after {
  content: ""; position: absolute; right: -40px; top: -40px;
  width: 160px; height: 160px;
  background: radial-gradient(circle, rgba(245,184,25,0.18), transparent 60%);
}
.sr2-callout .ic {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: rgba(245,184,25,0.15);
  color: var(--gold-500);
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 10px;
  position: relative; z-index: 1;
}
.sr2-callout .kicker {
  display: block;
  font-size: 11px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--gold-500);
  margin-bottom: 4px;
  position: relative; z-index: 1;
}
.sr2-callout p { margin: 0; position: relative; z-index: 1; font-size: 14.5px; line-height: 1.6; color: rgba(255,255,255,0.92); }
/* ── HEATSPRING INLINE CTA ───────────────────────────────────────── */
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
/* ── RIGHT SIDEBAR: AUTHOR + CTA ─────────────────────────────────── */
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
.sr2-author-card + p { font-size: 13.5px; line-height: 1.55; color: var(--ink-600); margin: 14px 0 0; }
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
.sr2-trust .pill {
  font-size: 11px; font-weight: 800;
  background: var(--navy-50);
  color: var(--navy-900);
  padding: 5px 10px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  display: inline-flex; align-items: center; gap: 5px;
}
.sr2-trust .pill .star { color: var(--gold-500); }
/* ── FORM CARD (sidebar) ─────────────────────────────────────────── */
.sr2-form-card { background: #fff; }
.sr2-form-card h4 {
  font-size: 16px; font-weight: 800; color: var(--navy-900);
  margin: 0 0 4px;
}
.sr2-form-card .sub { font-size: 13px; color: var(--ink-500); margin: 0 0 14px; }
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