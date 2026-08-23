export interface NormalizedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location: string;
  addressRegion?: string;
  description: string;
  url: string;
  applyUrl: string;
  contractType?: string;
  postedAt?: Date;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  experienceLevel?: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL';
}
