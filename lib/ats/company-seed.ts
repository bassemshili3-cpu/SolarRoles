// lib/ats/company-seed.ts
import type { WorkdayCompanySeed } from './workday';
import type { RipplingCompanySeed } from './rippling';
import type { SuccessFactorsCompanySeed } from './successfactors';
import type { OracleCloudCompanySeed } from './oracle-cloud';
import type { UkgCompanySeed } from './ukg';
import type { IcimsCompanySeed } from './icims';
import type { AdpCompanySeed } from './adp';
import type { PaylocityCompanySeed } from './paylocity';
import type { PaycomCompanySeed } from './paycom';
import type { HrmDirectCompanySeed } from './hrmdirect';
import type { SaaShrCompanySeed } from './saashr';

export type AtsCompanySeed = {
  slug: string;
  name: string;
  verified: boolean;
  /** Exact titles approved beyond the shared solar taxonomy. */
  includeJobTitles?: string[];
};

// ───────────────────────────────────────────────────────────
// JAZZHR  →  https://<slug>.applytojob.com/apply  (subdomain = slug)
// Confirmé "Powered by JazzHR" sur les offres Venture Solar.
// ───────────────────────────────────────────────────────────
export const JAZZHR_COMPANIES: AtsCompanySeed[] = [
  // Existing seed
  { slug: 'venturesolar', name: 'Venture Solar', verified: true },
  { slug: 'teamsunshineconstructionllc', name: 'Team Sunshine Construction', verified: true, includeJobTitles: ['Solar Appointment Setter'] },
  { slug: 'lplsolarllc', name: 'LPL Solar', verified: true },
  { slug: 'powerflex', name: 'PowerFlex', verified: true },
  { slug: 'vanguardenergypartnersllc', name: 'Vanguard Energy Partners', verified: true },

  // September 2026 expansion — active US solar/EPC boards verified.
  { slug: 'cleancapital', name: 'CleanCapital', verified: true },
  { slug: 'brooklynsolarworks', name: 'Brooklyn SolarWorks', verified: true },
  { slug: 'clarkbrosinc', name: 'Clark Bros.', verified: true },
  { slug: 'slettenconstruction', name: 'Sletten Companies', verified: true },
  { slug: 'melinksolarllc', name: 'Melink Solar', verified: true },
  { slug: 'calsolar', name: 'Cal Solar', verified: true },
  { slug: 'hayselectricalservices', name: 'Hays Electrical Services', verified: true },
  { slug: 'suntribegroup', name: 'Sun Tribe', verified: true },
  { slug: 'greenrack', name: 'Green Rack Solar', verified: true },

  // September 2026 batch 3.
  { slug: 'spruce', name: 'Spruce Power', verified: true },

  // September 16, 2026 — solar/BESS employer expansion.
  { slug: 'ravenvolt', name: 'RavenVolt', verified: true },
  { slug: 'solargaines', name: 'Solargaines', verified: true },
  { slug: 'ipsunsolar', name: 'Ipsun Solar', verified: true },
  { slug: 'r2contractors', name: 'R-2 Contractors', verified: true },
  { slug: 'esvolta', name: 'esVolta', verified: true },
  { slug: 'newedgepower', name: 'NewEdge Power', verified: true },

  // September 17, 2026 — active taxonomy-matching board.
  { slug: 'sargentelectric', name: 'Sargent Electric', verified: true },

  // September 18, 2026 — 30-company US active-solar ATS batch.
  { slug: 'cleanchoiceenergy', name: 'CleanChoice Energy', verified: true, includeJobTitles: ['Energy Markets Analyst'] },
  { slug: 'sunkeepersolar', name: 'Sunkeeper Solar', verified: true },
  { slug: 'inmansolarllc', name: 'Inman Solar', verified: true, includeJobTitles: ['Construction Manager', 'Design Engineer', 'Pre-Construction Engineer'] },
  { slug: 'sunstrongmanagementllc', name: 'SunStrong Management', verified: true },
  { slug: 'wattch', name: 'Wattch', verified: true, includeJobTitles: ['Technical Project Manager'] },
  { slug: 'kwhanalytics', name: 'kWh Analytics', verified: true, includeJobTitles: ['Tax Underwriter, Renewable Energy'] },
  { slug: 'sungagefinancial', name: 'Sungage Financial', verified: true },
  { slug: 'keycaptureenergyllc', name: 'Key Capture Energy', verified: true, includeJobTitles: ['Market Operations Analyst'] },

];

// Breezy HR - https://<slug>.breezy.hr/
// Public career pages verified; ingested by the dedicated Breezy connector.
// Include relevant solar roles regardless of remote status.
export const BREEZY_COMPANIES: AtsCompanySeed[] = [
  { slug: 'sunlove-solar', name: 'Reach', verified: true },
  { slug: 'solar-pros', name: 'Solar Pros / Freedom Pros', verified: true },
  { slug: 'salesdraft-recruiting', name: 'SalesDraft Recruiting', verified: true },

  // September 2026 expansion
  { slug: 'spark-power', name: 'Spark Power', verified: true },
  { slug: 'renewable-properties', name: 'Renewable Properties', verified: true },
  { slug: 'sunenergy1', name: 'SunEnergy1', verified: true },
  { slug: 'planted-solar-inc', name: 'Planted Solar', verified: true },

  // September 16, 2026 — solar/BESS employer expansion.
  { slug: 'echelon-solar-power', name: 'Echelon Solar Power', verified: true },
  { slug: 'summit-solar-solutions', name: 'Summit Solar Solutions', verified: true },
  { slug: 'breakthrough-inventions', name: 'Breakthrough Inventions', verified: true },
  { slug: 'barupon-llc', name: 'BaRupOn', verified: true },
  { slug: 'vikta-energy-technologies-llc', name: 'Vikta Energy Technologies', verified: true },
  { slug: 'ceg-solutions-llc', name: 'CEG Solutions', verified: true },
  { slug: 'delan-associates-inc', name: 'Delan Associates', verified: true },
  { slug: 'rinvio', name: 'Rinvio', verified: true },
  { slug: 'south-mountain-company', name: 'South Mountain Company', verified: true },

  // September 17, 2026 — active taxonomy-matching boards.
  { slug: 'sunpower', name: 'SunPower', verified: true },
  { slug: 'mtm-llc', name: 'MTM LLC', verified: true },
  { slug: 'cedar-park-group', name: 'Cedar Park Group', verified: true },
];

// Rippling — https://ats.rippling.com/<slug>/jobs
// `roleFilter` deliberately preserves the manually requested role scope per employer.
export const RIPPLING_COMPANIES: RipplingCompanySeed[] = [
  { slug: 'clean-energy-services-careers', name: 'Clean Energy Services', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'sunnymac-careers', name: 'Sunnymac Solar', verified: true, roleFilter: 'handyman_or_hvac_installer' },
  { slug: 'asic', name: 'ASIC', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'zeo-energy-corp', name: 'ZEO Energy', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'photon-brothers', name: 'Photon Brothers', verified: true, roleFilter: 'solar_installer' },
  { slug: 'rnwbl', name: 'RNWBL', verified: true, roleFilter: 'solar_om_or_technician' },
  { slug: 'qesolar', name: 'QE Solar', verified: true, roleFilter: 'solar_taxonomy' },

  // September 2026 expansion
  { slug: 'spartanx-llc', name: 'SpartanX', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'ethical-energy', name: 'Ethical Energy', verified: true, roleFilter: 'solar_taxonomy' },

  // September 16, 2026 — solar/BESS employer expansion.
  { slug: 'external-job-board', name: 'FlexGen', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'anza-re-llc', name: 'Anza', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'desri-careers', name: 'DESRI', verified: true, roleFilter: 'solar_taxonomy' },
  // Re-enabled after confirming a current Solar Installer posting.
  { slug: 'dynamic-slr', name: 'Dynamic SLR', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'terra-energy', name: 'Terra Energy', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'peak-power-careers', name: 'Peak Power', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'elevate-infrastructure', name: 'Elevate Infrastructure', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'alderbuck-energy', name: 'Alderbuck Energy', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'stem-inc', name: 'Stem', verified: true, roleFilter: 'solar_taxonomy' },

  // September 17, 2026 — active taxonomy-matching boards.
  { slug: 'oneenergyrenewables', name: 'OneEnergy Renewables', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'simply-solar', name: 'Simply Solar', verified: true, roleFilter: 'solar_taxonomy' },

  // September 18, 2026 — 30-company US active-solar ATS batch.
  { slug: 'bluewave', name: 'BlueWave', verified: true, roleFilter: 'solar_taxonomy' },
  { slug: 'raptor-maps-inc', name: 'Raptor Maps', verified: true, roleFilter: 'solar_taxonomy' },

];

