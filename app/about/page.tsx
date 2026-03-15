import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Oh My Job | Smarter Job Search, Powered by AI",
  description:
    "Oh My Job is a U.S. job search platform that uses AI-powered smart matching to connect job seekers with the right opportunities faster. Learn more about our mission.",
  openGraph: {
    title: "About Oh My Job | Smarter Job Search, Powered by AI",
    description:
      "Oh My Job is a U.S. job search platform that uses AI-powered smart matching to connect job seekers with the right opportunities faster.",
    url: "https://oh-my-job.com/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          Finding a job is hard enough.
          <br />
          <span className="text-blue-600">Searching for one shouldn't be.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
          Oh My Job is a job search platform built for the U.S. market that
          helps you cut through the noise. Instead of scrolling through hundreds
          of irrelevant listings, our AI-powered matching surfaces the
          opportunities that actually fit your skills, experience, and
          preferences.
        </p>
      </section>

      {/* Why we built this */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Why we built this
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Most job boards work the same way they did fifteen years ago: you type
          a keyword, pick a location, and get thousands of results sorted by
          date. That approach puts the burden on you to figure out what's
          relevant and what's not.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          We thought it could work differently. What if a job search engine
          actually understood what you're looking for and brought back results
          ranked by how well they match you, not just how recently they were
          posted?
        </p>
        <p className="text-gray-600 leading-relaxed">
          That's the idea behind Oh My Job. We combine traditional filters with
          smart AI matching so you spend less time searching and more time
          applying to jobs worth your attention.
        </p>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            How it works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg">
                  Tell us what you're looking for
                </h3>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  Use our search filters or describe your ideal role in plain
                  language. Our AI understands both.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg">
                  Get matched, not flooded
                </h3>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  Instead of dumping every listing on you, we rank results by
                  relevance to your profile. The best fits come first.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-lg">
                  Stay ahead with job alerts
                </h3>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  Set up alerts and get notified when new roles matching your
                  criteria are posted, so you never miss an opportunity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we believe */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          What we believe
        </h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium text-gray-900 text-lg mb-2">
              Job search should be efficient
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Your time matters. Every feature we build is designed to reduce the
              hours you spend searching and increase the quality of what you
              find.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-lg mb-2">
              AI should work for you
            </h3>
            <p className="text-gray-600 leading-relaxed">
              We use artificial intelligence to understand context and intent,
              not just keywords. The technology adapts to you, not the other way
              around.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-lg mb-2">
              Transparency matters
            </h3>
            <p className="text-gray-600 leading-relaxed">
              We show you real listings from real employers. No fake postings, no
              ghost jobs, no bait-and-switch. What you see is what's actually out
              there.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-lg mb-2">
              Free means free
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Oh My Job is completely free for job seekers. No premium tiers, no
              paywalls on search results, no hidden fees. You get the full
              experience from day one.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to find your next role?
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Start searching thousands of U.S. job listings matched to what
            you're actually looking for.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start searching
          </Link>
        </div>
      </section>
    </main>
  );
}