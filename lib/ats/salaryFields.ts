import { htmlText, jobPostings, type JobIdentity } from './sourceFields';

export type SalaryFields = { salary: string; salaryMin: number; salaryMax: number; salaryPeriod: string };
const FACTORS: Record<string, number> = { HOUR: 2080, DAY: 260, WEEK: 52, MONTH: 12, YEAR: 1 };

export function salaryPeriod(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  const text = value.toLowerCase();
  if (/hour|hourly|\/hr\b|^hr$/.test(text)) return 'HOUR';
  if (/year|annual|\/yr\b|^yr$/.test(text)) return 'YEAR';
  if (/month|monthly|\/mo\b/.test(text)) return 'MONTH';
  if (/week|weekly|\/wk\b/.test(text)) return 'WEEK';
  if (/\bday\b|daily/.test(text)) return 'DAY';
}

function amount(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : undefined;
  if (typeof value !== 'string' || !value.trim()) return;
  const match = value.trim().replace(/[$,\s]/g, '').match(/^(\d+(?:\.\d+)?)(k)?$/i);
  if (!match) return;
  const n = Number(match[1]) * (match[2] ? 1000 : 1);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Numeric fields are annualized exactly once here; original unit stays in display. */
export function numericSalary(min: unknown, max: unknown, currency: unknown, unit: unknown): SalaryFields | undefined {
  const low = amount(min), high = amount(max), period = salaryPeriod(unit);
  if (currency !== 'USD' || low === undefined || high === undefined || high < low || !period) return;
  const salaryMin = Math.round(low * FACTORS[period]), salaryMax = Math.round(high * FACTORS[period]);
  if (salaryMin < 20000 || salaryMax > 600000) return;
  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return { salaryMin, salaryMax, salaryPeriod: period, salary: `$${fmt(low)}${low !== high ? ' - $' + fmt(high) : ''}/${period.toLowerCase()}` };
}

export function chooseSalary(values: Array<SalaryFields | undefined>): SalaryFields | undefined {
  const valid = values.filter((v): v is SalaryFields => Boolean(v));
  const keys = new Set(valid.map(v => JSON.stringify([v.salaryMin, v.salaryMax, v.salaryPeriod])));
  return keys.size === 1 ? valid[0] : undefined;
}

export function structuredSalary(value: unknown): SalaryFields | undefined {
  const all = Array.isArray(value) ? value : [value];
  return chooseSalary(all.map(item => {
    if (!item || typeof item !== 'object') return;
    const salary = item as Record<string, unknown>;
    if (!salary.value || typeof salary.value !== 'object') return;
    const raw = salary.value as Record<string, unknown>;
    return numericSalary(raw.minValue ?? raw.value, raw.maxValue ?? raw.value, salary.currency ?? raw.currency, raw.unitText ?? raw.unitCode ?? salary.unitText);
  }));
}

export function textBaseSalary(input: string, salaryLabel = false): SalaryFields | undefined {
  const text = htmlText(input);
  const candidates: SalaryFields[] = [];
  const pattern = /(?:USD\s*|\$\s*)(\d[\d,]*(?:\.\d{1,2})?\s*[kK]?)\s*(?:[-–—]|to)\s*(?:USD\s*|\$\s*)?(\d[\d,]*(?:\.\d{1,2})?\s*[kK]?)/gi;
  for (const match of text.matchAll(pattern)) {
    const start = match.index!;
    const before = text.slice(Math.max(0, start - 110), start);
    const after = text.slice(start + match[0].length, start + match[0].length + 65)
      .replace(/(Annually|Hourly|Yearly|Monthly|Weekly|Hour|Year|Month|Week)(?=[A-Z])/g, '$1 ');
    const currentClause = before.split(/[.;!?]\s+/).at(-1) || '';
    const labels = [...currentClause.matchAll(/\b(?:salary|base pay|pay range|hourly rate|hourly pay|wage|compensation)\b/gi)];
    const labelledContext = labels.length ? currentClause.slice(labels.at(-1)!.index) : currentClause;
    // Never classify sales earning potential, benefits, reimbursements or OTE as base.
    if (/\b(?:OTE|on.target earnings|commission|bonus|sign.on|total compensation|total earnings|per diem|reimbursement)\b/i.test(labelledContext)
      || /\b(?:OTE|on.target earnings|total compensation|total earnings|per diem)\b/i.test(currentClause)
      || /^\s*(?:in\s+)?(?:bonus|commission|OTE|per diem|sign.on)/i.test(after)) continue;
    if (/\b(?:CAD|AUD|NZD|SGD|HKD)\b|CA\$|AU\$|C\$/i.test(before + match[0] + after)) continue;
    // Prefer the adjacent suffix. Never borrow a later sentence's period.
    const suffix = after.match(/^\s*(?:(?:USD|US)\s*)?(?:(?:Pay Rate Type|Pay Frequency)\s*:\s*)?(?:(?:\/|per|an?|each)\s*)?(hour(?:ly)?|hr|year(?:ly)?|yr|annual(?:ly)?|month(?:ly)?|mo|week(?:ly)?|wk|day|daily)\b/i)?.[1];
    if (!salaryLabel && !suffix && !/\b(?:salary|base pay|pay range|hourly rate|hourly pay|wage|compensation)\b/i.test(before)) continue;
    const nearbyBefore = before.split(/[.;!?]\s+/).at(-1) || '';
    const period = suffix ? salaryPeriod(suffix) : salaryPeriod(nearbyBefore);
    if (!period) continue;
    let low = amount(match[1]), high = amount(match[2]);
    if (/[kK]/.test(match[2]) && !/[kK]/.test(match[1]) && low !== undefined && low < 1000) low *= 1000;
    const salary = numericSalary(low, high, 'USD', period);
    if (salary) candidates.push(salary);
  }
  const separated = text.match(/\bMin\s+(?:USD\s*)?\$([\d,.]+)\s*\/(Yr|Hour|Hr)\.?\s+Max\s+(?:USD\s*)?\$([\d,.]+)\s*\/(Yr|Hour|Hr)\b/i);
  if (separated && salaryPeriod(separated[2]) === salaryPeriod(separated[4])) {
    const salary = numericSalary(separated[1], separated[3], 'USD', salaryPeriod(separated[2]));
    if (salary) candidates.push(salary);
  }
  return chooseSalary(candidates);
}

export function htmlBaseSalary(html: string, identity: JobIdentity): SalaryFields | undefined {
  const postings = jobPostings(html, identity);
  const structured = postings.map(node => structuredSalary(node.baseSalary)).filter((v): v is SalaryFields => Boolean(v));
  if (structured.length) return chooseSalary(structured);
  return chooseSalary(postings.map(node => textBaseSalary(String(node.description || ''))));
}

export function leverSalary(range: unknown): SalaryFields | undefined {
  if (!range || typeof range !== 'object') return;
  const r = range as Record<string, unknown>;
  return numericSalary(r.min, r.max, r.currency, r.interval);
}

export function ashbySalary(compensation: unknown): SalaryFields | undefined {
  if (!compensation || typeof compensation !== 'object') return;
  const components = (compensation as Record<string, unknown>).summaryComponents;
  if (!Array.isArray(components)) return;
  return chooseSalary(components.filter(c => c?.compensationType === 'Salary').map(c => numericSalary(c.minValue, c.maxValue, c.currencyCode, c.interval)));
}
