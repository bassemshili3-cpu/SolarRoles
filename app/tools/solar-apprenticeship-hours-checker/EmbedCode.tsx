'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, Monitor, Smartphone } from 'lucide-react'
import { STATES } from '@/lib/usStates'

type PreviewMode = 'desktop' | 'mobile'

const STATE_OPTIONS = Object.entries(STATES).sort(([a], [b]) => a.localeCompare(b))
const DEFAULT_ACCENT = '#047857'

function normalizeAccent(value: string) {
  const candidate = value.trim()
  if (!candidate) return ''
  const withHash = candidate.startsWith('#') ? candidate : `#${candidate}`
  return /^#[0-9a-f]{6}$/i.test(withHash) ? withHash.toLowerCase() : ''
}

function buildEmbedCode(state: string, stateOnly: boolean, accent: string) {
  const params = new URLSearchParams()
  if (state) params.set('state', state)
  if (state && stateOnly) params.set('state_only', '1')
  if (accent) params.set('accent', accent)
  const query = params.size ? `?${params.toString()}` : ''
  const fullCheckerUrl = `https://www.solarroles.com/tools/solar-apprenticeship-hours-checker${query}`
    .replaceAll('&', '&amp;')

  return `<div
  id="solarroles-hours-checker-wrapper"
  style="position:relative;min-height:180px;overflow:hidden;border-radius:16px"
>
  <div
    id="solarroles-hours-checker-fallback"
    style="display:flex;min-height:180px;box-sizing:border-box;flex-direction:column;align-items:flex-start;justify-content:center;gap:8px;padding:24px;border:1px solid #cbd5e1;border-top:4px solid ${accent || DEFAULT_ACCENT};border-radius:16px;background:#f8fafc;color:#0f172a;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
  >
    <strong style="font-size:16px;line-height:1.4">Solar Apprenticeship Hours Checker</strong>
    <span style="font-size:13px;line-height:1.5;color:#475569">If this site blocks embedded tools, open the checker directly on Solar Roles.</span>
    <a
      href="${fullCheckerUrl}"
      target="_blank"
      rel="noopener"
      style="color:${accent || DEFAULT_ACCENT};font-size:13px;font-weight:700;text-decoration:underline;text-underline-offset:3px"
    >Open the full checker &rarr;</a>
  </div>
  <iframe
    id="solarroles-hours-checker"
    src="https://www.solarroles.com/embed/solar-apprenticeship-hours-checker${query}"
    title="Solar Apprenticeship Hours Checker from Solar Roles"
    width="100%"
    height="850"
    aria-hidden="true"
    style="position:absolute;inset:0;width:100%;opacity:0;pointer-events:none;border:0;border-radius:16px;overflow:hidden"
    loading="lazy"
    referrerpolicy="no-referrer"
    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
  ></iframe>
</div>
<p style="margin:8px 0 0;font:13px/1.5 system-ui,sans-serif;text-align:right">
  <a
    href="https://www.solarroles.com/"
    target="_blank"
    rel="noopener"
    style="color:#475569;text-decoration:none"
  >Powered by Solar Roles</a>
</p>
<script>
  window.addEventListener("message", function (event) {
    var frame = document.getElementById("solarroles-hours-checker");
    var wrapper = document.getElementById("solarroles-hours-checker-wrapper");
    var fallback = document.getElementById("solarroles-hours-checker-fallback");
    if (
      event.origin !== "https://www.solarroles.com" ||
      !frame ||
      !wrapper ||
      event.source !== frame.contentWindow ||
      !event.data ||
      event.data.type !== "solarroles:solar-hours-checker:resize"
    ) return;
    var height = Math.max(600, Math.min(Number(event.data.height) || 850, 3000));
    frame.style.height = height + "px";
    frame.style.opacity = "1";
    frame.style.pointerEvents = "auto";
    frame.removeAttribute("aria-hidden");
    wrapper.style.height = height + "px";
    wrapper.style.minHeight = height + "px";
    if (fallback) fallback.style.display = "none";
  });
</script>`
}

function buildBadgeCode(state: string, stateName: string, stateOnly: boolean, accent: string) {
  const params = new URLSearchParams()
  if (state) params.set('state', state)
  if (state && stateOnly) params.set('state_only', '1')
  if (accent) params.set('accent', accent)
  const query = params.size ? `?${params.toString()}` : ''
  const href = `https://www.solarroles.com/tools/solar-apprenticeship-hours-checker${query}`
    .replaceAll('&', '&amp;')
  const headline = stateName
    ? `${stateName} solar workers: check if your hours count`
    : 'Solar workers: check if your hours count'

  return `<a
  href="${href}"
  target="_blank"
  rel="noopener"
  style="display:block;box-sizing:border-box;max-width:380px;padding:16px 18px;border:1px solid #cbd5e1;border-top:4px solid ${accent || DEFAULT_ACCENT};border-radius:14px;background:#ffffff;color:#0f172a;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-decoration:none"
>
  <span style="display:block;margin-bottom:6px;color:${accent || DEFAULT_ACCENT};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Free tool from Solar Roles</span>
  <strong style="display:block;font-size:16px;line-height:1.4">${headline}</strong>
  <span style="display:block;margin-top:9px;color:${accent || DEFAULT_ACCENT};font-size:13px;font-weight:700">Open the checker &rarr;</span>
</a>`
}

