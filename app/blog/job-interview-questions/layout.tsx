import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Job Interview Questions in 2026 | Oh My Job',
  description:
    'How to prepare for job interviews in 2026. Covers behavioral questions, AI screening, salary negotiation, and the questions employers are really asking.',
}

export default function JobInterviewQuestionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
