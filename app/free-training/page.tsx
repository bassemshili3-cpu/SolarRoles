import type { Metadata } from 'next'
import Link from 'next/link'
import { AffiliateLink } from '@/components/click_affiliate_link'
import { getPublishedTrainingCategories, TRAINING_AFFILIATE_DISCLOSURE } from '@/lib/freeTraining'
import { SITE_URL } from '@/lib/site-url'

const title = 'Free Solar Energy Training and Career Resources'
const description = 'Seven selected free courses covering solar installation, storage, sales, PV design, inspection and maintenance, with access details and credential limits.'
export const metadata: Metadata = {
  title, description, alternates: { canonical: `${SITE_URL}/free-training` },
  openGraph: { title, description, url: `${SITE_URL}/free-training`, type: 'website', siteName: 'Solar Roles' },
}
const sourceLink = 'underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4'

function CourseArtwork({ category, className = '' }: { category: string; className?: string }) {
  return (
    <svg viewBox="0 0 400 220" fill="none" aria-hidden="true" className={className}>
      <path d="M0 180H400M0 140H400M0 100H400M0 60H400M40 0V220M120 0V220M200 0V220M280 0V220M360 0V220" stroke="currentColor" opacity=".06" />
      {category === 'solar-installers' ? <>
        <circle cx="310" cy="57" r="27" fill="#F2A93B" />
        <path d="M310 15V8M310 106V99M352 57H359M261 57H254M340 27L345 22M280 87L275 92M340 87L345 92M280 27L275 22" stroke="#F2A93B" strokeWidth="3" strokeLinecap="round" />
        <path d="M75 155L110 78H246L277 155H75Z" fill="#173B58" stroke="#0B1A2E" strokeWidth="3" strokeLinejoin="round" />
        <path d="M121 85L96 148M157 85L149 148M194 85L201 148M230 85L253 148M97 106H257M86 132H267" stroke="#B7D2DA" strokeWidth="2" />
        <path d="M103 156L94 181M246 156L255 181M82 182H269" stroke="#0B1A2E" strokeWidth="4" strokeLinecap="round" />
        <path d="M308 125L293 149H311L299 173" stroke="#F2A93B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </> : category === 'energy-storage' ? <>
        <rect x="109" y="49" width="156" height="137" rx="12" fill="#173B58" stroke="#0B1A2E" strokeWidth="3" />
        <path d="M152 49V38H222V49" stroke="#0B1A2E" strokeWidth="4" strokeLinejoin="round" />
        <rect x="124" y="65" width="126" height="25" rx="4" fill="#B7D2DA" />
        <path d="M196 105L176 137H195L182 166" stroke="#F2A93B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="234" cy="77" r="4" fill="#173B58" /><path d="M136 77H158" stroke="#173B58" strokeWidth="3" strokeLinecap="round" />
        <path d="M266 111H302V160H324" stroke="#0B1A2E" strokeWidth="3" strokeLinecap="round" /><circle cx="327" cy="160" r="6" fill="#F2A93B" />
        <path d="M80 186H294" stroke="#0B1A2E" strokeWidth="3" strokeLinecap="round" />
      </> : category === 'solar-designers' ? <>
        <rect x="85" y="37" width="230" height="148" rx="8" fill="white" stroke="#0B1A2E" strokeWidth="3" />
        <path d="M102 55H297V166H102Z" fill="#EDF2F2" />
        {[0, 1, 2].map(row => <g key={row}>{[0, 1, 2, 3].map(col => <rect key={col} x={118 + col * 40} y={70 + row * 27} width="30" height="18" rx="2" fill="#173B58" />)}</g>)}
        <path d="M108 152H272M287 62V145" stroke="#F2A93B" strokeWidth="3" strokeDasharray="5 5" />
        <path d="M158 199H242M200 186V198" stroke="#0B1A2E" strokeWidth="4" strokeLinecap="round" />
      </> : category === 'solar-inspection' ? <>
        <rect x="104" y="36" width="158" height="159" rx="9" fill="white" stroke="#0B1A2E" strokeWidth="3" />
        <rect x="147" y="26" width="73" height="24" rx="5" fill="#173B58" />
        {[75, 110, 145].map(y => <g key={y}><path d={`M121 ${y}l7 7 12-14`} stroke="#173B58" strokeWidth="3" strokeLinecap="round" /><path d={`M152 ${y}h72`} stroke="#B7D2DA" strokeWidth="5" strokeLinecap="round" /></g>)}
        <circle cx="271" cy="149" r="31" fill="#FFF4DF" stroke="#F2A93B" strokeWidth="5" /><path d="M294 174L315 195" stroke="#0B1A2E" strokeWidth="9" strokeLinecap="round" />
      </> : category === 'solar-technicians' ? <>
        <rect x="108" y="46" width="145" height="139" rx="9" fill="#173B58" stroke="#0B1A2E" strokeWidth="3" />
        <path d="M169 83L154 117H174L163 148" stroke="#F2A93B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M130 61H158M130 169H230M253 95H280V172" stroke="#B7D2DA" strokeWidth="3" strokeLinecap="round" />
        <rect x="266" y="161" width="28" height="34" rx="5" fill="#F2A93B" /><path d="M274 178H286" stroke="#0B1A2E" strokeWidth="3" />
      </> : <>
        <rect x="98" y="35" width="176" height="160" rx="10" fill="white" stroke="#0B1A2E" strokeWidth="3" />
        <rect x="143" y="25" width="87" height="25" rx="6" fill="#173B58" />
        <path d="M126 74H204M126 88H176" stroke="#B7D2DA" strokeWidth="5" strokeLinecap="round" />
        <rect x="127" y="142" width="20" height="28" rx="3" fill="#B7D2DA" /><rect x="161" y="122" width="20" height="48" rx="3" fill="#173B58" /><rect x="195" y="103" width="20" height="67" rx="3" fill="#F2A93B" />
        <path d="M135 119L178 96L222 71M210 71H222V83" stroke="#0B1A2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="282" cy="146" r="26" fill="#F2A93B" /><path d="M271 146L279 154L294 138" stroke="#0B1A2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </>}
    </svg>
  )
}

export default function FreeTrainingPage() {
  const categories = getPublishedTrainingCategories()
  return (
    <main className="bg-[#FAFAF7] text-[#0B1A2E]">
      <header className="border-b border-[#0B1A2E]/10 bg-[#0B1A2E] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Link href="/resources" className="inline-flex min-h-11 items-center text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">← Solar career resources</Link>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[.16em] text-[#F2A93B]">
              <span>Free learning resources</span><span className="h-px w-8 bg-[#F2A93B]/50" aria-hidden="true" /><span>{categories.length} selected courses</span>
            </div>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/75">{description}</p>
            <a href="#courses" className="mt-7 inline-flex min-h-12 items-center gap-5 rounded-full bg-[#F2A93B] px-6 py-3 text-sm font-semibold text-[#0B1A2E] transition hover:bg-[#FFC65F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Explore the courses <span aria-hidden="true">↓</span></a>
            <p className="mt-5 text-xs leading-5 text-white/60">Account required. No credit card. Certificate conditions vary.</p>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="rounded-2xl border border-white/15 bg-[#FAFAF7] p-3 text-[#0B1A2E] shadow-xl sm:p-4">
              <div className="flex items-center justify-between px-2 pt-1 text-xs font-medium"><span>Solar installation</span><span className="rounded-full bg-[#F2A93B] px-3 py-1">Free course</span></div>
              <CourseArtwork category="solar-installers" className="w-full" />
              <div className="border-t border-[#0B1A2E]/10 px-2 py-3"><p className="text-lg font-semibold">Fundamentals: Solar PV</p><p className="mt-1 text-sm text-slate-600">Brittany Heller · About 4 hours</p></div>
            </div>
            <div className="mx-3 mt-3 grid grid-cols-2 gap-3 sm:mx-5">
              {categories.slice(1, 3).map(category => <a key={category.id} href={'#' + category.id} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10"><span className="block text-xs text-[#F2A93B]">{category.course.duration}</span><span className="mt-1 block font-medium">{category.displayName} <span aria-hidden="true">↗</span></span></a>)}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <nav id="courses" aria-label="Training by occupation" className="scroll-mt-24 border-b border-[#0B1A2E]/10 py-7 sm:py-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-semibold">Choose your starting point</h2>
            <ul className="flex flex-wrap gap-2 sm:gap-3">{categories.map((category, index) => <li key={category.id}><a href={'#' + category.id} className="inline-flex min-h-11 items-center gap-3 rounded-full border border-[#0B1A2E]/15 bg-white px-4 py-2 text-sm font-medium transition hover:border-[#0B1A2E] hover:bg-[#FFF4DF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"><span className="text-xs text-slate-500">0{index + 1}</span>{category.displayName}<span aria-hidden="true">↓</span></a></li>)}</ul>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">Course access checked October 10–14, 2026. Standalone free courses, not previews of paid programs.</p>
        </nav>

        {categories.map((category, index) => (
          <section key={category.id} id={category.id} aria-labelledby={category.id + '-heading'} className="scroll-mt-9 sm:scroll-mt-5 md:-scroll-mt-11 border-b border-[#0B1A2E]/10 py-10 sm:py-14">
            <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
              <div>
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.14em] text-slate-500"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0B1A2E] text-white">0{index + 1}</span>{category.displayName}</p>
                <h2 id={category.id + '-heading'} className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{category.sectionHeading}</h2>
                <div className="mt-6 space-y-4 text-base leading-7 text-slate-600">{category.occupationParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
                <div className="mt-7 rounded-xl border-l-4 border-[#F2A93B] bg-[#FFF4DF] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider">Before your first assignment</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{category.practicalStep}</p>
                </div>
                <Link href={category.relatedPath} className={'mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium ' + sourceLink}>{category.relatedLabel}<span aria-hidden="true">→</span></Link>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#0B1A2E]/15 bg-white shadow-[0_8px_32px_-20px_rgba(11,26,46,0.3)]">
                <div className="relative border-b border-[#0B1A2E]/10 bg-[#EDF2F2] px-5 pt-3"><span className="absolute right-4 top-4 rounded-full bg-[#F2A93B] px-3 py-1 text-xs font-semibold">Free learning materials</span><CourseArtwork category={category.id} className="mx-auto w-full max-w-sm" /></div>
                <div className="p-5 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-500">HeatSpring · Online course</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">{category.course.title}</h3>
                  <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-100 py-4 text-sm"><div><dt className="text-xs text-slate-500">Instructor</dt><dd className="mt-1 font-medium">{category.course.instructor}</dd></div><div><dt className="text-xs text-slate-500">Duration</dt><dd className="mt-1 font-medium">{category.course.duration}</dd></div></dl>
                  <p className="mt-5 text-sm leading-6 text-slate-600">{category.course.description}</p>
                  <ul aria-label="Topics covered" className="mt-4 space-y-3 text-sm leading-6 text-slate-600">{category.course.learningObjectives.map(objective => <li key={objective} className="flex gap-3"><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F2A93B]" /><span>{objective}</span></li>)}</ul>
                  <p className="mt-5 text-sm leading-6 text-slate-600"><span className="font-semibold text-[#0B1A2E]">Who it fits. </span>{category.course.audience}</p>
                  <div className="mt-5 rounded-xl bg-[#FAFAF7] p-4 text-sm leading-6 text-slate-600"><p><span className="font-semibold text-[#0B1A2E]">Free access. </span>{category.course.freeAccess}</p><p className="mt-3 border-t border-slate-200 pt-3">{category.course.credentialLimit}</p></div>
                  <div className="mt-5">
                    <p className="text-xs leading-5 text-slate-500">{TRAINING_AFFILIATE_DISCLOSURE}</p>
                    <AffiliateLink href={category.course.affiliateUrl} offerName={category.course.id} trainingCategory={category.id} className="mt-3 flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#0B1A2E] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#1E3A5F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B1A2E]">View {category.course.title} on HeatSpring <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></AffiliateLink>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
        <div className="mt-10 rounded-2xl border border-[#0B1A2E]/10 bg-white p-5 sm:p-8">
      <section aria-labelledby="access-heading" className="space-y-4 text-sm leading-7 text-slate-600">
        <h2 id="access-heading" className="text-xl font-semibold text-foreground">Free materials, paid certificates and job requirements</h2>
        <p>
          Each selected course lets you access its learning materials with an account and no credit card. HeatSpring also sells longer courses and memberships. A free lesson’s inclusion in a paid bundle does not mean you need to buy the bundle, and a free course does not necessarily include a free completion certificate. Access details sit beside each recommendation below.
        </p>
        <p>
          A NABCEP Associate credential requires an examination, according to <a href="https://www.nabcep.org/certifications/associate-program/" className={sourceLink} rel="noopener noreferrer">NABCEP’s Associate Program</a>. A provider’s completion certificate records a different achievement. Neither introductory study nor a completion certificate grants an electrical license or permission to perform every task on a solar site.
        </p>
        <p>
          OSHA identifies <a href="https://www.osha.gov/green-jobs/solar/electrical" className={sourceLink} rel="noopener noreferrer">shock, burns and arc-flash hazards in solar work</a>. Before accepting an assignment, ask the employer what safety training and supervision it provides. If an opening requires a license, a specific credential or prior experience, compare those requirements with what you actually hold; a short introductory course does not remove them.
        </p>
      </section>
        </div>
      <section aria-labelledby="prepare-heading" className="scroll-mt-24 border-t border-border py-8">
        <h2 id="prepare-heading" className="text-xl font-semibold">Turn a lesson into questions for an employer</h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          A job description gives you a specific task list to work from. Mark the equipment, safety duties and credentials it names. After a lesson, separate the concepts you can explain from the tasks you still need to learn under supervision. That distinction helps you describe your preparation honestly in an application.
        </p>
        <Link href="/solar-jobs-no-experience" className={`mt-3 inline-flex min-h-11 items-center text-sm font-semibold ${sourceLink}`}>Find solar jobs that welcome beginners</Link>
      </section>
      <section aria-labelledby="sources-heading" className="border-t border-border pt-8">
        <h2 id="sources-heading" className="text-xl font-semibold">Career and technical references</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">The course descriptions above come from the linked provider pages. These independent references explain the work, the equipment and the boundaries of introductory training.</p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
          <li><a className={sourceLink} href="https://www.energy.gov/cmei/systems/solar-photovoltaic-technology-basics" rel="noopener noreferrer">DOE: Solar Photovoltaic Technology Basics</a></li>
          <li><a className={sourceLink} href="https://www.energy.gov/cmei/systems/solar-photovoltaic-system-design-basics" rel="noopener noreferrer">DOE: Solar Photovoltaic System Design Basics</a></li>
          <li><a className={sourceLink} href="https://www.bls.gov/ooh/construction-and-extraction/solar-photovoltaic-installers.htm" rel="noopener noreferrer">BLS: Solar Photovoltaic Installers</a></li>
          <li><a className={sourceLink} href="https://www.bls.gov/ooh/construction-and-extraction/electricians.htm" rel="noopener noreferrer">BLS: Electricians</a></li>
          <li><a className={sourceLink} href="https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.332" rel="noopener noreferrer">OSHA: Electrical training requirements</a></li>
          <li><a className={sourceLink} href="https://www.nabcep.org/certifications/associate-program/" rel="noopener noreferrer">NABCEP: Associate Program</a></li>
        </ul>
      </section>
      </div>
    </main>
  )
}
