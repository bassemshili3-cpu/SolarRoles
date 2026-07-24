// app/jobs/[id]/apply-toggle.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ApplyForm from './apply-form'

export default function ApplyToggle({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return <ApplyForm jobId={jobId} jobTitle={jobTitle} />
  }

  return (
    <div className="rounded-2xl border p-6 text-center">
      <h3 className="text-lg font-semibold text-foreground mb-1">Ready to apply?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Takes less than a minute — no account needed.
      </p>
      <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowForm(true)}>
        Apply for this job
      </Button>
    </div>
  )
}