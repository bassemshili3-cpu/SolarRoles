/**
 * Solar PV role taxonomy for SolarRoles
 *
 * Decides whether a job pulled from an ATS source belongs on the
 * SolarRoles board. The niche is hands-on field roles across the
 * solar install lifecycle — not just "Installer" as a job title, but
 * the whole crew of trades that build, commission, and maintain PV
 * systems (cf. BLS "Solar Photovoltaic Installers" occupation, plus
 * closely adjacent field trades that share the same labor pool).
 *
 * TAXONOMY GOAL: bias toward roles whose descriptions are likely to
 * name specific certifications (NABCEP, OSHA-10, OSHA-30, etc.) —
 * i.e. hands-on, safety-sensitive, credential-gated field work.
 * Roofer/roofing is intentionally NOT covered yet (too high a false-
 * positive rate against the much larger general roofing labor market).
 *
 * Role families covered:
 *   - PV Installer / Lead Installer / Crew / Racking / Tracker
 *   - Solar Electrician
 *   - Solar Site Supervisor / Superintendent / Foreman (hands-on
 *     field lead, not office project management)
 *   - Commissioning Technician
 *   - O&M / Service / Maintenance / Repair / Field Service Technician
 *     (post-install field work — a large and growing segment as the
 *     installed base ages)
 *   - Battery / Energy Storage Installer
 *   - QA/QC / Inspector (solar-specific)
 *   - Solar Thermal / Solar Hot Water Installer
 *
 * Deliberately still excluded: sales, appointment-setting, design/
 * engineering desk roles, permitting/admin, roofing (general) —
 * anything that isn't physically working on a system in the field,
 * or that carries too high a false-positive risk for now.
 *
 * Two-tier strategy:
 *   1) TITLE MATCH (cheap, reliable, low false-positive rate) — the
 *      default path. Most solar postings say "solar" or "PV" in the title.
 *   2) GENERIC TITLE + DESCRIPTION CORROBORATION — some solar companies
 *      post under bland internal titles ("Installer II", "Field
 *      Technician", "Foreman", "Inspector") that carry zero solar
 *      signal on their own. For THOSE titles only, we fall back
 *      to the description, and we require a STRONG, specific solar
 *      signal (not just the word "solar" appearing once) to avoid
 *      pulling in, e.g., a cable "Field Technician" whose description
 *      happens to mention a client's "solar-ready roofing".
 *
 * Tune this list as you see false positives/negatives in production.
 */

// solar-taxonomy.ts — les listes de patterns restent privées (pas d'export)
export function isGenericInstallerTitle(title: string): boolean {
  return GENERIC_TITLE_PATTERNS.some((re) => re.test(title));
}

