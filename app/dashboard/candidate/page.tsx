'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProfileAvatar from '@/components/ProfileAvatar'

const RESUME_MAX_BYTES = 5 * 1024 * 1024
const RESUME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

interface ResumeFile {
  name: string
  url: string
  isPdf: boolean
}

type Tab = 'overview' | 'saved' | 'alerts' | 'resume' | 'settings'

interface SavedJob {
  id: string
  title: string
  company: string
  location: string
  salary: string | null
  salaryMin: number | null
  salaryMax: number | null
  contractType: string | null
  contractTime: string | null
  postedAt: string | null
  applyUrl: string
  url: string
}

interface AlertRow {
  id: string
  email: string
  what: string
  where: string
  frequency: string
  salaryMin: string | null
  active: boolean
  createdAt: string
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CandidateDashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [savedAt, setSavedAt] = useState<Record<string, string>>({})
  const [alerts, setAlerts] = useState<AlertRow[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingAlerts, setLoadingAlerts] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [resume, setResume] = useState<ResumeFile | null>(null)
  const [resumeError, setResumeError] = useState('')
  const [pendingResume, setPendingResume] = useState<File | null>(null)
  const [resumeSaved, setResumeSaved] = useState(false)
  const [removingResume, setRemovingResume] = useState(false)
  const [loadingResume, setLoadingResume] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login?redirectTo=/dashboard')
        return
      }
      setUser(user)
      setLoading(false)
      loadSavedJobs()
      loadAlerts(user.email!)
      loadResume(user.id)
    })
  }, [])

  const loadSavedJobs = async () => {
    setLoadingJobs(true)
    const res = await fetch('/api/saved-jobs')
    if (res.ok) {
      const data = await res.json()
      setSavedJobs(data.jobs || [])
      setSavedAt(data.savedAt || {})
    }
    setLoadingJobs(false)
  }

  const loadAlerts = async (email: string) => {
    setLoadingAlerts(true)
    const res = await fetch(`/api/alerts?email=${encodeURIComponent(email)}`)
    if (res.ok) {
      const data = await res.json()
      setAlerts(data.alerts || [])
    }
    setLoadingAlerts(false)
  }

  const loadResume = async (userId: string) => {
    setLoadingResume(true)
    setResumeError('')
    try {
      const storage = supabase.storage.from('resumes')
      const { data, error } = await storage.list(userId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      if (error) throw error
      let latest = data?.find(file => file.id && file.name !== '.emptyFolderPlaceholder')
      let path = latest ? `${userId}/${latest.name}` : ''
      let displayName = latest?.name.replace(/^\d+-/, '') || ''

      // Earlier uploads used public/<user id>-<timestamp>-<filename>.
      if (!latest) {
        const { data: legacy, error: legacyError } = await storage.list('public', {
          search: `${userId}-`,
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        })
        if (legacyError) throw legacyError
        latest = legacy?.find(file => file.id && file.name.startsWith(`${userId}-`))
        if (latest) {
          path = `public/${latest.name}`
          displayName = latest.name.slice(userId.length + 1).replace(/^\d+-/, '')
        }
      }

      if (!latest) {
        setResume(null)
        return
      }
      const { data: signed, error: signError } = await storage.createSignedUrl(path, 3600)
      if (signError || !signed) throw signError || new Error('Could not open resume')
      setResume({
        name: displayName,
        url: signed.signedUrl,
        isPdf: latest.name.toLowerCase().endsWith('.pdf'),
      })
    } catch {
      setResumeError('Could not load your resume. Please try again later.')
    } finally {
      setLoadingResume(false)
    }
  }

  const removeJob = async (jobId: string) => {
    await fetch(`/api/saved-jobs?job_id=${jobId}`, { method: 'DELETE' })
    setSavedJobs(prev => prev.filter(j => j.id !== jobId))
  }

  const removeAlert = async (id: string) => {
    await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' })
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const selectResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user || uploading || removingResume) return
    setResumeError('')
    setResumeSaved(false)
    setPendingResume(null)
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const contentType = RESUME_TYPES[extension]
    if (!contentType) {
      setResumeError('Choose a PDF, DOC or DOCX file.')
      return
    }
    if (file.size > RESUME_MAX_BYTES) {
      setResumeError('The file must be 5 MB or smaller.')
      return
    }
    setPendingResume(file)
  }

  const uploadResume = async () => {
    const file = pendingResume
    if (!file || !user || uploading || removingResume) return
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const contentType = RESUME_TYPES[extension]
    setResumeError('')
    setUploading(true)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const name = `${Date.now()}-${safeName}`
      const storage = supabase.storage.from('resumes')
      const { error } = await storage.upload(`${user.id}/${name}`, file, { contentType, upsert: false })
      if (error) throw error
      const { data: signed, error: signError } = await storage.createSignedUrl(`${user.id}/${name}`, 3600)
      if (signError || !signed) throw signError || new Error('Could not open resume')
      setResume({ name: file.name, url: signed.signedUrl, isPdf: extension === 'pdf' })
      setPendingResume(null)
      setResumeSaved(true)
    } catch (error) {
      setResumeError(error instanceof Error ? error.message : 'Could not upload your resume.')
    } finally {
      setUploading(false)
    }
  }

  const removeResume = async () => {
    if (!user || uploading || removingResume) return
    setRemovingResume(true)
    setResumeError('')
    setResumeSaved(false)
    try {
      const storage = supabase.storage.from('resumes')
      const paths: string[] = []
      for (const folder of [user.id, 'public']) {
        for (let offset = 0; ; offset += 100) {
          const { data, error } = await storage.list(folder, {
            limit: 100,
            offset,
            sortBy: { column: 'name', order: 'asc' },
            ...(folder === 'public' ? { search: `${user.id}-` } : {}),
          })
          if (error) throw error
          for (const file of data || []) {
            if (!file.id || file.name === '.emptyFolderPlaceholder') continue
            if (folder === 'public' && !file.name.startsWith(`${user.id}-`)) continue
            paths.push(`${folder}/${file.name}`)
          }
          if (!data || data.length < 100) break
        }
      }
      for (let start = 0; start < paths.length; start += 100) {
        const batch = paths.slice(start, start + 100)
        const { data, error } = await storage.remove(batch)
        if (error) throw error
        if (data?.length !== batch.length) throw new Error('Some resume files could not be removed. Please try again.')
      }
      setResume(null)
      setPendingResume(null)
    } catch (error) {
      await loadResume(user.id)
      setResumeError(error instanceof Error ? error.message : 'Could not remove your resume. Please try again.')
    } finally {
      setRemovingResume(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/jobs')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-[#92400E] rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  if (!user) return null

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'You'
  const firstName = displayName.split(' ')[0]
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const activeAlerts = alerts.filter(a => a.active)

  const navItems: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'saved', label: 'Saved jobs', count: savedJobs.length },
    { id: 'alerts', label: 'Job alerts', count: activeAlerts.length },
    { id: 'resume', label: 'Resume' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Mobile tab bar */}
      <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max px-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === item.id
                  ? 'border-[#B45309] bg-gradient-to-r from-amber-100 to-orange-100 text-[#92400E]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {item.label}
              {item.count !== undefined && item.count > 0 && (
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full tabular-nums">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col w-52 flex-shrink-0 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <ProfileAvatar user={user} className="w-10 h-10 mb-3" />
              <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
              <p className="text-xs text-gray-400 mt-0.5">Since {memberSince}</p>
            </div>

            <nav className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {navItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                    i < navItems.length - 1 ? 'border-b border-gray-100' : ''
                  } ${
                    tab === item.id
                      ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-[#92400E] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                        tab === item.id
                          ? 'bg-amber-200/60 text-[#92400E]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <Link
              href="/jobs"
              className="block text-center text-xs font-medium bg-gradient-to-r from-[#92400E] to-[#9A3412] text-white py-2 rounded-lg hover:from-[#78350F] hover:to-[#7C2D12] transition-colors"
            >
              Search jobs
            </Link>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {tab === 'overview' && (
              <OverviewTab
                user={user}
                firstName={firstName}
                savedJobs={savedJobs}
                savedAt={savedAt}
                alerts={alerts}
                resume={resume}
                onTabChange={setTab}
              />
            )}
            {tab === 'saved' && (
              <SavedJobsTab
                jobs={savedJobs}
                savedAt={savedAt}
                loading={loadingJobs}
                onRemove={removeJob}
              />
            )}
            {tab === 'alerts' && (
              <AlertsTab
                alerts={alerts}
                userEmail={user.email}
                onRemove={removeAlert}
                onRefresh={() => loadAlerts(user.email)}
              />
            )}
            {tab === 'resume' && (
              <ResumeTab resume={resume} uploading={uploading} loading={loadingResume} error={resumeError} onUpload={selectResume} pendingName={pendingResume?.name} saved={resumeSaved} onSave={uploadResume} removing={removingResume} onRemove={removeResume} />
            )}
            {tab === 'settings' && <SettingsTab user={user} onSignOut={signOut} />}
          </main>
        </div>
      </div>
    </div>
  )
}

// ── Overview ──────────────────────────────────────────────────────────────────

function SavedJobTimestamp({ value }: { value?: string }) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()} className="shrink-0 text-right text-xs leading-5 text-gray-500 tabular-nums">
      <span className="block">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      <span className="block">{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
    </time>
  )
}

function OverviewTab({
  user,
  firstName,
  savedJobs,
  savedAt,
  alerts,
  resume,
  onTabChange,
}: {
  user: { user_metadata?: Record<string, unknown>; email?: string }
  firstName: string
  savedJobs: SavedJob[]
  savedAt: Record<string, string>
  alerts: AlertRow[]
  resume: { name: string; url: string } | null
  onTabChange: (tab: Tab) => void
}) {
  const activeAlerts = alerts.filter(a => a.active)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ProfileAvatar user={user} className="h-10 w-10 md:hidden" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's where your job search stands.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onTabChange('saved')}
          className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors"
        >
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{savedJobs.length}</p>
          <p className="text-xs text-gray-500 mt-1">Saved jobs</p>
        </button>
        <button
          onClick={() => onTabChange('alerts')}
          className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors"
        >
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{activeAlerts.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active alerts</p>
        </button>
        <button
          onClick={() => onTabChange('resume')}
          className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors"
        >
          <p className={`text-sm font-bold mt-1 ${resume ? 'text-green-600' : 'text-gray-400'}`}>
            {resume ? 'Uploaded' : 'Not set'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Resume</p>
        </button>
      </div>

      {/* Recent saved jobs */}
      {savedJobs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent saved jobs</h2>
            <button onClick={() => onTabChange('saved')} className="text-xs text-[#92400E] hover:underline">
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {savedJobs.slice(0, 5).map(job => (
              <div key={job.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <a
                    href={job.url}
                    className="block text-sm font-medium text-[#92400E] truncate hover:text-[#78350F] hover:underline focus-visible:underline"
                  >
                    {job.title}
                  </a>
                  <p className="text-xs text-gray-500 truncate">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ''}
                  </p>
                </div>
                <SavedJobTimestamp value={savedAt[job.id]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Active alerts</h2>
            <button onClick={() => onTabChange('alerts')} className="text-xs text-[#92400E] hover:underline">
              Manage
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {activeAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">
                    <span className="font-medium">{alert.what}</span>
                    <span className="text-gray-500"> in {alert.where}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {alert.frequency === 'WEEKLY' ? 'Weekly' : 'Twice a week'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {savedJobs.length === 0 && activeAlerts.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <p className="text-gray-500 text-sm mb-4">Your dashboard is empty. Start by searching for jobs.</p>
          <Link
            href="/jobs"
            className="inline-block bg-gradient-to-r from-[#92400E] to-[#9A3412] text-white text-sm font-medium px-5 py-2 rounded-lg hover:from-[#78350F] hover:to-[#7C2D12] transition-colors"
          >
            Search jobs
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Saved jobs ────────────────────────────────────────────────────────────────

function SavedJobsTab({
  jobs,
  savedAt,
  loading,
  onRemove,
}: {
  jobs: SavedJob[]
  savedAt: Record<string, string>
  loading: boolean
  onRemove: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Saved jobs</h2>
        <span className="text-sm text-gray-400 tabular-nums">{jobs.length} saved</span>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <p className="text-gray-500 text-sm mb-4">
            No saved jobs yet. Browse listings and bookmark the ones worth applying to.
          </p>
          <Link
            href="/jobs"
            className="inline-block bg-gradient-to-r from-[#92400E] to-[#9A3412] text-white text-sm font-medium px-5 py-2 rounded-lg hover:from-[#78350F] hover:to-[#7C2D12] transition-colors"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-100">
            {jobs.map(job => {
              const saved = savedAt[job.id]
                ? new Date(savedAt[job.id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : null
              const salary =
                job.salary ||
                (job.salaryMin ? `$${Math.round(job.salaryMin / 1000)}k+` : null)

              return (
                <div key={job.id} className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <a
                          href={job.url}
                          className="block font-medium text-[#92400E] text-sm leading-snug hover:text-[#78350F] hover:underline focus-visible:underline"
                        >
                          {job.title}
                        </a>
                        <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
                      </div>
                      {saved && (
                        <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">Saved {saved}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                      {job.location && <span className="text-xs text-gray-500">{job.location}</span>}
                      {salary && <span className="text-xs text-gray-500">{salary}</span>}
                      {job.contractType && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {job.contractType}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                    <button
                      onClick={() => onRemove(job.id)}
                      className="text-xs text-gray-400 hover:text-red-500 px-2 py-1.5 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Alerts ────────────────────────────────────────────────────────────────────

function AlertsTab({
  alerts,
  userEmail,
  onRemove,
  onRefresh,
}: {
  alerts: AlertRow[]
  userEmail: string
  onRemove: (id: string) => void
  onRefresh: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [what, setWhat] = useState('')
  const [where, setWhere] = useState('')
  const [frequency, setFrequency] = useState<'weekly' | 'twice'>('weekly')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const submitAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!what.trim() || !where.trim()) {
      setFormError('Both fields are required.')
      return
    }
    setSubmitting(true)
    setFormError('')
    const res = await fetch('/api/alerts/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, what: what.trim(), where: where.trim(), frequency }),
    })
    if (res.ok) {
      setWhat('')
      setWhere('')
      setShowForm(false)
      onRefresh()
    } else {
      setFormError('Could not create alert. Please try again.')
    }
    setSubmitting(false)
  }

  const activeAlerts = alerts.filter(a => a.active)
  const inactiveAlerts = alerts.filter(a => !a.active)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Job alerts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium bg-gradient-to-r from-[#92400E] to-[#9A3412] text-white px-4 py-2 rounded-lg hover:from-[#78350F] hover:to-[#7C2D12] transition-colors"
        >
          {showForm ? 'Cancel' : '+ New alert'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">New alert</h3>
          <form onSubmit={submitAlert} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Job title or keyword</label>
                <input
                  type="text"
                  value={what}
                  onChange={e => setWhat(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#92400E] focus:ring-1 focus:ring-[#92400E]/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Location</label>
                <input
                  type="text"
                  value={where}
                  onChange={e => setWhere(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#92400E] focus:ring-1 focus:ring-[#92400E]/20 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Frequency</label>
              <div className="flex gap-4">
                {(['weekly', 'twice'] as const).map(f => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value={f}
                      checked={frequency === f}
                      onChange={() => setFrequency(f)}
                      className="accent-[#92400E]"
                    />
                    <span className="text-sm text-gray-700">
                      {f === 'weekly' ? 'Weekly' : 'Twice a week'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {formError && <p className="text-xs text-red-500">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-[#92400E] to-[#9A3412] text-white text-sm font-medium px-5 py-2 rounded-md hover:from-[#78350F] hover:to-[#7C2D12] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create alert'}
            </button>
          </form>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <p className="text-gray-500 text-sm">No alerts set up yet. Create one to get notified when new jobs match your criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {activeAlerts.length > 0 && (
            <>
              <div className="px-5 py-2.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active</p>
              </div>
              <div className="divide-y divide-gray-50">
                {activeAlerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onRemove={onRemove} />
                ))}
              </div>
            </>
          )}
          {inactiveAlerts.length > 0 && (
            <>
              <div className="px-5 py-2.5 border-t border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Inactive</p>
              </div>
              <div className="divide-y divide-gray-50">
                {inactiveAlerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onRemove={onRemove} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function AlertItem({ alert, onRemove }: { alert: AlertRow; onRemove: (id: string) => void }) {
  return (
    <div className="px-5 py-3 flex items-center gap-3">
      <div
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${alert.active ? 'bg-green-400' : 'bg-gray-300'}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">
          <span className="font-medium">{alert.what}</span>
          <span className="text-gray-500"> in {alert.where}</span>
        </p>
        <p className="text-xs text-gray-400">
          {alert.frequency === 'WEEKLY' ? 'Weekly' : 'Twice a week'}
          {alert.salaryMin ? ` · $${alert.salaryMin}k+` : ''}
        </p>
      </div>
      <button
        onClick={() => onRemove(alert.id)}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
      >
        Remove
      </button>
    </div>
  )
}

// ── Resume ────────────────────────────────────────────────────────────────────

function ResumeTab({
  resume,
  uploading,
  loading,
  error,
  onUpload,
  pendingName,
  saved,
  onSave,
  removing,
  onRemove,
}: {
  resume: ResumeFile | null
  uploading: boolean
  loading: boolean
  error: string
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  pendingName?: string
  saved: boolean
  onSave: () => Promise<void>
  removing: boolean
  onRemove: () => Promise<void>
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Resume</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        {loading ? (
          <p className="text-sm text-gray-500">Loading resume...</p>
        ) : resume ? (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Current resume</p>
                <p className="text-xs text-gray-400 mt-1 font-mono break-all leading-relaxed">{resume.name}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={onRemove} disabled={uploading || removing || loading} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60">
                {removing ? 'Removing...' : 'Remove resume'}
              </button>
              <a
                href={resume.url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex-shrink-0 text-xs font-medium border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {resume.isPdf ? 'Open PDF' : 'Download'}
              </a>
              </div>
            </div>
            {resume.isPdf ? (
              <iframe
                src={resume.url}
                title="Resume preview"
                className="mb-4 h-[60vh] min-h-80 w-full rounded-md border border-gray-200"
              />
            ) : (
              <p className="mb-4 text-xs text-gray-500">Preview is available for PDF files. Open or download this document to view it.</p>
            )}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Replace with a new file</p>
              <label className={`inline-block ${uploading ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={onUpload} disabled={uploading || removing} className="sr-only" />
                <span className="inline-block text-xs font-medium border border-gray-200 rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">
                  {uploading ? 'Uploading...' : 'Choose file'}
                </span>
              </label>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-700 mb-1">No resume uploaded yet</p>
            <p className="text-xs text-gray-400 mb-5">PDF, DOC or DOCX, max 5MB</p>
            <label className={`inline-block ${uploading ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}>
              <input type="file" accept=".pdf,.doc,.docx" onChange={onUpload} disabled={uploading || removing} className="sr-only" />
              <span className="inline-block text-sm font-medium bg-gradient-to-r from-[#92400E] to-[#9A3412] text-white px-5 py-2 rounded-lg hover:from-[#78350F] hover:to-[#7C2D12] transition-colors">
                {uploading ? 'Uploading...' : 'Choose file'}
              </span>
            </label>
          </div>
        )}
        {pendingName && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="min-w-0 flex-1">
              <p className="break-all text-sm font-medium text-gray-900">{pendingName}</p>
              <p className="mt-1 text-xs text-gray-600">Click Save resume to add this file to your dashboard.</p>
            </div>
            <button type="button" onClick={onSave} disabled={uploading || removing} className="shrink-0 rounded-lg bg-gradient-to-r from-[#92400E] to-[#9A3412] px-4 py-2 text-sm font-medium text-white hover:from-[#78350F] hover:to-[#7C2D12] disabled:opacity-60">
              {uploading ? 'Saving...' : 'Save resume'}
            </button>
          </div>
        )}
        {saved && <p role="status" className="mt-4 text-sm font-medium text-emerald-800">Resume saved to your dashboard.</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────────────────

function SettingsTab({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Account</p>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Member since</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            {user.app_metadata?.provider && (
              <div>
                <p className="text-xs text-gray-500">Sign in method</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">
                  {user.app_metadata.provider === 'email' ? 'Email and password' : user.app_metadata.provider}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Actions</p>
          <button
            onClick={onSignOut}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
