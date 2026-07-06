// lib/buildBreadcrumbSchema.ts
// ─── Génère le fil d'Ariane pour les pages de détail job ────────────────────
// Home > Jobs > [État] > [Métier] > Titre du poste
// Les segments État/Métier sont optionnels selon les données disponibles
// pour ce job précis — le schema et l'UI restent valides dans tous les cas.

const BASE_URL = 'https://www.oh-my-job.com'

export type BreadcrumbSegment = {
  name: string
  url?: string // pas d'URL pour le dernier élément (page courante)
}

export function buildBreadcrumbSegments(params: {
  jobTitle: string
  stateName: string | null
  stateSlug: string | null
  roleLabel: string | null
  roleSlug: string | null // slug /data/salaries/[slug], null si pas de rapport dédié
}): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [
    { name: 'Home', url: BASE_URL },
    { name: 'Jobs', url: `${BASE_URL}/jobs` },
  ]

  if (params.stateName && params.stateSlug) {
    segments.push({
      name: params.stateName,
      url: `${BASE_URL}/data/states/${params.stateSlug}`,
    })
  }

  if (params.roleLabel && params.roleSlug) {
    segments.push({
      name: params.roleLabel,
      url: `${BASE_URL}/data/salaries/${params.roleSlug}`,
    })
  }

  // Dernier élément : la page courante, sans URL (recommandation Google)
  segments.push({ name: params.jobTitle })

  return segments
}

export function buildBreadcrumbSchema(segments: BreadcrumbSegment[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((seg, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: seg.name,
      ...(seg.url ? { item: seg.url } : {}),
    })),
  }
}