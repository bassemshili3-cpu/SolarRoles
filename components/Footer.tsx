import Link from 'next/link'

export default function Footer() {
  const jobs = [
    { href: '/solar-pv-installer-jobs', label: 'Solar PV Installer' },
    { href: '/solar-technician-jobs', label: 'Solar Technician' },
    { href: '/lead-solar-installer-jobs', label: 'Lead Installer' },
    { href: '/solar-electrician-jobs', label: 'Solar Electrician' },
    { href: '/bess-technician-jobs', label: 'BESS Technician' },
    { href: '/solar-engineer-jobs', label: 'Solar Engineer' },
    { href: '/solar-sales-jobs', label: 'Solar Sales' },
    { href: '/solar-jobs-no-experience', label: 'No Experience' },
  ]
  const certifications = [
    { href: '/certifications/nabcep-pv-associate', label: 'NABCEP PV Associate' },
    { href: '/certifications/nabcep-pv-installation-professional', label: 'NABCEP PVIP' },
    { href: '/certifications/nabcep-pv-installer-specialist', label: 'NABCEP PVIS' },
    { href: '/certifications/osha-10', label: 'OSHA 10' },
    { href: '/certifications/osha-30', label: 'OSHA 30' },
  ]
  const resources = [
    { href: '/resources/how-to-become-a-solar-installer', label: 'Become a Solar Installer' },
    { href: '/resources/solar-certifications-by-job-role', label: 'Certifications by Job Role' },
    { href: '/resources/how-to-get-nabcep-certified', label: 'Get NABCEP Certified' },
    { href: '/resources/how-to-get-a-solar-apprenticeship', label: 'Solar Apprenticeship' },
    { href: '/resources/osha-safety-guide-solar-installers', label: 'OSHA Safety Guide' },
  ]
  return (
    <footer className="border-t bg-muted/50 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        <div>
          <div className="font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">About Us</Link></li>
            <li><Link href="/blog" className="hover:underline">Blog</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Jobs by Role</div>
          <ul className="space-y-2 text-sm">
            {jobs.map((j) => (
              <li key={j.href}><Link href={j.href} className="hover:underline">{j.label} Jobs</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Data &amp; Tools</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/data" className="hover:underline">Job Market Data</Link></li>
            <li><Link href="/data/salaries/solar-photovoltaic-installer" className="hover:underline">Installer Salary</Link></li>
            <li><Link href="/data/salaries/solar-technician" className="hover:underline">Technician Salary</Link></li>
            <li><Link href="/data/salaries/solar-electrician" className="hover:underline">Electrician Salary</Link></li>
            <li><Link href="/paycheck-calculator" className="hover:underline">Paycheck Calculator</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Certifications</div>
          <ul className="space-y-2 text-sm">
            {certifications.map((c) => (
              <li key={c.href}><Link href={c.href} className="hover:underline">{c.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Resources</div>
          <ul className="space-y-2 text-sm">
            {resources.map((r) => (
              <li key={r.href}><Link href={r.href} className="hover:underline">{r.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Legal</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/ccpa" className="hover:underline">California Privacy Rights</Link></li>
            <li><Link href="/cookie-policy" className="hover:underline">Cookie Policy</Link></li>
          </ul>
          <div className="font-semibold mt-6 mb-2">For Employers</div>
          <Link href="/dashboard/post-a-job-free" className="text-sm hover:underline">
            Post a Job
          </Link>
        </div>
      </div>
    </footer>
  )
}