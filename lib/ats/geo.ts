// lib/ats/geo.ts

import { STATE_CODE_TO_NAME } from '@/lib/usStates';

const US_STATE_CODES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

// Map "ILLINOIS" -> "IL", "NORTH CAROLINA" -> "NC", etc.
// Construit à partir de STATE_CODE_TO_NAME pour ne pas dupliquer la source de vérité.
const STATE_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_CODE_TO_NAME).map(([code, name]) => [name.toUpperCase(), code]),
);

const NON_US_MARKERS = [
  'canada', 'united kingdom', 'uk', 'england', 'london', 'ireland', 'dublin',
  'india', 'bangalore', 'hyderabad', 'germany', 'berlin', 'france', 'paris',
  'spain', 'madrid', 'netherlands', 'amsterdam', 'poland', 'warsaw',
  'portugal', 'lisbon', 'australia', 'sydney', 'singapore', 'philippines',
  'mexico', 'brazil', 'japan', 'tokyo', 'israel', 'tel aviv', 'romania',
  'ukraine', 'south africa', 'emea', 'apac', 'latam', 'puerto rico',
];

type MinimalJob = { location?: string | null; addressRegion?: string | null };

/**
 * Normalise une valeur de region brute (ex: "IL", "Illinois", "illinois ")
 * vers un code d'état US à 2 lettres, si reconnaissable.
 * Renvoie undefined si ce n'est ni un code US connu ni un nom d'état US connu
 * (cas probable: région étrangère, ex: "Ontario", "Bavaria").
 */
function normalizeRegion(raw: string): string | undefined {
  const upper = raw.toUpperCase().trim();
  if (US_STATE_CODES.has(upper)) return upper;
  if (STATE_NAME_TO_CODE[upper]) return STATE_NAME_TO_CODE[upper];
  return undefined;
}

/**
 * Vérifie qu'un job est basé aux US. Options par métier:
 *  - allowBareRemote: accepte "Remote" seul comme signal US suffisant
 *    (ok pour du remote-first tech/cyber, risqué pour un métier de terrain
 *    comme solar installer où "remote" seul ne veut souvent rien dire de fiable
 *    côté pays).
 */
export function isUSJob(
  job: MinimalJob,
  opts: { allowBareRemote?: boolean } = {},
): boolean {
  const { allowBareRemote = true } = opts;
  const location = (job.location || '').toLowerCase();
  const rawRegion = job.addressRegion || '';
  const normalizedRegion = rawRegion ? normalizeRegion(rawRegion) : undefined;

  // Workday renvoie addressRegion tantôt en code ("IL"), tantôt en nom complet
  // ("Illinois"). On ne rejette sur la région QUE si elle est non vide ET
  // non reconnaissable comme état US (ni code ni nom connu) — sinon on
  // skippait à tort tous les jobs US dont addressRegion était en toutes lettres.
  if (rawRegion && !normalizedRegion) {
    return false;
  }

  for (const marker of NON_US_MARKERS) {
    const re = new RegExp(`\\b${marker}\\b`, 'i');
    if (re.test(location)) return false;
  }

  if (normalizedRegion) return true;

  if (/\bunited states\b|\bu\.?s\.?a?\.?\b/i.test(location)) return true;

  if (allowBareRemote && /^remote$/i.test(location.trim())) return true;

  const abbrevMatch = location.match(/,\s*([a-z]{2})\s*$/i);
  if (abbrevMatch && US_STATE_CODES.has(abbrevMatch[1].toUpperCase())) return true;

  return false;
}