const INCLUDE_PATTERNS: RegExp[] = [
  // --- installer / crew (base) ---
  /solar\s*(panel)?\s*install(er|ation)/i,
  /solar\s*install(ation)?\s*specialist/i,
  /\bpv\s*install(er|ation)/i,
  /\bpv\s*systems?\s*tech(nician)?/i,
  /photovoltaic\s*install(er|ation)/i,
  /solar\s*(field|service)\s*tech(nician)?/i,
  /solar\s*tech(nician)?\b/i,
  /lead\s*solar\s*install(er)?/i, // "solar" obligatoire ici — sinon matche n'importe quel "Lead Installer" (télécom, etc.)
  /solar\s*(crew|foreman)/i,
  /residential\s*solar\s*install/i,
  /commercial\s*solar\s*install/i,
  /rooftop\s*solar/i,
  /solar\s*racking/i,
  /solar\s*apprentice/i,
  /solar\s*mechanic/i,
  /\barray\s*install(er|ation)/i,
  /\barray\s*tech(nician)?\b/i,
  /module\s*install(er|ation)/i,
  /\bbos\s*install(er)?\b/i, // "balance of system" installer
  /balance[\s-]*of[\s-]*system/i,
  /solar\s*(array|module|panel)\s*tech(nician)?/i,
  /pv\s*(array|module)\s*install(er)?/i,

  // --- ground-mount / utility-scale construction ---
  /solar\s*tracker\s*(install(er)?|tech(nician)?)/i,
  /(single|dual)[\s-]?axis\s*tracker/i,
  /pile\s*driv(er|ing)\s*.*solar/i,
  /solar\s*farm\s*(tech(nician)?|construction)/i,
  /utility[\s-]*scale\s*(pv|solar)\s*(construction|tech(nician)?)/i,

  // --- inverter (often its own role in utility-scale) ---
  /solar\s*inverter\s*(tech(nician)?|field\s*service)/i,
  /pv\s*inverter\s*(tech(nician)?|specialist)/i,

  // --- electrician ---
  /solar\s*electrician/i,
  /pv\s*electrician/i,
  /solar\s*wireman/i,
  /journeyman\s*solar\s*(electrician|installer)?/i,

  // --- site supervision (hands-on field lead, not desk PM) ---
  /solar\s*(site\s*)?supervisor/i,
  /solar\s*(site\s*)?superintendent/i,
  /solar\s*field\s*supervisor/i,
  /solar\s*install(ation)?\s*(crew\s*)?lead(er)?/i,

  // --- commissioning ---
  /solar\s*commissioning\s*tech(nician)?/i,
  /pv\s*commissioning\s*tech(nician)?/i,
  /commissioning\s*(&|and)?\s*(startup|start-up)?\s*tech(nician)?.*solar/i,

  // --- O&M / service / maintenance / repair ---
  /solar\s*(o&m|om)\s*tech(nician)?/i,
  /solar\s*operations?\s*(&|and)\s*maintenance/i,
  /solar\s*service\s*tech(nician)?/i,
  /solar\s*maintenance\s*tech(nician)?/i,
  /solar\s*repair\s*tech(nician)?/i,
  /solar\s*troubleshoot(ing|er)/i,
  /pv\s*(o&m|service|maintenance)\s*tech(nician)?/i,
  /string\s*inverter\s*tech(nician)?/i,
  /utility[\s-]*scale\s*solar/i,
  /solar\s*field\s*service\s*(tech(nician)?|engineer)/i,
  /pv\s*field\s*service/i,

  // --- battery / storage ---
  /battery\s*storage\s*install(er)?/i,
  /energy\s*storage\s*install(er)?/i,
  /\bess\s*install(er|ation)?/i, // "energy storage system"

  // --- BESS / battery storage (expanded) ---
/\bbess\b/i, // "Battery Energy Storage System" acronym, common standalone in titles
/battery\s*energy\s*storage\s*(system)?\s*(tech(nician)?|install(er)?|engineer)?/i,
/battery\s*(systems?)\s*tech(nician)?/i,
/storage\s*commissioning\s*tech(nician)?/i,
/storage\s*(field\s*)?tech(nician)?/i,

// --- commercial & industrial (C&I is the standard industry shorthand) ---
/\bc\s*&\s*i\s*solar/i,
/commercial\s*(&|and)\s*industrial\s*solar/i,
/commercial\s*solar\s*(tech(nician)?|electrician|foreman)/i,

// --- utility-scale / ground-mount (expanded) ---
/ground[\s-]?mount(ed)?\s*(solar|pv)\s*(install(er)?|construction|tech(nician)?)/i,
/utility\s*solar\s*tech(nician)?/i,
/utility[\s-]*scale\s*(solar|pv)\s*(tech(nician)?|install(er)?)/i,

  // --- QA/QC & inspection (solar-specific) ---
  /solar\s*qa\s*[\/-]?\s*qc\s*(tech(nician)?|inspector)?/i,
  /pv\s*(system\s*)?inspector/i,
  /solar\s*(quality|qc)\s*inspector/i,

  // --- solar thermal (NABCEP also has a distinct Solar Heating cert) ---
  /solar\s*thermal\s*install(er)?/i,
  /solar\s*(hot\s*water|water\s*heat(ing|er))\s*install(er)?/i,

  // --- certifications as a strong standalone signal ---
  /\bnabcep\b/i,
];

// --- Technical sales carve-out ---
// NABCEP has a dedicated "PV Technical Sales" credential. Unlike pure
// canvassing/closing/door-to-door roles (blocked below by
// EXCLUDE_PATTERNS), technical sales titles that explicitly tie back
// to NABCEP in the description are let through — but ONLY on that
// narrow, high-precision signal. We deliberately do NOT reuse the
// broader DESCRIPTION_STRONG_SIGNALS list here: "we sell solar
// systems" is not enough on its own, we require the NABCEP tie-in
// specifically to avoid pulling in ordinary door-to-door sales roles
// that happen to mention "solar" a lot but carry no certification.
const TECHNICAL_SALES_TITLE_PATTERNS: RegExp[] = [
  /solar\s*technical\s*sales/i,
  /technical\s*sales.*solar/i,
  /solar\s*sales\s*engineer/i,
  /solar\s*design\s*(&|and)\s*sales/i,
  /pv\s*technical\s*sales/i,
];

