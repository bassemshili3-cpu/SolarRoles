import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Oh My Job',
  description: 'Learn how Oh My Job uses cookies and similar tracking technologies on our job search platform.',
  alternates: {
    canonical: 'https://www.oh-my-job.com/cookie-policy',
  },
}

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
      <p className="text-sm text-gray-500 mb-10">
        Last updated: March 1, 2026
      </p>

      <div className="prose prose-gray max-w-none space-y-10">

        {/* Intro */}
        <section>
          <p className="text-gray-700 leading-relaxed">
            This Cookie Policy explains how Oh My Job, Inc. ("<strong>Company</strong>", "<strong>we</strong>",
            "<strong>us</strong>") uses cookies and similar tracking technologies when you visit{' '}
            <a href="https://www.oh-my-job.com" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
              oh-my-job.com
            </a>{' '}
            (the "<strong>Site</strong>"). It should be read alongside our{' '}
            <a href="/privacy-policy" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
              Privacy Policy
            </a>{' '}
            and, for California residents, our{' '}
            <a href="/ccpa" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
              California Privacy Notice (CCPA/CPRA)
            </a>.
          </p>
        </section>

        {/* 1. What Are Cookies */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. What Are Cookies?</h2>
          <p className="text-gray-700 leading-relaxed">
            Cookies are small text files placed on your device (computer, tablet, or mobile) when you visit
            a website. They allow the site to recognize your device on subsequent visits and store certain
            information about your preferences or actions. Cookies can be "<strong>session cookies</strong>"
            (deleted when you close your browser) or "<strong>persistent cookies</strong>" (stored on your
            device for a set period or until you delete them).
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            In addition to cookies, we may use similar technologies such as <strong>web beacons</strong>,{' '}
            <strong>pixels</strong>, and <strong>local storage</strong>. For simplicity, we refer to all of
            these collectively as "cookies" in this policy.
          </p>
        </section>

        {/* 2. Types of Cookies We Use */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Types of Cookies We Use</h2>
          <div className="space-y-4">
            {[
              {
                type: 'Strictly Necessary Cookies',
                badge: 'Always active',
                badgeColor: 'bg-emerald-100 text-emerald-700',
                desc: 'These cookies are essential for the Site to function. They enable core features such as session management, authentication, security, and remembering your cookie consent choice. You cannot opt out of these cookies.',
                examples: ['Session authentication token', 'CSRF protection token', 'Cookie consent preference (omj_cookie_consent)'],
                retention: 'Session or up to 12 months',
              },
              {
                type: 'Functional Cookies',
                badge: 'Optional',
                badgeColor: 'bg-blue-100 text-blue-700',
                desc: 'These cookies allow the Site to remember choices you make and provide enhanced, personalized features — such as saving your job search preferences, location, or display settings.',
                examples: ['Saved search filters (job title, location, salary)', 'Dark/light mode preference', 'Recently viewed job listings'],
                retention: 'Up to 12 months',
              },
              {
                type: 'Analytics Cookies',
                badge: 'Optional',
                badgeColor: 'bg-blue-100 text-blue-700',
                desc: 'These cookies help us understand how visitors interact with the Site by collecting and reporting information anonymously. This helps us improve the platform and measure the performance of our features.',
                examples: ['Google Analytics (_ga, _gid, _gat)', 'Page view counts', 'Traffic sources and user flows'],
                retention: 'Up to 26 months',
              },
              {
                type: 'Advertising & Targeting Cookies',
                badge: 'Optional',
                badgeColor: 'bg-blue-100 text-blue-700',
                desc: 'These cookies may be set by our advertising partners to build a profile of your interests and show you relevant job-related ads on other sites. They do not store directly personal information but are based on uniquely identifying your browser.',
                examples: ['Google Ads conversion tracking', 'Retargeting pixels from ad networks'],
                retention: 'Up to 13 months',
              },
            ].map(({ type, badge, badgeColor, desc, examples, retention }, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{type}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {badge}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{desc}</p>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Examples</p>
                    <ul className="space-y-1">
                      {examples.map((ex, j) => (
                        <li key={j} className="text-gray-500 flex items-start gap-1.5">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Retention</p>
                    <p className="text-gray-500">{retention}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Third-Party Cookies */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Third-Party Cookies</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Some cookies on our Site are placed by third-party services. We do not control these cookies.
            Below are the main third parties that may set cookies when you use our platform:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Provider</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Purpose</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Privacy Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Google Analytics', 'Site analytics and usage measurement', 'https://policies.google.com/privacy', 'policies.google.com'],
                  ['Google Ads', 'Conversion tracking and job ad targeting', 'https://policies.google.com/privacy', 'policies.google.com'],
                  ['Google AdSense', 'Displays third-party advertising based on your visit to this and other websites', 'https://policies.google.com/technologies/ads', 'policies.google.com'],
                  ['Vercel', 'Hosting and performance monitoring', 'https://vercel.com/legal/privacy-policy', 'vercel.com'],
                ].map(([provider, purpose, url, label], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 font-medium text-gray-900">{provider}</td>
                    <td className="px-4 py-3 text-gray-600">{purpose}</td>
                    <td className="px-4 py-3">
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
                        {label}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Your Choices */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Managing Your Cookie Preferences</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have several options to control or limit how cookies are used:
          </p>

          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Our Cookie Banner</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                When you first visit the Site, you can choose to accept all cookies or restrict to necessary
                cookies only via our cookie consent banner. You can revisit this choice at any time by
                clearing your browser&apos;s local storage for our domain.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Browser Settings</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-2">
                Most browsers allow you to refuse or delete cookies through their settings. Note that
                disabling cookies may affect the functionality of the Site.
              </p>
              <ul className="space-y-1 text-sm text-gray-500">
                {[
                  ['Chrome', 'https://support.google.com/chrome/answer/95647'],
                  ['Firefox', 'https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer'],
                  ['Safari', 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac'],
                  ['Edge', 'https://support.microsoft.com/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d'],
                ].map(([browser, url]) => (
                  <li key={browser} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
                      {browser}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Google Analytics Opt-Out</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                You can prevent Google Analytics from collecting your data by installing the{' '}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer"
                  className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
                  Google Analytics Opt-out Browser Add-on
                </a>.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
  <h3 className="font-semibold text-gray-900 mb-1">Google Ad Settings</h3>
  <p className="text-gray-600 text-sm leading-relaxed">
    Google uses cookies to serve ads based on your prior visits to this and other websites.
    You can opt out of personalized advertising by visiting{' '}
    <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer"
      className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
      Google Ad Settings
    </a>.
  </p>
</div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Do Not Track</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Some browsers offer a "Do Not Track" (DNT) signal. We currently do not respond to DNT signals
                as there is no consistent industry standard for how to interpret them. We will update this
                policy if that changes.
              </p>
            </div>
          </div>
        </section>

        {/* 5. California Residents */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. California Residents</h2>
          <p className="text-gray-700 leading-relaxed">
            If you are a California resident, certain analytics or advertising cookies may constitute
            "sharing" of personal information under the CPRA. You have the right to opt out. Please visit
            our{' '}
            <a href="/ccpa" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
              California Privacy Notice
            </a>{' '}
            or use the{' '}
            <a href="/ccpa" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
              Do Not Sell My Personal Information
            </a>{' '}
            link in our footer.
          </p>
        </section>

        {/* 6. Updates */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Updates to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Cookie Policy periodically to reflect changes in technology, regulation, or
            our practices. The "Last updated" date at the top of this page will indicate when the most recent
            changes were made. We encourage you to review this page periodically.
          </p>
        </section>

        {/* 7. Contact */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Contact Us</h2>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <p className="text-gray-700 mb-1"><strong>Oh My Job, Inc.</strong></p>
            <p className="text-gray-700 mb-1">
              Email:{' '}
              <a href="mailto:privacy@ohmyjob.com"
                className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
                privacy@ohmyjob.com
              </a>
            </p>
            <p className="text-gray-700">
              Website:{' '}
              <a href="https://www.oh-my-job.com"
                className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
                www.oh-my-job.com
              </a>
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong>Disclaimer:</strong> This Cookie Policy is provided for informational purposes only and
            does not constitute legal advice. Oh My Job, Inc. recommends consulting qualified legal counsel
            to ensure full compliance with applicable privacy and cookie laws.
          </p>
        </section>

      </div>
    </div>
  )
}