// SAP SuccessFactors Recruiting Marketing — public RSS feeds expose the
// complete description and source publication date without browser automation.
export const SUCCESSFACTORS_COMPANIES: SuccessFactorsCompanySeed[] = [
  {
    baseUrl: 'https://jobs.engie.com',
    name: 'ENGIE',
    verified: true,
    locale: 'en_US',
    keywords: ['bess'],
  },
  {
    baseUrl: 'https://jobs.nexteraenergy.com',
    name: 'NextEra Energy Resources',
    verified: true,
    locale: 'en_US',
    keywords: ['solar'],
  },
  {
    baseUrl: 'https://jobs.rwe.com',
    name: 'RWE Americas',
    verified: true,
    locale: 'en_US',
    keywords: ['solar', 'battery storage'],
  },
  {
    baseUrl: 'https://jobs.edp.com',
    name: 'EDP Renewables North America',
    verified: true,
    locale: 'en_US',
    keywords: ['solar', 'battery storage'],
  },
  {
    baseUrl: 'https://careers.lightsourcebp.com',
    name: 'Lightsource bp',
    verified: true,
    locale: 'en_US',
    keywords: ['solar', 'battery storage'],
  },
  {
    baseUrl: 'https://careers.bv.com',
    name: 'Black & Veatch / Overland Contracting',
    verified: true,
    locale: 'en_US',
    keywords: ['solar', 'Overland Contracting'],
  },
  {
    baseUrl: 'https://jobs.kochcareers.com',
    name: 'DEPCOM Power',
    verified: true,
    locale: 'en_US',
    keywords: ['DEPCOM Power', 'solar'],
  },

  // September 18, 2026 — 30-company US active-solar ATS batch.
  {
    baseUrl: 'https://careers.pcl.com',
    name: 'PCL Solar Constructors USA',
    verified: true,
    locale: 'en_US',
    keywords: ['solar'],
  },
  {
    baseUrl: 'https://kiewitcareers.kiewit.com',
    name: 'Kiewit',
    verified: true,
    locale: 'en_US',
    keywords: ['solar'],
  },
  {
    baseUrl: 'https://careers.dominionenergy.com',
    name: 'Dominion Energy',
    verified: true,
    locale: 'en_US',
    keywords: ['solar'],
  },
  {
    baseUrl: 'https://jobs.entergy.com',
    name: 'Entergy',
    verified: true,
    locale: 'en_US',
    keywords: ['solar', 'solar PV'],
  },
  {
    baseUrl: 'https://careers.aps.com',
    name: 'Arizona Public Service (APS)',
    verified: true,
    locale: 'en_US',
    keywords: ['solar', 'BESS'],
  },
  {
    baseUrl: 'https://careers.pge.com',
    name: 'Pacific Gas & Electric (PG&E)',
    verified: true,
    locale: 'en_US',
    keywords: ['solar', 'battery storage'],
  },
  {
    baseUrl: 'https://careers.nrgenergy.com',
    name: 'NRG Energy',
    verified: true,
    locale: 'en_US',
    keywords: ['solar', 'storage'],
  },

];

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

  // September 16, 2026 — solar/BESS employer expansion.
  { slug: 'techne-elysia', name: 'Elysia Battery Intelligence', verified: true },
  { slug: 'formenergy', name: 'Form Energy', verified: true },
  { slug: 'American%20Terawatt', name: 'American Terawatt', verified: true },
  { slug: 'odin-dynamics', name: 'Odin Dynamics', verified: true },
  // Requested employer retained but disabled until its current Ashby board is re-confirmed.
  { slug: 'red-tree-engineering', name: 'Red Tree Engineering', verified: false },
  { slug: 'base-power', name: 'Base Power', verified: true },
  { slug: 'tar', name: 'TAR', verified: true },
  { slug: 'rowan', name: 'Rowan Digital Infrastructure', verified: true },

  // September 18, 2026 — 30-company US active-solar ATS batch.
  { slug: 'aurorasolar', name: 'Aurora Solar', verified: true, includeJobTitles: ['Staff Analytics Engineer'] },
  { slug: 'inductive-automation-llc', name: 'Inductive Automation', verified: true, includeJobTitles: ['Sales Operations Lead - Strategic Initiatives'] },

];

export const SMARTRECRUITERS_COMPANIES: AtsCompanySeed[] = [
  { slug: 'KingspanEnergy', name: 'Kingspan Energy', verified: true },
  { slug: 'ib-vogt-gmbh', name: 'ib vogt GmbH', verified: true },
  { slug: 'EcoEnergySolutions', name: 'EcoEnergy Solutions', verified: true },
  { slug: 'WunderCapital', name: 'Wunder Capital', verified: true },
  { slug: 'SilfabSolar', name: 'Silfab Solar', verified: true },

  // Re-verified September 2026.
  { slug: 'AECOM2', name: 'AECOM', verified: true },
  { slug: 'KnobelsdorffEnterprises', name: 'Knobelsdorff', verified: true },

  // New September 2026 sources.
  { slug: 'ApexCleanEnergy', name: 'Apex Clean Energy', verified: true },
  { slug: 'CoffmanEngineersInc', name: 'Coffman Engineers', verified: true },

  // September 16, 2026 — solar/BESS employer expansion.
  { slug: 'TurnerTownsend', name: 'Turner & Townsend', verified: true },
  { slug: 'CIMA2', name: 'CIMA+', verified: true },
  { slug: 'VeoliaEnvironnementSA', name: 'Veolia North America', verified: true },
  { slug: 'Akuo', name: 'Akuo Energy USA', verified: true },
  { slug: 'SolarisOilfieldInfrastructureLLC', name: 'Solaris Energy Infrastructure', verified: true },
  { slug: 'SolectriaRenewables', name: 'Yaskawa Solectria Solar', verified: true },
];

