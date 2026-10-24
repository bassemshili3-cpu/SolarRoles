type Experience = { '@type': 'OccupationalExperienceRequirements'; monthsOfExperience: number }
type Education = { '@type': 'EducationalOccupationalCredential'; credentialCategory: string }
export type JobPostingRequirements = {
  experienceRequirements?: Experience | string
  educationRequirements?: Education | string
  experienceInPlaceOfEducation?: true
}

const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }
const count = '(?:\\d{1,2}(?:\\.\\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)'
const years = new RegExp(`\\b(${count})(?:\\s*\\(\\d{1,2}\\))?\\s*(?:[-–]|to)?\\s*(${count})?\\s*\\+?\\s*(years?|months?)(?:['’])?\\s+(?:of\\s+)?(?:[a-z][a-z/&(),-]*\\s+){0,10}?experience\\b`, 'gi')
const required = /\b(?:required|requirements?|minimum|at least|must (?:have|hold|possess)|you (?:have|bring|need)|we require)\b/i
const optional = /\b(?:prefer(?:red|ably)?|desired|desirable|a plus|nice to have|not required|optional)\b/i
const alternative = /\b(?:or (?:an? )?equivalent (?:practical |professional |work )?experience|experience (?:in (?:lieu|place) of|instead of) (?:an? )?(?:degree|education)|(?:bachelor(?:'s|s)?|master(?:'s|s)?|associate(?:'s|s)?|degree|diploma|education).{0,100}\bor\b.{0,100}experience)\b/i
const explicitEquivalent = /\b(?:or (?:an? )?equivalent (?:practical |professional |work )?experience|experience (?:in (?:lieu|place) of|instead of) (?:an? )?(?:degree|education))\b/i
const degrees: Array<[RegExp, string]> = [
  [/\b(?:high school (?:diploma|education)|GED)\b/i, 'high school'],
  [/\bassociate(?:'s|s)? degree\b/i, 'associate degree'],
  [/\b(?:bachelor(?:'s|s)? degree|bachelor of (?:science|arts)|B\.?S\.?|B\.?A\.?)\b/i, 'bachelor degree'],
  [/\b(?:master(?:'s|s)? degree|master of (?:science|arts)|M\.?S\.?|MBA|Ph\.?D\.?)\b/i, 'postgraduate degree'],
]

function clauses(html: string): string[] {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(?:p|li|div|h[1-6])>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&(?:rsquo|lsquo);|&#(?:39|8217);/gi, "'").replace(/[’‘]/g, "'")
    .replace(/&amp;/gi, '&').replace(/&(?:ndash|mdash);/gi, '–')
    .split(/[\r\n]+|(?<=[.!?])\s+(?=[A-Z])|(?<=[a-z][.!?])(?=[A-Z])/u).map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean)
}

function parse(html: string): JobPostingRequirements {
  const result: JobPostingRequirements = {}
  const months: number[] = []
  const education: Array<Education | string> = []
  const experienceClauses: string[] = []
  let section: 'required' | 'optional' | null = null
  let noExperience = false
  let equivalent: string | undefined
  for (const line of clauses(html)) {
    if (/^(?:preferred|desired|additional) qualifications?\s*:?$/i.test(line)) { section = 'optional'; continue }
    if (/^(?:(?:minimum|required|basic) )?(?:qualifications?|requirements?|education (?:and|&) experience)\s*:?$/i.test(line)) { section = 'required'; continue }
    if (/^(?:responsibilities|benefits|about (?:us|you|the role)|compensation|what (?:we offer|you.ll do))\s*:?$/i.test(line)) { section = null; continue }
    if (optional.test(line) || section === 'optional' && !required.test(line)) continue
    if (/\bno (?:prior |previous |professional )?experience (?:is )?(?:required|necessary|needed)\b/i.test(line)) noExperience = true
    const matches = [...line.matchAll(years)]
    const explicitlyRequired = required.test(line) || section === 'required' || new RegExp(`^[-•*]?\\s*${count}\\b`, 'i').test(line)
    if (matches.length && explicitlyRequired && !/\b(?:up to|less than|no more than)\s+\w+/i.test(line)) {
      if (alternative.test(line)) { if (explicitEquivalent.test(line)) equivalent = line }
      else {
        const values = matches.map(match => {
          const n = words[match[1].toLowerCase()] ?? Number(match[1])
          return n * (/^year/i.test(match[3]) ? 12 : 1)
        }).filter(n => Number.isFinite(n) && n > 0 && n <= 600)
        if (values.length) {
          months.push(/\bor\b/i.test(line) ? Math.min(...values) : Math.max(...values))
          experienceClauses.push(line)
        }
      }
    }
    const matchedDegrees = degrees.filter(([pattern]) => pattern.test(line)).map(([, category]) => category)
    if (matchedDegrees.length && (required.test(line) || section === 'required')) {
      // Text retains OR/equivalent alternatives rather than claiming every degree is mandatory.
      education.push(matchedDegrees.length > 1 || alternative.test(line) || /\bor\b/i.test(line)
        ? line : { '@type': 'EducationalOccupationalCredential', credentialCategory: matchedDegrees[0] })
      if (explicitEquivalent.test(line)) equivalent = line
    }
    if (/\bno (?:formal )?(?:education|degree|diploma) (?:is )?(?:required|necessary|needed)\b/i.test(line)) education.push('no requirements')
  }
  if (months.length && !noExperience) result.experienceRequirements = { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: Math.max(...months) }
  else if (noExperience && !months.length) result.experienceRequirements = 'no requirements'
  const categories = new Set(education.map(item => typeof item === 'string' ? item : item.credentialCategory))
  if (categories.size === 1) result.educationRequirements = education[0]
  // Conflicting or complex multiple education clauses are omitted rather than simplified.
  if (equivalent && result.educationRequirements) {
    result.educationRequirements = equivalent
    result.experienceRequirements = [...new Set([...experienceClauses, equivalent])].join(' ')
    result.experienceInPlaceOfEducation = true
  }
  return result
}

/** Use employer text, and require corroboration when the visible page is rewritten. */
export function buildJobPostingRequirements(description: string, visibleDescription = description): JobPostingRequirements {
  const source = parse(description)
  if (visibleDescription === description) return source
  const visible = parse(visibleDescription)
  const result: JobPostingRequirements = {}
  for (const key of ['experienceRequirements', 'educationRequirements'] as const) {
    if (source[key] && JSON.stringify(source[key]) === JSON.stringify(visible[key])) Object.assign(result, { [key]: source[key] })
  }
  if (source.experienceInPlaceOfEducation && visible.experienceInPlaceOfEducation && result.educationRequirements && result.experienceRequirements) result.experienceInPlaceOfEducation = true
  return result
}
