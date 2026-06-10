import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "When the Interviewer Asks 'Why Should We Hire You?' — The Only Answer That Works | Oh My Job",
  description: "Most candidates answer this question by listing their strengths. That is exactly wrong. Here is the framework that actually lands offers.",
  alternates: { canonical: 'https://www.oh-my-job.com/blog/why-should-we-hire-you' },
  openGraph: {
    title: "When the Interviewer Asks 'Why Should We Hire You?' — The Only Answer That Works",
    description: "Most candidates answer this question by listing strengths. That is exactly wrong.",
    url: 'https://www.oh-my-job.com/blog/why-should-we-hire-you',
    type: 'article',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
