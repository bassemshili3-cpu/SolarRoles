import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx') as typeof import('xlsx');

type CsvRow = Record<string, string | number | undefined>;

const defaultInput = 'C:\\Users\\basse\\Downloads\\Lteecele.csv';
const outputDir = path.join(process.cwd(), 'data', 'texas-solar-electrical-contractors');

const directSolarPattern = /\bsolar\b|\bphotovoltaic\b|(?<![a-z])pv(?![a-z])/i;
const secondarySolarPattern = /\brenewable\b|\bclean\s+energy\b|\bsunpower\b|\bsolaredge\b|\benphase\b/i;

function value(row: CsvRow, key: string): string {
  return String(row[key] ?? '').trim();
}

function parseDate(raw: string): Date | undefined {
  const excelSerial = Number(raw);
  if (Number.isFinite(excelSerial) && excelSerial > 30_000) {
    // SheetJS coerces date-looking CSV cells to Excel serial dates.
    return new Date(Date.UTC(1899, 11, 30) + Math.floor(excelSerial) * 86_400_000);
  }
  const match = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return undefined;
  const date = new Date(`${match[3]}-${match[1]}-${match[2]}T00:00:00`);
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

function formatDate(date: Date | undefined): string {
  return date ? date.toISOString().slice(0, 10) : '';
}

function csvEscape(value: unknown): string {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(filePath: string, rows: Record<string, unknown>[]) {
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const contents = [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\n');
  fs.writeFileSync(filePath, `${contents}\n`, 'utf8');
}

function main() {
  const input = process.argv[2] || defaultInput;
  if (!fs.existsSync(input)) throw new Error(`Input file not found: ${input}`);

  const workbook = XLSX.readFile(input, { raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const sourceRows = XLSX.utils.sheet_to_json<CsvRow>(sheet, { defval: '' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eligible = sourceRows.filter((row) => {
    const expiry = parseDate(value(row, 'LICENSE EXPIRATION DATE'));
    return expiry && expiry >= today;
  });

  const targets = eligible.flatMap((row) => {
    const businessName = value(row, 'BUSINESS NAME') || value(row, 'NAME');
    const searchableName = `${businessName} ${value(row, 'NAME')}`;
    const direct = directSolarPattern.test(searchableName);
    const secondary = secondarySolarPattern.test(searchableName);
    if (!direct && !secondary) return [];

    return [{
      licenseNumber: value(row, 'LICENSE NUMBER'),
      licenseExpirationDate: formatDate(parseDate(value(row, 'LICENSE EXPIRATION DATE'))),
      businessName,
      contactName: value(row, 'NAME'),
      cityStateZip: value(row, 'BUSINESS CITY, STATE ZIP'),
      county: value(row, 'BUSINESS COUNTY'),
      zip: value(row, 'BUSINESS ZIP'),
      phone: value(row, 'BUSINESS PHONE') || value(row, 'PHONE NUMBER'),
      businessAddress: [value(row, 'BUSINESS ADDRESS-LINE1'), value(row, 'BUSINESS ADDRESS-LINE2')].filter(Boolean).join(', '),
      solarSignal: direct ? 'explicit_solar_or_pv' : 'renewable_or_solar_brand',
      targetScore: direct ? 100 : 70,
      nextStep: 'Find official domain, then audit careers pages for detailed solar jobs.',
    }];
  }).sort((left, right) => right.targetScore - left.targetScore || left.businessName.localeCompare(right.businessName));

  fs.mkdirSync(outputDir, { recursive: true });
  writeCsv(path.join(outputDir, 'texas-solar-electrical-contractors.csv'), targets);
  fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: input,
    totalLicenses: sourceRows.length,
    activeLicenses: eligible.length,
    retained: targets.length,
    explicitSolarOrPv: targets.filter((target) => target.solarSignal === 'explicit_solar_or_pv').length,
    renewableOrSolarBrand: targets.filter((target) => target.solarSignal === 'renewable_or_solar_brand').length,
    excluded: { expiredOrUnparseable: sourceRows.length - eligible.length, noExplicitSolarSignal: eligible.length - targets.length },
  }, null, 2));

  console.log(`Texas electrical contractors: ${targets.length}/${sourceRows.length} retained (${eligible.length} active licenses)`);
  console.log(`Output: ${path.relative(process.cwd(), outputDir)}`);
}

main();
