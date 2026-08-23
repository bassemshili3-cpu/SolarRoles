import type { CustomScrapeSeed } from './types';

/**
 * One entry per domain. Add selectors only after inspecting the careers page;
 * omitted selectors intentionally use the generic discovery/detail heuristics.
 */
export const CUSTOM_SCRAPE_COMPANIES: CustomScrapeSeed[] = [
  {
    provider: 'custom-scrape',
    companyName: 'Solar CCS',
    careersUrl: 'https://www.solarccs.com/careers',
    domain: 'www.solarccs.com',
    verified: false,
    status: 'needs_review',
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
