import crypto from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE_NAME = 'oh_my_job_admin'

function getExpectedToken(adminPassword: string) {
  return crypto.createHmac('sha256', adminPassword).update('admin-session').digest('hex')
}

export function signAdminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  return getExpectedToken(password)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return false

  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  if (!token) return false

  const expected = getExpectedToken(password)
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}