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

interface JobDecoderProps {
  jobDescription: string;
}

const severityStyles: Record<Severity, { dot: string; border: string; label: string; labelStyle: string }> = {
  red:    { dot: "bg-red-500",    border: "border-red-500/30",    label: "Red flag",  labelStyle: "text-red-400" },
  yellow: { dot: "bg-yellow-400", border: "border-yellow-400/30", label: "Watch out", labelStyle: "text-yellow-400" },
  green:  { dot: "bg-emerald-400",border: "border-emerald-400/30",label: "All good",  labelStyle: "text-emerald-400" },
};

const scoreConfig: Record<Severity, { label: string; color: string }> = {
  green:  { label: "Looks legit",           color: "text-emerald-400" },
  yellow: { label: "Proceed with caution",  color: "text-yellow-400" },
  red:    { label: "Multiple red flags",    color: "text-red-400" },
};

export default function JobDecoder({ jobDescription }: JobDecoderProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function decode() {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/decode-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Try again.");
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
    ? result.flags.reduce((acc, f) => { acc[f.severity]++; return acc; }, { green: 0, yellow: 0, red: 0 })
    : null;

  return (
    <div className="rounded-2xl overflow-hidden bg-[#0f0f0f] text-white shadow-xl border border-white/5">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/30">
            Beta
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/30">
            AI-powered
          </span>
        </div>
        <h3 className="text-base font-semibold tracking-tight text-white">
          Job Decoded
        </h3>
        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
          We read between the lines so you don't have to.
        </p>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {!result && !loading && (
          <p className="text-xs text-white/30 leading-relaxed mb-4">
            Hit decode — our AI will flag every corporate BS phrase in this job posting.
          </p>
        )}

        {/* Decode button */}
        {!result && (
          <button
            onClick={decode}
            disabled={loading || !jobDescription.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all
              bg-white text-[#0f0f0f] hover:bg-white/90 active:scale-[0.98]
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                Decoding…
              </span>
            ) : (
              "🔍 Decode this job"
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs">
            {error}
            <button onClick={decode} className="ml-2 underline underline-offset-2">Retry</button>
          </div>
        )}

        {/* Results */}
        {result && counts && (
          <div className="space-y-2">
            {/* Score summary */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1.5">
                {counts.red > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                    {counts.red} 🚩
                  </span>
                )}
                {counts.yellow > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">
                    {counts.yellow} ⚠️
                  </span>
                )}
                {counts.green > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">
                    {counts.green} ✅
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium ${scoreConfig[result.score].color}`}>
                {scoreConfig[result.score].label}
              </span>
            </div>

            {/* Flags */}
            {result.flags.map((flag, i) => {
              const s = severityStyles[flag.severity];
              return (
                <div
                  key={i}
                  className={`rounded-xl border px-3 py-2.5 bg-white/[0.03] ${s.border}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      {flag.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/30 italic leading-relaxed mb-1">
                    "{flag.original.length > 80 ? flag.original.slice(0, 80) + "…" : flag.original}"
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {flag.translation}
                  </p>
                </div>
              );
            })}

            {/* Verdict */}
            <div className="rounded-xl bg-white/[0.04] border border-white/5 px-3 py-2.5 mt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-1">Verdict</p>
              <p className="text-xs text-white/60 leading-relaxed">{result.verdict}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={copyResults}
                className="flex-1 py-2 text-xs font-medium rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
              >
                {copied ? "Copied!" : "Copy results"}
              </button>
              <button
                onClick={() => { setResult(null); setError(null); }}
                className="flex-1 py-2 text-xs font-medium rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-white/15 leading-relaxed">
          AI analysis for informational purposes only. Always do your own research.
        </p>
      </div>
    </div>
  );
}