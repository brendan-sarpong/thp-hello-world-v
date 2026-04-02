/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  // Only logged-in users can mutate votes (Task 4)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const captionId = body?.captionId ?? body?.caption_id
  const voteValueRaw = body?.voteValue ?? body?.vote_value

  const voteValue = Number(voteValueRaw)
  if (!captionId || !Number.isFinite(voteValue) || ![1, -1].includes(voteValue)) {
    return NextResponse.json(
      { error: 'Invalid payload: expected captionId and voteValue (+1 or -1)' },
      { status: 400 },
    )
  }

  // `caption_votes.profile_id` is NOT NULL in your schema, so we associate the
  // vote with the currently authenticated user's profile.
  const { error } = await supabase.from('caption_votes').insert({
    caption_id: captionId,
    vote_value: voteValue,
    profile_id: user.id,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

