import { CERTIFICATIONS, CertificationEntry } from '@/app/certifications/[slug]/certifications-data'

// ---------------------------------------------------------------------------
// PARTIE 1 — Détection dynamique (job detail page)
// ---------------------------------------------------------------------------
// Mots-clés de détection, du plus specifique au plus generique pour chaque
// certification. L'ordre du tableau CERTIFICATIONS fait foi en cas de
// mention multiple (NABCEP Installer avant NABCEP Associate, etc.).
const DETECTION_KEYWORDS: Record<string, string[]> = {
  'nabcep-pv-installation-professional': [
    'nabcep pv installation professional',
    'nabcep installation professional',
    'nabcep pv installer',
    'nabcep installer',
    'pv installation professional',
  ],
  'nabcep-pv-associate': [
    'nabcep pv associate',
    'nabcep associate',
    'pv associate',
  ],
  'osha-30': ['osha 30', 'osha-30', 'osha 30-hour', 'osha thirty'],
  'osha-10': ['osha 10', 'osha-10', 'osha 10-hour', 'osha ten'],
}

/**
 * Retourne toutes les certifications mentionnées dans un texte (titre +
 * description d'offre), dans l'ordre de priorité defini ci-dessus.
 * Le composant appelant choisit generalement juste la premiere.
 *
 * Usage : job detail page, où on a un texte d'offre unique et imprévisible
 * à scanner.
 */
export function detectCertifications(text: string): CertificationEntry[] {
  const haystack = text.toLowerCase()
  const matches: CertificationEntry[] = []

  for (const cert of CERTIFICATIONS) {
    const keywords = DETECTION_KEYWORDS[cert.slug] || []
    if (keywords.some(kw => haystack.includes(kw))) {
      matches.push(cert)
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// PARTIE 2 — Mapping statique par catégorie (landing pages)
// ---------------------------------------------------------------------------
// Contrairement à la job detail page, une landing page n'a pas de texte
// d'offre unique à scanner — elle représente une famille de rôle entière.
// L'association certification <-> catégorie est donc éditoriale plutôt que
// détectée : on sait à l'avance quelle certif est pertinente pour quelle
// famille de poste (cf. solar-taxonomy.ts / SolarRoleFamily).
//
// La clé DOIT correspondre au slug de la landing page (categorySlug).
// Ordre du tableau = ordre d'affichage si plusieurs bannières sont montrées.
const CATEGORY_CERT_MAP: Record<string, string[]> = {
  'solar-pv-installer': ['nabcep-pv-associate', 'osha-10'],
  'lead-installer': ['nabcep-pv-installation-professional', 'osha-30'],

  // Catégories à activer au fur et à mesure qu'elles sont ajoutées au site
  // (cf. discussion sur solar-taxonomy.ts) :
  // 'solar-om-technician': ['osha-10', 'nabcep-pv-installation-professional'],
  // 'solar-site-supervisor': ['osha-30', 'nabcep-pv-installation-professional'],
  // 'solar-electrician': ['nabcep-pv-installation-professional'],
  // 'solar-commissioning-technician': ['nabcep-pv-installation-professional'],
  // 'battery-storage-installer': ['nabcep-pv-installation-professional', 'osha-10'],
  // 'solar-qa-qc-inspector': ['nabcep-pv-installation-professional'],
}

/**
 * Retourne les certifications à afficher pour une landing page de
 * catégorie donnée, dans l'ordre défini par CATEGORY_CERT_MAP.
 * Renvoie un tableau vide (pas d'erreur) si la catégorie n'a pas encore
 * de mapping — la bannière ne s'affiche simplement pas.
 */
export function getCertificationsForCategory(categorySlug: string): CertificationEntry[] {
  const slugs = CATEGORY_CERT_MAP[categorySlug] || []
  return slugs
    .map(slug => CERTIFICATIONS.find(c => c.slug === slug))
    .filter((c): c is CertificationEntry => Boolean(c))
}

/**
 * Raccourci pour <CertificationBanner cert={...} /> qui n'accepte qu'une
 * seule certification à la fois. Renvoie la première entrée du mapping de
 * la catégorie (celle listée en premier dans CATEGORY_CERT_MAP), ou
 * `undefined` si la catégorie n'a pas de mapping — le composant appelant
 * doit alors simplement ne pas rendre la bannière.
 */
export function getPrimaryCertificationForCategory(categorySlug: string): CertificationEntry | undefined {
  return getCertificationsForCategory(categorySlug)[0]
}