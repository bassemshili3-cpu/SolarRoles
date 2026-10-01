'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

type SavedJobsContextValue = {
  savedIds: Set<string>
  checking: boolean
  busyId: string | null
  toggle: (jobId: string) => Promise<void>
}

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null)

export function SavedJobCards({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [checking, setChecking] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const response = await fetch('/api/saved-jobs?idsOnly=1', { cache: 'no-store' })
        if (response.status === 401) return
        if (!response.ok) throw new Error('Could not load saved jobs')
        const { jobIds } = await response.json()
        if (active) setSavedIds(new Set(jobIds))
      } catch {
        if (active) toast.error('Could not load saved jobs')
      } finally {
        if (active) setChecking(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  async function toggle(jobId: string) {
    if (busyId || checking) return
    setBusyId(jobId)
    try {
      const { data: { user } } = await createClient().auth.getUser()
      if (!user) {
        router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname || '/jobs')}`)
        return
      }

      const wasSaved = savedIds.has(jobId)
      const response = await fetch(wasSaved
        ? `/api/saved-jobs?job_id=${encodeURIComponent(jobId)}`
        : '/api/saved-jobs', {
        method: wasSaved ? 'DELETE' : 'POST',
        ...(wasSaved ? {} : {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: jobId }),
        }),
      })
      if (response.status === 401) {
        router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname || '/jobs')}`)
        return
      }
      if (!response.ok) throw new Error('Could not update saved job')

      setSavedIds(previous => {
        const next = new Set(previous)
        if (wasSaved) next.delete(jobId)
        else next.add(jobId)
        return next
      })
      toast.success(wasSaved ? 'Removed from saved jobs' : 'Saved to your candidate dashboard')
    } catch {
      toast.error('Could not update saved job')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <SavedJobsContext.Provider value={{ savedIds, checking, busyId, toggle }}>
      {children}
    </SavedJobsContext.Provider>
  )
}

export function SaveJobCardButton({ jobId }: { jobId: string }) {
  const context = useContext(SavedJobsContext)
  if (!context) return null
  const saved = context.savedIds.has(jobId)
  const busy = context.busyId === jobId

  return (
    <button
      type="button"
      aria-label={saved ? 'Remove job from saved jobs' : 'Save job'}
      aria-pressed={saved}
      title={saved ? 'Remove from saved jobs' : 'Save job'}
      disabled={context.checking || Boolean(context.busyId)}
      onClick={() => context.toggle(jobId)}
      className={`relative z-20 flex h-9 w-9 shrink-0 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-60 ${saved
        ? 'text-amber-600 hover:text-amber-700'
        : 'text-slate-500 hover:text-amber-600'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-[23px] w-[23px] ${busy ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5.25" fill={saved ? 'currentColor' : 'none'} />
        <path d="M12 2.5v1.75m0 15.5v1.75M4.58 4.58l1.24 1.24m12.36 12.36 1.24 1.24M2.5 12h1.75m15.5 0h1.75M4.58 19.42l1.24-1.24M18.18 5.82l1.24-1.24" />
      </svg>
    </button>
  )
}
