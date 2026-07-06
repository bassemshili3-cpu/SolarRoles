// lib/description-quality.ts

/**
 * Détecte les descriptions manifestement tronquées côté source
 * (ex: coupure mi-phrase avec "...", "[...]", début abrupt, fin sans ponctuation)
 */
export function isDescriptionTruncated(description: string): boolean {
  if (!description) return true

  const trimmed = description.trim()

  // Commence par "..." ou "…" → extrait coupé en début
  if (/^(?:\.{3,}|…)/.test(trimmed)) return true

  // Marqueur de troncature explicite entre crochets/parenthèses,
  // ex: "[...]", "[…]", "(...)" — souvent inséré par les agrégateurs
  // pour signaler un extrait coupé, peu importe où il apparaît dans le texte
  if (/[\[\(]\s*(?:\.{3,}|…)\s*[\]\)]/.test(trimmed)) return true

  // "..."/"…" précédé d'un mot — collé OU séparé par un espace —
  // suivi d'une minuscule → coupure artificielle mi-phrase
  // (ex: "membership...most engaging" OU "membership ... most engaging")
  if (/\S\s*(?:\.{3,}|…)\s*[a-z]/.test(trimmed)) return true

  // Se termine par "..." ou "…" → coupure en fin de texte
  // (avant l'ancien check, un "." final validait déjà le texte comme
  // "propre" et masquait ce cas — donc on le teste explicitement ici)
  if (/(?:\.{3,}|…)\s*$/.test(trimmed)) return true

  // Se termine sans ponctuation finale ET texte court → probable coupure
  const endsProperly = /[.!?"')\]]$/.test(trimmed)
  if (!endsProperly && trimmed.length < 400) return true

  return false
}