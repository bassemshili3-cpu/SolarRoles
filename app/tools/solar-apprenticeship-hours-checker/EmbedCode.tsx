'use client'

import { useState } from 'react'
import { Check, Copy, Monitor, Smartphone } from 'lucide-react'

type PreviewMode = 'desktop' | 'mobile'

const EMBED_CODE = `<iframe
  id="solarroles-hours-checker"
  src="https://www.solarroles.com/embed/solar-apprenticeship-hours-checker"
  title="Solar Apprenticeship Hours Checker from Solar Roles"
  width="100%"
  height="850"
  style="border:0;border-radius:16px;overflow:hidden"
  loading="lazy"
  referrerpolicy="no-referrer"
  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
></iframe>
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
    if (
      event.origin !== "https://www.solarroles.com" ||
      !frame ||
      event.source !== frame.contentWindow ||
      !event.data ||
      event.data.type !== "solarroles:solar-hours-checker:resize"
    ) return;
    var height = Math.max(600, Math.min(Number(event.data.height) || 850, 3000));
    frame.style.height = height + "px";
  });
</script>`

export default function EmbedCode() {
  const [copied, setCopied] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')

  async function copyCode() {
    await navigator.clipboard.writeText(EMBED_CODE)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="embed-checker-title">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <h2 id="embed-checker-title" className="text-2xl font-semibold tracking-tight text-slate-950">
            Add this checker to your website
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            Copy the iframe into a custom HTML block. The checker automatically adapts to desktop and mobile widths, resizes as visitors move through the questions and does not collect their answers.
          </p>
        </div>

        <div>
          <div className="max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-200">
            <pre className="whitespace-pre-wrap break-all font-mono leading-5">{EMBED_CODE}</pre>
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
              The embed code stays the same; its layout responds to the available width.
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
              key={previewMode}
              src="/embed/solar-apprenticeship-hours-checker"
              title={`Solar Apprenticeship Hours Checker ${previewMode} preview`}
              className="h-[720px] w-full border-0 bg-white"
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
