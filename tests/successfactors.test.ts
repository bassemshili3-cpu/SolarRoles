import assert from 'node:assert/strict';
import { parseSuccessFactorsRss } from '../lib/ats/successfactors';

const company = {
  baseUrl: 'https://jobs.example.com',
  name: 'Example Energy',
  verified: true,
  locale: 'en_US',
  keywords: ['bess'],
};

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <item>
    <title><![CDATA[BESS Field Technician (Remote, US, Texas)]]></title>
    <description><![CDATA[<p>Maintain utility-scale battery energy storage systems.</p>]]></description>
    <pubDate>Thu, 27 Aug 2026 00:00:00 GMT</pubDate>
    <link>https://jobs.example.com/job/BESS-Field-Technician/12345/?utm_source=rss</link>
  </item>
  <item>
    <title><![CDATA[Generic Accountant (Chicago, US, 60601)]]></title>
    <description><![CDATA[<p>Corporate accounting role.</p>]]></description>
    <pubDate>Thu, 27 Aug 2026 00:00:00 GMT</pubDate>
    <link>https://jobs.example.com/job/Generic-Accountant/99999/?utm_source=rss</link>
  </item>
</channel></rss>`;

const jobs = parseSuccessFactorsRss(xml, company);
assert.equal(jobs.length, 1);
assert.equal(jobs[0].source, 'successfactors');
assert.equal(jobs[0].externalId, '12345');
assert.equal(jobs[0].title, 'BESS Field Technician');
assert.equal(jobs[0].location, 'Remote, US, Texas');
assert.equal(jobs[0].addressRegion, 'TX');
assert.equal(jobs[0].url, 'https://jobs.example.com/job/BESS-Field-Technician/12345/');
assert.equal(jobs[0].postedAt?.toISOString(), '2026-08-27T00:00:00.000Z');

console.log('SuccessFactors RSS parser tests passed');
