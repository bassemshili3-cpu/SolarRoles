/**
 * Solar PV role taxonomy for SolarRoles
 *
 * Decides whether a job pulled from an ATS source belongs on the
 * SolarRoles board. Originally scoped to hands-on field roles across
 * the solar install lifecycle only. As of August 2026, the site is
 * expanding beyond field-only niche to cover "corporate solar" roles
 * as well — sales, project management, engineering, and estimating —
 * alongside the original field trades. Field roles remain the primary
 * focus; corporate roles are now a deliberate secondary category, not
 * an accident of loose matching.
 *
 * TAXONOMY GOAL: bias toward roles whose descriptions are likely to
 * name specific certifications (NABCEP, OSHA-10, OSHA-30, etc.) for
 * field roles, and toward roles that are clearly solar-specific
 * (not generic "engineer"/"sales"/"project manager" moonlighting as
 * solar via a single incidental mention) for corporate roles.
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
 *   - Solar Sales (representative, technical sales, sales engineer)
 *   - Solar Project / Construction Management
 *   - Solar Design / Systems Engineering
 *   - Solar Estimating
 *   - Solar PV cell/module manufacturing
 *
 * Deliberately still excluded: appointment-setting/canvassing (high
 * spam and commission-only-listing rate), permitting/admin, roofing
 * (general) — anything with too high a false-positive risk for now.
 *
 * Matching strategy:
 *   1) NORMALIZED TITLE SIGNALS — punctuation and token order do not matter:
 *      an energy signal (solar/PV/photovoltaic or storage) must coexist with
 *      an approved role signal. A bare BESS mention is never sufficient.
 *   2) GENERIC TITLE + DESCRIPTION CORROBORATION — some solar companies
 *      post under bland internal titles ("Installer II", "Field
 *      Technician", "Foreman", "Inspector", "O&M Technician") that
 *      carry zero solar signal on their own. For THOSE titles only, we
 *      fall back to the description, and we require both an energy token and
 *      a technical object (project/system/plant/module/inverter/array/EPC)
 *      to avoid
 *      pulling in, e.g., a cable "Field Technician" whose description
 *      happens to mention a client's "solar-ready roofing".
 *
 *   3) MANUFACTURING GATE — production, process, equipment, quality, test,
 *      product and reliability roles require explicit PV cell/module/panel
 *      manufacturing context in the description.
 *
 *      IMPORTANT: description-backed matching only works if the caller passes a
 *      description. isSolarInstallerRole(title) alone will never
 *      trigger Tier 2 — always pass the job description when available.
 *
 * Sep 2026 hardening: added narrowly-scoped patterns observed on active US
 * solar boards (Solar Consultant, Foreperson, Field Operations Technician,
 * Commissioning/Development Engineer, Electrical Apprentice, Project Executive,
 * solar QA/Quality, solar Safety, and extra PV-manufacturing titles).
 *
 * Tune this list as you see false positives/negatives in production.
 */

