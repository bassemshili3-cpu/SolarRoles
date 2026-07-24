import type { Metadata } from 'next'

import Link from 'next/link'

import { Button } from '@/components/ui/button'

import {

  Zap,

  Users,

  BarChart3,

  CheckCircle2,

  DollarSign,

  Building2,

  Globe2,

  Sparkles,

  Clock,

  ShieldCheck,

} from 'lucide-react'


const CANONICAL_URL = 'https://www.oh-my-job.com/dashboard/post-a-job-free'


export const metadata: Metadata = {

  title: 'Post a Job for Free — No Credit Card, No Subscription | Oh My Job',

  description:

    'Post a job for free on Oh My Job and reach thousands of US job seekers, from fresh grads to career changers. No credit card. No subscription. Your listing goes live in minutes.',

  keywords: [

    'post a job for free',

    'free job posting',

    'free job board',

    'post jobs online free',

    'free job listing site',

    'post a job no credit card',

    'hire employees online',

    'small business hiring',

    'startup hiring',

    'free hiring platform',

  ],

  alternates: {

    canonical: CANONICAL_URL,

  },

  robots: { index: true, follow: true },

  openGraph: {

    title: 'Post a Job for Free — No Credit Card | Oh My Job',

    description:

      'Reach thousands of active US job seekers. Post a job for free on Oh My Job — no credit card, no subscription, live in minutes.',

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

    title: 'Post a Job for Free — No Credit Card | Oh My Job',

    description:

      'Reach thousands of active US job seekers. Post a job for free with no subscription.',

  },

}


const steps = [

  {

    title: 'Create your free employer account',

    description:

      'Sign up with your work email in under a minute. ',

  },

  {

    title: 'Post your job in five minutes',

    description:

      'Add the title, location, salary range, and a description. You can also import an existing posting from another board.',

  },

  {

    title: 'Track applications in real time',

    description:

      'Keep track of key statistics from your employer dashboard as candidates apply.',

  },

]


const benefits = [

  {

    icon: DollarSign,

    title: '100% free',

    description:

      'Post as many jobs as you want, for as long as the role is open.',

  },

  {

    icon: Users,

    title: 'Reach the candidates other boards miss',

    description:

      'Our audience spans career stages, from fresh grads to experienced professionals switching industries.',

  },

  {

    icon: BarChart3,

    title: 'Track every click and application',

    description:

      'See how each posting performs from a clean dashboard. Compare roles, channels, and locations side by side.',

  },

  {

    icon: Zap,

    title: 'Live in minutes, indexed in hours',

    description:

      'No approval queue. Your job goes live the moment you publish it and shows up on Google and Bing within hours.',

  },

]


const audiences = [

  {

    title: 'Small businesses',

    desc: 'Restaurants, retail, services, trades. Post hourly and entry level roles without a recruiter or a budget.',

  },

  {

    title: 'Startups',

    desc: 'Founding teams hiring their first five, ten, or fifty employees. No careers page required.',

  },

  {

    title: 'Local employers',

    desc: 'Healthcare practices, schools, construction firms, and city services hiring in their own market.',

  },

  {

    title: 'Remote-first companies',

    desc: 'Hiring across state lines for fully remote and hybrid roles across the US.',

  },

  {

    title: 'Recruiting agencies',

    desc: 'Manage multiple client listings from one employer dashboard with a single login.',

  },

  {

    title: 'Enterprise teams',

    desc: 'Pilot Oh My Job alongside your existing ATS for hard-to-fill roles and new locations.',

  },

]


const jobTypes = [

  'Full-time',

  'Part-time',

  'Contract',

  'Temporary',

  'Internship',

  'Remote',

  'Hybrid',

  'Entry level',

]


