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
  // ★ Résidentiel Solar Installer, NY (Hicksville) — $20-30/hr
  { slug: 'venturesolar', name: 'Venture Solar', verified: true },
  { slug: 'teamsunshineconstructionllc', name: 'Team Sunshine Construction', verified: true, includeJobTitles: ['Solar Appointment Setter'] },
  { slug: 'lplsolarllc', name: 'LPL Solar', verified: true },
  { slug: 'powerflex', name: 'PowerFlex', verified: true },
  { slug: 'vanguardenergypartnersllc', name: 'Vanguard Energy Partners', verified: true },
];

// Breezy HR - https://<slug>.breezy.hr/
// Public career pages verified; ingested by the dedicated Breezy connector.
// Include relevant solar roles regardless of remote status.
export const BREEZY_COMPANIES: AtsCompanySeed[] = [
  { slug: 'sunlove-solar', name: 'Reach', verified: true },
  { slug: 'solar-pros', name: 'Solar Pros / Freedom Pros', verified: true },
  { slug: 'salesdraft-recruiting', name: 'SalesDraft Recruiting', verified: true },
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
    name: 'NextEra Energy',
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
];

export const SMARTRECRUITERS_COMPANIES: AtsCompanySeed[] = [
  { slug: 'KingspanEnergy',    name: 'Kingspan Energy',          verified: true }, // ★ Ops Manager Solar/Lighting CT
  { slug: 'ib-vogt-gmbh',      name: 'ib vogt GmbH',             verified: true }, // ★ Solar & BESS Engineer APAC
  { slug: 'EcoEnergySolutions',name: 'EcoEnergy Solutions',      verified: true }, // Solar Technician Pakistan
  { slug: 'WunderCapital',     name: 'Wunder Capital',           verified: true },
  { slug: 'SilfabSolar',       name: 'Silfab Solar',             verified: true },
  { slug: 'AECOM2',       name: 'AECOM',              verified: false },


  { slug: 'knobelsdorffenterprises', name: 'Knobelsdorff', verified: false }, // ★ solar EPC/O&M — verify ATS
];

// Lever — jobs.lever.co/<slug>
export const LEVER_COMPANIES: AtsCompanySeed[] = [
  // ── déjà en seed ──
  { slug: 'freedomsolarpower', name: 'Freedom Solar Power', verified: true },
  { slug: 'goodleap', name: 'GoodLeap', verified: true },
  { slug: 'octoenergy', name: 'Octopus Energy Group', verified: true },
  { slug: 'intersect', name: 'Intersect', verified: true },

  // ── residential installers US ──
  { slug: 'semper-solaris', name: 'Semper Solaris', verified: true },
  { slug: 'solar-optimum', name: 'Solar Optimum', verified: true },

  // ── commercial / utility-scale EPC ──
  { slug: 'mortenson', name: 'Mortenson', verified: true },

  // ── battery / storage + solar ──
  { slug: 'sonnen', name: 'sonnen', verified: true },

  // ── clean energy platforms (hire field ops) ──
  { slug: 'generate-capital', name: 'Generate Capital', verified: true },

  // ── additional companies ──
  { slug: 'smartenergy', name: 'Smart Energy', verified: true }, // ★ verify Lever
  { slug: 'solarlandscape', name: 'Solar Landscape', verified: true }, // ★ solar installer
  { slug: 'exowatt', name: 'Exowatt', verified: true }, // ★ solar installer — verify Lever
  { slug: 'bonedry', name: 'Bone Dry', verified: true }, // ★ solar + roofing — verify Lever
  { slug: 'disher', name: 'Disher', verified: true }, // ★ solar installer — verify Lever
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
  // Field Service Tech Solar/PV
  { slug: 'enphase-energy', name: 'Enphase Energy',  verified: true  },
  // Solar Field Engineer / Tech utility-scale
  { slug: 'resgroup',       name: 'RES',             verified: true  },
  { slug: 'cei',            name: 'Cupertino Electric', verified: true },
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
];

