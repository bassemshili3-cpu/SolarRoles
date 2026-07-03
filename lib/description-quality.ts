// lib/description-quality.ts

/**
 * Détecte les descriptions manifestement tronquées côté source
 * (ex: coupure mi-phrase avec "...", début abrupt, fin sans ponctuation)
 */
export function isDescriptionTruncated(description: string): boolean {
  if (!description) return true

  const trimmed = description.trim()

  // Commence par "..." → extrait coupé en début
  if (/^\.{3,}/.test(trimmed)) return true

  // "..." collé à un mot sans espace/ponctuation avant, suivi de minuscule
  // → coupure artificielle mi-phrase (ex: "membership... most engaging")
  if (/\w\.{3,}\s*[a-z]/.test(trimmed)) return true

  // Se termine sans ponctuation finale ET texte court → probable coupure
  const endsProperly = /[.!?"')\]]$/.test(trimmed)
  if (!endsProperly && trimmed.length < 400) return true

  return false
}