// Lever — jobs.lever.co/<slug>
export const LEVER_COMPANIES: AtsCompanySeed[] = [
  // Existing seed
  { slug: 'freedomsolarpower', name: 'Freedom Solar Power', verified: true },
  { slug: 'goodleap', name: 'GoodLeap', verified: true },
  { slug: 'octoenergy', name: 'Octopus Energy Group', verified: true },
  { slug: 'intersect', name: 'Intersect', verified: true },
  { slug: 'semper-solaris', name: 'Semper Solaris', verified: true },
  { slug: 'solar-optimum', name: 'Solar Optimum', verified: true },
  { slug: 'mortenson', name: 'Mortenson', verified: true },
  { slug: 'sonnen', name: 'sonnen', verified: true },
  { slug: 'generate-capital', name: 'Generate Capital', verified: true },
  { slug: 'smartenergy', name: 'Smart Energy', verified: true },
  { slug: 'solarlandscape', name: 'Solar Landscape', verified: true },
  { slug: 'exowatt', name: 'Exowatt', verified: true },
  { slug: 'bonedry', name: 'Bone Dry', verified: true },
  { slug: 'disher', name: 'Disher', verified: true },

  // September 2026 expansion
  { slug: 'ScaleMicrogridSolutions', name: 'Scale Microgrid Solutions', verified: true },
  { slug: 'ans', name: 'ANS', verified: true },
  { slug: 'pivotenergy', name: 'Pivot Energy', verified: true },

  // September 16, 2026 — solar/BESS employer expansion.
  { slug: 'EnergyVault', name: 'Energy Vault', verified: true },
  // Requested employer retained but disabled until its current Lever board is re-confirmed.
  { slug: 'camsrenewableservices', name: 'CAMS Renewable Services', verified: false },
  { slug: 'highlandfleets-2', name: 'Highland Electric Fleets', verified: true },
  { slug: 'stanleygroup', name: 'Stanley Consultants', verified: true },

  // September 17, 2026 — active taxonomy-matching board.
  { slug: 'primee', name: 'Prime Electric', verified: true },

  // September 18, 2026 — 30-company US active-solar ATS batch.
  { slug: 'omnidian', name: 'Omnidian', verified: true, includeJobTitles: ['Portfolio Operations Manager, Commercial'] },
  { slug: 'solestial', name: 'Solestial', verified: true },

];

// Workable — apply.workable.com/<slug>
export const WORKABLE_COMPANIES: AtsCompanySeed[] = [
  { slug: 'baker-electric', name: 'Baker Electric Home Energy', verified: true },
  { slug: 'robco-electric', name: 'Robco Electric', verified: true },
  { slug: 'esa-solar', name: 'ESA Solar', verified: true },
  { slug: 'safari-energy', name: 'Safari Energy', verified: true },
  { slug: 'dynamic-energy', name: 'Dynamic Energy Solutions', verified: true },
  { slug: 'southern-current', name: 'Southern Current', verified: true },
  { slug: 'revision-energy', name: 'ReVision Energy', verified: true }, // NE
  { slug: 'powur-energy', name: 'Powur Energy', verified: true },
  { slug: 'solar-universe', name: 'Solar Universe', verified: true },
  { slug: 'ericson-solar', name: 'Ericson Solar', verified: true },
  { slug: 'green-brilliance', name: 'Green Brilliance', verified: true },
  { slug: 'solar-alternatives', name: 'Solar Alternatives',    verified: true }, // Louisiane, "Solar Technician and Installer"
  { slug: 'esselenvironmental', name: 'Essel Environmental',   verified: true }, // Rancho Cucamonga CA, Solar Installer

  // September 2026 batch 3.
  { slug: 'solamerica-energy', name: 'SolAmerica Energy', verified: true },

  // September 18, 2026 — 30-company US active-solar ATS batch.
  { slug: 'nautilus-solar-energy', name: 'Nautilus Solar Energy', verified: true, includeJobTitles: ['Portfolio Operations Analyst', 'Capital Markets Associate'] },
  { slug: 'urban-grid-solar-projects', name: 'Urban Grid', verified: true },
  { slug: 'emc-renewables', name: 'EMC Renewables', verified: true, includeJobTitles: ['Substation Engineer'] },
  { slug: 'terabase-energy', name: 'Terabase Energy', verified: true, includeJobTitles: ['Sr. Controls Engineer - OT SCADA Projects'] },
  { slug: 'solar-energy-solutions', name: 'Solar Energy Solutions', verified: true },

];

// Pinpoint — app.pinpoint.hire/<slug>
export const PINPOINT_COMPANIES: AtsCompanySeed[] = [
  { slug: 'ilume-energy', name: 'ilume Energy', verified: false }, // ⚠️ AU-based, double check
  { slug: 'smart-energy-solar', name: 'Smart Energy Solar', verified: true },
  { slug: 'enlighten-solar', name: 'Enlighten Solar', verified: false }, // ⚠️ verify
  { slug: 'bright-solar', name: 'Bright Solar', verified: false }, // ⚠️ verify
  { slug: 'next-generation-solar', name: 'Next Generation Solar', verified: false }, // ⚠️ verify
  { slug: 'keystoneclear', name: 'Keystone Clear', verified: false }, // ★ solar installer — verify ATS
  { slug: 'sunking', name: 'SunKing', verified: false }, // ★ solar installer — verify ATS
];

// ───────────────────────────────────────────────────────────
// JOBVITE  →  https://jobs.jobvite.com/{slug}/jobs
// Pas d'API publique, HTML scraping, mid-market peu agrégé
// ───────────────────────────────────────────────────────────
export const JOBVITE_COMPANIES: AtsCompanySeed[] = [
  { slug: 'enphase-energy', name: 'Enphase Energy', verified: true },
  { slug: 'resgroup', name: 'RES', verified: true },
  { slug: 'cei', name: 'Cupertino Electric', verified: true },

  // September 2026 expansion
  { slug: 'mccarthy-building-co', name: 'McCarthy Building Companies', verified: true },
  { slug: 'canadian-solar', name: 'Canadian Solar', verified: true },

  // September 16, 2026 — requested source retained disabled until the
  // current Jobvite tenant is re-confirmed.
  { slug: 'epma', name: 'EPMA', verified: false },

  // September 18, 2026 — 30-company US active-solar ATS batch.
  { slug: 'freedomforever', name: 'Freedom Forever', verified: true },

];

// Oracle Recruiting Cloud — public Candidate Experience portal.
export const ORACLE_CLOUD_COMPANIES: OracleCloudCompanySeed[] = [
  {
    baseUrl: 'https://icczjb.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1',
    name: 'MN8 Energy',
    verified: true,
  },
  {
    baseUrl: 'https://fa-esbv-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1',
    name: 'First Solar',
    verified: true,
  },
  {
    baseUrl: 'https://fa-essf-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1',
    name: 'BHE Renewables',
    verified: true,
  },

  // September 16, 2026 — solar/BESS employer expansion.
  {
    baseUrl: 'https://fa-eups-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/ULSolutionsCareers',
    name: 'UL Solutions',
    verified: true,
  },
];

// ADP Workforce Now — public Career Center JSON API.
export const ADP_COMPANIES: AdpCompanySeed[] = [
  {
    cid: 'b5d87377-1bbe-4787-8322-eb5c7abdc9c7',
    name: 'NovaSource Power Services',
    verified: true,
  },
  {
    cid: 'd31a40ed-72d3-492d-b16f-7abf4b880e74',
    name: 'Heliene',
    verified: true,
  },
  {
    cid: 'cbb9afbc-3dc4-4794-b760-b21538c65f8a',
    name: 'Lumina Solar',
    verified: true,
  },
  {
    cid: 'c7e5e3e5-2d79-441c-bd1d-024d20e8a297',
    name: 'Imperial Star Solar',
    verified: true,
  },
];

