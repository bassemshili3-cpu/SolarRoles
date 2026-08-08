import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Haiku is plenty for this and far cheaper at volume; bump to a Sonnet-tier
// model via env var if you want more polished output.
const MODEL = process.env.SEO_REWRITE_MODEL ?? 'claude-haiku-4-5-20251001';

// Bump this whenever the prompt/logic below changes meaningfully — any job
// with a stamped version below this constant gets reprocessed on the next
// run of scripts/rewrite-descriptions.ts.
export const SEO_REWRITE_VERSION = 5

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

  const cleaned = block.text
    .trim()
    .replace(/^```(?:html)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  return cleaned;
}