const faqs = [

  {

    question: 'Is it really free to post a job on Oh My Job?',

    answer:

      'Yes. Posting a job is completely free, with no credit card, no subscription, and no hidden fees. You can post as many listings as you want and only pay if you choose to upgrade to a sponsored post later.',

  },

  {

    question: 'How long does my job listing stay active?',

    answer:

      'Each listing stays live for 30 days. You can repost it anytime from your employer dashboard, or set it to auto-repost while the role is still open.',

  },

  {

    question: 'Do I need an account to post a job?',

    answer:

      'Yes. You need a free employer account to post, edit, and track your jobs. Signing up takes about a minute and you can post your first job right after.',

  },

  {

    question: 'Can I edit or remove my job listing after posting it?',

    answer:

      'Yes. You can edit, pause, or remove any of your listings anytime from your employer dashboard. Changes go live immediately.',

  },

  {

    question: 'What kinds of jobs can I post on Oh My Job?',

    answer:

      'You can post any legitimate US job, from entry level and hourly roles to senior and salaried positions. The platform works especially well for full-time, part-time, contract, internship, remote, and hybrid roles.',

  },

  {

    question: 'Is Oh My Job a good fit for small businesses and startups?',

    answer:

      'Yes. Most of our employers are small teams, local businesses, and early stage startups. You do not need a careers page, a recruiter, or a hiring budget to get started.',

  },

  {

    question: 'Where will my job listing appear?',

    answer:

      'Your job shows up on Oh My Job, in our category and city pages, in search engine results through Google and Bing, and in our weekly newsletter to active job seekers across the US.',

  },

  {

    question: 'How is Oh My Job different from Indeed, LinkedIn, or ZipRecruiter?',

    answer:

      'Indeed, LinkedIn, and ZipRecruiter charge per posting or require a paid subscription. Oh My Job is free to post, and our audience is built around candidates who are actively looking, including the entry level and career changer segments those boards tend to overlook.',

  },

  {

    question: 'How long does it take for my job to go live?',

    answer:

      'Your job is live within minutes of posting. There is no approval queue and no waiting period. It usually shows up on Google and Bing within a few hours.',

  },

  {

    question: 'Do you offer sponsored or featured job listings?',

    answer:

      'Yes, but only as an option. Every job gets equal visibility by default. Employers who want more reach can promote a single listing to the top of search results and category pages.',

  },

]


