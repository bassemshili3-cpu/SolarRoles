import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  return (
    <div className="max-w-2xl mx-auto py-24 text-center">
      <h1 className="text-5xl font-bold mb-10">Welcome to your dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/candidate">
          <Button size="lg" className="h-40 w-full text-2xl">👤 I’m a Candidate</Button>
        </Link>
        <Link href="/dashboard/employer">
          <Button size="lg" variant="outline" className="h-40 w-full text-2xl">🏢 I’m an Employer</Button>
        </Link>
      </div>
    </div>
  )
}