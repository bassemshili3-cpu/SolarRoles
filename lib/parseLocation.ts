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

  // Remote sans lieu précis, mais qualifié US explicitement par l'appelant
  // (ex: "Remote, US", "Remote - USA"). On exige la mention US en plus de
  // "remote" — jamais déduire US d'un simple "Remote" tout seul, ça
  // gober silencieusement des postes remote d'un tenant international.
  if (/\bremote\b/i.test(lower) && /\b(us|usa|u\.s\.)\b/i.test(lower)) {
    return REMOTE_US;
  }

  return undefined;
}