export default function EmployerPage() {

  return (

    <div>

      {/* Structured data: FAQ + Service + Organization */}

      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{

          __html: JSON.stringify([

            {

              '@context': 'https://schema.org',

              '@type': 'FAQPage',

              mainEntity: faqs.map((faq) => ({

                '@type': 'Question',

                name: faq.question,

                acceptedAnswer: { '@type': 'Answer', text: faq.answer },

              })),

            },

            {

              '@context': 'https://schema.org',

              '@type': 'Service',

              serviceType: 'Free Job Posting',

              provider: {

                '@type': 'Organization',

                name: 'Oh My Job',

                url: 'https://www.oh-my-job.com',

              },

              areaServed: { '@type': 'Country', name: 'United States' },

              description:

                'Post a job for free on Oh My Job and reach thousands of active US job seekers.',

              offers: {

                '@type': 'Offer',

                price: '0',

                priceCurrency: 'USD',

                availability: 'https://schema.org/InStock',

              },

            },

          ]),

        }}

      />


      {/* Hero */}

      <section className="max-w-5xl mx-auto px-6 py-20 text-center">

        <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#E8B84B] mb-5">

          <Sparkles className="w-3.5 h-3.5" />

          No credit card

        </span>

        <h1 className="text-5xl md:text-6xl font-bold text-[#2A1140] mb-6 tracking-tighter leading-[1.05]">

          Post a job for free on Oh My Job

        </h1>

        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed mt-10">

          All of our candidates are from the United States. Our audience ranges from fresh grads 
          to experienced professionals, across every career stage. 
          

        </p>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8 flex-wrap">


          

        </div>

        <Button
  size="lg"
  asChild
  className="px-8 py-6 text-lg font-semibold bg-[#5B2A7F] hover:bg-[#2A1140] text-white"
>
  <Link href="/dashboard/employer/new">Post a job</Link>
</Button>

      </section>

{/* Google for Jobs structured data (new) */}
<section className="max-w-5xl mx-auto px-6 py-16">
  <div className="bg-gradient-to-br from-[#5B2A7F]/5 to-white border border-[#5B2A7F]/15 rounded-3xl p-8 md:p-12 text-center">
    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#E8B84B] mb-4">
      <Globe2 className="w-3.5 h-3.5" />
      Structured for Google for Jobs
    </span>
    <h2 className="text-3xl font-bold text-[#2A1140] mb-4 tracking-tight">
      Your listing is built to Google's job search standard
    </h2>
    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
      Every job posted on Oh My Job is automatically formatted with Google's official job posting markup.
    </p>
    <div className="grid sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <p className="text-sm font-semibold text-[#2A1140] mb-1">Automatic</p>
        <p className="text-xs text-muted-foreground">Structured data added in order to appear on Google Jobs the moment you publish.</p>
      </div>
    </div>
  </div>
</section>

      {/* How it works */}

      <section className="max-w-5xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-bold text-[#2A1140] mb-3 text-center tracking-tight">

          How posting a job works

        </h2>

        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">

          Three steps from sign up to your first application. 

        </p>

        <div className="grid md:grid-cols-3 gap-8">

          {steps.map((step, i) => (

            <div key={step.title} className="text-center">

              <div className="w-10 h-10 rounded-full bg-[#5B2A7F]/10 text-[#5B2A7F] font-bold flex items-center justify-center mx-auto mb-4">

                {i + 1}

              </div>

              <h3 className="text-lg font-semibold text-[#2A1140] mb-2">{step.title}</h3>

              <p className="text-muted-foreground leading-relaxed">{step.description}</p>

            </div>

          ))}

        </div>

      </section>


      {/* Benefits */}

      <section className="bg-gray-50 py-16">

        <div className="max-w-5xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-[#2A1140] mb-3 text-center tracking-tight">

            Why employers post on Oh My Job

          </h2>

          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">

            Built for teams that want to hire without paying per posting.

          </p>

          <div className="grid md:grid-cols-2 gap-6">

            {benefits.map((benefit) => (

              <div

                key={benefit.title}

                className="bg-white rounded-2xl p-6 border border-gray-100"

              >

                <benefit.icon className="text-[#5B2A7F] mb-3" size={24} />

                <h3 className="text-lg font-semibold text-[#2A1140] mb-2">

                  {benefit.title}

                </h3>

                <p className="text-muted-foreground leading-relaxed">

                  {benefit.description}

                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* Who posts with us (new SEO section) */}

      <section className="max-w-5xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-bold text-[#2A1140] mb-3 text-center tracking-tight">

          Built for anyone hiring

        </h2>


        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">

          {audiences.map((item) => (

            <div

              key={item.title}

              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#5B2A7F]/25 transition-colors"

            >

              <h3 className="text-base font-semibold text-[#2A1140] mb-1.5">

                {item.title}

              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">

                {item.desc}

              </p>

            </div>

          ))}

        </div>


        {/* Job types tag cloud */}

        <div className="mt-12 text-center">

          <p className="text-sm text-muted-foreground mb-3">

            Job types you can post for free:

          </p>

          <div className="flex flex-wrap justify-center gap-2">

            {jobTypes.map((type) => (

              <span

                key={type}

                className="text-xs font-medium text-[#2A1140] bg-white border border-gray-200 rounded-full px-3 py-1.5"

              >

                {type}

              </span>

            ))}

          </div>

        </div>

      </section>


      {/* Trust strip (new) */}

      <section className="max-w-5xl mx-auto px-6 py-10">

       <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-center gap-6">

          <div className="flex items-center gap-3 shrink-0">

            <div className="w-10 h-10 rounded-xl bg-[#5B2A7F]/10 flex items-center justify-center">

              <ShieldCheck className="w-5 h-5 text-[#5B2A7F]" />

            </div>

            <div>

              <p className="font-semibold text-[#2A1140] text-sm">No spam or scam applicants</p>

              <p className="text-xs text-muted-foreground">

                We screen for duplicate and suspicious applications.

              </p>

            </div>

          </div>

          <div className="hidden md:block w-px h-12 bg-gray-200" />

          <div className="flex items-center gap-3 shrink-0">

            <div className="w-10 h-10 rounded-xl bg-[#5B2A7F]/10 flex items-center justify-center">

              <Clock className="w-5 h-5 text-[#5B2A7F]" />

            </div>

            <div>

              <p className="font-semibold text-[#2A1140] text-sm">Average time to first application</p>

              <p className="text-xs text-muted-foreground">

                Less than 72 hours for most entry level and mid-skill roles.

              </p>

            </div>

          </div>

          <div className="hidden md:block w-px h-12 bg-gray-200" />

          <div className="flex items-center gap-3 shrink-0">

            <div className="w-10 h-10 rounded-xl bg-[#5B2A7F]/10 flex items-center justify-center">

              <Globe2 className="w-5 h-5 text-[#5B2A7F]" />

            </div>

            <div>

              <p className="font-semibold text-[#2A1140] text-sm">US-wide reach</p>

              <p className="text-xs text-muted-foreground">

                Indexed on Google, Bing, and our own weekly newsletter.

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* FAQ */}

      <section className="max-w-3xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-bold text-[#2A1140] mb-3 text-center tracking-tight">

          Frequently asked questions

        </h2>

        <div className="space-y-4">

          {faqs.map((faq) => (

            <details

              key={faq.question}

              className="bg-white border border-gray-100 rounded-2xl p-6 group"

            >

              <summary className="font-semibold text-[#2A1140] cursor-pointer list-none flex justify-between items-center">

                {faq.question}

                <span className="text-[#E8B84B] group-open:rotate-45 transition-transform text-xl">

                  +

                </span>

              </summary>

              <p className="text-muted-foreground mt-3 leading-relaxed">{faq.answer}</p>

            </details>

          ))}

        </div>

      </section>


      {/* Related content (new — internal linking) */}

      <section className="max-w-5xl mx-auto px-6 py-12">

        <h2 className="text-2xl font-bold text-[#2A1140] mb-6 text-center tracking-tight">

          Resources for employers

        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <Link

            href="/blog/healthcare-careers-two-years-or-less"

            className="block bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#5B2A7F]/25 transition-colors"

          >

            <span className="text-[10px] font-bold tracking-widest uppercase text-[#E8B84B]">

              Career Guides

            </span>

            <h3 className="text-base font-semibold text-[#2A1140] mt-2 mb-1.5 leading-snug">

              Hiring for healthcare? Start here.

            </h3>

            <p className="text-sm text-muted-foreground">

              The three healthcare roles that are easiest to fill in 2026, and what candidates actually look for.

            </p>

          </Link>

          <Link

            href="/blog/workplace-loneliness-performance-risk"

            className="block bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#5B2A7F]/25 transition-colors"

          >

            <span className="text-[10px] font-bold tracking-widest uppercase text-[#E8B84B]">

              Workplace Trends

            </span>

            <h3 className="text-base font-semibold text-[#2A1140] mt-2 mb-1.5 leading-snug">

              Why your best people are interviewing elsewhere.

            </h3>

            <p className="text-sm text-muted-foreground">

              Workplace loneliness is now a performance problem. Find out what employers are doing about it.

            </p>

          </Link>

          <Link

            href="/jobs"

            className="block bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#5B2A7F]/25 transition-colors"

          >

            <span className="text-[10px] font-bold tracking-widest uppercase text-[#E8B84B]">

              Job Market Data

            </span>

            <h3 className="text-base font-semibold text-[#2A1140] mt-2 mb-1.5 leading-snug">

              See what candidates in your market are looking for.

            </h3>

            <p className="text-sm text-muted-foreground">

              Browse open roles by state, title, and salary to understand local competition.

            </p>

          </Link>

        </div>

      </section>


      {/* Final CTA */}

      <section className="max-w-5xl mx-auto px-6 py-16 text-center">

        <h2 className="text-3xl font-bold text-[#2A1140] mb-4 tracking-tight">

          Ready to hire?

        </h2>

        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">

          Your next great hire is one free job post away.

        </p>

        <Button size="lg" asChild className="bg-[#5B2A7F] hover:bg-[#2A1140] text-white">

          <Link href="/dashboard/employer/new">

            Post a job for free

          </Link>

        </Button>

      </section>

    </div>

  )

}