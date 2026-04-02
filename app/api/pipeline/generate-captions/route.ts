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

  const imageId = body?.imageId ?? body?.image_id
  const humorFlavorId = body?.humorFlavorId ?? body?.humor_flavor_id

  if (!imageId || typeof imageId !== 'string') {
    return NextResponse.json({ error: 'Missing imageId' }, { status: 400 })
  }

  const res = await fetch(`${ALMOSTCRACKD_API_BASE}/pipeline/generate-captions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      humorFlavorId ? { imageId, humorFlavorId } : { imageId },
    ),
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    return NextResponse.json(json ?? { error: 'Upstream error' }, { status: res.status })
  }

  return NextResponse.json(json)
}

