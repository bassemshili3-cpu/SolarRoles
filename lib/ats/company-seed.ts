// lib/ats/company-seed.ts
export type AtsCompanySeed = {
  slug: string;
  name: string;
  verified: boolean;
};

export const ASHBY_COMPANIES: AtsCompanySeed[] = [

  { slug: 'Ambrosia-Energy',  name: 'Ambrosia Energy',         verified: true }, // ★★★ Solar Installer El Paso TX $30-40/hr

  { slug: 'span',             name: 'SPAN',                    verified: true }, // smart panel + installer tools

  { slug: 'euclid-power',     name: 'Euclid Power',            verified: true }, // utility-scale solar

  { slug: 'transgrid-energy', name: 'TransGrid Energy',        verified: true }, // solar+BESS utility

  { slug: 't1energy',         name: 'T1 Energy',               verified: true }, // solar module mfg

  { slug: 'tandempv',         name: 'Tandem PV',               verified: true }, // tandem solar tech

  { slug: 'enpal',            name: 'Enpal',                   verified: true }, // plus gros installateur EU

  { slug: 'Ostrom',           name: 'Ostrom',                  verified: false },

  { slug: '1komma5grad',      name: '1Komma5°',                verified: false }, // EU résidentiel

  { slug: 'zolar',            name: 'Zolar',                   verified: false }, // DE

  { slug: 'everoze',          name: 'Everoze',                 verified: false },

  { slug: 'piclo',            name: 'Piclo',                   verified: false },

  { slug: 'Lightsource-bp',   name: 'Lightsource bp',          verified: false },

];

export const SMARTRECRUITERS_COMPANIES: AtsCompanySeed[] = [
  { slug: 'KingspanEnergy',    name: 'Kingspan Energy',          verified: true }, // ★ Ops Manager Solar/Lighting CT
  { slug: 'ib-vogt-GmbH',      name: 'ib vogt GmbH',             verified: true }, // ★ Solar & BESS Engineer APAC
  { slug: 'EcoEnergySolutions',name: 'EcoEnergy Solutions',      verified: true }, // Solar Technician Pakistan
  { slug: 'WunderCapital',     name: 'Wunder Capital',           verified: true },
  { slug: 'SOLV-Energy',       name: 'SOLV Energy',              verified: false },
  { slug: 'Moss-Construction', name: 'Moss Construction',        verified: false },
  { slug: 'Heliene',           name: 'Heliene',                  verified: false },
  { slug: 'SolarMax',          name: 'SolarMax',                 verified: false },
  { slug: 'CanadianSolar',     name: 'Canadian Solar',           verified: false },
];

// Lever — jobs.lever.co/<slug>
export const LEVER_COMPANIES: AtsCompanySeed[] = [
  // ── déjà en seed ──
  { slug: 'freedomsolarpower', name: 'Freedom Solar Power', verified: true },
  { slug: 'goodleap', name: 'GoodLeap', verified: true },
  { slug: 'sunnova', name: 'Sunnova Energy International', verified: true },
  { slug: 'octoenergy', name: 'Octopus Energy Group', verified: true },

  // ── residential installers US ──
  { slug: 'sunrun', name: 'Sunrun', verified: true }, // leader résidentiel US
  { slug: 'blue-raven-solar', name: 'Blue Raven Solar', verified: true },
  { slug: 'momentum-solar', name: 'Momentum Solar', verified: true },
  { slug: 'palmetto-solar', name: 'Palmetto Solar', verified: true },
  { slug: 'trinity-solar', name: 'Trinity Solar', verified: true },
  { slug: 'semper-solaris', name: 'Semper Solaris', verified: true },
  { slug: 'solar-optimum', name: 'Solar Optimum', verified: true },
  { slug: 'lumio', name: 'Lumio', verified: true },
  { slug: 'complete-solar', name: 'Complete Solar', verified: true },

  // ── commercial / utility-scale EPC ──
  { slug: 'swinerton-renewables', name: 'Swinerton Renewable Energy', verified: true },
  { slug: 'solv-energy', name: 'SOLV Energy', verified: true },
  { slug: 'mortenson', name: 'Mortenson', verified: true },
  { slug: 'cypress-creek-renewables', name: 'Cypress Creek Renewables', verified: true },
  { slug: 'silicon-ranch', name: 'Silicon Ranch', verified: true },

  // ── battery / storage + solar ──
  { slug: 'enphase-energy', name: 'Enphase Energy', verified: true },
  { slug: 'solaredge', name: 'SolarEdge', verified: true },
  { slug: 'sonnen', name: 'sonnen', verified: true },
  { slug: 'fluence', name: 'Fluence', verified: true },

  // ── clean energy platforms (hire field ops) ──
  { slug: 'arcadia', name: 'Arcadia', verified: true },
  { slug: 'generate-capital', name: 'Generate Capital', verified: true },
];