const TECHNICAL_SALES_STRONG_SIGNALS: RegExp[] = [
  /nabcep.*technical\s*sales/i,
  /technical\s*sales.*nabcep/i,
  /nabcep\s*(certified|certification|credential)?.*sales/i,
  /\bnabcep\b/i, // any explicit NABCEP mention is enough once the title itself already signals technical sales
];

// Filtered out even if an include pattern (title or description) also
// matches — protects against common false positives like non-solar
// trades, or solar-adjacent desk roles outside the field-work niche.
const EXCLUDE_PATTERNS: RegExp[] = [
  /solar\s*system(s)?\b(?!.*install)/i, // "solar system" astronomy/edu, unless still says "install"
  /software\s*install(er)?/i,
  /window\s*install(er)?/i,
  /flooring\s*install(er)?/i,
  /carpet\s*install(er)?/i,
  /security\s*install(er)?/i,
  /alarm\s*install(er)?/i,
  /cable\s*install(er)?/i,
  /solar\s*turbines/i, // Solar Turbines Inc. — gas turbine manufacturer, unrelated to PV
  /solar\s*(sales|consultant|advisor|canvasser)/i,
  /appointment\s*setter/i,
  /project\s*(manager|coordinator)\b(?!.*field)/i, // desk PM roles, unless explicitly field-based
  /\b(design|engineer(ing)?)\s*(analyst|associate)?\b(?!.*install)/i, // desk design/engineering roles
  /permit(ting)?\s*(specialist|coordinator|technician)/i,
  /home\s*inspector/i, // generic real-estate home inspector, not PV
  /building\s*inspector\b(?!.*solar)/i,
];

// Titles that carry NO solar signal by themselves but are commonly used
// internally by solar companies for the same field-work roles. Only
// these titles are eligible for the description fallback — we don't
// want to run description-sniffing on every generic title in existence
// (e.g. "Manager", "Coordinator", "Analyst").
const GENERIC_TITLE_PATTERNS: RegExp[] = [
  /^installer\s*(i{1,3}|1|2|3)?$/i, // "Installer", "Installer II", "Installer 2"...
  /\bfield\s*tech(nician)?\b/i,
  /\bcrew\s*member\b/i,
  /\bcrew\s*lead\b/i,
  /\bjourneyman\s*install(er)?\b/i,
  /\bapprentice\s*install(er)?\b/i,
  /^technician\s*(i{1,3}|1|2|3)?$/i,
  /\binstallation\s*(technician|specialist)\b/i,
  /\bsite\s*supervisor\b/i,
  /\bsuperintendent\b/i,
  /\bo&m\s*tech(nician)?\b/i,
  /\bservice\s*tech(nician)?\b/i,
  /\bmaintenance\s*tech(nician)?\b/i,
  /\bcommissioning\s*tech(nician)?\b/i,
  /\belectrician\s*(i{1,3}|1|2|3)?$/i,
  /\blead\s*install(er)?\b/i, // e.g. "Lead Installer" or "Telecommunications Lead Installer" without "solar" in the title
  /^helper\s*(i{1,3}|1|2|3)?$/i, // "Solar Helper" vs generic "Helper"
  /^laborer\s*(i{1,3}|1|2|3)?$/i,
  /\bforeman\b/i, // "Foreman" alone is too generic (construction at large)
  /\bracking\s*(tech(nician)?|crew|installer)\b/i,
  /\bfield\s*service\s*(tech(nician)?|engineer)\b/i,
  /\bqa\s*[\/-]?\s*qc\s*(tech(nician)?|inspector)?\b/i,
  /\binspector\b/i,
  /\bwireman\b/i,
  /\bepc\s*(field\s*)?tech(nician)?\b/i, // "EPC Field Technician" — common in utility-scale
/\bbess\s*(tech(nician)?|install(er)?)?\b/i,
/\bbattery\s*tech(nician)?\b/i,
/\bstorage\s*tech(nician)?\b/i,
];

