import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { discoverJobLinks, discoverNextPageUrl } from '../lib/ats/custom-scrape/discover';
import { extractJobDetail } from '../lib/ats/custom-scrape/detail';
import { buildGoogleJobPosting, isAllowedByRobots } from '../lib/ats/custom-scrape';
import type { NormalizedJob } from '../lib/ats/types';
import { isSolarInstallerRole } from '../lib/ats/solar-taxonomy';

const fixture = (name: string) => readFileSync(join(process.cwd(), 'tests/fixtures/custom-scrape', name), 'utf8');

const links = discoverJobLinks(fixture('solarccs-careers.html'), 'https://www.solarccs.com/careers');
assert.equal(links.length, 3, 'repeated role cards should be found and navigation ignored');
assert.equal(links[0].url, 'https://www.solarccs.com/careers/solar-installer');
assert.equal(links[0].titleCandidate, 'Solar Installer');
assert.equal(discoverNextPageUrl('<a rel="next" href="?page=2">Next</a>', 'https://example.com/careers?page=1'), 'https://example.com/careers?page=2');
assert.equal(discoverNextPageUrl('<button>More</button>', 'https://example.com/careers'), undefined);

const detail = extractJobDetail(fixture('solarccs-solar-installer.html'), links[0].url);
assert.equal(detail.title, 'Solar Installer');
assert.equal(detail.location, 'Riverside, CA');
assert.equal(detail.addressLocality, 'Riverside');
assert.equal(detail.addressRegion, 'CA');
assert.equal(detail.employmentType, 'FULL_TIME');

const detailWithFactsPanel = extractJobDetail(`
  <main><h1>Solar Installer</h1><p>Install residential solar systems throughout California.</p></main>
  <aside><span>Type</span><span>Full-time</span></aside>
`, 'https://example.com/jobs/installer');
assert.equal(detailWithFactsPanel.employmentType, 'FULL_TIME');

const detailWithTextSalary = extractJobDetail(`
  <main><h1>Solar Sales Representative</h1>
  <p>$50k – $100k / year - Rancho Cordova, CA, USA- Full Time</p></main>
`, 'https://example.com/jobs/sales');
assert.equal(detailWithTextSalary.salary, '$50k – $100k / year');
assert.equal(detailWithTextSalary.salaryMin, 50_000);
assert.equal(detailWithTextSalary.salaryMax, 100_000);
assert.equal(detailWithTextSalary.salaryPeriod, 'YEAR');

const detailWithStateOnlyLocation = extractJobDetail(`
  <main><h1>Solar Sales Consultant</h1><p>LOCATION: Florida SALARY RANGE: Commission only</p></main>
`, 'https://example.com/jobs/sales');
assert.equal(detailWithStateOnlyLocation.location, 'Florida');
assert.equal(detailWithStateOnlyLocation.addressRegion, 'FL');
assert.match(detail.description, /photovoltaic systems/i);
assert.equal(detail.salary, '$24 - $32 per hour');

const structuredDetail = extractJobDetail(`
  <script type="application/ld+json">{
    "@type":"JobPosting", "title":"Solar Sales Consultant", "description":"Entry-level solar sales role.",
    "experienceRequirements":"Entry Level",
    "baseSalary":{"@type":"MonetaryAmount","currency":"USD","value":{"@type":"QuantitativeValue","unitText":"YEAR","minValue":100000,"maxValue":200000}}
  }</script>
`, 'https://example.com/jobs/solar-sales-consultant');
assert.equal(structuredDetail.experienceLevel, 'ENTRY_LEVEL');
assert.equal(structuredDetail.salary, 'USD 100,000–200,000/YEAR');
assert.equal(structuredDetail.salaryMin, 100000);
assert.equal(structuredDetail.salaryMax, 200000);

const job: NormalizedJob = { source: 'custom-scrape', externalId: 'fixture', title: detail.title, company: 'Solar CCS', location: detail.location, addressRegion: detail.addressRegion, description: detail.description, url: links[0].url, applyUrl: links[0].url, contractType: detail.employmentType, postedAt: new Date('2026-08-20T00:00:00.000Z'), salary: detail.salary };
const google = buildGoogleJobPosting(job, detail.addressLocality);
assert.ok(google, 'complete job must satisfy Google JobPosting required fields');
assert.ok(google?.jobLocation && !Array.isArray(google.jobLocation));
assert.equal(Array.isArray(google?.jobLocation) ? undefined : google?.jobLocation?.address.addressRegion, 'CA');
assert.equal(buildGoogleJobPosting({ ...job, contractType: undefined }, detail.addressLocality), undefined, 'missing required employment type must be rejected');
const stateOnlyGoogle = buildGoogleJobPosting({ ...job, location: 'Florida', addressRegion: 'FL' }, undefined);
assert.ok(stateOnlyGoogle?.jobLocation && !Array.isArray(stateOnlyGoogle.jobLocation));
assert.equal(Array.isArray(stateOnlyGoogle?.jobLocation) ? undefined : stateOnlyGoogle?.jobLocation?.address.addressLocality, undefined);
assert.equal(Array.isArray(stateOnlyGoogle?.jobLocation) ? undefined : stateOnlyGoogle?.jobLocation?.address.addressRegion, 'FL');
const remoteDetail = extractJobDetail('<main><h1>Remote Solar Consultant</h1><p>This is a fully remote position available anywhere in the United States.</p></main>', 'https://example.com/jobs/remote-solar-consultant');
assert.equal(remoteDetail.isRemote, true);
assert.equal(remoteDetail.location, 'Remote');
const remoteGoogle = buildGoogleJobPosting({ ...job, title: remoteDetail.title, location: remoteDetail.location, addressRegion: undefined, isRemote: remoteDetail.isRemote }, undefined);
assert.equal(remoteGoogle?.jobLocationType, 'TELECOMMUTE');
assert.equal(Array.isArray(remoteGoogle?.applicantLocationRequirements) ? undefined : remoteGoogle?.applicantLocationRequirements?.name, 'USA');
assert.equal(remoteGoogle?.jobLocation, undefined);
assert.equal(isAllowedByRobots('User-agent: *\nDisallow: /careers/private\nAllow: /', 'https://example.com/careers/solar'), true);
assert.equal(isAllowedByRobots('User-agent: *\nDisallow: /careers', 'https://example.com/careers/solar'), false);
assert.equal(isSolarInstallerRole('Lead Installer / Crew Lead', 'Company context: Solar CCS is a solar installation company.'), true);
assert.equal(isSolarInstallerRole('Solar Pool Heater Installers'), true);
assert.equal(isSolarInstallerRole('General Laborer', 'Company context: Solar CCS is a solar installation company.'), true);
assert.equal(isSolarInstallerRole('PV Designer / Plan Set Drafter'), true);
assert.equal(isSolarInstallerRole('Permit & Interconnection Coordinator', 'Company context: Solar CCS is a solar installation company.'), false);
assert.equal(isSolarInstallerRole('Solar Sales Consultant', 'Company context: Venture Solar is a solar installation company.'), true);
assert.equal(isSolarInstallerRole('Solar - Retail Associate', 'Company context: Venture Solar is a solar installation company.'), true);
assert.equal(isSolarInstallerRole('Retail Associate - Solar Sales', 'Company context: Venture Solar is a solar installation company.'), true);
assert.equal(isSolarInstallerRole('Retail Sales Representative', 'Company context: Venture Solar is a solar installation company.'), true);
assert.equal(isSolarInstallerRole('Solar Canvasser', 'Company context: Venture Solar is a solar installation company.'), false);

console.log('custom-scrape tests passed');
