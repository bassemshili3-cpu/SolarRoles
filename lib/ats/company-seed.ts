export type AtsCompanySeed = {
  slug: string;
  name: string;
  verified: boolean; // slug confirmed to resolve at time of writing
};

// Ashby — jobs.ashbyhq.com/<slug>  |  api.ashbyhq.com/posting-api/job-board/<slug>
//
// Found via `site:jobs.ashbyhq.com "security engineer"` style searches
// instead of guessing + verifying company names one by one — a search hit
// on jobs.ashbyhq.com IS the verification, no separate check needed.
// Re-run a few of these queries periodically (swap in other role keywords:
// "penetration tester", "GRC", "cloud security", "threat intel"...) to
// keep discovering new slugs. See verify-ats-slug.ts only for one-off
// manual guesses.
export const ASHBY_COMPANIES: AtsCompanySeed[] = [
  { slug: 'vanta', name: 'Vanta', verified: true }, // GRC / security compliance automation — cyber-native
  { slug: 'semgrep', name: 'Semgrep', verified: true }, // code security / SAST — cyber-native
  { slug: 'c-side', name: 'c/side', verified: true }, // web/JS supply-chain security — cyber-native
  { slug: 'prophet-security', name: 'Prophet Security', verified: true }, // AI SOC platform — cyber-native
  { slug: 'hoxhunt', name: 'Hoxhunt', verified: true }, // phishing simulation / security awareness — cyber-native
  { slug: 'workos', name: 'WorkOS', verified: true }, // dev infra (auth/identity) — has an internal security team, not cyber-native
  { slug: 'mistral.ai', name: 'Mistral AI', verified: true }, // AI lab — internal SOC role only, not cyber-native
  { slug: 'leadbank', name: 'Lead Bank', verified: true }, // fintech/bank — internal security role only, not cyber-native
  { slug: 'benchling', name: 'Benchling', verified: true }, // biotech software — internal security role only, not cyber-native
  { slug: 'level', name: 'Level', verified: true }, // edtech — internal security role only, not cyber-native
  { slug: 'solink', name: 'Solink', verified: true }, // video/loss-prevention security — adjacent, not cyber-native
];

// Pinpoint — <slug>.pinpointhq.com/postings.json
//
// Much smaller client base than Ashby — the same site: search technique
// used above for Ashby returns far fewer hits here (roughly 1 usable slug
// per 2 searches vs. several per search on Ashby). Not worth dedicating
// search time to; add slugs opportunistically if you come across one,
// verifying first:
//   npx tsx scripts/verify-ats-slug.ts pinpoint <slug>
export const PINPOINT_COMPANIES: AtsCompanySeed[] = [
  { slug: 'deepseas', name: 'DeepSeas', verified: true }, // threat monitoring / MDR — cyber-native
];