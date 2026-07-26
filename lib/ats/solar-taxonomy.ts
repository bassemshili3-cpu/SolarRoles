/**
 * Solar PV installer role taxonomy for SolarRoles
 *
 * Decides whether a job pulled from an ATS source belongs on a
 * solar-installer-only job board (niche: PV Installer / Lead Installer,
 * cf. BLS "Solar Photovoltaic Installers" occupation). Filtering runs on
 * the job title (cheap, reliable, low false-positive rate). We deliberately
 * do NOT match on description text — too noisy (e.g. a random construction
 * job mentioning "solar-ready roofing" in its description would
 * false-positive on a naive "solar" match).
 *
 * Deliberately narrow: sales/appointment-setter/consultant roles are
 * excluded even though they're "solar industry" — the niche is hands-on
 * installers, not solar sales.
 *
 * Tune this list as you see false positives/negatives in production.
 */

const INCLUDE_PATTERNS: RegExp[] = [
  /solar\s*(panel)?\s*install(er|ation)/i,
  /\bpv\s*install(er|ation)/i,
  /photovoltaic\s*install(er|ation)/i,
  /solar\s*(field|service)\s*tech(nician)?/i,
  /solar\s*tech(nician)?\b/i,
  /solar\s*electrician/i,
  /lead\s*(solar\s*)?install(er)?/i,
  /solar\s*(crew|foreman)/i,
  /residential\s*solar\s*install/i,
  /commercial\s*solar\s*install/i,
  /rooftop\s*solar/i,
  /solar\s*racking/i,
  /solar\s*apprentice/i,
  /solar\s*mechanic/i,
  /battery\s*storage\s*install(er)?/i,
  /energy\s*storage\s*install(er)?/i,
  /\bnabcep\b/i,
];

// Filtered out even if an include pattern also matches — protects against
// common false positives like non-solar trades, or solar-adjacent
// sales/office roles outside the installer niche.
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
  /solar\s*(sales|consultant|advisor)/i,
  /appointment\s*setter/i,
];

export function isSolarInstallerRole(title: string): boolean {
  if (!title) return false;
  if (EXCLUDE_PATTERNS.some((re) => re.test(title))) return false;
  return INCLUDE_PATTERNS.some((re) => re.test(title));
}