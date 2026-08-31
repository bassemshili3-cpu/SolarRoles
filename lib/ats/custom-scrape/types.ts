export type CustomScrapeSelectors = {
  listItem?: string;
  title?: string;
  link?: string;
  description?: string;
  location?: string;
  employmentType?: string;
  /** Link to the next listing page; falls back to rel=next and common pagination markup. */
  nextPage?: string;
  /** Button that progressively loads more cards; enables the Playwright listing fallback. */
  loadMore?: string;
};

/** A manually curated careers site that does not expose a supported ATS feed. */
export type CustomScrapeSeed = {
  provider: 'custom-scrape';
  companyName: string;
  careersUrl: string;
  domain: string;
  /** Never set automatically: validate output with the dry-run first. */
  verified: boolean;
  status: 'active' | 'paused' | 'needs_review';
  selectors?: CustomScrapeSelectors;
  /** Allow every role for a manually reviewed, sector-specific employer. */
  skipRoleFilter?: boolean;
  /** Exact role titles manually approved beyond the shared solar taxonomy. */
  includeJobTitles?: string[];
  /** Source was manually reviewed but does not display an employment type. */
  allowMissingEmploymentType?: boolean;
  /** Enrich one detailed offer with its explicitly listed eligible/work regions. */
  locationVariants?: Array<{
    urlPath: string;
    locations: Array<{ location: string; addressRegion: string }>;
    /** Manually verified fully-remote role; each variant retains its stated eligible region. */
    isRemote?: boolean;
  }>;
  /** Restrict detailed offer pages to these hostnames when a careers page links to noisy ATS duplicates. */
  jobPageHosts?: string[];
  /** Restrict detailed offer pages to URL path prefixes after hostname filtering. */
  jobPagePathPrefixes?: string[];
  /** Safety cap for listing pagination / load-more clicks. Defaults to 10. */
  maxListingPages?: number;
};

export type CustomScrapeOutcome =
  | 'extracted'
  | 'filtered_role'
  | 'filtered_length'
  | 'missing_required_fields'
  | 'not_job_page'
  | 'error'
  | 'skipped_robots'
  | 'skipped_unverified';

export type CustomScrapeOutcomeCounts = Record<CustomScrapeOutcome, number>;

export type GoogleJobPosting = {
  title: string;
  description: string;
  datePosted: string;
  validThrough: string;
  hiringOrganization: { name: string };
  jobLocation?: { address: { addressLocality?: string; addressRegion: string; addressCountry: 'US' } } | Array<{ address: { addressLocality?: string; addressRegion: string; addressCountry: 'US' } }>;
  jobLocationType?: 'TELECOMMUTE';
  applicantLocationRequirements?: { '@type': 'Country'; name: 'USA' } | { '@type': 'AdministrativeArea'; name: string } | Array<{ '@type': 'AdministrativeArea'; name: string }>;
  employmentType?: string;
  baseSalary?: string;
};
