// lib/companyDomain.ts

/**
 * Best-effort domain guess from company name.
 * "Google LLC" → "google.com"
 * "Boulder Valley School District" → "bouldervalleyschooldistrict.com"
 * Note: this is a guess. May not resolve to a real site.
 */
export function guessDomainFromName(companyName: string | undefined | null): string | null {
  if (!companyName) return null

  const cleaned = companyName
    .toLowerCase()
    .replace(/\b(llc|inc|incorporated|ltd|limited|corp|corporation|co|company|gmbh|sa|srl|bv|nv|plc|group|holdings|partners|associates)\b\.?/gi, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim()

  return cleaned ? `${cleaned}.com` : null
}