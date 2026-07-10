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
//
// ⚠️ Cette liste est synchronisée avec SLUG_TO_TITLE dans app/data/salaries/[title]/page.tsx.
// Chaque slug qui a une vraie page là-bas doit avoir : (1) une entrée ici pour le matching,
// et (2) une entrée dans KNOWN_SALARY_REPORT_SLUGS plus bas pour que le lien SEO s'affiche.

export type RoleCategory = {
  slug: string
  label: string
  keywords?: string[]
  keywordGroups?: string[][]
}

export const ROLE_CATEGORIES: RoleCategory[] = [
  // ── santé : nursing (CNA séparé de "Nursing Assistant", qui a sa propre page) ──
  {
    slug: 'certified-nursing-assistant',
    label: 'Certified Nursing Assistant',
    keywordGroups: [
      ['certified nursing assistant'],
      ['cna'],
      // NB: 'nursing assistant' retiré volontairement de ce groupe : ce libellé a
      // maintenant sa propre page (slug 'nursing-assistant'), donc son synonyme ne
      // doit plus être aspiré ici, sinon il ne matchera jamais sa propre catégorie.
      ['patient care assistant'],
      ['nurse aide'],
      ['nursing aide'],
      ['pca'],
    ],
  },
  { slug: 'nursing-assistant', label: 'Nursing Assistant', keywords: ['nursing assistant'] },
  { slug: 'registered-nurse',  label: 'Registered Nurse',  keywords: ['registered nurse'] },

  { slug: 'software-engineer', label: 'Software Engineer', keywords: ['software engineer'] },
  { slug: 'data-analyst',      label: 'Data Analyst',      keywords: ['data analyst'] },
  { slug: 'project-manager',   label: 'Project Manager',   keywords: ['project manager'] },
  { slug: 'dental-assistant',  label: 'Dental Assistant',  keywords: ['dental assistant'] },
  { slug: 'electrician',       label: 'Electrician',       keywords: ['electrician'] },
  { slug: 'medical-assistant', label: 'Medical Assistant', keywords: ['medical assistant'] },
  { slug: 'truck-driver',      label: 'Truck Driver',      keywords: ['truck driver'] },
  { slug: 'accountant',        label: 'Accountant',        keywords: ['accountant'] },
  { slug: 'customer-service',  label: 'Customer Service',  keywords: ['customer service'] },
  { slug: 'sales-associate',   label: 'Sales Associate',   keywords: ['sales associate'] },
  { slug: 'pharmacy-technician', label: 'Pharmacy Technician', keywords: ['pharmacy technician'] },
  { slug: 'ux-writer', label: 'UX Writer', keywords: ['ux writer'] },

  // ── tech ──
  { slug: 'data-scientist',   label: 'Data Scientist',   keywords: ['data scientist'] },
  { slug: 'devops-engineer',  label: 'DevOps Engineer',  keywords: ['devops engineer'] },
  { slug: 'product-manager',  label: 'Product Manager',  keywords: ['product manager'] },
  { slug: 'ux-designer',      label: 'UX Designer',      keywords: ['ux designer'] },
  { slug: 'it-support',       label: 'IT Support',       keywords: ['it support'] },
  { slug: 'cybersecurity',    label: 'Cybersecurity',    keywords: ['cybersecurity'] },
  { slug: 'cloud-engineer',   label: 'Cloud Engineer',   keywords: ['cloud engineer'] },

  // ── santé (autres) ──
  { slug: 'physical-therapist',      label: 'Physical Therapist',      keywords: ['physical therapist'] },
  { slug: 'home-health-aide',        label: 'Home Health Aide',        keywords: ['home health aide'] },
  { slug: 'medical-receptionist',    label: 'Medical Receptionist',    keywords: ['medical receptionist'] },
  { slug: 'mental-health-counselor', label: 'Mental Health Counselor', keywords: ['mental health counselor'] },
  { slug: 'radiologic-technologist', label: 'Radiologic Technologist', keywords: ['radiologic technologist'] },
  { slug: 'patient-care-technician', label: 'Patient Care Technician', keywords: ['patient care technician'] },
  { slug: 'patient-transporter',     label: 'Patient Transporter',     keywords: ['patient transporter'] },
  { slug: 'pediatric-nurse-practitioner', label: 'Pediatric Nurse Practitioner', keywords: ['pediatric nurse practitioner'] },
  { slug: 'new-grad-nurse',          label: 'New Grad Nurse',          keywords: ['new grad nurse'] },
  {
    slug: 'labor-and-delivery-nurse',
    label: 'Labor and Delivery Nurse',
    keywordGroups: [
      ['labor and delivery nurse'],
      ['labor & delivery nurse'],
      ['l&d nurse'],
    ],
  },
  { slug: 'school-nurse',            label: 'School Nurse',            keywords: ['school nurse'] },
  { slug: 'respiratory-therapist',   label: 'Respiratory Therapist',   keywords: ['respiratory therapist'] },
  {
    slug: 'surgical-tech',
    label: 'Surgical Tech',
    keywordGroups: [
      ['surgical tech'],
      ['surgical technologist'],
      ['surgical technician'],
    ],
  },
  {
    slug: 'sterile-processing-technician',
    label: 'Sterile Processing Technician',
    keywordGroups: [
      ['sterile processing technician'],
      ['sterile processing tech'],
    ],
  },
  {
    slug: 'emt',
    label: 'EMT',
    keywordGroups: [
      ['emt'],
      ['emergency medical technician'],
    ],
  },
  {
    slug: 'ekg-technician',
    label: 'EKG Technician',
    keywordGroups: [
      ['ekg technician'],
      ['ekg tech'],
      ['ecg technician'],
    ],
  },
  {
    slug: 'speech-language-pathologist',
    label: 'Speech-Language Pathologist',
    keywordGroups: [
      ['speech-language pathologist'],
      ['speech language pathologist'],
      ['slp'],
    ],
  },
  {
    slug: 'assisted-reproductive-technology',
    label: 'Assisted Reproductive Technology',
    // NB: pas d'abréviation "art" ajoutée ici, ça collisionnerait massivement
    // avec 'art-teacher' et tout titre contenant le mot "art".
    keywords: ['assisted reproductive technology'],
  },

  // ── éducation / petite enfance ──
  { slug: 'art-teacher',              label: 'Art Teacher',              keywords: ['art teacher'] },
  { slug: 'substitute-teacher',       label: 'Substitute Teacher',       keywords: ['substitute teacher'] },
  { slug: 'special-education-teacher', label: 'Special Education Teacher', keywords: ['special education teacher'] },
  { slug: 'social-studies-teacher',   label: 'Social Studies Teacher',   keywords: ['social studies teacher'] },
  { slug: 'paraprofessional',         label: 'Paraprofessional',         keywords: ['paraprofessional'] },
  { slug: 'summer-camp-counselor',    label: 'Summer Camp Counselor',    keywords: ['summer camp counselor'] },
  { slug: 'school-counselor',         label: 'School Counselor',         keywords: ['school counselor'] },
  { slug: 'tutor',                    label: 'Tutor',                    keywords: ['tutor'] },
  { slug: 'preschool-teacher',        label: 'Preschool Teacher',        keywords: ['preschool teacher'] },
  { slug: 'childcare',                label: 'Childcare',                keywords: ['childcare'] },
  { slug: 'daycare',                  label: 'Daycare',                  keywords: ['daycare'] },
  { slug: 'nanny',                    label: 'Nanny',                    keywords: ['nanny'] },

  // ── métiers manuels / terrain ──
  { slug: 'plumber',              label: 'Plumber',              keywords: ['plumber'] },
  { slug: 'carpenter',            label: 'Carpenter',            keywords: ['carpenter'] },
  { slug: 'welder',               label: 'Welder',               keywords: ['welder'] },
  {
    slug: 'auto-mechanic',
    label: 'Auto Mechanic',
    keywordGroups: [
      ['auto mechanic'],
      ['automotive mechanic'],
    ],
  },
  { slug: 'construction-worker',  label: 'Construction Worker',  keywords: ['construction worker'] },
  { slug: 'landscaper',           label: 'Landscaper',           keywords: ['landscaper'] },
  { slug: 'hvac',                 label: 'HVAC',                 keywords: ['hvac'] },
  {
    slug: 'lineman',
    label: 'Lineman',
    keywordGroups: [
      ['lineman'],
      ['lineworker'],
      ['line worker'],
    ],
  },
  { slug: 'heavy-equipment-operator', label: 'Heavy Equipment Operator', keywords: ['heavy equipment operator'] },
  { slug: 'general-labor',        label: 'General Labor',        keywords: ['general labor'] },
  { slug: 'school-bus-driver',    label: 'School Bus Driver',    keywords: ['school bus driver'] },
  {
    slug: 'fly-in-fly-out-mining',
    label: 'Fly In Fly Out Mining',
    keywordGroups: [
      ['fly in fly out mining'],
      ['fifo mining'],
    ],
  },
  {
    slug: 'fly-in-fly-out-oil-gas',
    label: 'Fly In Fly Out Oil & Gas',
    keywordGroups: [
      ['fly in fly out oil & gas'],
      ['fly in fly out oil and gas'],
      ['fifo oil & gas'],
      ['fifo oil and gas'],
    ],
  },

  // ── business / bureau ──
  { slug: 'bookkeeper',        label: 'Bookkeeper',        keywords: ['bookkeeper'] },
  { slug: 'financial-analyst', label: 'Financial Analyst', keywords: ['financial analyst'] },
  {
    slug: 'administrative-assistant',
    label: 'Administrative Assistant',
    keywordGroups: [
      ['administrative assistant'],
      ['admin assistant'],
    ],
  },
  { slug: 'executive-assistant', label: 'Executive Assistant', keywords: ['executive assistant'] },
  { slug: 'operations-manager',  label: 'Operations Manager',  keywords: ['operations', 'manager'] },
  { slug: 'office-manager',      label: 'Office Manager',      keywords: ['office', 'manager'] },
  { slug: 'business-analyst',    label: 'Business Analyst',    keywords: ['business analyst'] },
  { slug: 'case-manager',        label: 'Case Manager',        keywords: ['case', 'manager'] },

  // ── retail / service ──
  { slug: 'cashier',        label: 'Cashier',        keywords: ['cashier'] },
  { slug: 'retail-manager', label: 'Retail Manager', keywords: ['retail', 'manager'] },
  { slug: 'hostess',        label: 'Hostess',        keywords: ['hostess'] },
  { slug: 'barista',        label: 'Barista',        keywords: ['barista'] },
  { slug: 'bartender',      label: 'Bartender',      keywords: ['bartender'] },
  { slug: 'housekeeping',   label: 'Housekeeping',   keywords: ['housekeeping'] },
  { slug: 'dog-walker',     label: 'Dog Walker',     keywords: ['dog walker'] },

  // ── logistique ──
  { slug: 'warehouse-worker',      label: 'Warehouse Worker',      keywords: ['warehouse worker'] },
  { slug: 'forklift-operator',     label: 'Forklift Operator',     keywords: ['forklift operator'] },
  { slug: 'delivery-driver',       label: 'Delivery Driver',       keywords: ['delivery driver'] },
  { slug: 'shipping-clerk',        label: 'Shipping Clerk',        keywords: ['shipping clerk'] },
  { slug: 'inventory-specialist',  label: 'Inventory Specialist',  keywords: ['inventory specialist'] },
  // Pas de page dédiée pour ce slug (volontaire, cf. KNOWN_SALARY_REPORT_SLUGS),
  // mais catégorie resserrée à une phrase exacte pour ne plus avaler "Warehouse Worker".
  { slug: 'warehouse-associate',   label: 'Warehouse Associate',   keywords: ['warehouse', 'associate'] },

  // ── marketing / vente ──
  { slug: 'marketing-manager',      label: 'Marketing Manager',      keywords: ['marketing', 'manager'] },
  { slug: 'digital-marketing',      label: 'Digital Marketing',      keywords: ['digital marketing'] },
  { slug: 'content-writer',         label: 'Content Writer',         keywords: ['content writer'] },
  { slug: 'social-media-manager',   label: 'Social Media Manager',   keywords: ['social media', 'manager'] },
  { slug: 'social-media-supervisor', label: 'Social Media Supervisor', keywords: ['social media supervisor'] },
  { slug: 'account-executive',      label: 'Account Executive',      keywords: ['account executive'] },
  { slug: 'sales-representative',   label: 'Sales Representative',   keywords: ['sales representative'] },
]

