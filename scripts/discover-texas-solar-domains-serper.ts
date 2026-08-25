import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type Row = Record<string, string>;
type SerperResult = { title?: string; link?: string; snippet?: string };
type SerperResponse = { organic?: SerperResult[] };

const INPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-electrical-contractors.csv');
const OUTPUT = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors', 'texas-solar-domain-discovery-serper-v3.csv');
const EXCLUDED = new Set(['angi.com', 'austinenergy.com', 'bbb.org', 'bebee.com', 'bidroom.io', 'cityof.com', 'dallascityhall.com', 'dnb.com', 'energysage.com', 'enfsolar.com', 'facebook.com', 'google.com', 'homeadvisor.com', 'indeed.com', 'instagram.com', 'linkedin.com', 'manta.com', 'pacermonitor.com', 'prolistlocal.com', 'rcat.net', 'sanclemente.gov', 'solarreviews.com', 'sunpower.com', 'tephanie.com', 'thumbtack.com', 'todayshomeowner.com', 'yelp.com', 'youtube.com', 'yellowpages.com', 'zoominfo.com']);

function csv(source: string): Row[] {
  const records: string[][] = []; let row: string[] = []; let value = ''; let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i], next = source[i + 1];
    if (char === '"') { if (quoted && next === '"') { value += '"'; i += 1; } else quoted = !quoted; }
    else if (char === ',' && !quoted) { row.push(value); value = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && next === '\n') i += 1; row.push(value); if (row.some(Boolean)) records.push(row); row = []; value = ''; }
    else value += char;
  }
  if (value || row.length) records.push([...row, value]);
  const [headers = [], ...rows] = records;
  return rows.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])));
}
function escape(value: unknown) { const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
async function save(file: string, rows: Row[]) { const headers = rows.length ? Object.keys(rows[0]) : []; await writeFile(file, `${[headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n')}\n`, 'utf8'); }
function host(url: string) { try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } }
function invalid(domain: string) { return [...EXCLUDED].some((entry) => domain === entry || domain.endsWith(`.${entry}`)); }
function nameTokens(name: string) { return name.toLowerCase().match(/[a-z0-9]{2,}/g)?.filter((word) => !['solar', 'electric', 'electrical', 'energy', 'inc', 'llc', 'corp', 'company', 'texas', 'and', 'the'].includes(word)).slice(0, 4) ?? []; }
function selectOfficial(row: Row, results: SerperResult[]) {
  const tokens = nameTokens(row.businessName);
  return results.map((result) => {
    const domain = host(result.link ?? ''), text = `${result.title ?? ''} ${result.snippet ?? ''} ${domain}`.toLowerCase();
    const domainMatches = tokens.filter((word) => domain.includes(word)).length;
    const score = tokens.filter((word) => text.includes(word)).length + domainMatches * 2;
    return { result, domain, score, domainMatches };
  }).filter((candidate) => candidate.domain && candidate.domainMatches > 0 && !invalid(candidate.domain)).sort((a, b) => b.score - a.score)[0];
}
async function search(row: Row, apiKey: string) {
  const query = `"${row.businessName}" "${row.cityStateZip}" Texas solar contractor official website`;
  const response = await fetch('https://google.serper.dev/search', { method: 'POST', headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ q: query, gl: 'us', hl: 'en', num: 10 }) });
  const text = await response.text();
  if (!response.ok) throw new Error(`Serper ${response.status}: ${text.slice(0, 200)}`);
  return { query, results: (JSON.parse(text) as SerperResponse).organic ?? [] };
}
async function main() {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('Missing SERPER_API_KEY in .env');
  const args = process.argv.slice(2), limit = Number(args[args.indexOf('--limit') + 1]) || Number.MAX_SAFE_INTEGER, concurrency = Number(args[args.indexOf('--concurrency') + 1]) || 4;
  const input = (csv(await readFile(INPUT, 'utf8'))).slice(0, limit);
  let output: Row[] = []; try { output = csv(await readFile(OUTPUT, 'utf8')); } catch { /* no previous run */ }
  const done = new Set(output.map((row) => row.licenseNumber)), pending = input.filter((row) => !done.has(row.licenseNumber));
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  console.log(`Selected: ${input.length}; already saved: ${output.length}; remaining: ${pending.length}`);
  for (let start = 0; start < pending.length; start += concurrency) {
    const batch = await Promise.all(pending.slice(start, start + concurrency).map(async (row) => {
      try { const found = await search(row, apiKey), selected = selectOfficial(row, found.results); return { ...row, serperQuery: found.query, candidateDomain: selected?.domain ?? '', candidateUrl: selected?.result.link ?? '', candidateTitle: selected?.result.title ?? '', candidateSnippet: selected?.result.snippet ?? '', discoveryStatus: selected ? 'candidate_found' : 'no_official_domain_candidate', discoveryError: '' }; }
      catch (error) { return { ...row, serperQuery: '', candidateDomain: '', candidateUrl: '', candidateTitle: '', candidateSnippet: '', discoveryStatus: 'search_error', discoveryError: error instanceof Error ? error.message : String(error) }; }
    }));
    output.push(...batch); await save(OUTPUT, output);
    for (const result of batch) console.log(`[${output.indexOf(result) + 1}/${input.length}] ${result.businessName} — ${result.discoveryStatus}${result.candidateDomain ? ` (${result.candidateDomain})` : ''}`);
  }
  console.log(`Finished. Candidate domains: ${output.filter((row) => row.discoveryStatus === 'candidate_found').length}/${output.length}`);
  console.log(`Output: ${OUTPUT}`);
}
main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
