import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { hasAccountPermission } from '../lib/accountPermission'
import { roleDestination, getAccountRole } from '../lib/accountRole'
import { safeAuthRedirect } from '../lib/authRedirect'
import { validateEmployerJob } from '../lib/employerJobValidation'
import { parseCompensation } from '../lib/jobCompensation'
import { issueRecoveryGrant, validRecoveryGrant } from '../lib/recoveryGrant'
import { resolveJobSalary } from '../lib/resolveJobSalary'
import { matchesFilters } from '../lib/job-filters'
import { buildJobWhere, parseJobWhereParams } from '../lib/job-where'
import { normalizeWorkSetting, workSettingWhere } from '../lib/workSetting'
import { togglePopularJobFilter, getPopularJobFilterTags, isPopularJobFilterActive } from '../lib/popular-job-filters'
const require = createRequire(import.meta.url)
function client(role: string | null, consent = true, authenticated = true) {
 return {
 auth: { getUser: async () => ({ data: { user: authenticated ? { id: 'user', email_confirmed_at: '2026-10-07' } : null } }) },
 from: (table: string) => {
  const query: any = { select: () => query, eq: () => query, order: async () => ({ data: [], error: null }), maybeSingle: async () => ({ data: table === 'account_roles' ? role && { role } : consent ? { user_id: 'user' } : null, error: null }), insert: async () => ({ error: null }), delete: () => query, then: (resolve: any) => resolve({ error: null }) }
  return query
 },
 } as any
}
function route(file: string, supabase: any, globals: Record<string, unknown> = {}) {
 const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText
 const exported: any = {}
 const cookieValues = new Map<string,string>()
 const cookieStore = { get: (name: string) => cookieValues.has(name) ? { value: cookieValues.get(name) } : undefined, set: (name: string, value: string) => cookieValues.set(name,value), delete: (name: string) => cookieValues.delete(name) }
 const prisma = { job: { findUnique: async () => ({ id: 'job' }), create: async ({ data }: any) => data }, employerSubscription: { findUnique: async () => null } }
 const deps: Record<string, any> = {
  '@supabase/ssr': { createServerClient: (_url: string, _key: string, options: any) => { supabase._cookies = options.cookies; return supabase } }, '@/lib/stripe': { getAppUrl: () => 'https://www.solarroles.com' }, '@/lib/requestThrottle': require('../lib/requestThrottle'), 'next/headers': { cookies: () => cookieStore }, '@/lib/accountRole': { getAccountRole, roleDestination }, '@/lib/authRedirect': require('../lib/authRedirect'), '@/lib/accountConsent': require('../lib/accountConsent'), '@/lib/recoveryGrant': { issueRecoveryGrant }, '@/lib/accountPermission': { hasAccountPermission }, '@/lib/supabase-server': { createServerSupabase: async () => supabase }, '@/lib/prisma': { prisma },
  '@/lib/employerJobValidation': { validateEmployerJob }, '@/lib/jobCompensation': { parseCompensation }, '@/lib/sendJobPostedConfirmation': { sendJobPostedConfirmation: async () => {} },
  '@/lib/employerBilling': { hasPartnerAccess: () => false, PARTNER_ACTIVE_JOB_LIMIT: 10, PARTNER_FEATURED_JOB_LIMIT: 3 }, nanoid: { customAlphabet: () => () => 'test-id' },
 }
 vm.runInNewContext('(function(require, exports){' + output + '\n})', { console, URL, process, AbortSignal, ...globals })( (id: string) => deps[id] || require(id), exported )
 return exported
}
const request = (path: string, method: string, body?: unknown) => new Request('https://www.solarroles.com' + path, { method, ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) })
const posting = { title: 'Solar sales representative', company: 'Test', employmentType: 'Full-time', remote: true, description: 'A complete solar sales job description. '.repeat(35), notificationEmail: 'test@example.com', plan: 'featured', compensationType: 'COMMISSION_ONLY', commissionDetails: '10% of eligible sales, paid monthly.' }
for (const role of ['candidate','employer'] as const) {
 test(role + ' endpoint permissions', async () => {
  const saved = route('app/api/saved-jobs/route.ts', client(role))
  assert.equal((await saved.POST(request('/api/saved-jobs','POST',{ job_id: 'job' }))).status, role === 'candidate' ? 200 : 403)
  assert.equal((await saved.DELETE(request('/api/saved-jobs?job_id=job','DELETE'))).status, role === 'candidate' ? 200 : 403)
  const employer = route('app/api/employer/jobs/route.ts', client(role))
  assert.equal((await employer.POST(request('/api/employer/jobs','POST',posting))).status, role === 'employer' ? 201 : 403)
 })
 test(role + ' verification destination uses persisted role', () => {
  assert.equal(roleDestination(role), '/dashboard/' + role)
  assert.equal(roleDestination(role, '/dashboard/' + (role === 'candidate' ? 'employer' : 'candidate')), '/dashboard/' + role)
 })
}
test('unauthenticated mutations return 401', async () => {
 for(const file of ['app/api/saved-jobs/route.ts','app/api/employer/jobs/route.ts']) assert.equal((await route(file, client(null,true,false)).POST(request('/api/test','POST',posting))).status,401)
})
test('missing role and missing consent deny access; metadata never supplies permissions', async () => {
 assert.equal(await hasAccountPermission(client(null), 'user', 'candidate'),false)
 assert.equal(await hasAccountPermission(client('employer',false), 'user', 'employer'),false)
 assert.equal(await getAccountRole(client('candidate'), 'user'),'candidate')
})
test('redirects cannot leave SolarRoles or point back into auth', () => {
 for(const url of ['https://evil.test','//evil.test','/\\evil.test']) assert.equal(safeAuthRedirect(url),'/dashboard')
 assert.equal(roleDestination('employer','/auth/callback'),'/dashboard/employer')
 assert.equal(roleDestination('employer','/dashboard/employer/new?plan=featured'),'/dashboard/employer/new?plan=featured')
})
test('commission-only has no fabricated salary even when description includes projected earnings', () => {
 const result = parseCompensation({ ...posting, salaryMin: 0, salaryMax: 0 })
 assert.equal(result.salaryMin,null); assert.equal(result.salaryMax,null)
 const resolved = resolveJobSalary({ title: posting.title, compensationType: result.compensationType, description: 'Earn $150,000 to $200,000 a year.', salary: result.salary })
 assert.equal(resolved.salary_min,undefined); assert.equal(resolved.salary,'Commission only')
})
test('base plus commission retains only guaranteed salary and validates period/range', () => {
 const result = parseCompensation({ compensationType: 'BASE_COMMISSION', commissionDetails: '10% of sales', salaryMin: 20, salaryMax: 30, salaryPeriod: 'hour' })
 assert.equal(result.salaryMin,41600); assert.equal(result.salaryMax,62400); assert.match(result.salary,/commission/)
 for(const salaryMin of [0, -1, Infinity, 31]) assert.throws(() => parseCompensation({ salaryMin, salaryMax: 30, salaryPeriod: 'hour' }))
 assert.throws(() => parseCompensation({ compensationType: 'COMMISSION_ONLY' }))
})
test('recovery grant rejects forged, expired, another-user and another-session cookies', () => {
 process.env.AUTH_COOKIE_SECRET = 'test-only-secret-not-used-in-production'
 const now = 1000000, cookie = issueRecoveryGrant('user','validated-provider-session',now)
 assert.equal(validRecoveryGrant(cookie,'user','validated-provider-session',now),true)
 assert.equal(validRecoveryGrant(cookie,'user','other-session',now),false)
 assert.equal(validRecoveryGrant(cookie,'other-user','validated-provider-session',now),false)
 assert.equal(validRecoveryGrant(cookie + 'a','user','validated-provider-session',now),false)
 assert.equal(validRecoveryGrant(cookie,'user','validated-provider-session',now + 600001),false)
})
const job = { title: 'Solar installer', company: 'Test', location: 'Boston, MA', description: '', applyUrl: '', postedAt: null }
test('work settings are exclusive and unknown data is not onsite', () => {
 assert.equal(normalizeWorkSetting({ location: 'Remote - hybrid' }),'HYBRID')
 assert.equal(matchesFilters({ ...job, location: 'Hybrid remote' },{ arrangements:['Remote'] }),false)
 assert.equal(matchesFilters({ ...job, location: 'Remote' },{ arrangements:['Field / On-site'] }),false)
 assert.equal(matchesFilters(job,{ arrangements:['Field / On-site'] }),false)
 assert.equal(matchesFilters({ ...job, workSetting:'ON_SITE', description:'Remote equipment monitoring' },{ arrangements:['Field / On-site'] }),true)
})
test('structured experience wins; absent experience is not entry level', () => {
 assert.equal(matchesFilters(job,{ experience:'entry' }),false)
 assert.equal(matchesFilters({ ...job, experienceLevel:'MID_LEVEL', description:'All experience levels welcome' },{ experience:'entry' }),false)
 assert.equal(matchesFilters({ ...job, experienceLevel:'ENTRY_LEVEL' },{ experience:'entry' }),true)
 assert.equal(matchesFilters({ ...job, title:'Solar installer', description:'Reports to the director' },{ experience:'executive' }),false)
})
test('certifications use OR, pay perks use AND, commission uses structured values', () => {
 assert.equal(matchesFilters({ ...job, description:'OSHA-10 required' },{ certification:'osha10,osha30' }),true)
 assert.equal(matchesFilters({ ...job, description:'Health insurance' },{ benefits:['Health insurance','Company vehicle'] }),false)
 assert.equal(matchesFilters({ ...job, compensationType:'COMMISSION_ONLY' },{ benefits:['Commission pay'] }),true)
})
test('filter URL round trips preserve certification selections and clear pagination', () => {
 const tags = getPopularJobFilterTags('/solar-electrician-jobs'), tag = tags.find(t => t.id === 'osha-10')!
 const next = togglePopularJobFilter(new URLSearchParams('certification=osha30&page=3'),tag)
 assert.equal(next.get('certification'),'osha30,osha10'); assert.equal(next.has('page'),false)
 assert.equal(isPopularJobFilterActive(next,tag),true)
 assert.equal(parseJobWhereParams(next).certification,'osha30,osha10')
 assert.equal(togglePopularJobFilter(next,tag).get('certification'),'osha30')
})
test('salary threshold includes commission-only without attributing a salary', () => {
 assert.match(JSON.stringify(buildJobWhere({ salaryMin: 80000 })),/COMMISSION_ONLY/)
 assert.match(JSON.stringify(workSettingWhere(['Remote'])),/hybrid/)
})

