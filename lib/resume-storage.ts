export const RESUME_MAX_BYTES = 5 * 1024 * 1024
export const RESUME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export function validateResumeFile(file: { name: string; size: number }) {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!RESUME_TYPES[extension]) throw new Error('Choose a PDF, DOC or DOCX file.')
  if (!file.size || file.size > RESUME_MAX_BYTES) throw new Error('The file must be between 1 byte and 5 MB.')
  return { extension, contentType: RESUME_TYPES[extension] }
}

export function isOwnDashboardResume(path: string, userId: string) {
  const parts = path.split('/')
  return parts.length === 2 && !parts.some(part => !part || part === '.' || part === '..') && (
    parts[0] === userId || (parts[0] === 'public' && parts[1].startsWith(`${userId}-`))
  )
}
