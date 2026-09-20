import { extractStateFromLocation } from '@/lib/parseLocation';
import type { AtsCompanySeed } from './company-seed';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

type WorkableIndexJob = {
  id: string;
  title: string;
  location: string;
  contractType?: string;
  salary?: string;
  postedAt?: Date;
  detailUrl: string;
};

const clean = (value: string) => value.replace(/\s+/g, ' ').trim();

function approved(company: AtsCompanySeed, title: string): boolean {
  const normalizedTitle = clean(title).toLowerCase();
  return company.includeJobTitles?.some((value) => clean(value).toLowerCase() === normalizedTitle) ?? false;
}

function markdownCells(line: string): string[] {
  const cells: string[] = [];
  let cell = '';
  let escaped = false;

  for (const character of line.trim()) {
    if (escaped) {
      cell += character;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === '|') {
      cells.push(clean(cell));
      cell = '';
    } else {
      cell += character;
    }
  }
  cells.push(clean(cell));

  if (cells[0] === '') cells.shift();
  if (cells.at(-1) === '') cells.pop();
  return cells;
}

export function parseWorkableIndex(markdown: string): WorkableIndexJob[] {
  const jobs: WorkableIndexJob[] = [];

  for (const line of markdown.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) continue;
    const cells = markdownCells(line);
    if (cells.length < 7 || cells[0] === 'Title' || /^-+$/.test(cells[0])) continue;

    const detailUrl = cells[6].match(/\((https:\/\/apply\.workable\.com\/[^)]+\/jobs\/view\/([A-Za-z0-9]+)\.md)\)/i);
    if (!detailUrl) continue;

    const postedAt = /^\d{4}-\d{2}-\d{2}$/.test(cells[5]) ? new Date(`${cells[5]}T00:00:00.000Z`) : undefined;
    jobs.push({
      id: detailUrl[2],
      title: cells[0],
      location: cells[2],
      contractType: cells[3] || undefined,
      salary: cells[4] || undefined,
      postedAt,
      detailUrl: detailUrl[1],
    });
  }

  return jobs;
}

function salaryFields(salary?: string) {
  if (!salary) return {};
  const amounts = [...salary.matchAll(/\d[\d,.]*/g)]
    .map((match) => Number(match[0].replace(/,/g, '')))
    .filter(Number.isFinite);
  const salaryPeriod = /(?:\/\s*hr|hour(?:ly)?)/i.test(salary)
    ? 'HOUR'
    : /month(?:ly)?/i.test(salary)
      ? 'MONTH'
      : /week(?:ly)?/i.test(salary)
        ? 'WEEK'
        : amounts.some((amount) => amount >= 10_000)
          ? 'YEAR'
          : undefined;

  return {
    salary,
    salaryMin: amounts[0],
    salaryMax: amounts[1] ?? amounts[0],
    salaryPeriod,
  };
}

export function parseWorkableDetail(
  markdown: string,
  company: AtsCompanySeed,
  indexJob: WorkableIndexJob,
): NormalizedJob | undefined {
  const title = clean(markdown.match(/^#\s+(.+)$/m)?.[1] ?? indexJob.title);
  const description = markdown
    .split(/^## Description\s*$/m)[1]
    ?.split(/^## Apply\s*$/m)[0]
    ?.trim();
  if (!title || !description || description.length < 60) return;
  if (!approved(company, title) && !isSolarInstallerRole(title, description)) return;

  const applyUrl = markdown.match(/^\[Apply[^\]]*\]\((https:\/\/apply\.workable\.com\/[^)]+)\)\s*$/m)?.[1];
  const canonicalUrl = `https://apply.workable.com/${company.slug}/j/${indexJob.id}/`;
  const explicitUs = /\b(?:United States|USA|U\.S\.)\b/i.test(`${indexJob.location} ${description}`);
  const remote = /\bremote\b/i.test(indexJob.location);

  return {
    source: 'workable',
    externalId: `${company.slug}:${indexJob.id}`,
    title,
    company: company.name,
    location: indexJob.location,
    addressRegion: extractStateFromLocation(indexJob.location),
    isRemote: remote && explicitUs,
    description,
    url: canonicalUrl,
    applyUrl: applyUrl ?? canonicalUrl,
    contractType: indexJob.contractType,
    postedAt: indexJob.postedAt,
    ...salaryFields(indexJob.salary),
  };
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/markdown,text/plain;q=0.9' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}

export async function fetchWorkableJobs(company: AtsCompanySeed): Promise<NormalizedJob[]> {
  if (!company.verified) return [];
  const jobs: NormalizedJob[] = [];

  try {
    const index = parseWorkableIndex(
      await fetchText(`https://apply.workable.com/${company.slug}/jobs.md`),
    );
    console.log(`[workable] ${company.slug}: ${index.length} open job(s)`);

    for (const indexJob of index) {
      try {
        const detail = await fetchText(indexJob.detailUrl);
        const job = parseWorkableDetail(detail, company, indexJob);
        if (job) jobs.push(job);
      } catch (error) {
        console.warn(`[workable] ${indexJob.detailUrl}: ${(error as Error).message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  } catch (error) {
    console.warn(`[workable] ${company.slug}: ${(error as Error).message}`);
  }

  return jobs;
}
