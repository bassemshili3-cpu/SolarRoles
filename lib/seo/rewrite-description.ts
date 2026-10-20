import { validateBoundedRewrite } from './rewrite-validation';

// Groq Chat Completions; no fallback to another provider.
// Keep the model configurable for cost/quality tuning without a code change.
export const SEO_REWRITE_MODEL = process.env.SEO_REWRITE_GROQ_MODEL ?? 'openai/gpt-oss-120b';
const MAX_OUTPUT_TOKENS = 2000;

// Bump this whenever the prompt/logic below changes meaningfully — any job
// with an older version can be explicitly queued for reprocessing. The cron
// processes only tasks queued by newly inserted seed jobs.
export const SEO_REWRITE_VERSION = 8;

const SYSTEM_PROMPT = `You rewrite solar job postings for solarroles.com, a niche US job board for solar photovoltaic installers, lead installers, solar sales representative, solar engineer, solar electrician, o&m technician, solar project manager, solar estimator, o&m technician , remote solar jobs .

Rules:
- Keep every factual detail: responsibilities, requirements, certifications (e.g. NABCEP, OSHA), physical requirements, salary, location, travel expectations, benefits. Never invent or drop facts.
- Rewrite the wording and structure completely — don't lightly edit the original phrasing, and don't preserve the source's marketing hooks or slogans verbatim.
- Banned patterns, in any form: "not just a X, it's a Y" (or "more than a job/role", "isn't just... it's..."). Never use this construction. Also avoid generic hype openers like "Tired of the status quo?", rhetorical questions as hooks, and unearned superlatives ("world-class", "rockstar", "ninja", "unstoppable").
- Structure, in this exact order, using HTML: a short <p> intro (2-4 sentences) stating the role, company, and location plainly, and folding in any distinctive context the source provides — team structure, day-to-day rhythm, what makes this role/site notable. If the source has no such context beyond the basics, keep the intro at 2-3 sentences. Then <h3> sections for "Responsibilities", "Requirements", and "Benefits" — only include sections the original content actually supports.
- Requirements and Responsibilities MUST be formatted as <ul><li> bullet lists, one concrete item per line (e.g. specific certifications, years of experience, physical requirements, tools/skills) — never as a paragraph of prose.
- If the source lists company values or culture statements, compress them into at most one short sentence inside the intro — never reproduce them as a standalone list.
- Neutral, professional tone throughout. Write like a well-edited job board, not like an ad.
- Naturally include solar-installation-relevant terms a candidate might search for (e.g. PV racking, module installation, DC/AC wiring, rooftop, residential/commercial, battery storage) based only on what the role actually covers — never force in terms that don't apply.
- Requirements: include only hard skills and objective qualifications — certifications, years of hands-on experience, physical/environmental capabilities, licenses, tools/equipment. Omit soft-skill or attitude traits (communication, attendance, teamwork, attention to detail, professionalism, "works well independently/with others") — these don't help a candidate self-select and only lengthen the section.
- Output ONLY the rewritten HTML description. No preamble, no markdown code fences, no commentary.`;

export interface RewritableJob {
  title: string;
  company: string;
  location: string;
  description: string;
}

const rewritePrompt = (job: RewritableJob) => `Job title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\n\nOriginal description:\n${job.description}`;

/** Conservative UTF-8 byte bound, including output/reasoning and chat framing. */
export function rewriteTokenReservation(job: RewritableJob): number {
  return Buffer.byteLength(SYSTEM_PROMPT + rewritePrompt(job), 'utf8') + MAX_OUTPUT_TOKENS + 2048;
}

export async function rewriteJobDescriptionForSeo(job: RewritableJob, options: { maxCharacters?: number; attempt?: number } = {}): Promise<string> {
  const proxy = process.env.GROQ_PROXY_URL;
  const key = proxy ? process.env.CRON_SECRET : process.env.GROQ_API_KEY;
  if (!key) throw new Error('Groq credentials are required');
  if (!/^[a-zA-Z0-9._/-]+$/.test(SEO_REWRITE_MODEL)) throw new Error('Invalid SEO_REWRITE_GROQ_MODEL');
  const maxCharacters = Math.min(options.maxCharacters ?? 3000, 3000);
  if (!Number.isInteger(maxCharacters) || maxCharacters < 1) throw new Error('maxCharacters must be a positive integer');

  const response = await fetch(proxy || 'https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', redirect: 'error',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({ model: SEO_REWRITE_MODEL, max_completion_tokens: MAX_OUTPUT_TOKENS, temperature: 0.2, ...(SEO_REWRITE_MODEL.startsWith('openai/gpt-oss-') ? { reasoning_effort: 'low' } : {}),
      messages: [{ role: 'system', content: SYSTEM_PROMPT + `\n- Hard length limit: the entire HTML output, including tags, spaces and punctuation, must contain no more than ${maxCharacters} characters. Aim for ${Math.floor(maxCharacters * (options.attempt ? 0.8 : 0.9))}. Use concise sentences and compact list items. Combine related facts without deleting objective details. Do not truncate sentences or HTML. ${options.attempt ? 'The previous attempt was too long or invalid; make this version more concise.' : ''}` }, { role: 'user', content: rewritePrompt(job) }],
    }),
  });
  if (!response.ok) {
    const retryAfter = response.headers.get('retry-after');
    await response.body?.cancel();
    throw new RewriteApiError(response.status, retryAfter);
  }
  const result = await response.json() as { choices?: { message?: { content?: string }; finish_reason?: string }[] };
  const choice = result.choices?.[0];
  const text = choice?.message?.content;
  if (choice?.finish_reason !== 'stop' || typeof text !== 'string') throw new Error('Groq output was incomplete or blocked; description was not saved');

  if (!text.trim()) {
    throw new Error('Groq returned no text content for this job description');
  }

  const cleaned = text
    .trim()
    .replace(/^```(?:html)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  if (cleaned.length > maxCharacters) {
    throw new Error(`Groq output exceeds ${maxCharacters} characters; description was not saved`);
  }
  validateBoundedRewrite(cleaned, maxCharacters);
  return cleaned;
}

// No provider bodies or source content are exposed to operational logs.
export class RewriteApiError extends Error {
  constructor(public readonly status: number, public readonly retryAfter: string | null) {
    super(`Groq HTTP ${status}`);
    this.name = 'RewriteApiError';
  }
}
