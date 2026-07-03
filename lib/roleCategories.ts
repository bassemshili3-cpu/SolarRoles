// lib/roleCategories.ts
// Catégories canoniques de métiers, utilisées à la fois pour /data/salaries/[title]
// et pour matcher le titre libre d'un job à une catégorie exploitable en stats.
//
// Toutes les `keywords` d'une catégorie doivent apparaître dans le titre
// (insensible à la casse). La liste est parcourue dans l'ordre : mets les
// catégories les plus spécifiques en premier.

export type RoleCategory = {
  slug: string
  label: string
  keywords: string[]
}

export const ROLE_CATEGORIES: RoleCategory[] = [
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

export function matchRoleCategory(title: string): RoleCategory | null {
  const lower = title.toLowerCase()
  for (const category of ROLE_CATEGORIES) {
    if (category.keywords.every((kw) => lower.includes(kw))) {
      return category
    }
  }
  return null
}