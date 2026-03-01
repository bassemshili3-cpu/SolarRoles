'use client'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const plans = [
  { name: 'Basic', priceId: 'price_123basic', price: '$99/mo' },
  { name: 'Premium', priceId: 'price_123premium', price: '$299/mo' },
  { name: 'Enterprise', priceId: 'price_123enterprise', price: '$799/mo' },
]

export default function EmployerDashboard() {
  const handleSubscribe = async (priceId: string, plan: string) => {
    const stripe = await stripePromise
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, plan }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">Employer Dashboard</h1>
      <p className="text-xl text-muted-foreground mb-12">Post sponsored jobs • Access resume database • AI matching</p>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div key={p.name} className="bg-card border-2 border-primary/20 rounded-3xl p-8 text-center hover:border-primary transition-all">
            <h3 className="text-3xl font-bold mb-2">{p.name}</h3>
            <div className="text-5xl font-bold mb-8">{p.price}</div>
            <Button size="lg" onClick={() => handleSubscribe(p.priceId, p.name)} className="w-full">
              Subscribe Now
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-card p-10 rounded-3xl">
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <Button size="lg" variant="outline" className="mr-4">Post a Sponsored Job (+ Top placement)</Button>
        <Button size="lg">View All Applicants</Button>
      </div>

        // ... (le code Stripe que je t’ai donné avant) + ajout :

<div className="mt-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-10 rounded-3xl">
  <h2 className="text-3xl font-bold mb-4">AI Candidate Matching</h2>
  <p className="text-xl">Our AI finds the best 10 candidates for your job in seconds (Premium only)</p>
  <Button size="lg" className="mt-6 bg-white text-black">Activate AI Matching</Button>
</div>
    </div>
  )


}