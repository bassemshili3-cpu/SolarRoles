import type { AtsCompanySeed } from './company-seed';
import { fetchHostedJobs } from './hosted-board';

export const fetchJazzHrJobs = (company: AtsCompanySeed) => fetchHostedJobs('jazzhr', company);
