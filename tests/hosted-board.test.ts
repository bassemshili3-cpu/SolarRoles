import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHostedLinks, parseHostedDetail } from '../lib/ats/hosted-board';
import { fetchJazzHrJobs } from '../lib/ats/jazzhr';
import { fetchBreezyJobs } from '../lib/ats/breezy';
import { JAZZHR_COMPANIES, BREEZY_COMPANIES } from '../lib/ats/company-seed';
import { isUSJob } from '../lib/ats/geo';

async function main() {
  const company = { slug: 'example', name: 'Example Solar', verified: true };
  const url = 'https://example.breezy.hr/p/abcdef123456-solar-sales';
  const schema = {
    '@type': 'JobPosting', title: 'Solar Sales Consultant',
    description: '<p>Sell residential solar systems to homeowners through virtual consultations and prepare proposals.</p>',
    employmentType: 'FULL_TIME', datePosted: '2026-08-25',
    jobLocation: { address: { addressRegion: 'FL', addressCountry: 'US' } },
    jobLocationType: 'TELECOMMUTE',
    baseSalary: { currency: 'USD', value: { minValue: 50000, maxValue: 70000, unitText: 'YEAR' } },
  };
  const html = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  const listing = `<a href="${url}?source=x">Solar Sales Consultant</a><a href="${url}">Solar Sales Consultant</a><a href="${url}/apply">Apply</a><a href="https://other.breezy.hr/p/abcdef123456-solar-sales">Solar Sales</a><a href="/p/000000000000-accountant">Accountant</a>`;
  assert.equal(parseHostedLinks(listing, 'breezy', company).length, 1);
  const job = parseHostedDetail(html, url, 'breezy', company)!;
  assert.equal(job.salaryMin, 50000);
  assert.equal(job.salaryMax, 70000);
  assert.equal(job.salaryPeriod, 'YEAR');
  assert.equal(job.postedAt?.toISOString(), '2026-08-25T00:00:00.000Z');
  assert.equal(job.addressRegion, 'FL');
  assert.equal(job.isRemote, true);
  assert.equal(isUSJob(job, { allowBareRemote: false }), true);
  assert.equal(parseHostedDetail('<h1>Openings</h1>', url, 'breezy', company), undefined);
  assert.equal(parseHostedDetail(html + '<link rel="canonical" href="/">', url, 'breezy', company), undefined);
  assert.equal(parseHostedDetail(html.replace('Solar Sales Consultant', 'Insurance Sales Representative').replace('Sell residential solar systems to homeowners through virtual consultations and prepare proposals.', 'Sell life insurance policies to customers through phone consultations and prepare insurance proposals.'), url, 'breezy', company), undefined);
  assert.equal(parseHostedDetail(html.replace('"datePosted":"2026-08-25"', '"datePosted":"invalid","validThrough":"2020-01-01"'), url, 'breezy', company), undefined);
  const noDate = parseHostedDetail(html.replace('"datePosted":"2026-08-25",', ''), url, 'breezy', company)!;
  assert.equal(noDate.postedAt, undefined);
  const foreign = parseHostedDetail(html.replace('"FL"', '"Ontario"').replace('"US"', '"Canada"'), url, 'breezy', company)!;
  assert.equal(isUSJob(foreign, { allowBareRemote: false }), false);
  const jazzUrl = 'https://example.applytojob.com/apply/Ab12345678/Solar-Appointment-Setter';
  const jazzHtml = '<div class="job-header"><h2>Solar Appointment Setter</h2></div><div class="job-attributes-container"><div title="Location">Remote</div></div><div id="resumator-job-employment">Full Time</div><div id="job-description"><p>This is a fully remote role. Must be located in the US to apply. Call homeowners and schedule solar consultations.</p></div>';
  assert.equal(parseHostedDetail(jazzHtml, jazzUrl, 'jazzhr', company), undefined);
  const allowed = { ...company, includeJobTitles: ['Solar Appointment Setter'] };
  const jazzJob = parseHostedDetail(jazzHtml, jazzUrl, 'jazzhr', allowed)!;
  assert.equal(jazzJob.location, 'Remote, US');
  assert.equal(isUSJob(jazzJob, { allowBareRemote: false }), true);
  assert.equal(jazzJob.postedAt, undefined);
  const unknownRemote = parseHostedDetail(jazzHtml.replace('Must be located in the US to apply.', ''), jazzUrl, 'jazzhr', allowed)!;
  assert.equal(isUSJob(unknownRemote, { allowBareRemote: false }), false);
  const breezyHtml = '<div class="position-header"><h1>Solar Sales Consultant</h1><div class="type"><span class="label">Full-Time in</span><i class="fa fa-map-marker"></i><span>Fresno, CA</span></div></div><div class="job-description"><div class="description">Sell residential solar systems to homeowners, prepare proposals and close contracts through consultations.</div></div>';
  const htmlJob = parseHostedDetail(breezyHtml, url, 'breezy', company)!;
  assert.equal(htmlJob.location, 'Fresno, CA');
  assert.equal(htmlJob.contractType, 'FULL_TIME');
  assert.equal(htmlJob.postedAt, undefined);
  assert.equal(htmlJob.salary, undefined);
  assert.equal(htmlJob.isRemote, false);
  assert.ok(isUSJob(htmlJob, { allowBareRemote: false }));
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async (input) => {
    requests++;
    return new Response(String(input).includes('/p/') ? html : listing);
  };
  try {
    assert.equal((await fetchBreezyJobs(company)).length, 1);
    assert.equal(requests, 2);
    assert.deepEqual(await fetchJazzHrJobs({ ...company, verified: false }), []);
  } finally { globalThis.fetch = originalFetch; }
  // Optional real HTML captured read-only, outside the repository.
  if (process.argv.includes('--captured')) {
    const sunshine = JAZZHR_COMPANIES.find((c) => c.slug === 'teamsunshineconstructionllc')!;
    const solarPros = BREEZY_COMPANIES.find((c) => c.slug === 'solar-pros')!;
    for (const [source, seed, href] of [
      ['jazzhr', sunshine, 'https://teamsunshineconstructionllc.applytojob.com/apply/KnjYWfN9HV/Solar-Appointment-Setter'],
      ['breezy', solarPros, 'https://solar-pros.breezy.hr/p/6b0f7dcc0271-remote-solar-appointment-setter-florida-uncapped-commission'],
    ] as const) {
      const result = parseHostedDetail(readFileSync(`${process.env.TEMP}/solarroles-${source}.html`, 'utf8'), href, source, seed);
      assert.ok(result);
      assert.ok(isUSJob(result, { allowBareRemote: false }));
      console.log(source, result.title, result.location, result.postedAt?.toISOString() ?? 'no source date');
    }
    const salesdraft = BREEZY_COMPANIES.find((c) => c.slug === 'salesdraft-recruiting')!;
    const links = parseHostedLinks(readFileSync(`${process.env.TEMP}/solarroles-breezy-list.html`, 'utf8'), 'breezy', salesdraft);
    assert.ok(links.length > 5);
    console.log('SalesDraft candidate links:', links.length);
    const salesdraftJob = parseHostedDetail(readFileSync(`${process.env.TEMP}/solarroles-salesdraft-detail.html`, 'utf8'), 'https://salesdraft-recruiting.breezy.hr/p/cd07745a74a9-remote-solar-sales-professional', 'breezy', salesdraft);
    assert.ok(salesdraftJob);
    assert.equal(salesdraftJob.title, 'Remote Solar Sales Professional');
    assert.equal(salesdraftJob.location, 'Fresno, CA');
    assert.equal(salesdraftJob.postedAt, undefined);
    assert.ok(isUSJob(salesdraftJob, { allowBareRemote: false }));
  }
  console.log('Hosted ATS tests passed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