// Paylocity — public board HTML with JobPosting JSON-LD on detail pages.
export const PAYLOCITY_COMPANIES: PaylocityCompanySeed[] = [
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/a8590bda-2f17-4a4e-8c2e-1c0225fe6969/Pure-Power-Engineering-Inc',
    name: 'Pure Power Engineering',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/76521e27-2487-44e7-9da3-015c68858b91/Terra--Gen-Operating-Company-LLC',
    name: 'Terra-Gen',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/c4ba1261-9dee-44e1-b5fd-5f8cb4ee222e/Cinterra',
    name: 'Cinterra',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/c5e83770-485a-47a0-8c36-e90052697f24/Longroad-Energy',
    name: 'Longroad Energy',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/b2a7f4b0-6223-4b95-8476-22c44d181d6e/Good-Faith-Energy-LLC',
    name: 'Good Faith Energy',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/9bf70b29-36ba-44de-9aa2-61fae83b9754/Suncommon-II',
    name: 'SunCommon',
    verified: true,
  },

  // September 16, 2026 — solar/BESS employer expansion.
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/d76583f8-99cd-4e70-aa50-2c32e3a2c89f',
    name: 'Westwood Professional Services',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/beb45816-0dc5-4766-be9d-3740bb246f1d/SunVena',
    name: 'SunVena',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/f97ca7a9-2c71-4165-ac4b-99be376bf133/Mountain-West-Consulting-LLC',
    name: 'Mountain West Consulting',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/fe76e83d-cadf-4f52-8fc8-9176193b6cf7',
    name: 'LCR EPC',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/07cc4409-b63f-4768-90f1-959de7ebcbd3',
    name: 'Sunlux Energy',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/37385a16-75f5-463b-b128-e6557388e1d5',
    name: 'Innovative Engineering Systems',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/c8df5b74-b285-49da-8d1b-d9addb903703/Takkion-Ops-Management-LLC',
    name: 'Takkion',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/da4c1284-8a59-42da-af17-117263500d30/ENERGYRE-LLC',
    name: 'energyRe',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/8670063c-d4c1-4e94-b162-864b77affca0/VIKOR',
    name: 'VIKOR',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/2b105ca3-bec2-4323-9060-d50ed806bd41',
    name: 'OE Solar / Osceola Energy',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/f395f4ed-90b7-49c2-a37e-12c399e2fb38/TLN-Worldwide-Enterprises-Inc',
    name: 'TLN Worldwide Enterprises',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/93ee960e-a646-44a8-98d5-a30133955d99/ARM-Group-LLC',
    name: 'ARM Group',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/936ec85a-88bb-46e9-ba9b-53182d7b45e0',
    name: 'Ambia Energy',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/e14a6507-3004-41e9-bafb-cb71d9a89bcd',
    name: 'Intermountain Wind & Solar',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/9ca1af84-56c5-4e9e-8014-70297cab5703',
    name: 'SUNation Energy',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/f6bd759b-059e-47eb-8ffb-d1e4c090542c',
    name: 'Empower Solar',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/e607dd53-0424-4e17-8fe3-ce26efc95470',
    name: 'MYNT Systems',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/fdafc526-aaaf-48f9-833d-8aa4540ccb7a',
    name: 'Green Ridge Solar',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/664f02ad-152d-48ea-9ca5-df49eec805df',
    name: 'Greenergy Resources',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/63949cc3-d39a-464d-8735-cb9e7dd16367',
    name: 'Hawaii Energy Connection',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/3bd0602e-cc8c-4df1-8dac-c8a4e2c52178',
    name: 'Renu Energy Solutions',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/8621004a-7a46-404c-aa9a-8b2bd393de65',
    name: 'MVE Group',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/c6dfa158-1325-4b9a-8a3f-4eb66d4dc903',
    name: 'A&R Solar',
    verified: true,
  },
  // September 17, 2026 — active taxonomy-matching boards.
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/cd26a34b-acbd-4a27-b6be-4393671609b7/Sol-Up',
    name: 'Sol-Up',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/41e9ea92-4612-434e-879f-eee59edb6849',
    name: 'Icon Power',
    verified: true,
  },

  // September 18, 2026 — 30-company US active-solar ATS batch.
  {
    boardUrl: 'https://recruiting.paylocity.com/recruiting/jobs/All/c8c3eee1-dc50-471c-976c-a5a3aa36568c/Perch-Energy',
    name: 'Perch Energy',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/08eac160-0a1e-4180-8eb0-8381757e63b5',
    name: 'GRID Alternatives',
    verified: true,
  },
  {
    boardUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/All/4983d57a-d944-4691-a600-8d7a4ee2b26f',
    name: 'Runergy USA',
    verified: true,
  },

];

// Paycom — public client career portal rendered by the current Paycom SPA.
export const PAYCOM_COMPANIES: PaycomCompanySeed[] = [
  {
    clientKey: 'BBC98E01F1F27C80A5FDE6ABEECA4271',
    name: 'Shoals Technologies',
    verified: true,
  },
  {
    clientKey: 'FEA94D4A9CE8BC5311CB1583A27A2B8D',
    name: 'Standard Solar',
    verified: true,
  },
];

// UKG Pro Recruiting — public job-board API and opportunity details.
export const UKG_COMPANIES: UkgCompanySeed[] = [
  {
    baseUrl: 'https://onestrata.rec.pro.ukg.net/STR1027SSOL/JobBoard/95da68de-9d94-406f-9c99-aa8627d1e992',
    name: 'Strata Clean Energy',
    verified: true,
  },
  {
    baseUrl: 'https://recruiting.ultipro.com/SIG1007SGEN/JobBoard/1d63bc67-2233-4c90-b4e5-2ebdcffb3021',
    name: 'Signal Energy',
    verified: true,
  },
];

// iCIMS — Solect is a Pattern Energy subsidiary and shares its tenant.
export const ICIMS_COMPANIES: IcimsCompanySeed[] = [
  {
    baseUrl: 'https://careers-patternenergy.icims.com',
    name: 'Solect Energy',
    categoryName: 'Solect',
    verified: true,
  },
  {
    baseUrl: 'https://careers-edf-re.icims.com',
    name: 'EDF power solutions North America',
    verified: true,
  },

  // September 16, 2026 — solar/BESS employer expansion.
  // Shared iCIMS tenants are kept disabled where an employer-specific filter
  // cannot be guaranteed by the current connector.
  {
    baseUrl: 'https://ceisvcareers-mastec.icims.com',
    name: 'MasTec Renewables / IEA',
    categoryName: 'MasTec Renewables / IEA',
    verified: false,
  },
  {
    baseUrl: 'https://careers-nv5.icims.com',
    name: 'NV5',
    verified: true,
  },
  {
    baseUrl: 'https://careers-sargentlundy.icims.com',
    name: 'Sargent & Lundy',
    verified: true,
  },
  {
    baseUrl: 'https://careers2-quanta.icims.com',
    name: 'NorthStar Energy Solutions',
    categoryName: 'NorthStar Energy Solutions',
    verified: false,
  },
  {
    baseUrl: 'https://careers2-quanta.icims.com',
    name: 'Quanta Power Solutions',
    categoryName: 'Quanta Power Solutions',
    verified: true,
  },
  {
    baseUrl: 'https://careers-patternenergy.icims.com',
    name: 'Pattern Energy',
    verified: true,
  },
  {
    baseUrl: 'https://careers-kimley-horn.icims.com',
    name: 'Kimley-Horn',
    verified: true,
  },
  {
    baseUrl: 'https://careers-dudek.icims.com',
    name: 'Dudek',
    verified: true,
  },
  {
    baseUrl: 'https://careers2-quanta.icims.com',
    name: 'Henkels & McCoy West',
    categoryName: 'Henkels & McCoy',
    verified: false,
  },
  {
    baseUrl: 'https://careers-exponent.icims.com',
    name: 'Exponent',
    verified: true,
  },
  {
    baseUrl: 'https://careers-aeieng.icims.com',
    name: 'Affiliated Engineers (AEI)',
    verified: true,
  },
  {
    baseUrl: 'https://frfrench-equans.icims.com',
    name: 'Equans Solar & Storage',
    verified: true,
  },
  {
    baseUrl: 'https://careers-us-shermco.icims.com',
    name: 'Shermco',
    verified: true,
  },
  {
    baseUrl: 'https://ceisvcareers-mastec.icims.com',
    name: 'William Charles Electric',
    categoryName: 'William Charles Electric',
    verified: false,
  },
  // September 17, 2026 — active taxonomy-matching boards.
  {
    baseUrl: 'https://beitzelcareers-beitzelpillar.icims.com',
    name: 'Beitzel Corporation',
    verified: true,
  },
  {
    baseUrl: 'https://careers-mpowerdirect.icims.com',
    name: 'Mpower Solar',
    verified: true,
  },
];



