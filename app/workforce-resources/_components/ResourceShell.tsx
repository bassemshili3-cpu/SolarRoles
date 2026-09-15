import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ExternalLink, Mail } from 'lucide-react'

export function ResourceHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string
  title: string
  intro: string
}) {
  return (
    <header className="mb-12">
      <Link href="/workforce-resources" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Workforce resources
      </Link>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{eyebrow}</p>
      <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-gray-950 md:text-5xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-gray-600 md:text-lg">{intro}</p>
    </header>
  )
}

export function MethodologyNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm leading-6 text-gray-600">
      <span className="font-semibold text-gray-900">Scope and interpretation. </span>
      {children}
    </div>
  )
}

export function ResourceLink({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link href={href} className="group block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h3 className="font-semibold text-gray-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
      </div>
    </Link>
  )
}

export function ResourceFooter({
  canonicalUrl,
  updatedAt,
  contactEmail = 'contact@solarroles.com',
}: {
  canonicalUrl: string
  updatedAt: string
  contactEmail?: string
}) {
  return (
    <footer className="mt-16 border-t border-gray-200 pt-8">
      <div className="grid gap-6 rounded-2xl bg-gray-50 p-6 md:grid-cols-[1.35fr_1fr] md:items-start">
        <div>
          <p className="text-sm font-semibold text-gray-950">Citation and linking</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Educators, workforce programs and researchers may reference this resource. A link to the live page preserves access to the current methodology and daily snapshot.
          </p>
          <a
            href={canonicalUrl}
            className="mt-3 inline-flex items-center gap-1.5 break-all text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            {canonicalUrl.replace(/^https?:\/\//, '')}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        </div>

        <div className="md:border-l md:border-gray-200 md:pl-6">
          <p className="text-sm font-semibold text-gray-950">Partnership or data questions?</p>
          <a
            href={`mailto:${contactEmail}?subject=Solar%20Roles%20workforce%20resource`}
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            <Mail className="h-4 w-4" />
            {contactEmail}
          </a>
          <p className="mt-4 text-xs leading-5 text-gray-500">Snapshot date: {updatedAt} · Data refreshes daily.</p>
        </div>
      </div>
    </footer>
  )
}
