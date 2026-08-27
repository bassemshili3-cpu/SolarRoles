type WhatJobsMobileSearchProps = {
  keyword: string
  location: string
}

/**
 * Compact mobile version of the publisher search box. It intentionally keeps
 * WhatJobs' three-control, one-line layout rather than adopting our larger
 * landing-page search form.
 */
export default function WhatJobsMobileSearch({ keyword, location }: WhatJobsMobileSearchProps) {
  return (
    <section className="mb-4 border border-[#ddd] bg-white p-1.5 lg:hidden" aria-label="Search more jobs with WhatJobs">
      <form
        method="post"
        action="https://www.whatjobs.com/searchbox"
        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-1"
      >
        <label className="sr-only" htmlFor="whatjobs-mobile-keyword">What: keyword</label>
        <input
          id="whatjobs-mobile-keyword"
          type="text"
          name="keyword"
          defaultValue={keyword}
          placeholder="What: keyword"
          className="h-9 min-w-0 border border-[#bbb] bg-white px-1.5 text-[11px] text-[#333] outline-none placeholder:text-[#6b7280] focus:border-[#777]"
        />

        <label className="sr-only" htmlFor="whatjobs-mobile-location">Where: town</label>
        <input
          id="whatjobs-mobile-location"
          type="text"
          name="location"
          defaultValue={location}
          placeholder="Where: town"
          className="h-9 min-w-0 border border-[#bbb] bg-white px-1.5 text-[11px] text-[#333] outline-none placeholder:text-[#6b7280] focus:border-[#777]"
        />

        <input type="hidden" name="utm_source" value="7186" />
        <button
          type="submit"
          className="h-9 border border-[#999] bg-[#f5f5f5] px-2 text-[11px] font-normal text-[#333] hover:bg-[#e9e9e9]"
        >
          Find Jobs
        </button>
      </form>

      <p className="mt-1 text-right text-[10px] leading-none text-black">
        jobs by <span className="font-semibold text-[#ef2626]">WHATJOBS</span><span className="ml-0.5 inline-flex h-3 w-3 items-center justify-center bg-[#ef2626] text-[9px] font-bold leading-none text-white">?</span>
      </p>
    </section>
  )
}