// WORKDAY  →  https://{tenant}.{host}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs
// Gros installateurs/EPC nationaux — pas de "slug" unique, il faut les
// 3 valeurs (tenant/host/site). NE PAS mettre verified:true sans avoir
// réellement testé le fetch — c'est le piège qu'on a mis des heures à
// débusquer sur company-seed Greenhouse (posigen, fluenthome...).
// ───────────────────────────────────────────────────────────
export const WORKDAY_COMPANIES: WorkdayCompanySeed[] = [
  { tenant: 'sunrun', host: 'wd5', site: 'Sunrun_Careers', name: 'Sunrun', verified: true },
  { tenant: 'arraytechinc', host: 'wd5', site: 'Array_Careers', name: 'Array Technologies', verified: true },
  { tenant: 'blattner', host: 'wd5', site: 'BlattnerCompany', name: 'Blattner', verified: true },
  { tenant: 'recurrentenergy', host: 'wd12', site: 'RecurrentEnergy', name: 'Recurrent Energy', verified: true },
  { tenant: 'illuminateusa', host: 'wd503', site: 'Illuminate_Careers', name: 'Illuminate USA', verified: true },

  // Existing candidates not yet safe to enable.
  { tenant: 'aes', host: 'wd1', site: 'AES_US', name: 'AES Clean Energy', verified: false },
  { tenant: 'igsenergy', host: 'wd1', site: 'IGS', name: 'IGS Energy', verified: false },
  { tenant: 'faithtechnologies', host: 'wd1', site: 'FTI', name: 'Faith Technologies', verified: false },
  { tenant: 'rosendin', host: 'wd1', site: 'Careers', name: 'Rosendin Electric', verified: false },
  { tenant: 'enbridge', host: 'wd3', site: 'enbridge_careers', name: 'Enbridge', verified: false },

  // Existing verified solar employers.
  { tenant: 'solvenergy', host: 'wd1', site: 'SOLV_External_Career', name: 'SOLV Energy', verified: true },
  { tenant: 'mosscm', host: 'wd1', site: 'Moss_Careers', name: 'Moss', verified: true },
  { tenant: 'aes', host: 'wd1', site: 'aes_clean_energy', name: 'AES Clean Energy', verified: true },
  { tenant: 'ameresco', host: 'wd5', site: 'Ameresco', name: 'Ameresco', verified: true },

  // Re-verified / corrected September 2026.
  { tenant: 'nextracker', host: 'wd5', site: 'nextpower_careers', name: 'Nextracker', verified: true },
  { tenant: 'prim', host: 'wd108', site: 'Primoris', name: 'Primoris', verified: true },
  { tenant: 'invenergyllc', host: 'wd1', site: 'invenergyservices', name: 'Invenergy', verified: true },

  // New September 2026 sources.
  { tenant: 'leewardenergy', host: 'wd1', site: 'LeewardCareers', name: 'Leeward Renewable Energy', verified: true },
  { tenant: 'acciona', host: 'wd3', site: 'ACCIONA_Employment_Channel', name: 'ACCIONA Energía', verified: true },
  { tenant: 'gafsgi', host: 'wd5', site: 'GAF_Careers', name: 'GAF Energy', verified: true },

  // Canadian Solar is intentionally NOT duplicated here anymore: its current
  // public board is handled through Jobvite (`canadian-solar`).

  // September 16, 2026 — solar/BESS employer expansion.
  { tenant: 'fluenceenergy', host: 'wd12', site: 'fluenceenergy-jobs', name: 'Fluence', verified: true },
  { tenant: 'gevernova', host: 'wd5', site: 'Vernova_ExternalSite', name: 'GE Vernova', verified: true },
  { tenant: 'williams', host: 'wd5', site: 'external', name: 'Williams Companies', verified: true },
  { tenant: 'repsol', host: 'wd3', site: 'Repsol', name: 'Repsol', verified: true },
  { tenant: 'iberdrola', host: 'wd3', site: 'Iberdrola', name: 'Avangrid / Iberdrola', verified: true },
  { tenant: 'eosenergystorage', host: 'wd1', site: 'EoS', name: 'Eos Energy Enterprises', verified: true },
  { tenant: 'hitachi', host: 'wd1', site: 'hitachi', name: 'Hitachi Energy USA', verified: true },

  // September 17, 2026 — active taxonomy-matching boards.
  { tenant: 'prologis', host: 'wd5', site: 'Prologis_External_Careers', name: 'Prologis', verified: true },
  { tenant: 'powerdesigninc', host: 'wd5', site: 'pdi', name: 'Power Design', verified: true },
  { tenant: 'evs', host: 'wd108', site: 'evsengineeringcareers', name: 'EVS', verified: true },
];

