'use client'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import JobAlertForm from '@/components/JobAlertForm'

export default function CandidateDashboard() {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)

  const uploadCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(`public/${Date.now()}-${file.name}`, file)
    setUploading(false)
    if (!error) alert('CV uploaded! (hashed & secure)')
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-8">Candidate Dashboard</h1>
      <div className="grid gap-8">
        <div className="bg-card p-10 rounded-3xl">
          <h2 className="text-2xl font-semibold mb-6">Upload your CV</h2>
          <input type="file" accept=".pdf" onChange={uploadCV} className="block" />
          {uploading && <p>Uploading + hashing...</p>}
        </div>
        <JobAlertForm />
        <div className="bg-card p-10 rounded-3xl">Saved Jobs & Applications</div>
      </div>
    </div>
  )
}