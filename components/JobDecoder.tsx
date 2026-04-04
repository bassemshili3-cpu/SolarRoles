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

const severityStyles: Record<Severity, {
  dot: string;
  border: string;
  bg: string;
  label: string;
  labelStyle: string;
  badgeBg: string;
  badgeText: string;
}> = {
  red:    {
    dot: "bg-red-500",
    border: "border-red-300",
    bg: "bg-red-50",
    label: "Red flag",
    labelStyle: "text-red-600",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700"
  },
  yellow: {
    dot: "bg-amber-500",
    border: "border-amber-300",
    bg: "bg-amber-50",
    label: "Watch out",
    labelStyle: "text-amber-600",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700"
  },
  green:  {
    dot: "bg-emerald-500",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    label: "All good",
    labelStyle: "text-emerald-600",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700"
  },
};

const scoreConfig: Record<Severity, { label: string; color: string; badgeBg: string }> = {
  green:  { label: "Looks legit",          color: "text-emerald-700", badgeBg: "bg-emerald-100" },
  yellow: { label: "Proceed with caution",  color: "text-amber-700",   badgeBg: "bg-amber-100" },
  red:    { label: "Multiple red flags",   color: "text-red-700",     badgeBg: "bg-red-100" },
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
    <div className="rounded-2xl overflow-hidden bg-white text-slate-800 shadow-lg border border-slate-200">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
         
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
            AI-powered
          </span>
        </div>
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          OMJ Decode
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          We read between the lines so you don't have to.
        </p>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {!result && !loading && (
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Our AI detects corporate jargon in this job posting.
          </p>
        )}

        {/* Decode button */}
        {!result && (
          <button
            onClick={decode}
            disabled={loading || !jobDescription.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all
              bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Decoding…
              </span>
            ) : (
              "Decode this job"
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs border border-red-100">
            {error}
            <button onClick={decode} className="ml-2 underline underline-offset-2 font-medium">Retry</button>
          </div>
        )}

        {/* Results */}
        {result && counts && (
          <div className="space-y-3">
            {/* Score summary */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {counts.red > 0 && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-100 text-red-700 border border-red-200">
                    {counts.red} Red {counts.red === 1 ? "flag" : "flags"}
                  </span>
                )}
                {counts.yellow > 0 && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 border border-amber-200">
                    {counts.yellow} Caution {counts.yellow === 1 ? "sign" : "signs"}
                  </span>
                )}
                {counts.green > 0 && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {counts.green} {counts.green === 1 ? "Good" : "Good"} {counts.green === 1 ? "sign" : "signs"}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${scoreConfig[result.score].badgeBg} ${scoreConfig[result.score].color}`}>
                {scoreConfig[result.score].label}
              </span>
            </div>

            {/* Flags */}
            {result.flags.map((flag, i) => {
              const s = severityStyles[flag.severity];
              return (
                <div
                  key={i}
                  className={`rounded-xl border ${s.border} ${s.bg} px-3 py-3`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${s.labelStyle}`}>
                      {flag.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.badgeBg} ${s.badgeText}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic leading-relaxed mb-1.5">
                    "{flag.original.length > 80 ? flag.original.slice(0, 80) + "…" : flag.original}"
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {flag.translation}
                  </p>
                </div>
              );
            })}

            {/* Verdict */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 mt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Verdict</p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{result.verdict}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={copyResults}
                className="flex-1 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                {copied ? "Copied!" : "Copy results"}
              </button>
              <button
                onClick={() => { setResult(null); setError(null); }}
                className="flex-1 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          AI analysis for informational purposes only. Always do your own research.
        </p>
      </div>
    </div>
  );
}
