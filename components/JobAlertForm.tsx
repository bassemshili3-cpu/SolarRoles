'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'

export default function JobAlertForm() {
  const [email, setEmail] = useState('')

  const subscribe = async () => {
    // TODO: Resend + Inngest en prod
    toast.success('Job alerts activated! You will receive daily emails.')
  }

  return (
    <div className="bg-card p-6 rounded-2xl border">
      <h3 className="font-semibold mb-4">Get daily job alerts</h3>
      <div className="flex gap-3">
        <Input 
          type="email" 
          placeholder="your@email.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <Button onClick={subscribe}>Subscribe</Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3">Unsubscribe anytime • Powered by Resend</p>
    </div>
  )
}