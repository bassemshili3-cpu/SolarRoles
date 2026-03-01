import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div>
          <div className="font-bold text-xl mb-3">Oh My Job</div>
          <p className="text-sm text-muted-foreground">Premium job search for the United States</p>
        </div>
        <div>
          <div className="font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">About Us</Link></li>
            <li><Link href="/blog" className="hover:underline">Blog</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Legal</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/ccpa" className="hover:underline">California Privacy Rights</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">For Employers</div>
          <Link href="/dashboard/employer" className="text-sm hover:underline">Post a Job • Sponsored</Link>
        </div>
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Oh My Job, Inc. All rights reserved.<br />
          Made with ❤️ for American job seekers.
        </div>
      </div>
    </footer>
  )
}