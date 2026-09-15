import type { Metadata } from 'next'
import Link from 'next/link'

import { ResourceHeader } from '../../_components/ResourceShell'

export const metadata: Metadata = {
  title: 'Solar Jobs Widget Privacy & Data Note | Solar Roles',
  description:
    'Technical and privacy information for schools and workforce programs embedding the free Solar Roles jobs widget.',
  alternates: {
    canonical: 'https://www.solarroles.com/workforce-resources/jobs-widget/privacy',
  },
}

const details = [
  {
    title: 'Information shown',
    body: 'The widget displays public job-posting information from the Solar Roles database, such as job title, employer, location and listed compensation. It does not display student or school records.',
  },
  {
    title: 'Information requested from visitors',
    body: 'The embedded view has no registration, application form, email field or student identifier. Schools should not add names, student IDs or other personal information to the iframe URL.',
  },
  {
    title: 'Analytics and browser storage',
    body: 'Solar Roles does not load its Vercel Analytics component on embed routes. The widget does not use Solar Roles account, preference or consent storage. If a visitor follows a link to the full Solar Roles site, the general site privacy and cookie policies apply there.',
  },
  {
    title: 'Technical request data',
    body: 'As with ordinary web delivery, hosting and security infrastructure may process request metadata such as IP address, browser information, timestamps and the requested URL. A no-referrer policy is included in the supplied iframe code so the host page URL is not sent as the referrer.',
  },
  {
    title: 'School website controls',
    body: 'The school or program controls the page that contains the widget, its own analytics, consent tools and content-security policy. Solar Roles cannot determine what the host website collects or how its CMS is configured.',
  },
  {
    title: 'Educational-record boundaries',
    body: 'The widget is a public job-listing display, not a student records system. It is not designed to receive or store education records, application materials or information from a school information system.',
  },
]

export default function JobsWidgetPrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <ResourceHeader
        eyebrow="Widget documentation"
        title="Data handling in the Solar Roles jobs widget"
        intro="The embedded view displays public job-posting data and receives ordinary web request metadata. The documentation below describes the information shown, technical processing, browser storage and responsibilities of the host website."
      />

      <section className="grid gap-4 md:grid-cols-2" aria-label="Widget privacy details">
        {details.map((detail) => (
          <article key={detail.title} className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-950">{detail.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{detail.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-lg font-bold text-gray-950">Documentation for institutional review</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Send us the questions or technical checklist used by your institution. We can clarify how the public embed works, but your organization remains responsible for its own legal and security review.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link href="/contact" className="text-blue-700 underline underline-offset-2">Contact Solar Roles</Link>
          <Link href="/privacy" className="text-blue-700 underline underline-offset-2">General privacy policy</Link>
          <Link href="/cookie-policy" className="text-blue-700 underline underline-offset-2">Cookie policy</Link>
          <Link href="/workforce-resources/jobs-widget" className="text-blue-700 underline underline-offset-2">Return to the widget</Link>
        </div>
      </section>
    </main>
  )
}
