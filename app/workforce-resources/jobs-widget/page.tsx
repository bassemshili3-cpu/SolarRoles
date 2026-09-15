import type { Metadata } from 'next'
import Link from 'next/link'
import { STATE_CODE_TO_NAME } from '@/lib/usStates'
import { ExternalLink } from 'lucide-react'
import { ResourceHeader } from '../_components/ResourceShell'
import WidgetConfigurator from './WidgetConfigurator'

export const metadata: Metadata = {
  title: 'Free Solar Jobs Widget for Schools & Workforce Programs | Solar Roles',
  description: 'Embed a live state-level feed of Solar Roles job openings on a college, training-provider or workforce-program website.',
  alternates: { canonical: 'https://www.solarroles.com/workforce-resources/jobs-widget' },
}

export default function JobsWidgetPage() {
  const stateNames = STATE_CODE_TO_NAME as Record<string, string>
  const states = Object.entries(stateNames)
    .filter(([code]) => code.length === 2 && code !== 'DC')
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <ResourceHeader
        eyebrow="Free educator tool"
        title="Current solar openings Widget"
        intro="The widget embeds current Solar Roles openings for community colleges, training providers, career centers and workforce programs. Program staff can select a state, a solar job title and an optional entry-level filter before adding the generated iframe to an approved page."
      />

      <section className="mb-10 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4" aria-label="Widget cost and access">
        <p className="font-semibold text-emerald-950">Free access with no account or student sign-in</p>
        <p className="mt-1 text-sm leading-6 text-emerald-900/80">
          The widget is free to publish. It does not ask visitors for personal information or load Solar Roles analytics inside the embed. Basic hosting and security logs may still process technical request data.{' '}
          <Link href="/workforce-resources/jobs-widget/privacy" className="font-semibold underline underline-offset-2">Read the widget data note</Link>.
        </p>
      </section>

      <WidgetConfigurator states={states} />

      <section className="mt-14 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 p-5"><h2 className="font-semibold text-gray-950">Database updates</h2><p className="mt-2 text-sm leading-6 text-gray-600">The embed reads from Solar Roles. Expired openings leave the feed as the underlying job database changes.</p></div>
        <div className="rounded-2xl border border-gray-200 p-5"><h2 className="font-semibold text-gray-950">State, title and entry-level filters</h2><p className="mt-2 text-sm leading-6 text-gray-600">A career center can publish openings for a state or trade and optionally limit the feed to postings with explicit entry-level language.</p></div>
        <div className="rounded-2xl border border-gray-200 p-5"><h2 className="font-semibold text-gray-950">Visible attribution</h2><p className="mt-2 text-sm leading-6 text-gray-600">The widget includes a visible “Powered by Solar Roles” link. The embed contains no hidden or keyword-prescribed link.</p></div>
      </section>

      <section className="mt-14" aria-labelledby="widget-technical-faq">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Technical FAQ</p>
          <h2 id="widget-technical-faq" className="mt-2 text-2xl font-bold text-gray-950">Technical requirements for institutional websites</h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-950">Will it work with our CMS?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              It works wherever your CMS permits an iframe or custom HTML block, including standard WordPress installations. Some managed academic platforms disable third-party embeds; your administrator may need to allow them.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-950">What if our site uses a strict CSP?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Ask your administrator to allow <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">https://www.solarroles.com</code> in the site&apos;s <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">frame-src</code> policy. If that is not possible, use the matching text link included below the iframe.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-950">Does the job list require JavaScript?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              No. Job cards and links are rendered on the server. Every generated embed includes a direct jobs-page link as a fallback if an institutional site blocks the iframe.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-950">Does it collect student data?</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              The embed has no account, form or student identifier and does not load the site&apos;s analytics component. Hosting infrastructure may receive ordinary request metadata such as an IP address and browser information. See the{' '}
              <Link href="/workforce-resources/jobs-widget/privacy" className="font-semibold text-blue-700 underline underline-offset-2">widget privacy and data note</Link>.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-14 rounded-3xl bg-gray-950 p-7 text-white">
        <h2 className="text-xl font-bold">Custom geographic and occupational feeds</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-300">Programs serving a metro area, a multi-state region or an occupation outside the standard title list can request a tailored feed. Solar Roles can review those requirements with program and web staff.</p>
        <Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200">Ask for a program-specific feed <ExternalLink className="h-4 w-4" /></Link>
      </section>
    </main>
  )
}
