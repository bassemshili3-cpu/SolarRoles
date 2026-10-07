import { STATES } from './usStates'
export const POSTING_DESCRIPTION_MIN = 1000
export function validateEmployerJob(body: Record<string, unknown>) {
 const required = (field: string, max: number) => typeof body[field] === 'string' && !!(body[field] as string).trim() && (body[field] as string).length <= max
 if (!required('title',200) || !required('company',200)) return 'Add a job title and company name (up to 200 characters each).'
 if (!['Full-time','Part-time','Contract','Temporary','Internship'].includes(String(body.employmentType))) return 'Choose a valid employment type.'
 if (typeof body.remote !== 'boolean') return 'Choose whether this role is remote.'
 if (!body.remote) {
  if (!required('city',120) || typeof body.state !== 'string' || !Object.values(STATES).includes(body.state)) return 'Add a valid city and US state.'
  if (typeof body.zipCode !== 'string' || !/^\d{5}(-\d{4})?$/.test(body.zipCode)) return 'Add a valid ZIP code.'
 }
 if (!required('description',50000) || (body.description as string).trim().length < POSTING_DESCRIPTION_MIN) return 'Add a description of at least 1,000 characters (up to 50,000).'
 if (!required('notificationEmail',254) || !/^\S+@\S+\.\S+$/.test(body.notificationEmail as string) || /[\r\n]/.test(body.notificationEmail as string)) return 'Add a valid notification email.'
 return null
}
