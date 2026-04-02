'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function SignInPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [oauthError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('error')
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabaseBrowser.auth.getUser()
      setUserEmail(data.user?.email ?? null)
    })()
  }, [])

  const displayedError = errorMessage || oauthError

  async function signInWithGoogle() {
    setLoading(true)
    setErrorMessage(null)

    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : ''

    const redirectTo = origin ? `${origin}/auth/callback` : '/auth/callback'

    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    setLoading(false)
    if (error) setErrorMessage(error.message)
  }

  async function signOut() {
    setLoading(true)
    setErrorMessage(null)
    await supabaseBrowser.auth.signOut()
    setLoading(false)
    setUserEmail(null)
    router.push('/auth/sign-in')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute left-1/2 top-[-140px] h-80 w-[56rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-300/15 via-fuchsia-300/15 to-emerald-300/15 blur-3xl animate-gradient-shift" />
      </div>

      <div className="relative mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-slate-900/70 p-8 backdrop-blur shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-slate-300">
            Use your Google account to access the caption rating and image
            generation features.
          </p>

          {userEmail ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-slate-300">Signed in as {userEmail}</p>
              <button
                onClick={signOut}
                disabled={loading}
                className="w-full rounded-full bg-slate-800/70 px-4 py-2.5 text-sm font-medium text-slate-50 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-sky-400 via-fuchsia-300 to-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 ease-out hover:translate-y-[-1px] hover:shadow-[0_0_0_4px_rgba(56,189,248,0.10)] disabled:opacity-50"
              >
                {loading ? 'Redirecting…' : 'Continue with Google'}
              </button>
              <p className="text-xs text-slate-500">
                If you are asked for permissions, allow access so we can sign you
                in.
              </p>
            </div>
          )}

          {displayedError && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200">
              {displayedError}
            </div>
          )}

          <div className="mt-6 text-sm text-slate-400">
            <button
              className="text-slate-300 underline underline-offset-4 hover:text-slate-100"
              onClick={() => router.push('/captions')}
              disabled={loading}
            >
              Go to captions
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

