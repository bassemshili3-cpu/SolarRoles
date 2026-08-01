// lib/roleCategories.ts
// Catégories canoniques de métiers SOLAIRES, utilisées à la fois pour
// /data/salaries/[title] et pour matcher le titre libre d'un job à une
// catégorie exploitable en stats sur Solar Roles.
//
// Deux façons de définir les mots-clés d'une catégorie :
//
// 1. `keywords: string[]` — tous ces mots doivent apparaître dans le titre (logique ET).
//    Utile pour les intitulés composés comme "Marketing Manager" = ['marketing', 'manager'].
//
// 2. `keywordGroups: string[][]` — chaque sous-tableau est un groupe ET, et la catégorie
//    matche si AU MOINS UN groupe est entièrement présent (logique OU entre groupes).
//    Utile pour les synonymes/abréviations d'un même métier, ex: PV Installer / Solar
//    Panel Installer / Photovoltaic Installer sont le même poste sous des libellés
//    différents selon l'employeur.
//
// Si les deux champs sont présents, `keywordGroups` est prioritaire.
// La liste est parcourue dans l'ordre : mets les catégories les plus spécifiques en
// premier — ex: "Solar Electrician" et "Lead Installer / Foreman" doivent être
// évalués AVANT le catch-all générique "PV Installer", sinon un "Lead Solar
// Installer" tomberait dans la catégorie générique au lieu de sa catégorie propre.
//
// ⚠️ Cette liste doit être synchronisée avec SLUG_TO_TITLE dans
// app/data/salaries/[title]/page.tsx. Chaque slug qui a une vraie page là-bas doit
// avoir : (1) une entrée ici pour le matching, et (2) une entrée dans
// KNOWN_SALARY_REPORT_SLUGS plus bas pour que le lien SEO s'affiche.
// KNOWN_SALARY_REPORT_SLUGS ci-dessous est un point de départ, PAS une liste
// vérifiée contre tes pages réelles — à confirmer avant mise en prod.
//
// Rappel de scope (cohérent avec lib/ats/oh-my-job-taxonomy.ts) : on reste sur
// des rôles de terrain (installation, électricité, O&M, stockage, ventes
// techniques liées à NABCEP). Les rôles de bureau purs (Project Manager solaire,
// Permitting Specialist...) sont volontairement absents pour l'instant.

export type RoleCategory = {
  slug: string
  label: string
  keywords?: string[]
  keywordGroups?: string[][]
  // Si true, matchRoleCategory() peut matcher cette catégorie sur le texte de la
  // description (en plus du titre) quand le titre seul ne suffit pas. À réserver
  // aux catégories dont les mots-clés sont assez spécifiques pour ne pas générer
  // de faux positifs sur un long texte libre. Aucune catégorie solaire ci-dessous
  // n'active ce flag pour l'instant : même "solar installer" peut apparaître de
  // façon incidente dans une description sans rapport (ex: "notre bureau
  // fonctionne à l'énergie solaire"), donc on reste prudent et on matche sur le
  // titre uniquement.
  matchInDescription?: boolean
}

