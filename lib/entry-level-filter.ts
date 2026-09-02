export const ENTRY_LEVEL_INCLUDE_KEYWORDS = [
  'entry level', 'entry-level', 'helper', 'junior', 'new grad',
  '0-1 year', '0-2 year', 'no experience', 'apprentice', 'trainee',
  'laborer', 'will train', 'training provided',
] as const

export const ENTRY_LEVEL_TITLE_EXCLUDES = [
  'senior', 'sr.', 'sr ', 'lead', 'principal', 'foreman', 'supervisor',
  'manager', 'director', 'journeyman', 'master electrician', 'experienced',
  'advanced', 'technician ii', 'technician iii', 'technician iv',
  'engineer ii', 'engineer iii', 'engineer iv',
  'level ii', 'level iii', 'level iv',
] as const

export const ENTRY_LEVEL_DESCRIPTION_EXCLUDES = [
  '3+ years', '4+ years', '5+ years', '6+ years', '7+ years', '8+ years', '10+ years',
  'minimum of 3 years', 'minimum of 4 years', 'minimum of 5 years',
  'minimum 3 years', 'minimum 4 years', 'minimum 5 years',
  'at least 3 years', 'at least 4 years', 'at least 5 years',
  '3 years of experience', '4 years of experience', '5 years of experience',
  'three or more years', 'four or more years', 'five or more years',
] as const

function includesAny(text: string, keywords: readonly string[]): boolean {
  const normalized = text.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
}

export function matchesEntryLevelJob(title: string, description: string): boolean {
  if (!includesAny(`${title} ${description}`, ENTRY_LEVEL_INCLUDE_KEYWORDS)) return false
  if (includesAny(title, ENTRY_LEVEL_TITLE_EXCLUDES)) return false
  if (includesAny(description, ENTRY_LEVEL_DESCRIPTION_EXCLUDES)) return false
  return true
}
