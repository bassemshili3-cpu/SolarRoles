import { inspectRawContentExclusion, visibleCaptureText, CONTENT_EXCLUSION_VERSION } from './rawContentExclusions.mjs'
import { inspectRecruitmentWorkflow } from './archivedRecruitmentPage.mjs'
import { parseJobLocation, canDiscardNonUS, LOCATION_PARSER_VERSION } from './jobLocation.mjs'

export const JOB_CAPTURE_TRIAGE_VERSION = `20261004-v1+${CONTENT_EXCLUSION_VERSION}+${LOCATION_PARSER_VERSION}`
export const LEGACY_JOB_CAPTURE_TRIAGE_VERSION = `20261004-v1+${CONTENT_EXCLUSION_VERSION}`
export const canReuseRetainedTriage=triage=>triage?.version===LEGACY_JOB_CAPTURE_TRIAGE_VERSION||triage?.version?.startsWith(LEGACY_JOB_CAPTURE_TRIAGE_VERSION+'+20261005-us-v')

export function jobCaptureStorageDecision(triage, ambiguousPolicy = 'retain') {
  if (triage.disposition === 'non_job') return 'filtered_non_job'
  if (triage.disposition === 'job' && canDiscardNonUS(triage.location)) return 'filtered_non_us'
  if (triage.location?.usStatus === 'AMBIGUOUS') return 'store'
  if (triage.disposition === 'ambiguous' && ambiguousPolicy === 'metadata' && !triage.forceRetain)
    return 'review_metadata_only'
  return 'store'
}

const jsonJobs = (value, nativeJobEndpoint = false) => {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some(item=>jsonJobs(item,nativeJobEndpoint))
  const type = [value['@type']].flat().some(item => /(?:^|\/)JobPosting$/i.test(String(item)))
  if (type && (value.title || value.name) && value.description) return true
  if ((value.title || value.name || value.text || value.jobTitle) && (value.description || value.content || value.descriptionPlain || value.jobDescription) &&
      (nativeJobEndpoint && value.id || value.requisitionId || value.jobId || value.jobReqId || value.employmentType || value.hiringOrganization)) return true
  return Object.values(value).some(child => child && typeof child === 'object' && jsonJobs(child,nativeJobEndpoint))
}

/** Classify the archived body, not merely a URL or an ATS host. */
export function triageJobCapture(original, body, contentType = '') {
  const triage = inspectJobCapture(original, body, contentType)
  return { ...triage, location: parseJobLocation(original, body, contentType, { jobDisposition: triage.disposition }) }
}

function inspectJobCapture(original, body, contentType = '') {
  const text = Buffer.isBuffer(body) ? body.toString('utf8') : String(body)
  if (/json/i.test(contentType) || /^[\s\uFEFF]*[\[{]/.test(text)) {
    try {
      const url = new URL(original)
      const nativeJobEndpoint = /(?:^|\.)(?:greenhouse\.io|lever\.co|myworkdayjobs\.com|icims\.com|jobvite\.com)$/i.test(url.hostname) && /(?:jobs?|postings|requisitions)/i.test(url.pathname)
      if (jsonJobs(JSON.parse(text), nativeJobEndpoint)) return { disposition: 'job', reason: 'json_job_record', version: JOB_CAPTURE_TRIAGE_VERSION }
    } catch {}
  }
  const exclusion = inspectRawContentExclusion(original, text)
  if (exclusion) return { disposition: 'non_job', reason: exclusion.signature,
    version: JOB_CAPTURE_TRIAGE_VERSION, exclusionVersion: exclusion.version }
  let workflow
  try { workflow = inspectRecruitmentWorkflow(original, text) }
  catch { return { disposition: 'ambiguous', reason: 'workflow_parse_error', version: JOB_CAPTURE_TRIAGE_VERSION } }
  if (workflow.kind === 'structured_job' || workflow.kind === 'job_detail' ||
      workflow.jobPostings?.some(posting => (posting.title || posting.name) && posting.description))
    return { disposition: 'job', reason: workflow.kind ?? 'html_jobposting',
      version: JOB_CAPTURE_TRIAGE_VERSION, title: workflow.title?.slice(0, 180) }
  const route = new URL(original).pathname
  const visible = visibleCaptureText(text)
  if (/\/(?:jobs?|job[_-]?details?|positions?|vacancies)\/[a-z0-9][a-z0-9_-]{2,}(?:\/|$)/i.test(route) &&
      /\b(?:job\s*(?:id|number)|requisition\s*(?:id|number))\s*:/i.test(visible) &&
      /\b(?:job description|responsibilities|qualifications)\b/i.test(visible) &&
      /\bapply (?:now|for (?:this|the) (?:job|position))\b/i.test(visible))
    return { disposition: 'job', reason: 'unstructured_job_detail',
      version: JOB_CAPTURE_TRIAGE_VERSION, title: workflow.title?.slice(0, 180) }
  return { disposition: 'ambiguous', reason: workflow.shell ? 'javascript_shell' :
    workflow.kind ?? workflow.nonRecruitment ?? 'unresolved_content',
    version: JOB_CAPTURE_TRIAGE_VERSION, title: workflow.title?.slice(0, 180) }
}