// ───────────────────────────────────────────────────────────
// GREENHOUSE  →  https://boards-api.greenhouse.io/v1/boards/{slug}/jobs
// JSON API publique. Très agrégé (Indeed/LinkedIn l'indexent) mais c'est
// LE seul ATS avec une vraie densité de jobs solar installer/technician.
// ───────────────────────────────────────────────────────────
export const GREENHOUSE_COMPANIES: AtsCompanySeed[] = [
  { slug: 'origisenergy', name: 'Origis Energy', verified: true },
  // September 17, 2026 — active taxonomy-matching boards.
  { slug: 'madisonenergyinfrastructure', name: 'Madison Energy Infrastructure', verified: true },
  { slug: 'clenera', name: 'Clēnera', verified: true },
  { slug: 'newleafenergy', name: 'New Leaf Energy', verified: true },
  { slug: 'arevonenergyimpltest', name: 'Arevon Energy', verified: true },
  { slug: 'avantus', name: 'Avantus', verified: true },
  { slug: 'smaamerica', name: 'SMA America', verified: true },
  { slug: 'adapturerenewables', name: 'Adapture Renewables', verified: true },
  { slug: 'pearceservices', name: 'Pearce Services', verified: true },
  { slug: 'clearwayjobs', name: 'Clearway Energy', verified: true },
  { slug: 'origisenergytechs', name: 'Origis Energy Services', verified: true },
  { slug: 'hanwhaconvergence', name: 'Hanwha Convergence USA', verified: true },
  { slug: 'posigen', name: 'PosiGen', verified: true },
  { slug: 'palmettocleantech', name: 'Palmetto Clean Tech', verified: true },
  { slug: 'ampliform', name: 'Ampliform', verified: true },

  // Re-verified September 2026.
  { slug: 'swiftsolar', name: 'Swift Solar', verified: true },
  { slug: 'energysolutions', name: 'Energy Solutions', verified: true },

  // Keep disabled until a current board/source is re-verified.
  { slug: 'coastenergy', name: 'Coast Energy', verified: false },
  { slug: 'kineticsolarcareers', name: 'Kinetic Solar', verified: false },
  { slug: 'soligent', name: 'Soligent', verified: false },
  { slug: '3mgroofing', name: '3M Roofing', verified: false },

  { slug: 'fluenthome', name: 'Fluent Solar', verified: true },
  { slug: 'brightcoreenergy', name: 'Brightcore Energy', verified: true },
  { slug: 'sunnova', name: 'Sunnova Energy', verified: true },
  { slug: 'siliconranch', name: 'Silicon Ranch', verified: true },
  { slug: 'reactivate', name: 'Reactivate', verified: true },
  { slug: 'nexamp', name: 'Nexamp', verified: true },
  { slug: 'cypresscreekrenewables', name: 'Cypress Creek Renewables', verified: true },

  // September 2026 expansion.
  { slug: 'pinegaterenewables', name: 'Pine Gate Renewables', verified: true },
  { slug: 'redwoodmaterials', name: 'Redwood Materials', verified: true },
  { slug: 'atwellgroup', name: 'Atwell', verified: true },
  { slug: 'resonantenergy', name: 'Resonant Energy', verified: true },
  { slug: 'ipxpower', name: 'IPX Power', verified: true },
  { slug: 'aypapower', name: 'Aypa Power', verified: true },
  { slug: 'onenergy', name: 'ON.energy', verified: true },

  // September 16, 2026 — solar/BESS employer expansion.
  { slug: 'pluspower', name: 'Plus Power', verified: true },
  { slug: 'byd', name: 'BYD North America', verified: true },
  { slug: 'michelscorporation', name: 'Michels Corporation', verified: true },
  { slug: 'energyprojectsolutionsllc', name: 'Energy Project Solutions', verified: true },
  { slug: 'amn', name: 'ARCO/Murray', verified: true },
  { slug: 'hanwhaenergyusa', name: 'Hanwha Energy USA', verified: true },
  { slug: 'actpowerservices', name: 'ACT Power Services', verified: true },
  { slug: 'aksengineeringforestryllc', name: 'AKS Engineering & Forestry', verified: true },
  { slug: 'gotion', name: 'Gotion', verified: true },
  { slug: 'orenda', name: 'Orenda', verified: true },
];

// Dedicated ATS sources added in the September 2026 employer refresh.
export const HRMDIRECT_COMPANIES: HrmDirectCompanySeed[] = [
  { subdomain: 'momentumsolar', name: 'Momentum Solar', verified: true },
];

export const SAASHR_COMPANIES: SaaShrCompanySeed[] = [
  {
    careersUrl: 'https://secure10.saashr.com/ta/6186826.careers?CareersSearch=&lang=en-US',
    name: 'ReVision Energy',
    verified: true,
  },
];



/**
 * Provider labels included by `seed-solar-jobs.ts new-sources`.
 * Labels intentionally match the provider registry so this command cannot
 * expand to older companies that happen to use the same ATS.
 */
