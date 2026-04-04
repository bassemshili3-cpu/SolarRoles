"use client";

import { useState } from "react";

type Severity = "green" | "yellow" | "red";

interface Flag {
  category: string;
  original: string;
  translation: string;
  severity: Severity;
}

interface DecodeResult {
  flags: Flag[];
  verdict: string;
  score: Severity;
}

const EXAMPLES = {
  startup: `Senior Full-Stack Rockstar (Startup)

We're a fast-moving startup disrupting the SaaS space. We're looking for a self-starter who thrives in ambiguity and can wear many hats. You'll be joining our family of passionate entrepreneurs who move fast and break things.

- Own multiple projects simultaneously with minimal supervision
- Be comfortable with shifting priorities and a fast-paced environment
- Hustle hard and go above and beyond — we reward loyalty
- Salary: competitive, based on experience
- Remote-friendly (some in-office time required)`,

  corporate: `Marketing Manager — Join Our Family!

At Acme Corp, we believe in work-life integration, not just balance. We're a tight-knit team that celebrates wins together. You'll wear many hats in this highly visible role.

- 7+ years experience (entry-to-mid level position)
- Must be available outside regular hours when needed
- Proactive, autonomous, and comfortable with ambiguity
- Unlimited PTO policy
- "We work hard, play hard" culture`,

  sales: `Sales Representative — Unlimited Earning Potential!

We offer a competitive base salary with uncapped commission. Our top performers earn 6 figures! This role requires someone driven and not afraid to hustle.

- Base salary: DOE (Depending on Experience)
- Must be a team player but also independently motivated
- Fast-paced, high-energy environment
- No experience necessary — we'll train the right candidate
- Immediate start required`,
};

const SYSTEM_PROMPT = `You are a brutally honest job posting decoder for Gen Z job seekers. Analyze job descriptions and expose corporate BS with wit and precision.

Return ONLY a valid JSON object (no markdown, no backticks) with this exact structure:
{
  "flags": [
    {
      "category": "short category label (e.g. Culture, Salary, Workload, Management, Growth)",
      "original": "exact phrase or sentence from the job posting",
      "translation": "what it REALLY means, sarcastic but accurate, max 1 sentence",
      "severity": "green" | "yellow" | "red"
    }
  ],
  "verdict": "1-2 sentence honest overall verdict on this job posting",
  "score": "green" | "yellow" | "red"
}

Severity rules:
- green: neutral or genuinely positive signal
- yellow: mild red flag, proceed with caution
- red: major red flag, serious concern

Extract 4-7 of the most telling phrases. Focus on buzzwords, vague language, salary opacity, culture claims, and workload hints. Be sharp, funny but fair. Never fabricate — only analyze what's in the text.`;

const severityConfig: Record<Severity, { label: string; bg: string; text: string; border: string }> = {
  green:  { label: "ok",       bg: "#EAF3DE", text: "#3B6D11", border: "#3B6D11" },
  yellow: { label: "caution",  bg: "#FAEEDA", text: "#BA7517", border: "#BA7517" },
  red:    { label: "red flag", bg: "#FCEBEB", text: "#A32D2D", border: "#E24B4A" },
};

const scoreLabel: Record<Severity, string> = {
  green:  "Looks legit",
  yellow: "Proceed with caution",
  red:    "Multiple red flags",
};

interface JobDecoderProps {
  defaultValue?: string
}

export default function JobDecoder({ defaultValue = "" }: JobDecoderProps) {
  const [input, setInput] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function decode() {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/decode-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: input }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyResults() {
    if (!result) return;
    const icons: Record<Severity, string> = { red: "🚩", yellow: "⚠️", green: "✅" };
    let text = `Job Decoded by Oh My Job\n${"─".repeat(30)}\n\n`;
    result.flags.forEach((f) => {
      text += `${icons[f.severity]} ${f.category.toUpperCase()}\n"${f.original}"\n→ ${f.translation}\n\n`;
    });
    text += `Verdict: ${result.verdict}\n\noh-my-job.com`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const counts = result
    ? result.flags.reduce(
        (acc, f) => { acc[f.severity]++; return acc; },
        { green: 0, yellow: 0, red: 0 }
      )
    : null;

  return (
    <div className="w-full font-sans">
      {/* Header */}
      <div className="mb-5">
        <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-700 mb-2 uppercase tracking-wide">
          Beta feature
        </span>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Job Decoded</h2>
        <p className="text-sm text-gray-500">
          Paste any job description. We translate the corporate speak — honestly.
        </p>
      </div>

      {/* Textarea */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Paste the full job description here...\n\ne.g. "We're looking for a rockstar self-starter who thrives in a fast-paced environment..."`}
        className="w-full min-h-[140px] text-sm px-3 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 resize-y leading-relaxed focus:outline-none focus:border-gray-400 placeholder-gray-400"
      />

      {/* Example buttons */}
      <div className="flex flex-wrap gap-2 mt-2 items-center">
        <span className="text-xs text-gray-400">Try an example:</span>
        {(Object.keys(EXAMPLES) as Array<keyof typeof EXAMPLES>).map((key) => (
          <button
            key={key}
            onClick={() => setInput(EXAMPLES[key])}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
          >
            {key === "startup" ? "Startup rockstar" : key === "corporate" ? 'Corporate "family"' : "Competitive salary"}
          </button>
        ))}
      </div>

      {/* Decode button */}
      <button
        onClick={decode}
        disabled={loading || !input.trim()}
        className="mt-3 w-full py-3 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Decoding…" : "Decode this job"}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-3 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Results */}
      {result && counts && (
        <div className="mt-5">
          {/* Score bar */}
          <div className="flex flex-wrap gap-2 items-center mb-4">
            {counts.green > 0 && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                {counts.green} ok
              </span>
            )}
            {counts.yellow > 0 && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                {counts.yellow} caution
              </span>
            )}
            {counts.red > 0 && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                {counts.red} red flag{counts.red > 1 ? "s" : ""}
              </span>
            )}
            <span className="ml-auto text-xs text-gray-400">{scoreLabel[result.score]}</span>
          </div>

          {/* Flags */}
          <div className="flex flex-col gap-2">
            {result.flags.map((flag, i) => {
              const cfg = severityConfig[flag.severity];
              return (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl px-4 py-3 bg-white"
                  style={{ borderLeft: `3px solid ${cfg.border}` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    {flag.category}
                  </p>
                  <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-2 py-1.5 mb-2">
                    "{flag.original}"
                  </p>
                  <p className="text-sm font-medium text-gray-900">{flag.translation}</p>
                </div>
              );
            })}
          </div>

          {/* Verdict */}
          <div className="mt-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Verdict</p>
            <p className="text-sm text-gray-900 leading-relaxed">{result.verdict}</p>
          </div>

          {/* Copy button */}
          <button
            onClick={copyResults}
            className="mt-3 w-full py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {copied ? "Copied!" : "Copy decoded results"}
          </button>
        </div>
      )}
    </div>
  );
}