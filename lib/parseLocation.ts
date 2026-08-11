// lib/parseLocation.ts
import { STATE_CODE_TO_NAME } from '@/lib/usStates';

const STATE_NAME_TO_CODE = Object.fromEntries(
  Object.entries(STATE_CODE_TO_NAME).map(([code, name]) => [name.toLowerCase(), code]),
);

// Sentinel renvoyé pour un poste remote sans ville/état précis mais
// explicitement qualifié US par l'appelant (voir plus bas). Ce n'est PAS
// un vrai code d'état — le code appelant qui consomme extractStateFromLocation
// (ex: le check "isUSJob") doit le traiter comme un cas valide à part,
// pas chercher STATE_CODE_TO_NAME[addressRegion] dessus.
export const REMOTE_US = 'REMOTE_US';

export function extractStateFromLocation(location: string): string | undefined {
  if (!location) return undefined;

  const codeMatch = location.match(/,\s*([A-Z]{2})\b/);
  if (codeMatch && STATE_CODE_TO_NAME[codeMatch[1]]) {
    return codeMatch[1];
  }

  // Nom complet d'état : on ne matche que comme segment isolé après la
  // dernière virgule, ou en fin de chaîne — jamais en sous-chaîne libre,
  // qui accroche à tort des villes comme "Kansas City" (Missouri) ou
  // "Georgia" (Vermont).
  const lastSegment = location.split(',').pop()?.trim().toLowerCase() ?? '';
  if (STATE_NAME_TO_CODE[lastSegment]) {
    return STATE_NAME_TO_CODE[lastSegment];
  }
  // fallback : chaîne entière si pas de virgule (ex: "- Texas" déjà extrait
  // par extractLocationFromTitle, sans aucune virgule à découper)
  const wholeLower = location.trim().toLowerCase();
  if (STATE_NAME_TO_CODE[wholeLower]) {
    return STATE_NAME_TO_CODE[wholeLower];
  }

  if (/\bremote\b/i.test(location) && /\b(us|usa|u\.s\.)\b/i.test(location)) {
    return REMOTE_US;
  }

  return undefined;
}