export const ROLE_CATEGORIES: RoleCategory[] = [
  // ── entrée de métier ──
  { slug: 'solar-apprentice', label: 'Solar Apprentice', keywords: ['solar apprentice'] },

  // ── encadrement terrain (avant le catch-all générique) ──
  {
    slug: 'lead-installer-foreman',
    label: 'Lead Installer / Foreman',
    keywordGroups: [
      ['lead solar installer'],
      ['solar installation lead'],
      ['solar foreman'],
      ['solar crew lead'],
      ['solar install lead'],
    ],
  },
  {
    slug: 'solar-site-supervisor',
    label: 'Solar Site Supervisor',
    keywordGroups: [
      ['solar site supervisor'],
      ['solar site superintendent'],
      ['solar superintendent'],
      ['solar field supervisor'],
    ],
  },

  // ── électricien (licence requise, distinct de l'installateur généraliste) ──
  {
    slug: 'solar-electrician',
    label: 'Solar Electrician',
    keywordGroups: [
      ['solar electrician'],
      ['pv electrician'],
      ['solar wireman'],
    ],
  },

  // ── O&M / service après installation ──
  {
    slug: 'om-technician',
    label: 'O&M Technician',
    keywordGroups: [
      ['solar o&m technician'],
      ['solar om technician'],
      ['pv o&m technician'],
      ['solar operations and maintenance technician'],
      ['solar maintenance technician'],
      ['solar service technician'],
      ['solar repair technician'],
      ['solar troubleshooting technician'],
    ],
  },
  {
    slug: 'solar-field-service-technician',
    label: 'Solar Field Service Technician',
    keywordGroups: [
      ['solar field service technician'],
      ['pv field service technician'],
      ['solar field service engineer'],
    ],
  },
  {
    slug: 'inverter-technician',
    label: 'Solar Inverter Technician',
    keywordGroups: [
      ['solar inverter technician'],
      ['pv inverter technician'],
      ['string inverter technician'],
    ],
  },

  // ── commissioning / QA-QC ──
  {
    slug: 'commissioning-technician',
    label: 'Commissioning Technician',
    keywordGroups: [
      ['solar commissioning technician'],
      ['pv commissioning technician'],
      ['commissioning technician', 'solar'],
      ['commissioning and startup technician', 'solar'],
    ],
  },
  {
    slug: 'solar-qa-qc-inspector',
    label: 'Solar QA/QC Inspector',
    keywordGroups: [
      ['solar qa/qc inspector'],
      ['solar qa qc inspector'],
      ['pv system inspector'],
      ['solar quality inspector'],
      ['solar qc inspector'],
      ['nabcep pv system inspector'],
    ],
  },

  // ── stockage / batterie ──
  {
    slug: 'energy-storage-installer',
    label: 'Energy Storage Installer',
    keywordGroups: [
      ['battery storage installer'],
      ['energy storage installer'],
      ['ess installer'],
      ['solar battery installer'],
    ],
  },

  // ── construction ground-mount / utility-scale ──
  {
    slug: 'racking-tracker-technician',
    label: 'Solar Racking & Tracker Technician',
    keywordGroups: [
      ['solar racking technician'],
      ['solar tracker technician'],
      ['solar tracker installer'],
      ['single-axis tracker technician'],
      ['single axis tracker technician'],
    ],
  },

  // ── thermique (crédential NABCEP distinct du PV) ──
  {
    slug: 'solar-thermal-installer',
    label: 'Solar Thermal Installer',
    keywordGroups: [
      ['solar thermal installer'],
      ['solar hot water installer'],
      ['solar water heater installer'],
    ],
  },

  // ── ventes techniques (carve-out volontairement étroit, cf. NABCEP PV
  // Technical Sales — pas de vente générique/porte-à-porte ici) ──
  {
    slug: 'solar-technical-sales',
    label: 'Solar Technical Sales',
    keywordGroups: [
      ['solar technical sales'],
      ['pv technical sales'],
      ['solar sales engineer'],
      ['solar design and sales'],
    ],
  },

  // ── catch-all générique — DOIT rester en dernier ──
  // Toute catégorie ci-dessus plus spécifique doit avoir la priorité ; celle-ci
  // absorbe tout ce qui reste ("PV Installer", "Solar Panel Installer",
  // "Photovoltaic Installer", "Installer II" côté solaire, etc.).
  {
    slug: 'pv-installer',
    label: 'PV Installer',
    keywordGroups: [
      ['pv installer'],
      ['solar panel installer'],
      ['solar installer'],
      ['photovoltaic installer'],
      ['rooftop solar installer'],
      ['residential solar installer'],
      ['commercial solar installer'],
      ['module installer'],
      ['array installer'],
      ['bos installer'],
      ['balance of system installer'],
    ],
  },
]

