// lib/ats/geo.ts

const US_STATE_CODES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]);

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
  const region = (job.addressRegion || '').toUpperCase();

  if (region && !US_STATE_CODES.has(region)) {
    return false;
  }

  for (const marker of NON_US_MARKERS) {
    const re = new RegExp(`\\b${marker}\\b`, 'i');
    if (re.test(location)) return false;
  }

  if (region && US_STATE_CODES.has(region)) return true;

  if (/\bunited states\b|\bu\.?s\.?a?\.?\b/i.test(location)) return true;

  if (allowBareRemote && /^remote$/i.test(location.trim())) return true;

  const abbrevMatch = location.match(/,\s*([a-z]{2})\s*$/i);
  if (abbrevMatch && US_STATE_CODES.has(abbrevMatch[1].toUpperCase())) return true;

  return false;
}