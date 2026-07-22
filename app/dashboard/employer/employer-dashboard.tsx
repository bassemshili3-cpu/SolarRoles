// app/dashboard/employer/employer-dashboard.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search, Pencil, Pause, Play, Trash2, Briefcase, ArrowRight,
} from 'lucide-react'
import { buildJobSlug } from '@/lib/slugify'

type JobStatus = 'active' | 'paused' | 'expired'

interface EmployerJob {
  id: string
  title: string
  location: string
  postedAt: Date
  status: JobStatus
  clicks: number
  applications: number
}

function formatRelativeDate(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

const statusLabel: Record<JobStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  expired: 'Expired',
}

const statusBar: Record<JobStatus, string> = {
  active: 'bg-emerald-500',
  paused: 'bg-amber-500',
  expired: 'bg-slate-300',
}

const statusText: Record<JobStatus, string> = {
  active: 'text-emerald-700',
  paused: 'text-amber-700',
  expired: 'text-slate-500',
}

type Filter = 'all' | JobStatus

export default function EmployerDashboard({ initialJobs }: { initialJobs: EmployerJob[] }) {
  const [jobs, setJobs] = useState<EmployerJob[]>(initialJobs)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const stats = useMemo(() => {
    const active = jobs.filter((j) => j.status === 'active').length
    const totalClicks = jobs.reduce((sum, j) => sum + j.clicks, 0)
    const totalApplications = jobs.reduce((sum, j) => sum + j.applications, 0)
    const avgApplications = jobs.length ? Math.round((totalApplications / jobs.length) * 10) / 10 : 0
    return { active, totalClicks, totalApplications, avgApplications }
  }, [jobs])

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((j) => (filter === 'all' ? true : j.status === filter))
      .filter((j) => j.title.toLowerCase().includes(query.toLowerCase()))
  }, [jobs, filter, query])

  const counts = useMemo(() => ({
    all: jobs.length,
    active: jobs.filter((j) => j.status === 'active').length,
    paused: jobs.filter((j) => j.status === 'paused').length,
    expired: jobs.filter((j) => j.status === 'expired').length,
  }), [jobs])

  async function toggleStatus(id: string, currentStatus: JobStatus) {
    const action = currentStatus === 'active' ? 'pause' : 'activate'
    const res = await fetch(`/api/employer/jobs/${id}`, {
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

  async function deleteJob(id: string) {
    if (!confirm('Delete this job listing? This cannot be undone.')) return
    const res = await fetch(`/api/employer/jobs/${id}`, { method: 'DELETE' })
    if (!res.ok) return alert('Something went wrong.')
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  const conversionRate =
    stats.totalClicks > 0
      ? ((stats.totalApplications / stats.totalClicks) * 100).toFixed(1)
      : null

  const statItems = [
    {
      label: 'Active jobs',
      value: stats.active.toLocaleString(),
      sub:
        jobs.length === 0
          ? '—'
          : stats.active === 0
            ? 'all paused or expired'
            : `of ${jobs.length} total`,
    },
    {
      label: 'Total clicks',
      value: stats.totalClicks.toLocaleString(),
      sub: 'across all listings',
    },
    {
      label: 'Applications',
      value: stats.totalApplications.toLocaleString(),
      sub: conversionRate
        ? `${conversionRate}% apply rate`
        : jobs.length > 0
          ? 'no clicks yet'
          : '—',
    },
    {
      label: 'Avg. per job',
      value: stats.avgApplications.toString(),
      sub: 'applications per listing',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <header className="mb-10 md:mb-14">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium mb-5">
          <span>Employer</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#1a2340]">Dashboard</span>
        </div>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-[32px] md:text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] text-[#1a2340]">
              Your job postings
            </h1>
            <p className="text-[15px] text-slate-500 mt-3 max-w-md leading-relaxed">
              Track performance, manage listings, and respond to candidates.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/employer/new">
              Post a job
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Stats — flat grid, no card, just borders */}
      <section className="grid grid-cols-2 md:grid-cols-4 md:gap-0 gap-x-6 border-t border-slate-200 mb-12 md:mb-14">
        {statItems.map((item, i) => (
          <div
            key={item.label}
            className={[
              'py-6 md:py-7 md:px-6',
              i > 0 ? 'md:border-l border-slate-200' : '',
              i >= 2 ? 'border-t md:border-t-0 border-slate-200' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">
              {item.label}
            </div>
            <div className="mt-3 text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] text-[#1a2340] tabular-nums leading-none">
              {item.value}
            </div>
            <div className="text-[12.5px] text-slate-400 mt-2.5">{item.sub}</div>
          </div>
        ))}
      </section>

      {jobs.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-md py-24 px-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-200 mb-5">
            <Briefcase className="text-slate-400" size={18} />
          </div>
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-[#1a2340] mb-2">
            No jobs posted yet
          </h2>
          <p className="text-[14px] text-slate-500 max-w-sm mx-auto mb-7 leading-relaxed">
            Your first listing takes about two minutes. We&apos;ll guide you through it.
          </p>
          <Button asChild>
            <Link href="/dashboard/employer/new">
              Post your first job
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Filters — underline tabs with counts, not filled pills */}
          <div className="flex items-end justify-between gap-6 mb-5 flex-wrap">
            <nav
              className="flex gap-1 -mb-px overflow-x-auto"
              aria-label="Filter jobs by status"
            >
              {([
                { key: 'all' as Filter, label: 'All' },
                { key: 'active' as Filter, label: 'Active' },
                { key: 'paused' as Filter, label: 'Paused' },
                { key: 'expired' as Filter, label: 'Expired' },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={[
                    'px-3 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap',
                    filter === f.key
                      ? 'border-[#1a2340] text-[#1a2340]'
                      : 'border-transparent text-slate-500 hover:text-[#1a2340]',
                  ].join(' ')}
                >
                  {f.label}
                  <span
                    className={[
                      'ml-1.5 text-[11px] tabular-nums',
                      filter === f.key ? 'text-slate-500' : 'text-slate-400',
                    ].join(' ')}
                  >
                    {counts[f.key]}
                  </span>
                </button>
              ))}
            </nav>
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your jobs"
                className="pl-9 pr-12 h-9 rounded-md border-slate-200 focus-visible:ring-[#1a2340] focus-visible:ring-offset-1"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 h-5 text-[10px] font-mono text-slate-400 border border-slate-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* List — borderless rows with a left status bar */}
          <ul className="border-t border-slate-200" role="list">
            {filteredJobs.map((job) => (
              <li
                key={job.id}
                className="group relative flex items-center gap-4 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                {/* Status bar */}
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 rounded-r-full ${statusBar[job.status]}`}
                />

                {/* Job info */}
                <div className="flex-1 min-w-0 pl-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                      href={`https://www.oh-my-job.com/jobs/${job.id}/${buildJobSlug(job)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] font-medium text-[#1a2340] hover:underline underline-offset-2 decoration-slate-300 truncate"
                    >
                      {job.title}
                    </Link>
                    <span
                      className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${statusText[job.status]}`}
                    >
                      {statusLabel[job.status]}
                    </span>
                  </div>
                  <div className="text-[13px] text-slate-500 mt-1 flex items-center gap-2">
                    <span className="truncate">{job.location}</span>
                    <span className="text-slate-300">·</span>
                    <span>Posted {formatRelativeDate(job.postedAt)}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="hidden sm:flex items-center gap-7 text-right shrink-0">
                  <div className="min-w-[3.5rem]">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-medium">
                      Clicks
                    </div>
                    <div className="text-[15px] font-medium text-[#1a2340] tabular-nums mt-0.5">
                      {job.clicks.toLocaleString()}
                    </div>
                  </div>
                  <div className="min-w-[3.5rem]">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-medium">
                      Apps
                    </div>
                    <div className="text-[15px] font-medium text-[#1a2340] tabular-nums mt-0.5">
                      {job.applications.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Link
                    href={`/dashboard/employer/${job.id}/edit`}
                    title="Edit"
                    className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-[#1a2340] hover:bg-slate-100 transition-colors"
                  >
                    <Pencil size={15} />
                  </Link>
                  {job.status !== 'expired' && (
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
              <p className="text-sm text-slate-400">
                No jobs match <span className="text-slate-600">&quot;{query}&quot;</span>.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}