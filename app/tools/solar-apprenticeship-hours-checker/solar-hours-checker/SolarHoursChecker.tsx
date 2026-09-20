"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { STATES } from "@/lib/usStates";
import { STATE_RULES, type GenericQuestionId, type StateKey } from "@/lib/solarHoursRules";

type YesNoUnknown = "yes" | "no" | "unknown";
type ResultTone = "potential" | "review" | "problem";

type ResultData = {
  tone: ResultTone;
  eyebrow: string;
  title: string;
  summary: string;
  progress?: {
    value: number;
    max: number;
    label: string;
    unit?: string;
  };
  findings: Array<{
    type: "positive" | "warning" | "negative" | "info";
    title: string;
    body: string;
  }>;
  nextSteps: string[];
};

const DEFAULT_ACCENT = "#047857";

function normalizeAccent(value?: string): string | null {
  if (!value) return null;
  const candidate = value.trim();
  const withHash = candidate.startsWith("#") ? candidate : `#${candidate}`;
  return /^#[0-9a-f]{6}$/i.test(withHash) ? withHash.toLowerCase() : null;
}

function accentTextColor(hex: string) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  const luminance = (0.299 * channels[0] + 0.587 * channels[1] + 0.114 * channels[2]) / 255;
  return luminance > 0.62 ? "#0f172a" : "#ffffff";
}

const ALL_STATE_OPTIONS = Object.entries(STATES)
  .map(([name, code]) => ({
    name,
    code: code as StateKey,
    credential: STATE_RULES[code as StateKey].credential,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

function resolveInitialState(value?: string): StateKey | "" {
  if (!value) return "";

  const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, "-");
  const match = ALL_STATE_OPTIONS.find(
    (option) =>
      option.code.toLowerCase() === normalized ||
      option.name.toLowerCase().replace(/\s+/g, "-") === normalized
  );

  return match?.code ?? "";
}

const CA_CATEGORIES = [
  { key: "stock", label: "Stock room and material handling", cap: 300 },
  { key: "residential", label: "Residential wiring", cap: 3000 },
  { key: "commercial", label: "Commercial wiring", cap: 6000 },
  { key: "industrial", label: "Industrial wiring", cap: 6000 },
  { key: "voice", label: "Voice, data and video installation", cap: 1500 },
  { key: "underground", label: "Underground conduit installation", cap: 750 },
  { key: "troubleshooting", label: "Troubleshooting and maintenance", cap: 1500 },
  { key: "finish", label: "Finish work and fixtures", cap: 600 },
  { key: "fire", label: "Fire/life safety and nurse call", cap: 600 },
] as const;

type CaCategoryKey = (typeof CA_CATEGORIES)[number]["key"];

const emptyCaHours = Object.fromEntries(
  CA_CATEGORIES.map((category) => [category.key, 0])
) as Record<CaCategoryKey, number>;

function clampNumber(value: string, max = 100000): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.round(parsed), max);
}

function addDays(dateString: string, days: number) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, 12, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function daysFromToday(date: Date) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.ceil((target.getTime() - start.getTime()) / 86_400_000);
}

function ProgressBar({
  value,
  max,
  label,
  unit = "hours",
}: {
  value: number;
  max: number;
  label: string;
  unit?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-4 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold tabular-nums text-slate-950">
          {value.toLocaleString()} / {max.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
        <div className="h-full rounded-full bg-[var(--checker-accent)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Question({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-3 border-b border-slate-200 pb-6 last:border-0 last:pb-0">
      <legend className="text-[15px] font-semibold leading-6 text-slate-950">{label}</legend>
      {hint ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

function Choice<T extends string>({
  value,
  current,
  onChange,
  label,
  description,
}: {
  value: T;
  current: T | "";
  onChange: (value: T) => void;
  label: string;
  description?: string;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={selected}
      className={`w-full rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--checker-accent)] focus:ring-offset-2 ${
        selected
          ? "border-[var(--checker-accent)] bg-[var(--checker-accent-soft)]"
          : "border-slate-300 bg-white hover:border-slate-400"
      }`}
    >
      <span className="flex items-start gap-3">
        <span
          className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
            selected ? "border-[5px] border-[var(--checker-accent)] bg-white" : "border-slate-400 bg-white"
          }`}
        />
        <span>
          <span className="block text-sm font-semibold text-slate-950">{label}</span>
          {description ? (
            <span className="mt-1 block text-sm leading-5 text-slate-600">{description}</span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

function YesNoUnknownChoices({
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  value: YesNoUnknown | "";
  onChange: (value: YesNoUnknown) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Choice value="yes" current={value} onChange={onChange} label={yesLabel} />
      <Choice value="no" current={value} onChange={onChange} label={noLabel} />
      <Choice value="unknown" current={value} onChange={onChange} label="I'm not sure" />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  label,
  suffix = "hours",
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  suffix?: string;
}) {
  return (
    <label className="block rounded-xl border border-slate-200 bg-white p-4">
      <span className="mb-2 block text-sm font-medium leading-5 text-slate-800">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={value || ""}
          onChange={(event) => onChange(clampNumber(event.target.value))}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base tabular-nums text-slate-950 outline-none focus:border-[var(--checker-accent)] focus:ring-2 focus:ring-[var(--checker-accent-ring)]"
          placeholder="0"
        />
        <span className="text-sm text-slate-500">{suffix}</span>
      </span>
    </label>
  );
}

function FindingIcon({ type }: { type: ResultData["findings"][number]["type"] }) {
  const styles = {
    positive: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    negative: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  }[type];

  const symbol = {
    positive: "✓",
    warning: "!",
    negative: "×",
    info: "i",
  }[type];

  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${styles}`}>
      {symbol}
    </span>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--checker-accent)] transition hover:text-[var(--checker-accent-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--checker-accent)] focus:ring-offset-2"
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </button>
  );
}

