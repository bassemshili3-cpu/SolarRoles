import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Job Interview Questions in 2026 | Oh My Job',
  description: 'What hiring managers are actually asking in 2026 — behavioral, AI-screened, and structured interview questions with evidence-based preparation strategies.',
}

export default function JobInterviewQuestionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