// Slugs pour lesquels /data/salaries/[title] existe vraiment aujourd'hui.
// ⚠️ PLACEHOLDER — cette liste reprend simplement tous les slugs déclarés
// ci-dessus. Elle n'a PAS été vérifiée contre tes pages réelles dans
// app/data/salaries/[title]/page.tsx. Retire tout slug qui n'a pas encore de
// page correspondante avant de merger, sinon le lien SEO "Learn more" pointera
// vers une page 404.
export const KNOWN_SALARY_REPORT_SLUGS = new Set([
  'solar-apprentice', 'Solar Apprentice',
  'lead-installer-foreman', 'Lead Installer / Foreman',
  'solar-site-supervisor', 'Solar Site Supervisor',
  'solar-electrician', 'Solar Electrician',
  'om-technician', 'O&M Technician',
  'solar-field-service-technician', 'Solar Field Service Technician',
  'inverter-technician', 'Solar Inverter Technician',
  'commissioning-technician', 'Commissioning Technician',
  'solar-qa-qc-inspector', 'Solar QA/QC Inspector',
  'energy-storage-installer', 'Energy Storage Installer',
  'racking-tracker-technician', 'Solar Racking & Tracker Technician',
  'solar-thermal-installer', 'Solar Thermal Installer',
  'solar-technical-sales', 'Solar Technical Sales',
  'pv-installer', 'PV Installer',
])

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Recherche par mot entier (\b) plutôt que simple .includes(), pour éviter les faux
// positifs sur les acronymes courts et sur les phrases qui seraient un préfixe d'un
// mot plus long (ex: "solar installer" ne doit pas matcher "solar installation
// company" de façon incidente sur le seul mot "install").
function containsWholeWordPhrase(haystack: string, phrase: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'i')
  return pattern.test(haystack)
}

function categoryMatches(category: RoleCategory, haystack: string): boolean {
  if (category.keywordGroups) {
    return category.keywordGroups.some((group) =>
      group.every((kw) => containsWholeWordPhrase(haystack, kw))
    )
  }
  if (category.keywords) {
    return category.keywords.every((kw) => containsWholeWordPhrase(haystack, kw))
  }
  return false
}

// `description` est optionnel : les appelants qui n'ont qu'un titre libre (ex: les
// pages /data/salaries/[title]) continuent de fonctionner à l'identique.
// Passe 1 : titre seul, sur TOUTES les catégories (comportement principal, le plus
// fiable — un titre est court et ciblé, peu de risque de faux positif).
// Passe 2 : titre + description, mais UNIQUEMENT sur les catégories qui ont
// explicitement `matchInDescription: true` — aucune pour l'instant côté solaire,
// voir le commentaire sur le champ plus haut.
export function matchRoleCategory(title: string, description?: string): RoleCategory | null {
  const lowerTitle = title.toLowerCase()

  for (const category of ROLE_CATEGORIES) {
    if (categoryMatches(category, lowerTitle)) return category
  }

  if (description) {
    const combined = `${title} ${description}`.toLowerCase()
    for (const category of ROLE_CATEGORIES) {
      if (category.matchInDescription && categoryMatches(category, combined)) {
        return category
      }
    }
  }

  return null
}

// Aplatit `keywords` / `keywordGroups` en une liste unique de mots-clés, dédupliquée.
// Destiné aux consommateurs externes (stats par état, jobs similaires...) qui veulent
// simplement "tous les mots-clés pertinents pour cette catégorie" sans se soucier
// de la logique groupes ET/OU utilisée pour le matching dans matchRoleCategory.
export function getRoleKeywords(category: RoleCategory): string[] {
  if (category.keywordGroups) {
    return Array.from(new Set(category.keywordGroups.flat()))
  }
  return category.keywords ?? []
}