// ADP Workforce Now — public Career Center JSON API.
export const ADP_COMPANIES: AdpCompanySeed[] = [
  {
    cid: 'b5d87377-1bbe-4787-8322-eb5c7abdc9c7',
    name: 'NovaSource Power Services',
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
];

// Paycom — public client career portal rendered by the current Paycom SPA.
export const PAYCOM_COMPANIES: PaycomCompanySeed[] = [
  {
    clientKey: 'BBC98E01F1F27C80A5FDE6ABEECA4271',
    name: 'Shoals Technologies',
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
];



// WORKDAY  →  https://{tenant}.{host}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs
// Gros installateurs/EPC nationaux — pas de "slug" unique, il faut les
// 3 valeurs (tenant/host/site). NE PAS mettre verified:true sans avoir
// réellement testé le fetch — c'est le piège qu'on a mis des heures à
// débusquer sur company-seed Greenhouse (posigen, fluenthome...).
// ───────────────────────────────────────────────────────────
export const WORKDAY_COMPANIES: WorkdayCompanySeed[] = [
  // ★★★ confirmé — page carrière + tenant Workday vérifiés le 29/07/2026 
  { tenant: 'sunrun', host: 'wd5', site: 'Sunrun_Careers', name: 'Sunrun', verified: true },
  { tenant: 'arraytechinc', host: 'wd5', site: 'Array_Careers', name: 'Array Technologies', verified: true },
  { tenant: 'blattner', host: 'wd5', site: 'BlattnerCompany', name: 'Blattner', verified: true },
  { tenant: 'recurrentenergy', host: 'wd12', site: 'RecurrentEnergy', name: 'Recurrent Energy', verified: true },
  { tenant: 'illuminateusa', host: 'wd503', site: 'Illuminate_Careers', name: 'Illuminate USA', verified: true },

  { tenant: 'aes', host: 'wd1', site: 'AES_US', name: 'AES', verified: false }, // ★ utility-scale solar/energy storage
  { tenant: 'nextracker', host: 'wd5', site: 'nextpower_careers', name: 'Nextracker', verified: false }, // ★ solar tracker systems
  { tenant: 'igsenergy', host: 'wd1', site: 'IGS', name: 'IGS Energy', verified: false }, // ★ solar installer
  { tenant: 'faithtechnologies', host: 'wd1', site: 'FTI', name: 'Faith Technologies', verified: false }, // ★ electrical/solar contractor
  { tenant: 'solvenergy', host: 'wd1', site: 'SOLV_External_Career', name: 'SOLV Energy', verified: false },
  { tenant: 'prim', host: 'wd108', site: 'Primoris', name: 'Primoris', verified: false }, // ★ solar/energy — verify tenant/host
  { tenant: 'mosscm', host: 'wd1', site: 'Moss_Careers', name: 'Moss Construction', verified: false }, // ★ solar EPC

  // ⚠️ tenant/host repérés via un lien de login sur rosendin.com/careers,
  // mais l'endpoint /wday/cxs/.../jobs n'a PAS encore été testé en
  // direct — "site" est une déduction (probablement 'Careers'), à
  // confirmer avant de faire confiance à ce verified:true.
  { tenant: 'rosendin', host: 'wd1', site: 'Careers', name: 'Rosendin Electric', verified: false },
  { tenant: 'enbridge', host: 'wd3', site: 'enbridge_careers', name: 'Enbridge', verified: false },
  { tenant: 'canadiansolar', host: 'wd5', site: 'CanadianSolar', name: 'Canadian Solar', verified: false },
  { tenant: 'invenergyllc', host: 'wd3', site: 'invenergycareers', name: 'Invenergy', verified: false },
];

// ───────────────────────────────────────────────────────────
// GREENHOUSE  →  https://boards-api.greenhouse.io/v1/boards/{slug}/jobs
// JSON API publique. Très agrégé (Indeed/LinkedIn l'indexent) mais c'est
// LE seul ATS avec une vraie densité de jobs solar installer/technician.
// ───────────────────────────────────────────────────────────
export const GREENHOUSE_COMPANIES: AtsCompanySeed[] = [
  { slug: 'origisenergy', name: 'Origis Energy', verified: true },
  { slug: 'madisonenergyinfrastructure', name: 'Madison Energy Infrastructure', verified: true },
  { slug: 'clenera', name: 'Clēnera', verified: true },
  { slug: 'newleafenergy', name: 'New Leaf Energy', verified: true },
  { slug: 'arevonenergyimpltest', name: 'Arevon Energy', verified: true },
  { slug: 'avantus', name: 'Avantus', verified: true },
  { slug: 'smaamerica', name: 'SMA America', verified: true },
  { slug: 'adapturerenewables', name: 'Adapture Renewables', verified: true },
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
  { slug: 'sunnova',          name: 'Sunnova Energy',          verified: true }, // ★ major residential solar — confirmed Greenhouse
  { slug: '3mgroofing',       name: '3M Roofing',              verified: false }, // ★ solar + roofing — verify Greenhouse
];
