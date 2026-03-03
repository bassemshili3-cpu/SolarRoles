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
              <p className="text-sm font-semibold text-gray-900 mb-4">
                Table of Contents
              </p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
          <header className="mb-12 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Last updated: March 03, 2026</span>
            </div>
            <p className="mt-4 text-gray-600">
              Please read these Terms of Service ("Terms") carefully before using the Oh My Job platform.
            </p>
          </header>

          {/* Mobile Table of Contents */}
          <nav className="lg:hidden mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Quick Navigation
            </p>
            <div className="flex flex-wrap gap-2">
              {sections.slice(0, 8).map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  {section.title}
                </button>
              ))}
            </div>
          </nav>

          {/* Content Sections */}
          <div className="prose prose-lg prose-blue max-w-none">
            
            <section id="acceptance" className="scroll-mt-24">
              <h2>1. Acceptance of Terms</h2>
              <p>
                Welcome to Oh My Job. These Terms of Service ("Terms") constitute a legally binding agreement between you ("<strong>User</strong>," "<strong>you</strong>," or "<strong>your</strong>") and Oh My Job, Inc. ("<strong>Oh My Job</strong>," "<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>").
              </p>
              <p>
                By accessing or using our website located at <a href="https://www.ohmyjob.com" className="text-blue-600 hover:underline">www.ohmyjob.com</a> (the "<strong>Platform</strong>" or "<strong>Service</strong>"), you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Platform.
              </p>
              <p>
                These Terms expressly supersede any prior agreements or understandings. If you are accessing or using the Platform on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms, in which case "you" or "your" refers to that entity.
              </p>
            </section>

            <section id="eligibility" className="scroll-mt-24">
              <h2>2. Eligibility</h2>
              <p>
                You must meet the following eligibility requirements to use our Platform:
              </p>
              <ul>
                <li>You must be at least <strong>18 years of age</strong> or the age of majority in your jurisdiction</li>
                <li>You must have the legal capacity to enter into binding contracts</li>
                <li>You must not be prohibited from using the Platform under applicable laws</li>
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You must maintain the security of your account credentials</li>
              </ul>
              <p>
                By using the Platform, you represent and warrant that you meet all eligibility requirements. Oh My Job reserves the right to refuse service, terminate accounts, or restrict access to the Platform for anyone who fails to meet these requirements.
              </p>
            </section>

            <section id="accounts" className="scroll-mt-24">
              <h2>3. User Accounts</h2>
              
              <h3>Account Registration</h3>
              <p>
                To access certain features of the Platform, you must create an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate and complete registration information</li>
                <li>Promptly update your information to keep it accurate and current</li>
                <li>Maintain the security and confidentiality of your password</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3>Account Types</h3>
              <p>
                Oh My Job offers different account types:
              </p>
              <ul>
                <li><strong>Job Seeker Account</strong>: For individuals seeking employment opportunities</li>
                <li><strong>Employer Account</strong>: For companies and recruiters posting jobs</li>
                <li><strong>Free and Premium Tiers</strong>: Various feature sets available with different pricing</li>
              </ul>
              <p>
                You are solely responsible for all actions taken through your account, whether authorized by you or not. Oh My Job shall not be liable for any damage arising from your failure to comply with these obligations.
              </p>
            </section>

            <section id="platform-role" className="scroll-mt-24">
              <h2>4. Our Role</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                <p className="font-semibold text-yellow-800">Important Notice</p>
                <p className="text-yellow-700 mt-2">
                  Oh My Job is a <strong>platform</strong> and <strong>venue</strong> for connecting job seekers with employers. We are <strong>not</strong> an employer, recruiter, or hiring agency. We do not make hiring decisions, and we do not control the terms of employment offered by employers.
                </p>
              </div>
              <p>
                Oh My Job provides a Service that allows employers to post job openings and job seekers to search and apply for those positions. We do not:
              </p>
              <ul>
                <li>Employ, hire, or terminate any job seekers</li>
                <li>Verify the accuracy of job postings or employer representations</li>
                <li>Guarantee that any job posting will result in employment</li>
                <li>Control the hiring decisions made by employers</li>
                <li>Monitor or intervene in employment relationships</li>
              </ul>
              <p>
                Any communication or transaction between job seekers and employers is solely between those parties. Oh My Job disclaims all liability arising from such interactions.
              </p>
            </section>

            <section id="user-content" className="scroll-mt-24">
              <h2>5. User Content</h2>
              
              <h3>Definition of User Content</h3>
              <p>
                "<strong>User Content</strong>" means any content you submit, post, or display on or through the Platform, including but not limited to:
              </p>
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
                You retain ownership of your User Content. However, by submitting User Content to Oh My Job, you grant us a <strong>worldwide, non-exclusive, royalty-free, sublicensable, and transferable license</strong> to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the Platform and our business operations.
              </p>

              <h3>User Content Representations</h3>
              <p>
                You represent and warrant that:
              </p>
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

            <section id="employer-terms" className="scroll-mt-24">
              <h2>6. Employer Responsibilities</h2>
              <p>
                Employers posting jobs on Oh My Job agree to the following additional terms:
              </p>

              <h3>Compliance with Employment Laws</h3>
              <p>
                Employers must comply with all applicable federal, state, and local employment laws, including but not limited to:
              </p>
              <ul>
                <li><strong>Equal Employment Opportunity</strong>: Job postings must not discriminate on the basis of race, color, religion, sex, national origin, age, disability, genetic information, or any other protected characteristic under federal, state, or local law</li>
                <li><strong>Fair Labor Standards Act (FLSA)</strong>: Compliance with minimum wage, overtime, and other wage and hour requirements</li>
                <li><strong>Immigration Reform and Control Act (IRCA)</strong>: Proper verification of employment eligibility</li>
                <li><strong>State and Local Laws</strong>: Compliance with all applicable state and local employment regulations</li>
              </ul>

              <h3>Job Posting Accuracy</h3>
              <p>
                Employers represent and warrant that:
              </p>
              <ul>
                <li>Job postings are accurate and describe actual positions</li>
                <li>Compensation details (salary, benefits, equity) are truthful</li>
                <li>Job requirements are job-related and consistent with business necessity</li>
                <li>The employer has the authority to offer the position described</li>
              </ul>

              <h3>Prohibited Employer Practices</h3>
              <p>
                Employers may NOT:
              </p>
              <ul>
                <li>Post jobs that do not represent genuine employment opportunities</li>
                <li>Require applicants to pay fees or make purchases as a condition of employment</li>
                <li>Post jobs that discriminate or contain discriminatory language</li>
                <li>Engage in any form of harassment or discriminatory conduct</li>
                <li>Use job postings for purposes other than genuine hiring</li>
              </ul>
            </section>

            <section id="prohibited" className="scroll-mt-24">
              <h2>7. Prohibited Activities</h2>
              <p>
                You agree not to engage in any of the following prohibited activities:
              </p>
              
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

            <section id="fees" className="scroll-mt-24">
              <h2>8. Fees and Payments</h2>
              
              <h3>Free Services</h3>
              <p>
                Oh My Job provides certain basic features free of charge, including:
              </p>
              <ul>
                <li>Creating a basic job seeker profile</li>
                <li>Searching and viewing job listings</li>
                <li>Posting a limited number of job listings (for employers)</li>
              </ul>

              <h3>Premium Services</h3>
              <p>
                We offer premium subscription plans and add-on services for both job seekers and employers. Current pricing and features are available on our <a href="https://www.ohmyjob.com/pricing" className="text-blue-600 hover:underline">Pricing Page</a>.
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

            <section id="intellectual-property" className="scroll-mt-24">
              <h2>9. Intellectual Property Rights</h2>
              
              <h3>Our Intellectual Property</h3>
              <p>
                The Platform and all content, features, and functionality (including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, software, and code) are owned by Oh My Job, Inc. and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                You may not copy, modify, distribute, sell, lease, or reverse engineer any part of the Platform without our prior written consent.
              </p>

              <h3>Trademarks</h3>
              <p>
                "Oh My Job" and our logo are trademarks of Oh My Job, Inc. You may not use these marks without our prior written permission.
              </p>

              <h3>Feedback</h3>
              <p>
                If you provide suggestions, ideas, or feedback about the Platform ("Feedback"), you hereby assign to Oh My Job all right, title, and interest in such Feedback, and Oh My Job shall be entitled to use such Feedback without restriction or obligation.
              </p>
            </section>

            <section id="dmca" className="scroll-mt-24">
              <h2>10. DMCA Policy</h2>
              <p>
                Oh My Job respects the intellectual property rights of others and expects users to do the same. We will respond to claims of copyright infringement in accordance with the Digital Millennium Copyright Act (DMCA).
              </p>

              <h3>DMCA Notice Procedure</h3>
              <p>
                If you believe your copyrighted work has been infringed, please provide our Designated Copyright Agent with the following information:
              </p>
              <ul>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material that is claimed to be infringing and its location</li>
                <li>Your contact information (address, phone, email)</li>
                <li>A statement of your good faith belief that the use is unauthorized</li>
                <li>A statement of the accuracy of the notice, under penalty of perjury</li>
                <li>Your physical or electronic signature</li>
              </ul>

              <h3>DMCA Counter-Notice</h3>
              <p>
                If you believe your content was wrongly removed, you may submit a counter-notice including:
              </p>
              <ul>
                <li>Identification of the material removed</li>
                <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
                <li>Your name, address, and consent to jurisdiction in the US</li>
              </ul>

              <p>
                Please send DMCA notices to: <a href="mailto:copyright@ohmyjob.com" className="text-blue-600 hover:underline">copyright@ohmyjob.com</a>
              </p>
            </section>

            <section id="disclaimers" className="scroll-mt-24">
              <h2>11. Disclaimer of Warranties</h2>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg my-6">
                <p className="font-semibold text-gray-900">IMPORTANT LEGAL NOTICE</p>
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
                OUR TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) \$100 USD OR (B) THE AMOUNTS YOU HAVE PAID TO OH MY JOB IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
              <p>
                THE LIMITATIONS IN THIS SECTION APPLY REGARDLESS OF THE THEORY OF LIABILITY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, AND EVEN IF ANY LIMITED REMEDY FAILS OF ITS ESSENTIAL PURPOSE.
              </p>
            </section>

            <section id="dispute-resolution" className="scroll-mt-24">
              <h2>13. Dispute Resolution</h2>
              
              <h3>Mandatory Arbitration</h3>
              <p>
                <strong>YOU AND OH MY JOB AGREE THAT ANY DISPUTE, CLAIM, OR CONTROVERSY ARISING OUT OF OR RELATING TO THESE TERMS OR THE BREACH, TERMINATION, ENFORCEMENT, INTERPRETATION, OR VALIDITY THEREOF SHALL BE RESOLVED BY BINDING ARBITRATION</strong> administered by the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules.
              </p>
              <p>
                The arbitration shall be conducted in <strong>[YOUR STATE]</strong>, and judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof.
              </p>

              <h3>Waiver of Jury Trial and Class Action</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                <p className="font-semibold text-yellow-800">Waiver of Rights</p>
                <p className="text-yellow-700 mt-2">
                  <strong>BY AGREEING TO THESE TERMS, YOU WAIVE YOUR RIGHT TO A TRIAL BY JURY AND YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, OR OTHER REPRESENTATIVE PROCEEDING.</strong>
                </p>
              </div>

              <h3>Exceptions</h3>
              <p>
                Notwithstanding the foregoing, either party may:
              </p>
              <ul>
                <li>Bring an action in small claims court for disputes within the jurisdictional limits</li>
                <li>Seek injunctive or other equitable relief for intellectual property infringement</li>
                <li>Bring claims related to unauthorized access or use of the Platform</li>
              </ul>
            </section>

            <section id="governing-law" className="scroll-mt-24">
              <h2>14. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the <strong>State of [Delaware/California/New York]</strong>, without regard to its conflict of law provisions.
              </p>
              <p>
                For any dispute not subject to arbitration as described above, you agree to submit to the exclusive jurisdiction of the state and federal courts located in <strong>[County], [State]</strong>, and you hereby waive any objection to such jurisdiction and venue.
              </p>
            </section>

            <section id="termination" className="scroll-mt-24">
              <h2>15. Termination</h2>
              
              <h3>Termination by You</h3>
              <p>
                You may terminate your account at any time by:
              </p>
              <ul>
                <li>Contacting our support team at <a href="mailto:support@ohmyjob.com" className="text-blue-600 hover:underline">support@ohmyjob.com</a></li>
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

            <section id="changes" className="scroll-mt-24">
              <h2>16. Changes to These Terms</h2>
              <p>
                Oh My Job reserves the right to modify these Terms at any time. When we make material changes, we will:
              </p>
              <ul>
                <li>Update the "Last updated" date at the top of these Terms</li>
                <li>Post the revised Terms on the Platform</li>
                <li>Notify you via email or prominent notice for significant changes</li>
              </ul>
              <p>
                Your continued use of the Platform after any such changes constitutes your acceptance of the new Terms. If you do not agree to the revised Terms, you must stop using the Platform.
              </p>
            </section>

            <section id="contact" className="scroll-mt-24">
              <h2>17. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding these Terms or the Platform, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-6">
                <p className="font-semibold text-gray-900 mb-4">Oh My Job, Inc.</p>
                <p className="text-gray-700 mb-2">[Street Address]</p>
                <p className="text-gray-700 mb-4">[City, State ZIP]</p>
                <p className="text-gray-700 mb-2">
                  <strong>General Inquiries</strong>: <a href="mailto:hello@ohmyjob.com" className="text-blue-600 hover:underline">hello@ohmyjob.com</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Support</strong>: <a href="mailto:support@ohmyjob.com" className="text-blue-600 hover:underline">support@ohmyjob.com</a>
                </p>
                <p className="text-gray-700">
                  <strong>Legal</strong>: <a href="mailto:legal@ohmyjob.com" className="text-blue-600 hover:underline">legal@ohmyjob.com</a>
                </p>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                © 2026 Oh My Job, Inc. All rights reserved. | <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> | <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>
              </p>
            </footer>

          </div>
        </main>
      </div>
    </div>
  )
}