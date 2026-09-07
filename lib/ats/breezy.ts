import type { AtsCompanySeed } from './company-seed';
import { fetchHostedJobs } from './hosted-board';

export const fetchBreezyJobs = (company: AtsCompanySeed) => fetchHostedJobs('breezy', company);
