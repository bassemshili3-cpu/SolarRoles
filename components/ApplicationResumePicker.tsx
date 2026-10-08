'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { validateResumeFile } from '@/lib/resume-storage'

export type ApplicationResume = { mode: 'link'; url: string } | { mode: 'file'; file: File } | { mode: 'saved'; path: string }
type SavedResume = { name: string; path: string; url: string; isPdf: boolean }

export default function ApplicationResumePicker({ value, onChange, disabled }: {
  value: ApplicationResume
  onChange: (resume: ApplicationResume) => void
  disabled: boolean
}) {
  const [saved, setSaved] = useState<SavedResume | null>(null)
  const [signedIn, setSignedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (!active) return
        if (authError || !user) return
        setSignedIn(true)
        const storage = supabase.storage.from('resumes')
        const { data, error: listError } = await storage.list(user.id, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
        if (listError) throw listError
        let latest = data?.find(file => file.id && file.name !== '.emptyFolderPlaceholder')
        let path = latest ? `${user.id}/${latest.name}` : ''
        let name = latest?.name.replace(/^\d+-/, '') || ''
        if (!latest) {
          const { data: legacy, error: legacyError } = await storage.list('public', { search: `${user.id}-`, limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
          if (legacyError) throw legacyError
          latest = legacy?.find(file => file.id && file.name.startsWith(`${user.id}-`))
          if (latest) { path = `public/${latest.name}`; name = latest.name.slice(user.id.length + 1).replace(/^\d+-/, '') }
        }
        if (!latest) return
        const { data: signed, error: signError } = await storage.createSignedUrl(path, 3600)
        if (signError || !signed) throw signError || new Error('Could not load saved resume.')
        if (active) setSaved({ path, name, url: signed.signedUrl, isPdf: name.toLowerCase().endsWith('.pdf') })
      } catch {
        if (active) setError('Could not load your dashboard resume. You can still choose a file or add a link.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (value.mode !== 'file') { setPreviewUrl(''); return }
    const url = URL.createObjectURL(value.file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [value])

  const selected = value.mode === 'saved' ? saved : value.mode === 'file'
    ? { name: value.file.name, url: previewUrl, isPdf: value.file.name.toLowerCase().endsWith('.pdf') } : null

  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="mb-2 text-sm font-semibold text-gray-700">Resume</legend>
      {loading && <p className="text-xs text-gray-500">Checking your saved resume...</p>}
      {saved && <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
        <input type="radio" name="resume-choice" checked={value.mode === 'saved'} onChange={() => { setError(''); onChange({ mode: 'saved', path: saved.path }) }} className="mt-1 accent-amber-700" />
        <span>Use my dashboard resume<span className="block break-all text-xs text-gray-600">{saved.name}</span></span>
      </label>}
      <label className="block text-sm font-medium text-gray-700" htmlFor="application-resume-file">Attach a file</label>
      <input id="application-resume-file" type="file" accept=".pdf,.doc,.docx" disabled={disabled || !signedIn || loading} className="block w-full text-sm" onChange={event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        try { validateResumeFile(file); setError(''); onChange({ mode: 'file', file }) }
        catch (err) { setError(err instanceof Error ? err.message : 'Invalid file.') }
      }} />
      <p className="text-xs text-gray-500">PDF, DOC or DOCX, max 5 MB. {!loading && !signedIn && 'Sign in to attach a file or use your saved resume. You can also apply with a resume link below.'}</p>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="radio" name="resume-choice" checked={value.mode === 'link'} onChange={() => { setError(''); onChange({ mode: 'link', url: '' }) }} className="accent-amber-700" />
        Use a resume link instead
      </label>
      {value.mode === 'link' && <input aria-label="Resume link" type="url" value={value.url} onChange={event => onChange({ mode: 'link', url: event.target.value })} placeholder="https://drive.google.com/..." className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm" />}
      {selected && <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="break-all text-sm font-medium">{selected.name}</p>
          <a href={selected.url || undefined} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-amber-900 underline">{selected.isPdf ? 'Open PDF' : 'Open / download'}</a>
        </div>
        {selected.isPdf && selected.url ? <iframe src={selected.url} title="Selected resume preview" className="h-80 w-full rounded-md border" /> : <p className="text-xs text-gray-500">PDF files can be previewed here. Open or download Word documents to view them.</p>}
      </div>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </fieldset>
  )
}
