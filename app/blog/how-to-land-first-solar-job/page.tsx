import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, User } from 'lucide-react'
import { EditorialInfographic } from '@/components/EditorialInfographic'

export const metadata: Metadata = {
  title: 'The 14-Day Plan to Land Your First Solar Job in 2026 | Solar Roles',
  description:
    'All you need to know to land your first solar job in 2026, with a practical 14-day plan and tailored advice for helpers, installers, sales reps, technicians, crew leads, and project managers.',
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
      'All you need to know to land your first solar job in 2026, with a practical 14-day plan and tailored advice for helpers, installers, sales reps, technicians, crew leads, and project managers.',
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
      'A practical 14-day plan for landing a first solar job, with a route for installers, sales, technicians, crew leads, and project management.',
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
        .article-body .role-card {
          border-left: 4px solid #F5B819;
          background: #FFFBEB;
          border-radius: 0 0.75rem 0.75rem 0;
          padding: 1.25rem 1.4rem;
          margin: 1.25rem 0;
        }
        .article-body .role-card h3 { margin-top: 0; }
        .article-body .role-card p { font-size: 1rem; margin-bottom: 0.8rem; }
        .article-body .role-card p:last-child { margin-bottom: 0; }
        .article-body .role-order {
          display: inline-block;
          color: #92400E;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: .35rem;
        }
        .article-body .source-note {
          font-size: .92rem;
          color: #6B7280;
          border-top: 1px solid #E5E7EB;
          margin-top: 2rem;
          padding-top: 1rem;
        }
        .article-body .inline-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0.25rem 0 1.75rem;
          padding: 0.75rem 1rem;
          border: 1px solid #0B1A2E;
          border-radius: 0;
          background: #0B1A2E;
          color: #FFFFFF;
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1.2;
          transition: background .15s ease, color .15s ease;
        }
        .article-body .inline-cta:hover { background: #F5B819; color: #0B1A2E; }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 pt-8">
       
      </div>

      <article className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <header className="mb-12">
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-md mb-5">
            Solar Careers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1A2E] tracking-tight leading-[1.1] mb-5">
            Land Your First Solar Job in two weeks: 2026 Edition
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            The solar job market is competitive, but with the right strategy, you can land your first position in 2026. This plan outlines the specific actions to take over the next two weeks, including the emails to send and the words to say in person.
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
              <span>14 min read</span>
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
            The best way to land your first solar job depends on the work you actually want to do. Start by picking a lane. Rooftop
            helper and installer roles are the most accessible. Sales follows a different hiring path, while crew lead and project
            management roles usually require more proof of experience.
          </p>

          <h2>Pick the right first role before you apply</h2>
          <p>
            Do not apply to every title containing “solar.” Pick the lane that matches the experience you can honestly show today,
            then tailor your two-week plan to it. The sequence below is roughly from the most accessible entry point to the roles that
            normally require prior field, trade, or construction-management experience. It is not a pay ranking:
            a good roofer may move faster than a complete beginner, while an experienced construction coordinator may enter through
            an assistant project manager role.
          </p>

          <EditorialInfographic kind="first-solar-role" />

          <div className="role-card">
            <span className="role-order">1. Most accessible</span>
            <h3>General laborer, rooftop helper, or warehouse / install support</h3>
            <p>
              This is the cleanest entry point if you have no solar or construction background. Small installers need dependable people
              who can work outdoors and get to jobsites reliably. Make the evidence easy to find on your resume:
            </p>
            <ul>
              <li>reliable transportation and comfort with early starts;</li>
              <li>safe physical work, including carrying material; and</li>
              <li>relevant experience from roofing, landscaping, warehouse, delivery, moving, or military work.</li>
            </ul>
            <p>
              <strong>Best move:</strong> search for <em>solar laborer</em>, <em>installer helper</em>, <em>roof crew helper</em>, and
              <em> warehouse assistant</em>. Call local contractors and ask whether they hire helpers for
              install crews. You can also visit the office when appropriate.
            </p>
          </div>

          <Link href="/solar-pv-installer-jobs" className="inline-cta">
            Browse solar installer jobs
          </Link>

          <div className="role-card">
            <span className="role-order">2. Entry trade path</span>
            <h3>Solar PV installer</h3>
            <p>
              This is the main “learn while working” route. The Bureau of Labor Statistics says most PV installers learn alongside
              experienced installers, with related construction experience shortening the ramp-up. That matches repeated advice from
              working installers: start with safety, listen closely, and learn tools and layout quickly. Show that you understand the
              realities of the work: heat, roofs, travel, and physical repetition.
            </p>
            <p>
              <strong>Best move:</strong> apply to installer and apprentice openings. Then make your application specific:
            </p>
            <ul>
              <li>State whether OSHA 10 is complete or in progress.</li>
              <li>Say that you are comfortable on roofs and available for early starts.</li>
              <li>Include your valid driver&rsquo;s license if you have one.</li>
              <li>Give one real example of safe physical work.</li>
            </ul>
            <p>Do not buy a full tool kit before you are hired. Ask what the employer supplies and what you will need on day one.</p>
          </div>

          <Link href="/solar-pv-installer-jobs" className="inline-cta">
            Browse solar PV installer jobs
          </Link>

          <div className="role-card">
            <span className="role-order">3. Accessible, but a different job</span>
            <h3>Solar sales consultant or appointment setter</h3>
            <p>
              Sales can be easier to enter than an electrical role, but it is not an “easy” solar job. It rewards prospecting,
              follow-up, clear communication, and comfort with rejection — often through phone, virtual, canvassing, or door-to-door
              work. Community discussions consistently warn new reps not to confuse a large advertised income range with guaranteed pay.
            </p>
            <p>
              <strong>Best move:</strong> before accepting, get these answers in writing:
            </p>
            <ul>
              <li>Whether the role is W-2 or 1099, and whether there is a guaranteed base.</li>
              <li>Where leads come from and when commission is paid.</li>
              <li>What happens if a customer cancels, including any commission clawback.</li>
            </ul>
            <p>If you need predictable income, favour a base-plus-commission role over a commission-only promise.</p>
          </div>

          <Link href="/solar-sales-jobs" className="inline-cta">
            Browse solar sales jobs
          </Link>

          <div className="role-card">
            <span className="role-order">4. Trade progression</span>
            <h3>Solar electrician, service technician, or O&amp;M technician</h3>
            <p>
              These roles are excellent long-term paths, but usually not the first offer for someone with no electrical foundation.
              Employers look for electrical troubleshooting, conduit, plans, code awareness, commissioning, service documentation, or
              an electrician apprenticeship. If you already have electrical, HVAC, industrial maintenance, or automotive diagnostics
              experience, say so directly; it is more valuable than a generic “passion for solar” paragraph.
            </p>
            <p>
              <strong>Best move:</strong> start with an apprenticeship, electrical helper, installer, or junior service role. Once you are on
              the job, volunteer for troubleshooting and commissioning checklists. Learn photo documentation and inverter or battery
              basics. Those skills bridge installation work and service work.
            </p>
          </div>

          <div className="role-card">
            <span className="role-order">5. Not usually a first job</span>
            <h3>Lead installer or crew lead</h3>
            <p>
              A lead is hired to keep people safe and lay out the work. They solve small problems, teach newer installers, and deliver a
              handoff — not merely to install panels quickly. Experienced workers describe advancement as tied to crew responsibility,
              conduit and electrical competence, paperwork, and the ability to train others. Treat this as a target after proving you
              can install consistently, not a title to stretch for on your first application.
            </p>
            <p>
              <strong>Best move:</strong> during an installer interview, ask what a promotion-ready installer can demonstrate in the first
              90 days. Then keep a simple record of the systems, tools, layouts, safety tasks, and junior teammates you have supported.
            </p>
          </div>

          <div className="role-card">
            <span className="role-order">6. Least accessible without related experience</span>
            <h3>Project coordinator, assistant project manager, or project manager</h3>
            <p>
              Solar project management is construction coordination. It covers permits, schedules, material status, change orders,
              inspections, and closeout. Some roles also manage subcontractors or customer communication. A direct PM jump is realistic
              only if you already bring relevant construction, logistics, permitting, design, procurement, or client-project experience.
              Practitioners are more likely to recommend project coordinator or assistant PM roles to newcomers than a full PM title.
            </p>
            <p>
              <strong>Best move:</strong> translate your current experience into solar language. Highlight schedules, vendors, documentation,
              budgets, permits, and customer communication. If you are coming from the field, learn plan reading, RFIs, material
              takeoffs, and closeout documentation. Those are concrete signals that you are ready to support a PM.
            </p>
          </div>

          <p className="source-note">
            <strong>What informed this section:</strong> official PV-installer training guidance from the{' '}
            <a href="https://www.bls.gov/ooh/construction-and-extraction/solar-photovoltaic-installers.htm" target="_blank" rel="noopener noreferrer">U.S. Bureau of Labor Statistics</a>,
            plus recurring firsthand themes from discussions among{' '}
            <a href="https://www.reddit.com/r/solar/comments/q0kwoi/chances_of_becoming_a_solar_installer/" target="_blank" rel="noopener noreferrer">installers entering without prior trade experience</a>,{' '}
            <a href="https://www.reddit.com/r/solar/comments/eds88z/pv_installersleads_how_much_do_any_make_what_state/" target="_blank" rel="noopener noreferrer">crew leads</a>,{' '}
            <a href="https://www.reddit.com/r/solar/comments/12oethj/i_am_applying_for_a_sales_representative_job_and/" target="_blank" rel="noopener noreferrer">solar sales reps</a>, and{' '}
            <a href="https://www.reddit.com/r/solar/comments/1vfrnvo/working_in_the_industry/" target="_blank" rel="noopener noreferrer">solar project managers</a>.
            These are practitioner perspectives, not guarantees about any employer or pay plan.
          </p>

          <h2>DGet a credible safety baseline</h2>
          <div className="day-block">
            <span className="day-label">Day 1</span>
            <p style={{ marginBottom: '0.75rem' }}>
              If you are targeting field work, enroll in an OSHA 10-Hour Construction Outreach course from an authorized provider.
              OSHA describes the 10-hour program as entry-level safety training; it is not a trade license and does not replace an
              employer's site-specific training. It takes at least two calendar days under Outreach rules, so start now rather than
              waiting for an interview.
            </p>
            <p style={{ marginBottom: 0 }}>
              If cost is a barrier, check your state workforce office, community college, union, or workforce board before paying.
              Some states and local programs offer free classes.
            </p>
          </div>
          <div className="day-block">
            <span className="day-label">Day 2</span>
            <p style={{ marginBottom: 0 }}>
              Finish the course, download the PDF certificate, and save it as <strong>LastName_OSHA10_2026.pdf</strong>. Attach it to
              field-role applications. If you have only enrolled, say “OSHA 10 Construction — in progress, completion date [date]”
              rather than claiming the card early.
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
              <li>Browse open installer and apprentice roles and note every company hiring near you (see our <Link href="/jobs">job listings</Link>)</li>
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
            This is the step that separates you from the other 90% of applicants, who only apply online. 
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

        <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <p className="font-semibold text-gray-900 mb-2">Keep reading</p>
          <p className="text-sm text-gray-600">
            Get the full entry path in{' '}
            <a href="/resources/how-to-become-a-solar-installer" className="text-blue-700 underline hover:text-blue-900">how to become a solar installer</a>,
            map the apprenticeship route with{' '}
            <a href="/resources/how-to-get-a-solar-apprenticeship" className="text-blue-700 underline hover:text-blue-900">how to land a solar apprenticeship</a>,
            and check{' '}
            <a href="/data/salaries/solar-photovoltaic-installer" className="text-blue-700 underline hover:text-blue-900">installer salary by state</a>.
          </p>
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
              className="inline-flex items-center gap-2 bg-[#F5B819] hover:bg-[#E5A810] text-[#0B1A2E] font-semibold px-6 py-3 rounded-none transition-colors"
            >
              Browse open solar jobs
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
