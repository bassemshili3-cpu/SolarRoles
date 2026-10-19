import type { AtsFetchContext } from './fetch-context';
import type { NormalizedJob } from './types';

/** Employer-linked replacements; original scheduled task identities remain stable. */
export async function recoverAtsSource(provider: string, company: { slug?: string; name: string }, context?: AtsFetchContext): Promise<NormalizedJob[] | undefined> {
  if (provider === 'lever' && company.slug === 'generate-capital') {
    // https://generatecapital.com/careers/ embeds this exact Ashby board.
    const { fetchAshbyJobs } = await import('./ashby');
    return fetchAshbyJobs({ slug: 'generate', name: company.name, verified: false });
  }
  if (provider === 'jobvite' && company.slug === 'canadian-solar') {
    // https://www.canadiansolar.com/ links this Workday board directly.
    const { fetchWorkdayJobs } = await import('./workday');
    return fetchWorkdayJobs({ tenant: 'canadiansolar', host: 'wd5', site: 'CanadianSolar', name: company.name, verified: false }, context);
  }
  if (provider === 'workable' && company.slug === 'dynamic-energy') {
    // https://dynamicenergy.com/careers/ links this exact keyword search.
    const { fetchIcimsJobs } = await import('./icims');
    return fetchIcimsJobs({ baseUrl: 'https://careers-patternenergy.icims.com', name: company.name, verified: false, searchKeyword: '"Dynamic Energy"' });
  }
  return undefined;
}
