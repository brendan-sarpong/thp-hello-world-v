import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (!code) {
    // If we weren't redirected with an auth code, send the user to sign-in.
    return NextResponse.redirect(new URL('/auth/sign-in', requestUrl))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const redirectUrl = new URL('/auth/sign-in', requestUrl)
    redirectUrl.searchParams.set('error', errorDescription || error.message)
    return NextResponse.redirect(redirectUrl)
  }

  // Move the user into the first protected route.
  return NextResponse.redirect(new URL('/captions', requestUrl))
}

