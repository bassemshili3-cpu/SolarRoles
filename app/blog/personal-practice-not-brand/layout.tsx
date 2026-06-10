import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'You Don\'t Need a Personal Brand. You Need a Personal Practice. | Oh My Job',
  description: 'The personal brand obsession has produced a generation of performers, not professionals. Here is what actually builds a career worth having.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog/personal-practice-not-brand' },
  openGraph: {
    title: 'You Don\'t Need a Personal Brand. You Need a Personal Practice.',
    description: 'The personal brand obsession has produced performers, not professionals. Here is what actually works.',
    url: 'https://www.oh-my-job.com/blog/personal-practice-not-brand',
    type: 'article',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
