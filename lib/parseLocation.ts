// lib/parseLocation.ts
import { STATE_CODE_TO_NAME } from '@/lib/usStates';

const STATE_NAME_TO_CODE = Object.fromEntries(
  Object.entries(STATE_CODE_TO_NAME).map(([code, name]) => [name.toLowerCase(), code]),
);

/**
 * Extrait le code d'état US (ex: "TX") depuis une chaîne de localisation
 * libre type "Austin, TX", "Remote - Texas", "San Antonio, Texas, US".
 * Retourne undefined si aucun état n'est détecté (ex: "Remote", "UK").
 */
export function extractStateFromLocation(location: string): string | undefined {
  if (!location) return undefined;

  // Cas "Ville, XX" — code à 2 lettres
  const codeMatch = location.match(/,\s*([A-Z]{2})\b/);
  if (codeMatch && STATE_CODE_TO_NAME[codeMatch[1]]) {
    return codeMatch[1];
  }

  // Cas nom complet d'état ("Texas", "California"...)
  const lower = location.toLowerCase();
  for (const [name, code] of Object.entries(STATE_NAME_TO_CODE)) {
    if (lower.includes(name)) return code;
  }

  return undefined;
}