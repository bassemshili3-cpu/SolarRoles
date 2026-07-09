// lib/roleCategories.ts
// Catégories canoniques de métiers, utilisées à la fois pour /data/salaries/[title]
// et pour matcher le titre libre d'un job à une catégorie exploitable en stats.
//
// Deux façons de définir les mots-clés d'une catégorie :
//
// 1. `keywords: string[]` — tous ces mots doivent apparaître dans le titre (logique ET).
//    Utile pour les intitulés composés comme "Marketing Manager" = ['marketing', 'manager'].
//
// 2. `keywordGroups: string[][]` — chaque sous-tableau est un groupe ET, et la catégorie
//    matche si AU MOINS UN groupe est entièrement présent (logique OU entre groupes).
//    Utile pour les synonymes/abréviations d'un même métier, ex: CNA / Certified Nursing
//    Assistant / Patient Care Assistant sont le même poste sous des libellés différents.
//
// Si les deux champs sont présents, `keywordGroups` est prioritaire.
// La liste est parcourue dans l'ordre : mets les catégories les plus spécifiques en premier.

export type RoleCategory = {
  slug: string
  label: string
  keywords?: string[]
  keywordGroups?: string[][]
}

export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    slug: 'certified-nursing-assistant',
    label: 'Certified Nursing Assistant',
    keywordGroups: [
      ['certified nursing assistant'],
      ['cna'],
      ['nursing assistant'],
      ['patient care assistant'],
      ['nurse aide'],
      ['nursing aide'],
      ['pca'],
    ],
  },
  { slug: 'registered-nurse',    label: 'Registered Nurse',    keywords: ['registered nurse'] },
  { slug: 'software-engineer',   label: 'Software Engineer',   keywords: ['software engineer'] },
  { slug: 'data-analyst',        label: 'Data Analyst',        keywords: ['data analyst'] },
  { slug: 'project-manager',     label: 'Project Manager',     keywords: ['project manager'] },
  { slug: 'dental-assistant',    label: 'Dental Assistant',    keywords: ['dental assistant'] },
  { slug: 'electrician',         label: 'Electrician',         keywords: ['electrician'] },
  { slug: 'medical-assistant',   label: 'Medical Assistant',   keywords: ['medical assistant'] },
  { slug: 'truck-driver',        label: 'Truck Driver',        keywords: ['truck driver'] },
  { slug: 'accountant',          label: 'Accountant',          keywords: ['accountant'] },
  { slug: 'customer-service',    label: 'Customer Service',    keywords: ['customer service'] },
  { slug: 'sales-associate',     label: 'Sales Associate',     keywords: ['sales associate'] },
  { slug: 'pharmacy-technician', label: 'Pharmacy Technician', keywords: ['pharmacy technician'] },
  { slug: 'ux-writer', label: 'UX Writer', keywords: ['ux writer'] },

  // Catégories additionnelles (pas encore de page /data/salaries/[slug] dédiée,
  // donc pas dans KNOWN_SALARY_REPORT_SLUGS ci-dessous — mais utilisables pour
  // le bloc de stats, qui ne dépend que du lien vers /data/states/[state]).
  { slug: 'social-media-manager', label: 'Social Media Manager', keywords: ['social media', 'manager'] },
  { slug: 'marketing-manager',    label: 'Marketing Manager',    keywords: ['marketing', 'manager'] },
  { slug: 'warehouse-associate',  label: 'Warehouse Associate',  keywords: ['warehouse'] },
]

// Slugs pour lesquels /data/salaries/[title] existe vraiment aujourd'hui.
// Ajuste cette liste au fur et à mesure que tu crées de nouvelles pages de rapport.
// NB: 'certified-nursing-assistant' n'y figure pas encore — ajoute-le ici une fois
// que /data/salaries/certified-nursing-assistant existe, sinon le lien du bloc SEO
// ne s'affichera pas pour ce métier (comportement voulu par KNOWN_SALARY_REPORT_SLUGS).
export const KNOWN_SALARY_REPORT_SLUGS = new Set([
  'registered-nurse', 'Registered Nurse',
  'software-engineer', 'Software Engineer',
  'data-analyst', 'Data Analyst',
  'project-manager', 'Project Manager',
  'dental-assistant', 'Dental Assistant',
  'electrician', 'Electrician',
  'medical-assistant', 'Medical Assistant',
  'truck-driver', 'Truck Driver',
  'accountant', 'Accountant',
  'customer-service', 'Customer Service',
  'sales-associate', 'Sales Associate',
  'pharmacy-technician', 'Pharmacy Technician',
])

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Recherche par mot entier (\b) plutôt que simple .includes(), pour éviter les faux
// positifs sur les acronymes courts (ex: "pca" ne doit pas matcher à l'intérieur
// d'un autre mot) et sur les phrases qui seraient un prefixe d'un mot plus long
// (ex: "software engineer" ne doit pas matcher "software engineering").
function containsWholeWordPhrase(haystack: string, phrase: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'i')
  return pattern.test(haystack)
}

export function matchRoleCategory(title: string): RoleCategory | null {
  const lower = title.toLowerCase()

  for (const category of ROLE_CATEGORIES) {
    if (category.keywordGroups) {
      const matches = category.keywordGroups.some((group) =>
        group.every((kw) => containsWholeWordPhrase(lower, kw))
      )
      if (matches) return category
      continue
    }

    if (category.keywords && category.keywords.every((kw) => containsWholeWordPhrase(lower, kw))) {
      return category
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