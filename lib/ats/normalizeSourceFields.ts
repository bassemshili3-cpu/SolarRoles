import type { NormalizedJob } from './types';
import { absolutePublicationDate, htmlPublicationDate } from './publicationDate';
import { htmlBaseSalary, textBaseSalary } from './salaryFields';

/** Last ingestion gate: preserve source dates/ranges; fill only genuinely missing fields. */
export function normalizeSourceFields(job: NormalizedJob): NormalizedJob {
  const postedAt = job.postedAtEstimated ? undefined : absolutePublicationDate(job.postedAt);
  const parsedDate = postedAt ?? htmlPublicationDate(job.description, { url: job.url, title: job.title });
  const salaryMissing = job.salaryMin === undefined && job.salaryMax === undefined;
  const variablePay = /\b(?:commission|OTE|on.target earnings|total compensation)\b/i.test(job.salary || '');
  const salary = salaryMissing && !variablePay
    ? htmlBaseSalary(job.description, { url: job.url, title: job.title }) ?? textBaseSalary(job.description) ?? textBaseSalary(job.salary || '', true)
    : undefined;
  return { ...job, postedAt: parsedDate, postedAtEstimated: parsedDate ? false : job.postedAtEstimated, ...salary };
}
