/**
 * Flags editorial passages worth a human rewrite. This is intentionally a
 * heuristic audit, not an AI-content detector: a hit is a review signal,
 * never a verdict.
 *
 * Usage: npm run audit:editorial-content
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type Severity = 'high' | 'medium' | 'low';
type Finding = {
  file: string;
  section: string;
  signal: string;
  severity: Severity;
  reason: string;
  excerpt: string;
  suggestion: string;
};

type Block = { tag: string; text: string; section: string };

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'data', 'editorial-audit');

// 22 long-form guides plus the four core informational job landing pages.
// Index pages, job detail templates, legal pages, account pages and calculators
// are deliberately outside this editorial review.
const EDITORIAL_FILES = [
  'app/blog/what-does-a-solar-installer-do/page.tsx',
  'app/blog/how-to-land-first-solar-job/page.tsx',
  'app/blog/become-solar-installer-no-experience/page.tsx',
  'app/resources/solar-sales-1099-vs-w2-pay/page.tsx',
  'app/resources/solar-installer-vs-electrician-texas/page.tsx',
  'app/resources/solar-installer-certification/page.tsx',
  'app/resources/nabcep-project-credits-explained/page.tsx',
  'app/resources/solar-installer-apprenticeship-programs/page.tsx',
  'app/resources/do-you-need-to-be-an-electrician-for-bess/page.tsx',
  'app/resources/osha-safety-guide-solar-installers/page.tsx',
  'app/resources/nabcep-board-eligible-status/page.tsx',
  'app/resources/solar-engineer-jobs/page.tsx',
  'app/resources/how-to-get-a-solar-apprenticeship/page.tsx',
  'app/resources/how-to-become-a-solar-installer/page.tsx',
  'app/resources/how-to-get-nabcep-certified/page.tsx',
  'app/resources/nabcep-vs-eta-vs-state-licenses/page.tsx',
  'app/resources/manufacturer-certifications-tesla-enphase-solaredge/page.tsx',
  'app/resources/solar-dc-safety-for-electricians/page.tsx',
  'app/resources/nabcep-pvis-vs-pvip/page.tsx',
  'app/resources/nabcep-training-providers-compared/page.tsx',
  'app/resources/solar-certifications-by-job-role/page.tsx',
  'app/resources/nabcep-pvip-pass-rate/page.tsx',
  'app/solar-pv-installer-jobs/page.tsx',
  'app/solar-technician-jobs/page.tsx',
  'app/solar-sales-jobs/page.tsx',
  'app/solar-engineer-jobs/page.tsx',
];

const BANNED_PATTERNS: Array<{ pattern: RegExp; label: string; severity: Severity; suggestion: string }> = [
  { pattern: /\bin today's world\b/i, label: 'generic_opener', severity: 'medium', suggestion: 'Open with the specific job-market fact or reader problem instead.' },
  { pattern: /\bin the ever-evolving landscape of\b/i, label: 'generic_opener', severity: 'high', suggestion: 'Replace with the concrete solar context.' },
  { pattern: /\bwhen it comes to\b/i, label: 'generic_opener', severity: 'low', suggestion: 'State the point directly.' },
  // "harness" is deliberately absent: on solar safety pages it is literal
  // protective equipment, not an AI-style metaphor.
  { pattern: /\b(delv(?:e|ing)|boast(?:s|ing)?|leverage|robust|seamless|unlock|elevate|tapestry|testament to|plethora|myriad|foster|underscore)\b/i, label: 'ai_signature_vocabulary', severity: 'low', suggestion: 'Use a plain verb or a concrete fact; retain only when it is the clearest wording.' },
  { pattern: /\b(it['’]s important to note that|it['’]s worth (?:noting|mentioning)|one could argue)\b/i, label: 'empty_hedging', severity: 'medium', suggestion: 'Remove the preface and state the fact, or add the missing evidence.' },
  { pattern: /\b(many experts agree|studies show|research shows)\b/i, label: 'unsourced_authority_claim', severity: 'high', suggestion: 'Name and link the study or organization, or remove the claim.' },
  { pattern: /\b(on one hand|on the other hand)\b/i, label: 'formulaic_balance', severity: 'low', suggestion: 'Keep only if both sides provide a real, distinct trade-off.' },
];

// These disclosures are intentional legal/editorial boilerplate. They should
// be consistent wherever needed, not rewritten merely to defeat a repetition
// metric.
const REPEATED_SENTENCE_ALLOWLIST = [
  /^we may earn a commission if you enroll through this link/i,
  /^nabcep is an independent certification body and is not affiliated with solar roles/i,
];

function cleanJsx(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const tagPattern = /<(h[1-3]|p|li)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let currentSection = 'Page introduction';
  for (const match of source.matchAll(tagPattern)) {
    const tag = match[1].toLowerCase();
    const text = cleanJsx(match[2]);
    if (!text || text.length < 12) continue;
    if (tag.startsWith('h')) currentSection = text;
    blocks.push({ tag, text, section: currentSection });
  }
  return blocks;
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.split(/\s+/).length >= 5);
}

function excerpt(text: string, max = 220): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function normalizeSentence(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

async function main() {
  const findings: Finding[] = [];
  const allSentences = new Map<string, Array<{ file: string; section: string; text: string }>>();
  const pageStats: Array<{ file: string; blocks: number; sentences: number; words: number; findings: number }> = [];

  for (const relativeFile of EDITORIAL_FILES) {
    const source = await readFile(path.join(ROOT, relativeFile), 'utf8');
    const blocks = extractBlocks(source);
    const pageFindingsStart = findings.length;
    const pageSentences = blocks.flatMap((block) => sentences(block.text));

    for (const block of blocks) {
      for (const rule of BANNED_PATTERNS) {
        if (!rule.pattern.test(block.text)) continue;
        findings.push({
          file: relativeFile,
          section: block.section,
          signal: rule.label,
          severity: rule.severity,
          reason: `Matched ${rule.pattern.toString()}.`,
          excerpt: excerpt(block.text),
          suggestion: rule.suggestion,
        });
      }

      const transitionCount = (block.text.match(/\b(moreover|furthermore|additionally|in conclusion|overall)\b/gi) ?? []).length;
      if (transitionCount > 1) {
        findings.push({ file: relativeFile, section: block.section, signal: 'stacked_transitions', severity: 'medium', reason: `${transitionCount} mechanical transitions in one block.`, excerpt: excerpt(block.text), suggestion: 'Keep one transition at most, or use the logical connection without a signpost.' });
      }

      const emDashes = (block.text.match(/—/g) ?? []).length;
      if (emDashes > 1) {
        findings.push({ file: relativeFile, section: block.section, signal: 'em_dash_overuse', severity: 'low', reason: `${emDashes} em dashes in one block.`, excerpt: excerpt(block.text), suggestion: 'Use periods, commas, or parentheses where they make the relationship clearer.' });
      }

      if (block.tag === 'p' && /\b(significantly|a wide range of|various factors)\b/i.test(block.text) && !/\d|\$|%|BLS|NABCEP|OSHA|NEC|IEEE/i.test(block.text)) {
        findings.push({ file: relativeFile, section: block.section, signal: 'vague_emphasis_without_evidence', severity: 'medium', reason: 'Vague emphasis appears without a concrete supporting detail.', excerpt: excerpt(block.text), suggestion: 'Add a named example, standard, salary range, or remove the emphasis.' });
      }
    }

    const lengths = pageSentences.map((sentence) => sentence.split(/\s+/).length);
    if (lengths.length >= 8) {
      const mean = lengths.reduce((sum, value) => sum + value, 0) / lengths.length;
      const standardDeviation = Math.sqrt(lengths.reduce((sum, value) => sum + (value - mean) ** 2, 0) / lengths.length);
      if (standardDeviation < 5 && mean >= 10) {
        findings.push({ file: relativeFile, section: 'Page-wide', signal: 'low_sentence_length_variance', severity: 'low', reason: `Mean sentence length ${mean.toFixed(1)} words; standard deviation ${standardDeviation.toFixed(1)}.`, excerpt: 'Page-level rhythm signal.', suggestion: 'Vary sentence length where it improves pacing; do not alter concise technical passages solely to satisfy this metric.' });
      }
    }

    for (const sentence of pageSentences) {
      const normalized = normalizeSentence(sentence);
      if (normalized.split(' ').length < 9) continue;
      const sentenceForAllowlist = sentence.replace(/^\*\s*/, '');
      if (REPEATED_SENTENCE_ALLOWLIST.some((pattern) => pattern.test(sentenceForAllowlist))) continue;
      const entries = allSentences.get(normalized) ?? [];
      entries.push({ file: relativeFile, section: blocks.find((block) => block.text.includes(sentence))?.section ?? 'Unknown', text: sentence });
      allSentences.set(normalized, entries);
    }

    pageStats.push({
      file: relativeFile,
      blocks: blocks.length,
      sentences: pageSentences.length,
      words: pageSentences.join(' ').split(/\s+/).filter(Boolean).length,
      findings: findings.length - pageFindingsStart,
    });
  }

  for (const entries of allSentences.values()) {
    const distinctFiles = [...new Set(entries.map((entry) => entry.file))];
    if (distinctFiles.length < 2) continue;
    for (const entry of entries) {
      findings.push({
        file: entry.file,
        section: entry.section,
        signal: 'cross_page_repetition',
        severity: distinctFiles.length >= 3 ? 'medium' : 'low',
        reason: `Near-identical sentence appears in ${distinctFiles.length} editorial pages.`,
        excerpt: excerpt(entry.text),
        suggestion: 'Keep it only on the canonical guide; tailor or replace it elsewhere.',
      });
    }
  }

  const severityWeight: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => severityWeight[a.severity] - severityWeight[b.severity] || a.file.localeCompare(b.file));

  await mkdir(OUTPUT_DIR, { recursive: true });
  const generatedAt = new Date().toISOString();
  await writeFile(path.join(OUTPUT_DIR, 'editorial-content-audit.json'), JSON.stringify({ generatedAt, filesAudited: EDITORIAL_FILES, pageStats, findings }, null, 2));
  const headers = ['file', 'section', 'signal', 'severity', 'reason', 'excerpt', 'suggestion'];
  const csv = [headers.join(','), ...findings.map((finding) => headers.map((header) => csvCell(String(finding[header as keyof Finding]))).join(','))].join('\n');
  await writeFile(path.join(OUTPUT_DIR, 'editorial-content-audit.csv'), `${csv}\n`);

  const bySeverity = findings.reduce<Record<Severity, number>>((counts, finding) => { counts[finding.severity]++; return counts; }, { high: 0, medium: 0, low: 0 });
  console.log(`Audited ${EDITORIAL_FILES.length} editorial pages.`);
  console.log(`Findings: ${findings.length} (${bySeverity.high} high, ${bySeverity.medium} medium, ${bySeverity.low} low).`);
  console.log(`Output: ${path.relative(ROOT, OUTPUT_DIR)}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
