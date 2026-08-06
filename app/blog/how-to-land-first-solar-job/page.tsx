import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'The 14-Day Plan to Land Your First Solar Job in 2026 | Solar Roles',
  description:
    'A day-by-day action plan, not career advice. Exactly what to do, say, and send over the next two weeks to get hired as a solar installer — even with zero experience.',
  keywords: [
    'how to get a solar job',
    'solar installer apprenticeship',
    'first solar job',
    'OSHA 10 solar',
    'solar job application tips',
    'become a PV installer',
    'entry level solar jobs',
  ],
  authors: [{ name: 'Solar Roles Editorial Team' }],
  alternates: {
    canonical: 'https://www.solarroles.com/blog/14-day-plan-first-solar-job',
  },
  openGraph: {
    title: 'The 14-Day Plan to Land Your First Solar Job in 2026',
    description:
      'A day-by-day action plan, not career advice. Exactly what to do, say, and send over the next two weeks to get hired.',
    url: 'https://www.solarroles.com/blog/14-day-plan-first-solar-job',
    siteName: 'Solar Roles',
    type: 'article',
    publishedTime: '2026-08-06',
    authors: ['Solar Roles Editorial Team'],
    images: [
      {
        url: 'https://www.solarroles.com/solar-featured.jpg',
        width: 1200,
        height: 630,
        alt: 'The 14-Day Plan to Land Your First Solar Job in 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The 14-Day Plan to Land Your First Solar Job in 2026',
    description:
      'A day-by-day action plan, not career advice. Exactly what to do, say, and send over the next two weeks to get hired.',
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
        .article-body h3 {
          color: #0B1A2E;
          font-size: 1.1rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        .article-body .day-block {
          background: #F9FAFB;
          border: 1px solid #F3F4F6;
          border-radius: 0.75rem;
          padding: 1.5rem 1.75rem;
          margin-bottom: 1.5rem;
        }
        .article-body .day-label {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #B45309;
          background: #FEF3C7;
          padding: 0.25rem 0.6rem;
          border-radius: 0.4rem;
          margin-bottom: 0.75rem;
        }
        .article-body .script {
          background: #0B1A2E;
          color: #E5E7EB;
          border-radius: 0.5rem;
          padding: 1.1rem 1.35rem;
          font-size: 1rem;
          line-height: 1.7;
          margin: 1rem 0 1.5rem;
          font-style: italic;
        }
        .article-body ul { margin: 0 0 1.5rem; padding-left: 1.25rem; }
        .article-body li { color: #374151; line-height: 1.7; margin-bottom: 0.4rem; font-size: 1.05rem; }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 pt-8">
       
      </div>

      <article className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <header className="mb-12">
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-md mb-5">
            Solar Careers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1A2E] tracking-tight leading-[1.1] mb-5">
            The 14-Day Plan to Land Your First Solar Job in 2026
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Here's exactly what to do each day for the next two weeks, including the emails to send and the words to say in person.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span className="font-medium text-[#0B1A2E]">Solar Roles Editorial Team</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>August 6, 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>9 min read</span>
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
            Below is a two-week schedule with a specific action for each day.
             Follow it in order, each step is built on the one before it.
          </p>

          <h2>Days 1–2: Get the one credential that actually moves the needle</h2>
          <div className="day-block">
            <span className="day-label">Day 1</span>
            <p style={{ marginBottom: '0.75rem' }}>
              Take an OSHA 10 course online tonight. It's 10 hours, self-paced, roughly $70–$100, and you can spread it over two evenings.
              Search "OSHA 10 construction outreach online" and pick a provider authorized by the OSHA Training Institute — the certificate
              should say "OSHA 10-Hour Construction," not "OSHA 10-Hour General Industry" (installers need the construction version).
            </p>
            <p style={{ marginBottom: 0 }}>
              Do not wait until you have an interview lined up. Employers filter applications by who already has it.
            </p>
          </div>
          <div className="day-block">
            <span className="day-label">Day 2</span>
            <p style={{ marginBottom: 0 }}>
              Finish the course, download the PDF certificate, and save it as <strong>LastName_OSHA10_2026.pdf</strong>. You'll attach this
              to every application.
            </p>
          </div>

          <h2>Days 3–4: Resume building</h2>
          <div className="day-block">
            <span className="day-label">Day 3</span>
            <p style={{ marginBottom: '0.75rem' }}>One page and five sections:</p>
            <ul>
              <li><strong>Header</strong> — name, phone, a real email, city/state (no street address needed)</li>
              <li><strong>Certifications</strong> — OSHA 10 first, then anything else (CPR/First Aid, EPA 608, driver's license class)</li>
              <li><strong>Relevant experience</strong> — any physical, outdoor, or trade work, listed as action bullets, most recent first</li>
              <li><strong>Other work history</strong> — everything else, one line each, just to show consistent employment</li>
              <li><strong>Availability</strong> — one line: "Available immediately, full-time, own transportation" (this alone gets you past some filters)</li>
            </ul>
            <p style={{ marginBottom: 0 }}>
              If you've never worked construction: use roofing, landscaping, warehouse, moving, delivery, or military experience. Rewrite each
              bullet around a physical or safety skill. "Stocked shelves" becomes "Lifted and moved 40–60 lb loads repeatedly in a fast-paced
              environment while following safety protocols."
            </p>
          </div>
          <div className="day-block">
            <span className="day-label">Day 4</span>
            <p style={{ marginBottom: 0 }}>
              Export it as a PDF named <strong>LastName_FirstName_Resume.pdf</strong>. Keep the file name as short as possible.
            </p>
          </div>

          <h2>Days 5–6: Build your target list of 15 companies</h2>
          <div className="day-block">
            <span className="day-label">Day 5</span>
            <ul>
              <li>Browse open installer and apprentice role and note every company hiring near you (see our <Link href="https://www.solarroles.com/jobs">job listing)</Link></li>
              <li>Search Maps for "solar installer" in your metro area and note companies with active crews (check their reviews for recent installs)</li>
              <li>Search LinkedIn for "solar installer" + your city, filtered to the last week, and note who's posting</li>
            </ul>
          </div>
          <div className="day-block">
            <span className="day-label">Day 6</span>
            <p style={{ marginBottom: 0 }}>
              For each of the 15, apply directly on the company's own careers page if they have one. Attach
              your resume and OSHA 10 certificate to every application.
            </p>
          </div>

          <h2>Days 7–9: Show up in person to your top 5</h2>
          <p>
            This is the step that actually separates you from the other 90% of applicants, who only apply online. 
            Pick your 5 closest or most promising companies from the list.
          </p>
          <div className="day-block">
            <span className="day-label">Days 7–9, one company per day</span>
            <p style={{ marginBottom: '0.75rem' }}>
              Drive to their office or find where their crew is currently working (check recent job photos on Google/Instagram, or just call
              and ask what neighborhood they're in today). Bring a printed resume and certificate. Ask for the operations manager or lead
              installer by name if you have it.
            </p>
          </div>

          <h2>Day 10: Follow up on everything from Days 5–9</h2>
          <div className="day-block">
            <span className="day-label">Day 10</span>
            <p style={{ marginBottom: '0.5rem' }}>Send this email to every online application from Day 6 that hasn't responded:</p>
            <div className="script">
              Subject: Following up — Installer application, [Your Name]
              <br /><br />
              Hi [Name or "Hiring Team"], I applied for the installer position on [date] and wanted to follow up. I have my OSHA 10
              certification and I'm available to start immediately. Happy to come by in person if that's easier — let me know what works.
              <br /><br />
              Thanks,<br />[Your Name] — [Phone number]
            </div>
            <p style={{ marginBottom: 0 }}>
              For the 5 you visited in person, text or call the contact you got instead of emailing.
            </p>
          </div>

          <h2>Days 11–13: Widen the net and prep for interviews</h2>
          <div className="day-block">
            <span className="day-label">Day 11</span>
            <p style={{ marginBottom: 0 }}>
              Add 10 more companies to your spreadsheet (union electrical apprenticeship programs count — search "IBEW apprenticeship
              [your state]" if you're open to commercial work) and apply to all of them the same way as Day 6.
            </p>
          </div>
          <div className="day-block">
            <span className="day-label">Days 12–13</span>
            <p style={{ marginBottom: '0.75rem' }}>Prepare answers to the questions you will almost certainly be asked:</p>
            <ul>
              <li>Are you comfortable working on a roof, in the heat, for a full 8–10 hour day?</li>
              <li>Tell me about a time you had to follow a safety procedure even when it slowed you down.</li>
              <li>Do you have reliable transportation to the shop or job sites?</li>
              <li>Why solar, specifically, and not another trade?</li>
              <li>When can you start?</li>
            </ul>
            <p style={{ marginBottom: 0 }}>
              For the last question, the answer is always "immediately" or as close to it as true. Availability wins ties.
            </p>
          </div>

          <h2>Day 14: Second follow-up, and reset the loop</h2>
          <div className="day-block">
            <span className="day-label">Day 14</span>
            <p style={{ marginBottom: '0.75rem' }}>
              Anyone from Days 5–10 who still hasn't replied gets one more short message: "Just checking in on my application from last
              week — still very interested if the role is open.".
            </p>
            <p style={{ marginBottom: 0 }}>
              Then repeat Days 5–10 with a new batch of 15 companies. Most people that search solar jobs
              this way land something between week 2 and week 4.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-gray-100">
          <div className="bg-gradient-to-br from-[#0B1A2E] to-[#1E3A5F] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Start your solar job search right now
            </h2>
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