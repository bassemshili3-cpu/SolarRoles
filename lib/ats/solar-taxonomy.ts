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
 * Role families covered (broadened from installer-only):
 *   - PV Installer / Lead Installer / Crew
 *   - Solar Electrician
 *   - Solar Site Supervisor / Superintendent (hands-on field lead,
 *     not office project management)
 *   - Commissioning Technician
 *   - O&M / Service / Maintenance / Repair Technician (post-install
 *     field work — a large and growing segment as the installed
 *     base ages)
 *   - Battery / Energy Storage Installer
 *
 * Deliberately still excluded: sales, appointment-setting, design/
 * engineering desk roles, permitting/admin — anything that isn't
 * physically working on a system in the field.
 *
 * Two-tier strategy:
 *   1) TITLE MATCH (cheap, reliable, low false-positive rate) — the
 *      default path. Most solar postings say "solar" or "PV" in the title.
 *   2) GENERIC TITLE + DESCRIPTION CORROBORATION — some solar companies
 *      post under bland internal titles ("Installer II", "Field
 *      Technician", "Site Supervisor", "Service Tech") that carry zero
 *      solar signal on their own. For THOSE titles only, we fall back
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
  /lead\s*(solar\s*)?install(er)?/i,
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

  // --- electrician ---
  /solar\s*electrician/i,
  /pv\s*electrician/i,

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

  // --- battery / storage ---
  /battery\s*storage\s*install(er)?/i,
  /energy\s*storage\s*install(er)?/i,
  /\bess\s*install(er|ation)?/i, // "energy storage system"

  // --- certifications as a strong standalone signal ---
  /\bnabcep\b/i,
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
];

export function isSolarInstallerRole(title: string, description?: string): boolean {
  if (!title) return false;

  // Excludes always win, whether tripped by title or description.
  if (EXCLUDE_PATTERNS.some((re) => re.test(title))) return false;
  if (EXCLUDE_PATTERNS.some((re) => re.test(title))) return false;

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
  | 'other';

export function getSolarRoleFamily(title: string): SolarRoleFamily {
  if (/electrician/i.test(title)) return 'electrician';
  if (/supervisor|superintendent|crew\s*lead/i.test(title)) return 'supervisor';
  if (/commissioning/i.test(title)) return 'commissioning';
  if (/(o&m|om\s*tech|service\s*tech|maintenance\s*tech|repair\s*tech|troubleshoot)/i.test(title)) return 'om';
  if (/(battery|storage|\bess\b)/i.test(title)) return 'storage';
  if (/install|racking|array|module|crew|apprentice|journeyman/i.test(title)) return 'installer';
  return 'other';
}