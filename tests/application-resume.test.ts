import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { NextResponse } from 'next/server'
import { isOwnDashboardResume, validateResumeFile } from '../lib/resume-storage'

function harness({ signedIn = true, source = 'employer', dbFails = false, signFails = false, expiresAt = null as Date | null } = {}) {
  const calls = { uploaded: [] as string[], removed: [] as string[], downloaded: [] as string[], application: null as any, notification: null as any }
  const storage = {
    download: async (path: string) => { calls.downloaded.push(path); return { data: new Blob(['%PDF-test']), error: null } },
    upload: async (path: string) => { calls.uploaded.push(path); return { error: null } },
    createSignedUrl: async () => ({ data: signFails ? null : { signedUrl: 'https://storage.example/application-copy' }, error: signFails ? new Error('sign failed') : null }),
    remove: async (paths: string[]) => { calls.removed.push(...paths); return { data: paths, error: null } },
  }
  const dependencies: Record<string, unknown> = {
    'next/server': { NextResponse },
    'node:crypto': { randomUUID: () => 'unique-copy' },
    '@/lib/resume-storage': { isOwnDashboardResume, validateResumeFile, RESUME_MAX_BYTES: 5 * 1024 * 1024 },
    '@/lib/supabase-server': { createServerSupabase: async () => ({ auth: { getUser: async () => ({ data: { user: signedIn ? { id: 'candidate-id' } : null }, error: null }) }, storage: { from: () => storage } }) },
    '@/lib/prisma': { prisma: { job: { findUnique: async () => ({ id: 'employer-job', source, active: true, deletedAt: null, expiresAt, title: 'Installer', applyUrl: 'mailto:employer@example.com' }) }, jobApplication: { create: async ({ data }: any) => { if (dbFails) throw new Error('DB failed'); calls.application = data; return { id: 'application-id' } } } } },
    '@/lib/sendApplicationNotification': { sendApplicationNotification: async (data: any) => { calls.notification = data } },
  }
  const output = ts.transpileModule(fs.readFileSync('app/api/jobs/[id]/apply/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exported: any = {}
  vm.runInNewContext('(function(require,exports){' + output + '\n})', { console, Buffer, Blob, File, Date })(
    (name: string) => { if (!dependencies[name]) throw new Error('Unexpected import ' + name); return dependencies[name] }, exported,
  )
  return { calls, post: (body: FormData | Record<string, unknown>) => exported.POST(new Request('https://solarroles.com/api/jobs/employer-job/apply', body instanceof FormData ? { method: 'POST', body } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), { params: Promise.resolve({ id: 'employer-job' }) }) }
}
const identity = { name: 'Test candidate', email: 'candidate@example.com' }

test('ownership excludes another account, traversal and application snapshots', () => {
  assert.equal(isOwnDashboardResume('candidate-id/123-cv.pdf', 'candidate-id'), true)
  assert.equal(isOwnDashboardResume('public/candidate-id-123-cv.pdf', 'candidate-id'), true)
  for (const path of ['other-id/cv.pdf', 'public/other-id-cv.pdf', 'candidate-id/../cv.pdf', 'candidate-id/applications/cv.pdf']) assert.equal(isOwnDashboardResume(path, 'candidate-id'), false)
  assert.throws(() => validateResumeFile({ name: 'cv.exe', size: 10 }))
  assert.throws(() => validateResumeFile({ name: 'cv.pdf', size: 5 * 1024 * 1024 + 1 }))
})
test('saved resume becomes an independent application copy and an email attachment', async () => {
  const api = harness()
  const response = await api.post({ ...identity, resumePath: 'candidate-id/123-cv.pdf' })
  assert.equal(response.status, 201)
  assert.deepEqual(api.calls.downloaded, ['candidate-id/123-cv.pdf'])
  assert.deepEqual(api.calls.uploaded, ['candidate-id/applications/unique-copy-cv.pdf'])
  assert.equal(api.calls.application.resumeUrl, 'https://storage.example/application-copy')
  assert.equal(api.calls.notification.resumeAttachment.filename, 'cv.pdf')
  assert.equal(api.calls.notification.resumeAttachment.content.toString(), '%PDF-test')
  assert.deepEqual(api.calls.removed, [])
})
test('multipart file is attached without creating a dashboard resume', async () => {
  const api = harness()
  const body = new FormData()
  for (const [key, value] of Object.entries(identity)) body.set(key, value)
  body.set('resumeFile', new File(['%PDF-upload'], 'new-cv.pdf', { type: 'application/pdf' }))
  assert.equal((await api.post(body)).status, 201)
  assert.deepEqual(api.calls.uploaded, ['candidate-id/applications/unique-copy-new-cv.pdf'])
  assert.deepEqual(api.calls.downloaded, [])
})
test('attachment requires sign-in and another user resume is rejected before download', async () => {
  const anonymous = harness({ signedIn: false })
  assert.equal((await anonymous.post({ ...identity, resumePath: 'candidate-id/cv.pdf' })).status, 401)
  const api = harness()
  assert.equal((await api.post({ ...identity, resumePath: 'other-id/cv.pdf' })).status, 403)
  assert.deepEqual(api.calls.downloaded, [])
})
test('legacy link applications still work without an account', async () => {
  const api = harness({ signedIn: false })
  assert.equal((await api.post({ ...identity, resumeUrl: 'https://example.com/cv.pdf' })).status, 201)
  assert.equal(api.calls.application.resumeUrl, 'https://example.com/cv.pdf')
  assert.deepEqual(api.calls.uploaded, [])
})
test('invalid files and conflicting resume choices never create an application', async () => {
  for (const file of [new File(['test'], 'cv.exe'), new File([], 'cv.pdf'), new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'cv.pdf')]) {
    const api = harness()
    const body = new FormData()
    for (const [key, value] of Object.entries(identity)) body.set(key, value)
    body.set('resumeFile', file)
    assert.equal((await api.post(body)).status, 400)
    assert.deepEqual(api.calls.uploaded, [])
    assert.equal(api.calls.application, null)
  }
  const api = harness()
  assert.equal((await api.post({ ...identity, resumeUrl: 'https://example.com/cv.pdf', resumePath: 'candidate-id/cv.pdf' })).status, 400)
  assert.equal(api.calls.application, null)
})
test('external and expired jobs cannot receive internal applications', async () => {
  assert.equal((await harness({ source: 'adzuna' }).post(identity)).status, 400)
  assert.equal((await harness({ expiresAt: new Date(0) }).post(identity)).status, 404)
})
test('failed DB insertion or signing cleans up only the new application copy', async () => {
  for (const options of [{ dbFails: true }, { signFails: true }]) {
    const api = harness(options)
    assert.equal((await api.post({ ...identity, resumePath: 'candidate-id/123-cv.pdf' })).status, 500)
    assert.deepEqual(api.calls.removed, ['candidate-id/applications/unique-copy-cv.pdf'])
    assert.equal(api.calls.notification, null)
  }
})
