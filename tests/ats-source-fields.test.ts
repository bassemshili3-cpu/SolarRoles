import { test } from 'node:test';
import assert from 'node:assert/strict';
import { absolutePublicationDate, sourcePublicationDate, htmlPublicationDate } from '../lib/ats/publicationDate';
import { numericSalary, structuredSalary, textBaseSalary, htmlBaseSalary, leverSalary, ashbySalary } from '../lib/ats/salaryFields';
import { normalizeSourceFields } from '../lib/ats/normalizeSourceFields';
import { extractJobDetail } from '../lib/ats/custom-scrape/detail';
import { parseIcimsDetail } from '../lib/ats/icims';
import { jobPostings } from '../lib/ats/sourceFields';

const url = 'https://example.com/jobs/one';
const schema = (node: unknown) => `<script type="application/ld+json">${JSON.stringify(node)}</script>`;
const posting = (extra = {}) => ({ '@type': 'JobPosting', title: 'Solar Installer', url, description: 'Install solar panels.', ...extra });

test('publication aliases normalize case/underscores while source-specific creation/start fields stay scoped', () => {
  for (const key of ['postedAt', 'posted_at', 'PostedDate', 'datePosted', 'published_at', 'first_published', 'posting-date']) {
    assert.equal(sourcePublicationDate({ [key]: '2026-01-01' })?.toISOString(), '2026-01-01T00:00:00.000Z', key);
  }
  assert.equal(sourcePublicationDate({ updated_at: '2026-01-01', fetchedAt: new Date(), startDate: '2026-01-01', created_at: '2026-01-01' }), undefined);
  assert.equal(sourcePublicationDate({ startDate: '2026-01-01' }, 'workday')?.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(sourcePublicationDate({ createdAt: Date.parse('2026-01-01') }, 'lever')?.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(sourcePublicationDate({ releasedDate: '2026-01-01' }, 'smartrecruiters')?.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(sourcePublicationDate({ datePosted: 'invalid', published_at: '2026-01-01' })?.toISOString(), '2026-01-01T00:00:00.000Z');
  for (const raw of ['2026-02-30', '2099-01-01', 'Posted Yesterday', '10/11/2026', '2026-01-01T12:00:00']) assert.equal(absolutePublicationDate(raw), undefined);
});

test('schema/date parsing checks job identity, conflicts, graph arrays and publication-only metadata', () => {
  const html = schema({ '@graph': [[posting({ datePosted: '2026-01-01' })], posting({ url: 'https://example.com/jobs/other', datePosted: '2026-01-02' })] });
  assert.equal(htmlPublicationDate(html, { url })?.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(htmlPublicationDate(schema([posting({ datePosted: '2026-01-01' }), posting({ datePosted: '2026-01-02' })]), { url }), undefined);
  assert.equal(htmlPublicationDate('<meta property="article:published_time" content="2026-01-01">', { url }), undefined);
  assert.equal(htmlPublicationDate('<time itemprop="datePosted" datetime="2026-01-01"></time>', { url })?.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(jobPostings(schema(posting({ url: url + '?gh_jid=2' })), { url: url + '?gh_jid=1' }).length, 0);
});

test('structured pay requires positive USD amounts and explicit units; amounts are annualized once', () => {
  const raw = { currency: 'USD', value: { minValue: 23, maxValue: 40, unitText: 'HOUR' } };
  assert.deepEqual(structuredSalary(raw), { salary: '$23 - $40/hour', salaryMin: 47840, salaryMax: 83200, salaryPeriod: 'HOUR' });
  for (const value of [{ currency: 'USD', value: { minValue: '', maxValue: '', unitText: 'YEAR' } }, { ...raw, currency: 'CAD' }, { currency: 'USD', value: { minValue: 23, maxValue: 40 } }]) assert.equal(structuredSalary(value), undefined);
  assert.equal(numericSalary(4000, 6000, 'USD', 'MONTH')?.salaryMin, 48000);
  assert.equal(structuredSalary([{ ...raw }, { currency: 'USD', value: { minValue: 30, maxValue: 50, unitText: 'HOUR' } }]), undefined);
});

test('pay wording and period precede or follow amounts, with k shorthand and separated iCIMS min/max', () => {
  assert.equal(textBaseSalary('The hourly rate range for this position is $29 to $52 and may vary based on experience.')?.salaryMin, 60320);
  assert.equal(textBaseSalary('The annual salary range for this position is $120,000 to $135,000.')?.salaryMin, 120000);
  assert.equal(textBaseSalary('Compensation: Pay Range - $23.00-$40.00 hourly/DOE')?.salaryMax, 83200);
  assert.equal(textBaseSalary('Min USD $90,000.00/Yr. Max USD $170,000.00/Yr.')?.salaryMin, 90000);
  assert.equal(textBaseSalary('$50–100k / year')?.salaryMin, 50000);
  assert.equal(textBaseSalary('USD 25 - 35 per hour', true)?.salaryMin, 52000);
  assert.equal(textBaseSalary('Compensation Range: $25.02 - $31.27 Pay Rate Type: Hourly')?.salaryMin, 52042);
  assert.equal(textBaseSalary('Base Pay $41.51 - $49.97 US Hourly 10% Bonus')?.salaryMin, 86341);
  assert.equal(textBaseSalary('Salary Range$21-30.00/HourApplication DeadlineJune 1, 2027')?.salaryMax, 62400);
});

test('pay parsers do not infer units or promote variable compensation and benefits', () => {
  for (const raw of ['Base salary + commission (OTE $70,000 - $120,000 annually)', 'Salary range CAD $70,000 - $90,000 annually', 'Annual bonus $20,000 - $30,000', 'Base Pay Range $23 - $40 USD', 'Per diem $120 - $150 per day', 'Annual reimbursement $20,000 - $30,000', 'Salary range $100,000 - $120,000. Annual leave is provided.', 'Salary Range: $115,500 to $160,000 *This position is eligible for the annual performance bonus plan', 'Competitive compensation, $120,000 to $140,000 plus an annual bonus.']) assert.equal(textBaseSalary(raw), undefined, raw);
  assert.equal(textBaseSalary('Annual salary range $100,000 - $120,000. Annual salary range $130,000 - $140,000.'), undefined);
  assert.equal(htmlBaseSalary(schema(posting({ baseSalary: { currency: 'USD', value: { minValue: 25, maxValue: 35, unitText: 'HOUR' } } })), { url: url + 'other' }), undefined);
});

test('Lever and Ashby preserve base intervals, excluding bonus and tier conflicts', () => {
  assert.equal(leverSalary({ min: 120000, max: 150000, currency: 'USD', interval: 'per-year-salary' })?.salaryMax, 150000);
  const component = { compensationType: 'Salary', minValue: 84537, maxValue: 110990, currencyCode: 'USD', interval: '1 YEAR' };
  assert.equal(ashbySalary({ summaryComponents: [component, { ...component, compensationType: 'Bonus', minValue: 20000 }] })?.salaryMin, 84537);
  assert.equal(ashbySalary({ summaryComponents: [component, { ...component, minValue: 100000 }] }), undefined);
});

test('ingestion preserves real source dates and stored salaries, fills missing descriptions, never uses estimated discovery', () => {
  const base = { source: 'jobvite', externalId: 'one', url, title: 'Solar Installer', company: 'Solar', location: 'Austin, TX', applyUrl: url,
    description: schema(posting({ published_at: '2026-01-01' })) + 'Hourly salary range: $25 - $35 per hour' };
  const result = normalizeSourceFields(base);
  assert.equal(result.postedAt?.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(result.salaryMin, 52000);
  assert.equal(normalizeSourceFields({ ...base, salaryMin: 60000, salaryMax: 80000 }).salaryMin, 60000);
  assert.equal(normalizeSourceFields({ ...base, salaryMin: 60000 }).salaryMax, undefined);
  assert.equal(normalizeSourceFields({ ...base, salary: 'Base + commission' }).salaryMin, undefined);
  assert.equal(normalizeSourceFields({ ...base, description: '', postedAt: new Date(), postedAtEstimated: true }).postedAt, undefined);
  assert.equal(normalizeSourceFields({ ...base, postedAt: new Date('2025-01-01') }).postedAt?.toISOString(), '2025-01-01T00:00:00.000Z');
});

test('custom scrape and iCIMS preserve schema units, publication aliases and stable job ids', () => {
  const raw = schema(posting({ date_posted: '2026-01-01', baseSalary: { currency: 'USD', value: { minValue: 25, maxValue: 35, unitText: 'HOUR' } } }));
  const detail = extractJobDetail(raw, url);
  assert.equal(detail.postedAt?.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(detail.salaryMin, 52000);
  const icimsUrl = 'https://jobs.solar.icims.com/jobs/123/installer/job';
  const icims = parseIcimsDetail(schema(posting({ url: 'https://jobs.solar.icims.com/jobs/123/us-tx-austin/job', datePosted: '2026-01-01' })), 'Solar Installer', icimsUrl);
  assert.equal(icims.postedAt?.toISOString(), '2026-01-01T00:00:00.000Z');
});
