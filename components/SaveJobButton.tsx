'use client'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SaveJobButton({ jobId }: { jobId: string }) {
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = `/auth/login?redirectTo=/jobs/${jobId}`
      return
    }
    // TODO: insert into SavedJob via Prisma API route
    setSaved(true)
    toast.success('Job saved ❤️')
  }

  return (
    <Button variant="outline" size="sm" onClick={save}>
      <Heart className={`w-4 h-4 mr-2 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
      Save
    </Button>
  )
}