function Results({
  state,
  data,
  onReset,
}: {
  state: StateKey;
  data: ResultData;
  onReset: () => void;
}) {
  const toneStyles = {
    potential: "border-emerald-200 bg-emerald-50/70",
    review: "border-amber-200 bg-amber-50/70",
    problem: "border-rose-200 bg-rose-50/70",
  }[data.tone];

  return (
    <div className="space-y-6">
      <BackButton onClick={onReset} label="Back to answers" />

      <section className={`rounded-2xl border p-6 sm:p-8 ${toneStyles}`} aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">{data.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          {data.title}
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-700">{data.summary}</p>
        {data.progress ? (
          <div className="mt-6 rounded-xl border border-white/80 bg-white p-4 shadow-sm">
            <ProgressBar {...data.progress} />
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-semibold text-slate-950">What affects your result</h3>
        <div className="mt-5 divide-y divide-slate-200">
          {data.findings.map((finding, index) => (
            <div key={`${finding.title}-${index}`} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <FindingIcon type={finding.type} />
              <div>
                <p className="text-sm font-semibold text-slate-950">{finding.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{finding.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-semibold text-slate-950">Before you rely on these hours</h3>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
          {data.nextSteps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <OfficialSources state={state} />

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <strong className="font-semibold text-slate-800">Important:</strong> This checker is an informational screening tool. It does not determine whether a state licensing agency, apprenticeship program or examiner will approve specific work experience. The official authority makes that decision.
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-sm font-semibold text-[var(--checker-accent)] underline decoration-[var(--checker-accent)] underline-offset-4 hover:text-[var(--checker-accent-dark)]"
      >
        Check another work history
      </button>
    </div>
  );
}

function StateSearch({ onSelect }: { onSelect: (state: StateKey) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return ALL_STATE_OPTIONS.slice(0, 12);

    return ALL_STATE_OPTIONS
      .filter(
        (option) =>
          option.name.toLowerCase().includes(normalized) ||
          option.code.toLowerCase().includes(normalized)
      )
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aCode = a.code.toLowerCase();
        const bCode = b.code.toLowerCase();

        const aExact = aName === normalized || aCode === normalized ? 0 : 1;
        const bExact = bName === normalized || bCode === normalized ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;

        const aStarts = aName.startsWith(normalized) || aCode.startsWith(normalized) ? 0 : 1;
        const bStarts = bName.startsWith(normalized) || bCode.startsWith(normalized) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;

        return a.name.localeCompare(b.name);
      })
      .slice(0, 12);
  }, [query]);

  useEffect(() => {
    setActiveIndex(matches.length ? 0 : -1);
  }, [matches]);

  function choose(option: (typeof ALL_STATE_OPTIONS)[number]) {
    setQuery(option.name);
    setOpen(false);
    setActiveIndex(-1);
    onSelect(option.code);
  }

  return (
    <div className="mt-5 max-w-2xl">
      <label htmlFor="solar-hours-state-search" className="sr-only">
        Search for a U.S. state
      </label>
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute left-4 top-7 h-5 w-5 -translate-y-1/2 text-slate-400"
        >
          <path
            d="m14.25 14.25 3.5 3.5M8.75 15.5a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <input
          id="solar-hours-state-search"
          type="text"
          value={query}
          placeholder="Search by state or abbreviation"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="solar-hours-state-options"
          aria-activedescendant={
            open && activeIndex >= 0 ? `solar-hours-state-option-${activeIndex}` : undefined
          }
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                matches.length ? Math.min(current + 1, matches.length - 1) : -1
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                matches.length ? Math.max(current - 1, 0) : -1
              );
            } else if (event.key === "Enter" && open && activeIndex >= 0 && matches[activeIndex]) {
              event.preventDefault();
              choose(matches[activeIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--checker-accent)] focus:ring-2 focus:ring-[var(--checker-accent-ring)]"
        />

        {open ? (
          <div
            id="solar-hours-state-options"
            role="listbox"
            className="mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          >
            {matches.length ? (
              matches.map((option, index) => (
                <button
                  id={`solar-hours-state-option-${index}`}
                  key={option.code}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                  className={`block w-full rounded-lg px-3.5 py-3 text-left transition ${
                    index === activeIndex ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-950">{option.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {option.code} · {option.credential}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3.5 py-4 text-sm text-slate-500">No U.S. state matches your search.</p>
            )}
          </div>
        ) : null}
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        All 50 states are covered. Where licensing is local or contractor-based, the checker identifies that limitation instead of applying an invented statewide hour threshold.
      </p>
    </div>
  );
}

function OfficialSources({ state }: { state: StateKey }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-semibold text-slate-950">Official sources used</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Rules can change. Review the issuing agency's current guidance before filing an application or relying on a deadline.
      </p>
      <div className="mt-4 space-y-3">
        {STATE_RULES[state].sources.map((source) => (
          <div key={source.href} className="rounded-xl border border-slate-200 p-4">
            <a
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[var(--checker-accent)] underline decoration-[var(--checker-accent)] underline-offset-4 hover:text-[var(--checker-accent-dark)]"
            >
              {source.label}
            </a>
            <p className="mt-1 text-sm leading-5 text-slate-600">{source.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SolarHoursChecker({
  initialState,
  stateOnly = false,
  accent,
}: {
  initialState?: string;
  stateOnly?: boolean;
  accent?: string;
}) {
  const resolvedInitialState = resolveInitialState(initialState);
  const isStateLocked = stateOnly && Boolean(resolvedInitialState);
  const accentColor = normalizeAccent(accent) ?? DEFAULT_ACCENT;
  const themeStyle = {
    "--checker-accent": accentColor,
    "--checker-on-accent": accentTextColor(accentColor),
    "--checker-accent-soft": `color-mix(in srgb, ${accentColor} 12%, white)`,
    "--checker-accent-ring": `color-mix(in srgb, ${accentColor} 22%, transparent)`,
    "--checker-accent-dark": `color-mix(in srgb, ${accentColor} 82%, black)`,
  } as CSSProperties;
  const [state, setState] = useState<StateKey | "">(() => resolvedInitialState);
  const [showResult, setShowResult] = useState(false);

  // California
  const [caC10, setCaC10] = useState<YesNoUnknown | "">("");
  const [caStatus, setCaStatus] = useState<"apprentice" | "trainee" | "other" | "unknown" | "">("");
  const [caSupervision, setCaSupervision] = useState<YesNoUnknown | "">("");
  const [caHours, setCaHours] = useState<Record<CaCategoryKey, number>>({ ...emptyCaHours });

  // Texas
  const [txHours, setTxHours] = useState(0);
  const [txMaster, setTxMaster] = useState<YesNoUnknown | "">("");
  const [txWork, setTxWork] = useState<"electrical" | "mixed" | "mechanical" | "unknown" | "">("");
  const [txLicenseStatus, setTxLicenseStatus] = useState<"apprentice" | "other" | "exempt" | "unknown" | "">("");

  // Washington
  const [waHours, setWaHours] = useState(0);
  const [waPath, setWaPath] = useState<"registered" | "outstate" | "military" | "none" | "unknown" | "">("");
  const [waCertificate, setWaCertificate] = useState<YesNoUnknown | "">("");
  const [waSupervision, setWaSupervision] = useState<YesNoUnknown | "">("");
  const [waWork, setWaWork] = useState<"electrical" | "mixed" | "mechanical" | "unknown" | "">("");
  const [waExpiration, setWaExpiration] = useState("");

  // Oregon
  const [orApprenticeship, setOrApprenticeship] = useState<YesNoUnknown | "">("");
  const [orEmployer, setOrEmployer] = useState<YesNoUnknown | "">("");
  const [orPv, setOrPv] = useState(0);
  const [orOtherRenewable, setOrOtherRenewable] = useState(0);
  const [orBos, setOrBos] = useState(0);
  const [orOther, setOrOther] = useState(0);

  // Remaining states — rules are data-driven from lib/solarHoursRules.ts
  const [genericAmount, setGenericAmount] = useState(0);
  const [genericWork, setGenericWork] = useState<"electrical" | "mixed" | "mechanical" | "unknown" | "">("");
  const [genericJurisdiction, setGenericJurisdiction] = useState("");
  const [genericAnswers, setGenericAnswers] = useState<
    Partial<Record<GenericQuestionId, YesNoUnknown>>
  >({});

  const caCredit = useMemo(
    () =>
      CA_CATEGORIES.reduce(
        (total, category) => total + Math.min(caHours[category.key] || 0, category.cap),
        0
      ),
    [caHours]
  );

  const caEntered = useMemo(
    () => CA_CATEGORIES.reduce((total, category) => total + (caHours[category.key] || 0), 0),
    [caHours]
  );

  const caActiveCategories = CA_CATEGORIES.filter((category) => (caHours[category.key] || 0) > 0);
  const caCappedCategories = CA_CATEGORIES.filter(
    (category) => (caHours[category.key] || 0) > category.cap
  );

  const orTotal = orPv + orOtherRenewable + orBos + orOther;

  const deadline = useMemo(() => addDays(waExpiration, 180), [waExpiration]);
  const deadlineDays = deadline ? daysFromToday(deadline) : null;

  function reset() {
    setShowResult(false);
    window.setTimeout(() => {
      document.getElementById("solar-hours-checker")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function changeState(next: StateKey) {
    setState(next);
    setShowResult(false);
    setGenericAmount(0);
    setGenericWork("");
    setGenericJurisdiction("");
    setGenericAnswers({});
  }

  const result = useMemo<ResultData | null>(() => {
    if (!state) return null;

    if (state === "CA") {
      const findings: ResultData["findings"] = [];
      let tone: ResultTone = "potential";

      if (caC10 === "no") {
        tone = "problem";
        findings.push({
          type: "negative",
          title: "The standard California OJT route requires work for a C-10 electrical contractor.",
          body: "California's General Electrician experience rule describes 8,000 hours of qualifying work for a C-10 electrical contractor. Your answer does not fit that standard route.",
        });
      } else if (caC10 === "unknown" || !caC10) {
        tone = "review";
        findings.push({
          type: "warning",
          title: "Verify the employer's C-10 status.",
          body: "Employer licensing is a threshold fact for the standard on-the-job experience route. Confirm the contractor's classification before relying on these hours.",
        });
      } else {
        findings.push({
          type: "positive",
          title: "You reported work for a C-10 electrical contractor.",
          body: "That is consistent with the employer requirement in California's General Electrician on-the-job experience rule.",
        });
      }

      if (caStatus === "trainee") {
        if (caSupervision === "no") {
          tone = "problem";
          findings.push({
            type: "negative",
            title: "Direct supervision is a material issue for electrician trainees.",
            body: "California DIR guidance for electrician trainees requires work under direct supervision of a certified electrician. Confirm the actual supervision record with DIR before relying on the hours.",
          });
        } else if (caSupervision === "unknown" || !caSupervision) {
          if (tone !== "problem") tone = "review";
          findings.push({
            type: "warning",
            title: "Supervisor status needs to be confirmed.",
            body: "For electrician-trainee work, confirm that the person supervising the electrical work held the required California certification at the time.",
          });
        } else {
          findings.push({
            type: "positive",
            title: "You reported direct supervision by a certified electrician.",
            body: "That is consistent with California DIR guidance for electrician trainees.",
          });
        }
      } else if (caStatus === "other") {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "Your worker status needs review.",
          body: "California distinguishes certified electricians, registered apprentices and electrician trainees. Confirm the status under which you performed the electrical work.",
        });
      } else if (caStatus === "unknown" || !caStatus) {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "Your worker status is not yet clear.",
          body: "Before relying on the result, identify whether you were a registered apprentice, electrician trainee or already-certified electrician during the work period.",
        });
      }

      if (caActiveCategories.length < 2) {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "General Electrician experience must span at least two listed work areas.",
          body: `You entered hours in ${caActiveCategories.length} work area${caActiveCategories.length === 1 ? "" : "s"}. California's 8,000-hour General Electrician rule requires work in two or more listed areas.`,
        });
      } else {
        findings.push({
          type: "positive",
          title: "You entered experience in at least two California work categories.",
          body: "That is consistent with the category-mix requirement for General Electrician certification.",
        });
      }

      if (caCappedCategories.length > 0) {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "Some reported hours exceed California's category maximums.",
          body: caCappedCategories
            .map((category) => `${category.label}: maximum ${category.cap.toLocaleString()} hours`)
            .join("; ") + ". Hours above those category caps are not included in the estimate shown here.",
        });
      }

      findings.push({
        type: "info",
        title: "First-time applicants need employment-history documentation.",
        body: "California DIR currently instructs first-time applicants to submit Social Security earnings information obtained through Form SSA-7050, unless another listed proof route applies.",
      });

      const displayed = Math.min(caCredit, 8000);
      const summary =
        caEntered === 0
          ? "Enter your work hours by category to estimate how much of the experience falls within California's published General Electrician category limits."
          : `Based only on the hours and categories you entered, up to ${caCredit.toLocaleString()} hours fall within the published category limits. This is not an approval of those hours by California DIR.`;

      return {
        tone,
        eyebrow: "California screening result",
        title:
          tone === "problem"
            ? "Your answers show a threshold issue that needs to be resolved."
            : tone === "review"
              ? "Some of your hours may fit the rule, but key facts still need verification."
              : "Your entries are broadly consistent with the standard experience framework.",
        summary,
        progress: {
          value: displayed,
          max: 8000,
          label: "Hours within entered category limits",
        },
        findings,
        nextSteps: [
          "Verify the contractor's California C-10 license status for the period you worked.",
          "Keep records that show employment dates and the type of electrical work performed.",
          "If you were an electrician trainee, verify the supervising electrician's certification and your trainee status for the work period.",
          "Before applying, review California DIR's current proof-of-experience and SSA employment-history instructions.",
        ],
      };
    }

    if (state === "TX") {
      const findings: ResultData["findings"] = [];
      let tone: ResultTone = "potential";

      if (txMaster === "no") {
        tone = "problem";
        findings.push({
          type: "negative",
          title: "Texas requires qualifying OJT to be under a Texas-licensed Master Electrician.",
          body: "The Journeyman Electrician experience requirement is based on on-the-job training under the supervision of a Master Electrician licensed in Texas.",
        });
      } else if (txMaster === "unknown" || !txMaster) {
        tone = "review";
        findings.push({
          type: "warning",
          title: "The supervising Master Electrician needs to be identified.",
          body: "TDLR requires experience verification from each Master Electrician who supervised the applicant. Do not assume an employer's electrical license alone establishes your supervision history.",
        });
      } else {
        findings.push({
          type: "positive",
          title: "You reported supervision by a Texas-licensed Master Electrician.",
          body: "That is consistent with TDLR's Journeyman Electrician experience requirement.",
        });
      }

      if (txWork === "mechanical") {
        tone = "problem";
        findings.push({
          type: "negative",
          title: "Mostly mechanical solar work may not match Texas's electrical-work definition.",
          body: "TDLR's licensing rule is tied to electrical work such as installing, maintaining or extending electrical wiring systems and related apparatus or equipment. Racking-only, material handling or other non-electrical work should not be assumed to qualify.",
        });
      } else if (txWork === "mixed" || txWork === "unknown" || !txWork) {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "Separate electrical work from non-electrical solar duties.",
          body: "If the role mixed wiring, electrical equipment work, racking, logistics or general labor, have the supervising Master Electrician verify the experience that actually meets TDLR's requirements.",
        });
      } else {
        findings.push({
          type: "positive",
          title: "The duties you selected are consistent with electrical work.",
          body: "Final credit still depends on the verified work record and supervision, but the task type does not create an obvious mismatch in this screening.",
        });
      }

      if (txLicenseStatus === "unknown" || !txLicenseStatus) {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "Confirm the license or exemption under which you performed the work.",
          body: "Texas generally requires people performing electrical work to hold an applicable license unless an exemption applies. This checker does not determine whether an exemption covered your work period.",
        });
      } else if (txLicenseStatus === "apprentice" || txLicenseStatus === "other" || txLicenseStatus === "exempt") {
        findings.push({
          type: "info",
          title: "Keep proof of the status under which the work was performed.",
          body: "TDLR may verify experience. Retain your license information, employer records and the name of each supervising Master Electrician.",
        });
      }

      if (txHours >= 7000) {
        findings.push({
          type: "positive",
          title: "You reported at least 7,000 hours.",
          body: "TDLR currently allows a Journeyman Electrician applicant with at least 7,000 verified OJT hours to apply to take the examination before reaching the full 8,000 hours required for licensure.",
        });
      } else {
        findings.push({
          type: "info",
          title: `${Math.max(0, 7000 - txHours).toLocaleString()} reported hours remain before the 7,000-hour exam-application threshold.`,
          body: "This is a simple hour comparison. TDLR must still accept the underlying experience.",
        });
      }

      return {
        tone,
        eyebrow: "Texas screening result",
        title:
          tone === "problem"
            ? "Your answers show a likely problem with the standard experience requirement."
            : tone === "review"
              ? "Your hours may qualify, but the supervision or work record needs verification."
              : "Your answers are broadly consistent with the Texas experience framework.",
        summary: `You reported ${txHours.toLocaleString()} hours. Texas requires 8,000 hours of qualifying on-the-job training for Journeyman Electrician licensure; at least 7,000 qualifying hours may be submitted to seek exam approval before the full 8,000 are complete.`,
        progress: {
          value: Math.min(txHours, 8000),
          max: 8000,
          label: "Reported OJT hours",
        },
        findings,
        nextSteps: [
          "List every Texas-licensed Master Electrician who supervised your work and the dates for each supervision period.",
          "Ask each supervising Master Electrician to complete the TDLR Experience Verification Form when you are preparing to apply.",
          "Keep records that separate electrical work from racking, material handling and other non-electrical duties.",
          "Use the TDLR license search to confirm supervisor and contractor records before relying on older experience.",
        ],
      };
    }

    if (state === "WA") {
      const findings: ResultData["findings"] = [];
      let tone: ResultTone = "review";

      if (waPath === "registered") {
        tone = "potential";
        findings.push({
          type: "positive",
          title: "You reported participation in a registered Washington (01) apprenticeship.",
          body: "That matches the standard in-state pathway now used for Journey Level (01) electrician qualification. Your apprenticeship program controls how your training and OJT are recorded.",
        });
      } else if (waPath === "outstate") {
        tone = "review";
        findings.push({
          type: "warning",
          title: "Equivalent out-of-state apprenticeship is a separate qualification route.",
          body: "Washington recognizes qualifying equivalent apprenticeship pathways, but L&I must evaluate whether the program and experience meet the current requirements.",
        });
      } else if (waPath === "military") {
        tone = "review";
        findings.push({
          type: "warning",
          title: "Military electrical experience is evaluated under separate rules.",
          body: "L&I may credit qualifying military electrical experience, but the agency evaluates the records and the type of experience. This checker does not assign military credit.",
        });
      } else if (waPath === "none") {
        tone = "problem";
        findings.push({
          type: "negative",
          title: "The standard Washington in-state (01) path now requires a registered apprenticeship.",
          body: "The transition period for certain pre-2023 trainees ended July 1, 2026. For a typical in-state applicant, accumulating hours outside a qualifying apprenticeship does not by itself create Journey Level (01) exam eligibility.",
        });
      } else {
        tone = "review";
        findings.push({
          type: "warning",
          title: "Your qualification path needs to be identified first.",
          body: "For Journey Level (01), the result depends on whether you are in a registered Washington apprenticeship or qualify under another recognized pathway.",
        });
      }

      if (waCertificate === "no") {
        tone = "problem";
        findings.push({
          type: "negative",
          title: "An expired or inactive training certificate can prevent trainee hours from being accepted.",
          body: "Washington L&I states that work during a lapse in the trainee certificate can cause claimed hours to be reduced or denied. Apprentices should follow their program's credential requirements.",
        });
      } else if (waCertificate === "unknown" || !waCertificate) {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "Verify your training-certificate status for the work period.",
          body: "L&I identifies certificate lapses as a reason experience claims may be denied or reduced for trainees.",
        });
      } else {
        findings.push({
          type: "positive",
          title: "You reported an active Washington training certificate during the work period.",
          body: "That avoids one of the specific lapse issues identified by L&I for trainee experience claims.",
        });
      }

      if (waSupervision === "no") {
        tone = "problem";
        findings.push({
          type: "negative",
          title: "Improper supervision can cause hours not to count.",
          body: "Washington L&I specifically lists lack of proper supervision by a certified electrician as a reason claimed trainee experience may be denied or reduced.",
        });
      } else if (waSupervision === "unknown" || !waSupervision) {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "Supervisor certification should be verified.",
          body: "Check that the supervising electrician's certificate was active and that the supervision arrangement complied with the applicable rule or apprenticeship standard.",
        });
      } else {
        findings.push({
          type: "positive",
          title: "You reported supervision by a certified electrician.",
          body: "That is consistent with Washington's trainee framework, subject to the applicable ratio and apprenticeship rules.",
        });
      }

      if (waWork === "mechanical") {
        tone = "problem";
        findings.push({
          type: "negative",
          title: "Mostly mechanical solar duties are a known experience-credit risk in Washington.",
          body: "L&I states that duties consisting mostly of mechanical installation, maintenance or monitoring without electrical-trade work may not support claimed electrical experience.",
        });
      } else if (waWork === "mixed" || waWork === "unknown" || !waWork) {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "Your work record should distinguish electrical installation and maintenance from other solar duties.",
          body: "Washington L&I looks for experience that can be supported by payroll, employment records, permits/inspections and the actual electrical work performed.",
        });
      } else {
        findings.push({
          type: "positive",
          title: "You reported consistent electrical installation or maintenance work.",
          body: "That avoids one of the specific non-qualifying-duty concerns listed by L&I, although the apprenticeship program or agency still determines actual credit.",
        });
      }

      if (waPath === "registered") {
        findings.push({
          type: "info",
          title: "The 180-day trainee affidavit deadline does not apply to hours worked while registered in a Washington apprenticeship.",
          body: "L&I's trainee page expressly separates registered-apprenticeship hours from the standard trainee affidavit deadline. Follow your apprenticeship program's reporting process instead.",
        });
      } else if (deadline) {
        const deadlineBody =
          deadlineDays === null
            ? `For trainee hours that are subject to the affidavit rule, the calculated 180-day date is ${formatDate(deadline)}.`
            : deadlineDays < 0
              ? `The calculated 180-day date was ${formatDate(deadline)}, which is ${Math.abs(deadlineDays)} day${Math.abs(deadlineDays) === 1 ? "" : "s"} ago. Confirm immediately with L&I whether the rule applies to this work period.`
              : deadlineDays === 0
                ? `The calculated 180-day date is today (${formatDate(deadline)}). Confirm immediately with L&I whether the rule applies to this work period.`
                : `The calculated 180-day date is ${formatDate(deadline)} — ${deadlineDays} day${deadlineDays === 1 ? "" : "s"} from today. Confirm that the affidavit rule applies to this work period.`;

        findings.push({
          type: deadlineDays !== null && deadlineDays < 0 ? "negative" : "warning",
          title: "Possible affidavit deadline",
          body: deadlineBody,
        });
        if (deadlineDays !== null && deadlineDays < 0) tone = "problem";
      }

      return {
        tone,
        eyebrow: "Washington screening result",
        title:
          tone === "problem"
            ? "Your answers show a material issue with the standard (01) pathway or experience record."
            : tone === "review"
              ? "Your hours need pathway-specific review before you rely on them."
              : "Your answers are broadly consistent with the registered-apprenticeship pathway.",
        summary: `You reported ${waHours.toLocaleString()} hours. For Journey Level (01), Washington's current rules focus first on the qualifying apprenticeship or exception pathway; the raw hour total alone is not enough to establish eligibility.`,
        progress:
          waHours > 0
            ? {
                value: Math.min(waHours, 8000),
                max: 8000,
                label: "Reported electrical experience",
              }
            : undefined,
        findings,
        nextSteps: [
          "Confirm the apprenticeship program or exception pathway under which you expect the experience to qualify.",
          "Use Washington L&I's Verify tool to check the status of your training certificate, supervising electrician and contractor for the relevant dates.",
          "Keep payroll/employment records and project information that support the type of electrical work performed.",
          "If you are not in a registered apprenticeship and an affidavit deadline may apply, confirm the deadline directly with L&I before relying on this calculation.",
        ],
      };
    }

    if (state === "OR") {
      const findings: ResultData["findings"] = [];
      let tone: ResultTone = "potential";

      if (orApprenticeship === "no") {
      tone = "problem";
      findings.push({
        type: "negative",
        title: "Oregon's current LRT application instructions list completion of an approved Oregon apprenticeship as the qualification route.",
        body: "For the Limited Renewable Energy Technician license, the current Building Codes Division instructions do not list a stand-alone in-state experience-only alternative. Hours outside an approved Oregon apprenticeship should not be assumed to qualify for LRT licensure.",
      });
    } else if (orApprenticeship === "unknown" || !orApprenticeship) {
      tone = "review";
      findings.push({
        type: "warning",
        title: "Confirm that your program is an approved Oregon apprenticeship.",
        body: "The LRT qualification route is tied to completion of an approved Oregon apprenticeship. Confirm the program and your registration status with BOLI or your training committee.",
      });
    } else {
      findings.push({
        type: "positive",
        title: "You reported enrollment in an approved Oregon apprenticeship.",
        body: "That matches the qualification route listed in Oregon's current LRT application instructions.",
      });
    }

    if (orEmployer === "no") {
      if (tone !== "problem") tone = "review";
      findings.push({
        type: "warning",
        title: "Verify the employer/training-agent arrangement.",
        body: "Oregon describes LRT work as renewable-energy system installation performed while employed by a limited renewable energy contractor or electrical contractor. Your apprenticeship program should confirm whether the employer is an approved training agent for your work.",
      });
    } else if (orEmployer === "unknown" || !orEmployer) {
      if (tone !== "problem") tone = "review";
      findings.push({
        type: "warning",
        title: "Employer eligibility is not yet confirmed.",
        body: "Ask your apprenticeship program whether the employer is authorized to provide your OJT and whether the work will be entered into your apprenticeship record.",
      });
    } else {
      findings.push({
        type: "positive",
        title: "You reported work for a limited renewable energy or electrical contractor.",
        body: "That is consistent with the employment scope shown for Oregon's LRT license.",
      });
    }

    findings.push({
      type: orPv >= 1000 ? "positive" : "info",
      title: "Renewable Energy JATC lists at least 1,000 photovoltaic-system hours within its installation work process.",
      body: `You entered ${orPv.toLocaleString()} photovoltaic hours. The same JATC standard lists a 4,000-hour total term. Your training committee determines whether your actual work-process distribution satisfies the program.`,
    });

    if (orOtherRenewable < 500 || orBos < 1500 || orOther < 1000) {
      findings.push({
        type: "info",
        title: "The JATC work-process schedule is broader than photovoltaic installation alone.",
        body: "The published schedule includes renewable-system installation, balance-of-system work, and other work such as NEC requirements, design, troubleshooting, maintenance and plan reading. The standard also states that the committee may evaluate competency and provide additional instruction when an apprentice cannot fulfill the approximate hours in every work process.",
      });
    }

    return {
      tone,
      eyebrow: "Oregon screening result",
      title:
        tone === "problem"
          ? "Your reported hours do not fit the standard LRT qualification route on their own."
          : tone === "review"
            ? "Your hours may fit the LRT pathway, but program status must be confirmed."
            : "Your answers are broadly consistent with the Oregon LRT apprenticeship pathway.",
      summary: `You reported ${orTotal.toLocaleString()} total hours across the work-process fields below. Oregon's current LRT qualification route is completion of an approved Oregon apprenticeship; the apprenticeship program, not this checker, determines accepted OJT credit.`,
      progress: {
        value: Math.min(orTotal, 4000),
        max: 4000,
        label: "Reported Renewable Energy JATC work-process hours",
      },
      findings,
      nextSteps: [
        "Confirm that your apprenticeship is approved in Oregon and that your employer is an authorized training agent for your program.",
        "Compare your apprenticeship record with the program's current work-process schedule rather than relying only on total hours.",
        "Ask your training committee how it records photovoltaic, balance-of-system, troubleshooting and other renewable-energy work.",
        "Before applying for the LRT exam/license, verify completion status and referral requirements with your apprenticeship program and Oregon BCD.",
      ],
      };
    }

    const rule = STATE_RULES[state];
    const findings: ResultData["findings"] = [];
    let tone: ResultTone =
      rule.mode === "jurisdiction" || rule.mode === "contractor" ? "review" : "potential";

    if (rule.mode === "jurisdiction") {
      findings.push({
        type: "warning",
        title: "The controlling rule is local, not one statewide journeyman-hour rule.",
        body: genericJurisdiction
          ? `You entered ${genericJurisdiction}. Confirm the electrician or electrical-contractor requirements for that jurisdiction before relying on any solar hours.`
          : "Identify the city, county or other authority that controls the worker credential where the work was performed.",
      });
    } else if (rule.mode === "contractor") {
      findings.push({
        type: "info",
        title: "This state uses a contractor or qualifying-individual framework for the credential shown.",
        body: "Do not treat a generic solar-hour total as progress toward a statewide journeyman license when the state licensing structure is based on contractor classification, qualifying experience or local worker credentials.",
      });
    }

    if (genericWork === "electrical") {
      findings.push({
        type: "positive",
        title: "You described the work as primarily electrical.",
        body: "That is the type of work most likely to be relevant when an agency evaluates electrician experience. The issuing authority still decides whether the specific duties and supervision qualify.",
      });
    } else if (genericWork === "mixed") {
      tone = "review";
      findings.push({
        type: "warning",
        title: "Separate electrical duties from general solar construction time.",
        body: "Racking, module placement, material handling and other non-electrical duties should not automatically be counted as electrician experience. Keep records that identify the electrical portion of the work.",
      });
    } else if (genericWork === "mechanical") {
      if (rule.mode !== "jurisdiction" && rule.mode !== "contractor") tone = "problem";
      findings.push({
        type: "negative",
        title: "Mostly mechanical solar work should not be assumed to qualify as electrician experience.",
        body: "A job can be in solar without the duties meeting an electrician-experience rule. Verify any claimed credit with the licensing authority or apprenticeship program.",
      });
    } else {
      tone = "review";
      findings.push({
        type: "warning",
        title: "The electrical scope of the work is not yet clear.",
        body: "Licensing agencies generally evaluate what work was actually performed, not the solar job title alone. Obtain a duty breakdown before relying on the experience.",
      });
    }

    for (const question of rule.questions ?? []) {
      const answer = genericAnswers[question.id];
      if (answer === "yes") {
        findings.push({
          type: "positive",
          title: question.label.replace(/\?$/, ""),
          body: question.requirement,
        });
      } else if (answer === "no") {
        if (question.severity === "problem") tone = "problem";
        else if (tone !== "problem") tone = "review";
        findings.push({
          type: question.severity === "problem" ? "negative" : "warning",
          title: "This requirement may not be satisfied.",
          body: question.requirement,
        });
      } else {
        if (tone !== "problem") tone = "review";
        findings.push({
          type: "warning",
          title: "This requirement still needs verification.",
          body: question.requirement,
        });
      }
    }

    if (rule.target) {
      const reached = genericAmount >= rule.target.value;
      findings.push({
        type: reached ? "positive" : "info",
        title: reached
          ? `Your reported total reaches the published ${rule.target.value.toLocaleString()}-${rule.target.unit} benchmark for this pathway.`
          : `Your reported total is below the published ${rule.target.value.toLocaleString()}-${rule.target.unit} benchmark for this pathway.`,
        body: `You entered ${genericAmount.toLocaleString()} ${rule.target.unit}. A numerical total does not override work-scope, supervision, registration, education or documentation requirements.`,
      });
    }

    for (const note of rule.notes ?? []) {
      findings.push({
        type: note.type,
        title: note.title,
        body: note.body,
      });
      if (note.type === "warning" && tone !== "problem") tone = "review";
    }

    const title =
      rule.mode === "jurisdiction"
        ? "Your local jurisdiction determines which electrician rule applies."
        : rule.mode === "contractor"
          ? "A statewide journeyman-hour total does not determine this path."
          : tone === "problem"
            ? "One or more answers may prevent these hours from qualifying as reported."
            : tone === "review"
              ? "Your hours need additional verification before you rely on them."
              : "Your answers are broadly consistent with the published pathway reviewed here.";

    const reported = rule.target
      ? ` You reported ${genericAmount.toLocaleString()} ${rule.target.unit}.`
      : "";

    return {
      tone,
      eyebrow: `${rule.name} screening result`,
      title,
      summary: `${rule.summary}${reported}`,
      progress: rule.target
        ? {
            value: Math.min(genericAmount, rule.target.value),
            max: rule.target.value,
            label: rule.target.label,
            unit: rule.target.unit,
          }
        : undefined,
      findings,
      nextSteps: rule.nextSteps,
    };
  }, [
    state,
    caC10,
    caStatus,
    caSupervision,
    caEntered,
    caCredit,
    caActiveCategories.length,
    caCappedCategories,
    txHours,
    txMaster,
    txWork,
    txLicenseStatus,
    waHours,
    waPath,
    waCertificate,
    waSupervision,
    waWork,
    deadline,
    deadlineDays,
    orApprenticeship,
    orEmployer,
    orPv,
    orOtherRenewable,
    orBos,
    orOther,
    orTotal,
    genericAmount,
    genericWork,
    genericJurisdiction,
    genericAnswers,
  ]);

  const canSubmit = useMemo(() => {
    if (state === "CA") return Boolean(caC10 && caStatus && caEntered > 0 && (caStatus !== "trainee" || caSupervision));
    if (state === "TX") return Boolean(txHours > 0 && txMaster && txWork && txLicenseStatus);
    if (state === "WA") return Boolean(waHours > 0 && waPath && waCertificate && waSupervision && waWork);
    if (state === "OR") return Boolean(orTotal > 0 && orApprenticeship && orEmployer);
    if (!state) return false;

    const rule = STATE_RULES[state];
    const questionsAnswered = (rule.questions ?? []).every((question) => Boolean(genericAnswers[question.id]));
    const amountComplete = !rule.target || genericAmount > 0;
    const jurisdictionComplete = !rule.jurisdictionLabel || genericJurisdiction.trim().length > 1;

    return Boolean(genericWork && questionsAnswered && amountComplete && jurisdictionComplete);
  }, [
    state,
    caC10,
    caStatus,
    caEntered,
    caSupervision,
    txHours,
    txMaster,
    txWork,
    txLicenseStatus,
    waHours,
    waPath,
    waCertificate,
    waSupervision,
    waWork,
    orTotal,
    orApprenticeship,
    orEmployer,
    genericAmount,
    genericWork,
    genericJurisdiction,
    genericAnswers,
  ]);

  return (
    <section id="solar-hours-checker" className="scroll-mt-24" style={themeStyle}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <svg
                viewBox="0 0 320 70"
                className="h-[35px] w-auto"
                role="img"
                aria-label="SolarRoles"
              >
                <g transform="translate(40 35) scale(.8) translate(-40 -35)">
                  <g transform="translate(10 5)">
                    <g stroke="#F5B819" strokeWidth="4" strokeLinecap="round">
                      <line x1="30" y1="-6" x2="30" y2="2" />
                      <line x1="30" y1="58" x2="30" y2="66" />
                      <line x1="-6" y1="30" x2="2" y2="30" />
                      <line x1="58" y1="30" x2="66" y2="30" />
                      <line x1="7" y1="7" x2="13" y2="13" />
                      <line x1="47" y1="47" x2="53" y2="53" />
                      <line x1="7" y1="53" x2="13" y2="47" />
                      <line x1="47" y1="13" x2="53" y2="7" />
                    </g>
                    <circle cx="30" cy="30" r="19" fill="#F5B819" />
                  </g>
                </g>
                <text x="82" y="46" fontFamily="Arial, sans-serif" fontSize="32.2" fontWeight="700" fill="#0B1A2E">
                  Solar<tspan fill="#F5B819">Roles</tspan>
                </text>
              </svg>
              <p className="mt-1 text-sm text-slate-600">Coverage: all 50 states</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Last reviewed Sep. 19, 2026
            </span>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-8 sm:py-8">
          {!state ? (
            <div>
              <p className="text-sm font-semibold text-slate-950">1. Select the state where the work was performed</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                The checker uses the rules for the selected state's credential shown below.
              </p>
              <StateSearch onSelect={changeState} />
            </div>
          ) : showResult && result ? (
            <Results state={state} data={result} onReset={reset} />
          ) : (
            <div>
              <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                  {!isStateLocked ? (
                    <div className="mb-2">
                      <BackButton onClick={() => setState("")} label="Back to state selection" />
                    </div>
                  ) : null}
                  <h2 className="text-xl font-semibold text-slate-950">{STATE_RULES[state].name}</h2>
                  <p className="mt-1 text-sm text-slate-600">Checking: {STATE_RULES[state].credential}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Step 2 of 3</span>
              </div>

              {state === "CA" ? (
                <div className="space-y-6">
                  <Question
                    label="Was the work performed for a California C-10 electrical contractor?"
                    hint="California's standard on-the-job experience route for General Electrician certification is based on work for a C-10 electrical contractor."
                  >
                    <YesNoUnknownChoices value={caC10} onChange={setCaC10} />
                  </Question>

                  <Question label="What was your status while performing the work?">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Choice value="apprentice" current={caStatus} onChange={setCaStatus} label="Registered apprentice" />
                      <Choice value="trainee" current={caStatus} onChange={setCaStatus} label="Electrician trainee" />
                      <Choice value="other" current={caStatus} onChange={setCaStatus} label="Neither / another status" />
                      <Choice value="unknown" current={caStatus} onChange={setCaStatus} label="I'm not sure" />
                    </div>
                  </Question>

                  {caStatus === "trainee" ? (
                    <Question
                      label="Were you directly supervised by a California-certified electrician?"
                      hint="This question is shown because California DIR's trainee guidance requires direct supervision for electrician-trainee work."
                    >
                      <YesNoUnknownChoices value={caSupervision} onChange={setCaSupervision} />
                    </Question>
                  ) : null}

                  <Question
                    label="Enter your work hours by California experience category"
                    hint="Use your best documented breakdown. The checker applies the published maximum credit for each category. General Electrician certification requires 8,000 hours across two or more listed areas."
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      {CA_CATEGORIES.map((category) => (
                        <NumberInput
                          key={category.key}
                          label={`${category.label} — max ${category.cap.toLocaleString()} credited`}
                          value={caHours[category.key]}
                          onChange={(value) =>
                            setCaHours((current) => ({ ...current, [category.key]: value }))
                          }
                        />
                      ))}
                    </div>
                  </Question>
                </div>
              ) : null}

              {state === "TX" ? (
                <div className="space-y-6">
                  <Question label="How many on-the-job training hours are you checking?">
                    <NumberInput label="Total reported OJT" value={txHours} onChange={setTxHours} />
                  </Question>

                  <Question
                    label="Were these hours completed under the supervision of a Master Electrician licensed in Texas?"
                    hint="TDLR requires Journeyman Electrician experience to be completed under a Texas-licensed Master Electrician and verified by each supervising Master Electrician."
                  >
                    <YesNoUnknownChoices value={txMaster} onChange={setTxMaster} />
                  </Question>

                  <Question label="What best describes the solar work you performed?">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Choice
                        value="electrical"
                        current={txWork}
                        onChange={setTxWork}
                        label="Primarily electrical work"
                        description="Installing, maintaining or extending wiring systems, electrical apparatus or related equipment."
                      />
                      <Choice
                        value="mixed"
                        current={txWork}
                        onChange={setTxWork}
                        label="Mixed electrical and non-electrical work"
                        description="For example, wiring plus racking, material handling or general installation labor."
                      />
                      <Choice
                        value="mechanical"
                        current={txWork}
                        onChange={setTxWork}
                        label="Mostly mechanical / non-electrical solar work"
                        description="For example, racking, module placement, logistics or general labor with little electrical work."
                      />
                      <Choice value="unknown" current={txWork} onChange={setTxWork} label="I'm not sure" />
                    </div>
                  </Question>

                  <Question label="Under what status did you perform the electrical work?">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Choice value="apprentice" current={txLicenseStatus} onChange={setTxLicenseStatus} label="Texas Electrical Apprentice" />
                      <Choice value="other" current={txLicenseStatus} onChange={setTxLicenseStatus} label="Another applicable Texas electrical license" />
                      <Choice value="exempt" current={txLicenseStatus} onChange={setTxLicenseStatus} label="I believe an exemption applied" />
                      <Choice value="unknown" current={txLicenseStatus} onChange={setTxLicenseStatus} label="I'm not sure" />
                    </div>
                  </Question>
                </div>
              ) : null}

              {state === "WA" ? (
                <div className="space-y-6">
                  <Question label="Which Journey Level (01) path applies to you?">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Choice value="registered" current={waPath} onChange={setWaPath} label="Registered Washington (01) apprenticeship" />
                      <Choice value="outstate" current={waPath} onChange={setWaPath} label="Equivalent out-of-state apprenticeship / license path" />
                      <Choice value="military" current={waPath} onChange={setWaPath} label="Military electrical experience path" />
                      <Choice value="none" current={waPath} onChange={setWaPath} label="None of these" />
                      <Choice value="unknown" current={waPath} onChange={setWaPath} label="I'm not sure" />
                    </div>
                  </Question>

                  <Question label="How many electrical work hours are you checking?">
                    <NumberInput label="Reported electrical experience" value={waHours} onChange={setWaHours} />
                  </Question>

                  <Question label="Was your Washington electrical training certificate active while you performed the work?">
                    <YesNoUnknownChoices value={waCertificate} onChange={setWaCertificate} />
                  </Question>

                  <Question label="Were you properly supervised by a certified electrician for the work being claimed?">
                    <YesNoUnknownChoices value={waSupervision} onChange={setWaSupervision} />
                  </Question>

                  <Question label="What best describes your duties?">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Choice
                        value="electrical"
                        current={waWork}
                        onChange={setWaWork}
                        label="Consistent electrical installation / maintenance"
                      />
                      <Choice
                        value="mixed"
                        current={waWork}
                        onChange={setWaWork}
                        label="Mixed electrical and mechanical duties"
                      />
                      <Choice
                        value="mechanical"
                        current={waWork}
                        onChange={setWaWork}
                        label="Mostly mechanical / monitoring / non-electrical duties"
                      />
                      <Choice value="unknown" current={waWork} onChange={setWaWork} label="I'm not sure" />
                    </div>
                  </Question>

                  {waPath !== "registered" ? (
                    <Question
                      label="Optional: when did the training certificate covering these hours expire?"
                      hint="If the Washington trainee affidavit rule applies to this work period, L&I generally must receive the affidavit within 180 days after the certificate expiration date. Registered Washington apprenticeship hours use the apprenticeship reporting process instead."
                    >
                      <input
                        type="date"
                        value={waExpiration}
                        onChange={(event) => setWaExpiration(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-950 outline-none focus:border-[var(--checker-accent)] focus:ring-2 focus:ring-[var(--checker-accent-ring)]"
                      />
                    </Question>
                  ) : null}
                </div>
              ) : null}

              {state === "OR" ? (
                <div className="space-y-6">
                  <Question
                    label="Are you enrolled in an approved Oregon apprenticeship for the Limited Renewable Energy Technician pathway?"
                    hint="Oregon's current LRT application instructions list completion of an approved Oregon apprenticeship as the qualification route."
                  >
                    <YesNoUnknownChoices value={orApprenticeship} onChange={setOrApprenticeship} />
                  </Question>

                  <Question label="Is the work being performed for a limited renewable energy contractor or electrical contractor through your training arrangement?">
                    <YesNoUnknownChoices value={orEmployer} onChange={setOrEmployer} />
                  </Question>

                  <Question
                    label="Enter the hours you want to compare with the Renewable Energy JATC work-process schedule"
                    hint="The published JATC standard has a 4,000-hour term. Your apprenticeship committee determines actual credit and may evaluate competency when the exact approximate distribution cannot be met."
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <NumberInput label="Photovoltaic systems" value={orPv} onChange={setOrPv} />
                      <NumberInput label="Other renewable-energy installation" value={orOtherRenewable} onChange={setOrOtherRenewable} />
                      <NumberInput label="Balance of systems — inverters, batteries, metering, conditioning" value={orBos} onChange={setOrBos} />
                      <NumberInput label="NEC, design, troubleshooting, maintenance, plans / blueprints" value={orOther} onChange={setOrOther} />
                    </div>
                  </Question>
                </div>
              ) : null}

              {state !== "CA" && state !== "TX" && state !== "WA" && state !== "OR" ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      {STATE_RULES[state].credential}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {STATE_RULES[state].summary}
                    </p>
                  </div>

                  {STATE_RULES[state].jurisdictionLabel ? (
                    <Question
                      label={STATE_RULES[state].jurisdictionLabel ?? "Where was the work performed?"}
                      hint="Local licensing can change the applicable requirement. Enter the jurisdiction where the work occurred, not your home address."
                    >
                      <input
                        type="text"
                        value={genericJurisdiction}
                        onChange={(event) => setGenericJurisdiction(event.target.value)}
                        placeholder="City or county"
                        className="w-full max-w-xl rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-[var(--checker-accent)] focus:ring-2 focus:ring-[var(--checker-accent-ring)]"
                      />
                    </Question>
                  ) : null}

                  {STATE_RULES[state].target ? (
                    <Question
                      label={STATE_RULES[state].amountLabel ?? "How much experience are you checking?"}
                      hint={STATE_RULES[state].amountHint}
                    >
                      <NumberInput
                        label={STATE_RULES[state].target?.label ?? "Reported experience"}
                        value={genericAmount}
                        onChange={setGenericAmount}
                        suffix={STATE_RULES[state].target?.unit ?? "hours"}
                      />
                    </Question>
                  ) : null}

                  <Question
                    label="What best describes the solar work you performed?"
                    hint="The checker evaluates the work performed, not the job title alone."
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Choice
                        value="electrical"
                        current={genericWork}
                        onChange={setGenericWork}
                        label="Primarily electrical work"
                        description="Electrical installation, wiring, terminations, equipment, testing or electrical maintenance."
                      />
                      <Choice
                        value="mixed"
                        current={genericWork}
                        onChange={setGenericWork}
                        label="Mixed electrical and non-electrical work"
                        description="Electrical duties combined with racking, module placement, material handling or other work."
                      />
                      <Choice
                        value="mechanical"
                        current={genericWork}
                        onChange={setGenericWork}
                        label="Mostly mechanical / non-electrical solar work"
                        description="Racking, module placement, logistics, general labor or monitoring with little electrical work."
                      />
                      <Choice
                        value="unknown"
                        current={genericWork}
                        onChange={setGenericWork}
                        label="I'm not sure"
                      />
                    </div>
                  </Question>

                  {(STATE_RULES[state].questions ?? []).map((question) => (
                    <Question key={question.id} label={question.label} hint={question.requirement}>
                      <YesNoUnknownChoices
                        value={genericAnswers[question.id] ?? ""}
                        onChange={(value) =>
                          setGenericAnswers((current) => ({ ...current, [question.id]: value }))
                        }
                      />
                    </Question>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6">
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => {
                    setShowResult(true);
                    window.setTimeout(() => {
                      document.getElementById("solar-hours-checker")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 0);
                  }}
                  className="rounded-xl bg-[var(--checker-accent)] px-5 py-3 text-sm font-semibold text-[var(--checker-on-accent)] shadow-sm transition hover:bg-[var(--checker-accent-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--checker-accent)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white"
                >
                  Check my hours
                </button>
                {!canSubmit ? (
                  <p className="text-sm text-slate-500">Complete the required questions to view the screening result.</p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
