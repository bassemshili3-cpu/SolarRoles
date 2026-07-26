import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'California Privacy Rights (CCPA/CPRA) | Solar Roles',
  description: 'California Consumer Privacy Act notice for Solar Roles. Learn about your privacy rights as a California resident.',
  alternates: {
    canonical: 'https://www.solarroles.com/ccpa',
  },
}

export default function CCPAPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        California Privacy Rights
      </h1>
      <p className="text-sm text-gray-500 mb-10">
        Last updated: March 1, 2026 — Effective as of January 1, 2023
      </p>

      <div className="prose prose-gray max-w-none space-y-10">

        {/* Intro */}
        <section>
          <p className="text-gray-700 leading-relaxed">
            This California Privacy Notice supplements the Solar Roles{' '}
            <a href="/privacy-policy" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
              Privacy Policy
            </a>{' '}
            and applies solely to residents of the State of California. It is provided pursuant to the California
            Consumer Privacy Act of 2018 (<strong>CCPA</strong>) as amended by the California Privacy Rights Act
            of 2020 (<strong>CPRA</strong>). Any terms defined in the CCPA/CPRA have the same meaning when used
            in this notice.
          </p>
        </section>

        {/* 1. Who We Are */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Who We Are</h2>
          <p className="text-gray-700 leading-relaxed">
            Solar Roles, Inc. ("<strong>Company</strong>", "<strong>we</strong>", "<strong>us</strong>") operates{' '}
            <a href="https://www.solarroles.com" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
              solarroles.com
            </a>
            , an online job search platform that aggregates employment listings across the United States.
          </p>
        </section>

        {/* 2. Personal Information We Collect */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Personal Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            In the past 12 months, we have collected the following categories of personal information:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200 w-1/3">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Examples</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200 w-1/6">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Identifiers', 'Name, email address, IP address, account username', 'Yes'],
                  ['Personal records', 'Resume, work history, professional skills', 'Yes'],
                  ['Protected characteristics', 'Age, gender (only if voluntarily provided)', 'Yes'],
                  ['Commercial information', 'Job searches, saved listings, application history', 'Yes'],
                  ['Internet / network activity', 'Browsing history on our site, search queries, referring URLs', 'Yes'],
                  ['Geolocation data', 'City/region inferred from IP or provided in job search', 'Yes'],
                  ['Inferences', 'Job preferences, career interests derived from activity', 'Yes'],
                  ['Sensitive personal information', 'None actively collected', 'No'],
                ].map(([cat, ex, col], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 font-medium text-gray-900 align-top">{cat}</td>
                    <td className="px-4 py-3 text-gray-600 align-top">{ex}</td>
                    <td className={`px-4 py-3 align-top font-medium ${col === 'Yes' ? 'text-emerald-600' : 'text-gray-400'}`}>{col}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. How We Use Personal Information */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. How We Use Personal Information</h2>
          <p className="text-gray-700 leading-relaxed mb-3">We use the personal information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Provide, operate, and improve our job search platform</li>
            <li>Personalize job recommendations and search results</li>
            <li>Send transactional communications (job alerts, account updates)</li>
            <li>Analyze usage trends and measure the effectiveness of features</li>
            <li>Prevent fraud, detect security incidents, and comply with legal obligations</li>
            <li>Respond to your requests, questions, and support inquiries</li>
          </ul>
        </section>

        {/* 4. How We Share Personal Information */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. How We Share Personal Information</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            We may share personal information with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>Service providers</strong> — companies that assist us with hosting, analytics, email delivery, and customer support, under contractual data processing agreements</li>
            <li><strong>Job listing partners</strong> — third-party job boards and employers whose listings appear on our platform (only to facilitate applications you initiate)</li>
            <li><strong>Analytics providers</strong> — such as Google Analytics, which may set cookies on your device (see our <a href="/cookie-policy" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">Cookie Policy</a>)</li>
            <li><strong>Legal authorities</strong> — when required by law, court order, or to protect rights and safety</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            <strong>We do not sell your personal information</strong> for monetary compensation. We do not share
            personal information with third parties for their own direct marketing purposes without your consent.
          </p>
        </section>

        {/* 5. Your Rights */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Your California Privacy Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            As a California resident, you have the following rights under the CCPA/CPRA:
          </p>
          <div className="space-y-4">
            {[
              {
                right: 'Right to Know',
                desc: 'You may request disclosure of the categories and specific pieces of personal information we have collected about you, the sources, the business purposes, and the third parties with whom we share it.',
              },
              {
                right: 'Right to Delete',
                desc: 'You may request that we delete personal information we collected from you, subject to certain exceptions (e.g., completing a transaction, legal obligations).',
              },
              {
                right: 'Right to Correct',
                desc: 'You may request that we correct inaccurate personal information we maintain about you.',
              },
              {
                right: 'Right to Opt-Out of Sale or Sharing',
                desc: 'You have the right to opt out of the sale or sharing of your personal information. To exercise this right, use the "Do Not Sell My Personal Information" link in our website footer or contact us below.',
              },
              {
                right: 'Right to Limit Use of Sensitive Personal Information',
                desc: 'We do not collect sensitive personal information as defined by the CPRA. If this changes, you will have the right to limit its use.',
              },
              {
                right: 'Right to Non-Discrimination',
                desc: 'We will not discriminate against you for exercising any of your CCPA/CPRA rights. We will not deny services, charge different prices, or provide a different level of quality because you exercised your privacy rights.',
              },
            ].map(({ right, desc }, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-1">{right}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. How to Submit a Request */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">6. How to Submit a Privacy Request</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            To exercise your rights, submit a verifiable consumer request by:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Writing to us at: Solar Roles, Inc., 27 rue de plaisance, 42400 Saint-Chamond, France</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-3">
            We will need to verify your identity before processing your request. We will respond within{' '}
            <strong>45 days</strong> of receipt. If we require more time (up to 90 days), we will inform you
            of the extension and reason in writing.
          </p>
          <p className="text-gray-700 leading-relaxed">
            You may designate an authorized agent to make a request on your behalf by providing written
            authorization or a power of attorney. We may require verification of the agent's identity and
            your authorization.
          </p>
        </section>

        {/* 7. Data Retention */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain personal information for as long as necessary to fulfill the purposes outlined in
            this notice, or as required by applicable law. Account data is typically retained for the
            duration of your account plus 2 years. Analytics data is retained for up to 26 months.
          </p>
        </section>

        {/* 8. Shine the Light */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">8. California "Shine the Light" Law</h2>
          <p className="text-gray-700 leading-relaxed">
            California Civil Code Section 1798.83 permits California residents to request a list of
            third parties to whom we disclosed personal information for direct marketing purposes in
            the preceding calendar year. We do not share personal information with third parties for
            their direct marketing purposes. 
          </p>
        </section>

        {/* 9. Changes */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Changes to This Notice</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this California Privacy Notice from time to time. We will notify you of material
            changes by updating the "Last updated" date at the top of this page. Your continued use of our
            platform after the effective date constitutes acceptance of the revised notice.
          </p>
        </section>

        {/* 10. Contact */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Contact Us</h2>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <p className="text-gray-700 mb-1"><strong>Solar Roles, Inc.</strong></p>
            <p className="text-gray-700 mb-1">Privacy Team</p>
            <p className="text-gray-700 mb-1">
              Email:{' '}
              <a href="mailto:contact@solarroles.com" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
                contact@solarroles.com
              </a>
            </p>
            <p className="text-gray-700">Website:{' '}
              <a href="https://www.solarroles.com" className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800">
                www.solarroles.com
              </a>
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong>Disclaimer:</strong> This notice is provided for informational purposes and reflects our
            current data practices. It does not constitute legal advice. Solar Roles, Inc. recommends consulting
            qualified legal counsel to ensure full compliance with applicable California privacy laws.
          </p>
        </section>

      </div>
    </div>
  )
}