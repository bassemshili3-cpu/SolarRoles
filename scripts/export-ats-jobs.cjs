const { PrismaClient } = require('@prisma/client');
const fs = require('node:fs');
const path = require('node:path');

const prisma = new PrismaClient();
const providers = [
  'jazzhr',
  'breezy',
  'lever',
  'ashby',
  'smartrecruiters',
  'jobvite',
  'greenhouse',
  'pinpoint',
  'workday',
  'rippling',
  'successfactors',
  'oraclecloud',
  'ukg',
  'icims',
  'adp',
  'paylocity',
  'paycom',
];
const includeAdzuna = process.argv.includes('--include-adzuna');
const exportedSources = includeAdzuna ? [...providers, 'adzuna'] : providers;

async function main() {
  const sources = await prisma.job.groupBy({ by: ['source'], _count: { _all: true } });
  console.log(JSON.stringify({ sources }));
  const jobs = await prisma.job.findMany({
    where: { source: { in: exportedSources } },
    orderBy: [{ source: 'asc' }, { id: 'asc' }],
  });
  if (!jobs.length) throw new Error('No ATS jobs matched; no export written.');
  const columns = Object.keys(jobs[0]);
  const escape = (value) => {
    let text = value == null ? '' : value instanceof Date ? value.toISOString() : typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (/^[=+@\t\r]/.test(text) || (/^-/.test(text) && typeof value !== 'number')) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const csv = '\uFEFF' + [columns.map(escape).join(','), ...jobs.map(job => columns.map(column => escape(job[column])).join(','))].join('\r\n') + '\r\n';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = path.resolve(__dirname, '../data/exports');
  fs.mkdirSync(directory, { recursive: true });
  const scope = includeAdzuna ? 'ats-plus-adzuna' : 'ats-only';
  const file = path.join(directory, `solarroles-${scope}-${timestamp}.csv`);
  fs.writeFileSync(file, csv, { flag: 'wx' });
  console.log(JSON.stringify({ file, count: jobs.length, columns: columns.length, active: jobs.filter(job => job.active).length, bySource: Object.fromEntries(exportedSources.map(source => [source, jobs.filter(job => job.source === source).length])), bytes: fs.statSync(file).size }));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
