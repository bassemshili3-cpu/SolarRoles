import { MapPin, Search } from 'lucide-react'

type WhatJobsMobileSearchProps = {
  keyword: string
  location: string
}

/**
 * A compact, first-party-styled version of the WhatJobs search form.
 * It deliberately does not load the third-party widget script on mobile.
 */
export default function WhatJobsMobileSearch({ keyword, location }: WhatJobsMobileSearchProps) {
  return (
    <section className="mb-4 border border-slate-200 bg-white p-3 lg:hidden" aria-label="Search more jobs with WhatJobs">
      <form method="post" action="https://www.whatjobs.com/searchbox" target="_blank" className="space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="sr-only" htmlFor="whatjobs-mobile-keyword">Job title or keyword</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="whatjobs-mobile-keyword"
              type="text"
              name="keyword"
              defaultValue={keyword}
              placeholder="Job title or keyword"
              className="h-10 w-full border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
            />
          </div>

          <label className="sr-only" htmlFor="whatjobs-mobile-location">City, state or ZIP</label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="whatjobs-mobile-location"
              type="text"
              name="location"
              defaultValue={location}
              placeholder="City, state or ZIP"
              className="h-10 w-full border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900"
            />
          </div>
        </div>

        <input type="hidden" name="utm_source" value="7186" />
        <button type="submit" className="flex h-10 w-full items-center justify-center border border-slate-900 bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700">
          Search jobs
        </button>
      </form>
    </section>
  )
}
