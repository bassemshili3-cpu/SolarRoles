// Filtre heuristique rapide — s'exécute avant l'appel IA pour attraper
// les cas évidents sans coût ni latence. Retourne un score + les raisons.

interface HeuristicResult {
  suspicious: boolean
  reasons: string[]
  score: number // 0-100, plus haut = plus suspect
}

const BANK_ACCOUNT_PATTERN = /(must not|shouldn'?t|don'?t)\s+(currently\s+)?(be\s+)?us(e|ing)\s+.{0,30}(bank of america|chase|wells fargo|boa|citibank)/i
const NO_EXPERIENCE_HIGH_PAY = /(no\s+(prior\s+)?(skills?|experience)\s+(required|needed))/i
const VAGUE_TASK_LANGUAGE = /(assigned tasks?|simple workload|reach out for (additional|more) information|serious inquiries only)/i
const PER_TASK_PAYMENT = /(paid?\s+(on\s+)?(a\s+)?per[\s-]?(job|task)\s+basis)/i
const REQUESTS_PERSONAL_BANKING = /(bank\s+account\s+(number|details)|routing\s+number|social security number|ssn|wire\s+transfer)/i
const NO_SIGNUP_FEE_INSISTENCE = /(no\s+(sign[\s-]?up|registration)\s+(fee|cost))/i // légitime seul, mais suspect combiné à d'autres signaux
const UNREALISTIC_HOURLY = /\$\s?\d{3,}\s?-\s?\$?\d{3,}\s?(an?\s+)?hour/i

export function runScamHeuristics(title: string, description: string): HeuristicResult {
  const text = `${title}\n${description}`
  const reasons: string[] = []
  let score = 0

  if (BANK_ACCOUNT_PATTERN.test(text)) {
    reasons.push('Mentions a specific bank account requirement (classic money mule pattern)')
    score += 60
  }
  if (REQUESTS_PERSONAL_BANKING.test(text)) {
    reasons.push('Requests banking/personal identification details')
    score += 50
  }
  if (NO_EXPERIENCE_HIGH_PAY.test(text) && UNREALISTIC_HOURLY.test(text)) {
    reasons.push('No experience required combined with unrealistic hourly pay')
    score += 35
  }
  if (PER_TASK_PAYMENT.test(text) && UNREALISTIC_HOURLY.test(text)) {
    reasons.push('Inconsistent pay structure (per-task language next to hourly rate)')
    score += 20
  }
  if (VAGUE_TASK_LANGUAGE.test(text)) {
    reasons.push('Vague, non-specific description of actual job duties')
    score += 15
  }
  if (NO_SIGNUP_FEE_INSISTENCE.test(text)) {
    reasons.push('Unprompted insistence on "no fees" (common scam reassurance tactic)')
    score += 10
  }

  return {
    suspicious: score >= 40,
    reasons,
    score: Math.min(score, 100),
  }
}