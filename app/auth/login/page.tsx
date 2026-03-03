'use client'

import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const loginWithGoogle = async () => {
    setIsLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` }
    })
    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  const loginWithEmail = async () => {
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    setIsLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') loginWithEmail()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="flex items-center gap-3 mb-16" />

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Find your next<br />
            <span className="text-blue-400">dream career</span>
          </h1>
          
          <p className="text-lg text-slate-300 mb-12 max-w-md">
            Join thousands of professionals who found their perfect job through Oh My Job
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-white/90 text-lg italic mb-4">
              "I found my dream job in just 2 weeks. The platform made it so easy to connect with amazing companies."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                SJ
              </div>
              <div>
                <p className="text-white font-medium">Sarah Johnson</p>
                <p className="text-slate-400 text-sm">Software Engineer at TechCorp</p>
              </div>
            </div>
          </div>

          <div className="flex gap-12 mt-12">
            <div>
              <p className="text-3xl font-bold text-white">6M+</p>
              <p className="text-slate-400">Active Jobs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-slate-400">Companies</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">75%</p>
              <p className="text-slate-400">Hired within 30 days</p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 lg:p-12 xl:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900">Oh My Job</span>
            </div>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Please enter your details to sign in</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-3 h-14 text-base font-medium border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 rounded-xl mb-6"
            onClick={loginWithGoogle}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-sm text-slate-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2.5 block">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
                className="h-12 text-base px-4 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                className="h-12 text-base px-4 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>

            <Button 
              className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30"
              onClick={loginWithEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>

          <p className="text-center text-slate-500 mt-8">
            New to Oh My Job?{' '}
            <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Create a free account
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-slate-600">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}