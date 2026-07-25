'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Search, Pencil, Pause, Play, Trash2, Copy, Check, ShieldAlert, ShieldCheck } from 'lucide-react'
import { buildJobSlug } from '@/lib/slugify'

type JobStatus = 'active' | 'paused' | 'expired' | 'flagged'

interface AdminJob {
  id: string
  title: string
  company: string
  location: string
  postedAt: Date
  status: JobStatus
  clicks: number
  applications: number
  flagReasons?: string[]
}

function formatRelativeDate(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

const statusBar: Record<JobStatus, string> = {
  active: 'bg-emerald-500',
  paused: 'bg-amber-500',
  expired: 'bg-slate-300',
  flagged: 'bg-red-500',
}

const statusText: Record<JobStatus, string> = {
  active: 'text-emerald-700',
  paused: 'text-amber-700',
  expired: 'text-slate-500',
  flagged: 'text-red-700',
}

// Ordre de priorité d'affichage : les annonces suspectes remontent toujours en premier
const statusOrder: Record<JobStatus, number> = {
  flagged: 0,
  active: 1,
  paused: 2,
  expired: 3,
}

export default function AdminJobsDashboard({ initialJobs }: { initialJobs: AdminJob[] }) {
  const [jobs, setJobs] = useState<AdminJob[]>(initialJobs)
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredJobs = useMemo(() => {
    const q = query.toLowerCase()
    return jobs
      .filter(
        (j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
      )
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
  }, [jobs, query])

  const flaggedCount = jobs.filter((j) => j.status === 'flagged').length

  function jobUrl(job: AdminJob) {
    return `https://www.oh-my-job.com/jobs/${job.id}/${buildJobSlug(job)}`
  }

  async function copyUrl(job: AdminJob) {
    await navigator.clipboard.writeText(jobUrl(job))
    setCopiedId(job.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  async function toggleStatus(id: string, currentStatus: JobStatus) {
    const action = currentStatus === 'active' ? 'pause' : 'activate'
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (!res.ok) return alert('Something went wrong.')
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, status: action === 'pause' ? 'paused' : 'active' } : j
      )
    )
  }

  async function approveJob(id: string) {
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })
    if (!res.ok) return alert('Something went wrong.')
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: 'active', flagReasons: undefined } : j))
    )
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this job listing? This cannot be undone.')) return
    const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' })
    if (!res.ok) return alert('Something went wrong.')
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
      <header className="mb-10">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-[#1a2340]">
          All employer job postings
        </h1>
        <p className="text-[15px] text-slate-500 mt-2">
          {jobs.length} listings total
          {flaggedCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-medium">
              · {flaggedCount} flagged for review
            </span>
          )}
        </p>
      </header>

      <div className="relative w-full sm:w-80 mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or company"
          className="pl-9 h-9 rounded-md border-slate-200"
        />
      </div>

      <ul className="border-t border-slate-200" role="list">
        {filteredJobs.map((job) => (
          <li
            key={job.id}
            className={`group relative flex items-center gap-4 py-4 border-b border-slate-100 transition-colors ${
              job.status === 'flagged' ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50/50'
            }`}
          >
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 rounded-r-full ${statusBar[job.status]}`}
            />
            <div className="flex-1 min-w-0 pl-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                {job.status === 'flagged' && (
                  <ShieldAlert size={15} className="text-red-500 shrink-0" />
                )}
                <Link
                  href={jobUrl(job)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-medium text-[#1a2340] hover:underline underline-offset-2 truncate"
                >
                  {job.title}
                </Link>
                <span className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${statusText[job.status]}`}>
                  {job.status}
                </span>
              </div>
              <div className="text-[13px] text-slate-500 mt-1 flex items-center gap-2">
                <span className="truncate">{job.company}</span>
                <span className="text-slate-300">·</span>
                <span className="truncate">{job.location}</span>
                <span className="text-slate-300">·</span>
                <span>Posted {formatRelativeDate(job.postedAt)}</span>
              </div>
              {job.status === 'flagged' && job.flagReasons && job.flagReasons.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {job.flagReasons.map((reason, i) => (
                    <li key={i} className="text-[12px] text-red-600 flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-7 text-right shrink-0">
              <div className="min-w-[3.5rem]">
                <div className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Clicks</div>
                <div className="text-[15px] font-medium text-[#1a2340] tabular-nums mt-0.5">
                  {job.clicks.toLocaleString()}
                </div>
              </div>
              <div className="min-w-[3.5rem]">
                <div className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Apps</div>
                <div className="text-[15px] font-medium text-[#1a2340] tabular-nums mt-0.5">
                  {job.applications.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              {job.status === 'flagged' && (
                <button
                  type="button"
                  title="Approve (not a scam)"
                  onClick={() => approveJob(job.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <ShieldCheck size={15} />
                </button>
              )}
              <button
                type="button"
                title="Copy URL"
                onClick={() => copyUrl(job)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-[#1a2340] hover:bg-slate-100 transition-colors"
              >
                {copiedId === job.id ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
              </button>
              <Link
                href={`/admin/jobs/${job.id}/edit`}
                title="Edit"
                className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-[#1a2340] hover:bg-slate-100 transition-colors"
              >
                <Pencil size={15} />
              </Link>
              {job.status !== 'expired' && job.status !== 'flagged' && (
                <button
                  type="button"
                  title={job.status === 'active' ? 'Pause' : 'Activate'}
                  onClick={() => toggleStatus(job.id, job.status)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-[#1a2340] hover:bg-slate-100 transition-colors"
                >
                  {job.status === 'active' ? <Pause size={15} /> : <Play size={15} />}
                </button>
              )}
              <button
                type="button"
                title="Delete"
                onClick={() => deleteJob(job.id)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-slate-400">No jobs match your search.</p>
        </div>
      )}
    </div>
  )
}