// Slugs pour lesquels /data/salaries/[title] existe vraiment aujourd'hui.
// Généré à partir de SLUG_TO_TITLE dans app/data/salaries/[title]/page.tsx.
// Contient à la fois la forme kebab-case (slug) et le libellé Title Case, pour
// rester compatible avec le format déjà utilisé ailleurs dans le code.
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

  'data-scientist', 'Data Scientist',
  'devops-engineer', 'DevOps Engineer',
  'product-manager', 'Product Manager',
  'ux-designer', 'UX Designer',
  'it-support', 'IT Support',
  'cybersecurity', 'Cybersecurity',
  'cloud-engineer', 'Cloud Engineer',

  'nursing-assistant', 'Nursing Assistant',
  'physical-therapist', 'Physical Therapist',
  'home-health-aide', 'Home Health Aide',
  'medical-receptionist', 'Medical Receptionist',
  'mental-health-counselor', 'Mental Health Counselor',
  'radiologic-technologist', 'Radiologic Technologist',
  'certified-nursing-assistant', 'Certified Nursing Assistant',
  'patient-care-technician', 'Patient Care Technician',
  'patient-transporter', 'Patient Transporter',
  'pediatric-nurse-practitioner', 'Pediatric Nurse Practitioner',
  'new-grad-nurse', 'New Grad Nurse',
  'labor-and-delivery-nurse', 'Labor and Delivery Nurse',
  'school-nurse', 'School Nurse',
  'respiratory-therapist', 'Respiratory Therapist',
  'surgical-tech', 'Surgical Tech',
  'sterile-processing-technician', 'Sterile Processing Technician',
  'emt', 'EMT',
  'ekg-technician', 'EKG Technician',
  'speech-language-pathologist', 'Speech-Language Pathologist',
  'assisted-reproductive-technology', 'Assisted Reproductive Technology',

  'art-teacher', 'Art Teacher',
  'substitute-teacher', 'Substitute Teacher',
  'special-education-teacher', 'Special Education Teacher',
  'social-studies-teacher', 'Social Studies Teacher',
  'paraprofessional', 'Paraprofessional',
  'summer-camp-counselor', 'Summer Camp Counselor',
  'school-counselor', 'School Counselor',
  'tutor', 'Tutor',
  'preschool-teacher', 'Preschool Teacher',
  'childcare', 'Childcare',
  'daycare', 'Daycare',
  'nanny', 'Nanny',

  'plumber', 'Plumber',
  'carpenter', 'Carpenter',
  'welder', 'Welder',
  'auto-mechanic', 'Auto Mechanic',
  'construction-worker', 'Construction Worker',
  'landscaper', 'Landscaper',
  'hvac', 'HVAC',
  'lineman', 'Lineman',
  'heavy-equipment-operator', 'Heavy Equipment Operator',
  'general-labor', 'General Labor',
  'school-bus-driver', 'School Bus Driver',
  'fly-in-fly-out-mining', 'Fly In Fly Out Mining',
  'fly-in-fly-out-oil-gas', 'Fly In Fly Out Oil & Gas',

  'bookkeeper', 'Bookkeeper',
  'financial-analyst', 'Financial Analyst',
  'administrative-assistant', 'Administrative Assistant',
  'executive-assistant', 'Executive Assistant',
  'operations-manager', 'Operations Manager',
  'office-manager', 'Office Manager',
  'business-analyst', 'Business Analyst',
  'case-manager', 'Case Manager',

  'cashier', 'Cashier',
  'retail-manager', 'Retail Manager',
  'hostess', 'Hostess',
  'barista', 'Barista',
  'bartender', 'Bartender',
  'housekeeping', 'Housekeeping',
  'dog-walker', 'Dog Walker',

  'warehouse-worker', 'Warehouse Worker',
  'forklift-operator', 'Forklift Operator',
  'delivery-driver', 'Delivery Driver',
  'shipping-clerk', 'Shipping Clerk',
  'inventory-specialist', 'Inventory Specialist',

  'marketing-manager', 'Marketing Manager',
  'digital-marketing', 'Digital Marketing',
  'content-writer', 'Content Writer',
  'social-media-manager', 'Social Media Manager',
  'social-media-supervisor', 'Social Media Supervisor',
  'account-executive', 'Account Executive',
  'sales-representative', 'Sales Representative',
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