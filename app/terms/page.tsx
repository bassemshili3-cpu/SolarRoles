"use client"
import { useState, useEffect } from 'react'

interface Section {
  id: string
  title: string
}

const sections: Section[] = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'accounts', title: 'User Accounts' },
  { id: 'platform-role', title: 'Our Role' },
  { id: 'user-content', title: 'User Content' },
  { id: 'employer-terms', title: 'Employer Responsibilities' },
  { id: 'prohibited', title: 'Prohibited Activities' },
  { id: 'fees', title: 'Fees and Payments' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'dmca', title: 'DMCA Policy' },
  { id: 'disclaimers', title: 'Disclaimer of Warranties' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'dispute-resolution', title: 'Dispute Resolution' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'termination', title: 'Termination' },
  { id: 'changes', title: 'Changes to Terms' },
  { id: 'contact', title: 'Contact Us' },
]

export default function Terms() {
  const [activeSection, setActiveSection] = useState('acceptance')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    sections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:flex lg:gap-12">

        {/* Table of Contents - Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <div className="sticky top-24">
            <nav className="space-y-1">
              <div className="mb-5 pb-3 border-b-2 border-amber-400">
                <p className="text-xs font-semibold text-purple-900 uppercase tracking-wider">
                  Table of Contents
                </p>
              </div>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-all ${
                    activeSection === section.id
                      ? 'bg-amber-50 text-purple-900 font-semibold border-l-2 border-amber-500'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900 border-l-2 border-transparent'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>

            {/* Print Button */}
            <div className="mt-8">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-purple-900 bg-white border border-purple-200 rounded-md hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Save PDF
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl">

          {/* Header */}
          <header className="mb-12 pb-6 border-b-2 border-amber-400">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full uppercase tracking-wider">
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-purple-900 mb-4">
              Terms of Service
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-purple-900">Last updated:</span>
              <span className="text-amber-600 font-medium">May 18, 2026</span>
            </div>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Please read these Terms of Service ("Terms") carefully before using the Oh My Job platform.
            </p>
          </header>

          {/* Mobile Table of Contents */}
          <nav className="lg:hidden mb-8 p-5 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-900 uppercase tracking-wider mb-3">
              Quick Navigation
            </p>
            <div className="flex flex-wrap gap-2">
              {sections.slice(0, 8).map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="text-xs px-3 py-1.5 bg-white border border-purple-200 rounded-full text-purple-900 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors"
                >
                  {section.title}
                </button>
              ))}
            </div>
          </nav>

          {/* Content Sections */}
          <div className="prose prose-lg max-w-none
            prose-headings:text-purple-900 prose-headings:font-bold
            prose-h1:text-4xl prose-h1:mt-0
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3
            prose-h2:border-b-2 prose-h2:border-amber-400
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-purple-800 prose-h3:font-semibold
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4
            prose-a:text-amber-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-purple-900 prose-strong:font-semibold
            prose-li:text-gray-700 prose-li:my-1
            prose-ul:my-4 prose-ul:space-y-1
            prose-ol:my-4
          ">

            {/* 1. Acceptance */}
            <section id="acceptance" className="scroll-mt-24">
              <h2>1. Acceptance of Terms</h2>
              <p>
                Welcome to Oh My Job. These Terms of Service ("Terms") constitute a legally binding agreement between you ("<strong>User</strong>," "<strong>you</strong>," or "<strong>your</strong>") and Oh My Job, operated by <strong>Bassem SHILI</strong>, a French sole proprietorship (<em>auto-entrepreneur / entreprise individuelle</em>) registered under SIRET No. <strong>884 808 205 00022</strong> ("<strong>Oh My Job</strong>," "<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>").
              </p>
              <p>
                By accessing or using our website located at{' '}
                <a href="https://www.oh-my-job.com">www.oh-my-job.com</a>{' '}
                (the "<strong>Platform</strong>" or "<strong>Service</strong>"), you agree to be bound by these Terms.
                If you do not agree to these Terms, you may not access or use the Platform.
              </p>
              <p>
                These Terms expressly supersede any prior agreements or understandings. If you are accessing or using the Platform on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms, in which case "you" or "your" refers to that entity.
              </p>
            </section>

            {/* 2. Eligibility */}
            <section id="eligibility" className="scroll-mt-24">
              <h2>2. Eligibility</h2>
              <p>You must meet the following eligibility requirements to use our Platform:</p>
              <ul>
                <li>You must be at least <strong>18 years of age</strong> or the age of majority in your jurisdiction</li>
                <li>You must have the legal capacity to enter into binding contracts</li>
                <li>You must not be prohibited from using the Platform under applicable laws</li>
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You must maintain the security of your account credentials</li>
              </ul>
              <p>
                By using the Platform, you represent and warrant that you meet all eligibility requirements.
                Oh My Job reserves the right to refuse service, terminate accounts, or restrict access to the Platform for anyone who fails to meet these requirements.
              </p>
            </section>

            {/* 3. User Accounts */}
            <section id="accounts" className="scroll-mt-24">
              <h2>3. User Accounts</h2>

              <h3>Account Registration</h3>
              <p>To access certain features of the Platform, you must create an account. You agree to:</p>
              <ul>
                <li>Provide accurate and complete registration information</li>
                <li>Promptly update your information to keep it accurate and current</li>
                <li>Maintain the security and confidentiality of your password</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3>Account Types</h3>
              <p>Oh My Job offers different account types:</p>
              <ul>
                <li><strong>Job Seeker Account</strong>: For individuals seeking employment opportunities</li>
                <li><strong>Employer Account</strong>: For companies and recruiters posting jobs</li>
                <li><strong>Free and Premium Tiers</strong>: Various feature sets available with different pricing</li>
              </ul>
              <p>
                You are solely responsible for all actions taken through your account, whether authorized by you or not.
                Oh My Job shall not be liable for any damage arising from your failure to comply with these obligations.
              </p>
            </section>

            {/* 4. Our Role */}
            <section id="platform-role" className="scroll-mt-24">
              <h2>4. Our Role</h2>
              <div className="not-prose bg-amber-50 border-l-4 border-amber-500 p-5 my-6 rounded-r-md">
                <p className="font-semibold text-amber-900 mb-2">Important Notice</p>
                <p className="text-amber-800 leading-relaxed">
                  Oh My Job is a <strong>platform</strong> and <strong>venue</strong> for connecting job seekers with employers.
                  We are <strong>not</strong> an employer, recruiter, or hiring agency. We do not make hiring decisions, and we do not control the terms of employment offered by employers.
                </p>
              </div>
              <p>Oh My Job provides a Service that allows employers to post job openings and job seekers to search and apply for those positions. We do not:</p>
              <ul>
                <li>Employ, hire, or terminate any job seekers</li>
                <li>Verify the accuracy of job postings or employer representations</li>
                <li>Guarantee that any job posting will result in employment</li>
                <li>Control the hiring decisions made by employers</li>
                <li>Monitor or intervene in employment relationships</li>
              </ul>
              <p>
                Any communication or transaction between job seekers and employers is solely between those parties.
                Oh My Job disclaims all liability arising from such interactions.
              </p>
            </section>

            {/* 5. User Content */}
            <section id="user-content" className="scroll-mt-24">
              <h2>5. User Content</h2>

              <h3>Definition of User Content</h3>
              <p>"<strong>User Content</strong>" means any content you submit, post, or display on or through the Platform, including but not limited to:</p>
              <ul>
                <li>Resumes, CVs, and professional profiles</li>
                <li>Job applications and cover letters</li>
                <li>Job postings and descriptions</li>
                <li>Messages and communications</li>
                <li>Reviews, comments, and feedback</li>
                <li>Profile photos and professional images</li>
              </ul>

              <h3>Your Rights and License</h3>
              <p>
                You retain ownership of your User Content. However, by submitting User Content to Oh My Job, you grant us a{' '}
                <strong>worldwide, non-exclusive, royalty-free, sublicensable, and transferable license</strong> to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the Platform and our business operations.
              </p>

              <h3>User Content Representations</h3>
              <p>You represent and warrant that:</p>
              <ul>
                <li>You own or have the necessary rights to your User Content</li>
                <li>Your User Content does not infringe upon the intellectual property rights of any third party</li>
                <li>Your User Content is accurate and truthful</li>
                <li>Your User Content complies with these Terms and all applicable laws</li>
              </ul>
              <p>
                Oh My Job does not pre-screen User Content but reserves the right to remove, edit, or restrict any content that violates these Terms or applicable law.
              </p>
            </section>

            {/* 6. Employer Responsibilities */}
            <section id="employer-terms" className="scroll-mt-24">
              <h2>6. Employer Responsibilities</h2>
              <p>Employers posting jobs on Oh My Job agree to the following additional terms:</p>

              <h3>Compliance with Employment Laws</h3>
              <p>Employers must comply with all applicable federal, state, and local employment laws, including but not limited to:</p>
              <ul>
                <li><strong>Equal Employment Opportunity</strong>: Job postings must not discriminate on the basis of race, color, religion, sex, national origin, age, disability, genetic information, or any other protected characteristic under federal, state, or local law</li>
                <li><strong>Fair Labor Standards Act (FLSA)</strong>: Compliance with minimum wage, overtime, and other wage and hour requirements</li>
                <li><strong>Immigration Reform and Control Act (IRCA)</strong>: Proper verification of employment eligibility</li>
                <li><strong>State and Local Laws</strong>: Compliance with all applicable state and local employment regulations</li>
              </ul>

              <h3>Job Posting Accuracy</h3>
              <p>Employers represent and warrant that:</p>
              <ul>
                <li>Job postings are accurate and describe actual positions</li>
                <li>Compensation details (salary, benefits, equity) are truthful</li>
                <li>Job requirements are job-related and consistent with business necessity</li>
                <li>The employer has the authority to offer the position described</li>
              </ul>

              <h3>Prohibited Employer Practices</h3>
              <p>Employers may NOT:</p>
              <ul>
                <li>Post jobs that do not represent genuine employment opportunities</li>
                <li>Require applicants to pay fees or make purchases as a condition of employment</li>
                <li>Post jobs that discriminate or contain discriminatory language</li>
                <li>Engage in any form of harassment or discriminatory conduct</li>
                <li>Use job postings for purposes other than genuine hiring</li>
              </ul>
            </section>

            {/* 7. Prohibited Activities */}
            <section id="prohibited" className="scroll-mt-24">
              <h2>7. Prohibited Activities</h2>
              <p>You agree not to engage in any of the following prohibited activities:</p>

              <h3>Platform Abuse</h3>
              <ul>
                <li>Scraping, crawling, or automated extraction of data from the Platform</li>
                <li>Attempting to gain unauthorized access to the Platform or its systems</li>
                <li>Interfering with the proper operation of the Platform</li>
                <li>Uploading viruses, malware, or other harmful code</li>
                <li>Attempting to circumvent any security measures or rate limits</li>
              </ul>

              <h3>Content Violations</h3>
              <ul>
                <li>Posting false, misleading, or fraudulent content</li>
                <li>Posting content that infringes upon intellectual property rights</li>
                <li>Posting defamatory, obscene, or hateful content</li>
                <li>Posting content promoting illegal activities</li>
                <li>Spamming or posting repetitive content</li>
              </ul>

              <h3>Prohibited Business Practices</h3>
              <ul>
                <li>Multi-level marketing (MLM) or pyramid scheme opportunities</li>
                <li>Work-at-home schemes or opportunities requiring payment</li>
                <li>Adult entertainment or illegal content</li>
                <li>Gambling or betting services</li>
                <li>Any business or opportunity that violates applicable law</li>
              </ul>

              <p>
                Violation of these prohibitions may result in immediate termination of your account, removal of content, and legal action where appropriate.
              </p>
            </section>

            {/* 8. Fees */}
            <section id="fees" className="scroll-mt-24">
              <h2>8. Fees and Payments</h2>

              <h3>Free Services</h3>
              <p>Oh My Job provides certain basic features free of charge, including:</p>
              <ul>
                <li>Creating a basic job seeker profile</li>
                <li>Searching and viewing job listings</li>
                <li>Posting a limited number of job listings (for employers)</li>
              </ul>

              <h3>Premium Services</h3>
              <p>
                We offer premium subscription plans and add-on services for both job seekers and employers. Current pricing and features are available on our{' '}
                <a href="https://www.oh-my-job.com/pricing">Pricing Page</a>.
              </p>

              <h3>Payment Terms</h3>
              <ul>
                <li>All fees are stated in US dollars</li>
                <li>Payments are non-refundable unless otherwise required by law</li>
                <li>Subscriptions automatically renew unless cancelled at least 30 days before the renewal date</li>
                <li>You authorize us to charge your payment method for all fees incurred</li>
                <li>Taxes may apply and are your responsibility</li>
              </ul>

              <h3>Fee Changes</h3>
              <p>
                Oh My Job reserves the right to modify fees at any time. Any fee change will become effective at the end of your current billing cycle. Your continued use of premium services after a fee change constitutes your agreement to pay the new fees.
              </p>
            </section>

            {/* 9. IP */}
            <section id="intellectual-property" className="scroll-mt-24">
              <h2>9. Intellectual Property Rights</h2>

              <h3>Our Intellectual Property</h3>
              <p>
                The Platform and all content, features, and functionality (including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, software, and code) are owned by Oh My Job and are protected by applicable copyright, trademark, trade secret, and other intellectual property laws.
              </p>
              <p>You may not copy, modify, distribute, sell, lease, or reverse engineer any part of the Platform without our prior written consent.</p>

              <h3>Trademarks</h3>
              <p>"Oh My Job" and our logo are used by Oh My Job as identifying marks of the Platform. You may not use these marks without our prior written permission.</p>

              <h3>Feedback</h3>
              <p>
                If you provide suggestions, ideas, or feedback about the Platform ("Feedback"), you hereby assign to Oh My Job all right, title, and interest in such Feedback, and Oh My Job shall be entitled to use such Feedback without restriction or obligation.
              </p>
            </section>

            {/* 10. DMCA */}
            <section id="dmca" className="scroll-mt-24">
              <h2>10. DMCA Policy</h2>
              <p>
                Oh My Job respects the intellectual property rights of others and expects users to do the same. Although Oh My Job is not a US-based entity, we voluntarily respond to claims of copyright infringement in a manner consistent with the Digital Millennium Copyright Act (DMCA), given our US audience.
              </p>

              <h3>DMCA Notice Procedure</h3>
              <p>If you believe your copyrighted work has been infringed, please provide our Designated Copyright Agent with the following information:</p>
              <ul>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material that is claimed to be infringing and its location</li>
                <li>Your contact information (address, phone, email)</li>
                <li>A statement of your good faith belief that the use is unauthorized</li>
                <li>A statement of the accuracy of the notice, under penalty of perjury</li>
                <li>Your physical or electronic signature</li>
              </ul>

              <h3>DMCA Counter-Notice</h3>
              <p>If you believe your content was wrongly removed, you may submit a counter-notice including:</p>
              <ul>
                <li>Identification of the material removed</li>
                <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
                <li>Your name, address, and consent to the jurisdiction of a judicial district where Oh My Job may be found</li>
              </ul>

              <p>
                Please send copyright notices to:{' '}
                <a href="mailto:contact@oh-my-job.com">contact@oh-my-job.com</a>
              </p>
            </section>

            {/* 11. Disclaimers */}
            <section id="disclaimers" className="scroll-mt-24">
              <h2>11. Disclaimer of Warranties</h2>
              <div className="not-prose bg-purple-900 border-l-4 border-amber-400 p-5 my-6 rounded-r-md shadow-sm">
                <p className="font-bold text-amber-300 uppercase tracking-wider text-sm">
                  Important Legal Notice
                </p>
              </div>
              <p>
                THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. OH MY JOB MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul>
                <li>THE ACCURACY, COMPLETENESS, OR RELIABILITY OF ANY CONTENT OR JOB LISTINGS</li>
                <li>THE AVAILABILITY OR CONTINUOUS OPERATION OF THE PLATFORM</li>
                <li>THAT THE PLATFORM WILL MEET YOUR REQUIREMENTS OR EXPECTATIONS</li>
                <li>THAT EMPLOYERS WILL ACT IN GOOD FAITH OR HONOR ANY COMMITMENTS</li>
                <li>THAT YOU WILL RECEIVE ANY RESPONSE OR EMPLOYMENT AS A RESULT OF USING THE PLATFORM</li>
              </ul>
              <p>
                ANY CONTENT OR MATERIALS YOU DOWNLOAD OR OTHERWISE OBTAIN THROUGH THE PLATFORM ARE AT YOUR OWN RISK. YOU ARE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR COMPUTER SYSTEM OR LOSS OF DATA.
              </p>
            </section>

            {/* 12. Liability */}
            <section id="liability" className="scroll-mt-24">
              <h2>12. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OH MY JOB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:
              </p>
              <ul>
                <li>LOSS OF PROFITS, REVENUE, OR BUSINESS OPPORTUNITIES</li>
                <li>LOSS OF DATA OR INFORMATION</li>
                <li>COSTS OF PROCUREMENT OF SUBSTITUTE SERVICES</li>
                <li>ANY MATTERS ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE PLATFORM</li>
              </ul>
              <p>
                OUR TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) $100 USD OR (B) THE AMOUNTS YOU HAVE PAID TO OH MY JOB IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
              <p>
                THE LIMITATIONS IN THIS SECTION APPLY REGARDLESS OF THE THEORY OF LIABILITY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, AND EVEN IF ANY LIMITED REMEDY FAILS OF ITS ESSENTIAL PURPOSE.
              </p>
            </section>

            {/* 13. Dispute Resolution */}
            <section id="dispute-resolution" className="scroll-mt-24">
              <h2>13. Dispute Resolution</h2>

              <h3>Informal Resolution First</h3>
              <p>
                Before pursuing any formal legal action, you agree to first contact us at{' '}
                <a href="mailto:contact@oh-my-job.com">contact@oh-my-job.com</a>{' '}
                so we can attempt, in good faith, to resolve the dispute informally. Most disagreements can be resolved this way within a reasonable timeframe.
              </p>

              <h3>Exceptions</h3>
              <p>Notwithstanding the foregoing, either party may, without first attempting informal resolution:</p>
              <ul>
                <li>Seek injunctive or other equitable relief for intellectual property infringement</li>
                <li>Bring claims related to unauthorized access or use of the Platform</li>
              </ul>
            </section>

            {/* 14. Governing Law */}
            <section id="governing-law" className="scroll-mt-24">
              <h2>14. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of <strong>France</strong>, without regard to its conflict of law provisions.
              </p>
              <p>
                If a dispute cannot be resolved informally as described above, it shall be submitted to the exclusive jurisdiction of the competent courts of <strong>Saint-Étienne</strong>, France, and you hereby waive any objection to such jurisdiction and venue.
              </p>
              <p>
                If you are a consumer residing outside France, applicable mandatory consumer protection laws of your country of residence may also apply and are not superseded by this clause.
              </p>
            </section>

            {/* 15. Termination */}
            <section id="termination" className="scroll-mt-24">
              <h2>15. Termination</h2>

              <h3>Termination by You</h3>
              <p>You may terminate your account at any time by:</p>
              <ul>
                <li>Contacting our support team at <a href="mailto:contact@oh-my-job.com">contact@oh-my-job.com</a></li>
                <li>Using the account deletion feature in your account settings</li>
              </ul>

              <h3>Termination by Oh My Job</h3>
              <p>
                Oh My Job may terminate or suspend your account, access to the Platform, or any services immediately, without prior notice or liability, for any reason, including but not limited to:
              </p>
              <ul>
                <li>Breach of these Terms</li>
                <li>Violation of applicable laws or regulations</li>
                <li>Fraudulent, illegal, or unauthorized activity</li>
                <li>Non-payment of fees (for premium accounts)</li>
                <li>Extended period of inactivity</li>
              </ul>

              <h3>Effect of Termination</h3>
              <p>
                Upon termination, your right to use the Platform immediately ceases. All provisions of these Terms which by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnification, and limitations of liability.
              </p>
            </section>

            {/* 16. Changes */}
            <section id="changes" className="scroll-mt-24">
              <h2>16. Changes to These Terms</h2>
              <p>Oh My Job reserves the right to modify these Terms at any time. When we make material changes, we will:</p>
              <ul>
                <li>Update the "Last updated" date at the top of these Terms</li>
                <li>Post the revised Terms on the Platform</li>
                <li>Notify you via email or prominent notice for significant changes</li>
              </ul>
              <p>
                Your continued use of the Platform after any such changes constitutes your acceptance of the new Terms. If you do not agree to the revised Terms, you must stop using the Platform.
              </p>
            </section>

            {/* 17. Contact */}
            <section id="contact" className="scroll-mt-24">
              <h2>17. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding these Terms or the Platform, please contact us:
              </p>
              <div className="not-prose bg-gradient-to-br from-purple-50 to-amber-50 border border-purple-200 p-6 rounded-lg mt-6">
                <p className="font-bold text-purple-900 mb-4 text-lg">Oh My Job</p>
                <p className="text-gray-700 mb-1">Operated by Bassem SHILI</p>
                <p className="text-gray-700 mb-1">Auto-entrepreneur — SIRET: 884 808 205 00022</p>
                <p className="text-gray-700 mb-2">27 rue de Plaisance</p>
                <p className="text-gray-700 mb-4">42400 Saint-Chamond, France</p>
                <p className="text-gray-700 mb-2">
                  <strong className="text-purple-900">All Inquiries</strong>:{' '}
                  <a href="mailto:contact@oh-my-job.com" className="text-amber-600 hover:underline">contact@oh-my-job.com</a>
                </p>
              </div>
            </section>

            {/* Footer */}
            <footer className="not-prose mt-16 pt-8 border-t-2 border-amber-400">
              <p className="text-sm text-gray-500">
                © 2026 Oh My Job. All rights reserved. ·{' '}
                <a href="/privacy" className="text-amber-600 hover:underline font-medium">Privacy Policy</a>
                {' · '}
                <a href="/cookies" className="text-amber-600 hover:underline font-medium">Cookie Policy</a>
              </p>
            </footer>

          </div>
        </main>
      </div>
    </div>
  )
}