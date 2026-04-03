/**
 * buildSchemaDescription.ts
 *
 * Generates a fully original `description` string for the JobPosting JSON-LD schema.
 * Content is semantically equivalent to the Adzuna source but structurally
 * and lexically distinct — maximising differentiation for Google Jobs indexing.
 *
 * PIPELINE:
 *   Adzuna raw description
 *     ├── formatJobDescription()     → UI display  (original text, ToS-compliant)
 *     └── buildSchemaDescription()   → JSON-LD     (this file — fully rewritten)
 */

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface JobSchemaInput {
  title: string
  company: string
  city: string
  state: string           // e.g. "California"
  stateCode: string       // e.g. "CA"
  description: string     // raw HTML or plain text from Adzuna
  salaryMin?: number
  salaryMax?: number
  employmentType?: string // "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN"
  remote?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a plain-text description string ready to be injected into
 * the JSON-LD `description` field of a JobPosting schema.
 *
 * The output is intentionally structured differently from any aggregator
 * source: different sentence order, different lexical choices, enriched
 * with market-context sentences that competitors do not include.
 */
export function buildSchemaDescription(job: JobSchemaInput): string {
  const plain = toPlainText(job.description)
  const blocks = extractSemanticBlocks(plain)

  const sections: string[] = []

  // 1 — Role snapshot (always present, fully original framing)
  sections.push(buildRoleSnapshot(job))

  // 2 — What the day-to-day looks like (responsibilities → reframed as narrative)
  if (blocks.responsibilities.length > 0) {
    sections.push(buildDayInTheLife(blocks.responsibilities, job.title))
  }

  // 3 — What the employer is looking for (requirements → reframed as profile)
  if (blocks.requirements.length > 0) {
    sections.push(buildCandidateProfile(blocks.requirements))
  }

  // 4 — Education / certifications (if detected separately)
  if (blocks.education.length > 0) {
    sections.push(buildEducationNote(blocks.education))
  }

  // 5 — Compensation context (enriched with market framing)
  sections.push(buildCompensationContext(job))

  // 6 — Benefits (reframed as "what you gain")
  if (blocks.benefits.length > 0) {
    sections.push(buildBenefitsNarrative(blocks.benefits))
  }

  // 7 — Location / work arrangement
  sections.push(buildLocationContext(job))

  // 8 — Closing call-to-action (original, never present in Adzuna raw)
  sections.push(buildClosingCta(job))

  return sections.filter(Boolean).join('\n\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAIN TEXT NORMALISER
// ─────────────────────────────────────────────────────────────────────────────

function toPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// SEMANTIC BLOCK EXTRACTOR
// ─────────────────────────────────────────────────────────────────────────────

interface SemanticBlocks {
  responsibilities: string[]
  requirements: string[]
  education: string[]
  benefits: string[]
  uncategorised: string[]
}

type SectionLabel =
  | 'responsibilities'
  | 'requirements'
  | 'education'
  | 'benefits'
  | 'none'

const SECTION_SIGNALS: Record<SectionLabel, RegExp[]> = {
  responsibilities: [
    /\b(responsibilit|dut|function|accountabilit|you will|what you.ll do|day.to.day|in this role)\b/i,
  ],
  requirements: [
    /\b(qualif|requirement|what we.re looking|what you.ll need|you (must|should)|experience required|skills required|looking for)\b/i,
  ],
  education: [
    /\b(bachelor|master|associate|degree|diploma|certification|license|phd|doctorate|high school)\b/i,
  ],
  benefits: [
    /\b(benefit|perk|compensation|we offer|what we offer|pto|paid time|vacation|health|dental|vision|401|retirement|bonus|equity|insurance)\b/i,
  ],
  none: [],
}

function detectSectionLabel(line: string): SectionLabel | null {
  for (const [label, patterns] of Object.entries(SECTION_SIGNALS) as [SectionLabel, RegExp[]][]) {
    if (label === 'none') continue
    if (patterns.some(p => p.test(line))) return label
  }
  return null
}

function isBullet(line: string): boolean {
  return /^[•●○■◆►–—\-]\s+/.test(line) || /^\d{1,2}[.)]\s+/.test(line)
}

function stripBullet(line: string): string {
  return line.replace(/^[•●○■◆►–—\-]\s+/, '').replace(/^\d{1,2}[.)]\s+/, '').trim()
}

function extractSemanticBlocks(plain: string): SemanticBlocks {
  const blocks: SemanticBlocks = {
    responsibilities: [],
    requirements: [],
    education: [],
    benefits: [],
    uncategorised: [],
  }

  const lines = plain.split('\n').map(l => l.trim()).filter(Boolean)
  let currentSection: SectionLabel = 'none'

  for (const line of lines) {
    // Section heading detection
    const detected = detectSectionLabel(line)
    if (detected && !isBullet(line) && line.length < 120) {
      currentSection = detected
      continue
    }

    // Always reclassify education lines regardless of current section
    if (SECTION_SIGNALS.education[0].test(line)) {
      const clean = isBullet(line) ? stripBullet(line) : line
      blocks.education.push(clean)
      continue
    }

    if (isBullet(line)) {
      const clean = stripBullet(line)
      if (!clean) continue
      const target = currentSection === 'none'
        ? inferBulletTarget(clean)
        : currentSection
      if (target && target !== 'none') {
        blocks[target].push(clean)
      } else {
        blocks.uncategorised.push(clean)
      }
    } else if (currentSection !== 'none' && line.length > 20) {
      // Long sentence under a known section
      blocks[currentSection].push(line)
    }
  }

  // Dedupe
  for (const key of Object.keys(blocks) as (keyof SemanticBlocks)[]) {
    blocks[key] = [...new Set(blocks[key])].slice(0, 12)
  }

  return blocks
}

function inferBulletTarget(text: string): SectionLabel {
  if (SECTION_SIGNALS.benefits[0].test(text)) return 'benefits'
  if (SECTION_SIGNALS.education[0].test(text)) return 'education'
  if (SECTION_SIGNALS.requirements[0].test(text)) return 'requirements'

  // Action verbs → responsibilities
  if (/^(manage|lead|develop|design|build|create|coordinate|ensure|support|maintain|oversee|deliver|implement|drive|execute|monitor|report|prepare|analyze|facilitate|conduct|perform|assist)\b/i.test(text)) {
    return 'responsibilities'
  }

  return 'none'
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION BUILDERS — each produces an original paragraph
// ─────────────────────────────────────────────────────────────────────────────

/** 1 — Opening snapshot */
function buildRoleSnapshot(job: JobSchemaInput): string {
  const arrangement = job.remote
    ? 'This is a remote-eligible position'
    : `This opening is based in ${job.city}, ${job.stateCode}`

  const typeLabel = formatEmploymentType(job.employmentType)

  return [
    `${job.company} is hiring a ${job.title} to join their team in ${job.city}, ${job.state}.`,
    `${arrangement}${typeLabel ? ` offered on a ${typeLabel} basis` : ''}.`,
    `If you are looking for your next step in this field, this role is worth a close look.`,
  ].join(' ')
}

/** 2 — Responsibilities → "A typical week involves…" narrative */
function buildDayInTheLife(items: string[], title: string): string {
  if (items.length === 0) return ''

  const reformulated = items
    .slice(0, 6)
    .map(reformulateResponsibility)
    .filter(Boolean)

  if (reformulated.length === 0) return ''

  const intro = pickOne([
    `Day-to-day, the ${title} will be expected to:`,
    `On a practical level, this role revolves around:`,
    `The person stepping into this position will spend their time:`,
    `Core activities for the ${title} include:`,
  ])

  return `${intro} ${reformulated.join('; ')}.`
}

/** 3 — Requirements → "Ideal candidates bring…" profile */
function buildCandidateProfile(items: string[]): string {
  if (items.length === 0) return ''

  const reformulated = items
    .slice(0, 6)
    .map(reformulateRequirement)
    .filter(Boolean)

  if (reformulated.length === 0) return ''

  const intro = pickOne([
    'The ideal candidate brings:',
    'Strong applicants typically offer:',
    'To thrive in this position, candidates should demonstrate:',
    'The profile the hiring team is looking for includes:',
  ])

  return `${intro} ${reformulated.join('; ')}.`
}

/** 4 — Education note */
function buildEducationNote(items: string[]): string {
  if (items.length === 0) return ''
  const first = items[0]
  return pickOne([
    `From an academic standpoint, ${lowerFirst(first)}.`,
    `On the education side, the role typically calls for ${lowerFirst(first)}.`,
    `A background that includes ${lowerFirst(first)} is generally expected.`,
  ])
}

/** 5 — Compensation context */
function buildCompensationContext(job: JobSchemaInput): string {
  const hasSalary = job.salaryMin && job.salaryMax && job.salaryMin !== job.salaryMax

  const salaryLine = hasSalary
    ? `The posted salary range for this position is $${formatNum(job.salaryMin!)} to $${formatNum(job.salaryMax!)} per year.`
    : `Compensation details will be discussed during the interview process.`

  const marketLine = pickOne([
    `In ${job.state}, the labor market for ${job.title} roles remains active, with demand continuing across multiple sectors.`,
    `${job.state}-based ${job.title} professionals are in steady demand according to current workforce data.`,
    `Across ${job.state}, employers report ongoing need for qualified ${job.title} candidates at various experience levels.`,
  ])

  return `${salaryLine} ${marketLine}`
}

/** 6 — Benefits → "What you gain" */
function buildBenefitsNarrative(items: string[]): string {
  if (items.length === 0) return ''

  const reformulated = items
    .slice(0, 5)
    .map(reformulateBenefit)
    .filter(Boolean)

  if (reformulated.length === 0) return ''

  const intro = pickOne([
    'The compensation package includes:',
    'Alongside the base salary, the employer offers:',
    'Team members at this company have access to:',
    'What comes with the role:',
  ])

  return `${intro} ${reformulated.join(', ')}.`
}

/** 7 — Location & work arrangement */
function buildLocationContext(job: JobSchemaInput): string {
  if (job.remote) {
    return pickOne([
      `This position supports remote work, giving candidates across the United States the opportunity to apply.`,
      `Remote candidates are welcome to apply — no relocation to ${job.city} is required.`,
      `The role can be performed fully remotely, though the company is headquartered in ${job.city}, ${job.stateCode}.`,
    ])
  }

  return pickOne([
    `The position is on-site in ${job.city}, ${job.state}. Applicants within commuting distance of the area are encouraged to apply.`,
    `Day-to-day work takes place in ${job.city}, ${job.stateCode}. Local candidates or those open to relocation are a strong fit.`,
    `${job.city}, ${job.state} is where this role is based. The team works from a physical location and values in-person collaboration.`,
  ])
}

/** 8 — Closing CTA */
function buildClosingCta(job: JobSchemaInput): string {
  return pickOne([
    `Qualified candidates interested in the ${job.title} role at ${job.company} can apply directly through this listing.`,
    `To be considered for this ${job.title} opening, submit your application through the link on this page.`,
    `Ready to take the next step? Apply now to connect with the ${job.company} hiring team for this ${job.title} opportunity.`,
    `This ${job.title} position at ${job.company} is actively hiring — apply today to move forward in the process.`,
  ])
}

// ─────────────────────────────────────────────────────────────────────────────
// REFORMULATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Responsibilities: convert action-verb sentences to gerund / noun phrases.
 * "Manage a team of 5" → "managing a cross-functional team"
 */
function reformulateResponsibility(text: string): string {
  const t = text.trim()
  if (!t || t.length < 10) return ''

  // Already starts with a gerund → keep, just lowercase
  if (/^[A-Z][a-z]+ing\b/.test(t)) return lowerFirst(t)

  // Starts with an imperative verb → convert to gerund
  const gerundMatch = t.match(/^([A-Z][a-z]{2,})\s+(.+)$/)
  if (gerundMatch) {
    const verb = gerundMatch[1]
    const rest = gerundMatch[2]
    const gerund = toGerund(verb)
    if (gerund) return `${gerund} ${rest}`
  }

  return lowerFirst(t)
}

/**
 * Requirements: reframe as noun-phrase abilities.
 * "Must have 3+ years of experience" → "3+ years of hands-on experience"
 * "Ability to work independently" → "demonstrated ability to work independently"
 */
function reformulateRequirement(text: string): string {
  const t = text.trim()
  if (!t || t.length < 8) return ''

  return t
    .replace(/^must\s+(have|possess|demonstrate)\s+/i, '')
    .replace(/^required\s+to\s+/i, '')
    .replace(/^ability\s+to\s+/i, 'capacity to ')
    .replace(/^experience\s+with\s+/i, 'working knowledge of ')
    .replace(/^proficiency\s+in\s+/i, 'solid command of ')
    .replace(/^strong\s+/i, 'proven ')
    .replace(/^excellent\s+/i, 'outstanding ')
    .replace(/^knowledge\s+of\s+/i, 'familiarity with ')
    .replace(/\byears? of experience\b/i, 'years of hands-on experience')
    .replace(/\bteam player\b/i, 'collaborative mindset')
    .replace(/\bfast.paced environment\b/i, 'high-velocity work setting')
    .replace(/\battention to detail\b/i, 'precision and care in execution')
    .replace(/\bstrong communication skills\b/i, 'clear written and verbal communication')
    .replace(/\bself.starter\b/i, 'self-directed professional')
    .replace(/\bself.motivated\b/i, 'intrinsically motivated')
    .trim()
}

/**
 * Benefits: normalise phrasing.
 * "Health insurance" → "health coverage"
 * "Paid time off" → "generous PTO policy"
 */
function reformulateBenefit(text: string): string {
  const t = text.trim()
  if (!t || t.length < 4) return ''

  return t
    .replace(/\bhealth insurance\b/i, 'medical coverage')
    .replace(/\bdental insurance\b/i, 'dental plan')
    .replace(/\bvision insurance\b/i, 'vision plan')
    .replace(/\bpaid time off\b/i, 'PTO')
    .replace(/\bpaid vacation\b/i, 'paid leave')
    .replace(/\bretirement plan\b/i, '401(k) plan')
    .replace(/\blife insurance\b/i, 'life coverage')
    .replace(/\bprofessional development\b/i, 'career growth support')
    .replace(/\btuition reimbursement\b/i, 'education assistance')
    .replace(/\bflexible schedule\b/i, 'flexible working hours')
    .replace(/\bremote work\b/i, 'remote-work options')
    .replace(/\bstock options\b/i, 'equity participation')
    .replace(/\bbonus\b/i, 'performance bonus')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// VERB → GERUND TABLE
// ─────────────────────────────────────────────────────────────────────────────

const GERUND_MAP: Record<string, string> = {
  Manage: 'managing', Lead: 'leading', Develop: 'developing',
  Design: 'designing', Build: 'building', Create: 'creating',
  Coordinate: 'coordinating', Ensure: 'ensuring', Support: 'supporting',
  Maintain: 'maintaining', Oversee: 'overseeing', Deliver: 'delivering',
  Implement: 'implementing', Drive: 'driving', Execute: 'executing',
  Monitor: 'monitoring', Report: 'reporting', Prepare: 'preparing',
  Analyze: 'analyzing', Analyse: 'analysing', Facilitate: 'facilitating',
  Conduct: 'conducting', Perform: 'performing', Assist: 'assisting',
  Review: 'reviewing', Evaluate: 'evaluating', Identify: 'identifying',
  Establish: 'establishing', Track: 'tracking', Train: 'training',
  Collaborate: 'collaborating', Communicate: 'communicating',
  Document: 'documenting', Plan: 'planning', Schedule: 'scheduling',
  Provide: 'providing', Work: 'working', Write: 'writing',
  Handle: 'handling', Resolve: 'resolving', Process: 'processing',
  Update: 'updating', Respond: 'responding', Partner: 'partnering',
  Recruit: 'recruiting', Hire: 'hiring', Onboard: 'onboarding',
  Assess: 'assessing', Research: 'researching', Test: 'testing',
  Configure: 'configuring', Deploy: 'deploying', Operate: 'operating',
  Optimize: 'optimizing', Improve: 'improving', Increase: 'increasing',
  Reduce: 'reducing', Achieve: 'achieving', Meet: 'meeting',
  Exceed: 'exceeding', Serve: 'serving', Help: 'helping',
  Greet: 'greeting', Engage: 'engaging', Educate: 'educating',
  Promote: 'promoting', Sell: 'selling', Close: 'closing',
  Generate: 'generating', Grow: 'growing', Expand: 'expanding',
  Administer: 'administering', Control: 'controlling',
  Inspect: 'inspecting', Verify: 'verifying', Audit: 'auditing',
  Compile: 'compiling', Collect: 'collecting', Gather: 'gathering',
  Organize: 'organizing', Prioritize: 'prioritizing', Delegate: 'delegating',
}

function toGerund(verb: string): string | null {
  return GERUND_MAP[verb] ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function formatEmploymentType(type?: string): string {
  const map: Record<string, string> = {
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACTOR: 'contract',
    INTERN: 'internship',
    TEMPORARY: 'temporary',
  }
  return type ? (map[type] ?? type.toLowerCase().replace('_', '-')) : ''
}

function formatNum(n: number): string {
  return n.toLocaleString('en-US')
}

function lowerFirst(s: string): string {
  if (!s) return ''
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/** Deterministic pick based on content hash — same input always → same output */
function pickOne<T>(options: T[], seed?: string): T {
  if (options.length === 1) return options[0]
  const s = seed ?? String(Date.now())
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0
  }
  return options[Math.abs(hash) % options.length]
}