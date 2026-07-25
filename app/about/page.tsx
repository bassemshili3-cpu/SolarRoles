import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | Oh My Job',
  description:
    'We are rethinking how hiring works in the US. Oh My Job puts skills first so the right people find the right jobs, regardless of where they went to school.',
  openGraph: {
    title: 'About Oh My Job',
    description: 'Skills-based hiring for the modern job market.',
    url: 'https://oh-my-job.com/about',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#3D1654] text-white">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <p className="text-[#E8B339] text-sm font-semibold tracking-wider uppercase mb-5">About Oh My Job</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            The job market judges you<br />by where you've been.
            <br />
            <span className="text-[#E8B339]">We think that's backwards.</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
            We're building a job board that focuses on what people can actually do, not where they went to school or who they've worked for before.
          </p>
        </div>
      </section>

      {/* The problem */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-[#3D1654] mb-6">The problem we're solving</h2>
        <div className="space-y-5 text-gray-600 leading-relaxed text-lg">
          <p>
            Getting a first job still requires having had a first job. Changing careers at 35 is still treated like starting from zero. And a self-taught developer with the skills to do the work gets screened out before a recruiter ever reads their resume.
          </p>
          <p>
            Most job boards are running the same playbook they had in 2005: keyword search, date sort, done. They're not broken. They're just not built for the people who need them most.
          </p>
          <p>
            We think there's a better way.
          </p>
        </div>
      </section>

      {/* What we're building */}
      <section className="bg-[#FAF7FC] py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#3D1654] mb-8">What we're building</h2>
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C9991F] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-semibold text-[#3D1654] text-lg mb-2">A job board that actually works</h3>
                <p className="text-gray-600 leading-relaxed">
                  Over 300,000 US jobs updated daily, with filters that go beyond the basics. Job type, salary, experience level, remote work, visa sponsorship. Everything you need to find something worth applying to, without scrolling through pages of irrelevant listings.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C9991F] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-semibold text-[#3D1654] text-lg mb-2">Skills over pedigree</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're working toward a world where you can prove what you know. Verified digital credentials, skills assessments, and portable badges will let candidates demonstrate competence, not just claim it. This is where we're going, and we're building toward it deliberately.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C9991F] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-semibold text-[#3D1654] text-lg mb-2">Built for who actually needs it</h3>
                <p className="text-gray-600 leading-relaxed">
                  Recent grads, career changers, people without traditional degrees — the ones the system wasn't designed for. Our goal is to give them the same shot as everyone else, based on what they can do today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we believe */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-[#3D1654] mb-8">What we believe</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-[#3D1654] mb-2">Skills are the real signal</h3>
            <p className="text-gray-600 leading-relaxed">
              A degree is one data point. A portfolio of verifiable skills is a much better one. We want to help candidates build that portfolio and share it with employers who are paying attention.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#3D1654] mb-2">Free for job seekers, always</h3>
            <p className="text-gray-600 leading-relaxed">
              No premium tiers, no paywalls on search results. If you're looking for work, you get the full platform from day one.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#3D1654] mb-2">Real listings</h3>
            <p className="text-gray-600 leading-relaxed">
              We aggregate from verified sources and filter aggressively. No ghost jobs, no positions that were filled three months ago, no bait-and-switch.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#3D1654] mb-2">Transparency</h3>
            <p className="text-gray-600 leading-relaxed">
              Salary ranges when we have them. Clear requirements. Honest about what we know and what we don't. No hidden ranking by paid placement.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}