export interface NormalizedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location: string;
  addressRegion?: string;
  /** All explicitly stated eligible/work regions for a single multi-region job. */
  locationRegions?: string[];
  /** Fully remote role with an explicit US applicant-location restriction. */
  isRemote?: boolean;
  description: string;
  url: string;
  applyUrl: string;
  contractType?: string;
  postedAt?: Date;
  /** True when postedAt is the first-seen fallback because the source has no publication date. */
  postedAtEstimated?: boolean;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  experienceLevel?: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL';
}
