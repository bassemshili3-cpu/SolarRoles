import * as cheerio from 'cheerio';

export type SourceRecord = Record<string, unknown>;
export type JobIdentity = { url: string; title?: string; allowSingleWithoutUrl?: boolean };

export function sameSourceJob(candidate: string, expected: string): boolean {
  try {
    const a = new URL(candidate, expected), b = new URL(expected);
    if (a.origin !== b.origin) return false;
    if (/\.icims\.com$/i.test(b.hostname)) {
      const id = b.pathname.match(/\/jobs\/(\d+)\//)?.[1];
      return Boolean(id && a.pathname.match(/\/jobs\/(\d+)\//)?.[1] === id);
    }
    for (const key of ['gh_jid', 'req']) if (a.searchParams.get(key) !== b.searchParams.get(key)) return false;
    if (b.hash && a.hash !== b.hash) return false;
    return a.pathname.replace(/\/$/, '') === b.pathname.replace(/\/$/, '');
  } catch { return false; }
}

/** Select only the requested JobPosting, including nested @graph/arrays. */
export function jobPostings(html: string, identity: JobIdentity): SourceRecord[] {
  const $ = cheerio.load(html), nodes: SourceRecord[] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!value || typeof value !== 'object') return;
    const node = value as SourceRecord;
    if ([node['@type']].flat().includes('JobPosting')) nodes.push(node);
    if (node['@graph']) visit(node['@graph']);
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try { visit(JSON.parse($(el).text())); } catch { /* Inspect remaining blocks. */ }
  });
  const clean = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  return nodes.filter(node => typeof node.url === 'string' ? sameSourceJob(node.url, identity.url)
    : nodes.length === 1 && (identity.allowSingleWithoutUrl && !identity.title || Boolean(identity.title) && clean(node.title) === clean(identity.title)));
}

export function htmlText(value: string): string {
  const $ = cheerio.load(value.replace(/<\\\//g, '</'));
  $('script,style').remove();
  // Block boundaries must not concatenate a pay period with the next paragraph.
  $('p,div,li,br,h1,h2,h3,tr').each((_, el) => { $(el).append(' '); });
  return $.root().text().replace(/\\u00a0/gi, ' ').replace(/\s+/g, ' ').trim();
}
