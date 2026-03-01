'use client'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const supabase = createClient()
  const router = useRouter()

  const signupWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold mb-6">Create your free account</h1>
        <Button onClick={signupWithGoogle} size="lg" className="w-full text-lg py-8">
          Sign up with Google
        </Button>
        <p className="mt-8 text-sm">Already have an account? <a href="/auth/login" className="underline">Log in</a></p>
      </div>
    </div>
  )
}