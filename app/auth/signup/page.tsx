'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  Check,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react'

export default function Signup() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramRedirect = searchParams.get('redirectTo')
  const redirectTo = paramRedirect || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [checkEmail, setCheckEmail] = useState(false)

  const signupWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` },
    })
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return setError('Enter a valid email address.')
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.')
    }

    setIsSubmitting(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      // If email confirmation is required, there's no active session yet.
      if (data.session) {
        router.push(redirectTo)
        router.refresh()
      } else {
        setCheckEmail(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const perks = [
    { icon: DollarSign, text: 'Salaries shown upfront' },
    { icon: Sparkles, text: 'Smart filters that match you' },
  ]

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* ───────── LEFT — brand panel ───────── */}
      <aside className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#C9991F] via-[#5B1F7A] to-[#2D0F3F] text-white overflow-hidden">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-[#E8B339]/30 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 w-[28rem] h-[28rem] bg-[#9D4EDD]/25 rounded-full blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-[#FCE9A8] hover:text-white transition-colors"
        >
          <Briefcase className="w-4 h-4" />
          Oh My Job
        </Link>

        <div className="relative z-10 space-y-8 max-w-md">
          <h2 className="text-4xl xl:text-5xl font-bold tracking-tighter leading-[1.05]">
            Start matching with roles 
            <br />
            <span className="bg-gradient-to-r from-[#FCE9A8] to-white bg-clip-text text-transparent">
              that fit you in under 30 seconds.
            </span>
          </h2>

          <ul className="space-y-3 pt-2">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E8B339]/15 backdrop-blur-sm border border-[#E8B339]/25">
                  <Icon className="w-4 h-4 text-[#FCE9A8]" />
                </span>
                <span className="text-sm font-medium">{text}</span>
                <Check className="w-4 h-4 text-[#FCE9A8] ml-auto opacity-80" />
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs text-[#C4A8D4]/70">
          <span>© {new Date().getFullYear()} Oh My Job</span>
          <span className="w-1 h-1 rounded-full bg-[#E8B339]/40" />
          <span>Smart job search</span>
        </div>
      </aside>

      {/* ───────── RIGHT — form panel ───────── */}
      <main className="flex flex-col p-6 sm:p-10 lg:p-14 xl:p-20">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="lg:hidden inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-[#C9991F]"
          >
            <Briefcase className="w-4 h-4" />
            Oh My Job
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md space-y-8">
            {checkEmail ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-14 h-14 rounded-2xl bg-[#F5EEF7] flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-[#3D1654]" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#3D1654]">
                  Check your email
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                  We sent a confirmation link to <span className="font-medium text-[#3D1654]">{email}</span>.
                  Click it to activate your account.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-[#3D1654] leading-[1.05]">
                    Create your account
                  </h1>
                </div>

                {error && (
                  <div className="px-4 py-3 border border-red-200 rounded-xl bg-red-50">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Google CTA */}
                <Button
                  onClick={signupWithGoogle}
                  variant="outline"
                  size="lg"
                  className="group relative w-full h-14 text-base font-semibold rounded-2xl border-[#EDE5F0] bg-white hover:bg-[#FAF7FC] hover:border-[#E8D5F0] hover:shadow-lg hover:shadow-[#C9991F]/5 transition-all duration-200"
                >
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  Sign up with Google
                  <ArrowRight className="w-4 h-4 ml-2 text-gray-400 group-hover:text-[#C9991F] group-hover:translate-x-1 transition-all duration-200" />
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#EDE5F0]" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Or
                  </span>
                  <div className="h-px flex-1 bg-[#EDE5F0]" />
                </div>

                {/* Email + password form */}
                <form onSubmit={handleEmailSignup} className="space-y-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-12 rounded-xl border-[#EDE5F0] focus-visible:ring-[#F5EEF7] focus-visible:border-[#3D1654]"
                  />
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="h-12 rounded-xl pr-11 border-[#EDE5F0] focus-visible:ring-[#F5EEF7] focus-visible:border-[#3D1654]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">At least 8 characters.</p>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl text-base font-semibold bg-[#C9991F] hover:bg-[#B0841A]"
                  >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link
                    href={paramRedirect ? `/auth/login?redirectTo=${paramRedirect}` : '/auth/login'}
                    className="font-medium text-[#C9991F] hover:underline underline-offset-2"
                  >
                    Log in
                  </Link>
                </p>

               

                {/* Trust + legal */}
                <div className="space-y-3 pt-2">
                  <p className="text-center text-xs text-gray-400">
                    By continuing, you agree to our{' '}
                    <Link
                      href="/terms"
                      className="underline underline-offset-2 hover:text-gray-600"
                    >
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="underline underline-offset-2 hover:text-gray-600"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    Your data is encrypted and never sold.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer (mobile only — desktop footer is on the left) */}
        <p className="lg:hidden text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Oh My Job · Smart job search across all
          50 states
        </p>
      </main>
    </div>
  )
}

/* ─── Brand-correct Google G ─── */

function GoogleIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}