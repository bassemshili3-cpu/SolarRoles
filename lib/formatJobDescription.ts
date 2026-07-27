/**
 * formatJobDescription.ts
 *
 * Transforms raw aggregator job descriptions into clean, structured, safe HTML.
 *
 * Pipeline:
 *   1. Detect input shape (already-structured HTML vs plain-ish text)
 *   2. Normalize → strip metadata → inject structural breaks
 *   3. Classify lines into blocks (heading / list-item / paragraph)
 *   4. Render to semantic HTML
 *   5. Sanitize (escape user content; optional DOMPurify pass-through)
 *
 * Notes:
 *   - Adzuna descriptions often arrive truncated (handled by truncateAtEllipsis).
 *   - All user-supplied content is escaped before HTML injection (XSS-safe).
 *   - The "well-structured HTML" branch is reserved for inputs with real markup.
 *     Everything else is normalized to text first, then re-rendered.
 */

import DOMPurify from 'isomorphic-dompurify'

function defaultSanitizer(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h3', 'h4', 'p', 'ul', 'ol', 'li', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href', 'rel', 'target'],
    ALLOW_DATA_ATTR: false,
  })
}
export function sanitizeStructuredHtml(html: string): string {
  if (!html || !html.trim()) return ''
  const cleaned = cleanUpHtml(html)
  return defaultSanitizer(cleaned)
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type BlockType = 'heading' | 'li' | 'text'

export interface Block {
  type: BlockType
  content: string
}

export interface FormatDiagnostics {
  inputBytes: number
  outputBytes: number
  inputWasHtml: boolean
  truncated: boolean
  blocks: { heading: number; li: number; text: number }
}

export interface FormatResult {
  html: string
  diagnostics: FormatDiagnostics
}

export interface FormatConfig {
  /** If true (default), escape HTML in user content. Disable only if you sanitize downstream. */
  escapeHtml?: boolean
  /** Custom sanitizer (e.g., DOMPurify). Receives rendered HTML, returns sanitized HTML. */
  sanitizer?: (html: string) => string
  /** Override list-starter patterns. */
  listStarters?: readonly string[]
  /** Override heading-phrase patterns. */
  headingPhrases?: readonly string[]
  /** Min count of structural tags to treat input as "already HTML". Default: 4. */
  htmlTagThreshold?: number
  /** Add a small note when input appears truncated. Default: false. */
  markTruncated?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Strict section heading phrases — only true section labels, not sentence starters. */
const HEADING_PHRASES: readonly string[] = [
  'About (?:the |this )?(?:Role|Position|Company|Us|Job|Opportunity|Team)',
  'About [A-Z][A-Za-z &\'-]{2,40}',
  'Position (?:Summary|Overview|Description|Details)',
  'Job (?:Summary|Overview|Description|Details|Purpose)',
  'What (?:We|You)(?:\'ll| Will)? (?:Offer|Need|Do|Bring|Get|Expect|Provide|Look For)',
  'What (?:We\'re|You\'re) Looking For',
  'What You(?:\'ll| Will) (?:Do|Be Doing)',
  'Who (?:We Are|You Are|We\'re Looking For)',
  'Why (?:Join|Work(?: (?:Here|With Us|at))?|Choose) Us',
  'Why Choose [A-Z][A-Za-z &\'-]+\\??',
  'Where We Are',
  'In this (?:Role|Position)',
  '(?:Key |Core |Essential |Primary |Major )?(?:Responsibilities|Qualifications|Requirements|Benefits|Skills|Duties|Functions|Accountabilities)',
  '(?:Minimum|Preferred|Required|Desired|Basic|Additional) (?:Qualifications|Requirements|Skills|Experience)',
  '(?:Our |Your |Key |Total )?(?:Benefits|Perks|Compensation(?: [&] Benefits)?|Rewards|Package)',
  'How to Apply',
  'Physical (?:Requirements|Demands)',
  'Work(?:ing)? (?:Environment|Conditions|Schedule|Location)',
  'Education(?:al)?(?:\\s+(?:Requirements|Qualifications))?',
  'Equal (?:Opportunity|Employment)',
  'EEO(?: Statement)?',
  'Our (?:Mission|Vision|Values|Culture)',
  'Your (?:Impact|Role|Responsibilities)',
  'Salary (?:Range|Information|Details)',
  'To be successful',
  'Responsibilities(?:\\s+include)?',
]

/** Patterns that flag a line as metadata to strip from the top of the description. */
const META_LABEL_REGEX: RegExp = /^(?:Description|Company|Location|Date Posted|Employment Type|Job ID|Job Type|Salary|Posted|Category|Industry)\s*[:]/i

const TRIVIAL_VALUE_REGEX: RegExp = /^(Remote|On-site|Hybrid|Full[- ]?Time|Part[- ]?Time|Contract|Temporary|Intern|United States|USA|US)\s*$/i

/** "U.S.", "e.g.", "Inc.", "Ph.D", "10+", etc. — protect sentence terminators. */
const SENTENCE_BREAK_REGEX: RegExp = /(?<!\b(?:U\.S|e\.g|i\.e|Mr|Mrs|Dr|Inc|Ltd|Co|Jr|Sr|vs|etc|M-F|a\.m|p\.m|No|approx))\.([!?]|\s+(?=[A-Z]))/g

/** Match inline lists: "-Item. -Item" → newline-separated. */
const INLINE_DASH_REGEX: RegExp = /\s+-(?=[A-Z])/g

/** ALL-CAPS standalone heading — must be on its own line, end with colon or newline. */
const ALLCAPS_HEADING_REGEX: RegExp = /(?:^|\n)\s*([A-Z][A-Z &/\\-]{2,60})\s*(?::|\n)/gm

/** Bullet character at start of line. */
const BULLET_REGEX: RegExp = /^\s*[•●○■◆►–—-]\s+/

/** Numbered list at start of line. */
const NUMBERED_REGEX: RegExp = /^\s*\d{1,2}[.)]\s+/

/** A line that's just an ALL-CAPS heading (no colon). */
const ALLCAPS_LINE_REGEX: RegExp = /^[A-Z][A-Z &/\\-]{2,60}$/

/** Garbled truncation pattern from aggregators: "...stuff." */
const GARBLED_TRUNCATION_REGEX: RegExp = /(\.{3,}|…)[^.!?]*[.!?]/g

const DEFAULT_HTML_TAG_THRESHOLD = 4

/** Common list-item starters — action verbs and requirement openers. */
const LIST_STARTERS: readonly string[] = [
  'Must be able to', 'Ability to', 'Able to',
  'Knowledge of', 'Understanding of',
  'Experience (?:with|in)', 'Proficiency in',
  'Strong ', 'Excellent ', 'Proven ', 'Demonstrated ', 'Outstanding ',
  'Bachelor', 'Master', 'Associate', 'Degree in',
  'Minimum \\d', 'At least \\d', '\\d\\+?\\s*years?',
  'Competitive ', 'Comprehensive ', 'Generous ',
  'Medical[,\\s]', 'Dental[,\\s]', 'Vision[,\\s]',
  'Health \\(', 'Paid ', 'Tuition ', 'Life insurance',
  'Professional development', 'Employee ', 'Retirement',
  '\\d+[kK]', 'Base (?:hourly|salary)', 'Consistent ',
  'Up to \\$', '\\$\\d',
  'No experience', 'Self-motivated',
  'Currently hiring', 'Availability to',
  'Prior experience', 'Passion for', 'Valid ',
  'Accelerate ', 'Administer ', 'Analyze ', 'Assess ',
  'Assist ', 'Build ', 'Collaborate ', 'Communicate ',
  'Complete ', 'Conduct ', 'Contribute ', 'Coordinate ',
  'Create ', 'Deliver ', 'Design ', 'Develop ',
  'Document ', 'Drive ', 'Ensure ', 'Establish ',
  'Evaluate ', 'Execute ', 'Facilitate ', 'Gain ',
  'Identify ', 'Implement ', 'Inform ', 'Lead ',
  'Maintain ', 'Make ', 'Manage ', 'Monitor ',
  'Operate ', 'Oversee ', 'Participate ', 'Perform ',
  'Plan ', 'Prepare ', 'Promote ', 'Provide ',
  'Report ', 'Research ', 'Respond ', 'Review ',
  'Schedule ', 'Support ', 'Track ', 'Train ',
  'Work with ', 'Write ',
]


// ─────────────────────────────────────────────────────────────────────────────
// HTML ESCAPING (defense in depth)
// ─────────────────────────────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, ch => HTML_ENTITIES[ch] ?? ch)
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY POINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a raw job description into clean, structured HTML.
 *
 * @example
 *   const html = formatJobDescription(rawAdzunaDescription)
 */
export function formatJobDescription(html: string, config: FormatConfig = {}): string {
  return formatJobDescriptionWithDiagnostics(html, config).html
}

/**
 * Same as formatJobDescription, but also returns diagnostics
 * (useful for logging, A/B testing, content quality monitoring).
 */
export function formatJobDescriptionWithDiagnostics(
  html: string,
  config: FormatConfig = {},
): FormatResult {
  const cfg = resolveConfig(config)

  if (!html || !html.trim()) {
    return makeResult('', {
      inputBytes: 0,
      outputBytes: 0,
      inputWasHtml: false,
      truncated: false,
      blocks: { heading: 0, li: 0, text: 0 },
    })
  }

  const truncated = GARBLED_TRUNCATION_REGEX.test(html)
  const inputWasHtml = isStructuredHtml(html, cfg.htmlTagThreshold)

  const result = inputWasHtml
    ? processHtmlInput(html, cfg)
    : processTextInput(html, cfg)

  return { ...result, diagnostics: { ...result.diagnostics, truncated } }
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT DETECTION
// ─────────────────────────────────────────────────────────────────────────────

function isStructuredHtml(html: string, threshold: number): boolean {
  const matches = html.match(/<(h[1-6]|ul|ol|li)\b/gi)
  return !!matches && matches.length > threshold
}

function resolveConfig(config: FormatConfig) {
  return {
    escapeHtml: config.escapeHtml ?? true,
    sanitizer: config.sanitizer ?? defaultSanitizer,
    listStarters: config.listStarters ?? LIST_STARTERS,
    headingPhrases: config.headingPhrases ?? HEADING_PHRASES,
    htmlTagThreshold: config.htmlTagThreshold ?? DEFAULT_HTML_TAG_THRESHOLD,
    markTruncated: config.markTruncated ?? false,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML INPUT BRANCH
// ─────────────────────────────────────────────────────────────────────────────

function processHtmlInput(html: string, cfg: ReturnType<typeof resolveConfig>): FormatResult {
  const cleaned = cleanUpHtml(html)
   return makeResult(
     cleaned,
     {
       inputBytes: html.length,
       outputBytes: cleaned.length,
       inputWasHtml: true,
       truncated: false,
      blocks: { heading: 0, li: 0, text: 0 },
    },
    cfg.sanitizer,
   )
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT INPUT BRANCH
// ─────────────────────────────────────────────────────────────────────────────

function processTextInput(html: string, cfg: ReturnType<typeof resolveConfig>): FormatResult {
  // 1. Normalize to plain text
  let text = normalizeToText(html)

  // 2. Strip redundant metadata at top
  text = stripMetadataBlock(text)

  // 3. Truncate garbled "..." sections
  text = truncateAtEllipsis(text)

  // 4. Split inline dashes "-Item. -Item" → newline-separated
  text = text.replace(INLINE_DASH_REGEX, '\n-')

  // 5. Inject structural breaks before known headings
  text = injectBreaksBeforeHeadings(text, cfg.headingPhrases)

  // 6. Classify lines into blocks
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
  const blocks = classifyLines(lines, cfg.listStarters, cfg.headingPhrases)

  // 7. Render to HTML
  const rawHtml = renderToHtml(blocks, cfg.escapeHtml)

  return makeResult(rawHtml, {
    inputBytes: html.length,
    outputBytes: rawHtml.length,
    inputWasHtml: false,
    truncated: false,
    blocks: countBlocks(blocks),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

function normalizeToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
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
}

// ─────────────────────────────────────────────────────────────────────────────
// METADATA STRIPPING (strict — only true "Label: Value" patterns)
// ─────────────────────────────────────────────────────────────────────────────

function stripMetadataBlock(text: string): string {
  const lines = text.split('\n')
  const scanLimit = Math.min(lines.length, 12)
  let startIndex = 0

  for (let i = 0; i < scanLimit; i++) {
    const line = lines[i].trim()
    if (!line) {
      startIndex = i + 1
      continue
    }

    const isMeta =
      META_LABEL_REGEX.test(line) ||
      TRIVIAL_VALUE_REGEX.test(line) ||
      /^\w[\w\s]{0,30}\s*:\s*.{0,60}$/.test(line) // generic "Label: Value" pattern

    if (isMeta) {
      startIndex = i + 1
    } else {
      break
    }
  }

  lines.splice(0, startIndex)
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUNCATION HANDLING
// ─────────────────────────────────────────────────────────────────────────────

function truncateAtEllipsis(text: string): string {
  return text
    .replace(GARBLED_TRUNCATION_REGEX, '. ')
    .replace(/ {2,}/g, ' ')
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADING DETECTION
// ─────────────────────────────────────────────────────────────────────────────

function buildHeadingRegex(phrases: readonly string[]): RegExp {
  return new RegExp(`^(${phrases.join('|')})\\s*:?\\s*`, 'i')
}

function isHeadingPhrase(text: string, regex: RegExp): boolean {
  return regex.test(text.trim())
}

function injectBreaksBeforeHeadings(text: string, phrases: readonly string[]): string {
  for (const phrase of phrases) {
    const regex = new RegExp(`(?<=[.!?:])\\s+(${phrase}\\b)`, 'gi')
    text = text.replace(regex, '\n\n$1')
  }

  // Standalone ALL-CAPS headings (must be on their own line).
  text = text.replace(ALLCAPS_HEADING_REGEX, '\n\n$1\n')

  return text
}

// ─────────────────────────────────────────────────────────────────────────────
// LINE CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

function classifyLines(
  lines: string[],
  starters: readonly string[],
  phrases: readonly string[],
): Block[] {
  const headingRegex = buildHeadingRegex(phrases)
  const blocks: Block[] = []

  for (const line of lines) {
    // ── Bullet list ──
    if (BULLET_REGEX.test(line) && line.length > 3) {
      const content = line.replace(BULLET_REGEX, '').trim()
      if (content) blocks.push({ type: 'li', content })
      continue
    }

    // ── Numbered list ──
    if (NUMBERED_REGEX.test(line)) {
      blocks.push({ type: 'li', content: line.replace(NUMBERED_REGEX, '').trim() })
      continue
    }

    // ── Standalone ALL-CAPS line → heading ──
    if (ALLCAPS_LINE_REGEX.test(line.trim())) {
      blocks.push({ type: 'heading', content: titleCase(line.trim()) })
      continue
    }

    // ── Short line ending with colon → heading ──
    if (/^[A-Z]/.test(line) && /:$/.test(line) && line.length < 80) {
      blocks.push({ type: 'heading', content: line.replace(/:$/, '').trim() })
      continue
    }

    // ── Known heading phrase as full line ──
    const fullMatch = line.match(new RegExp(`^(${phrases.join('|')})\\s*:?\\s*$`, 'i'))
    if (fullMatch) {
      blocks.push({ type: 'heading', content: fullMatch[1].replace(/:$/, '').trim() })
      continue
    }

    // ── Heading + text on same line ──
    const splitMatch = line.match(
      new RegExp(`^(${phrases.join('|')})\\s*:?\\s+(.{10,})$`, 'i'),
    )
    if (splitMatch) {
      blocks.push({ type: 'heading', content: splitMatch[1].replace(/:$/, '').trim() })
      expandAndPush(splitMatch[2].trim(), blocks, starters)
      continue
    }

    // ── Heading phrase detected anywhere at start of line ──
    if (isHeadingPhrase(line, headingRegex)) {
      const cleaned = line.replace(headingRegex, '').trim()
      const headingText = line.match(headingRegex)?.[1]?.replace(/:$/, '').trim() ?? ''
      blocks.push({ type: 'heading', content: headingText })
      if (cleaned) blocks.push({ type: 'text', content: cleaned })
      continue
    }

    // ── Long line — try to expand into structured blocks ──
    if (line.length > 180) {
      expandAndPush(line, blocks, starters)
    } else {
      blocks.push({ type: 'text', content: line })
    }
  }

  return blocks
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function countBlocks(blocks: Block[]) {
  return blocks.reduce(
    (acc, b) => {
      acc[b.type === 'heading' ? 'heading' : b.type === 'li' ? 'li' : 'text']++
      return acc
    },
    { heading: 0, li: 0, text: 0 },
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST EXPANSION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pre-compile one regex per starter. Much faster than one giant alternation.
 * We keep the longest starters first so "Experience with" beats "Experience".
 */
function compileListSplitters(starters: readonly string[]): RegExp[] {
  const sorted = [...starters].sort((a, b) => b.length - a.length)
  return sorted.map(
    s => new RegExp(`(?<=[.!?])\\s+(?=${s})`, 'gi'),
  )
}

function expandAndPush(
  text: string,
  blocks: Block[],
  starters: readonly string[],
): void {
  const splitters = compileListSplitters(starters)
  let bestParts: string[] | null = null

  for (const regex of splitters) {
    const parts = text.split(regex).map(p => p.trim()).filter(Boolean)
    if (parts.length > 1 && (!bestParts || parts.length > bestParts.length)) {
      bestParts = parts
    }
  }

  if (!bestParts) {
    if (text.length > 350) {
      splitIntoParagraphs(text).forEach(p => blocks.push({ type: 'text', content: p }))
    } else {
      blocks.push({ type: 'text', content: text })
    }
    return
  }

  const first = bestParts[0]
  const looksLikeList = starters.some(s => new RegExp(`^${s}`, 'i').test(first))

  if (!looksLikeList && first.length < 250) {
    blocks.push({ type: 'text', content: first })
  } else {
    blocks.push({ type: 'li', content: first })
  }

  for (let i = 1; i < bestParts.length; i++) {
    blocks.push({ type: 'li', content: bestParts[i] })
  }
}

function splitIntoParagraphs(text: string): string[] {
  // Use protected sentence-break regex; protect common abbreviations.
  const sentences = text.split(SENTENCE_BREAK_REGEX).filter(s => s.trim())
  const paragraphs: string[] = []
  let buffer = ''

  for (const s of sentences) {
    const piece = s.trim()
    if (!piece) continue
    buffer += (buffer ? ' ' : '') + piece
    if (buffer.length > 160) {
      paragraphs.push(buffer)
      buffer = ''
    }
  }
  if (buffer.trim()) paragraphs.push(buffer)
  return paragraphs
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML RENDERING
// ─────────────────────────────────────────────────────────────────────────────

function renderToHtml(blocks: Block[], escape: boolean): string {
  let html = ''
  let inList = false

  const safe = (s: string) => (escape ? escapeHtml(s) : s)

  const closeList = () => {
    if (inList) {
      html += '</ul>\n'
      inList = false
    }
  }

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        closeList()
        html += `<h3>${safe(block.content)}</h3>\n`
        break
      case 'li':
        if (!inList) {
          html += '<ul>\n'
          inList = true
        }
        html += `  <li>${safe(block.content)}</li>\n`
        break
      case 'text':
        closeList()
        html += `<p>${safe(block.content)}</p>\n`
        break
    }
  }

  if (inList) html += '</ul>\n'
  return html
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML CLEANUP (for already-structured descriptions)
// ─────────────────────────────────────────────────────────────────────────────

function cleanUpHtml(html: string): string {
  return html
    .replace(/<(\w+)>\s*<\/\1>/g, '')
    .replace(/<h[12](\s|>)/gi, '<h3$1')
    .replace(/<\/h[12]>/gi, '</h3>')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

 function makeResult(
   html: string,
  diagnostics: FormatDiagnostics,
   sanitizer: (html: string) => string = defaultSanitizer,
): FormatResult {
   // Toujours sanitizer si non-vide — jamais de gate basé sur le contenu,
   // ça ré-ouvre exactement le trou qu'on essaie de fermer.
   const sanitized = diagnostics.outputBytes > 0 ? sanitizer(html) : html


  return {
    html: sanitized,
    diagnostics: { ...diagnostics, outputBytes: sanitized.length },
  }
}

function emptyResult(): FormatResult {
  return {
    html: '',
    diagnostics: {
      inputBytes: 0,
      outputBytes: 0,
      inputWasHtml: false,
      truncated: false,
      blocks: { heading: 0, li: 0, text: 0 },
    },
  }
}