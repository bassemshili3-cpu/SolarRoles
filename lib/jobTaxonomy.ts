/**
 * solarJobTaxonomy.ts
 *
 * Extracts structured job metadata (specialty, occupational category,
 * skills, experience level) from raw job title + description, for
 * SolarRoles.com — a niche board for solar PV installers / lead installers.
 * Used to enrich the JobPosting JSON-LD schema with fields Google uses for
 * filtering and categorization.
 *
 * Unlike a general multi-industry board, every job that reaches this
 * extractor has already passed `isSolarInstallerRole()` — so `industry`
 * doesn't need 15 branching categories. Instead we categorize by
 * *installation specialty* (residential / commercial / utility-scale /
 * battery storage / general), which is what actually varies within the
 * niche and what a job seeker filters on.
 *
 * Approach: deterministic keyword/pattern matching. No API calls, no ML
 * inference, sub-millisecond per call. Trade-off: limited coverage vs
 * external APIs, but predictable, debuggable, and free.
 *
 * NOTE (Aug 2026): the gating function `isSolarInstallerRole` used to be
 * defined here, but that duplicated (and drifted from) the gate in
 * `lib/ats/solar-taxonomy.ts`, which now also covers corporate-solar
 * roles (sales, PM, engineering, estimating) that this file's old gate
 * excluded outright. To avoid two boards with two different definitions
 * of "solar job", the gate now lives ONLY in solar-taxonomy.ts and is
 * re-exported here for backward compatibility with existing imports.
 * Do not reintroduce a local copy of the include/exclude patterns.
 *
 * Usage:
 *   if (isSolarInstallerRole(title, description)) {
 *     const taxonomy = extractSolarJobTaxonomy({ title, description })
 *     // → { specialty, occupationalCategory, skills, experienceLevel }
 *   }
 *   // description is optional — title-only gating still works, just
 *   // with lower recall on generic titles ("Installer II") at solar-only
 *   // employers.
 */

export { isSolarInstallerRole } from './ats/solar-taxonomy'

export type ExperienceLevel = 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL'

export type SolarSpecialty =
  | 'Residential Solar'
  | 'Commercial Solar'
  | 'Utility-Scale Solar'
  | 'Battery Storage'
  | 'Solar Electrical'
  | 'General Solar Installation'

export interface JobTaxonomy {
  specialty: SolarSpecialty
  occupationalCategory: string
  skills: string[]
  experienceLevel?: ExperienceLevel
}

export interface JobTaxonomyInput {
  title: string
  description?: string
}

// Solar postings routinely put the highest-value signals (NABCEP, OSHA 30,
// Journeyman License, etc.) in a "Preferred qualifications" section near
// the END of the description — a generic-board cap of 2000 chars was
// truncating those out on longer postings (e.g. multi-page O&M/field
// tech listings). Raised to 6000, still capped for predictability/speed.
const MAX_TEXT_LENGTH = 6000

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALTY RULES
// Order matters: first match wins. More specific rules come first.
// Runs on title + description (unlike the include/exclude gate, which
// only trusts the title) since specialty is a lower-stakes,
// enrichment-only classification — a wrong guess here just picks the
// wrong filter facet, it doesn't let a non-solar job onto the board.
// ─────────────────────────────────────────────────────────────────────────────

