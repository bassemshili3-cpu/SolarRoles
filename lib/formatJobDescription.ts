/**
 * formatJobDescription.ts
 *
 * Transforms raw Adzuna job descriptions into clean, structured HTML.
 */

export function formatJobDescription(html: string): string {
  if (!html) return ''

  // If already well-structured HTML, just clean it
  if ((html.match(/<(h[1-6]|ul|ol|li)\b/gi) || []).length > 4) {
    return cleanUpHtml(html)
  }

  // ── Normalize to plain text ───────────────────────────────────────────
  let text = html
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

  // ── Strip redundant metadata at top ───────────────────────────────────
  text = stripMetadataBlock(text)

  // ── Split inline dashes: "-Item one. -Item two" → separate lines ──────
  text = text.replace(/\s+-(?=[A-Z])/g, '\n-')

  // ── Force breaks before known section headings ────────────────────────
  text = injectBreaksBeforeHeadings(text)

  // ── Parse into structured blocks ──────────────────────────────────────
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const blocks = classifyLines(lines)

  // ── Render to HTML ────────────────────────────────────────────────────
  return renderToHtml(blocks)
}

// ─────────────────────────────────────────────────────────────────────────────
// METADATA STRIPPING
// ─────────────────────────────────────────────────────────────────────────────

