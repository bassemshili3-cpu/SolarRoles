import type { CustomScrapeSeed } from './types';

/**
 * One entry per domain. Add selectors only after inspecting the careers page;
 * omitted selectors intentionally use the generic discovery/detail heuristics.
 */
export const CUSTOM_SCRAPE_COMPANIES: CustomScrapeSeed[] = [
  
  {
    provider: 'custom-scrape',
    companyName: 'Solar.com',
    careersUrl: 'https://www.solar.com/careers/',
    domain: 'www.solar.com',
    verified: true,
status: 'active',
    // Solar.com is a reviewed solar employer; its remote product, pricing and
    // installer-partnership roles are in scope even when their title is not an
    // installer title.
    skipRoleFilter: true,
  },
  {
    provider: 'custom-scrape',
    companyName: 'Sierra Pacific Home & Comfort',
    careersUrl: 'https://www.sierrapacifichome.com/contact/careers',
    domain: 'www.sierrapacifichome.com',
   verified: true, 
  status: 'active',
    // The page also links to incomplete isolvedhire.com duplicates. Keep the
    // provider-hosted detail pages, which contain the full description and
    // location needed for JobPosting.
    jobPageHosts: ['www.sierrapacifichome.com'],
    // Sierra Pacific is multi-trade, so do not bypass the taxonomy globally.
    // These roles were manually reviewed as relevant to its solar activity.
    includeJobTitles: [
      'Install helper / General laborer',
      'Sales',
      'Electrical Operations Manager',
    ],
  },
  {
    provider: 'custom-scrape',
    companyName: 'Solar Tech Elec LLC',
    careersUrl: 'https://solartechelec.com/careers/',
    domain: 'solartechelec.com',
    verified: true, 
  status: 'active',
    jobPageHosts: ['solartechelec.com'],
    jobPagePathPrefixes: ['/careers/'],
    selectors: {
      // The three cards share an "Apply Now" label. The path restriction on
      // the seed keeps only their three destination links.
      listItem: 'a.bde-button__button',
      link: 'a.bde-button__button',
    },
    // Their sales pages disclose state eligibility but not an employment type.
    // Keep this exception scoped to this manually reviewed solar employer.
    allowMissingEmploymentType: true,
    includeJobTitles: ['Virtual Sales Agents'],
    locationVariants: [
      {
        urlPath: '/careers/solar-electrician-with-project-management-careers/',
        locations: [{ location: 'Central Florida', addressRegion: 'FL' }],
      },
      {
        urlPath: '/careers/virtual-sales-agents/',
        isRemote: true,
        locations: [
          { location: 'Florida', addressRegion: 'FL' },
          { location: 'Texas', addressRegion: 'TX' },
        ],
      },
      {
        urlPath: '/careers/solar-sales-consultant/',
        locations: [
          { location: 'Florida', addressRegion: 'FL' },
          { location: 'Texas', addressRegion: 'TX' },
        ],
      },
    ],
  },
  {
    provider: 'custom-scrape',
    companyName: 'Solar CCS',
    careersUrl: 'https://www.solarccs.com/careers',
    domain: 'www.solarccs.com',
      verified: true, 
  status: 'active',
    // Example for a site with stable markup:
    // selectors: { listItem: '.job-card', title: 'h1', link: 'a', description: 'main', location: '.location' },
  },

 {
  provider: 'custom-scrape',
  companyName: 'Venture Solar',
  careersUrl: 'https://venturesolar.applytojob.com',
  domain: 'venturesolar.applytojob.com',
  verified: true, // reste false tant que le dry-run n'a pas validé, comme le veut le commentaire du type
  status: 'active',
  // pas de selectors : JSON-LD JobPosting déjà géré par le générique
},

];
