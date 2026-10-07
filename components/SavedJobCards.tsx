'use client'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
type SavedJobsContextValue = {
 savedIds: Set<string>; checking: boolean; busyId: string | null; allowed: boolean
 feedback: { jobId: string; message: string; error?: boolean } | null
 toggle: (jobId: string) => Promise<void>
}
const SavedJobsContext = createContext<SavedJobsContextValue | null>(null)
export function SavedJobCards({ children }: { children: ReactNode }) {
 const [savedIds, setSavedIds] = useState<Set<string>>(new Set()), [checking, setChecking] = useState(true), [busyId, setBusyId] = useState<string | null>(null), [allowed, setAllowed] = useState(true)
 const [feedback, setFeedback] = useState<SavedJobsContextValue['feedback']>(null)
 const locked = useRef(false), generation = useRef(0)
 const pathname = usePathname(), router = useRouter()
 useEffect(() => {
  let active = true
  const load = async () => {
   const current = ++generation.current
   setChecking(true); setSavedIds(new Set()); setFeedback(null)
   try {
    const r = await fetch('/api/saved-jobs?idsOnly=1', { cache: 'no-store' })
    if (!active || current !== generation.current) return
    setAllowed(r.status !== 403)
    if (r.status === 401 || r.status === 403) return
    if (!r.ok) throw new Error('Could not load saved jobs')
    const { jobIds } = await r.json()
    if (active && current === generation.current) setSavedIds(new Set(jobIds))
   } catch { /* Save remains available; each action is checked on the server. */ }
   finally { if (active && current === generation.current) setChecking(false) }
  }
  load()
  const { data: { subscription } } = createClient().auth.onAuthStateChange(() => { void load() })
  return () => { active = false; subscription.unsubscribe() }
 }, [])
 useEffect(() => { if (!feedback) return; const id = setTimeout(() => setFeedback(null), 4000); return () => clearTimeout(id) }, [feedback])
 async function toggle(jobId: string) {
  if (locked.current || checking) return
  locked.current = true; setBusyId(jobId); setFeedback(null)
  const current = generation.current
  try {
   const wasSaved = savedIds.has(jobId)
   const r = await fetch(wasSaved ? '/api/saved-jobs?job_id=' + encodeURIComponent(jobId) : '/api/saved-jobs', { method: wasSaved ? 'DELETE' : 'POST', ...(wasSaved ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id: jobId }) }) })
   if (current !== generation.current) return
   if (r.status === 401) { router.push('/auth/login?redirectTo=' + encodeURIComponent(pathname + window.location.search)); return }
   if (!r.ok) { const result = await r.json().catch(() => ({})); throw new Error(result.error || 'Could not update saved job. Try again.') }
   setSavedIds(previous => { const next = new Set(previous); if (wasSaved) next.delete(jobId); else next.add(jobId); return next })
   setFeedback({ jobId, message: wasSaved ? 'Job removed' : '✓ Job saved' })
  } catch (e) { if (current === generation.current) setFeedback({ jobId, message: e instanceof Error ? e.message : 'Could not update saved job.', error: true }) }
  finally { locked.current = false; setBusyId(null) }
 }
 return <SavedJobsContext.Provider value={{ savedIds, checking, busyId, allowed, feedback, toggle }}>{children}</SavedJobsContext.Provider>
}
export function SaveJobCardButton({ jobId, showLabel = false }: { jobId: string; showLabel?: boolean }) {
 const context = useContext(SavedJobsContext)
 if (!context || !context.allowed) return null
 const saved = context.savedIds.has(jobId), busy = context.busyId === jobId
 const feedback = context.feedback?.jobId === jobId ? context.feedback : null
 return <span className="relative z-20 inline-flex shrink-0 items-center">
  <button type="button" aria-label={saved ? 'Remove job from saved jobs' : 'Save job'} aria-pressed={saved} disabled={context.checking || Boolean(context.busyId)} onClick={() => context.toggle(jobId)} className={('flex min-h-9 items-center justify-center gap-2 rounded-md px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60 ') + (saved ? 'text-amber-700' : 'text-slate-600 hover:text-amber-700')}>
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={'h-5 w-5 ' + (busy ? 'animate-pulse' : '')} aria-hidden="true"><circle cx="12" cy="12" r="5.25" fill={saved ? 'currentColor' : 'none'} /><path d="M12 2.5v1.75m0 15.5v1.75M4.58 4.58l1.24 1.24m12.36 12.36 1.24 1.24M2.5 12h1.75m15.5 0h1.75M4.58 19.42l1.24-1.24M18.18 5.82l1.24-1.24" /></svg>{showLabel && (context.checking ? 'Loading...' : saved ? 'Saved' : 'Save')}
  </button>
  {feedback && <span role={feedback.error ? 'alert' : 'status'} className={('absolute w-max max-w-[min(16rem,70vw)] whitespace-normal rounded-md border px-3 py-2 text-xs shadow-sm ' + (showLabel ? 'left-0 bottom-full mb-1 ' : 'right-0 top-full mt-1 ')) + (feedback.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900')}>{feedback.message}</span>}
 </span>
}
