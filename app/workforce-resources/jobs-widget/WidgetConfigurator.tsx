'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { getWidgetJobRole, WIDGET_JOB_ROLES } from '@/lib/widgetJobRoles'

type StateOption = {
  code: string
  name: string
}

const ALLOWED_LIMITS = [4, 6, 8, 10]

export default function WidgetConfigurator({
  states,
}: {
  states: StateOption[]
}) {
  const [state, setState] = useState('CA')
  const [limit, setLimit] = useState(6)
  const [entryOnly, setEntryOnly] = useState(false)
  const [title, setTitle] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const requestedState = params.get('state')?.trim().toUpperCase()

    if (
      requestedState &&
      states.some((option) => option.code === requestedState)
    ) {
      setState(requestedState)
    }

    const requestedLimit = Number(params.get('limit'))

    if (ALLOWED_LIMITS.includes(requestedLimit)) {
      setLimit(requestedLimit)
    }

    const requestedEntry = params.get('entry')

    if (
      requestedEntry === '1' ||
      requestedEntry?.toLowerCase() === 'true'
    ) {
      setEntryOnly(true)
    }

    const requestedTitle = getWidgetJobRole(params.get('title'))
    if (requestedTitle) {
      setTitle(requestedTitle.slug)
    }
  }, [states])

  const query = useMemo(() => {
    const params = new URLSearchParams({
      state,
      limit: String(limit),
    })

    if (entryOnly) {
      params.set('entry', '1')
    }

    if (title) {
      params.set('title', title)
    }

    return params.toString()
  }, [state, limit, entryOnly, title])

  const src = `https://www.solarroles.com/embed/solar-jobs?${query}`

  const previewSrc = `/embed/solar-jobs?${query}`

  const selectedState = states.find(
    (option) => option.code === state
  )

  const browseLocation = selectedState?.name ?? state
  const selectedTitle = getWidgetJobRole(title)
  const browseParams = new URLSearchParams({ where: browseLocation })

  if (entryOnly) {
    browseParams.set('entry_level', 'true')
    if (selectedTitle) browseParams.set('what', selectedTitle.searchTerm)
  }

  const browsePath = selectedTitle && !entryOnly ? selectedTitle.jobsPath : '/jobs'
  const browseUrl = `https://www.solarroles.com${browsePath}?${browseParams}`
  const browseLabel = entryOnly
    ? `Search entry-level ${selectedTitle?.label.toLowerCase() ?? 'solar'} jobs in ${browseLocation}`
    : `Browse ${selectedTitle?.label.toLowerCase() ?? 'solar'} jobs in ${browseLocation}`

  const embedCode = `<div style="max-width:760px">
  <iframe
    src="${src}"
    title="${selectedTitle?.heading ?? 'Solar jobs'} in ${browseLocation} from Solar Roles"
    width="100%"
    height="620"
    style="border:0;border-radius:16px;overflow:hidden"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
  ></iframe>
  <p style="margin:8px 0 0;font:14px/1.5 system-ui,sans-serif">
    <a
      href="${browseUrl}"
      target="_blank"
      rel="noopener"
    >${browseLabel}</a>
  </p>
</div>`

  async function copyCode() {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 1800)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-950">
          Build your feed
        </h2>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-800">
              State
            </span>

            <select
              value={state}
              onChange={(event) => setState(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900"
            >
              {states.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-800">Title</span>
            <select
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900"
            >
              <option value="">All solar jobs</option>
              {WIDGET_JOB_ROLES.map((role) => (
                <option key={role.slug} value={role.slug}>{role.label}</option>
              ))}
            </select>
            <span className="mt-2 block text-xs leading-5 text-gray-500">
              Filters current openings by job-title terms. Some related titles may not appear.
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-800">
              Number of jobs
            </span>

            <select
              value={limit}
              onChange={(event) =>
                setLimit(Number(event.target.value))
              }
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900"
            >
              {ALLOWED_LIMITS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
            <input
              type="checkbox"
              checked={entryOnly}
              onChange={(event) =>
                setEntryOnly(event.target.checked)
              }
              className="mt-1 h-4 w-4"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Entry-level only
              </span>

              <span className="mt-1 block text-xs leading-5 text-gray-500">
                Uses explicit entry-level or no-experience language in
                the listing.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-6 rounded-2xl bg-gray-950 p-4 text-xs text-gray-200">
          <pre className="whitespace-pre-wrap break-all font-mono leading-5">
            {embedCode}
          </pre>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}

          {copied ? 'Copied' : 'Copy embed code'}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-950">
          Live preview
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          This is the widget visitors will see. Change the settings on
          the left and the preview updates immediately.
        </p>

        <iframe
          key={previewSrc}
          src={previewSrc}
          title={`${selectedTitle?.heading ?? 'Solar jobs'} in ${browseLocation} widget preview`}
          className="mt-4 h-[620px] w-full rounded-2xl border border-gray-200 bg-white"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />

        <p className="mt-2 text-xs leading-5 text-gray-500">
          If the preview is blocked,{' '}
          <a
            href={browseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-700 underline underline-offset-2"
          >
            open the matching jobs page
          </a>
          .
        </p>
      </div>
    </div>
  )
}
