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
  jobLocation: { address: { addressLocality: string; addressRegion: string } };
  employmentType: string;
  baseSalary?: string;
};
