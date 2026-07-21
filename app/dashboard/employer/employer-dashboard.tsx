// app/dashboard/employer/employer-dashboard.tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Eye, Pencil, Pause, Play, Trash2, Briefcase } from 'lucide-react'
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

const statusDot: Record<JobStatus, string> = {
  active: 'bg-emerald-500',
  paused: 'bg-amber-500',
  expired: 'bg-gray-300',
}

const iconButtonClass =
  'w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#1a2340] hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'

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

  const statItems = [
    { label: 'Active jobs', value: stats.active },
    { label: 'Total clicks', value: stats.totalClicks },
    { label: 'Applications', value: stats.totalApplications },
    { label: 'Avg. per job', value: stats.avgApplications },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-[#1a2340]">Your job postings</h1>
          <p className="text-gray-500 mt-1">Track clicks and applications for every job you post.</p>
        </div>
        <Button size="lg" asChild>
          <Link href="/dashboard/employer/new">
            <Plus size={18} className="mr-1.5" />
            Post a new job
          </Link>
        </Button>
      </div>

      {/* Stats strip */}
      <div className="flex overflow-x-auto border border-gray-200 rounded-2xl mb-10 divide-x divide-gray-200">
        {statItems.map((item) => (
          <div key={item.label} className="flex-1 min-w-[140px] p-5">
            <div className="text-2xl font-mono tabular-nums font-semibold text-[#1a2340]">{item.value}</div>
            <div className="text-xs uppercase tracking-wide text-gray-400 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-2xl py-20 text-center">
          <Briefcase className="mx-auto text-gray-300 mb-4" size={32} />
          <h2 className="text-lg font-semibold text-[#1a2340] mb-1">You haven't posted a job yet</h2>
          <p className="text-gray-500 mb-6">Your first listing takes about two minutes to set up.</p>
          <Button asChild>
            <Link href="/dashboard/employer/new">
              <Plus size={18} className="mr-1.5" />
              Post your first job
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex gap-1 bg-gray-100 rounded-full p-1">
              {(['all', 'active', 'paused', 'expired'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filter === f ? 'bg-white text-[#1a2340] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f === 'all' ? 'All' : statusLabel[f]}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your jobs"
                className="pl-9 h-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="font-medium py-3 px-5">Job</th>
                    <th className="font-medium py-3 px-5">Status</th>
                    <th className="font-medium py-3 px-5">Posted</th>
                    <th className="font-medium py-3 px-5 text-right">Clicks</th>
                    <th className="font-medium py-3 px-5 text-right">Applications</th>
                    <th className="font-medium py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-[#1a2340]">{job.title}</div>
                        <div className="text-gray-500">{job.location}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${statusDot[job.status]}`} />
                          {statusLabel[job.status]}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-gray-500">{formatRelativeDate(job.postedAt)}</td>
                      <td className="py-4 px-5 text-right font-mono tabular-nums text-[#1a2340]">{job.clicks}</td>
                      <td className="py-4 px-5 text-right font-mono tabular-nums text-[#1a2340]">{job.applications}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`https://www.oh-my-job.com/jobs/${job.id}/${buildJobSlug(job)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View listing"
                            className={iconButtonClass}
                          >
                            <Eye size={16} />
                          </a>
                          <Link href={`/dashboard/employer/${job.id}/edit`} title="Edit" className={iconButtonClass}>
                            <Pencil size={16} />
                          </Link>
                          {job.status !== 'expired' && (
                            <button
                              type="button"
                              title={job.status === 'active' ? 'Pause' : 'Activate'}
                              onClick={() => toggleStatus(job.id, job.status)}
                              className={iconButtonClass}
                            >
                              {job.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                          )}
                          <button type="button" title="Delete" onClick={() => deleteJob(job.id)} className={iconButtonClass}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredJobs.length === 0 && (
            <p className="text-center text-gray-400 py-10">No jobs match your search.</p>
          )}
        </>
      )}
    </div>
  )
}