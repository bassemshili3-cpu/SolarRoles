export type SignalStatus = 'positive' | 'warning' | 'neutral'

export interface RequirementSignal {
  id: string
  label: string
  status: SignalStatus
  matchedText?: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectExperienceRequirement(text: string): RequirementSignal | null {
  const cleanText = stripHtml(text)
  const lower = cleanText.toLowerCase()

  // 1. No experience required (priorité la plus haute)
  const noExpKeywords = ['no experience necessary', 'no experience required', 'no prior experience', 'entry level', 'entry-level', 'will train', 'training provided']
  if (noExpKeywords.some(kw => lower.includes(kw))) {
    return {
      id: 'experience-required',
      label: 'No experience required',
      status: 'positive',
    }
  }

  // 2. Plage d'années explicite (dans cet ordre de priorité)
  //    On utilise d'abord des regex à "fenêtre" qui tolèrent un groupe nominal
  //    entre "years" et "experience" (ex: "2 years of commercial O&M experience").
  //
  //    2a. "minimum/at least X years ... experience" (priorité haute)
  let match = lower.match(/(?:minimum(?:\s+of)?|at least|min\.?)\s*(\d{1,2})\s*\+?\s*years?\s+(?:of\s+)?[a-z][a-z,/\-\s]{0,80}?experience/i)
  if (match) {
    const label = `${match[1]}+ years of experience (minimum)`
    const finalLabel = /preferred|a\s+plus|nice\s+to\s+have/.test(lower.slice(match.index! + match[0].length, match.index! + match[0].length + 20))
      ? `${label} (preferred, not required)`
      : label
    return {
      id: 'experience-required',
      label: finalLabel,
      status: 'neutral',
    }
  }

  //    2b. "X to Y years ... experience" (fenêtre)
  match = lower.match(/(\d{1,2})\s*(?:to|-|–)\s*(\d{1,2})\+?\s*years?\s+(?:of\s+)?[a-z][a-z,/\-\s]{0,80}?experience/i)
  if (match) {
    const label = `${match[1]}–${match[2]} years of experience`
    const finalLabel = /preferred|a\s+plus|nice\s+to\s+have/.test(lower.slice(match.index! + match[0].length, match.index! + match[0].length + 20))
      ? `${label} (preferred, not required)`
      : label
    return {
      id: 'experience-required',
      label: finalLabel,
      status: 'neutral',
    }
  }

  //    2c. "X+ years ... experience" (fenêtre)
  match = lower.match(/(\d{1,2})\+\s*years?\s+(?:of\s+)?[a-z][a-z,/\-\s]{0,80}?experience/i)
  if (match) {
    const label = `${match[1]}+ years of experience`
    const finalLabel = /preferred|a\s+plus|nice\s+to\s+have/.test(lower.slice(match.index! + match[0].length, match.index! + match[0].length + 20))
      ? `${label} (preferred, not required)`
      : label
    return {
      id: 'experience-required',
      label: finalLabel,
      status: 'neutral',
    }
  }

  //    2d. Fallback strict (anciennes regex, adjacence directe)
  //         "X years of experience" (générique)
  match = lower.match(/(\d{1,2})\s*years?\s+(?:of\s+)?experience/i)
  if (match) {
    const label = `${match[1]} years of experience`
    const finalLabel = /preferred|a\s+plus|nice\s+to\s+have/.test(lower.slice(match.index! + match[0].length, match.index! + match[0].length + 20))
      ? `${label} (preferred, not required)`
      : label
    return {
      id: 'experience-required',
      label: finalLabel,
      status: 'neutral',
    }
  }

  return null
}

export function extractRequirementSignals(text: string): RequirementSignal[] {
  const cleanText = stripHtml(text)
  const lower = cleanText.toLowerCase()
  const signals: RequirementSignal[] = []

  // Experience requirement
  const expSignal = detectExperienceRequirement(cleanText)
  if (expSignal) {
    signals.push(expSignal)
  }

  // Employment status
  const contractorKeywords = ['1099', 'independent contractor', 'subcontractor', 'self-employed']
  const employeeKeywords = ['w-2', 'w2 employee', 'full-time employee', 'full time employee']
  
  const hasContractor = contractorKeywords.some(kw => lower.includes(kw))
  const hasEmployee = employeeKeywords.some(kw => lower.includes(kw))
  
  if (hasContractor || hasEmployee) {
    if (hasContractor) {
      const matched = contractorKeywords.find(kw => lower.includes(kw))
      signals.push({
        id: 'employment-status',
        label: '1099 contractor (not W-2)',
        status: 'warning',
        matchedText: matched,
      })
    } else if (hasEmployee) {
      const matched = employeeKeywords.find(kw => lower.includes(kw))
      signals.push({
        id: 'employment-status',
        label: 'W-2 employee',
        status: 'positive',
        matchedText: matched,
      })
    }
  }

  // Vehicle provided
  const vehicleKeywords = ['company vehicle', 'company truck', 'company van', 'vehicle provided']
  const vehicleMatch = vehicleKeywords.find(kw => lower.includes(kw))
  if (vehicleMatch) {
    signals.push({
      id: 'vehicle-provided',
      label: 'Company vehicle provided',
      status: 'positive',
      matchedText: vehicleMatch,
    })
  }

  // Tools provided
  const toolsKeywords = ['tools provided', 'tools supplied', 'equipment provided']
  const toolsMatch = toolsKeywords.find(kw => lower.includes(kw))
  if (toolsMatch) {
    signals.push({
      id: 'tools-provided',
      label: 'Tools provided',
      status: 'positive',
      matchedText: toolsMatch,
    })
  }

  // Per diem
  const perDiemKeywords = ['per diem', 'travel stipend', 'travel pay']
  const perDiemMatch = perDiemKeywords.find(kw => lower.includes(kw))
  if (perDiemMatch) {
    signals.push({
      id: 'per-diem',
      label: 'Per diem for travel',
      status: 'positive',
      matchedText: perDiemMatch,
    })
  }

  // Height work
  const heightKeywords = ['rooftop', 'roof top', 'on the roof', 'ladder', 'harness', 'fall protection', 'working at heights', 'working from heights']
  const heightMatch = heightKeywords.find(kw => lower.includes(kw))
  if (heightMatch) {
    signals.push({
      id: 'height-work',
      label: 'Rooftop work, harness/fall protection required',
      status: 'warning',
      matchedText: heightMatch,
    })
  }

  // Travel radius
  const radiusRegex1 = /within\s+(\d{1,3})\s*(?:-|\s)?miles?/i
  const radiusRegex2 = /up to\s+(\d{1,3})\s*(?:-|\s)?miles?/i
  const radiusRegex3 = /(\d{1,3})\s*(?:-|\s)?mile\s+radius/i
  
  const radiusMatch = radiusRegex1.exec(lower) || radiusRegex2.exec(lower) || radiusRegex3.exec(lower)
  if (radiusMatch) {
    signals.push({
      id: 'travel-radius',
      label: `Travel radius: ~${radiusMatch[1]} miles`,
      status: 'neutral',
      matchedText: radiusMatch[0],
    })
  }

  return signals
}