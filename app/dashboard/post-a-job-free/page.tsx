import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Users, BarChart3, CheckCircle2 } from 'lucide-react'

const CANONICAL_URL = 'https://www.oh-my-job.com/dashboard/post-a-job-free'

export const metadata: Metadata = {
  title: 'Post a Job for Free | Oh My Job',
  description:
    'Post your job on Oh My Job for free and reach fresh grads, career changers, and job seekers across the US. No credit card, no subscription.',
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: 'Post a Job for Free | Oh My Job',
    description: 'Reach thousands of active US job seekers. Post your job for free — no credit card required.',
    url: CANONICAL_URL,
    siteName: 'Oh My Job',
    type: 'website',
    images: [
      {
        url: 'https://www.oh-my-job.com/og-employer.png',
        width: 1200,
        height: 630,
        alt: 'Post a job for free on Oh My Job',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Post a Job for Free | Oh My Job',
    description: 'Reach thousands of active US job seekers. Post your job for free.',
  },
}

const steps = [
  { title: 'Sign in', description: 'Create your employer account in seconds.' },
  { title: 'Post your job', description: 'Fill in the title, location, salary range and description.' },
  { title: 'Track results', description: 'Follow clicks and applications live from your dashboard.' },
]

const benefits = [
  { icon: Zap, title: 'Free, really', description: 'No credit card, no subscription, no hidden fees. Post as many jobs as you want.' },
  { icon: Users, title: 'Reach the right people', description: 'Fresh grads, career changers, and people returning to the workforce actively browse Oh My Job.' },
  { icon: BarChart3, title: 'Track everything', description: 'See clicks and applications on every job you post, in real time.' },
  { icon: CheckCircle2, title: 'Live in minutes', description: 'No approval queue — your job goes live as soon as you post it.' },
]

const faqs = [
  {
    question: 'Is it really free to post a job on Oh My Job?',
    answer: 'Yes. Posting a job on Oh My Job is completely free, with no credit card required and no hidden fees.',
  },
  {
    question: 'How long does my job listing stay active?',
    answer: 'Your listing stays live for 30 days. You can repost it anytime from your dashboard.',
  },
  {
    question: 'Do I need an account to post a job?',
    answer: 'Yes, you need to sign in to post and manage your listings and track their performance.',
  },
  {
    question: 'Can I edit or remove my job listing after posting it?',
    answer: 'Yes, you can edit or remove any of your listings anytime from your employer dashboard.',
  },
]

export default function EmployerPage() {
  return (
    <div>
      {/* FAQ structured data for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }),
        }}
      />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-[#1a2340] mb-6">
          Post your job for free on Oh My Job
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Reach fresh grads, career changers, and people ready to work. No credit card needed. 
        </p>
        <Button size="lg" asChild>
          <Link href="/auth/login">Post a job for free</Link>
        </Button>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-[#1a2340] mb-10 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 font-bold flex items-center justify-center mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-[#1a2340] mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1a2340] mb-10 text-center">Why post with Oh My Job</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <benefit.icon className="text-teal-600 mb-3" size={24} />
                <h3 className="text-lg font-semibold text-[#1a2340] mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-[#1a2340] mb-10 text-center">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="bg-white border border-gray-100 rounded-2xl p-6 group">
              <summary className="font-semibold text-[#1a2340] cursor-pointer list-none flex justify-between items-center">
                {faq.question}
                <span className="text-teal-600 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-muted-foreground mt-3">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#1a2340] mb-4">Ready to hire?</h2>
        <p className="text-muted-foreground mb-8">Your next great hire is one free job post away.</p>
        <Button size="lg" asChild>
          <Link href="/auth/login?redirectTo=/dashboard/employer">Post a job for free</Link>
        </Button>
      </section>
    </div>
  )
}