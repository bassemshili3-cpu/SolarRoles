import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | Solar Roles',
  description:
    'We are rethinking how hiring works in the US solar industry. Solar Roles puts skills first so the right people find the right solar jobs, regardless of where they went to school.',
  openGraph: {
    title: 'About Solar Roles',
    description: 'Skills-based hiring for the modern solar workforce.',
    url: 'https://solarroles.com/about',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#0B1A2E] text-white">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <p className="text-[#F5B819] text-sm font-semibold tracking-wider uppercase mb-5">About Solar Roles</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            The solar industry judges you<br />by the cert on your wall.
            <br />
            <span className="text-[#F5B819]">We think that&rsquo;s backwards.</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
            We&rsquo;re building a job board that focuses on what solar professionals can actually do on a roof &mdash; not just what certifications they hold or who they&rsquo;ve worked for before.
          </p>
        </div>
      </section>

      {/* The problem */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-[#0B1A2E] mb-6">The problem we&rsquo;re solving</h2>
        <div className="space-y-5 text-gray-600 leading-relaxed text-lg">
          <p>
            Getting your first solar job still requires having worked in solar. An electrician transitioning into PV is treated like they&rsquo;re starting from zero. And a hands-on installer who&rsquo;s wired hundreds of residential arrays gets screened out before a recruiter ever reads their r&eacute;sum&eacute; &mdash; because they don&rsquo;t have the right acronym after their name.
          </p>
          <p>
            Most job boards are running the same playbook they had in 2005: keyword search, date sort, done. Search &ldquo;solar installer&rdquo; and you&rsquo;ll get flooded with residential sales roles and SEO content farms. The actual trade jobs &mdash; the ones that build the energy transition &mdash; get buried.
          </p>
          <p>
            We think there&rsquo;s a better way.
          </p>
        </div>
      </section>

      {/* What we're building */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#0B1A2E] mb-8">What we&rsquo;re building</h2>
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F5B819] text-[#0B1A2E] text-sm font-bold flex items-center justify-center mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-semibold text-[#0B1A2E] text-lg mb-2">A solar job board that actually works</h3>
                <p className="text-gray-600 leading-relaxed">
                  Thousands of US solar jobs updated daily, with filters that go beyond the basics. Job type, salary range, NABCEP level, residential vs commercial, apprenticeship programs, OSHA certification. Everything you need to find a solar role worth applying to, without scrolling through pages of SEO noise.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F5B819] text-[#0B1A2E] text-sm font-bold flex items-center justify-center mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-semibold text-[#0B1A2E] text-lg mb-2">Skills over pedigree</h3>
                <p className="text-gray-600 leading-relaxed">
                  We&rsquo;re working toward a world where what you can do on a roof matters more than the letters after your name. NABCEP-aligned digital credentials, hands-on skills assessments, and portable badges will let solar candidates demonstrate competence, not just claim it. This is where we&rsquo;re going, and we&rsquo;re building toward it deliberately.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F5B819] text-[#0B1A2E] text-sm font-bold flex items-center justify-center mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-semibold text-[#0B1A2E] text-lg mb-2">Built for the people who actually build solar</h3>
                <p className="text-gray-600 leading-relaxed">
                  Apprentices starting their first week, electricians moving into PV, ex-roofers crossing over, career changers at 40 &mdash; the ones the current hiring system wasn&rsquo;t designed for. Our goal is to give them the same shot as everyone else, based on what they can do on the job today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we believe */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-[#0B1A2E] mb-8">What we believe</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-[#0B1A2E] mb-2">Skills are the real signal</h3>
            <p className="text-gray-600 leading-relaxed">
              A NABCEP cert is one data point. A track record of installed megawatts is a much better one. We want to help solar professionals build that track record and share it with employers who are paying attention.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#0B1A2E] mb-2">Free for job seekers, always</h3>
            <p className="text-gray-600 leading-relaxed">
              No premium tiers, no paywalls on search results. If you&rsquo;re looking for solar work, you get the full platform from day one.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#0B1A2E] mb-2">Real listings</h3>
            <p className="text-gray-600 leading-relaxed">
              We aggregate from verified solar-focused sources and filter aggressively. No ghost jobs, no roles that were filled three months ago, no bait-and-switch from residential sales masquerading as install work.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#0B1A2E] mb-2">Transparency</h3>
            <p className="text-gray-600 leading-relaxed">
              Pay ranges when we have them. Clear requirements &mdash; NABCEP level, OSHA, journeyman status. Honest about what we know and what we don&rsquo;t. No hidden ranking by paid placement.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}