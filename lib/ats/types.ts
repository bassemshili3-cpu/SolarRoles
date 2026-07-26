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
}