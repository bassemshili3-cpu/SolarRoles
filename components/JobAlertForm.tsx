'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'

const SOLAR_ROLES = [
  { value: '', label: 'Any solar role' },
  { value: 'pv_installer', label: 'PV Installer' },
  { value: 'lead_installer', label: 'Lead Installer / Foreman' },
  { value: 'om_technician', label: 'O&M Technician' },
  { value: 'electrician', label: 'Licensed Electrician' },
  { value: 'system_designer', label: 'System Designer' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'sales', label: 'Sales / Technical Sales' },
  { value: 'other', label: 'Other solar role' },
]

export default function JobAlertForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)

  const subscribe = async () => {
    if (!email.trim()) {
      toast.error('Enter an email first.')
      return
    }

    setLoading(true)
    try {
      // TODO: Resend + Inngest en prod — passer { email, role } à l'endpoint
      // d'inscription et brancher le filtre "role" sur le matching des jobs.
      await new Promise((resolve) => setTimeout(resolve, 400))
      toast.success('Job alerts activated! You will receive daily emails.')
      setEmail('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      <div className="h-1.5 bg-[#F5B819]" />

      <div className="p-6">
        <h3 className="font-semibold text-[#0B1A2E] mb-1">Get daily job alerts</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Pick a role and we&apos;ll email you when matching jobs go live.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 px-3 pr-9 rounded-md border border-input bg-white text-sm text-[#0B1A2E] appearance-none focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
            >
              {SOLAR_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={subscribe} disabled={loading} className="whitespace-nowrap">
              {loading ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Unsubscribe anytime • Powered by Resend
        </p>
      </div>
    </div>
  )
}