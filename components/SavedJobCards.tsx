'use client'
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
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
 const tooltipId = useId()
 if (!context || !context.allowed) return null
 const saved = context.savedIds.has(jobId), busy = context.busyId === jobId
 const feedback = context.feedback?.jobId === jobId ? context.feedback : null
 return <span className="group/save relative z-20 inline-flex shrink-0 items-center">
  <button type="button" aria-describedby={!feedback && !busy ? tooltipId : undefined} aria-label={saved ? 'Remove job from saved jobs' : 'Save job'} aria-pressed={saved} disabled={context.checking || Boolean(context.busyId)} onClick={() => context.toggle(jobId)} className={('flex min-h-9 items-center justify-center gap-2 rounded-md px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60 ') + (saved ? 'text-amber-700' : 'text-slate-600 hover:text-amber-700')}>
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={'h-[22px] w-[22px] ' + (busy ? 'motion-safe:animate-pulse' : feedback && !feedback.error && saved ? 'save-sun-celebrate' : '')} aria-hidden="true"><circle cx="12" cy="12" r="5.25" fill={saved ? 'currentColor' : 'none'} /><path d="M12 2.5v1.75m0 15.5v1.75M4.58 4.58l1.24 1.24m12.36 12.36 1.24 1.24M2.5 12h1.75m15.5 0h1.75M4.58 19.42l1.24-1.24M18.18 5.82l1.24-1.24" /></svg>{showLabel && (context.checking ? 'Loading...' : saved ? 'Saved' : 'Save')}
  </button>
  {!feedback && !busy && <span id={tooltipId} role="tooltip" className={'pointer-events-none invisible absolute bottom-full z-30 mb-2 w-max max-w-[min(15rem,70vw)] rounded-md border border-amber-200 !bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900 opacity-0 shadow-sm transition-opacity group-hover/save:visible group-hover/save:opacity-100 group-focus-within/save:visible group-focus-within/save:opacity-100 ' + (showLabel ? 'left-0' : 'right-0')}>
    {saved ? 'Remove saved job' : 'Save this job'}
  </span>}
  {feedback && <span role={feedback.error ? 'alert' : 'status'} className={'pointer-events-none absolute bottom-full z-30 mb-2 w-max max-w-[min(15rem,70vw)] whitespace-normal rounded-lg border px-3 py-2 text-xs font-medium shadow-md ' + (showLabel ? 'left-0 ' : 'right-0 ') + (feedback.error ? 'border-red-300 !bg-red-50 text-red-900' : 'border-amber-300 !bg-amber-50 text-amber-900')}>
    {feedback.message}
    <span aria-hidden="true" className={'absolute -bottom-[5px] h-2 w-2 rotate-45 border-b border-r ' + (showLabel ? 'left-[15px] ' : 'right-[15px] ') + (feedback.error ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50')} />
  </span>}
 </span>
}