for(const role of ['candidate','employer'] as const) test(role + ' email callback establishes the provider session and opens the correct dashboard', async () => {
 const auth = client(role)
 auth.auth.verifyOtp = async () => ({ data: { session: { access_token: 'provider-token' } }, error: null })
 const result = await route('app/auth/callback/route.ts',auth).GET(request('/auth/callback?token_hash=provider-test-token&type=email&redirectTo=/dashboard/' + (role === 'candidate' ? 'employer' : 'candidate'),'GET'))
 assert.equal(new URL(result.headers.get('location')!).pathname, '/dashboard/' + role)
})
test('expired email links return to login; expired recovery links cannot open the reset form', async () => {
 const auth = client(null,true,false)
 auth.auth.verifyOtp = async () => ({ error: { code: 'otp_expired' } })
 const callback = route('app/auth/callback/route.ts',auth)
 assert.equal(new URL((await callback.GET(request('/auth/callback?token_hash=expired&type=email','GET'))).headers.get('location')!).pathname,'/auth/login')
 assert.equal(new URL((await callback.GET(request('/auth/callback?token_hash=expired&type=recovery','GET'))).headers.get('location')!).pathname,'/auth/forgot-password')
})

test('signup validates confirmation and consent before the provider and never forwards confirmPassword', async () => {
 const auth = client(null)
 let submitted: any = null
 auth.auth.signUp = async (body: any) => { submitted = body; return { data: { session: null }, error: null } }
 const api = route('app/api/auth/signup/route.ts', auth)
 const body = { email:'test@example.com', password:'valid-password', confirmPassword:'different', accountType:'candidate', consent:{ ageConfirmed:true, termsAccepted:true, privacyAcknowledged:true } }
 assert.equal((await api.POST(request('/api/auth/signup','POST',body))).status,400)
 assert.equal(submitted,null)
 assert.equal((await api.POST(request('/api/auth/signup','POST',{...body,confirmPassword:body.password,consent:{...body.consent,termsAccepted:false}}))).status,400)
 assert.equal(submitted,null)
 assert.equal((await api.POST(request('/api/auth/signup','POST',{...body,confirmPassword:body.password}))).status,200)
 assert.equal('confirmPassword' in (submitted as any),false)
 assert.equal((submitted as any).options.data.accountType,'candidate')
 assert.equal((submitted as any).options.data.consent.termsAccepted,true)
})
test('contact returns provider error, preserves reply-to and only reports success with a delivery ID', async () => {
 let payload: any = null
 let accepted = false
 const api = route('app/api/contact/route.ts',client(null),{ process:{env:{RESEND_API_KEY:'test-key',RESEND_FROM_EMAIL:'SolarRoles <noreply@solarroles.com>'}}, fetch: async (_url: string, options: any) => {
  payload = JSON.parse(options.body)
  return new Response(JSON.stringify(accepted ? {id:'test-delivery'} : {name:'validation_error'}),{status:accepted?200:422})
 } })
 const message = {name:'Test <visitor>',email:'test@example.com',subject:'General inquiry',message:'A simulated message, never sent.'}
 assert.equal((await api.POST(request('/api/contact','POST',message))).status,502)
 assert.equal(payload.reply_to,message.email)
 assert.equal(JSON.stringify(payload.to),JSON.stringify(['contact@solarroles.com']))
 assert.match(payload.html,/&lt;visitor&gt;/)
 accepted = true
 assert.equal((await api.POST(request('/api/contact','POST',message))).status,200)
})

test('anonymous middleware keeps Post a Job public without contacting Auth', async () => {
 const auth = client(null,true,false)
 let calls = 0
 auth.auth.getUser = async () => { calls++; return { data:{ user:null } } }
 const { NextRequest } = require('next/server')
 const response = await route('middleware.ts',auth).middleware(new NextRequest('https://www.solarroles.com/dashboard/post-a-job'))
 assert.equal(calls,0); assert.equal(response.status,200); assert.equal(response.headers.get('location'),null)
})
test('middleware forwards refreshed session cookies to server rendering and the browser', async () => {
 const auth = client('candidate')
 auth.auth.getUser = async () => { auth._cookies.setAll([{name:'sb-test-auth-token',value:'refreshed',options:{path:'/'}}]); return {data:{user:{id:'user'}}} }
 const { NextRequest } = require('next/server')
 const response = await route('middleware.ts',auth).middleware(new NextRequest('https://www.solarroles.com/jobs',{headers:{cookie:'sb-test-auth-token=expired'}}))
 assert.equal(response.cookies.get('sb-test-auth-token')?.value,'refreshed')
 assert.match(response.headers.get('x-middleware-request-cookie'),/refreshed/)
 assert.equal(response.headers.get('Cache-Control'),'private, no-store')
})
