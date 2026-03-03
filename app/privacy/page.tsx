"use client"
import { useState, useEffect } from 'react'

interface Section {
  id: string
  title: string
}

const sections: Section[] = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-collected', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Information' },
  { id: 'sharing-disclosure', title: 'Sharing & Disclosure' },
  { id: 'cookies-tracking', title: 'Cookies & Tracking' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'children-privacy', title: 'Children\'s Privacy' },
  { id: 'us-rights', title: 'US State Privacy Rights' },
  { id: 'gdpr-rights', title: 'GDPR Rights' },
  { id: 'international', title: 'International Transfers' },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact Us' },
]

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('introduction')

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
            
            {/* Quick Actions */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">
                California Residents
              </p>
              <p className="text-xs text-gray-600 mb-3">
                Under CCPA/CPRA, you have the right to opt-out of the sale of your personal information.
              </p>
              <a
                href="mailto:privacy@ohmyjob.com?subject=Do+Not+Sell+My+Personal+Information"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Do Not Sell My Info
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl">
          {/* Header */}
          <header className="mb-12 pb-6 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Last updated: March 03, 2026</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                CCPA Compliant
              </span>
            </div>
          </header>

          {/* Mobile Table of Contents */}
          <nav className="lg:hidden mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Quick Navigation
            </p>
            <div className="flex flex-wrap gap-2">
              {sections.slice(0, 6).map((section) => (
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
            
            <section id="introduction" className="scroll-mt-24">
              <h2>Introduction</h2>
              <p>
                Oh My Job, Inc. ("<strong>Oh My Job</strong>," "<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>") operates the website located at <a href="https://www.ohmyjob.com" className="text-blue-600 hover:underline">www.ohmyjob.com</a> (the "<strong>Service</strong>"). We are committed to protecting your privacy and ensuring you understand how we collect, use, disclose, and safeguard your personal information.
              </p>
              <p>
                This Privacy Policy describes our practices in connection with information that we or our service providers collect through the Service. It applies to all users of our Service, including job seekers, employers, recruiters, and visitors (collectively, "<strong>Users</strong>" or "<strong>you</strong>").
              </p>
              <p>
                By accessing or using our Service, you agree to this Privacy Policy. If you do not agree with the terms of this policy, please do not access our Service.
              </p>
            </section>

            <section id="information-collected" className="scroll-mt-24">
              <h2>Information We Collect</h2>
              
              <h3>Personal Information You Provide</h3>
              <p>We collect personal information that you voluntarily provide to us when you:</p>
              <ul>
                <li><strong>Create an account</strong>: Name, email address, phone number, and password</li>
                <li><strong>Submit your resume/CV</strong>: Work history, education, skills, certifications, salary expectations, and other career-related information</li>
                <li><strong>Complete your profile</strong>: Professional summary, preferences, work authorization status, and geographic location</li>
                <li><strong>Apply for jobs</strong>: Additional information required by employers for specific positions</li>
                <li><strong>Communicate with us</strong>: Information included in your messages, support requests, or survey responses</li>
                <li><strong>Subscribe to newsletters</strong>: Email address and communication preferences</li>
              </ul>

              <h3>Information Collected Automatically</h3>
              <p>When you access or use our Service, we automatically collect certain information, including:</p>
              <ul>
                <li><strong>Device information</strong>: Device type, operating system, browser type, unique device identifiers (such as IP address, IDFA, GAID)</li>
                <li><strong>Usage data</strong>: Pages visited, time spent on pages, links clicked, search queries, and interaction patterns</li>
                <li><strong>Location data</strong>: General geographic location (city, state) derived from IP address</li>
                <li><strong>Log data</strong>: Access times, referring/exit pages, and crash reports</li>
              </ul>

              <h3>Information from Third Parties</h3>
              <p>We may receive information about you from third-party sources, including:</p>
              <ul>
                <li><strong>LinkedIn</strong>: When you choose to import profile data or log in via LinkedIn</li>
                <li><strong>Google</strong>: When you choose to log in via Google</li>
                <li><strong>Employers</strong>: Feedback or information shared by employers regarding your applications</li>
                <li><strong>Background check services</strong>: With your consent, verification of credentials and employment history</li>
              </ul>
            </section>

            <section id="how-we-use" className="scroll-mt-24">
              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              
              <h3>Core Service Functions</h3>
              <ul>
                <li><strong>Provide matching services</strong>: Connect job seekers with relevant job opportunities based on skills, experience, and preferences</li>
                <li><strong>Facilitate applications</strong>: Process and forward job applications to employers</li>
                <li><strong>Enable employer searches</strong>: Allow employers to search and review candidate profiles</li>
                <li><strong>Communicate with you</strong>: Send job alerts, application updates, and service-related notifications</li>
                <li><strong>Customer support</strong>: Respond to your inquiries and provide technical assistance</li>
              </ul>

              <h3>Service Improvement</h3>
              <ul>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Develop new features and functionality</li>
                <li>Conduct research and analytics to understand job market trends</li>
                <li>Debug and resolve technical issues</li>
              </ul>

              <h3>Marketing and Communications</h3>
              <ul>
                <li>Send promotional emails about new jobs, career advice, and our services (you may opt-out at any time)</li>
                <li>Personalize content and recommendations based on your profile and activity</li>
                <li>Measure and analyze advertising effectiveness</li>
              </ul>

              <h3>Legal and Security</h3>
              <ul>
                <li>Comply with legal obligations and respond to lawful requests</li>
                <li>Enforce our terms of service and other policies</li>
                <li>Detect, prevent, and address fraud, unauthorized access, or other illegal activities</li>
                <li>Protect the rights, property, or safety of Oh My Job, our users, or others</li>
              </ul>
            </section>

            <section id="sharing-disclosure" className="scroll-mt-24">
              <h2>Sharing and Disclosure of Information</h2>
              
              <h3>We Do NOT Sell Your Personal Information</h3>
              <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                <strong>Important:</strong> Oh My Job does not sell your personal information for monetary consideration. We do not share your personal information with third parties for their direct marketing purposes.
              </p>

              <h3>When We Share Information</h3>
              <p>We may share your information in the following circumstances:</p>

              <h4>With Employers and Recruiters</h4>
              <ul>
                <li>When you apply for a position, your application materials (resume, profile, responses) are shared with the posting employer</li>
                <li>When employers search our database, they may view profiles that match their criteria (name, experience, skills – you control what employers can see in your privacy settings)</li>
              </ul>

              <h4>With Service Providers</h4>
              <p>We engage third-party companies and individuals to help operate, improve, and maintain our Service:</p>
              <ul>
                <li><strong>Cloud hosting</strong>: AWS, Google Cloud for data storage</li>
                <li><strong>Analytics</strong>: Google Analytics, Mixpanel for usage analytics</li>
                <li><strong>Email services</strong>: SendGrid, Mailchimp for transactional and promotional emails</li>
                <li><strong>Customer support</strong>: Zendesk for support ticket management</li>
                <li><strong>Payment processing</strong>: Stripe for any paid services</li>
              </ul>

              <h4>Legal Requirements</h4>
              <p>We may disclose information when required by law, regulation, or legal process, including:</p>
              <ul>
                <li>Responding to subpoenas, court orders, or other legal requests</li>
                <li>Cooperating with law enforcement investigations</li>
                <li>Establishing or exercising our legal rights or defending against legal claims</li>
              </ul>

              <h4>Business Transfers</h4>
              <p>In the event of a merger, acquisition, restructuring, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our website of any such change in ownership or control.</p>
            </section>

            <section id="cookies-tracking" className="scroll-mt-24">
              <h2>Cookies and Tracking Technologies</h2>
              
              <h3>Types of Cookies We Use</h3>
              <ul>
                <li><strong>Essential cookies</strong>: Required for basic site functionality, account authentication, and security</li>
                <li><strong>Analytics cookies</strong>: Help us understand how visitors navigate and use our site</li>
                <li><strong>Functional cookies</strong>: Remember your preferences and customize your experience</li>
                <li><strong>Advertising cookies</strong>: Used to deliver relevant job advertisements (you may opt-out via your browser settings)</li>
              </ul>

              <h3>Third-Party Analytics</h3>
              <p>We use third-party analytics tools, including Google Analytics, to collect and analyze usage data. These tools may collect information sent by your browser as part of a web page request, including cookies and your IP address.</p>

              <h3>Global Privacy Control (GPC)</h3>
              <p>We honor browser "Do Not Track" signals and Global Privacy Control (GPC) signals. When we detect a GPC signal from your browser, we will automatically treat it as a request to opt-out of the sale or sharing of your personal information.</p>

              <h3>Managing Cookies</h3>
              <p>You can manage or disable cookies through your browser settings. Please note that blocking essential cookies may affect the functionality of our Service.</p>
            </section>

            <section id="data-security" className="scroll-mt-24">
              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul>
                <li><strong>Encryption</strong>: SSL/TLS encryption for all data transmitted between your browser and our servers</li>
                <li><strong>Access controls</strong>: Role-based access controls limiting employee access to personal information</li>
                <li><strong>Regular security audits</strong>: Ongoing assessment of our security practices</li>
                <li><strong>Secure data centers</strong>: Storage of data in secure, SOC 2-compliant data centers</li>
              </ul>
              <p>
                While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security. If you have reason to believe that your account is no longer secure, please contact us immediately at <a href="mailto:security@ohmyjob.com" className="text-blue-600 hover:underline">security@ohmyjob.com</a>.
              </p>
            </section>

            <section id="children-privacy" className="scroll-mt-24">
              <h2>Children's Privacy</h2>
              <p>
                Our Service is not intended for children under 13 years of age (or 16 in certain jurisdictions). We do not knowingly collect personal information from children under 13 (or 16). If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us at <a href="mailto:privacy@ohmyjob.com" className="text-blue-600 hover:underline">privacy@ohmyjob.com</a>. If we become aware that we have collected personal information from a child without verified parental consent, we will take steps to remove that information from our systems.
              </p>
            </section>

            <section id="us-rights" className="scroll-mt-24">
              <h2>US State Privacy Rights</h2>
              
              <p>
                If you are a resident of certain US states, you may have additional privacy rights under applicable state laws. These rights are in addition to those described elsewhere in this policy.
              </p>

              <h3>California Privacy Rights (CCPA/CPRA)</h3>
              <p>
                If you are a California resident, the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA) grant you specific rights regarding your personal information:
              </p>
              <ul>
                <li><strong>Right to Know</strong>: You may request that we disclose what personal information we collect, use, and share about you</li>
                <li><strong>Right to Delete</strong>: You may request deletion of your personal information, subject to certain exceptions</li>
                <li><strong>Right to Correct</strong>: You may request correction of inaccurate personal information</li>
                <li><strong>Right to Opt-Out</strong>: You may opt-out of the sale or "sharing" of your personal information (as defined under CPRA)</li>
                <li><strong>Right to Limit Use</strong>: You may limit our use of "sensitive personal information"</li>
                <li><strong>Right to Non-Discrimination</strong>: We will not discriminate against you for exercising your privacy rights</li>
              </ul>

              <h4>Exercising Your California Rights</h4>
              <p>To exercise any of these rights, please contact us:</p>
              <ul>
                <li><strong>Email</strong>: <a href="mailto:privacy@ohmyjob.com" className="text-blue-600 hover:underline">privacy@ohmyjob.com</a></li>
                <li><strong>Mail</strong>: Oh My Job, Inc., Attn: Privacy Rights, [27 Rue de Plaisance], [42400 Saint-Chamond, France]</li>
                <li><strong>Phone</strong>: +33601030849</li>
              </ul>
              <p>
                For opt-out requests specifically, you may also use our <a href="mailto:privacy@ohmyjob.com?subject=Do+Not+Sell+My+Personal+Information" className="text-blue-600 hover:underline">Do Not Sell My Personal Information</a> form.
              </p>
              <p>
                We will verify your request by asking for information that matches the information we have on file. You may also designate an authorized agent to make requests on your behalf.
              </p>

              <h3>Other US State Privacy Laws</h3>
              <p>
                Residents of Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), Utah (UCPA), and other states with enacted privacy laws may have similar rights, including the right to access, delete, and correct their personal information, and the right to opt-out of certain data processing activities.
              </p>
            </section>

            <section id="gdpr-rights" className="scroll-mt-24">
              <h2>GDPR Rights (European Union Residents)</h2>
              <p>
                If you are located in the European Economic Area (EEA) or United Kingdom (UK), you have certain rights under the General Data Protection Regulation (GDPR) and UK GDPR:
              </p>
              <ul>
                <li><strong>Right to Access</strong>: You may obtain confirmation as to whether we process your personal data and access your data</li>
                <li><strong>Right to Rectification</strong>: You may request correction of inaccurate personal data</li>
                <li><strong>Right to Erasure</strong>: You may request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Right to Restriction</strong>: You may request restriction of processing</li>
                <li><strong>Right to Portability</strong>: You may receive your data in a structured, commonly used, machine-readable format</li>
                <li><strong>Right to Object</strong>: You may object to processing based on legitimate interests or for direct marketing</li>
                <li><strong>Rights related to automated decision-making</strong>: You have the right not to be subject to decisions based solely on automated processing that significantly affect you</li>
              </ul>
              <p>
                Our legal basis for processing your personal information includes:
              </p>
              <ul>
                <li><strong>Performance of a contract</strong>: To provide our services as requested</li>
                <li><strong>Consent</strong>: Where you have provided consent for specific processing activities</li>
                <li><strong>Legitimate interests</strong>: To improve our services and detect fraud</li>
              </ul>
              <p>
                To exercise your GDPR rights, please contact us at <a href="mailto:privacy@ohmyjob.com" className="text-blue-600 hover:underline">privacy@ohmyjob.com</a>. You also have the right to lodge a complaint with a supervisory authority.
              </p>
            </section>

            <section id="international" className="scroll-mt-24">
              <h2>International Data Transfers</h2>
              <p>
                Oh My Job is headquartered in the United States. Your information may be transferred to, stored, and processed in the United States and other countries where we or our service providers operate. These countries may have data protection laws that differ from those in your jurisdiction.
              </p>
              <p>
                For transfers from the EEA/UK to the United States, we rely on appropriate safeguards, including Standard Contractual Clauses (SCCs) approved by the European Commission, or other legally available mechanisms. By using our Service, you consent to the transfer of your information to the United States.
              </p>
            </section>

            <section id="changes" className="scroll-mt-24">
              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal requirements. When we make material changes, we will:
              </p>
              <ul>
                <li>Update the "Last updated" date at the top of this policy</li>
                <li>Post the revised policy on this page</li>
                <li>Notify you via email or prominent notice on our Service for significant changes</li>
              </ul>
              <p>
                We encourage you to review this Privacy Policy periodically to stay informed about our data practices. Your continued use of the Service after any changes indicates your acceptance of the updated policy.
              </p>
            </section>

            <section id="contact" className="scroll-mt-24">
              <h2>Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-6">
                <p className="font-semibold text-gray-900 mb-4">Oh My Job, Inc.</p>
                <p className="text-gray-700 mb-2">[Street Address]</p>
                <p className="text-gray-700 mb-4">[City, State ZIP]</p>
                <p className="text-gray-700 mb-2">
                  <strong>Email</strong>: <a href="mailto:privacy@ohmyjob.com" className="text-blue-600 hover:underline">privacy@ohmyjob.com</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>General Inquiries</strong>: <a href="mailto:hello@ohmyjob.com" className="text-blue-600 hover:underline">hello@ohmyjob.com</a>
                </p>
                <p className="text-gray-700">
                  <strong>Security Concerns</strong>: <a href="mailto:security@ohmyjob.com" className="text-blue-600 hover:underline">security@ohmyjob.com</a>
                </p>
              </div>
              <p className="mt-6 text-sm text-gray-600">
                For California residents: You may also contact the California Attorney General at <a href="https://oag.ca.gov/contact/consumer-complaint-against-business-or-company" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://oag.ca.gov/contact/consumer-complaint-against-business-or-company</a>.
              </p>
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}