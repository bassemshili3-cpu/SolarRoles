'use client'

import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SaveJobButton({ jobId }: { jobId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  
  const supabase = createClient()
  const router = useRouter()

  // Check if already saved on mount
  useEffect(() => {
    const checkSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('job_id', jobId)
          .eq('user_id', user.id)
          .single()
        
        if (data) setSaved(true)
      }
      setChecking(false)
    }

    checkSaved()
  }, [jobId, supabase])

  const handleSave = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login with return URL
        router.push(`/auth/login?redirectTo=/jobs/${jobId}`)
        return
      }

      // Save to database via API
      const response = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })

      if (!response.ok) {
        throw new Error('Failed to save job')
      }

      setSaved(true)
      toast.success('Job saved!', {
        description: 'You can view it in your saved jobs.',
        icon: '❤️',
      })
    } catch (error) {
      console.error('Error saving job:', error)
      toast.error('Failed to save job')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/auth/login?redirectTo=/jobs/${jobId}`)
        return
      }

      // Remove from database via API
      const response = await fetch(`/api/saved-jobs?job_id=${jobId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to unsave job')
      }

      setSaved(false)
      toast.success('Job removed from saved')
    } catch (error) {
      console.error('Error unsaving job:', error)
      toast.error('Failed to remove saved job')
    } finally {
      setLoading(false)
    }
  }

  // Loading state while checking
  if (checking) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading
      </Button>
    )
  }

  return (
    <Button
      variant={saved ? 'default' : 'outline'}
      size="sm"
      onClick={saved ? handleUnsave : handleSave}
      disabled={loading}
      className={`
        transition-all duration-200
        ${saved 
          ? 'bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 text-white' 
          : 'hover:bg-red-50 hover:border-red-200 hover:text-red-500'
        }
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Heart 
          className={`w-4 h-4 mr-2 ${saved ? 'fill-current' : ''}`} 
        />
      )}
      {saved ? 'Saved' : 'Save'}
    </Button>
  )
}