// Strong, specific solar signals to look for in a description when the
// title itself is generic. Deliberately more specific than a bare
// "solar" mention — we want phrases that describe the actual work or
// the employer's line of business, not an incidental reference.
const DESCRIPTION_STRONG_SIGNALS: RegExp[] = [
  /solar\s*(panel|pv|array|module)s?\s*install/i,
  /install(ing|ation)?\s*(of\s*)?(solar|pv)\s*(panel|array|module|system)/i,
  /mount(ing)?\s*(solar\s*)?(racking|panels?|modules?)/i,
  /residential\s*(and\s*commercial\s*)?solar\s*(install|system)/i,
  /rooftop\s*(solar\s*)?(panel|array|system)/i,
  /\bnabcep\b/i,
  /balance[\s-]*of[\s-]*system/i,
  /\bbos\s*(component|install)/i,
  /string\s*inverters?|microinverters?/i,
  /solar\s*(installation|construction)\s*(company|crew|team)/i,
  /we\s*(are|'re)\s*a\s*(leading\s*)?solar\s*(company|installer|contractor)/i,
  /operat(e|ions)\s*(and|&)\s*maintain\s*(solar|pv)\s*(systems?|arrays?|plants?)/i,
  /commission(ing)?\s*(solar|pv)\s*(system|array|plant)/i,
  /troubleshoot(ing)?\s*(solar|pv)\s*(inverters?|systems?)/i,
  /utility[\s-]*scale\s*solar\s*(farm|plant|project)/i,
  /oversee\s*(a\s*)?(solar\s*)?install(ation)?\s*crew/i,
  /supervise\s*(solar\s*)?install(ation)?\s*(crew|team)/i,
  /solar\s*(tracker|racking)\s*(system|install)/i,
  /single[\s-]?axis\s*tracker/i,
  /pile\s*driv(er|ing)/i,
  /(dc|ac)\s*combiner\s*box/i,
  /inverter\s*(commissioning|troubleshoot|field\s*service)/i,
  /epc\s*(contractor|project).*solar/i,
  /solar\s*(farm|plant)\s*construction/i,
  /nabcep\s*(pv\s*system\s*)?inspector/i,
  /solar\s*thermal|solar\s*hot\s*water/i,
  /quality\s*(assurance|control)\s*.*solar\s*(install|array|system)/i,
  /battery\s*energy\s*storage\s*system/i,
/\bbess\b/i,
/\bc\s*&\s*i\s*solar/i,
/commercial\s*(&|and)\s*industrial\s*solar/i,
/ground[\s-]?mount(ed)?\s*(solar|array|pv)/i,
];

export function isSolarInstallerRole(title: string, description?: string): boolean {
  if (!title) return false;

  // Narrow carve-out, checked first: technical sales titles are let
  // through ONLY if the description explicitly ties back to NABCEP.
  // This runs before the general excludes below, since the blanket
  // sales exclude would otherwise veto legitimate "Solar Technical
  // Sales Engineer" / "PV Technical Sales" postings.
  if (
    TECHNICAL_SALES_TITLE_PATTERNS.some((re) => re.test(title)) &&
    description &&
    TECHNICAL_SALES_STRONG_SIGNALS.some((re) => re.test(description))
  ) {
    return true;
  }

  // Excludes always win, whether tripped by title or description.
  if (EXCLUDE_PATTERNS.some((re) => re.test(title))) return false;
  if (description && EXCLUDE_PATTERNS.some((re) => re.test(description))) return false;

  // Tier 1: title alone carries a solar signal for one of the covered roles.
  if (INCLUDE_PATTERNS.some((re) => re.test(title))) return true;

  // Tier 2: generic title + description corroboration.
  if (
    description &&
    GENERIC_TITLE_PATTERNS.some((re) => re.test(title)) &&
    DESCRIPTION_STRONG_SIGNALS.some((re) => re.test(description))
  ) {
    return true;
  }

  return false;
}

/**
 * Optional: coarse role family for a matched job, useful later for
 * landing-page segmentation (e.g. /jobs/solar-om-technician,
 * /jobs/solar-site-supervisor) without touching the match logic above.
 * Only meaningful when isSolarInstallerRole(title, description) is true.
 */
export type SolarRoleFamily =
  | 'installer'
  | 'electrician'
  | 'supervisor'
  | 'commissioning'
  | 'om'
  | 'storage'
  | 'qa_qc'
  | 'thermal'
  | 'sales'
  | 'other';

export function getSolarRoleFamily(title: string): SolarRoleFamily {
  if (/technical\s*sales|sales\s*engineer/i.test(title)) return 'sales';
  if (/electrician|wireman/i.test(title)) return 'electrician';
  if (/supervisor|superintendent|crew\s*lead|foreman/i.test(title)) return 'supervisor';
  if (/commissioning/i.test(title)) return 'commissioning';
  if (/(o&m|om\s*tech|service\s*tech|maintenance\s*tech|repair\s*tech|troubleshoot|field\s*service)/i.test(title)) return 'om';
  if (/battery|storage|\bbess\b/i.test(title)) return 'storage';
  if (/qa\s*[\/-]?\s*qc|inspector/i.test(title)) return 'qa_qc';
  if (/thermal|hot\s*water/i.test(title)) return 'thermal';
  if (/install|racking|array|module|crew|apprentice|journeyman|tracker|helper|laborer/i.test(title)) return 'installer';
  return 'other';
}