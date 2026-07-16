// app/dashboard/employer/page.tsx
import type { Metadata } from 'next'
import EmployerDashboard from './employer-dashboard'

export const metadata: Metadata = {
  title: 'Employer dashboard | Oh My Job',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <EmployerDashboard />
}