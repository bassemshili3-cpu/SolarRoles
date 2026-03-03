'use client'

import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import JobAlertForm from '@/components/JobAlertForm'
import { useRouter } from 'next/navigation'
import { User, Loader2, Briefcase, FileText, Bell } from 'lucide-react'

export default function CandidateDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Check auth state on mount
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Not logged in, redirect to login
        router.push('/auth/login?redirectTo=/dashboard')
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [supabase, router])

  const uploadCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(`public/${Date.now()}-${file.name}`, file)

    setUploading(false)

    if (error) {
      alert('Error uploading CV: ' + error.message)
    } else {
      alert('CV uploaded successfully!')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Not logged in - will redirect
  if (!user) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Candidate Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back!</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="font-semibold text-lg">{user.email}</p>
          <p className="text-sm text-gray-500">Logged in</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Upload CV */}
        <div className="bg-card border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Upload your CV</h2>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={uploadCV}
              className="hidden"
              id="cv-upload"
            />
            <label htmlFor="cv-upload" className="cursor-pointer">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                  <p>Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="font-medium">Click to upload your CV</p>
                  <p className="text-sm text-gray-500">PDF, DOC or DOCX (max 5MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Job Alerts */}
        <div className="bg-card border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Job Alerts</h2>
          </div>
          <JobAlertForm />
        </div>

        {/* Saved Jobs */}
        <div className="bg-card border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">Saved Jobs & Applications</h2>
          </div>
          <p className="text-gray-500">No saved jobs yet. Start browsing to save jobs!</p>
        </div>
      </div>
    </div>
  )
}