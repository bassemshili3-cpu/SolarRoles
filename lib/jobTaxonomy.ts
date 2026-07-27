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
 * Usage:
 *   if (isSolarInstallerRole(title)) {
 *     const taxonomy = extractSolarJobTaxonomy({ title, description })
 *     // → { specialty, occupationalCategory, skills, experienceLevel }
 *   }
 */

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
// tech listings). Raised to 4000, still capped for predictability/speed.
const MAX_TEXT_LENGTH = 6000

// ─────────────────────────────────────────────────────────────────────────────
// GATE: is this even a solar PV installer role?
// Filtering runs on the job title (cheap, reliable, low false-positive
// rate). We deliberately do NOT match on description text — too noisy
// (e.g. a random construction job mentioning "solar-ready roofing" in its
// description would false-positive on a naive "solar" match).
//
// Deliberately narrow: sales/appointment-setter/consultant roles are
// excluded even though they're "solar industry" — the niche is hands-on
// installers, not solar sales.
//
// Tune this list as you see false positives/negatives in production.
// ─────────────────────────────────────────────────────────────────────────────

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
]

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
]

export function isSolarInstallerRole(title: string): boolean {
  if (!title) return false
  if (EXCLUDE_PATTERNS.some((re) => re.test(title))) return false
  return INCLUDE_PATTERNS.some((re) => re.test(title))
}

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALTY RULES
// Order matters: first match wins. More specific rules come first.
// Runs on title + description (unlike the include/exclude gate above,
// which only trusts the title) since specialty is a lower-stakes,
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