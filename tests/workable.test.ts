import assert from 'node:assert/strict';
import { parseWorkableDetail, parseWorkableIndex } from '../lib/ats/workable';
import { isUSJob } from '../lib/ats/geo';

const company = {
  slug: 'example-solar',
  name: 'Example Solar',
  verified: true,
  includeJobTitles: ['Capital Markets Associate'],
};

const indexMarkdown = `# Example Solar — All Open Positions

| Title | Department | Location | Type | Salary | Posted | Details |
|-------|------------|----------|------|--------|--------|---------|
| Capital Markets Associate | Finance | Chicago, United States (Remote) | Full-time | USD 125,000–135,000 | 2026-09-09 | [View](https://apply.workable.com/example-solar/jobs/view/8F3E48B733.md) |
`;

const [indexJob] = parseWorkableIndex(indexMarkdown);
assert.equal(indexJob.id, '8F3E48B733');
assert.equal(indexJob.postedAt?.toISOString(), '2026-09-09T00:00:00.000Z');

const detailMarkdown = `# Capital Markets Associate

> Example Solar · Chicago, United States (Remote) · Full-time · Posted 2026-09-09

## Description

Support project finance models and transactions for a growing portfolio of utility-scale solar projects across the United States.

## Requirements

- Two years of renewable-energy finance experience.

## Apply

[Apply at Example Solar](https://apply.workable.com/example-solar/j/8F3E48B733/apply)
`;

const job = parseWorkableDetail(detailMarkdown, company, indexJob)!;
assert.equal(job.source, 'workable');
assert.equal(job.salaryMin, 125000);
assert.equal(job.salaryMax, 135000);
assert.equal(job.salaryPeriod, 'YEAR');
assert.equal(job.isRemote, true);
assert.equal(isUSJob(job, { allowBareRemote: false }), true);
assert.equal(job.applyUrl, 'https://apply.workable.com/example-solar/j/8F3E48B733/apply');

assert.equal(
  parseWorkableDetail(
    detailMarkdown.replace('Capital Markets Associate', 'Insurance Broker'),
    { ...company, includeJobTitles: undefined },
    { ...indexJob, title: 'Insurance Broker' },
  ),
  undefined,
);

console.log('Workable ATS tests passed');
