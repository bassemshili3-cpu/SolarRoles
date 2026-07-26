// lib/ats/company-seed.ts
export type AtsCompanySeed = {
  slug: string;
  name: string;
  verified: boolean;
};

// Lever — jobs.lever.co/<slug>  |  api.lever.co/v0/postings/<slug>
export const LEVER_COMPANIES: AtsCompanySeed[] = [
  { slug: 'freedomsolarpower', name: 'Freedom Solar Power', verified: true }, // installateur résidentiel/commercial US — solar-native
  { slug: 'goodleap', name: 'GoodLeap', verified: true }, // financement + ops solaires résidentielles — solar-native
  { slug: 'sunnova', name: 'Sunnova Energy International', verified: true }, // gros installateur résidentiel US — solar-native
  { slug: 'octoenergy', name: 'Octopus Energy Group', verified: true }, // UK, multi-énergie (solaire + heat pump + EV) — adjacent, pas 100% solaire
];

export const WORKABLE_COMPANIES: AtsCompanySeed[] = [];

export const PINPOINT_COMPANIES: AtsCompanySeed[] = [];