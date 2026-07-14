// lib/usStates.ts
// Mapping partagé nom complet <-> code état, utilisé par /data, /data/states/[state]
// et la résolution d'état d'un job (addressRegion peut être "Maryland" ou "MD").

export const STATES: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
  Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY',
}

// ── Ajouts pour couvrir les besoins de /data, /data/states/[state] et la homepage ──

export const SLUG_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.keys(STATES).map((name) => [stateToSlug(name), name])
)

/** Code abréviation ("MA") -> slug de route ("massachusetts") */
export function codeToSlug(code: string): string | null {
  const name = STATE_CODE_TO_NAME[code.toUpperCase()]
  return name ? stateToSlug(name) : null
}

export const STATE_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATES).map(([name, code]) => [code, name])
)

export function stateToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

/**
 * Résout un addressRegion brut ("Maryland", "MD", ou même "Adelphi, MD")
 * vers un nom d'état canonique complet. Retourne null si rien n'est reconnu.
 */
export function resolveStateName(raw?: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()

  if (STATES[trimmed]) return trimmed

  const upper = trimmed.toUpperCase()
  if (STATE_CODE_TO_NAME[upper]) return STATE_CODE_TO_NAME[upper]

  // ex: "Adelphi, MD" -> code en fin de chaîne
  const codeMatch = trimmed.match(/,\s*([A-Za-z]{2})\s*$/)
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase()
    if (STATE_CODE_TO_NAME[code]) return STATE_CODE_TO_NAME[code]
  }

  const lower = trimmed.toLowerCase()
  for (const name of Object.keys(STATES)) {
    if (lower.includes(name.toLowerCase())) return name
  }

  return null
}
export function extractStateFromLocation(location?: string | null): string | null {
  if (!location) return null
  const trimmed = location.trim()

  // Cas standard : "Ville, CODE" ou "Ville, Nom Complet"
  const match = trimmed.match(/,\s*(.+)\s*$/)
  if (match) {
    const part = match[1].trim()
    const upper = part.toUpperCase()
    if (Object.values(STATES).includes(upper)) return upper
    if (STATES[part]) return STATES[part]
  }

  // Cas remote/état seul : "Ohio", "Texas"... (pas de virgule, pas de ville)
  if (STATES[trimmed]) return STATES[trimmed]

  const upperTrimmed = trimmed.toUpperCase()
  if (Object.values(STATES).includes(upperTrimmed)) return upperTrimmed

  return null
}