export function normalizeSolarRoleText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[\/\\|+]/g, ' ')
    .replace(/[()[\]{}:;,_—–-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// solar-taxonomy.ts — les listes de patterns restent privées (pas d'export)
export function isGenericInstallerTitle(title: string): boolean {
  const normalizedTitle = normalizeSolarRoleText(title);
  return (
    GENERIC_TITLE_PATTERNS.some((re) => re.test(normalizedTitle)) ||
    MANUFACTURING_TITLE_PATTERNS.some((re) => re.test(normalizedTitle))
  );
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
  /solar\s*laborer/i, // ★ solar-specific laborer role

  // --- Sep 2026 production-gap fixes ---
  // Titles observed on active US solar-company boards that are clearly in-scope
  // but were missed by the previous matcher. Keep these explicit/narrow so the
  // taxonomy does not become a generic renewable-energy matcher.
  /solar\s*(?:sales\s*)?consultant/i, // "Solar Consultant", "Solar Sales Consultant"
  /solar\s*foreperson/i, // Sunrun-style inclusive variant of foreman
  /(?:solar|pv)\s*(?:quality|qa|qc)\s*(?:manager|engineer|lead|specialist)/i,
  /(?:solar|pv|bess|energy\s*storage)\s*project\s*executive/i,
  /solar\s*safety\s*(?:tech(?:nician)?|coordinator|manager|specialist)/i,

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
  /solar\s*(array|module|panel)\s*tech(nician)?/i,
  /pv\s*(array|module)\s*install(er)?/i,

  // --- ground-mount / utility-scale construction ---
  /solar\s*tracker\s*(install(er)?|tech(nician)?)/i,
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
  /solar\s*field\s*service\s*(tech(nician)?|engineer)/i,
  /pv\s*field\s*service/i,

  // --- battery / storage ---
  /battery\s*storage\s*install(er)?/i,
  /energy\s*storage\s*install(er)?/i,
  /\bess\s*install(er|ation)?/i, // "energy storage system"

  // --- BESS / battery storage (expanded) ---
  /battery\s*energy\s*storage\s*(system)?\s*(tech(nician)?|install(er)?|engineer)/i,
  /battery\s*(systems?)\s*tech(nician)?/i,
  /storage\s*commissioning\s*tech(nician)?/i,
  /storage\s*(field\s*)?tech(nician)?/i,

  // --- commercial & industrial (C&I is the standard industry shorthand) ---
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
  /solar\s*pool\s*(heater|heating)\s*install(er|ation)?/i,

  // --- certifications as a strong standalone signal ---

  // --- corporate solar: sales (added Aug 2026 — scope expansion) ---
  // Broader than the old technical-sales-only carve-out below: any
  // title that explicitly says "solar sales" or "PV sales" is now
  // accepted. Bare "sales representative" with no solar/PV qualifier
  // is NOT included here — that stays too generic to trust.
  /solar\s*sales\s*(representative|rep|specialist|consultant|manager|engineer)?/i,
  /pv\s*sales\s*(representative|rep|specialist|engineer)?/i,

  // --- corporate solar: project / construction management ---
  /solar\s*(project|construction)\s*(manager|coordinator|engineer)/i,
  /pv\s*(project|construction)\s*(manager|coordinator)/i,

  // --- corporate solar: design / systems engineering ---
  /solar\s*(design\s*)?engineer(ing)?/i,
  /pv\s*(design\s*)?engineer(ing)?/i,
  /\bpv\s*(designer|design(?:er)?|plan\s*set\s*drafter)\b/i,
  /solar\s*(designer|design(?:er)?|plan\s*set\s*drafter)\b/i,
  /solar\s*electrical\s*engineer/i,
  /solar\s*systems?\s*engineer/i,
  /solar\s*engineer/i, // ★ explicit solar engineer role

  // --- corporate solar: estimating ---
  /solar\s*estimat(or|ing)/i,
  /pv\s*estimat(or|ing)/i,

  // --- corporate solar: expanded sales / business development / retail /
  //     brand (added Aug 2026 — observed in the Venture Solar extraction) ---
  // Solar-specific corporate roles. Titles carrying an explicit "solar" or
  // "renewable energy" token pass on the title alone; the rest are added to
  // GENERIC_TITLE_PATTERNS so they fall back to the description, which for a
  // curated solar employer always asserts the company is a solar installer.
  /solar\s*energy\s*consultant/i, // "Solar Energy Consultant", "Sales - Solar Energy Consultant"
  /solar\s*[\s-]*brand\s*ambassador/i, // "Solar - Brand Ambassador"
  /solar\s*specialist\s*[\s-]*brand\s*ambassador/i, // "Solar Specialist - Brand Ambassador"
  /solar\s*[\s-]*retail\s*(associate|representative)/i, // "Solar - Retail Associate"
  /renewable\s*energy\s*[\s-]*(sales\s*)?(consultant|representative|specialist)/i, // "Renewable Energy Consultant", "Renewable Energy - Sales Consultant", "Retail - Renewable Energy Representative"
  /retail\s*(associate|sales\s*representative)\s*[\s-]*solar/i, // "Retail Associate - Solar Sales"
];

// --- Technical sales carve-out (legacy, kept for the NABCEP-specific
// signal it captures) ---
// NABCEP has a dedicated "PV Technical Sales" credential. This narrow
// carve-out is now largely superseded by the broader "solar sales"
// INCLUDE patterns above, but is kept as-is since it does no harm and
// still adds a valid PV-technical-sales-title + NABCEP-description
// signal for edge cases the broader pattern might miss (e.g. "Technical
// Sales Engineer" without the word "solar" directly adjacent).
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

// Titles filtered out even if an include pattern also matches — protects
// against common false positives like non-solar trades, or roles that carry
// too high a spam/false-positive risk to let through even under the expanded
// corporate-solar scope.
const EXCLUDE_PATTERNS: RegExp[] = [
  /software\s*install(er)?/i,
  /window\s*install(er)?/i,
  /flooring\s*install(er)?/i,
  /carpet\s*install(er)?/i,
  /security\s*install(er)?/i,
  /alarm\s*install(er)?/i,
  /cable\s*install(er)?/i,
  /solar\s*turbines/i, // Solar Turbines Inc. — gas turbine manufacturer, unrelated to PV
  // Consultants are legitimate sales roles (e.g. "Solar Sales Consultant").
  // Keep only the lead-generation titles that remain out of scope.
  /solar\s*(advisor|canvasser)/i, // "sales" removed Aug 2026 — see corporate-solar sales INCLUDE patterns above
  /appointment\s*setter/i,
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
  /\bcommissioning\s*engineer(?:\s*(?:i{1,3}|\d+))?\b/i,
  /\bfield\s*operations?\s*tech(nician)?\b/i,
  /\belectrician\s*(i{1,3}|1|2|3)?$/i,
  /\belectrical\s*apprentice\b/i,
  /\blead\s*install(er)?\b/i, // e.g. "Lead Installer" or "Telecommunications Lead Installer" without "solar" in the title
  /^helper\s*(i{1,3}|1|2|3)?$/i, // "Solar Helper" vs generic "Helper"
  /^laborer\s*(i{1,3}|1|2|3)?$/i,
  /^general\s+laborer\s*(i{1,3}|1|2|3)?$/i,
  /\bforeman\b/i, // "Foreman" alone is too generic (construction at large)
  /\bracking\s*(tech(nician)?|crew|installer)\b/i,
  /\bfield\s*service\s*(tech(nician)?|engineer)\b/i,
  /\bqa\s*[\/-]?\s*qc\s*(tech(nician)?|inspector)?\b/i,
  /\binspector\b/i,
  /\bwireman\b/i,
  /\bepc\s*(field\s*)?tech(nician)?\b/i, // "EPC Field Technician" — common in utility-scale
  /^bess\s*(?:tech(?:nician)?|installer)\b/i,
  /\bbattery\s*tech(nician)?\b/i,
  /\bstorage\s*tech(nician)?\b/i,

  // --- corporate solar generic titles (added Aug 2026) ---
  /\bsales\s*(representative|rep)\b/i, // bare "Sales Representative" — needs solar in description
  /\bproject\s*(manager|coordinator)\b/i,
  /\bconstruction\s*manager\b/i,
  /\bestimator\b/i,
  /\bsystems?\s*engineer\b/i,
  /\bdesign\s*engineer(?:\s*(?:i{1,3}|\d+))?\b/i,
  /\bproject\s*engineer(?:\s*(?:i{1,3}|\d+))?\b/i,
  /\bproject\s*executive\b/i,
  /\bdevelopment\s*engineer(?:\s*(?:i{1,3}|\d+))?\b/i,
  /\bapplications?\s*engineer(?:\s*(?:i{1,3}|\d+))?\b/i,
  /\belectrical\s*engineer(?:\s*(?:i{1,3}|\d+))?\b/i,
  /\bmechanical\s*engineer(?:\s*(?:i{1,3}|\d+))?\b/i,
  /\bprogram\s*manager\b/i,
  /\bproject\s*developer\b/i,
  /\bdevelopment\s*manager\b/i,
  /\basset\s*manager\b/i,
  /\bo\s*(?:and\s*)?m\s*manager\b/i,
  /\bscada\s*engineer\b/i,
  /\bperformance\s*engineer\b/i,
  /\binterconnection\s*(?:manager|engineer)\b/i,
  /\bquality\s*(?:manager|lead|specialist)\b/i,

  // --- corporate solar generic titles (added Aug 2026 — Venture Solar extraction) ---
  // No solar token in the title itself: rely on the description fallback,
  // which for a curated solar employer always asserts the solar context.
  /\binside\s*sales\b/i, // "Inside Sales Specialist"
  /\bbusiness\s*development\b/i, // "Business Development Intern", "Business Development Consultant"
  /\bsales\s*development\b/i, // "Sales Development Consultant"
  /\bsite\s*surveyor\b/i, // "Site Surveyor"
];

const MANUFACTURING_TITLE_PATTERNS: RegExp[] = [
  /\bproduction\s*(?:operator|tech(?:nician)?|associate|specialist)\b/i,
  /\bproduction\s*engineering\s*specialist\b/i,
  /\bmanufacturing\s*(?:engineer|tech(?:nician)?|associate|specialist)\b/i,
  /\bprocess\s*engineer\b/i,
  /\bequipment\s*(?:engineer|tech(?:nician)?)\b/i,
  /\bquality\s*(?:engineer|tech(?:nician)?|inspector)\b/i,
  /\btest\s*(?:engineer|tech(?:nician)?)\b/i,
  /\bproduct\s*engineer\b/i,
  /\breliability\s*engineer\b/i,
  /\b(?:cell|module)\s*tech(?:nician)?\b/i,
];

const ENERGY_TITLE_SIGNALS: RegExp[] = [
  /\b(?:solar|pv|photovoltaic)\b/i,
  /\b(?:bess|battery\s*energy\s*storage|battery\s*storage|energy\s*storage)\b/i,
];

const APPROVED_ROLE_SIGNALS: RegExp[] = [
  /\binstall(?:er|ation|ing)?\b/i,
  /\btech(?:nician)?\b/i,
  /\belectric(?:ian|al\s*tech(?:nician)?)\b/i,
  /\b(?:laborer|mechanic|wireman|foreman|foreperson|superintendent|inspector|surveyor)\b/i,
  /\b(?:commissioning|maintenance|service|field\s*service|o\s*(?:and\s*)?m)\b/i,
  /\b(?:project|construction)\s*(?:manager|coordinator|engineer)\b/i,
  /\b(?:design|applications?|electrical|mechanical|systems?|scada|performance|interconnection)\s*engineer\b/i,
  /\b(?:program|development|asset|interconnection|sales)\s*manager\b/i,
  /\bproject\s*developer\b/i,
  /\b(?:estimator|estimating)\b/i,
  /\b(?:sales\s*(?:representative|rep|specialist|consultant|engineer)|energy\s*consultant)\b/i,
  /\b(?:site|field)\s*supervisor\b/i,
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
  /pile\s*driv(er|ing)\s*.*(solar|pv|array)/i,
  /(dc|ac)\s*combiner\s*box.*(solar|pv|array|module)/i,
  /(solar|pv|array|module).*\b(dc|ac)\s*combiner\s*box/i,
  /inverter\s*(commissioning|troubleshoot|field\s*service)/i,
  /epc\s*(contractor|project).*solar/i,
  /solar\s*(farm|plant)\s*construction/i,
  /nabcep\s*(pv\s*system\s*)?inspector/i,
  /solar\s*thermal|solar\s*hot\s*water/i,
  /quality\s*(assurance|control)\s*.*solar\s*(install|array|system)/i,
  /battery\s*energy\s*storage\s*system/i,
  /\bc\s*&\s*i\s*solar/i,
  /commercial\s*(&|and)\s*industrial\s*solar/i,
  /ground[\s-]?mount(ed)?\s*(solar|array|pv)/i,

  // --- corporate solar signals (added Aug 2026) ---
  /sell(ing)?\s*(residential|commercial)?\s*solar\s*(systems?|energy)/i,
  /solar\s*(sales|energy)\s*consultation/i,
  /manage(s|d|ment)?\s*(solar|pv)\s*(installation|construction)\s*project/i,
  /oversee\s*(solar|pv)\s*(project|construction)/i,
  /design\s*(solar|pv)\s*(system|array)/i,
  /engineer(ing)?\s*(solar|pv)\s*(system|array|project)/i,
  /prepare\s*(solar|pv)?\s*(project\s*)?estimat/i,
  /estimat(e|ing)\s*(solar|pv)\s*(project|installation|system)/i,
];

function hasEnergySignal(text: string): boolean {
  return ENERGY_TITLE_SIGNALS.some((pattern) => pattern.test(text));
}

function hasApprovedRoleSignal(text: string): boolean {
  return APPROVED_ROLE_SIGNALS.some((pattern) => pattern.test(text));
}

function hasDescriptionEnergyContext(description: string): boolean {
  const hasSolar = /\b(?:solar|pv|photovoltaic)\b/i.test(description);
  const hasStorage = /\b(?:bess|battery\s*energy\s*storage|battery\s*storage|energy\s*storage)\b/i.test(description);
  const hasTechnicalObject = /\b(?:projects?|systems?|plants?|modules?|inverters?|arrays?|epc|farms?|installations?|construction|generation|facilit(?:y|ies))\b/i.test(description);
  return (hasSolar || hasStorage) && hasTechnicalObject;
}

function hasSolarManufacturingContext(description: string): boolean {
  return (
    /\b(?:solar|pv|photovoltaic)\s*(?:cells?|modules?|panels?)\b/i.test(description) ||
    /\b(?:cells?|modules?|panels?)\s*(?:for|used\s*in)?\s*(?:solar|pv|photovoltaic)\b/i.test(description) ||
    (/\b(?:solar|pv|photovoltaic)\b/i.test(description) &&
      /\b(?:manufactur(?:e|es|ed|ing)|production|assembly|fabrication)\b/i.test(description) &&
      /\b(?:cells?|modules?|panels?)\b/i.test(description))
  );
}

export function isSolarInstallerRole(title: string, description?: string): boolean {
  if (!title) return false;

  const normalizedTitle = normalizeSolarRoleText(title);
  const normalizedDescription = description ? normalizeSolarRoleText(description) : undefined;

  // Narrow carve-out, checked first: technical sales titles are let
  // through ONLY if the description explicitly ties back to NABCEP.
  // This runs before the general excludes below, since the blanket
  // sales exclude would otherwise veto legitimate "Solar Technical
  // Sales Engineer" / "PV Technical Sales" postings.
  if (
    TECHNICAL_SALES_TITLE_PATTERNS.some((re) => re.test(normalizedTitle)) &&
    normalizedDescription &&
    TECHNICAL_SALES_STRONG_SIGNALS.some((re) => re.test(normalizedDescription))
  ) {
    return true;
  }

  // A title exclusion always wins.
  if (EXCLUDE_PATTERNS.some((re) => re.test(normalizedTitle))) return false;
  // Job descriptions commonly list adjacent roles such as "Solar Consultant".
  // Applying title exclusions to the whole body consequently discarded clearly
  // relevant retail and sales jobs. Exclusions deliberately govern the role
  // being advertised (its title); Tier 2 still requires a strong solar signal.

  // Solar/PV field-quality titles are valid QA/QC roles even when they use
  // "Quality Engineer". Check this BEFORE the manufacturing gate, because a
  // generic Quality Engineer still must prove PV-module manufacturing context.
  if (
    /\b(?:solar|pv)\b.*\b(?:quality|qa|qc)\b.*\b(?:manager|engineer|lead|specialist)\b/i.test(normalizedTitle) ||
    /\b(?:quality|qa|qc)\b.*\b(?:manager|engineer|lead|specialist)\b.*\b(?:solar|pv)\b/i.test(normalizedTitle)
  ) {
    return true;
  }

  // Manufacturing titles are intentionally description-gated. A solar-panel
  // company can also employ generic factory roles unrelated to PV production.
  if (MANUFACTURING_TITLE_PATTERNS.some((re) => re.test(normalizedTitle))) {
    return Boolean(normalizedDescription && hasSolarManufacturingContext(normalizedDescription));
  }

  // Tier 1: energy signal + approved role signal, independent of token order
  // and punctuation (e.g. "Estimator (Solar)" or "Applications Engineer / PV").
  if (hasEnergySignal(normalizedTitle) && hasApprovedRoleSignal(normalizedTitle)) return true;

  // Preserve narrow legacy title forms that already encode both concepts.
  if (INCLUDE_PATTERNS.some((re) => re.test(normalizedTitle))) return true;

  // Tier 2: generic title + description corroboration.
  if (
    normalizedDescription &&
    GENERIC_TITLE_PATTERNS.some((re) => re.test(normalizedTitle)) &&
    (
      hasDescriptionEnergyContext(normalizedDescription) ||
      DESCRIPTION_STRONG_SIGNALS.some((re) => re.test(normalizedDescription))
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Optional: coarse role family for a matched job, useful later for
 * landing-page segmentation (e.g. /jobs/solar-om-technician,
 * /jobs/solar-site-supervisor, /jobs/solar-project-manager) without
 * touching the match logic above. Only meaningful when
 * isSolarInstallerRole(title, description) is true.
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
  | 'project_management'
  | 'engineering'
  | 'estimating'
  | 'manufacturing'
  | 'other';

export function getSolarRoleFamily(title: string, description?: string): SolarRoleFamily {
  const normalizedTitle = normalizeSolarRoleText(title);
  const normalizedDescription = description ? normalizeSolarRoleText(description) : '';
  if (
    MANUFACTURING_TITLE_PATTERNS.some((pattern) => pattern.test(normalizedTitle)) &&
    hasSolarManufacturingContext(normalizedDescription)
  ) return 'manufacturing';
  if (/estimat(or|ing)/i.test(normalizedTitle)) return 'estimating';
  if (/project\s*(manager|coordinator|executive)|construction\s*manager/i.test(normalizedTitle)) return 'project_management';
  if (/sales/i.test(normalizedTitle)) return 'sales';
  if (/(consultant|brand\s*ambassador|business\s*development|sales\s*development|retail|renewable\s*energy)/i.test(normalizedTitle)) return 'sales';
  if (/\belectrician|wireman|electrical\s*apprentice/i.test(normalizedTitle)) return 'electrician';
  // Specific field families must win before the broad "engineer" bucket.
  if (/commissioning/i.test(normalizedTitle)) return 'commissioning';
  if (/(qa\s*qc|\bqa\b|\bqc\b|quality\s*(?:manager|engineer|lead|specialist)|inspector)/i.test(normalizedTitle)) return 'qa_qc';
  if (/supervisor|superintendent|crew\s*lead|foreman|foreperson/i.test(normalizedTitle)) return 'supervisor';
  if (/(o\s*(?:and\s*)?m|om\s*tech|service\s*tech|maintenance\s*tech|repair\s*tech|troubleshoot|field\s*service|field\s*operations?\s*tech)/i.test(normalizedTitle)) return 'om';
  if (/battery|storage|\bbess\b/i.test(normalizedTitle)) return 'storage';
  if (/\bengineer(ing)?\b/i.test(normalizedTitle)) return 'engineering';
  if (/thermal|hot\s*water/i.test(normalizedTitle)) return 'thermal';
  if (/install|racking|array|module|crew|apprentice|journeyman|tracker|helper|laborer/i.test(normalizedTitle)) return 'installer';
  return 'other';
}