const SPECIALTY_RULES: ReadonlyArray<{ specialty: SolarSpecialty; patterns: RegExp[] }> = [
  {
    specialty: 'Battery Storage',
    patterns: [
      /\bbattery\s*storage\b/i,
      /\benergy\s*storage\b/i,
      /\bess\b/i,
      /\bpowerwall\b/i,
      /\bbess\b/i,
    ],
  },
  {
    specialty: 'Utility-Scale Solar',
    patterns: [
      /\butility[- ]?scale\b/i,
      /\bsolar\s*farm\b/i,
      /\bground[- ]?mount(ed)?\s*solar\b/i,
      /\bsolar\s*field\b/i,
      /\bepc\b.*solar|solar.*\bepc\b/i,
      /\butility\s*solar\b/i,
    ],
  },
  {
    specialty: 'Commercial Solar',
    patterns: [
      /\bcommercial\s*solar\b/i,
      /\bc&i\s*solar\b/i,
      /\bcommercial\s*(pv|photovoltaic)\b/i,
      /\brooftop\s*commercial\b/i,
    ],
  },
  {
    specialty: 'Solar Electrical',
    patterns: [
      /solar\s*electrician/i,
      /\bnabcep\b.*electric/i,
      /electrical.*solar|solar.*electrical/i,
      /\bstring(ing)?\s*(wire|inverter)/i,
    ],
  },
  {
    specialty: 'Residential Solar',
    patterns: [
      /\bresidential\s*solar\b/i,
      /\bresidential\s*(pv|photovoltaic)\b/i,
      /\brooftop\s*residential\b/i,
      /\bhome\s*solar\b/i,
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// OCCUPATIONAL CATEGORY
// Every role on SolarRoles falls under the same BLS major group —
// Solar Photovoltaic Installers (SOC 47-2231) sits within Construction
// and Extraction Occupations — so this is fixed rather than looked up
// per-industry the way a general board would.
// ─────────────────────────────────────────────────────────────────────────────

const OCCUPATIONAL_CATEGORY = 'Construction and Extraction'

// ─────────────────────────────────────────────────────────────────────────────
// SKILL RULES
// Solar-installer-specific skills/certs/tools, ordered by specificity.
// ─────────────────────────────────────────────────────────────────────────────

interface SkillRule {
  skill: string
  patterns: RegExp[]
}

const SKILL_RULES: ReadonlyArray<SkillRule> = [
  // Certifications
  { skill: 'NABCEP Certified', patterns: [/\bnabcep\b/i] },
  { skill: 'OSHA 10', patterns: [/\bosha[\s-]?10\b/i] },
  { skill: 'OSHA 30', patterns: [/\bosha[\s-]?30\b/i] },
  { skill: 'OSHA Certified', patterns: [/\bosha\b/i] },
  { skill: 'CDL', patterns: [/\bcdl[- ]?[ab]?\b/i] },
  { skill: 'Forklift Certification', patterns: [/\bforklift (certified|certification|operator)\b/i] },
  { skill: 'Journeyman Electrician', patterns: [/\bjourneyman\b/i] },
  { skill: 'Master Electrician', patterns: [/\bmaster\s*electrician\b/i] },
  { skill: 'Electrical License', patterns: [/\belectrical\s*license\b|\blicensed\s*electrician\b/i] },
  { skill: 'Fall Protection Certified', patterns: [/\bfall\s*protection\b/i] },
  { skill: 'First Aid/CPR', patterns: [/\bfirst\s*aid\b|\bcpr\b/i] },

  // Core installation skills
  { skill: 'Solar Panel Installation', patterns: [/\bsolar\s*panel\s*install/i, /\bpanel\s*mount(ing)?\b/i] },
  { skill: 'Racking & Mounting', patterns: [/\bracking\b|\bmounting\s*system/i] },
  { skill: 'Roofing', patterns: [/\broofing\b|\brooftop\s*work\b/i] },
  { skill: 'Ground Mount Systems', patterns: [/\bground[- ]?mount/i] },
  { skill: 'Wire Management', patterns: [/\bwire\s*management\b|\bconduit\b/i] },
  { skill: 'DC/AC Wiring', patterns: [/\bdc\/ac\b|\bdc\s*wiring\b|\bac\s*wiring\b/i] },
  { skill: 'String Inverters', patterns: [/\bstring\s*inverter/i] },
  { skill: 'Microinverters', patterns: [/\bmicroinverter/i] },
  // Note: deliberately NOT matching bare "energy storage" — that phrase
  // shows up constantly in solar company "About us" boilerplate (e.g. "we
  // provide O&M for Solar and Energy Storage Systems") without the role
  // actually touching batteries. "battery storage" / "powerwall" are
  // specific enough to keep as signals.
  { skill: 'Battery Storage Installation', patterns: [/\bbattery\s*storage\b|\bpowerwall\b/i] },
  { skill: 'Electrical Panel Upgrades', patterns: [/\bpanel\s*upgrade\b|\bmain\s*service\s*panel\b/i] },
  { skill: 'Site Assessment', patterns: [/\bsite\s*assessment\b|\bsite\s*survey\b/i] },
  { skill: 'Blueprint Reading', patterns: [/\bblueprint\b|\bschematic\b|\bplan\s*reading\b/i] },
  { skill: 'System Commissioning', patterns: [/\bcommissioning\b/i] },
  { skill: 'Troubleshooting/Repair', patterns: [/\btroubleshoot/i, /\brepair\b/i] },

  // Tools & equipment
  { skill: 'Power Tools', patterns: [/\bpower\s*tools\b/i] },
  { skill: 'Multimeter Use', patterns: [/\bmultimeter\b/i] },
  { skill: 'Crane/Lift Operation', patterns: [/\bcrane\b|\bboom\s*lift\b|\bscissor\s*lift\b/i] },
  { skill: 'Ladder Safety', patterns: [/\bladder\s*safety\b/i] },

  // Physical / logistics
  { skill: 'Heavy Lifting', patterns: [/\b(lift|carry)\s*(up to\s*)?\d{2,3}\s*(lbs|pounds)\b/i] },
  { skill: 'Travel Required', patterns: [/\btravel\s*(required|up to)\b/i] },
  { skill: 'Valid Driver\u2019s License', patterns: [/\bvalid\s*driver.?s?\s*license\b/i] },

  // Soft skills
  { skill: 'Leadership', patterns: [/\bleadership\b|\bcrew\s*lead\b/i] },
  { skill: 'Team Management', patterns: [/\bteam\s*management\b|\bsupervis(e|ing|or)\b/i] },
  { skill: 'Bilingual (Spanish)', patterns: [/\bbilingual\b.*spanish|\bspanish\b.*bilingual/i] },
]

const MAX_SKILLS = 10

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE LEVEL DETECTION
// Solar installer crews commonly use "Lead Installer" as the senior title
// (rather than "manager"/"director" as in a general-purpose board), so
// that's folded into the SENIOR_LEVEL pattern alongside the usual terms.
// ─────────────────────────────────────────────────────────────────────────────

function detectExperienceLevel(title: string): ExperienceLevel | undefined {
  const t = title.toLowerCase()
  if (/\b(lead|senior|sr\.?|foreman|crew\s*lead|principal|supervisor|superintendent|manager)\b/.test(t)) {
    return 'SENIOR_LEVEL'
  }
  if (/\b(junior|jr\.?|entry[- ]level|apprentice|trainee|helper|intern|internship)\b/.test(t)) {
    return 'ENTRY_LEVEL'
  }
  if (/\b(mid[- ]level|intermediate|journeyman)\b/.test(t)) {
    return 'MID_LEVEL'
  }
  return undefined
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

function detectSpecialty(title: string, fullText: string): SolarSpecialty {
  // Prefer the title: it's what the employer chose to describe the role
  // as. The description often contains "About us" boilerplate (e.g. "we
  // provide O&M for Solar and Energy Storage Systems") that describes the
  // *company's* full scope, not this specific job — matching on the full
  // text alone lets that boilerplate override a clear, specific title
  // (a "Commercial Solar Technician" role getting mislabeled "Battery
  // Storage" because the employer also happens to service batteries).
  for (const rule of SPECIALTY_RULES) {
    if (rule.patterns.some((p) => p.test(title))) {
      return rule.specialty
    }
  }
  // Title didn't tell us anything specific — fall back to the full text.
  for (const rule of SPECIALTY_RULES) {
    if (rule.patterns.some((p) => p.test(fullText))) {
      return rule.specialty
    }
  }
  return 'General Solar Installation'
}

export function extractSolarJobTaxonomy(input: JobTaxonomyInput): JobTaxonomy {
  const title = input.title || ''
  const text = `${title} ${input.description || ''}`
    .slice(0, MAX_TEXT_LENGTH)
    .trim()

  const specialty = detectSpecialty(title, text)

  // Skills: collect all matches, cap to MAX_SKILLS
  const skills: string[] = []
  for (const rule of SKILL_RULES) {
    if (skills.length >= MAX_SKILLS) break
    if (rule.patterns.some((p) => p.test(text))) {
      skills.push(rule.skill)
    }
  }

  // Experience level from title only
  const experienceLevel = detectExperienceLevel(input.title || '')

  return {
    specialty,
    occupationalCategory: OCCUPATIONAL_CATEGORY,
    skills,
    experienceLevel,
  }
}

// Alias rétrocompatible — anciens appels générés avant le renommage
export const extractJobTaxonomy = extractSolarJobTaxonomy