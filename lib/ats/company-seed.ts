// lib/ats/company-seed.ts
export type AtsCompanySeed = {
  slug: string;
  name: string;
  verified: boolean;
};

// Lever — jobs.lever.co/<slug>  |  api.lever.co/v0/postings/<slug>
//
// Trouvé via `site:jobs.lever.co "solar installer"` ou
// `site:jobs.lever.co "PV installer"` — un hit sur jobs.lever.co
// EST la vérification. Autres mots-clés à tester : "lead installer",
// "solar technician", "residential solar crew", "commercial solar".
export const LEVER_COMPANIES: AtsCompanySeed[] = [
  // { slug: 'exemple-solar-co', name: 'Exemple Solar Co', verified: true },
];

// Workable — apply.workable.com/<slug>/  |  <slug>.workable.com/spi/v3/jobs
//
// Moins connu des gros agrégateurs génériques, plus courant chez les PME
// solaires/trades internationales. Même technique de recherche :
// `site:apply.workable.com "solar installer"`.
export const WORKABLE_COMPANIES: AtsCompanySeed[] = [];

// Pinpoint — <slug>.pinpointhq.com/postings.json
export const PINPOINT_COMPANIES: AtsCompanySeed[] = [];