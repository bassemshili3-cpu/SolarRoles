// lib/teenJobPhrases.ts
//
// Titres de postes réellement utilisés par les employeurs qui embauchent des
// mineurs, groupés par palier légal FLSA. À utiliser en `whatPhrases` (pas
// `what`) sur les pages jobs-for-X-year-olds — chercher la phrase littérale
// "jobs for 14 year olds" ne matche presque aucune offre réelle.
//
// 14-15 ans : le plus restrictif. Plusieurs états interdisent la caisse, les
// équipements tranchants/chauds, et les rôles impliquant de l'argent liquide
// à cet âge — cette liste reste volontairement prudente.
//
// NB: 'tutor' volontairement absent — une offre "tutor for teenagers" cherche
// un ADULTE pour donner des cours à des ados, pas l'inverse. Le matching par
// titre seul ne peut pas distinguer les deux sens, donc mieux vaut retirer le
// terme que risquer des faux positifs massifs.
export const UNDER_16_JOB_PHRASES = [
  'crew member',
  'busser',
  'host',
  'hostess',
  'dishwasher',
  'grocery bagger',
  'bagger',
  'ice cream shop',
  'frozen yogurt',
  'movie theater',
  'concession stand',
  'stock clerk',
  'office assistant',
  'library page',
  'golf caddy',
  'pool attendant',
  'paper carrier',
  'babysitter',
  'babysitting',
  'lawn care',
]

// 16-17 ans : la plupart des restrictions sur la caisse et les équipements de
// cuisine basiques tombent — on élargit avec du retail/food service classique.
export const SIXTEEN_PLUS_JOB_PHRASES = [
  ...UNDER_16_JOB_PHRASES,
  'cashier',
  'cook',
  'kitchen team member',
  'sales associate',
  'barista',
  'warehouse associate',
  'lifeguard',
  'front desk',
  'receptionist',
  'crew trainer',
  'team member',
]

// Signaux qu'une offre est en réalité destinée à un adulte, malgré un titre
// qui matche whatPhrases (ex: "Camp Counselor — must be 18+"). À passer en
// excludePhrases sur les 3 pages jobs-for-X-year-olds.
export const TEEN_EXCLUDE_PHRASES = [
  'must be 18',
  'must be at least 18',
  '18 years of age or older',
  '18 years or older',
  'age 18',
  '18+',
  '21 years of age',
  '21 years or older',
  "driver's license required",
  'valid driver\u2019s license',
  'cdl required',
  "bachelor's degree required",
  'security clearance',
  'for teenagers',
  'for adolescents',
  'for teens',
]

// ── Mentions explicites d'âge dans la description ────────────────────────────
// Signal bien plus fiable que le titre seul : l'employeur confirme lui-même
// l'éligibilité. Un job acceptant un minimum de 14 ans convient aussi à un ado
// de 15 ou 16 ans (plus âgé = toujours éligible) — d'où la logique cumulative.

function agePhraseVariants(age: number): string[] {
  return [
    `${age} years old`,
    `${age}-year-old`,
    `${age} year old`,
    `${age} years of age`,
    `age ${age}`,
    `ages ${age}`,
    `minimum age of ${age}`,
    `must be ${age}`,
    `must be at least ${age}`,
  ]
}

// Page 14 ans : seulement les mentions explicites de "14"
export const AGE_DESCRIPTION_PHRASES_14 = agePhraseVariants(14)

// Page 15 ans : "14" ou "15" (les deux conviennent à un ado de 15 ans)
export const AGE_DESCRIPTION_PHRASES_15 = [
  ...agePhraseVariants(14),
  ...agePhraseVariants(15),
]

// Page 16 ans : "14", "15", ou "16"
export const AGE_DESCRIPTION_PHRASES_16 = [
  ...agePhraseVariants(14),
  ...agePhraseVariants(15),
  ...agePhraseVariants(16),
]