export const NEW_SOURCE_KEYS_BY_PROVIDER: Readonly<Record<string, readonly string[]>> = {
  workday: [
    // Previous refresh
    'sunrun/Sunrun_Careers',
    'aes/aes_clean_energy',
    'solvenergy/SOLV_External_Career',
    'mosscm/Moss_Careers',
    'blattner/BlattnerCompany',
    'illuminateusa/Illuminate_Careers',
    'ameresco/Ameresco',
    // September expansion / corrections
    'nextracker/nextpower_careers',
    'prim/Primoris',
    'invenergyllc/invenergyservices',
    'leewardenergy/LeewardCareers',
    'acciona/ACCIONA_Employment_Channel',
    'gafsgi/GAF_Careers',
    // September 16 BESS/solar expansion
    'fluenceenergy/fluenceenergy-jobs',
    'gevernova/Vernova_ExternalSite',
    'williams/external',
    'repsol/Repsol',
    'iberdrola/Iberdrola',
    'eosenergystorage/EoS',
    'hitachi/hitachi',
  ],

  jazzhr: [
    'cleancapital',
    'brooklynsolarworks',
    'clarkbrosinc',
    'slettenconstruction',
    'melinksolarllc',
    'calsolar',
    'hayselectricalservices',
    'suntribegroup',
    'greenrack',
    // September 16 batch 3
    'spruce',
    // September 16 BESS/solar expansion
    'ravenvolt',
    'solargaines',
    'ipsunsolar',
    'r2contractors',
    'esvolta',
    'newedgepower',
    // September 18, 2026 — 30-company US active-solar batch
    'cleanchoiceenergy',
    'sunkeepersolar',
    'inmansolarllc',
    'sunstrongmanagementllc',
    'wattch',
    'kwhanalytics',
    'sungagefinancial',
    'keycaptureenergyllc',

  ],

  breezy: [
    'spark-power',
    'renewable-properties',
    'sunenergy1',
    'planted-solar-inc',
    // September 16 BESS/solar expansion
    'echelon-solar-power',
    'summit-solar-solutions',
    'breakthrough-inventions',
    'barupon-llc',
    'vikta-energy-technologies-llc',
    'ceg-solutions-llc',
    'delan-associates-inc',
    'rinvio',
    'south-mountain-company',
  ],

  rippling: [
    'spartanx-llc',
    'ethical-energy',
    // September 16 BESS/solar expansion (verified only)
    'external-job-board',
    'anza-re-llc',
    'desri-careers',
    'terra-energy',
    'peak-power-careers',
    'elevate-infrastructure',
    'alderbuck-energy',
    'stem-inc',
    // September 18, 2026 — 30-company US active-solar batch
    'bluewave',
    'raptor-maps-inc',

  ],

  smartrecruiters: [
    'AECOM2',
    'KnobelsdorffEnterprises',
    'ApexCleanEnergy',
    'CoffmanEngineersInc',
    // September 16 BESS/solar expansion
    'TurnerTownsend',
    'CIMA2',
    'VeoliaEnvironnementSA',
    'Akuo',
    'SolarisOilfieldInfrastructureLLC',
    'SolectriaRenewables',
  ],

  jobvite: [
    'resgroup',
    'mccarthy-building-co',
    'canadian-solar',
    // September 18, 2026 — 30-company US active-solar batch
    'freedomforever',

  ],

  lever: [
    'solarlandscape',
    'freedomsolarpower',
    'intersect',
    'ScaleMicrogridSolutions',
    'ans',
    'pivotenergy',
    // September 16 BESS/solar expansion (verified only)
    'EnergyVault',
    'highlandfleets-2',
    'stanleygroup',
    // September 18, 2026 — 30-company US active-solar batch
    'omnidian',
    'solestial',

  ],

  workable: [
    'solamerica-energy',
    // September 18, 2026 — 30-company US active-solar batch
    'nautilus-solar-energy',
    'urban-grid-solar-projects',
    'emc-renewables',
    'terabase-energy',
    'solar-energy-solutions',

  ],

  paylocity: [
    'https://recruiting.paylocity.com/recruiting/jobs/All/c4ba1261-9dee-44e1-b5fd-5f8cb4ee222e/Cinterra',
    'https://recruiting.paylocity.com/recruiting/jobs/All/c5e83770-485a-47a0-8c36-e90052697f24/Longroad-Energy',
    'https://recruiting.paylocity.com/recruiting/jobs/All/b2a7f4b0-6223-4b95-8476-22c44d181d6e/Good-Faith-Energy-LLC',
    'https://recruiting.paylocity.com/recruiting/jobs/All/9bf70b29-36ba-44de-9aa2-61fae83b9754/Suncommon-II',
    // September 16 BESS/solar expansion
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/d76583f8-99cd-4e70-aa50-2c32e3a2c89f',
    'https://recruiting.paylocity.com/recruiting/jobs/All/beb45816-0dc5-4766-be9d-3740bb246f1d/SunVena',
    'https://recruiting.paylocity.com/recruiting/jobs/All/f97ca7a9-2c71-4165-ac4b-99be376bf133/Mountain-West-Consulting-LLC',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/fe76e83d-cadf-4f52-8fc8-9176193b6cf7',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/07cc4409-b63f-4768-90f1-959de7ebcbd3',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/37385a16-75f5-463b-b128-e6557388e1d5',
    'https://recruiting.paylocity.com/recruiting/jobs/All/c8df5b74-b285-49da-8d1b-d9addb903703/Takkion-Ops-Management-LLC',
    'https://recruiting.paylocity.com/recruiting/jobs/All/da4c1284-8a59-42da-af17-117263500d30/ENERGYRE-LLC',
    'https://recruiting.paylocity.com/recruiting/jobs/All/8670063c-d4c1-4e94-b162-864b77affca0/VIKOR',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/2b105ca3-bec2-4323-9060-d50ed806bd41',
    'https://recruiting.paylocity.com/recruiting/jobs/All/f395f4ed-90b7-49c2-a37e-12c399e2fb38/TLN-Worldwide-Enterprises-Inc',
    'https://recruiting.paylocity.com/recruiting/jobs/All/93ee960e-a646-44a8-98d5-a30133955d99/ARM-Group-LLC',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/936ec85a-88bb-46e9-ba9b-53182d7b45e0',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/e14a6507-3004-41e9-bafb-cb71d9a89bcd',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/9ca1af84-56c5-4e9e-8014-70297cab5703',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/f6bd759b-059e-47eb-8ffb-d1e4c090542c',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/e607dd53-0424-4e17-8fe3-ce26efc95470',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/fdafc526-aaaf-48f9-833d-8aa4540ccb7a',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/664f02ad-152d-48ea-9ca5-df49eec805df',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/63949cc3-d39a-464d-8735-cb9e7dd16367',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/3bd0602e-cc8c-4df1-8dac-c8a4e2c52178',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/8621004a-7a46-404c-aa9a-8b2bd393de65',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/c6dfa158-1325-4b9a-8a3f-4eb66d4dc903',
    // September 18, 2026 — 30-company US active-solar batch
    'https://recruiting.paylocity.com/recruiting/jobs/All/c8c3eee1-dc50-471c-976c-a5a3aa36568c/Perch-Energy',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/08eac160-0a1e-4180-8eb0-8381757e63b5',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/4983d57a-d944-4691-a600-8d7a4ee2b26f',

  ],

  greenhouse: [
    // Previous refresh
    'siliconranch',
    'palmettocleantech',
    'origisenergy',
    'arevonenergyimpltest',
    'reactivate',
    'nexamp',
    'cypresscreekrenewables',
    // September expansion / corrections
    'swiftsolar',
    'energysolutions',
    'pinegaterenewables',
    'redwoodmaterials',
    'atwellgroup',
    'resonantenergy',
    'ipxpower',
    'aypapower',
    'onenergy',
    // September 16 BESS/solar expansion
    'pluspower',
    'byd',
    'michelscorporation',
    'energyprojectsolutionsllc',
    'amn',
    'hanwhaenergyusa',
    'actpowerservices',
    'aksengineeringforestryllc',
    'gotion',
    'orenda',
  ],

  ashby: [
    // September 16 BESS/solar expansion (verified only)
    'techne-elysia',
    'formenergy',
    'American%20Terawatt',
    'odin-dynamics',
    'base-power',
    'tar',
    'rowan',
    // September 18, 2026 — 30-company US active-solar batch
    'aurorasolar',
    'inductive-automation-llc',

  ],

  icims: [
    // September 16 BESS/solar expansion (verified only)
    'https://careers-nv5.icims.com',
    'https://careers-sargentlundy.icims.com',
    'https://careers2-quanta.icims.com#Quanta Power Solutions',
    'https://careers-patternenergy.icims.com',
    'https://careers-kimley-horn.icims.com',
    'https://careers-dudek.icims.com',
    'https://careers-exponent.icims.com',
    'https://careers-aeieng.icims.com',
    'https://frfrench-equans.icims.com',
    'https://careers-us-shermco.icims.com',
  ],

  adp: [
    'd31a40ed-72d3-492d-b16f-7abf4b880e74',
    'cbb9afbc-3dc4-4794-b760-b21538c65f8a',
    'c7e5e3e5-2d79-441c-bd1d-024d20e8a297',
  ],

  hrmdirect: ['momentumsolar'],

  successfactors: [
    'https://jobs.nexteraenergy.com',
    'https://jobs.edp.com',
    'https://careers.lightsourcebp.com',
    'https://careers.bv.com',
    'https://jobs.kochcareers.com',
    // September 18, 2026 — 30-company US active-solar batch
    'https://careers.pcl.com',
    'https://kiewitcareers.kiewit.com',
    'https://careers.dominionenergy.com',
    'https://jobs.entergy.com',
    'https://careers.aps.com',
    'https://careers.pge.com',
    'https://careers.nrgenergy.com',

  ],

  oraclecloud: [
    'https://fa-esbv-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1',
    'https://fa-essf-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1',
    // September 16 BESS/solar expansion
    'https://fa-eups-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/ULSolutionsCareers',
  ],

  ukg: [
    'https://onestrata.rec.pro.ukg.net/STR1027SSOL/JobBoard/95da68de-9d94-406f-9c99-aa8627d1e992',
    'https://recruiting.ultipro.com/SIG1007SGEN/JobBoard/1d63bc67-2233-4c90-b4e5-2ebdcffb3021',
  ],

  paycom: ['FEA94D4A9CE8BC5311CB1583A27A2B8D'],
  saashr: ['https://secure10.saashr.com/ta/6186826.careers?CareersSearch=&lang=en-US'],
};


/** The 30 ATS companies added on September 18, 2026 after active US solar-job verification. */
export const NEW_30_SOURCE_KEYS_BY_PROVIDER: Readonly<Record<string, readonly string[]>> = {
  jazzhr: [
    'cleanchoiceenergy',
    'sunkeepersolar',
    'inmansolarllc',
    'sunstrongmanagementllc',
    'wattch',
    'kwhanalytics',
    'sungagefinancial',
    'keycaptureenergyllc',
  ],
  rippling: ['bluewave', 'raptor-maps-inc'],
  successfactors: [
    'https://careers.pcl.com',
    'https://kiewitcareers.kiewit.com',
    'https://careers.dominionenergy.com',
    'https://jobs.entergy.com',
    'https://careers.aps.com',
    'https://careers.pge.com',
    'https://careers.nrgenergy.com',
  ],
  ashby: ['aurorasolar', 'inductive-automation-llc'],
  lever: ['omnidian', 'solestial'],
  workable: [
    'nautilus-solar-energy',
    'urban-grid-solar-projects',
    'emc-renewables',
    'terabase-energy',
    'solar-energy-solutions',
  ],
  jobvite: ['freedomforever'],
  paylocity: [
    'https://recruiting.paylocity.com/recruiting/jobs/All/c8c3eee1-dc50-471c-976c-a5a3aa36568c/Perch-Energy',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/08eac160-0a1e-4180-8eb0-8381757e63b5',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/4983d57a-d944-4691-a600-8d7a4ee2b26f',
  ],
};

