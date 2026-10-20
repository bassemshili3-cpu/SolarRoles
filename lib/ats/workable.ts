import { extractStateFromLocation } from '@/lib/parseLocation';
import type { AtsCompanySeed } from './company-seed';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';
import { textBaseSalary } from './salaryFields';
import { absolutePublicationDate } from './publicationDate';
import type { AtsFetchContext } from './fetch-context';

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

    const postedAt = absolutePublicationDate(cells[5]);
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

/** The public API supplies opaque continuation tokens for large boards. */
export function parseWorkableApiIndex(value: unknown, slug: string): { jobs: WorkableIndexJob[]; nextPage: string | null } {
  const data = value as { results?: unknown[]; nextPage?: unknown } | null;
  if (!data || !Array.isArray(data.results) || (data.nextPage != null && typeof data.nextPage !== 'string')) throw new Error('Invalid Workable API listing');
  const jobs = data.results.map(raw => {
    const item = raw as { shortcode?: string; title?: string; published?: string; type?: string; location?: { city?: string; region?: string; country?: string } };
    if (!item || typeof item.shortcode !== 'string' || !/^[a-z0-9]+$/i.test(item.shortcode) || typeof item.title !== 'string') throw new Error('Invalid Workable posting identity');
    return {
      id: item.shortcode, title: item.title,
      location: [item.location?.city, item.location?.region, item.location?.country].filter(Boolean).join(', '),
      contractType: item.type,
      postedAt: absolutePublicationDate(item.published),
      detailUrl: `https://apply.workable.com/${encodeURIComponent(slug)}/jobs/view/${item.shortcode}.md`,
    };
  });
  return { jobs, nextPage: typeof data.nextPage === 'string' && data.nextPage ? data.nextPage : null };
}

function salaryFields(salary?: string) {
  return { salary, ...textBaseSalary(salary || '', true) };
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

class WorkableHttpError extends Error {
  constructor(public readonly status: number, url: string) { super(`HTTP ${status}: ${url}`); }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/markdown,text/plain;q=0.9' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) { await response.body?.cancel(); throw new WorkableHttpError(response.status, url); }
  return response.text();
}

export async function fetchWorkableJobs(company: AtsCompanySeed, run?: AtsFetchContext): Promise<NormalizedJob[]> {
  const jobs: NormalizedJob[] = [];
  const saved = run?.cursor as { kind?: string; token?: string | null; completed?: string[] } | undefined;
  let token = typeof saved?.token === 'string' ? saved.token : null;
  let completed = new Set(Array.isArray(saved?.completed) ? saved.completed.filter(id => typeof id === 'string') : []);
  let kind = 'markdown';
  const checkpoint = () => run?.checkpoint({ kind, token, completed: [...completed] });
  try {
    const markdown = await fetchText(`https://apply.workable.com/${company.slug}/jobs.md`);
    const instructions = /^## How to Search\s*$/m.test(markdown) && /open positions.*search endpoint/i.test(markdown);
    kind = instructions ? 'api' : 'markdown';
    if (saved?.kind !== kind) { token = null; completed = new Set(); }
    const seen = new Set<string>();
    while (true) {
      checkpoint();
      if (Date.now() + 30_000 >= (run?.deadline ?? Infinity)) return jobs;
      let index: WorkableIndexJob[], nextPage: string | null = null;
      if (instructions) {
        const response = await fetch(`https://apply.workable.com/api/v3/accounts/${encodeURIComponent(company.slug)}/jobs`, {
          method: 'POST', headers: { 'User-Agent': USER_AGENT, 'content-type': 'application/json' }, signal: AbortSignal.timeout(20_000),
          body: JSON.stringify({ query: '', location: [], department: [], worktype: [], remote: [], ...(token ? { token } : {}) }),
        });
        if (!response.ok) throw new Error(`Listing API HTTP ${response.status}`);
        ({ jobs: index, nextPage } = parseWorkableApiIndex(await response.json(), company.slug));
      } else {
        index = parseWorkableIndex(markdown);
        if (!index.length && !/^# .+(?:Positions|Jobs)/mi.test(markdown)) throw new Error('Unrecognized Workable listing; not a verified empty board');
      }
      const signature = JSON.stringify(index.map(job => job.id));
      if (seen.has(signature)) throw new Error('Listing API repeated a page');
      seen.add(signature);
      if (!index.length && nextPage) throw new Error('Empty listing page with a continuation token');
      console.log(`[workable] ${company.slug}: ${index.length} open job(s) on page, continuation=${Boolean(nextPage)}`);
      for (const indexJob of index) {
        if (completed.has(indexJob.id)) continue;
        const canonical = `https://apply.workable.com/${company.slug}/j/${indexJob.id}/`;
        if (run?.isKnown('workable', canonical)) { completed.add(indexJob.id); continue; }
        checkpoint();
        if (Date.now() + 30_000 >= (run?.deadline ?? Infinity)) return jobs;
        if (!indexJob.detailUrl.startsWith(`https://apply.workable.com/${company.slug}/jobs/view/`)) throw new Error('Detail URL belongs to another board');
        let detail: string;
        try { detail = await fetchText(indexJob.detailUrl); }
        catch (error) {
          if (!(error instanceof WorkableHttpError) || ![404, 410].includes(error.status)) throw error;
          console.warn(`[workable] ${company.slug}: posting ${indexJob.id} is no longer available (HTTP ${error.status})`);
          completed.add(indexJob.id); continue;
        }
        const job = parseWorkableDetail(detail, company, indexJob);
        if (job) jobs.push(job);
        completed.add(indexJob.id);
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (!nextPage) { run?.checkpoint({ kind, token: null, completed: [] }); break; }
      if (nextPage === token) throw new Error('Listing API repeated its continuation token');
      token = nextPage; completed = new Set();
    }
  } catch (error) {
    checkpoint();
    console.warn(`[workable] ${company.slug}: ${(error as Error).message}`);
  }

  return jobs;
}
