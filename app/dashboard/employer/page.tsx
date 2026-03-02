'use client'
import { Button } from '@/components/ui/button'

const plans = [
  { name: 'Basic', price: '\$99/mo', description: 'Post up to 5 jobs' },
  { name: 'Premium', price: '\$299/mo', description: 'Post unlimited jobs + AI matching' },
  { name: 'Enterprise', price: '\$799/mo', description: 'Everything + Resume database access' },
]

export default function EmployerDashboard() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">Employer Dashboard</h1>
      <p className="text-xl text-muted-foreground mb-12">Post sponsored jobs • Access resume database • AI matching</p>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div key={p.name} className="bg-card border-2 border-primary/20 rounded-3xl p-8 text-center hover:border-primary transition-all">
            <h3 className="text-3xl font-bold mb-2">{p.name}</h3>
            <div className="text-5xl font-bold mb-4">{p.price}</div>
            <p className="text-muted-foreground mb-6">{p.description}</p>
            <Button size="lg" className="w-full">Choose Plan</Button>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-card p-10 rounded-3xl">
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <Button size="lg" variant="outline" className="mr-4">Post a Sponsored Job</Button>
        <Button size="lg">View All Applicants</Button>
      </div>

      <div className="mt-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-10 rounded-3xl">
        <h2 className="text-3xl font-bold mb-4">AI Candidate Matching</h2>
        <p className="text-xl">Our AI finds the best 10 candidates for your job in seconds</p>
        <Button size="lg" className="mt-6 bg-white text-black">Activate AI Matching</Button>
      </div>
    </div>
  )
}