export default function EmbedCode() {
  const [copied, setCopied] = useState(false)
  const [badgeCopied, setBadgeCopied] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [embedState, setEmbedState] = useState('')
  const [stateOnly, setStateOnly] = useState(false)
  const [accent, setAccent] = useState('')
  const normalizedAccent = normalizeAccent(accent)
  const effectiveAccent = normalizedAccent || DEFAULT_ACCENT
  const embedCode = useMemo(
    () => buildEmbedCode(embedState, stateOnly, normalizedAccent),
    [embedState, stateOnly, normalizedAccent]
  )
  const embedStateName = STATE_OPTIONS.find(([, code]) => code === embedState)?.[0] ?? ''
  const badgeCode = useMemo(
    () => buildBadgeCode(embedState, embedStateName, stateOnly, normalizedAccent),
    [embedState, embedStateName, stateOnly, normalizedAccent]
  )
  const previewParams = new URLSearchParams()
  if (embedState) previewParams.set('state', embedState)
  if (embedState && stateOnly) previewParams.set('state_only', '1')
  if (normalizedAccent) previewParams.set('accent', normalizedAccent)
  const previewSrc = `/embed/solar-apprenticeship-hours-checker${
    previewParams.size ? `?${previewParams.toString()}` : ''
  }`

  async function copyCode() {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  async function copyBadgeCode() {
    await navigator.clipboard.writeText(badgeCode)
    setBadgeCopied(true)
    window.setTimeout(() => setBadgeCopied(false), 1800)
  }

  return (
    <section className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="embed-checker-title">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <h2 id="embed-checker-title" className="text-2xl font-semibold tracking-tight text-slate-950">
            Add this checker to your website
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            Copy the iframe into a custom HTML block. The checker adapts to desktop and mobile widths, resizes as visitors move through the questions and includes a direct-link fallback when a site blocks third-party embeds. It does not collect visitors' answers.
          </p>
          <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-950">State shown at launch</span>
              <select
                value={embedState}
                onChange={(event) => {
                  setEmbedState(event.target.value)
                  if (!event.target.value) setStateOnly(false)
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Let visitors choose from all 50 states</option>
                {STATE_OPTIONS.map(([name, code]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className={`flex items-start gap-3 ${embedState ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
              <input
                type="checkbox"
                checked={stateOnly}
                disabled={!embedState}
                onChange={(event) => setStateOnly(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-950">Show only this state</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  Removes the link back to the 50-state selector. Visitors can review or restart their answers without leaving the selected state.
                </span>
              </span>
            </label>

            <div className="border-t border-slate-200 pt-4">
              <label htmlFor="checker-accent" className="text-sm font-semibold text-slate-950">
                Accent color <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={effectiveAccent}
                  onChange={(event) => setAccent(event.target.value)}
                  aria-label="Choose an accent color"
                  className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                />
                <input
                  id="checker-accent"
                  type="text"
                  value={accent}
                  onChange={(event) => setAccent(event.target.value)}
                  placeholder="#0f172a"
                  spellCheck={false}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-950 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                />
                {accent ? (
                  <button
                    type="button"
                    onClick={() => setAccent('')}
                    className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-950"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
              {accent && !normalizedAccent ? (
                <p className="mt-2 text-xs text-rose-700">Enter a six-digit hex color, such as #0f172a.</p>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Applies to buttons, selected choices, links and focus indicators.
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-200">
            <pre className="whitespace-pre-wrap break-all font-mono leading-5">{embedCode}</pre>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy embed code'}
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Live preview</h3>
            <p className="mt-1 text-xs text-slate-500">
              The preview uses the state and visibility settings selected above.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" role="group" aria-label="Embed preview size">
            <button
              type="button"
              aria-pressed={previewMode === 'desktop'}
              onClick={() => setPreviewMode('desktop')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                previewMode === 'desktop'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />
              Desktop
            </button>
            <button
              type="button"
              aria-pressed={previewMode === 'mobile'}
              onClick={() => setPreviewMode('mobile')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                previewMode === 'mobile'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Mobile
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl bg-slate-200/70 p-2 sm:p-4">
          <div
            className={`mx-auto overflow-hidden rounded-xl bg-white shadow-sm transition-[max-width] duration-300 ${
              previewMode === 'mobile' ? 'max-w-[390px]' : 'max-w-full'
            }`}
          >
            <iframe
              key={`${previewMode}-${previewSrc}`}
              src={previewSrc}
              title={`Solar Apprenticeship Hours Checker ${previewMode} preview`}
              className="h-[720px] w-full border-0 bg-white"
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-slate-200 pt-10">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Compact option</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Add a small checker badge
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              This version fits a sidebar or the end of an article. It loads no iframe or script; the link opens the full checker with the state selected above.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-5">
              <a
                href={`/tools/solar-apprenticeship-hours-checker${
                  previewParams.size ? `?${previewParams.toString()}` : ''
                }`}
                target="_blank"
                rel="noopener"
                className="block max-w-[380px] rounded-[14px] border border-slate-300 border-t-4 bg-white px-[18px] py-4 text-slate-950 no-underline shadow-sm transition hover:bg-slate-50"
                style={{ borderTopColor: effectiveAccent }}
              >
                <span
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: effectiveAccent }}
                >
                  Free tool from Solar Roles
                </span>
                <strong className="block text-base leading-[1.4]">
                  {embedStateName
                    ? `${embedStateName} solar workers: check if your hours count`
                    : 'Solar workers: check if your hours count'}
                </strong>
                <span className="mt-2 block text-[13px] font-bold" style={{ color: effectiveAccent }}>
                  Open the checker <span aria-hidden="true">→</span>
                </span>
              </a>
            </div>
          </div>

          <div>
            <div className="max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-200">
              <pre className="whitespace-pre-wrap break-all font-mono leading-5">{badgeCode}</pre>
            </div>
            <button
              type="button"
              onClick={copyBadgeCode}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              {badgeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {badgeCopied ? 'Copied' : 'Copy badge code'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