// Workable — apply.workable.com/<slug>
export const WORKABLE_COMPANIES: AtsCompanySeed[] = [
  { slug: 'adt-solar', name: 'ADT Solar', verified: true }, // ex-SunPro
  { slug: 'baker-electric', name: 'Baker Electric Home Energy', verified: true },
  { slug: 'robco-electric', name: 'Robco Electric', verified: true },
  { slug: 'esa-solar', name: 'ESA Solar', verified: true },
  { slug: 'safari-energy', name: 'Safari Energy', verified: true },
  { slug: 'pivot-energy', name: 'Pivot Energy', verified: true },
  { slug: 'dynamic-energy', name: 'Dynamic Energy Solutions', verified: true },
  { slug: 'solar-landscape', name: 'Solar Landscape', verified: true },
  { slug: 'southern-current', name: 'Southern Current', verified: true },
  { slug: 'revision-energy', name: 'ReVision Energy', verified: true }, // NE
  { slug: 'greenspark-solar', name: 'GreenSpark Solar', verified: true }, // NY
  { slug: 'powur-energy', name: 'Powur Energy', verified: true },
  { slug: 'solar-universe', name: 'Solar Universe', verified: true },
  { slug: 'ericson-solar', name: 'Ericson Solar', verified: true },
  { slug: 'green-brilliance', name: 'Green Brilliance', verified: true },
  { slug: 'solar-alternatives', name: 'Solar Alternatives',    verified: true }, // Louisiane, "Solar Technician and Installer"
{ slug: 'esselenvironmental', name: 'Essel Environmental',   verified: true }, // Rancho Cucamonga CA, Solar Installer
];

// Pinpoint — app.pinpoint.hire/<slug>
export const PINPOINT_COMPANIES: AtsCompanySeed[] = [
  { slug: 'ilume-energy', name: 'ilume Energy', verified: false }, // ⚠️ AU-based, double check
  { slug: 'smart-energy-solar', name: 'Smart Energy Solar', verified: true },
  { slug: 'enlighten-solar', name: 'Enlighten Solar', verified: false }, // ⚠️ verify
  { slug: 'bright-solar', name: 'Bright Solar', verified: false }, // ⚠️ verify
  { slug: 'next-generation-solar', name: 'Next Generation Solar', verified: false }, // ⚠️ verify
];

// ───────────────────────────────────────────────────────────
// JOBVITE  →  https://jobs.jobvite.com/{slug}/jobs
// Pas d'API publique, HTML scraping, mid-market peu agrégé
// ───────────────────────────────────────────────────────────
export const JOBVITE_COMPANIES: AtsCompanySeed[] = [
  // ★★★ Goldmine — Solar Installer I/II/III dans 15+ états US
  { slug: 'freedomforever', name: 'Freedom Forever', verified: true  },
  // Field Service Tech Solar/PV
  { slug: 'enphase-energy', name: 'Enphase Energy',  verified: true  },
  // Solar Field Engineer / Tech utility-scale
  { slug: 'resgroup',       name: 'RES',             verified: true  },
  { slug: 'canadian-solar', name: 'Canadian Solar',  verified: true  },
];

// ───────────────────────────────────────────────────────────
// GREENHOUSE  →  https://boards-api.greenhouse.io/v1/boards/{slug}/jobs
// JSON API publique. Très agrégé (Indeed/LinkedIn l'indexent) mais c'est
// LE seul ATS avec une vraie densité de jobs solar installer/technician.
// ───────────────────────────────────────────────────────────
export const GREENHOUSE_COMPANIES: AtsCompanySeed[] = [
  // ★★★ 20+ solar field service jobs — utility-scale O&M
  { slug: 'pearceservices',     name: 'Pearce Services',         verified: true },
  // ★★★ Solar Technician I/II/III ($54-107K)
  { slug: 'clearwayjobs',       name: 'Clearway Energy',         verified: true },
  // ★★★ 5/5 jobs sont Solar Electrician/Technician (utility-scale)
  { slug: 'origisenergytechs',  name: 'Origis Energy Services',  verified: true },
  // ★★ Regional Commercial Solar Technician 4
  { slug: 'hanwhaconvergence',  name: 'Hanwha Convergence USA',  verified: true },
  // Solar Field Service Tech (LA/MS/...)
  { slug: 'posigen',            name: 'PosiGen',                 verified: true },
  // plus software/ops
  { slug: 'palmettocleantech',  name: 'Palmetto Clean Tech',     verified: true },
  // Solar Construction PM
  { slug: 'ampliform',          name: 'Ampliform',               verified: true },
  // thin-film solar manufacturer
  { slug: 'swiftsolar',         name: 'Swift Solar',             verified: false },
  // C&I solar firm
  { slug: 'coastenergy',        name: 'Coast Energy',            verified: false },
  { slug: 'kineticsolarcareers',name: 'Kinetic Solar',           verified: false },
  { slug: 'energysolutions',    name: 'Energy Solutions',        verified: false },
  { slug: 'fluenthome',       name: 'Fluent Solar',            verified: true }, // ★ Roof/Solar Installer, plusieurs villes US (ex-Fluent Home)
{ slug: 'brightcoreenergy', name: 'Brightcore Energy',       verified: true }, // installateur géothermie/solaire commercial, IGSHPA certifié requis
{ slug: 'soligent',         name: 'Soligent',                verified: false }, // plus gros distributeur solaire US — jobs surtout ops/warehouse, peu d'"installer" pur
];