/** Exact providers from the September 19, 2026 requested ATS batch. */
export const NEW_ATS_2026_09_19_SOURCE_KEYS_BY_PROVIDER: Readonly<Record<string, readonly string[]>> = {
  successfactors: ['https://jobs.nexteraenergy.com'],
  'custom-scrape': ['www.tesla.com'],
  greenhouse: ['onenergy', 'pearceservices'],
  paylocity: [
    'https://recruiting.paylocity.com/recruiting/jobs/All/76521e27-2487-44e7-9da3-015c68858b91/Terra--Gen-Operating-Company-LLC',
  ],
  workday: ['aes/AES_US'],
  rippling: ['clean-energy-services-careers'],
  jobvite: ['enphase-energy'],
};

/** The 34 ATS companies from the preceding September 2026 batch. */
export const NEW_34_SOURCE_KEYS_BY_PROVIDER: Readonly<Record<string, readonly string[]>> = {
  jazzhr: [
    'cleancapital',
    'brooklynsolarworks',
    'clarkbrosinc',
    'slettenconstruction',
    'melinksolarllc',
    'calsolar',
    'hayselectricalservices',
    'suntribegroup',
    'greenrack',
  ],
  breezy: ['spark-power', 'renewable-properties', 'sunenergy1', 'planted-solar-inc'],
  rippling: ['spartanx-llc', 'ethical-energy'],
  successfactors: ['https://jobs.edp.com'],
  smartrecruiters: ['ApexCleanEnergy', 'CoffmanEngineersInc'],
  lever: ['ScaleMicrogridSolutions', 'ans', 'pivotenergy'],
  jobvite: ['mccarthy-building-co'],
  adp: ['d31a40ed-72d3-492d-b16f-7abf4b880e74'],
  ukg: ['https://recruiting.ultipro.com/SIG1007SGEN/JobBoard/1d63bc67-2233-4c90-b4e5-2ebdcffb3021'],
  workday: [
    'leewardenergy/LeewardCareers',
    'acciona/ACCIONA_Employment_Channel',
    'gafsgi/GAF_Careers',
  ],
  greenhouse: [
    'pinegaterenewables',
    'redwoodmaterials',
    'atwellgroup',
    'resonantenergy',
    'ipxpower',
    'aypapower',
    'onenergy',
  ],
};

/**
 * Exact ATS labels for the 98-company September 16 expansion.
 * Shared iCIMS tenants include the category in their key so this command
 * cannot pull another company hosted on the same tenant.
 */
export const NEW_98_SOURCE_KEYS_BY_PROVIDER: Readonly<Record<string, readonly string[]>> = {
  jazzhr: [
    'ravenvolt',
    'solargaines',
    'ipsunsolar',
    'r2contractors',
    'esvolta',
    'newedgepower',
  ],
  breezy: [
    'echelon-solar-power',
    'summit-solar-solutions',
    'breakthrough-inventions',
    'barupon-llc',
    'vikta-energy-technologies-llc',
    'ceg-solutions-llc',
    'delan-associates-inc',
    'rinvio',
    'south-mountain-company',
  ],
  rippling: [
    'external-job-board',
    'anza-re-llc',
    'desri-careers',
    'dynamic-slr',
    'terra-energy',
    'peak-power-careers',
    'elevate-infrastructure',
    'alderbuck-energy',
    'stem-inc',
  ],
  ashby: [
    'techne-elysia',
    'formenergy',
    'American%20Terawatt',
    'odin-dynamics',
    'red-tree-engineering',
    'base-power',
    'tar',
    'rowan',
  ],
  smartrecruiters: [
    'TurnerTownsend',
    'CIMA2',
    'VeoliaEnvironnementSA',
    'Akuo',
    'SolarisOilfieldInfrastructureLLC',
    'SolectriaRenewables',
  ],
  lever: ['EnergyVault', 'camsrenewableservices', 'highlandfleets-2', 'stanleygroup'],
  jobvite: ['epma'],
  oraclecloud: [
    'https://fa-eups-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/ULSolutionsCareers',
  ],
  paylocity: [
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/d76583f8-99cd-4e70-aa50-2c32e3a2c89f',
    'https://recruiting.paylocity.com/recruiting/jobs/All/beb45816-0dc5-4766-be9d-3740bb246f1d/SunVena',
    'https://recruiting.paylocity.com/recruiting/jobs/All/f97ca7a9-2c71-4165-ac4b-99be376bf133/Mountain-West-Consulting-LLC',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/fe76e83d-cadf-4f52-8fc8-9176193b6cf7',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/07cc4409-b63f-4768-90f1-959de7ebcbd3',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/37385a16-75f5-463b-b128-e6557388e1d5',
    'https://recruiting.paylocity.com/recruiting/jobs/All/c8df5b74-b285-49da-8d1b-d9addb903703/Takkion-Ops-Management-LLC',
    'https://recruiting.paylocity.com/recruiting/jobs/All/da4c1284-8a59-42da-af17-117263500d30/ENERGYRE-LLC',
    'https://recruiting.paylocity.com/recruiting/jobs/All/8670063c-d4c1-4e94-b162-864b77affca0/VIKOR',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/2b105ca3-bec2-4323-9060-d50ed806bd41',
    'https://recruiting.paylocity.com/recruiting/jobs/All/f395f4ed-90b7-49c2-a37e-12c399e2fb38/TLN-Worldwide-Enterprises-Inc',
    'https://recruiting.paylocity.com/recruiting/jobs/All/93ee960e-a646-44a8-98d5-a30133955d99/ARM-Group-LLC',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/936ec85a-88bb-46e9-ba9b-53182d7b45e0',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/e14a6507-3004-41e9-bafb-cb71d9a89bcd',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/9ca1af84-56c5-4e9e-8014-70297cab5703',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/f6bd759b-059e-47eb-8ffb-d1e4c090542c',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/e607dd53-0424-4e17-8fe3-ce26efc95470',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/fdafc526-aaaf-48f9-833d-8aa4540ccb7a',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/664f02ad-152d-48ea-9ca5-df49eec805df',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/63949cc3-d39a-464d-8735-cb9e7dd16367',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/3bd0602e-cc8c-4df1-8dac-c8a4e2c52178',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/8621004a-7a46-404c-aa9a-8b2bd393de65',
    'https://recruiting.paylocity.com/Recruiting/Jobs/All/c6dfa158-1325-4b9a-8a3f-4eb66d4dc903',
  ],
  icims: [
    'https://ceisvcareers-mastec.icims.com#MasTec Renewables / IEA',
    'https://careers-nv5.icims.com',
    'https://careers-sargentlundy.icims.com',
    'https://careers2-quanta.icims.com#NorthStar Energy Solutions',
    'https://careers2-quanta.icims.com#Quanta Power Solutions',
    'https://careers-patternenergy.icims.com',
    'https://careers-kimley-horn.icims.com',
    'https://careers-dudek.icims.com',
    'https://careers2-quanta.icims.com#Henkels & McCoy',
    'https://careers-exponent.icims.com',
    'https://careers-aeieng.icims.com',
    'https://frfrench-equans.icims.com',
    'https://careers-us-shermco.icims.com',
    'https://ceisvcareers-mastec.icims.com#William Charles Electric',
  ],
  workday: [
    'fluenceenergy/fluenceenergy-jobs',
    'gevernova/Vernova_ExternalSite',
    'williams/external',
    'repsol/Repsol',
    'iberdrola/Iberdrola',
    'eosenergystorage/EoS',
    'hitachi/hitachi',
  ],
  greenhouse: [
    'pluspower',
    'byd',
    'michelscorporation',
    'energyprojectsolutionsllc',
    'amn',
    'hanwhaenergyusa',
    'actpowerservices',
    'aksengineeringforestryllc',
    'gotion',
    'orenda',
  ],
};
