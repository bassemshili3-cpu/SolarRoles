/**
 * Cybersecurity role taxonomy for oh-my-job.com
 *
 * Decides whether a job pulled from an ATS source belongs on a
 * cybersecurity-only job board. Filtering runs on the job title (cheap,
 * reliable, low false-positive rate). We deliberately do NOT match on
 * description text — too noisy (e.g. "SOC2 compliant" in a random SaaS
 * job description would false-positive on a naive "SOC" match).
 *
 * Tune this list as you see false positives/negatives in production.
 */

const INCLUDE_PATTERNS: RegExp[] = [
  /cyber\s*security/i,
  /\binfosec\b/i,
  /information security/i,
  /\bappsec\b/i,
  /application security/i,
  /cloud security/i,
  /network security/i,
  /security operations/i,
  /\bsoc\s*(analyst|engineer|ii|iii)\b/i,
  /threat (intel|hunting|hunter)/i,
  /incident response/i,
  /\bforensics?\b/i,
  /\bmalware\b/i,
  /pen(etration)?\s*test/i,
  /\bpentester\b/i,
  /red team/i,
  /blue team/i,
  /purple team/i,
  /vulnerabilit(y|ies)/i,
  /\bciso\b/i,
  /\biam\b/i,
  /identity and access/i,
  /\bgrc\b/i,
  /governance,?\s*risk/i,
  /devsecops/i,
  /security engineer/i,
  /security architect/i,
  /security analyst/i,
  /security researcher/i,
  /security consultant/i,
  /\bsiem\b/i,
  /\bsoar\b/i,
  /\bedr\b/i,
  /\bxdr\b/i,
  /\bmdr\b/i,
  /zero trust/i,
  /cryptograph(y|er)/i,
  /bug bounty/i,
  /ethical hack/i,
  /\bsecops\b/i,
  /security compliance/i,
  /data loss prevention/i,
  /\bdlp\b/i,
];

// Filtered out even if an include pattern also matches — protects against
// common false positives like "job security", "security guard", etc.
const EXCLUDE_PATTERNS: RegExp[] = [
  /security guard/i,
  /social media/i,
  /food security/i,
  /job security\b/i,
  /border security/i,
  /security deposit/i,
];

export function isCyberSecurityRole(title: string): boolean {
  if (!title) return false;
  if (EXCLUDE_PATTERNS.some((re) => re.test(title))) return false;
  return INCLUDE_PATTERNS.some((re) => re.test(title));
}