'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function SignInPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabaseBrowser.auth.getUser()
      setUserEmail(data.user?.email ?? null)
    })()
  }, [])

  const displayedError = errorMessage || oauthError

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setOauthError(params.get('error'))
  }, [])

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
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
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
                className="w-full rounded-full bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-50 transition hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full rounded-full bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
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

