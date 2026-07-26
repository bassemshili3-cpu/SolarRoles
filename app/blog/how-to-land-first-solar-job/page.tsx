import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How to Land Your First Solar Job in 2026 (Even Without Experience) | Solar Roles',
  description:
    'Breaking into solar doesn’t require a 4-year degree, a NABCEP cert, or years of experience. Here’s the real talk on how to get hired in residential or commercial PV installation in 2026.',
  keywords: [
    'how to get into solar',
    'first solar job',
    'solar installer apprenticeship',
    'NABCEP certification',
    'OSHA 10 solar',
    'become a PV installer',
    'solar career change',
    'entry level solar jobs',
  ],
  authors: [{ name: 'Solar Roles Editorial Team' }],
  alternates: {
    canonical: 'https://www.solarroles.com/blog/how-to-land-first-solar-job',
  },
  openGraph: {
    title: 'How to Land Your First Solar Job in 2026 (Even Without Experience)',
    description:
      'Breaking into solar doesn’t require a 4-year degree, a NABCEP cert, or years of experience. Here’s the real talk on how to get hired.',
    url: 'https://www.solarroles.com/blog/how-to-land-first-solar-job',
    siteName: 'Solar Roles',
    type: 'article',
    publishedTime: '2026-07-26',
    authors: ['Solar Roles Editorial Team'],
    images: [
      {
        url: 'https://www.solarroles.com/solar-featured.jpg',
        width: 1200,
        height: 630,
        alt: 'How to Land Your First Solar Job in 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Land Your First Solar Job in 2026 (Even Without Experience)',
    description:
      'Breaking into solar doesn’t require a 4-year degree, a NABCEP cert, or years of experience. Here’s the real talk on how to get hired.',
    images: ['https://www.solarroles.com/solar-featured.jpg'],
  },
}

export default function ArticlePage() {
  return (
    <main className="min-h-screen bg-white">
      <style>{`
        .article-body p {
          color: #374151;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
        }
        .article-body p:last-child { margin-bottom: 0; }
        .article-body strong { color: #0B1A2E; font-weight: 600; }
        .article-body h2 {
          color: #0B1A2E;
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          letter-spacing: -0.025em;
          line-height: 1.3;
        }
        .article-body h2:first-child { margin-top: 0; }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0B1A2E] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Solar Career Resources
        </Link>
      </div>

      <article className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <header className="mb-12">
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-md mb-5">
            Solar Careers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1A2E] tracking-tight leading-[1.1] mb-5">
            How to Land Your First Solar Job in 2026 (Even Without Experience)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Breaking into solar doesn’t require a 4-year degree, a NABCEP cert, or five years of rooftop experience. It also doesn’t happen by accident.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span className="font-medium text-[#0B1A2E]">Solar Roles Editorial Team</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>July 26, 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>8 min read</span>
            </div>
          </div>
        </header>

        <div className="mb-12 rounded-2xl overflow-hidden bg-gray-100 aspect-[16/10]">
          <img
            src="/solar-featured.jpg"
            alt="Solar installer working on a rooftop"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="article-body">
          <p>
            The good news: the solar industry is hiring aggressively. The bad news: most of the advice you’ll find online was written for software engineers, not for someone who wants to wire inverters for a living. So here’s what actually works, based on what hiring managers at residential and commercial solar companies tell us they care about.
          </p>

          <h2>Two paths into the field</h2>
          <p>
            There are basically two ways to get your first solar job in 2026. Neither one is wrong, and a lot of installers end up doing both at some point in their career.
          </p>
          <p>
            <strong>Path 1: The apprenticeship.</strong> You join a company as a paid apprentice, work under a lead installer, and learn on the job. Most residential companies run these programs, and so do the union electrical shops that do commercial work. The pay isn’t great at first (expect $18 to $22 an hour depending on your state), but the training is real. You’ll learn roof work, DC and AC wiring, grounding and bonding, how to commission a system, and how not to fall off a two-story. After 6 to 12 months you’re a journeyman installer with a raise and a real resume.
          </p>
          <p>
            <strong>Path 2: Direct hire with transferrable skills.</strong> If you’ve already worked in a related trade, you can often skip the apprenticeship. Electricians, roofers, HVAC techs, framers, and general construction laborers regularly cross over into solar with little to no solar-specific experience. Companies love hiring from these backgrounds because you already know how a jobsite works, you show up on time, and you don’t need to be taught what a breaker is.
          </p>
          <p>
            If you’re starting from zero, path 1 is the move. If you have any kind of trade background, path 2 is faster.
          </p>

          <h2>What hiring managers actually look at</h2>
          <p>
            Here’s something most career sites won’t tell you: when a solar company reviews your application, the hiring manager is looking at four things, in this order.
          </p>
          <p>
            <strong>1. Can you show up and not get hurt.</strong> Safety record matters more than anything. If you have an OSHA 10 card, put it at the top of your resume. If you don’t, get one. It costs about $100, takes a day, and signals to the employer that you’re not going to be a liability on day one.
          </p>
          <p>
            <strong>2. Can you be on a roof.</strong> This is half the job. If you’ve done any kind of physical outdoor work (roofing, framing, even landscaping), mention it. If you’re scared of heights, that’s something to work on before you apply, not after.
          </p>
          <p>
            <strong>3. Can you learn fast.</strong> Solar changes constantly. New racking systems, new inverters, new code updates. The people who thrive are the ones who can learn a new skill in a week, not the ones who already know everything. Show that you’ve learned things quickly in past jobs.
          </p>
          <p>
            <strong>4. Do you actually want this job.</strong> Generic applications get ignored. If you apply to a residential company, mention that you drove past their crews working on a house in your neighborhood. If you’re applying to a commercial EPC, mention that you read about their utility-scale project. Specifics beat credentials every time.
          </p>

          <h2>On certifications (and why less is more)</h2>
          <p>
            There are a few certifications that matter. There are also a lot that don’t, and you shouldn’t spend money on the wrong ones.
          </p>
          <p>
            <strong>OSHA 10 or OSHA 30.</strong> Get one. Most residential and commercial solar companies require OSHA 10 at minimum. OSHA 30 is a step up and helps if you’re applying to commercial or utility-scale work. Cost: $100 to $200, online, takes a day.
          </p>
          <p>
            <strong>NABCEP.</strong> This is the gold standard in solar certification, but here’s the honest truth: you don’t need it to get hired. You need it to get promoted into lead installer or designer roles. NABCEP has three main levels: NABCEP PV Associate (entry level, for people with little to no experience), NABCEP PV Installation Professional (the one most companies want for lead positions), and NABCEP PV Technical Sales Professional (for sales roles). The PV Associate is the only one worth getting before you have a job. Wait on the others.
          </p>
          <p>
            <strong>First Aid / CPR.</strong> Some companies require it, some don’t. A one-day class at your local Red Cross is $100 and a weekend. Worth doing.
          </p>
          <p>
            <strong>What you don’t need yet:</strong> Master’s electrician license (that’s a multi-year apprenticeship on its own), IBEW union card (great if you can get it, but not a path you can shortcut), bachelor’s degree in anything.
          </p>

          <h2>The resume that gets you a callback</h2>
          <p>
            Keep it to one page. Use bullet points, not paragraphs. Lead with the most recent and most relevant work, not the oldest.
          </p>
          <p>
            If you’ve worked construction, framing, roofing, electrical, HVAC, or any kind of physical outdoor job, list the specific skills you used. “Installed residential roof systems using asphalt shingles and underlayment” beats “worked in construction” every time.
          </p>
          <p>
            If you have no trade experience at all, list the transferable stuff: showing up on time, working in teams, following safety procedures, using hand tools, reading technical instructions, working in various weather conditions. Don’t pad with high school achievements or hobbies. Recruiters scan for 15 seconds, max.
          </p>
          <p>
            Put your phone number and a real email at the top. If your email is xX_solar_king_2006_Xx@gmail.com, make a new one.
          </p>

          <h2>How to actually apply</h2>
          <p>
            The single best way to get hired in solar is to walk onto a job site. Not literally, in most cases, but close.
          </p>
          <p>
            Drive around your city. Find a residential solar company that’s working on a few houses. Stop in. Ask to speak to the lead installer or the operations manager. Bring a printed copy of your resume. This works because 90% of solar applicants apply online, and the people who show up in person are the ones who get remembered.
          </p>
          <p>
            If you’re not the in-person type, apply online, but follow up. Send an email the day after you apply. Reference something specific about the company. Keep it short.
          </p>
          <p>
            Use Solar Roles, obviously, since we surface solar-only roles and you won’t be competing with every software engineer in the country for the same job posting. Indeed and LinkedIn work too, but you’ll be buried.
          </p>

          <h2>What to expect in the first 90 days</h2>
          <p>
            You’ll probably start with ground work: carrying panels, organizing materials, cleaning up the site. This is normal and not a waste of your time. The lead installer is watching how you work, not what you know.
          </p>
          <p>
            By month two, you’ll be on the roof with a mentor. You’ll be doing flashings, mounting rails, and running conduit. You’ll mess things up. Everyone does. The people who stay are the ones who ask questions and don’t make the same mistake twice.
          </p>
          <p>
            By month three, if you’re doing well, you’ll be running your own crew on smaller jobs. That’s when you start to feel like a solar installer and not just a helper.
          </p>
          <p>
            The pay jump between month 3 and month 12 is significant. A good lead installer at a residential company in 2026 makes $28 to $38 an hour depending on the state. Commercial and utility-scale installers with NABCEP certs and a few years of experience clear six figures. The ceiling is high if you’re good.
          </p>

          <h2>The one thing most people get wrong</h2>
          <p>
            They wait to feel ready before they apply.
          </p>
          <p>
            You’re not going to feel ready. The NABCEP study guide is intimidating. The OSHA videos are boring. The job descriptions list skills you don’t have. Apply anyway. The first solar job teaches you 10x more than any certification or course ever will.
          </p>
          <p>
            The industry is short on people who actually want to be there. That’s you, presumably, or you wouldn’t have read this far. Send the application. Make the call. Show up in person if you can.
          </p>
          <p>
            The rooftops are waiting.
          </p>
        </div>

        <div className="mt-16 pt-10 border-t border-gray-100">
          <div className="bg-gradient-to-br from-[#0B1A2E] to-[#1E3A5F] rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to find your first solar role?
            </h3>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Browse open PV installer, apprentice, and lead installer jobs from solar-focused employers across the US.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-[#F5B819] hover:bg-[#E5A810] text-[#0B1A2E] font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Browse open solar jobs
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}