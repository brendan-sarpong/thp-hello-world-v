/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const ALMOSTCRACKD_API_BASE = 'https://api.almostcrackd.ai'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.access_token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const contentType = body?.contentType
  if (!contentType || typeof contentType !== 'string') {
    return NextResponse.json(
      { error: 'Missing contentType (expected string)' },
      { status: 400 },
    )
  }

  const res = await fetch(`${ALMOSTCRACKD_API_BASE}/pipeline/generate-presigned-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contentType }),
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    return NextResponse.json(json ?? { error: 'Upstream error' }, { status: res.status })
  }

  return NextResponse.json(json)
}

