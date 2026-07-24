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
    <div className="rounded-xl border p-6">
      
      
      <Button size="lg" className="w-full sm:w-auto bg-[#5B2A7F] hover:bg-blue-700 text-white"
       onClick={() => setShowForm(true)}>
        Apply for this job
      </Button>
    </div>
  )
}