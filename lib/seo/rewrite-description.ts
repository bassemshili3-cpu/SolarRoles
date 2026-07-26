import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Haiku is plenty for this and far cheaper at volume; bump to a Sonnet-tier
// model via env var if you want more polished output.
const MODEL = process.env.SEO_REWRITE_MODEL ?? 'claude-haiku-4-5-20251001';

// Bump this whenever the prompt/logic below changes meaningfully — any job
// with a stamped version below this constant gets reprocessed on the next
// run of scripts/rewrite-descriptions.ts.
export const SEO_REWRITE_VERSION = 1;

const SYSTEM_PROMPT = `You rewrite cybersecurity job postings for oh-my-job.com, a niche US cybersecurity job board.

Rules:
- Keep every factual detail: responsibilities, requirements, tech stack, certifications, salary, location, remote policy, benefits. Never invent or drop facts.
- Rewrite the wording and structure — don't just lightly edit the original phrasing.
- Naturally include cybersecurity-relevant terms a candidate might search for (e.g. the specific domain the role covers: SOC, AppSec, GRC, cloud security, pentesting) based only on what the role actually covers — never force in terms that don't apply.
- Structure: a short 2-3 sentence intro, then clear sections with HTML headings (<h3>) for "About the Role", "Responsibilities", "Requirements", and "Benefits" — only include the sections the original content actually supports.
- Use <ul><li> for lists. Keep paragraphs short.
- Neutral, professional tone. No marketing fluff, no unearned superlatives ("world-class", "rockstar", "ninja") — strip these if present in the source.
- Output ONLY the rewritten HTML description. No preamble, no markdown code fences, no commentary.`;

export interface RewritableJob {
  title: string;
  company: string;
  location: string;
  description: string;
}

export async function rewriteJobDescriptionForSeo(job: RewritableJob): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Job title: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\n\nOriginal description:\n${job.description}`,
      },
    ],
  });

  const block = message.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') {
    throw new Error('Claude returned no text content for this job description');
  }
  return block.text.trim();
}