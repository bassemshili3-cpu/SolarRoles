'use client'

import { useEffect, useRef } from 'react'

type Props = {
  search: string
  location: string
}

const WIDGET_URL = 'https://widget.careerjet.net/job-box/9bfb8aa35622fc9c0a5129a473241b8f'
const SCRIPT_URL = 'https://static.careerjet.org/js/all_widget_job_box_3rd_party.min.js'

/** Third-party Careerjet job suggestions matching the job currently viewed. */
export default function CareerjetJobBox({ search, location }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Recreate the widget script when Next.js navigates between job pages so
    // Careerjet reads the current page's title and location data attributes.
    containerRef.current?.replaceChildren()
    const existing = document.getElementById('cj-job-box')
    existing?.remove()

    const script = document.createElement('script')
    script.id = 'cj-job-box'
    script.async = true
    script.src = `${SCRIPT_URL}?t=${Date.now()}`
    document.body.appendChild(script)

    return () => script.remove()
  }, [search, location])

  return (
    <section aria-label="Related jobs from Careerjet" className="rounded-2xl overflow-hidden">
      <div
        ref={containerRef}
        className="cj-job-box"
        data-url={WIDGET_URL}
        data-search={search}
        data-location={location}
      />
    </section>
  )
}