function stripMetadataBlock(text: string): string {
  const metaPatterns = [
    /^.{0,5}Description\s*/i,
    /^(Company|Location|Date Posted|Employment Type|Job ID|Job Type|Salary|Posted|Category)\s*[:]\s*.*/i,
    /^\w[\w\s]{0,30}(Company|Location)\s*[:]\s*.*/i,
    /^(Remote|On-site|Hybrid),?\s*(United States|USA|US)?\s*$/i,
    /^(Full[- ]?Time|Part[- ]?Time|Contract|Temporary|Intern)\s*$/i,
    /^(Employment Type|Job Type)\s*[:]\s*(Full|Part|Contract|Temporary).*/i,
    /^Job ID\s*[:]\s*\S+/i,
    /^Date Posted\s*[:]\s*.*/i,
    /^United States\s*$/i,
  ]

  const lines = text.split('\n')
  let startIndex = 0
  const scanLimit = Math.min(lines.length, 15)

  for (let i = 0; i < scanLimit; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const isMeta = metaPatterns.some(p => p.test(line)) ||
      (i < 6 && line.length < 40 && !line.includes('.') && /^[A-Z]/.test(line) && !isHeadingPhrase(line))

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
// HEADING DETECTION
// ─────────────────────────────────────────────────────────────────────────────

// These are STRICT section heading phrases — not sentence starters.
// They should only match things that are actual section labels.
const HEADING_PHRASES = [
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

const HEADING_REGEX = new RegExp(`^(${HEADING_PHRASES.join('|')})\\s*:?\\s*`, 'i')

function isHeadingPhrase(text: string): boolean {
  return HEADING_REGEX.test(text.trim())
}

function injectBreaksBeforeHeadings(text: string): string {
  for (const phrase of HEADING_PHRASES) {
    const regex = new RegExp(`(?<=[.!?:])\\s+(${phrase}\\b)`, 'gi')
    text = text.replace(regex, '\n\n$1')
  }

  // Break before ALL-CAPS headings (e.g., "RESPONSIBILITIES")
  text = text.replace(
    /(?<=[.!?\n])\s*\b([A-Z]{2,}(?:\s+(?:&\s+)?[A-Z]{2,}){0,4})\s*\n/g,
    '\n\n$1\n'
  )

  // Break before "Title Case Words:" (2-6 words, ending colon, only after sentence end)
  text = text.replace(
    /(?<=[.!?])\s+([A-Z][a-z]+(?:\s+(?:&\s+)?(?:[A-Z/][a-z]*|the|a|an|in|of|for|and|to|at|or){1}){0,5}\s*:)(?=\s)/g,
    '\n\n$1'
  )

  return text
}

// ─────────────────────────────────────────────────────────────────────────────
// LINE CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────────────

type Block = { type: 'heading' | 'li' | 'text'; content: string }

const BULLET_REGEX = /^\s*[•●○■◆►–—-]\s*/
const NUMBERED_REGEX = /^\s*\d{1,2}[.)]\s+/

function classifyLines(lines: string[]): Block[] {
  const blocks: Block[] = []

  for (const line of lines) {
    // ── Bullet / numbered list ──
    if (BULLET_REGEX.test(line) && line.length > 3) {
      const content = line.replace(BULLET_REGEX, '').trim()
      if (content) blocks.push({ type: 'li', content })
      continue
    }
    if (NUMBERED_REGEX.test(line)) {
      blocks.push({ type: 'li', content: line.replace(NUMBERED_REGEX, '').trim() })
      continue
    }

    // ── ALL CAPS line → heading ──
    if (/^[A-Z][A-Z &/]{2,50}$/.test(line.trim())) {
      const heading = line.trim().charAt(0) + line.trim().slice(1).toLowerCase()
      blocks.push({ type: 'heading', content: heading })
      continue
    }

    // ── Heading: short line ending with colon ──
    if (/^[A-Z]/.test(line) && /:$/.test(line) && line.length < 80) {
      blocks.push({ type: 'heading', content: line.replace(/:$/, '') })
      continue
    }

    // ── Heading: known phrase (full line) ──
    const fullMatch = line.match(new RegExp(`^(${HEADING_PHRASES.join('|')})\\s*:?\\s*$`, 'i'))
    if (fullMatch) {
      blocks.push({ type: 'heading', content: fullMatch[1].replace(/:$/, '').trim() })
      continue
    }

    // ── Heading + text: "Responsibilities Lead the development..." ──
    const splitMatch = line.match(new RegExp(`^(${HEADING_PHRASES.join('|')})\\s*:?\\s+(.{10,})$`, 'i'))
    if (splitMatch) {
      blocks.push({ type: 'heading', content: splitMatch[1].replace(/:$/, '').trim() })
      expandAndPush(splitMatch[2].trim(), blocks)
      continue
    }

    // ── Long line — expand into list items / paragraphs ──
    if (line.length > 180) {
      expandAndPush(line, blocks)
    } else {
      blocks.push({ type: 'text', content: line })
    }
  }

  return blocks
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST ITEM EXPANSION
// ─────────────────────────────────────────────────────────────────────────────

const LIST_STARTERS = [
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
  // Action verbs (responsibilities)
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

const LIST_SPLIT_REGEX = new RegExp(
  `(?<=[.!?])\\s+(?=${LIST_STARTERS.map(s => `(?:${s})`).join('|')})`,
  'gi'
)

function expandAndPush(text: string, blocks: Block[]): void {
  const parts = text.split(LIST_SPLIT_REGEX).filter(p => p.trim())

  if (parts.length <= 1) {
    if (text.length > 350) {
      splitIntoParagraphs(text).forEach(p => blocks.push({ type: 'text', content: p }))
    } else {
      blocks.push({ type: 'text', content: text })
    }
    return
  }

  const first = parts[0].trim()
  const startsLikeList = LIST_STARTERS.some(s => new RegExp(`^${s}`, 'i').test(first))

  if (!startsLikeList && first.length < 250) {
    blocks.push({ type: 'text', content: first })
  } else {
    blocks.push({ type: 'li', content: first })
  }

  for (let i = 1; i < parts.length; i++) {
    const p = parts[i].trim()
    if (p) blocks.push({ type: 'li', content: p })
  }
}

function splitIntoParagraphs(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const paragraphs: string[] = []
  let buffer = ''

  for (const s of sentences) {
    buffer += s
    if (buffer.length > 160) {
      paragraphs.push(buffer.trim())
      buffer = ''
    }
  }
  if (buffer.trim()) paragraphs.push(buffer.trim())
  return paragraphs
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML RENDERING
// ─────────────────────────────────────────────────────────────────────────────

function renderToHtml(blocks: Block[]): string {
  let html = ''
  let inList = false

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        if (inList) { html += '</ul>\n'; inList = false }
        html += `<h3>${block.content}</h3>\n`
        break

      case 'li':
        if (!inList) { html += '<ul>\n'; inList = true }
        html += `  <li>${block.content}</li>\n`
        break

      case 'text':
        if (inList) { html += '</ul>\n'; inList = false }
        html += `<p>${block.content}</p>\n`
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
    .trim()
}