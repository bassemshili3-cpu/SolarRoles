'use client'

import { useEffect, useRef } from 'react'

const WIDGET_URL = 'https://widget.careerjet.net/search-box/d4ef390ac58e6af1366b704a59317424'
const SCRIPT_URL = 'https://static.careerjet.org/js/all_widget_search_box_3rd_party.min.js'

/** Careerjet's compact job search form, used above a mobile job description. */
export default function CareerjetSearchBox() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.replaceChildren()
    const existing = document.getElementById('cj-search-box')
    existing?.remove()

    const script = document.createElement('script')
    script.id = 'cj-search-box'
    script.async = true
    script.src = `${SCRIPT_URL}?t=${Date.now()}`
    document.body.appendChild(script)

    return () => script.remove()
  }, [])

  return (
    <section aria-label="Search solar jobs on Careerjet" className="w-full overflow-visible">
      <div ref={containerRef} className="cj-search-box w-full" data-url={WIDGET_URL} />
    </section>
  )
}
